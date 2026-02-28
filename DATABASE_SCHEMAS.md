# Database Schemas - AI Economic Leakage Detection

## Overview

Multi-database architecture using DynamoDB for real-time operations, Neptune for graph analytics, and S3 for data lake storage.

---

## DynamoDB Tables

### 1. Beneficiaries Table

**Table Name:** `Beneficiaries`
**Partition Key:** `beneficiary_id` (String)
**Sort Key:** None
**GSI:** `district-index`, `scheme-index`, `risk-score-index`

```json
{
  "beneficiary_id": "BEN123456",
  "name": "John Doe",
  "name_phonetic": "JN D",
  "date_of_birth": "1985-06-15",
  "gender": "M",
  "identity_hash": "sha256_hash",
  "address": {
    "line1": "123 Main St",
    "village": "Village Name",
    "block": "Block Name",
    "district": "District Name",
    "state": "State Name",
    "pincode": "123456",
    "coordinates": {
      "lat": 28.7041,
      "lon": 77.1025
    }
  },
  "contact": {
    "phone": "+91XXXXXXXXXX",
    "phone_verified": true,
    "email": "john@example.com"
  },
  "bank_details": {
    "account_number_hash": "sha256_hash",
    "ifsc": "SBIN0001234",
    "bank_name": "State Bank of India",
    "branch": "Main Branch"
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
    "last_updated": "2026-02-25T10:30:00Z",
    "factors": {
      "duplicate_score": 0.90,
      "anomaly_score": 0.75,
      "network_score": 0.80,
      "complaint_score": 0.45
    }
  },
  "flags": {
    "is_duplicate": true,
    "is_ghost": false,
    "under_investigation": true,
    "blacklisted": false
  },
  "metadata": {
    "created_at": "2024-01-15T08:00:00Z",
    "updated_at": "2026-02-25T10:30:00Z",
    "created_by": "OFFICER123",
    "last_modified_by": "SYSTEM"
  }
}
```

**Global Secondary Indexes:**

```
district-index:
  PK: district
  SK: risk_score
  
scheme-index:
  PK: scheme_id
  SK: enrollment_date
  
risk-score-index:
  PK: risk_category
  SK: risk_score
```

---

### 2. Transactions Table

**Table Name:** `Transactions`
**Partition Key:** `transaction_id` (String)
**Sort Key:** `timestamp` (String)
**GSI:** `beneficiary-index`, `officer-index`, `date-index`

```json
{
  "transaction_id": "TXN789456123",
  "beneficiary_id": "BEN123456",
  "scheme_id": "PMAY",
  "transaction_type": "disbursement",
  "amount": 50000,
  "currency": "INR",
  "timestamp": "2026-02-20T14:30:00Z",
  "status": "completed",
  "payment_details": {
    "payment_mode": "bank_transfer",
    "reference_number": "REF123456",
    "bank_account_hash": "sha256_hash",
    "utr_number": "UTR123456789"
  },
  "approval_chain": [
    {
      "officer_id": "OFF123",
      "role": "block_officer",
      "action": "approved",
      "timestamp": "2026-02-18T10:00:00Z",
      "remarks": "Verified documents"
    },
    {
      "officer_id": "OFF456",
      "role": "district_officer",
      "action": "approved",
      "timestamp": "2026-02-19T15:30:00Z",
      "remarks": "Final approval"
    }
  ],
  "anomaly_flags": {
    "is_anomalous": true,
    "anomaly_score": 0.78,
    "anomaly_reasons": [
      "approval_speed_unusual",
      "amount_outlier"
    ]
  },
  "location": {
    "district": "District Name",
    "block": "Block Name",
    "office_code": "OFF001"
  },
  "metadata": {
    "created_at": "2026-02-20T14:30:00Z",
    "source_system": "payment_gateway"
  }
}
```

---

### 3. Complaints Table

**Table Name:** `Complaints`
**Partition Key:** `complaint_id` (String)
**Sort Key:** `created_at` (String)
**GSI:** `beneficiary-index`, `district-index`, `status-index`

