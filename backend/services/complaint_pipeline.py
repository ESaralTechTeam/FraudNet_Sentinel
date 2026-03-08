from services.transcript_parser import get_transcript
from services.nlp_service import analyze_complaint
from services.risk_service import store_risk_score
from services.alert_service import create_alert


def process_complaint(bucket, transcript_key, complaint_id, beneficiary_id):

    text = get_transcript(bucket, transcript_key)

    result = analyze_complaint(text)

    risk_item = {
        "complaint_id": complaint_id,
        "beneficiary_id": beneficiary_id,
        "fraud_score": result["fraud_score"],
        "urgency": result["urgency"]
    }

    store_risk_score(risk_item)

    if result["fraud_score"] >= 60:

        create_alert(
            complaint_id,
            beneficiary_id,
            "HIGH"
        )