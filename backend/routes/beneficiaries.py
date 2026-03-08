from fastapi import APIRouter, HTTPException
from models.schemas import BeneficiaryCreate
from services.dynamodb import BeneficiaryDB, AlertDB, RiskScoreDB
from ai_models.duplicate_detector import DuplicateDetector
from ai_models.anomaly_detector import anomaly_detector
from ai_models.risk_scorer import risk_scorer
from datetime import datetime

# Safe import for graph module
try:
    from graph.fraud_network import fraud_network_detector
except ImportError:
    fraud_network_detector = None

router = APIRouter()
duplicate_detector = DuplicateDetector()


@router.post("/beneficiaries", response_model=dict)
async def create_beneficiary(beneficiary: BeneficiaryCreate):
    """Register a new beneficiary"""
    try:
        existing = BeneficiaryDB.get_all()

        new_ben_dict = beneficiary.dict()
        new_ben_dict["bank_account_hash"] = beneficiary.bank_account[:16]

        duplicate_check = duplicate_detector.check_duplicate(new_ben_dict, existing)

        beneficiary_id = BeneficiaryDB.create(beneficiary.dict())

        signals = {
            "duplicate_score": duplicate_check["duplicate_score"],
            "anomaly_score": 0.0,
            "network_centrality": 0.0,
            "complaint_severity": 0.0,
            "duplicate_explanation": duplicate_check["explanation"],
        }

        risk_score = risk_scorer.calculate_risk_score(signals)
        risk_category = risk_scorer.categorize_risk(risk_score)

        BeneficiaryDB.update_risk(
            beneficiary_id,
            risk_score,
            risk_category,
            duplicate_check["is_duplicate"],
        )
        
        # Store risk score history
        RiskScoreDB.create(beneficiary_id, {
            'risk_score': risk_score,
            'risk_category': risk_category,
            'duplicate_score': duplicate_check["duplicate_score"],
            'anomaly_score': 0.0,
            'network_centrality': 0.0,
            'complaint_severity': 0.0,
            'explanation': duplicate_check["explanation"]
        })

        if risk_score >= 0.6:
            alert_data = {
                "alert_type": "high_risk_beneficiary",
                "severity": "critical" if risk_score >= 0.8 else "high",
                "beneficiary_id": beneficiary_id,
                "risk_score": risk_score,
                "title": "High Risk Beneficiary Detected",
                "description": f"Risk score: {risk_score:.2f}. {duplicate_check['explanation']}",
            }

            AlertDB.create(alert_data)

        return {
            "beneficiary_id": beneficiary_id,
            "risk_score": risk_score,
            "risk_category": risk_category,
            "is_duplicate": duplicate_check["is_duplicate"],
            "message": "Beneficiary registered successfully",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/beneficiaries", response_model=list)
async def get_beneficiaries():
    """Get all beneficiaries"""
    try:
        return BeneficiaryDB.get_all()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/beneficiaries/{beneficiary_id}")
async def get_beneficiary(beneficiary_id: str):
    """Get beneficiary by ID"""
    try:
        beneficiary = BeneficiaryDB.get(beneficiary_id)

        if not beneficiary:
            raise HTTPException(status_code=404, detail="Beneficiary not found")

        return beneficiary

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/beneficiaries/{beneficiary_id}/risk")
async def get_risk_assessment(beneficiary_id: str):
    """Get detailed risk assessment"""
    try:
        beneficiary = BeneficiaryDB.get(beneficiary_id)

        if not beneficiary:
            raise HTTPException(status_code=404, detail="Beneficiary not found")

        all_beneficiaries = BeneficiaryDB.get_all()
        duplicate_check = duplicate_detector.check_duplicate(beneficiary, all_beneficiaries)

        network_centrality = 0.0

        if fraud_network_detector:
            fraud_network_detector.build_graph(all_beneficiaries)
            network_centrality = fraud_network_detector.calculate_centrality(beneficiary_id)

        signals = {
            "duplicate_score": duplicate_check["duplicate_score"],
            "anomaly_score": beneficiary.get("risk_score", 0) * 0.3,
            "network_centrality": network_centrality,
            "complaint_severity": 0.0,
            "duplicate_explanation": duplicate_check["explanation"],
            "network_explanation": f"Network centrality: {network_centrality:.2f}",
        }

        assessment = risk_scorer.assess_beneficiary(beneficiary, signals)
        assessment["last_updated"] = datetime.now().isoformat()

        return assessment

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/beneficiaries/{beneficiary_id}/network")
async def get_fraud_network(beneficiary_id: str, depth: int = 2):
    """Get fraud network for beneficiary"""
    try:
        if fraud_network_detector is None:
            return {
                "beneficiary_id": beneficiary_id,
                "network": [],
                "message": "Fraud network module not available",
            }

        beneficiary = BeneficiaryDB.get(beneficiary_id)

        if not beneficiary:
            raise HTTPException(status_code=404, detail="Beneficiary not found")

        all_beneficiaries = BeneficiaryDB.get_all()
        fraud_network_detector.build_graph(all_beneficiaries)

        return fraud_network_detector.get_network_for_beneficiary(beneficiary_id, depth)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))