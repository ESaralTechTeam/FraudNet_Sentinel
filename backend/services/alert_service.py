import boto3
import uuid
from datetime import datetime

dynamodb = boto3.resource("dynamodb")

table = dynamodb.Table("alerts")


def create_alert(complaint_id, beneficiary_id, severity):

    alert_id = f"ALT-{uuid.uuid4().hex[:6]}"

    item = {
        "alert_id": alert_id,
        "complaint_id": complaint_id,
        "beneficiary_id": beneficiary_id,
        "alert_type": "FRAUD_RISK",
        "severity": severity,
        "created_at": datetime.utcnow().isoformat()
    }

    table.put_item(Item=item)

    return item