import boto3

# S3 client
s3 = boto3.client("s3")

# Buckets
COMPLAINT_BUCKET = "aiforbharat-complaints-audio"
RAW_BUCKET = "aiforbharat-welfare-raw-data"
PROCESSED_BUCKET = "aiforbharat-processed-data"
MODEL_BUCKET = "aiforbharat-model-artifacts"


def upload_file(file_path: str, bucket: str, key: str):

    try:

        s3.upload_file(
            Filename=file_path,
            Bucket=bucket,
            Key=key
        )

        url = f"https://{bucket}.s3.amazonaws.com/{key}"

        return url

    except Exception as e:
        raise Exception(f"S3 upload failed: {str(e)}")