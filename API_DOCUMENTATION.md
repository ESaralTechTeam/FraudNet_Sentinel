# API Documentation - AI Economic Leakage Detection

## Base URL
```
Production: https://api.leakage-detection.gov.in/v1
Staging: https://api-staging.leakage-detection.gov.in/v1
```

## Authentication

All API requests require authentication using JWT tokens obtained from AWS Cognito.

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### Using Token
```http
GET /api/v1/beneficiaries/BEN123456
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

---

## Complaints API

### Submit Text Complaint
```http
POST /api/v1/complaints/submit
Authorization: Bearer {token}
Content-Type: application/json

{
  "complaint_type": "duplicate_beneficiary",
  "description": "I believe this person is receiving benefits fraudulently",
  "subject_beneficiary_id": "BEN123456",
  "location": {
    "district": "District Name",
    "block": "Block Name",
    "coordinates": {
      "lat": 28.7041,
      "lon": 77.1025
    }
  },
  "submitter": {
    "name": "Jane Smith",
    "phone": "+91XXXXXXXXXX",
    "is_anonymous": false
  }
}

Response: 201 Created
{
  "complaint_id": "CMP987654321",
  "status": "submitted",
  "created_at": "2026-02-25T10:00:00Z",
  "tracking_url": "/api/v1/complaints/CMP987654321/status"
}
```

### Submit Voice Complaint
```http
POST /api/v1/complaints/voice
Authorization: Bearer {token}
Content-Type: multipart/form-data

audio: (binary)
language: hi
complaint_type: fraud
location: {"district": "District Name"}

Response: 201 Created
{
  "complaint_id": "CMP987654322",
  "status": "processing",
  "transcription_job_id": "transcribe-CMP987654322",
  "estimated_completion": "2026-02-25T10:05:00Z"
}
```

### Track Complaint Status
```http
GET /api/v1/complaints/{complaint_id}/status
Authorization: Bearer {token}

Response: 200 OK
{
  "complaint_id": "CMP987654321",
  "status": "under_investigation",
  "timeline": [
    {
      "status": "submitted",
      "timestamp": "2026-02-20T10:00:00Z",
      "notes": "Complaint received"
    },
    {
      "status": "acknowledged",
      "timestamp": "2026-02-20T10:05:00Z",
      "notes": "Auto-acknowledged"
    },
    {
      "status": "under_investigation",
      "timestamp": "2026-02-21T09:00:00Z",
      "notes": "Investigation started"
    }
  ],
  "assigned_officer": {
    "name": "Officer Name",
    "department": "Welfare Department"
  },
  "expected_resolution": "2026-03-07T23:59:59Z"
}
```

### List Complaints
```http
GET /api/v1/complaints/list?status=open&district=District1&limit=20&offset=0
Authorization: Bearer {token}

Response: 200 OK
{
  "complaints": [
    {
      "complaint_id": "CMP987654321",
      "complaint_type": "duplicate_beneficiary",
      "status": "under_investigation",
      "priority": "high",
      "created_at": "2026-02-20T10:00:00Z",
      "district": "District Name"
    }
  ],
  "total": 156,
  "limit": 20,
  "offset": 0
}
```

---

## Beneficiaries API

### Search Beneficiaries
```http
GET /api/v1/beneficiaries/search?name=John&district=District1&scheme=PMAY
Authorization: Bearer {token}

