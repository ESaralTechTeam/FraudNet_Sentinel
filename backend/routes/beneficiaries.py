from fastapi import APIRouter, HTTPException
from models.schemas import BeneficiaryCreate, Beneficiary, RiskAssessment
from services.database import BeneficiaryDB, AlertDB
from ai_models.duplicate_detector import DuplicateDetector
from ai_models.anomaly_detector import anomaly_detector
from ai_models.risk_scorer import risk_scorer
from graph.fraud_network import fraud_network_detector
from datetime import datetime

router = APIRouter()
duplicate_detector = DuplicateDetector()

@router.post("/beneficiaries", response_model=dict)
async def create_beneficiary(beneficiary: BeneficiaryCreate):
    """Register a new beneficiary"""
    try:
        # Get existing beneficiaries
        existing = BeneficiaryDB.get_all()
        
        # Check for duplicates
        new_ben_dict = beneficiary.dict()
        new_ben_dict['bank_account_hash'] = beneficiary.bank_account[:16]  # Simulate hash
        
        duplicate_check = duplicate_detector.check_duplicate(new_ben_dict, existing)
        
        # Create beneficiary
        beneficiary_id = BeneficiaryDB.create(beneficiary.dict())
        
        # Calculate initial risk
        signals = {
            'duplicate_score': duplicate_check['duplicate_score'],
            'anomaly_score': 0.0,
            'network_centrality': 0.0,
            'complaint_severity': 0.0,
            'duplicate_explanation': duplicate_check['explanation']
        }
        
        risk_score = risk_scorer.calculate_risk_score(signals)
        risk_category = risk_scorer.categorize_risk(risk_score)
        
        # Update risk in database
        BeneficiaryDB.update_risk(
            beneficiary_id, 
            risk_score, 
            risk_category, 
            duplicate_check['is_duplicate']
        )
        
        # Generate alert if high risk
        if risk_score >= 0.6:
            alert_data = {
                'alert_type': 'high_risk_beneficiary',
                'severity': 'critical' if risk_score >= 0.8 else 'high',
                'beneficiary_id': beneficiary_id,
                'risk_score': risk_score,
                'title': 'High Risk Beneficiary Detected',
                'description': f"Risk score: {risk_score:.2f}. {duplicate_check['explanation']}"
            }
            AlertDB.create(alert_data)
        
        return {
            'beneficiary_id': beneficiary_id,
            'risk_score': risk_score,
            'risk_category': risk_category,
            'is_duplicate': duplicate_check['is_duplicate'],
            'message': 'Beneficiary registered successfully'
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/beneficiaries", response_model=list)
async def get_beneficiaries():
    """Get all beneficiaries"""
    try:
        beneficiaries = BeneficiaryDB.get_all()
        return beneficiaries
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
    """Get detailed risk assessment for beneficiary"""
    try:
        beneficiary = BeneficiaryDB.get(beneficiary_id)
        
        if not beneficiary:
            raise HTTPException(status_code=404, detail="Beneficiary not found")
        
        # Get all beneficiaries for duplicate check
        all_beneficiaries = BeneficiaryDB.get_all()
        duplicate_check = duplicate_detector.check_duplicate(beneficiary, all_beneficiaries)
        
        # Calculate network centrality
        fraud_network_detector.build_graph(all_beneficiaries)
        network_centrality = fraud_network_detector.calculate_centrality(beneficiary_id)
        
        # Prepare signals
        signals = {
            'duplicate_score': duplicate_check['duplicate_score'],
            'anomaly_score': beneficiary.get('risk_score', 0) * 0.3,  # Simulated
            'network_centrality': network_centrality,
            'complaint_severity': 0.0,  # Would check complaints
            'duplicate_explanation': duplicate_check['explanation'],
            'network_explanation': f"Network centrality: {network_centrality:.2f}"
        }
        
        # Get risk assessment
        assessment = risk_scorer.assess_beneficiary(beneficiary, signals)
        assessment['last_updated'] = datetime.now().isoformat()
        
        return assessment
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/beneficiaries/{beneficiary_id}/network")
async def get_fraud_network(beneficiary_id: str, depth: int = 2):
    """Get fraud network for beneficiary"""
    try:
        beneficiary = BeneficiaryDB.get(beneficiary_id)
        
        if not beneficiary:
            raise HTTPException(status_code=404, detail="Beneficiary not found")
        
        # Build graph
        all_beneficiaries = BeneficiaryDB.get_all()
        fraud_network_detector.build_graph(all_beneficiaries)
        
        # Get network
        network = fraud_network_detector.get_network_for_beneficiary(beneficiary_id, depth)
        
        return network
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
