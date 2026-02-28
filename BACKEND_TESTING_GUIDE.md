# Backend Testing Guide - AI Economic Leakage Detection

## 🚀 Quick Start Testing

### Step 1: Start the Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

You should see:
```
✅ Database initialized
✅ AI models loaded
✅ Sample data seeded
🚀 Server running on http://localhost:8000
```

### Step 2: Verify Server is Running

Open browser: **http://localhost:8000**

You should see:
```json
{
  "status": "running",
  "service": "Economic Leakage Detection API",
  "version": "1.0.0",
  "timestamp": "2026-02-27T..."
}
```

---

## 🧪 Testing Methods

### Method 1: Interactive API Documentation (Easiest)

**Open:** http://localhost:8000/docs

This opens **Swagger UI** with interactive API testing:

1. Click on any endpoint (e.g., `GET /api/v1/beneficiaries`)
2. Click "Try it out"
3. Click "Execute"
4. See the response below

**Try these endpoints:**
- `GET /api/v1/beneficiaries` - See all beneficiaries
- `GET /api/v1/alerts` - See active alerts
- `GET /api/v1/analytics/summary` - See overall stats

---

### Method 2: Using curl (Command Line)

#### Test 1: Health Check
```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{"status": "healthy"}
```

#### Test 2: Get All Beneficiaries
```bash
curl http://localhost:8000/api/v1/beneficiaries
```

**Expected Response:** Array of 5 beneficiaries

#### Test 3: Get Alerts
```bash
curl http://localhost:8000/api/v1/alerts
```

**Expected Response:**
```json
{
  "alerts": [...],
  "total": 2,
  "summary": {
    "critical": 1,
    "high": 1,
    "medium": 0
  }
}
```

#### Test 4: Get Risk Assessment
```bash
curl http://localhost:8000/api/v1/beneficiaries/BEN001/risk
```

**Expected Response:** Risk assessment with factors

#### Test 5: Submit Complaint
```bash
curl -X POST http://localhost:8000/api/v1/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "complaint_type": "fraud",
    "description": "This is urgent! I found a fake beneficiary",
    "location": {
      "district": "District1",
      "block": "Block1"
    },
    "is_anonymous": false
  }'
```

**Expected Response:**
```json
{
  "complaint_id": "CMP...",
  "status": "submitted",
  "urgency_score": 0.85,
  "predicted_type": "fraud",
  "message": "Complaint submitted successfully"
}
```

#### Test 6: Register New Beneficiary (Test Duplicate Detection)
```bash
curl -X POST http://localhost:8000/api/v1/beneficiaries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Kumar",
    "date_of_birth": "1985-06-15",
    "gender": "M",
    "address": "123 Main St, Village A",
    "phone": "+919876543210",
    "bank_account": "ACC001",
    "district": "District1",
    "scheme": "PMAY",
    "amount": 50000
  }'
```

**Expected Response:**
```json
{
  "beneficiary_id": "BEN...",
  "risk_score": 0.85,
  "risk_category": "high",
  "is_duplicate": true,
  "message": "Beneficiary registered successfully"
}
```

This should trigger duplicate detection and create an alert!

#### Test 7: Get Fraud Networks
```bash
curl http://localhost:8000/api/v1/analytics/fraud-networks
```

**Expected Response:** Detected fraud networks

#### Test 8: Get District Risk
```bash
curl http://localhost:8000/api/v1/analytics/district-risk
```

**Expected Response:** Risk scores by district

---

### Method 3: Using Python Requests

Create a file `test_api.py`:

