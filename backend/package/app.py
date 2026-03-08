from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from mangum import Mangum

import shutil
import uuid

# Routers
from routes import complaints, beneficiaries, alerts, analytics, auth

# Services
from services.s3_service import upload_file, COMPLAINT_BUCKET
from services.dynamodb_service import insert_complaint
from services.transcribe_service import start_transcription_job
from services.jwt_validator import verify_token


app = FastAPI(
    title="FraudNet Sentinel API",
    version="1.0.0",
    description="AI-powered system for detecting welfare scheme fraud and economic leakage",
    root_path="/prod"
)

# -----------------------------
# CORS
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Root endpoint
# -----------------------------
@app.get("/")
async def root():
    return {
        "status": "running",
        "service": "FraudNet Sentinel API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

# -----------------------------
# Health check
# -----------------------------
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# -----------------------------
# Upload complaint audio
# -----------------------------
@app.post("/upload-complaint-audio")
async def upload_audio(file: UploadFile = File(...)):

    try:
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        temp_file = f"/tmp/{unique_name}"

        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        key = f"complaints/{unique_name}"

        url = upload_file(temp_file, COMPLAINT_BUCKET, key)

        return {"audio_url": url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio upload failed: {str(e)}")

# -----------------------------
# Upload complaint report
# -----------------------------
@app.post("/upload-complaint-report")
async def upload_report(file: UploadFile = File(...)):

    try:
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        temp_file = f"/tmp/{unique_name}"

        with open(temp_file, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        key = f"reports/{unique_name}"

        url = upload_file(temp_file, COMPLAINT_BUCKET, key)

        return {"report_url": url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report upload failed: {str(e)}")

# -----------------------------
# Create complaint
# -----------------------------
@app.post("/create-complaint")
async def create_complaint_record(
    beneficiary_id: str,
    description: str,
    audio_url: str = None,
    report_url: str = None,
    token=Depends(verify_token)
):

    try:

        complaint_id = f"CMP-{uuid.uuid4().hex[:8]}"
        transcription_job = None

        if audio_url:
            try:
                transcription_job = start_transcription_job(audio_url , complaint_id)
            except Exception as e:
                print("Transcription error:", str(e))

        complaint_item = {
            "complaint_id": complaint_id,
            "beneficiary_id": beneficiary_id,
            "description": description,
            "audio_url": audio_url,
            "report_url": report_url,
            "transcription_job": transcription_job,
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }

        insert_complaint(complaint_item)

        return {
            "message": "Complaint created successfully",
            "complaint_id": complaint_id,
            "transcription_job": transcription_job
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Complaint creation failed: {str(e)}")

# -----------------------------
# NLP Fraud Detection
# -----------------------------


# -----------------------------
# Routers
# -----------------------------
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

app.include_router(
    complaints.router,
    prefix="/api/v1",
    tags=["Complaints"]
)

app.include_router(
    beneficiaries.router,
    prefix="/api/v1",
    tags=["Beneficiaries"]
)

app.include_router(
    alerts.router,
    prefix="/api/v1",
    tags=["Alerts"]
)

app.include_router(
    analytics.router,
    prefix="/api/v1",
    tags=["Analytics"]
)

# -----------------------------
# Lambda handler
# -----------------------------
handler = Mangum(app)