```json
{
  "complaint_id": "CMP987654321",
  "complaint_type": "duplicate_beneficiary",
  "status": "under_investigation",
  "priority": "high",
  "submitter": {
    "type": "citizen",
    "citizen_id": "CIT123456",
    "name": "Jane Smith",
    "phone": "+91XXXXXXXXXX",
    "is_anonymous": false
  },
  "subject_beneficiary_id": "BEN123456",
  "description": "I believe this person is receiving benefits fraudulently",
  "description_original_language": "hi",
  "voice_recording": {
    "s3_url": "s3://complaints/audio/CMP987654321.mp3",
    "duration_seconds": 45,
    "transcription": "Transcribed text...",
    "language_detected": "hi"
  },
  "documents": [
    {
      "document_id": "DOC123",
      "type": "evidence",
      "s3_url": "s3://complaints/docs/DOC123.pdf",
      "uploaded_at": "2026-02-20T10:00:00Z"
    }
  ],
  "location": {
    "district": "District Name",
    "block": "Block Name",
    "coordinates": {
      "lat": 28.7041,
      "lon": 77.1025
    }
  },
  "nlp_analysis": {
    "sentiment": "negative",
    "sentiment_score": -0.75,
    "urgency_score": 0.85,
    "entities": [
      {"type": "PERSON", "text": "Officer Name"},
      {"type": "LOCATION", "text": "Village Name"}
    ],
    "keywords": ["bribery", "fake", "duplicate"],
    "category_predicted": "fraud"
  },
  "investigation": {
    "assigned_to": "OFF789",
    "assigned_at": "2026-02-21T09:00:00Z",
    "case_id": "CASE123456",
    "expected_resolution_date": "2026-03-07T23:59:59Z"
  },
  "timeline": [
    {
      "status": "submitted",
      "timestamp": "2026-02-20T10:00:00Z",
      "actor": "CIT123456",
      "notes": "Complaint received"
    },
    {
      "status": "acknowledged",
      "timestamp": "2026-02-20T10:05:00Z",
      "actor": "SYSTEM",
      "notes": "Auto-acknowledged"
    },
    {
      "status": "under_investigation",
      "timestamp": "2026-02-21T09:00:00Z",
      "actor": "OFF789",
      "notes": "Investigation started"
    }
  ],
  "metadata": {
    "created_at": "2026-02-20T10:00:00Z",
    "updated_at": "2026-02-21T09:00:00Z",
    "source": "mobile_app",
    "ip_address": "192.168.1.1"
  }
}
```

---

### 4. Alerts Table

**Table Name:** `Alerts`
**Partition Key:** `alert_id` (String)
**Sort Key:** `created_at` (String)
**GSI:** `district-index`, `severity-index`, `status-index`
**TTL:** `expires_at` (auto-delete after 90 days)

```json
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
    },
    {
      "factor": "shared_bank_account",
      "score": 0.85,
      "explanation": "Shares account with 3 other beneficiaries"
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
  "routing": {
    "assigned_to": "OFF123",
    "assigned_at": "2026-02-25T10:35:00Z",
    "escalated": false,
    "escalation_level": 0
  },
  "acknowledgment": {
    "acknowledged": true,
    "acknowledged_by": "OFF123",
    "acknowledged_at": "2026-02-25T10:40:00Z"
  },
  "resolution": {
    "resolved": false,
    "resolved_by": null,
    "resolved_at": null,
    "resolution_notes": null,
    "case_created": true,
    "case_id": "CASE789456"
  },
  "metadata": {
    "created_at": "2026-02-25T10:30:00Z",
    "updated_at": "2026-02-25T10:40:00Z",
    "expires_at": 1748347800
  }
}
```

---

### 5. Cases Table

**Table Name:** `Cases`
**Partition Key:** `case_id` (String)
**Sort Key:** `created_at` (String)
**GSI:** `officer-index`, `status-index`, `district-index`

```json
{
  "case_id": "CASE789456123",
  "case_type": "fraud_investigation",
  "status": "in_progress",
  "priority": "high",
  "beneficiary_ids": ["BEN123456", "BEN456789"],
  "alert_ids": ["ALT456789123"],
  "complaint_ids": ["CMP987654321"],
  "title": "Duplicate Beneficiary Investigation",
  "description": "Investigation of suspected duplicate beneficiaries",
  "investigation": {
    "lead_investigator": "OFF123",
    "team_members": ["OFF456", "OFF789"],
    "started_at": "2026-02-25T11:00:00Z",
    "expected_completion": "2026-03-10T23:59:59Z"
  },
  "evidence": [
    {
      "evidence_id": "EVD123",
      "type": "document",
      "description": "Identity verification report",
      "s3_url": "s3://cases/evidence/EVD123.pdf",
      "collected_by": "OFF123",
      "collected_at": "2026-02-26T14:00:00Z"
    }
  ],
  "findings": [
    {
      "finding_id": "FND123",
      "description": "Confirmed duplicate identity",
      "severity": "high",
      "recorded_by": "OFF123",
      "recorded_at": "2026-02-27T10:00:00Z"
    }
  ],
  "actions_taken": [
    {
      "action": "payment_frozen",
      "performed_by": "OFF456",
      "performed_at": "2026-02-25T12:00:00Z",
      "notes": "Payments frozen pending investigation"
    }
  ],
  "timeline": [
    {
      "status": "created",
      "timestamp": "2026-02-25T11:00:00Z",
      "actor": "OFF123",
      "notes": "Case opened"
    }
  ],
  "location": {
    "district": "District Name",
    "block": "Block Name"
  },
  "metadata": {
    "created_at": "2026-02-25T11:00:00Z",
    "updated_at": "2026-02-27T10:00:00Z",
    "created_by": "OFF123"
  }
}
```

