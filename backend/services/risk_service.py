import boto3
from datetime import datetime

dynamodb = boto3.resource("dynamodb")

table = dynamodb.Table("risk_scores")


def store_risk_score(item):

    table.put_item(
        Item=item
    )

    return item