import json
import boto3

s3 = boto3.client("s3")


def get_transcript(bucket, key):

    obj = s3.get_object(
        Bucket=bucket,
        Key=key
    )

    data = json.loads(obj["Body"].read())

    transcript = data["results"]["transcripts"][0]["transcript"]

    return transcript