```python
import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_health():
    response = requests.get("http://localhost:8000/health")
    print("Health Check:", response.json())
    assert response.status_code == 200

def test_get_beneficiaries():
    response = requests.get(f"{BASE_URL}/beneficiaries")
    data = response.json()
    print(f"Beneficiaries: {len(data)} found")
    assert response.status_code == 200
    assert len(data) >= 5

def test_get_alerts():
    response = requests.get(f"{BASE_URL}/alerts")
    data = response.json()
    print(f"Alerts: {data['total']} found")
    assert response.status_code == 200
    assert data['total'] >= 2

def test_risk_assessment():
    response = requests.get(f"{BASE_URL}/beneficiaries/BEN001/risk")
    data = response.json()
    print(f"Risk Score: {data['risk_score']}")
    assert response.status_code == 200
    assert 'risk_score' in data

def test_submit_complaint():
    complaint = {
        "complaint_type": "fraud",
        "description": "Urgent! Fake beneficiary detected",
        "location": {
            "district": "District1"
        },
        "is_anonymous": False
    }
    response = requests.post(f"{BASE_URL}/complaints", json=complaint)
    data = response.json()
    print(f"Complaint ID: {data['complaint_id']}")
    print(f"Urgency Score: {data['urgency_score']}")
    assert response.status_code == 200
    assert 'complaint_id' in data

def test_duplicate_detection():
    beneficiary = {
        "name": "Rajesh Kumarr",
        "date_of_birth": "1985-06-16",
        "gender": "M",
        "address": "124 Main St, Village A",
        "phone": "+919876543211",
        "bank_account": "ACC001",
        "district": "District1",
        "scheme": "PMAY",
        "amount": 50000
    }
    response = requests.post(f"{BASE_URL}/beneficiaries", json=beneficiary)
    data = response.json()
    print(f"Duplicate Detected: {data['is_duplicate']}")
    print(f"Risk Score: {data['risk_score']}")
    assert response.status_code == 200
    assert data['is_duplicate'] == True

def test_fraud_networks():
    response = requests.get(f"{BASE_URL}/analytics/fraud-networks")
    data = response.json()
    print(f"Networks Found: {data['total_networks']}")
    assert response.status_code == 200

def test_analytics_summary():
    response = requests.get(f"{BASE_URL}/analytics/summary")
    data = response.json()
    print(f"Total Beneficiaries: {data['total_beneficiaries']}")
    print(f"High Risk: {data['high_risk_count']}")
    assert response.status_code == 200

if __name__ == "__main__":
    print("🧪 Testing Backend API...\n")
    
    test_health()
    print("✅ Health check passed\n")
    
    test_get_beneficiaries()
    print("✅ Get beneficiaries passed\n")
    
    test_get_alerts()
    print("✅ Get alerts passed\n")
    
    test_risk_assessment()
    print("✅ Risk assessment passed\n")
    
    test_submit_complaint()
    print("✅ Submit complaint passed\n")
    
    test_duplicate_detection()
    print("✅ Duplicate detection passed\n")
    
    test_fraud_networks()
    print("✅ Fraud networks passed\n")
    
    test_analytics_summary()
    print("✅ Analytics summary passed\n")
    
    print("🎉 All tests passed!")
```

Run it:
```bash
python test_api.py
```

---

### Method 4: Using Postman

1. **Download Postman:** https://www.postman.com/downloads/

2. **Import Collection:**

Create `postman_collection.json`:

```json
{
  "info": {
    "name": "Economic Leakage Detection API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8000/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["health"]
        }
      }
    },
    {
      "name": "Get Beneficiaries",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8000/api/v1/beneficiaries",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "v1", "beneficiaries"]
        }
      }
    },
    {
      "name": "Get Alerts",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8000/api/v1/alerts",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "v1", "alerts"]
        }
      }
    },
    {
      "name": "Submit Complaint",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"complaint_type\": \"fraud\",\n  \"description\": \"Urgent! Fake beneficiary\",\n  \"location\": {\n    \"district\": \"District1\"\n  },\n  \"is_anonymous\": false\n}"
        },
        "url": {
          "raw": "http://localhost:8000/api/v1/complaints",
          "protocol": "http",
          "host": ["localhost"],
          "port": "8000",
          "path": ["api", "v1", "complaints"]
        }
      }
    }
  ]
}
```

3. Import in Postman: File → Import → Select file

---

