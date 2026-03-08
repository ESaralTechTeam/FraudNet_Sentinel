def extract_features(transcript):

    keywords = [
        "bribe",
        "corruption",
        "money",
        "fake beneficiary",
        "officer demanded"
    ]

    keyword_count = 0

    for word in keywords:
        if word in transcript.lower():
            keyword_count += 1

    complaint_count = 1
    payment_amount = 10000
    duplicate_flag = 0

    return [
        complaint_count,
        keyword_count,
        payment_amount,
        duplicate_flag
    ]