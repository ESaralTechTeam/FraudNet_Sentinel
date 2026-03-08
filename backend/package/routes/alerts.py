from fastapi import APIRouter, HTTPException
from services.dynamodb import AlertDB, BeneficiaryDB

router = APIRouter()


@router.get("/alerts")
async def get_alerts(severity: str = None):
    """Get all alerts"""
    try:
        alerts = AlertDB.get_all()

        if severity:
            alerts = [a for a in alerts if a['severity'] == severity]

        return {
            "alerts": alerts,
            "total": len(alerts),
            "summary": {
                "critical": sum(1 for a in alerts if a["severity"] == "critical"),
                "high": sum(1 for a in alerts if a["severity"] == "high"),
                "medium": sum(1 for a in alerts if a["severity"] == "medium"),
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/alerts/{alert_id}")
async def get_alert(alert_id: str):
    """Get alert by ID"""
    try:
        alerts = AlertDB.get_all()
        alert = next((a for a in alerts if a["alert_id"] == alert_id), None)

        if not alert:
            raise HTTPException(status_code=404, detail="Alert not found")

        # Get beneficiary details
        beneficiary = BeneficiaryDB.get(alert["beneficiary_id"])
        alert["beneficiary"] = beneficiary

        return alert

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """Acknowledge an alert"""
    try:
        return {
            "alert_id": alert_id,
            "status": "acknowledged",
            "message": "Alert acknowledged successfully",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))