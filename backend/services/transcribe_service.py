import boto3
import uuid

transcribe = boto3.client("transcribe")

BUCKET = "aiforbharat-complaints-audio"


def start_transcription_job(audio_url, complaint_id):

    job_name = f"complaint-{uuid.uuid4()}"

    transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={"MediaFileUri": audio_url},
        MediaFormat="wav",
        LanguageCode="en-IN",
        OutputBucketName=BUCKET,
        OutputKey=f"transcripts/{complaint_id}.json"
    )

    return job_name