from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum

class ComplaintType(str, Enum):
    DUPLICATE = "duplicate_beneficiary"
    GHOST = "ghost_beneficiary"
    FRAUD = "fraud"
    BRIBERY = "bribery"
    WRONG_AMOUNT = "wrong_amount"

class ComplaintStatus(str, Enum):
    SUBMITTED = "submitted"
    ACKNOWLEDGED = "acknowledged"
    UNDER_INVESTIGATION = "under_investigation"
    RESOLVED = "resolved"
    CLOSED = "closed"

class RiskCategory(str, Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Location(BaseModel):
    district: str
    block: Optional[str] = None
    village: Optional[str] = None
    coordinates: Optional[Dict[str, float]] = None

class ComplaintCreate(BaseModel):
    complaint_type: ComplaintType
    description: str
    subject_beneficiary_id: Optional[str] = None
    location: Location
    submitter_name: Optional[str] = None
    submitter_phone: Optional[str] = None
    is_anonymous: bool = False

class Complaint(BaseModel):
    complaint_id: str
    complaint_type: ComplaintType
    status: ComplaintStatus
    description: str
    subject_beneficiary_id: Optional[str]
    location: Location
    urgency_score: float
    sentiment_score: float
    created_at: datetime
    submitter_name: Optional[str]

class BeneficiaryCreate(BaseModel):
    name: str
    date_of_birth: str
    gender: str
    address: str
    phone: str
    bank_account: str
    district: str
    scheme: str
    amount: float

class Beneficiary(BaseModel):
    beneficiary_id: str
    name: str
    date_of_birth: str
    gender: str
    address: str
    phone: str
    bank_account_hash: str
    district: str
    scheme: str
    amount: float
    risk_score: float
    risk_category: RiskCategory
    is_duplicate: bool
    is_flagged: bool
    created_at: datetime

class RiskFactor(BaseModel):
    factor: str
    score: float
    explanation: str

class RiskAssessment(BaseModel):
    beneficiary_id: str
    risk_score: float
    risk_category: RiskCategory
    factors: List[RiskFactor]
    recommended_actions: List[str]
    last_updated: datetime

class Alert(BaseModel):
    alert_id: str
    alert_type: str
    severity: str
    beneficiary_id: str
    risk_score: float
    title: str
    description: str
    created_at: datetime
    status: str

class FraudNetwork(BaseModel):
    network_id: str
    size: int
    pattern: str
    beneficiary_ids: List[str]
    shared_resource: str
    risk_score: float
    total_amount: float

class DistrictRisk(BaseModel):
    district: str
    risk_score: float
    high_risk_count: int
    total_beneficiaries: int
    fraud_cases: int