Response: 200 OK
{
  "beneficiaries": [
    {
      "beneficiary_id": "BEN123456",
      "name": "John Doe",
      "district": "District Name",
      "scheme": "PMAY",
      "risk_score": 0.85,
      "risk_category": "high",
      "status": "active"
    }
  ],
  "total": 5
}
```

### Get Beneficiary Details
```http
GET /api/v1/beneficiaries/{beneficiary_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "beneficiary_id": "BEN123456",
  "name": "John Doe",
  "date_of_birth": "1985-06-15",
  "gender": "M",
  "address": {
    "village": "Village Name",
    "block": "Block Name",
    "district": "District Name",
    "state": "State Name",
    "pincode": "123456"
  },
  "contact": {
    "phone": "+91XXXXXXXXXX",
    "phone_verified": true
  },
  "schemes": [
    {
      "scheme_id": "PMAY",
      "enrollment_date": "2024-01-15",
      "status": "active",
      "amount_sanctioned": 50000,
      "amount_disbursed": 50000
    }
  ],
  "risk_assessment": {
    "risk_score": 0.85,
    "risk_category": "high",
    "last_updated": "2026-02-25T10:30:00Z"
  },
  "flags": {
    "is_duplicate": true,
    "under_investigation": true
  }
}
```

### Get Risk Assessment
```http
GET /api/v1/beneficiaries/{beneficiary_id}/risk
Authorization: Bearer {token}

Response: 200 OK
{
  "beneficiary_id": "BEN123456",
  "risk_score": 0.85,
  "risk_category": "high",
  "explanation": {
    "top_factors": [
      {
        "factor": "duplicate_probability",
        "contribution": 0.35,
        "percentage": 41.2,
        "description": "High similarity to BEN456789 (0.95)"
      },
      {
        "factor": "shared_bank_account",
        "contribution": 0.25,
        "percentage": 29.4,
        "description": "Shares account with 3 other beneficiaries"
      },
      {
        "factor": "anomaly_score",
        "contribution": 0.15,
        "percentage": 17.6,
        "description": "Unusual approval speed (2 hours vs avg 5 days)"
      }
    ]
  },
  "recommended_actions": [
    "manual_verification",
    "field_investigation"
  ],
  "last_updated": "2026-02-25T10:30:00Z"
}
```

### Get Fraud Network
```http
GET /api/v1/beneficiaries/{beneficiary_id}/network?depth=2
Authorization: Bearer {token}

Response: 200 OK
{
  "beneficiary_id": "BEN123456",
  "network": {
    "nodes": [
      {
        "id": "BEN123456",
        "type": "beneficiary",
        "risk_score": 0.85,
        "label": "John Doe"
      },
      {
        "id": "BEN456789",
        "type": "beneficiary",
        "risk_score": 0.78,
        "label": "Jane Smith"
      },
      {
        "id": "ACC123",
        "type": "bank_account",
        "label": "SBIN0001234"
      }
    ],
    "edges": [
      {
        "source": "BEN123456",
        "target": "ACC123",
        "type": "SHARES_ACCOUNT",
        "since": "2024-01-15"
      },
      {
        "source": "BEN456789",
        "target": "ACC123",
        "type": "SHARES_ACCOUNT",
        "since": "2024-02-20"
      }
    ]
  },
  "statistics": {
    "total_nodes": 15,
    "total_edges": 23,
    "clusters": 2,
    "fraud_patterns": ["hub_pattern"]
  }
}
```

---

## Alerts API

### List Alerts
```http
GET /api/v1/alerts/list?severity=critical&status=open&district=District1
Authorization: Bearer {token}

Response: 200 OK
{
  "alerts": [
    {
      "alert_id": "ALT456789123",
      "alert_type": "high_risk_beneficiary",
      "severity": "critical",
      "status": "open",
      "beneficiary_id": "BEN123456",
      "risk_score": 0.92,
      "title": "High Risk Beneficiary Detected",
      "created_at": "2026-02-25T10:30:00Z",
      "assigned_to": "OFF123"
    }
  ],
  "total": 12,
  "summary": {
    "critical": 5,
    "high": 7
  }
}
```

### Get Alert Details
```http
GET /api/v1/alerts/{alert_id}
Authorization: Bearer {token}

Response: 200 OK
{
  "alert_id": "ALT456789123",
  "alert_type": "high_risk_beneficiary",
  "severity": "critical",
  "status": "open",
  "beneficiary_id": "BEN123456",
  "risk_score": 0.92,
  "title": "High Risk Beneficiary Detected",
  "description": "Beneficiary shows multiple fraud indicators",
  "risk_factors": [
    {
      "factor": "duplicate_identity",
      "score": 0.95,
      "explanation": "High similarity to BEN456789"
    }
  ],
  "recommended_actions": [
    "manual_verification",
    "field_investigation",
    "freeze_payments"
  ],
  "location": {
    "district": "District Name",
    "block": "Block Name"
  },
  "created_at": "2026-02-25T10:30:00Z"
}
```

### Acknowledge Alert
```http
POST /api/v1/alerts/{alert_id}/acknowledge
Authorization: Bearer {token}
Content-Type: application/json

