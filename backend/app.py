from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from mangum import Mangum

import uvicorn

from routes import complaints, beneficiaries, alerts, analytics
from services.database import init_db

app = FastAPI(title="Economic Leakage Detection API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
async def startup_event():
    init_db()
    print("✅ Database initialized")
    print("✅ AI models loaded")
    print("🚀 Server running on http://localhost:8000")

# Health check
@app.get("/")
async def root():
    return {
        "status": "running",
        "service": "Economic Leakage Detection API",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

#lambda Handler
handler = Mangum(app)

# Include routers
app.include_router(complaints.router, prefix="/api/v1", tags=["Complaints"])
app.include_router(beneficiaries.router, prefix="/api/v1", tags=["Beneficiaries"])
app.include_router(alerts.router, prefix="/api/v1", tags=["Alerts"])
app.include_router(analytics.router, prefix="/api/v1", tags=["Analytics"])

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
