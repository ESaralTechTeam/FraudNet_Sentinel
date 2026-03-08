import boto3
from datetime import datetime

# Initialize DynamoDB resource
dynamodb = boto3.resource("dynamodb")

# Table name
TABLE_NAME = "complaints"

table = dynamodb.Table(TABLE_NAME)



def insert_complaint(item: dict):

    try:

        db_item = {
            "complaint_id": item["complaint_id"],
            "beneficiary_id": item["beneficiary_id"],
            "description": item.get("description"),
            "audio_url": item.get("audio_url"),
            "report_url": item.get("report_url"),
            "status": item.get("status", "pending"),
            "created_at": item.get("created_at", datetime.utcnow().isoformat())
        }

        table.put_item(Item=db_item)

        return db_item

    except Exception as e:
        raise Exception(f"DynamoDB insert failed: {str(e)}")

        