{
  "notes": "Reviewing the case"
}

Response: 200 OK
{
  "alert_id": "ALT456789123",
  "status": "acknowledged",
  "acknowledged_by": "OFF123",
  "acknowledged_at": "2026-02-25T10:40:00Z"
}
```

---

## Cases API

### Create Case
```http
POST /api/v1/cases/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "case_type": "fraud_investigation",
  "priority": "high",
  "beneficiary_ids": ["BEN123456", "BEN456789"],
  "alert_ids": ["ALT456789123"],
  "title": "Duplicate Beneficiary Investigation",
  "description": "Investigation of suspected duplicate beneficiaries"
}

Response: 201 Created
{
  "case_id": "CASE789456123",
  "status": "created",
  "created_at": "2026-02-25T11:00:00Z",
  "lead_investigator": "OFF123"
}
```

### Update Case
```http
PUT /api/v1/cases/{case_id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in_progress",
  "notes": "Field verification scheduled"
}

Response: 200 OK
{
  "case_id": "CASE789456123",
  "status": "in_progress",
  "updated_at": "2026-02-25T14:00:00Z"
}
```

### Assign Case
```http
POST /api/v1/cases/{case_id}/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "officer_id": "OFF456",
  "role": "investigator"
}

Response: 200 OK
{
  "case_id": "CASE789456123",
  "assigned_to": "OFF456",
  "assigned_at": "2026-02-25T11:30:00Z"
}
```

### Add Evidence
```http
POST /api/v1/cases/{case_id}/evidence
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: (binary)
description: Identity verification report
evidence_type: document

Response: 201 Created
{
  "evidence_id": "EVD123",
  "case_id": "CASE789456123",
  "s3_url": "s3://cases/evidence/EVD123.pdf",
  "uploaded_at": "2026-02-26T14:00:00Z"
}
```

### Close Case
```http
POST /api/v1/cases/{case_id}/close
Authorization: Bearer {token}
Content-Type: application/json

{
  "resolution": "confirmed_fraud",
  "notes": "Duplicate identity confirmed. Payments stopped.",
  "actions_taken": [
    "payment_frozen",
    "beneficiary_blacklisted"
  ]
}

Response: 200 OK
{
  "case_id": "CASE789456123",
  "status": "closed",
  "resolution": "confirmed_fraud",
  "closed_at": "2026-03-05T16:00:00Z"
}
```

---

## Analytics API

### District Risk Heatmap
```http
GET /api/v1/analytics/district-risk?state=State1&date=2026-02-25
Authorization: Bearer {token}

Response: 200 OK
{
  "state": "State1",
  "date": "2026-02-25",
  "districts": [
    {
      "district": "District1",
      "risk_score": 0.75,
      "risk_category": "high",
      "high_risk_beneficiaries": 145,
      "active_cases": 23,
      "coordinates": {
        "lat": 28.7041,
        "lon": 77.1025
      }
    }
  ]
}
```

### Leakage Trends
```http
GET /api/v1/analytics/trends?period=30days&metric=leakage_amount
Authorization: Bearer {token}

Response: 200 OK
{
  "period": "30days",
  "metric": "leakage_amount",
  "data": [
    {
      "date": "2026-01-26",
      "value": 2500000,
      "unit": "INR"
    },
    {
      "date": "2026-02-25",
      "value": 2100000,
      "unit": "INR"
    }
  ],
  "trend": "decreasing",
  "percentage_change": -16.0
}
```

### Scheme Performance
```http
GET /api/v1/analytics/scheme-performance?scheme=PMAY&period=monthly
Authorization: Bearer {token}