### Method 5: Using HTTPie (Pretty CLI)

Install HTTPie:
```bash
pip install httpie
```

Test endpoints:
```bash
# Health check
http GET localhost:8000/health

# Get beneficiaries
http GET localhost:8000/api/v1/beneficiaries

# Submit complaint
http POST localhost:8000/api/v1/complaints \
  complaint_type=fraud \
  description="Urgent fraud case" \
  location:='{"district":"District1"}' \
  is_anonymous:=false
```

---

## 🎯 Comprehensive Test Suite

### Test All Endpoints

```bash
#!/bin/bash

echo "🧪 Testing All API Endpoints"
echo "=============================="

BASE_URL="http://localhost:8000/api/v1"

# Test 1: Health
echo -e "\n1️⃣ Testing Health Check..."
curl -s http://localhost:8000/health | jq

# Test 2: Beneficiaries
echo -e "\n2️⃣ Testing Get Beneficiaries..."
curl -s $BASE_URL/beneficiaries | jq '. | length'

# Test 3: Specific Beneficiary
echo -e "\n3️⃣ Testing Get Beneficiary BEN001..."
curl -s $BASE_URL/beneficiaries/BEN001 | jq '.name'

# Test 4: Risk Assessment
echo -e "\n4️⃣ Testing Risk Assessment..."
curl -s $BASE_URL/beneficiaries/BEN001/risk | jq '.risk_score'

# Test 5: Fraud Network
echo -e "\n5️⃣ Testing Fraud Network..."
curl -s $BASE_URL/beneficiaries/BEN001/network | jq '.statistics'

# Test 6: Alerts
echo -e "\n6️⃣ Testing Get Alerts..."
curl -s $BASE_URL/alerts | jq '.total'

# Test 7: Analytics Summary
echo -e "\n7️⃣ Testing Analytics Summary..."
curl -s $BASE_URL/analytics/summary | jq '.total_beneficiaries'

# Test 8: District Risk
echo -e "\n8️⃣ Testing District Risk..."
curl -s $BASE_URL/analytics/district-risk | jq '. | length'

# Test 9: Fraud Networks
echo -e "\n9️⃣ Testing Fraud Networks..."
curl -s $BASE_URL/analytics/fraud-networks | jq '.total_networks'

# Test 10: Trends
echo -e "\n🔟 Testing Trends..."
curl -s $BASE_URL/analytics/trends | jq '.trend_direction'

echo -e "\n✅ All tests completed!"
```

Save as `test_all.sh` and run:
```bash
chmod +x test_all.sh
./test_all.sh
```

---

## 🔍 Testing AI Models

### Test Duplicate Detection

```bash
# Register a duplicate beneficiary
curl -X POST http://localhost:8000/api/v1/beneficiaries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Kumar",
    "date_of_birth": "1985-06-15",
    "gender": "M",
    "address": "123 Main St, Village A",
    "phone": "+919876543210",
    "bank_account": "ACC001",
    "district": "District1",
    "scheme": "PMAY",
    "amount": 50000
  }'
```

**Expected:** `is_duplicate: true`, `risk_score: 0.85+`

### Test Complaint Urgency Detection

```bash
# High urgency complaint
curl -X POST http://localhost:8000/api/v1/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "complaint_type": "fraud",
    "description": "URGENT! CRITICAL! Fake ghost beneficiary fraud detected immediately!",
    "location": {"district": "District1"},
    "is_anonymous": false
  }'
```

**Expected:** `urgency_score: 0.85+`

```bash
# Low urgency complaint
curl -X POST http://localhost:8000/api/v1/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "complaint_type": "fraud",
    "description": "I have a question about the process",
    "location": {"district": "District1"},
    "is_anonymous": false
  }'
```

**Expected:** `urgency_score: 0.2-0.4`

---

## 📊 Expected Results

