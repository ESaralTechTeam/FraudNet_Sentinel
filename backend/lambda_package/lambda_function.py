import json
import boto3
import uuid
from datetime import datetime

from services.fraud_model_service import predict_fraud
from services.nlp_service import extract_features

# AWS clients
s3 = boto3.client("s3")
dynamodb = boto3.resource("dynamodb")

# DynamoDB tables
complaints_table = dynamodb.Table("complaints")
risk_table = dynamodb.Table("risk_scores")
alerts_table = dynamodb.Table("alerts")


def lambda_handler(event, context):

    try:

        # 1️⃣ Get S3 transcript event
        record = event["Records"][0]

        bucket = record["s3"]["bucket"]["name"]
        key = record["s3"]["object"]["key"]

        # Example key:
        # transcripts/CMP-123.json

        complaint_id = key.split("/")[-1].replace(".json", "")

        # 2️⃣ Read transcript file
        obj = s3.get_object(Bucket=bucket, Key=key)

        data = json.loads(obj["Body"].read())

        transcript = data["results"]["transcripts"][0]["transcript"]

        # 3️⃣ Fetch complaint info
        complaint = complaints_table.get_item(
            Key={"complaint_id": complaint_id}
        )

        beneficiary_id = complaint["Item"]["beneficiary_id"]

        # 4️⃣ Extract ML features
        features = extract_features(transcript)

        # 5️⃣ Predict fraud risk
        risk_score = predict_fraud(features)

        # 6️⃣ Store risk score
        risk_item = {
            "complaint_id": complaint_id,
            "beneficiary_id": beneficiary_id,
            "risk_score": risk_score,
            "timestamp": datetime.utcnow().isoformat()
        }

        risk_table.put_item(Item=risk_item)

        # 7️⃣ Generate alert if risk high
        if risk_score >= 70:

            alert = {
                "alert_id": f"ALT-{uuid.uuid4().hex[:8]}",
                "complaint_id": complaint_id,
                "beneficiary_id": beneficiary_id,
                "severity": "HIGH",
                "created_at": datetime.utcnow().isoformat()
            }

            alerts_table.put_item(Item=alert)

        return {
            "status": "processed",
            "complaint_id": complaint_id,
            "risk_score": risk_score
        }

    except Exception as e:

        print("Error:", str(e))

        return {
            "status": "error",
            "message": str(e)
        }