Response: 200 OK
{
  "scheme": "PMAY",
  "period": "monthly",
  "metrics": {
    "total_beneficiaries": 125000,
    "active_beneficiaries": 118000,
    "duplicate_detected": 3500,
    "fraud_cases": 450,
    "efficiency_score": 0.92,
    "leakage_prevented": 45000000
  }
}
```

### Fraud Network Statistics
```http
GET /api/v1/analytics/fraud-networks?district=District1&min_size=5
Authorization: Bearer {token}

Response: 200 OK
{
  "district": "District1",
  "networks": [
    {
      "network_id": "NET123",
      "size": 15,
      "pattern": "hub",
      "risk_score": 0.88,
      "total_amount": 750000,
      "status": "under_investigation"
    }
  ],
  "total_networks": 8,
  "total_beneficiaries_involved": 87
}
```

---

## Admin API

### User Management
```http
GET /api/v1/admin/users?role=officer&district=District1
Authorization: Bearer {token}

Response: 200 OK
{
  "users": [
    {
      "user_id": "OFF123",
      "name": "Officer Name",
      "email": "officer@example.gov.in",
      "role": "district_officer",
      "district": "District1",
      "status": "active",
      "created_at": "2024-01-15T08:00:00Z"
    }
  ],
  "total": 25
}
```

### Audit Logs
```http
GET /api/v1/admin/audit-logs?user_id=OFF123&action=view_beneficiary&start_date=2026-02-20
Authorization: Bearer {token}

Response: 200 OK
{
  "logs": [
    {
      "log_id": "LOG123456789",
      "timestamp": "2026-02-25T10:30:00Z",
      "user_id": "OFF123",
      "action": "view_beneficiary_details",
      "resource_id": "BEN123456",
      "ip_address": "192.168.1.100"
    }
  ],
  "total": 156
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "bad_request",
  "message": "Invalid request parameters",
  "details": {
    "field": "complaint_type",
    "issue": "Must be one of: duplicate_beneficiary, ghost_beneficiary, fraud"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "forbidden",
  "message": "Insufficient permissions to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "not_found",
  "message": "Beneficiary not found",
  "resource_id": "BEN999999"
}
```

### 429 Too Many Requests
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please try again later.",
  "retry_after": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "internal_server_error",
  "message": "An unexpected error occurred",
  "request_id": "req_123456789"
}
```

---

## Rate Limits

- **Citizen users:** 100 requests/hour
- **Officer users:** 1000 requests/hour
- **Admin users:** 5000 requests/hour
- **System integrations:** 10000 requests/hour

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1709035200
```

---

## Webhooks

Subscribe to real-time events:

### Available Events
- `alert.created`
- `alert.acknowledged`
- `case.created`
- `case.updated`
- `case.closed`
- `complaint.submitted`
- `complaint.resolved`

### Webhook Payload
```json
{
  "event": "alert.created",
  "timestamp": "2026-02-25T10:30:00Z",
  "data": {
    "alert_id": "ALT456789123",
    "severity": "critical",
    "beneficiary_id": "BEN123456"
  }
}
```

---

## SDK Examples

### Python
```python
from leakage_detection import Client

client = Client(
    api_key='your_api_key',
    region='ap-south-1'
)

# Submit complaint
complaint = client.complaints.submit(
    complaint_type='duplicate_beneficiary',
    description='Suspected fraud',
    subject_beneficiary_id='BEN123456'
)

# Get risk assessment
risk = client.beneficiaries.get_risk('BEN123456')
print(f"Risk Score: {risk.risk_score}")
```

### JavaScript
```javascript
import { LeakageDetectionClient } from '@gov/leakage-detection';

const client = new LeakageDetectionClient({
  apiKey: 'your_api_key',
  region: 'ap-south-1'
});

// List alerts
const alerts = await client.alerts.list({
  severity: 'critical',
  status: 'open'
});

console.log(`Found ${alerts.total} critical alerts`);
```

---

*This API provides comprehensive access to all platform capabilities with security, performance, and ease of use in mind.*
