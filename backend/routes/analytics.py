from fastapi import APIRouter, HTTPException
from services.dynamodb import BeneficiaryDB, AlertDB
from collections import defaultdict

try:
    from graph.fraud_network import fraud_network_detector
except ImportError:
    fraud_network_detector = None

router = APIRouter()


@router.get("/analytics/district-risk")
async def get_district_risk():
    """Get risk metrics by district"""
    try:
        beneficiaries = BeneficiaryDB.get_all()

        districts = defaultdict(lambda: {
            "total": 0,
            "high_risk": 0,
            "critical_risk": 0,
            "total_amount": 0,
            "risk_scores": []
        })

        for ben in beneficiaries:
            district = ben["district"]

            districts[district]["total"] += 1
            districts[district]["total_amount"] += ben.get("amount", 0)
            districts[district]["risk_scores"].append(ben.get("risk_score", 0))

            if ben.get("risk_category") == "high":
                districts[district]["high_risk"] += 1
            elif ben.get("risk_category") == "critical":
                districts[district]["critical_risk"] += 1

        result = []

        for district, data in districts.items():
            avg_risk = (
                sum(data["risk_scores"]) / len(data["risk_scores"])
                if data["risk_scores"] else 0
            )

            result.append({
                "district": district,
                "risk_score": round(avg_risk, 3),
                "risk_category": (
                    "high" if avg_risk >= 0.6
                    else "medium" if avg_risk >= 0.4
                    else "low"
                ),
                "total_beneficiaries": data["total"],
                "high_risk_count": data["high_risk"] + data["critical_risk"],
                "total_amount": data["total_amount"]
            })

        return sorted(result, key=lambda x: x["risk_score"], reverse=True)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/fraud-networks")
async def get_fraud_networks():
    """Get detected fraud networks"""

    try:
        if fraud_network_detector is None:
            return {
                "networks": [],
                "total_networks": 0,
                "message": "Fraud network detector module not available"
            }

        beneficiaries = BeneficiaryDB.get_all()

        fraud_network_detector.build_graph(beneficiaries)

        patterns = fraud_network_detector.detect_all_fraud_patterns()

        networks = patterns.get("shared_resources", [])

        return {
            "networks": networks,
            "total_networks": len(networks),
            "total_beneficiaries_involved": sum(n["size"] for n in networks),
            "patterns": {
                "shared_resources": len(networks),
                "connected_clusters": len(patterns.get("connected_clusters", [])),
                "high_centrality": len(patterns.get("high_centrality_nodes", [])),
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/summary")
async def get_summary():
    """Get overall system summary"""

    try:
        beneficiaries = BeneficiaryDB.get_all()
        alerts = AlertDB.get_all()

        total_beneficiaries = len(beneficiaries)

        high_risk = sum(
            1 for b in beneficiaries
            if b.get("risk_category") in ["high", "critical"]
        )

        duplicates = sum(
            1 for b in beneficiaries
            if b.get("is_duplicate")
        )

        flagged = sum(
            1 for b in beneficiaries
            if b.get("is_flagged")
        )

        total_amount = sum(b.get("amount", 0) for b in beneficiaries)

        high_risk_amount = sum(
            b.get("amount", 0)
            for b in beneficiaries
            if b.get("risk_category") in ["high", "critical"]
        )

        return {
            "total_beneficiaries": total_beneficiaries,
            "high_risk_count": high_risk,
            "duplicate_count": duplicates,
            "flagged_count": flagged,
            "total_amount": total_amount,
            "high_risk_amount": high_risk_amount,
            "potential_leakage": high_risk_amount,
            "active_alerts": len(alerts),
            "alert_breakdown": {
                "critical": sum(1 for a in alerts if a["severity"] == "critical"),
                "high": sum(1 for a in alerts if a["severity"] == "high"),
                "medium": sum(1 for a in alerts if a["severity"] == "medium"),
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/analytics/trends")
async def get_trends():
    """Get trend data"""

    try:
        return {
            "leakage_trend": [
                {"date": "2026-01-25", "amount": 2500000},
                {"date": "2026-02-01", "amount": 2300000},
                {"date": "2026-02-08", "amount": 2200000},
                {"date": "2026-02-15", "amount": 2000000},
                {"date": "2026-02-22", "amount": 1800000},
                {"date": "2026-02-25", "amount": 1700000},
            ],
            "detection_trend": [
                {"date": "2026-01-25", "count": 45},
                {"date": "2026-02-01", "count": 52},
                {"date": "2026-02-08", "count": 48},
                {"date": "2026-02-15", "count": 55},
                {"date": "2026-02-22", "count": 60},
                {"date": "2026-02-25", "count": 58},
            ],
            "trend_direction": "improving",
            "percentage_change": -32.0,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))