---

### 6. AuditLog Table

**Table Name:** `AuditLog`
**Partition Key:** `log_id` (String)
**Sort Key:** `timestamp` (String)
**GSI:** `user-index`, `action-index`, `resource-index`
**TTL:** `expires_at` (retain for 7 years)

```json
{
  "log_id": "LOG123456789",
  "timestamp": "2026-02-25T10:30:00Z",
  "user_id": "OFF123",
  "user_role": "district_officer",
  "action": "view_beneficiary_details",
  "resource_type": "beneficiary",
  "resource_id": "BEN123456",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "request_details": {
    "method": "GET",
    "endpoint": "/api/v1/beneficiaries/BEN123456",
    "query_params": {}
  },
  "response_status": 200,
  "changes": null,
  "metadata": {
    "session_id": "SESS123456",
    "location": "District Office",
    "expires_at": 1969027800
  }
}
```

---

## Amazon Neptune Graph Schema

### Node Types

#### 1. Beneficiary Node
```gremlin
g.addV('Beneficiary')
  .property('beneficiary_id', 'BEN123456')
  .property('name_hash', 'sha256_hash')
  .property('risk_score', 0.85)
  .property('district', 'District Name')
  .property('scheme', 'PMAY')
  .property('status', 'active')
  .property('created_at', '2024-01-15')
```

#### 2. Officer Node
```gremlin
g.addV('Officer')
  .property('officer_id', 'OFF123')
  .property('name', 'Officer Name')
  .property('role', 'district_officer')
  .property('department', 'welfare')
  .property('district', 'District Name')
  .property('risk_score', 0.25)
```

#### 3. BankAccount Node
```gremlin
g.addV('BankAccount')
  .property('account_hash', 'sha256_hash')
  .property('ifsc', 'SBIN0001234')
  .property('bank_name', 'State Bank of India')
  .property('branch', 'Main Branch')
```

#### 4. Address Node
```gremlin
g.addV('Address')
  .property('address_hash', 'sha256_hash')
  .property('village', 'Village Name')
  .property('block', 'Block Name')
  .property('district', 'District Name')
  .property('pincode', '123456')
  .property('coordinates', '28.7041,77.1025')
```

#### 5. PhoneNumber Node
```gremlin
g.addV('PhoneNumber')
  .property('phone_hash', 'sha256_hash')
  .property('verified', true)
```

#### 6. Transaction Node
```gremlin
g.addV('Transaction')
  .property('transaction_id', 'TXN789456123')
  .property('amount', 50000)
  .property('timestamp', '2026-02-20T14:30:00Z')
  .property('scheme', 'PMAY')
```

### Edge Types

#### 1. APPROVED_BY
```gremlin
g.V().has('Beneficiary', 'beneficiary_id', 'BEN123456')
  .addE('APPROVED_BY')
  .to(g.V().has('Officer', 'officer_id', 'OFF123'))
  .property('timestamp', '2024-01-15T10:00:00Z')
  .property('approval_speed_hours', 2)
  .property('is_anomalous', true)
```

#### 2. RECEIVED
```gremlin
g.V().has('Beneficiary', 'beneficiary_id', 'BEN123456')
  .addE('RECEIVED')
  .to(g.V().has('Transaction', 'transaction_id', 'TXN789456123'))
  .property('timestamp', '2026-02-20T14:30:00Z')
```

#### 3. SHARES_ACCOUNT
```gremlin
g.V().has('Beneficiary', 'beneficiary_id', 'BEN123456')
  .addE('SHARES_ACCOUNT')
  .to(g.V().has('BankAccount', 'account_hash', 'sha256_hash'))
  .property('since', '2024-01-15')
```

#### 4. SHARES_ADDRESS
```gremlin
g.V().has('Beneficiary', 'beneficiary_id', 'BEN123456')
  .addE('SHARES_ADDRESS')
  .to(g.V().has('Address', 'address_hash', 'sha256_hash'))
  .property('since', '2024-01-15')
```

#### 5. SHARES_PHONE
```gremlin
g.V().has('Beneficiary', 'beneficiary_id', 'BEN123456')
  .addE('SHARES_PHONE')
  .to(g.V().has('PhoneNumber', 'phone_hash', 'sha256_hash'))
  .property('since', '2024-01-15')
```

#### 6. RELATED_TO (Duplicate/Similar)
```gremlin
g.V().has('Beneficiary', 'beneficiary_id', 'BEN123456')
  .addE('RELATED_TO')
  .to(g.V().has('Beneficiary', 'beneficiary_id', 'BEN456789'))
  .property('similarity_score', 0.95)
  .property('relationship_type', 'duplicate')
  .property('detected_at', '2026-02-25T10:00:00Z')
```

