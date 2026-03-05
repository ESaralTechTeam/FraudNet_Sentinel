from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from mangum import Mangum

from routes import complaints, beneficiaries, alerts, analytics

app = FastAPI(
    title="Economic Leakage Detection API",
    version="1.0.0",
    description="AI-powered system for detecting welfare scheme fraud and economic leakage",
    root_path="/prod"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {
        "status": "running",
        "service": "Economic Leakage Detection API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Routers
app.include_router(complaints.router, prefix="/api/v1", tags=["Complaints"])
app.include_router(beneficiaries.router, prefix="/api/v1", tags=["Beneficiaries"])
app.include_router(alerts.router, prefix="/api/v1", tags=["Alerts"])
app.include_router(analytics.router, prefix="/api/v1", tags=["Analytics"])

# Lambda handler
handler = Mangum(app)