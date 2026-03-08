def analyze_complaint(text):

    corruption_keywords = [
        "bribe",
        "money",
        "corruption",
        "officer demanded",
        "fake beneficiary",
        "fraud",
        "scam"
    ]

    score = 0

    for word in corruption_keywords:
        if word in text.lower():
            score += 20

    urgency = "LOW"

    if score >= 40:
        urgency = "MEDIUM"

    if score >= 60:
        urgency = "HIGH"

    return {
        "fraud_score": score,
        "urgency": urgency
    }

