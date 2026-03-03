# AWS Lambda Deployment Checklist

## ✅ Package Structure Verified

```
backend/package/
├── app.py                    # Main FastAPI app with Mangum handler
├── requirements.txt          # All dependencies with versions
├── routes/                   # API route handlers
│   ├── __init__.py
│   ├── alerts.py
│   ├── analytics.py
│   ├── beneficiaries.py
│   └── complaints.py
├── services/                 # Business logic services
│   ├── __init__.py
│   └── database.py          # Lambda-compatible DB config
├── models/                   # Pydantic schemas
│   ├── __init__.py
│   └── schemas.py
├── ai_models/               # AI/ML models
│   ├── __init__.py
│   ├── anomaly_detector.py
│   ├── complaint_analyzer.py
│   ├── duplicate_detector.py
│   └── risk_scorer.py
├── graph/                   # Graph analysis
│   ├── __init__.py
│   └── fraud_network.py
└── [dependencies]/          # All pip packages installed
```

## ✅ Critical Fixes Applied

### 1. Mangum Handler Configuration
- ✅ Imported: `from mangum import Mangum`
- ✅ Handler created: `handler = Mangum(app)`
- ✅ Positioned correctly after app initialization

### 2. Lambda-Compatible Database
- ✅ Database path uses `/tmp/` directory (Lambda writable storage)
- ✅ Environment variable support: `DB_PATH`
- ✅ Removed localhost references

### 3. Dependencies
- ✅ All required modules copied to package
- ✅ requirements.txt includes all dependencies with versions
- ✅ Mangum version pinned: 0.21.0

### 4. Import Structure
- ✅ All relative imports working
- ✅ __init__.py files present in all packages
- ✅ No broken module references

### 5. Removed Local-Only Code
- ✅ Removed uvicorn import (not needed in Lambda)
- ✅ Removed `if __name__ == "__main__"` block
- ✅ Removed localhost print statement

## 📦 Deployment Steps

### Option 1: Direct ZIP Upload (< 50MB)
```bash
cd backend/package
zip -r ../lambda-deployment.zip . -x "*.pyc" "*__pycache__*"
```

### Option 2: S3 Upload (> 50MB)
```bash
cd backend/package
zip -r ../lambda-deployment.zip . -x "*.pyc" "*__pycache__*"
aws s3 cp ../lambda-deployment.zip s3://your-bucket/lambda-deployment.zip
```

### Option 3: Container Image
```dockerfile
FROM public.ecr.aws/lambda/python:3.11
COPY . ${LAMBDA_TASK_ROOT}
RUN pip install -r requirements.txt
CMD ["app.handler"]
```

## ⚙️ Lambda Configuration

### Function Settings
- **Runtime**: Python 3.11
- **Handler**: `app.handler`
- **Memory**: 512 MB (minimum, adjust based on AI models)
- **Timeout**: 30 seconds (API Gateway limit)
- **Ephemeral Storage**: 512 MB (for /tmp database)

### Environment Variables
```
DB_PATH=/tmp/leakage_detection.db
```

### IAM Permissions (if using AWS services)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

## 🔗 API Gateway Integration

### REST API
- Integration type: Lambda Proxy
- Enable CORS: Yes (already configured in app)

### HTTP API
- Integration: Lambda
- Payload format: 2.0

## 🧪 Testing

### Local Testing
```bash
cd backend/package
python -c "from app import handler; print('Import successful')"
```

### Lambda Testing
```json
{
  "httpMethod": "GET",
  "path": "/health",
  "headers": {},
  "body": null
}
```

Expected response:
```json
{
  "statusCode": 200,
  "body": "{\"status\":\"healthy\"}"
}
```

## ⚠️ Important Notes

1. **Database Persistence**: SQLite in /tmp is ephemeral. Consider:
   - Amazon RDS for persistent storage
   - DynamoDB for serverless database
   - S3 for database backups

2. **Cold Starts**: First request may be slow due to:
   - AI model loading
   - Database initialization
   - Consider provisioned concurrency for production

3. **Package Size**: Current package with dependencies ~150MB
   - Use Lambda Layers for common dependencies
   - Consider container image for larger packages

4. **Memory Requirements**: AI models may need more memory
   - Monitor CloudWatch metrics
   - Adjust memory allocation as needed

## 🚀 Ready for Deployment

The package is now 100% Lambda-ready with:
- ✅ Correct Mangum handler
- ✅ All dependencies included
- ✅ Lambda-compatible configuration
- ✅ No local-only code
- ✅ Proper package structure
