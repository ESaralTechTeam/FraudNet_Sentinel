# Cloud-Ready Refactoring Roadmap
## Detailed Implementation Guide

---

## Overview

This document provides specific implementation steps, code examples, and file structure for refactoring the platform to be cloud-ready.

---

## Phase 1: Adapter Pattern Foundation (Week 1-2)

### Step 1.1: Create Adapter Directory Structure

```
backend/
├── adapters/
│   ├── __init__.py
│   ├── base.py              # Base adapter interfaces
│   ├── factory.py           # Adapter factory
│   ├── dependencies.py      # FastAPI dependencies
│   ├── storage/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── local.py         # SQLite implementation
│   │   └── cloud.py         # DynamoDB implementation (stub)
│   ├── ai/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── local.py         # In-memory models
│   │   └── remote.py        # SageMaker implementation (stub)
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── local.py         # Simple JWT
│   │   └── cognito.py       # Cognito implementation (stub)
│   ├── notification/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── local.py         # Console logging
│   │   └── cloud.py         # SNS implementation (stub)
│   ├── event/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── local.py         # In-memory queue
│   │   └── cloud.py         # Kinesis implementation (stub)
│   └── graph/
│       ├── __init__.py
│       ├── base.py
│       ├── local.py         # NetworkX
│       └── neptune.py       # Neptune implementation (stub)
```

### Step 1.2: Create Configuration System

```
backend/
├── config/
│   ├── __init__.py
│   ├── settings.py          # Pydantic settings
│   ├── base.py              # Base configuration
│   ├── development.py       # Development config
│   ├── staging.py           # Staging config
│   └── production.py        # Production config
```


### Step 1.3: Base Adapter Interfaces

Create the foundational interfaces that all adapters will implement.

**Key Principles:**
- Abstract base classes define contracts
- Async by default for cloud compatibility
- Type hints for clarity
- Error handling built-in

---

## Phase 2: Environment Configuration (Week 2)

### Step 2.1: Environment Files

Create environment files for each deployment stage:

**.env.development:**
```bash
APP_ENV=development
STORAGE_ADAPTER=local
AI_ADAPTER=local
AUTH_ADAPTER=local
NOTIFICATION_ADAPTER=local
EVENT_ADAPTER=local
GRAPH_ADAPTER=local
DATABASE_URL=sqlite:///./leakage_detection.db
LOG_LEVEL=DEBUG
```

**.env.production:**
```bash
APP_ENV=production
STORAGE_ADAPTER=cloud
AI_ADAPTER=remote
AUTH_ADAPTER=cognito
NOTIFICATION_ADAPTER=cloud
EVENT_ADAPTER=cloud
GRAPH_ADAPTER=neptune
DYNAMODB_TABLE_PREFIX=leakage-detection
S3_BUCKET_NAME=leakage-detection-prod
LOG_LEVEL=INFO
```

### Step 2.2: Settings Validation

Implement Pydantic settings with validation to ensure all required configuration is present.


---

## Phase 3: Stateless Backend Refactoring (Week 3-4)

### Step 3.1: Remove Global State

**Current Problem:**
```python
# app.py - BEFORE (problematic)
from ai_models.anomaly_detector import AnomalyDetector

# Global state - bad for Lambda
anomaly_detector = AnomalyDetector()

@app.post("/detect")
async def detect_anomaly(data: Dict):
    return anomaly_detector.predict(data)
```

**Solution:**
```python
# app.py - AFTER (cloud-ready)
from adapters.dependencies import get_ai_adapter

@app.post("/detect")
async def detect_anomaly(
    data: Dict,
    ai_adapter: AIModelAdapter = Depends(get_ai_adapter)
):
    return await ai_adapter.predict("anomaly_detector", data)
```

### Step 3.2: Dependency Injection Pattern

All routes should receive their dependencies through FastAPI's dependency injection system.

### Step 3.3: Health Check Endpoints

Add comprehensive health checks for monitoring and load balancer integration.


---

## Phase 4: Frontend Environment Configuration (Week 4)

### Step 4.1: Environment Variables

**Create .env files:**

**.env.development:**
```bash
REACT_APP_API_BASE_URL=http://localhost:8000
REACT_APP_ENV=development
REACT_APP_ENABLE_ANALYTICS=false
```

**.env.production:**
```bash
REACT_APP_API_BASE_URL=https://api.leakage-detection.gov.in
REACT_APP_ENV=production
REACT_APP_COGNITO_USER_POOL_ID=ap-south-1_xxxxx
REACT_APP_COGNITO_CLIENT_ID=xxxxx
REACT_APP_ENABLE_ANALYTICS=true
```

### Step 4.2: Configuration Module

Create a centralized configuration module that reads from environment variables.

### Step 4.3: API Client Refactoring

Update the API client to use environment-based configuration and support authentication.


---

## Phase 5: Testing Strategy (Week 5-6)

### Step 5.1: Unit Tests for Adapters

Test each adapter implementation independently.

### Step 5.2: Integration Tests

Test the system with different adapter configurations.

### Step 5.3: Adapter Switching Tests

Verify that switching between local and cloud adapters works seamlessly.

---

## Phase 6: Cloud Adapter Stubs (Week 6-7)

### Step 6.1: Create Stub Implementations

Create stub implementations for all cloud adapters that:
- Implement the interface
- Raise NotImplementedError with helpful messages
- Document required AWS configuration
- Include example usage

### Step 6.2: Documentation

Document each cloud adapter's requirements, configuration, and usage.

---

## Implementation Priority

### High Priority (Must Complete Before AWS)
1. ✅ Adapter interfaces
2. ✅ Local adapter implementations
3. ✅ Environment configuration
4. ✅ Remove global state
5. ✅ Dependency injection
6. ✅ Frontend environment config

### Medium Priority (Should Complete Before AWS)
7. Health check endpoints
8. Structured logging
9. Error handling middleware
10. Request ID tracking
11. Authentication decorators
12. Rate limiting

### Lower Priority (Can Complete During AWS Integration)
13. Cloud adapter implementations
14. Advanced monitoring
15. Performance optimization
16. Caching layer

---

## Success Metrics

### Code Quality
- All adapters implement base interface
- No hardcoded configuration
- 80%+ test coverage
- No global state

### Functionality
- All features work with local adapters
- Easy to switch adapters via environment
- Development experience unchanged
- Ready for cloud deployment

### Performance
- No performance degradation
- Async operations throughout
- Efficient resource usage

---

## Next Steps After Refactoring

Once this refactoring is complete:

1. **AWS Account Setup**
   - Create AWS accounts
   - Setup IAM roles
   - Configure VPC

2. **Cloud Adapter Implementation**
   - Implement DynamoDB adapter
   - Implement SageMaker adapter
   - Implement Cognito adapter

3. **Staging Deployment**
   - Deploy to AWS staging
   - Test cloud adapters
   - Performance testing

4. **Production Deployment**
   - Deploy to production
   - Monitor and optimize
   - Continuous improvement

---

## Conclusion

This roadmap provides a structured approach to refactoring the platform for cloud readiness. By following these phases, we ensure:

- **No functionality loss** during refactoring
- **Testable** at every stage
- **Reversible** changes
- **Clear path** to AWS integration

The key is to complete the refactoring with local adapters first, ensuring everything works, before implementing cloud adapters.