### Graph Queries

#### Find Fraud Networks
```gremlin
// Find beneficiaries sharing bank accounts (hub pattern)
g.V().hasLabel('BankAccount')
  .where(__.in('SHARES_ACCOUNT').count().is(gt(3)))
  .project('account', 'beneficiaries', 'count')
    .by('account_hash')
    .by(__.in('SHARES_ACCOUNT').values('beneficiary_id').fold())
    .by(__.in('SHARES_ACCOUNT').count())
```

#### Detect Officer Fraud Patterns
```gremlin
// Officers with high approval rates of risky beneficiaries
g.V().hasLabel('Officer')
  .where(
    __.in('APPROVED_BY')
      .has('risk_score', gt(0.7))
      .count()
      .is(gt(10))
  )
  .project('officer', 'high_risk_approvals', 'avg_risk')
    .by('officer_id')
    .by(__.in('APPROVED_BY').has('risk_score', gt(0.7)).count())
    .by(__.in('APPROVED_BY').values('risk_score').mean())
```

#### Community Detection
```gremlin
// Find tightly connected beneficiary clusters
g.V().hasLabel('Beneficiary')
  .has('risk_score', gt(0.6))
  .repeat(
    both('SHARES_ACCOUNT', 'SHARES_ADDRESS', 'SHARES_PHONE', 'RELATED_TO')
      .simplePath()
  )
  .times(3)
  .path()
  .by('beneficiary_id')
```

#### Shortest Path Between Suspects
```gremlin
// Find connection path between two beneficiaries
g.V().has('Beneficiary', 'beneficiary_id', 'BEN123456')
  .repeat(both().simplePath())
  .until(has('Beneficiary', 'beneficiary_id', 'BEN789456'))
  .path()
  .limit(1)
```

---

## S3 Data Lake Structure

```
s3://leakage-detection-datalake/
├── raw/
│   ├── beneficiaries/
│   │   └── year=2026/month=02/day=25/
│   │       └── beneficiaries_20260225.parquet
│   ├── transactions/
│   │   └── year=2026/month=02/day=25/
│   │       └── transactions_20260225.parquet
│   ├── complaints/
│   │   ├── text/
│   │   ├── audio/
│   │   └── documents/
│   └── audit_logs/
├── processed/
│   ├── features/
│   │   ├── identity_features/
│   │   ├── transaction_features/
│   │   └── network_features/
│   ├── anomalies/
│   │   └── year=2026/month=02/
│   │       └── anomalies_20260225.parquet
│   └── risk_scores/
│       └── year=2026/month=02/
│           └── risk_scores_20260225.parquet
├── models/
│   ├── duplicate_detection/
│   │   ├── model.tar.gz
│   │   └── metadata.json
│   ├── anomaly_detection/
│   └── risk_scoring/
└── reports/
    ├── daily/
    ├── weekly/
    └── monthly/
```

---

## AWS Glue Data Catalog

### Database: `leakage_detection`

**Tables:**

1. `raw_beneficiaries`
   - Location: `s3://leakage-detection-datalake/raw/beneficiaries/`
   - Format: Parquet
   - Partitioned by: year, month, day

2. `raw_transactions`
   - Location: `s3://leakage-detection-datalake/raw/transactions/`
   - Format: Parquet
   - Partitioned by: year, month, day

3. `processed_features`
   - Location: `s3://leakage-detection-datalake/processed/features/`
   - Format: Parquet
   - Partitioned by: feature_type, year, month

4. `risk_scores`
   - Location: `s3://leakage-detection-datalake/processed/risk_scores/`
   - Format: Parquet
   - Partitioned by: year, month, day

---

## Data Retention Policies

### DynamoDB
- **Beneficiaries:** Indefinite (archive inactive after 5 years)
- **Transactions:** 3 years hot, then archive to S3
- **Complaints:** 7 years (legal requirement)
- **Alerts:** 90 days (TTL enabled)
- **Cases:** 7 years
- **AuditLog:** 7 years (compliance)

### S3
- **Raw data:** 7 years (lifecycle to Glacier after 1 year)
- **Processed data:** 3 years
- **Models:** Indefinite (version controlled)
- **Reports:** 7 years

### Neptune
- **Active fraud networks:** Real-time
- **Historical networks:** Archive after investigation closed

---

## Backup Strategy

### DynamoDB
- Point-in-time recovery enabled
- Daily automated backups
- Cross-region replication for critical tables

### Neptune
- Automated daily snapshots
- Retention: 35 days
- Manual snapshots before major changes

### S3
- Versioning enabled
- Cross-region replication for critical data
- MFA delete protection

---

*These schemas provide a comprehensive data foundation for the leakage detection platform.*