### Sample Beneficiaries
```json
[
  {
    "beneficiary_id": "BEN001",
    "name": "Rajesh Kumar",
    "risk_score": 0.85,
    "risk_category": "high",
    "is_duplicate": 1,
    "is_flagged": 1
  },
  {
    "beneficiary_id": "BEN002",
    "name": "Rajesh Kumarr",
    "risk_score": 0.82,
    "risk_category": "high",
    "is_duplicate": 1,
    "is_flagged": 1
  }
]
```

### Sample Alerts
```json
{
  "alerts": [
    {
      "alert_id": "ALT001",
      "severity": "critical",
      "beneficiary_id": "BEN001",
      "risk_score": 0.85,
      "title": "High Risk Duplicate Detected"
    }
  ],
  "total": 2
}
```

---

## 🐛 Troubleshooting

### Issue: Connection Refused
```bash
curl: (7) Failed to connect to localhost port 8000
```

**Solution:** Backend not running. Start it:
```bash
cd backend
python app.py
```

### Issue: 404 Not Found
```bash
{"detail":"Not Found"}
```

**Solution:** Check URL. Use `/api/v1/` prefix:
```bash
# Wrong
curl localhost:8000/beneficiaries

# Correct
curl localhost:8000/api/v1/beneficiaries
```

### Issue: 500 Internal Server Error

**Solution:** Check backend terminal for error logs

### Issue: Empty Response
```bash
[]
```

**Solution:** Database not initialized. Restart backend:
```bash
rm leakage_detection.db
python app.py
```

---

## ✅ Success Checklist

After testing, verify:

- [ ] Health endpoint returns `{"status": "healthy"}`
- [ ] Beneficiaries endpoint returns 5 records
- [ ] Alerts endpoint returns 2 alerts
- [ ] Risk assessment shows risk factors
- [ ] Fraud network shows connections
- [ ] Complaint submission returns complaint_id
- [ ] Duplicate detection works (high similarity)
- [ ] Analytics summary shows statistics
- [ ] District risk returns data
- [ ] Trends endpoint returns chart data

---

## 🎓 Advanced Testing

### Load Testing with Apache Bench

```bash
# Install Apache Bench
sudo apt-get install apache2-utils  # Linux
brew install httpd  # Mac

# Test 1000 requests, 10 concurrent
ab -n 1000 -c 10 http://localhost:8000/api/v1/beneficiaries
```

### Performance Testing

```python
import time
import requests

def benchmark_endpoint(url, iterations=100):
    times = []
    for _ in range(iterations):
        start = time.time()
        requests.get(url)
        times.append(time.time() - start)
    
    avg = sum(times) / len(times)
    print(f"Average: {avg*1000:.2f}ms")
    print(f"Min: {min(times)*1000:.2f}ms")
    print(f"Max: {max(times)*1000:.2f}ms")

benchmark_endpoint("http://localhost:8000/api/v1/beneficiaries")
```

---

## 📝 Quick Reference

### All Endpoints

```
GET    /                                    - Root
GET    /health                              - Health check
GET    /docs                                - API documentation

GET    /api/v1/beneficiaries               - List beneficiaries
POST   /api/v1/beneficiaries               - Register beneficiary
GET    /api/v1/beneficiaries/{id}          - Get beneficiary
GET    /api/v1/beneficiaries/{id}/risk     - Risk assessment
GET    /api/v1/beneficiaries/{id}/network  - Fraud network

GET    /api/v1/alerts                      - List alerts
GET    /api/v1/alerts/{id}                 - Get alert
POST   /api/v1/alerts/{id}/acknowledge     - Acknowledge alert

POST   /api/v1/complaints                  - Submit complaint
GET    /api/v1/complaints                  - List complaints
GET    /api/v1/complaints/{id}             - Get complaint

GET    /api/v1/analytics/summary           - Overall stats
GET    /api/v1/analytics/district-risk     - District analysis
GET    /api/v1/analytics/fraud-networks    - Fraud networks
GET    /api/v1/analytics/trends            - Trend data
```

---

**🎉 You're ready to test the backend thoroughly!**
