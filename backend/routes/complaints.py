from fastapi import APIRouter, HTTPException
from models.schemas import ComplaintCreate, Complaint
from services.database import ComplaintDB
from ai_models.complaint_analyzer import complaint_analyzer
from datetime import datetime

router = APIRouter()

@router.post("/complaints", response_model=dict)
async def submit_complaint(complaint: ComplaintCreate):
    """Submit a new complaint"""
    try:
        # Analyze complaint text
        analysis = complaint_analyzer.analyze(complaint.description)
        
        # Create complaint data
        complaint_data = {
            'complaint_type': complaint.complaint_type,
            'description': complaint.description,
            'subject_beneficiary_id': complaint.subject_beneficiary_id or analysis.get('extracted_beneficiary_id'),
            'location': complaint.location.dict(),
            'urgency_score': analysis['urgency_score'],
            'sentiment_score': analysis['sentiment_score'],
            'submitter_name': complaint.submitter_name,
            'submitter_phone': complaint.submitter_phone,
            'is_anonymous': complaint.is_anonymous
        }
        
        # Save to database
        complaint_id = ComplaintDB.create(complaint_data)
        
        return {
            'complaint_id': complaint_id,
            'status': 'submitted',
            'urgency_score': analysis['urgency_score'],
            'predicted_type': analysis['predicted_type'],
            'message': 'Complaint submitted successfully'
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/complaints", response_model=list)
async def get_complaints():
    """Get all complaints"""
    try:
        complaints = ComplaintDB.get_all()
        return complaints
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/complaints/{complaint_id}")
async def get_complaint(complaint_id: str):
    """Get complaint by ID"""
    try:
        complaints = ComplaintDB.get_all()
        complaint = next((c for c in complaints if c['complaint_id'] == complaint_id), None)
        
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")
        
        return complaint
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
