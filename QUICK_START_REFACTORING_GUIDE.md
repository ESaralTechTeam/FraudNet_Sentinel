# Quick Start: Cloud-Ready Refactoring Guide

---

## 🎯 Goal

Transform the current local application into a cloud-ready platform without implementing AWS services yet.

---

## 📊 Current vs Target Architecture

### Current Architecture (Local)
```
┌─────────────────────────────────────────────────────┐
│  Frontend (React)                                   │
│  - Hardcoded: http://localhost:8000                 │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Backend (FastAPI)                                  │
│  - Global state (models loaded at startup)          │
│  - Direct SQLite calls                              │
│  - No authentication                                │
│  - Synchronous processing                           │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Data Layer                                         │
│  - SQLite: leakage_detection.db                     │
│  - In-memory: AI models, graph                      │
└─────────────────────────────────────────────────────┘
```

### Target Architecture (Cloud-Ready)
```
┌─────────────────────────────────────────────────────┐
│  Frontend (React)                                   │
│  - Environment-based API URL                        │
│  - Authentication support                           │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  API Layer (FastAPI)                                │
│  - Stateless handlers                               │
│  - Dependency injection                             │
│  - Authentication middleware                        │
│  - Health checks                                    │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│  Adapter Layer (Abstraction)                        │
│  ┌─────────────┬─────────────┬─────────────┐       │
│  │  Storage    │  AI Models  │  Auth       │       │
│  │  Adapter    │  Adapter    │  Adapter    │       │
│  └─────────────┴─────────────┴─────────────┘       │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
┌──────────────┐      ┌──────────────┐
│ Local        │      │ Cloud        │
│ (Dev)        │      │ (Prod)       │
│              │      │              │
│ - SQLite     │      │ - DynamoDB   │
│ - In-memory  │      │ - SageMaker  │
│ - Simple JWT │      │ - Cognito    │
└──────────────┘      └──────────────┘
```

---

## 🚀 Quick Start Steps

### Step 1: Create Adapter Structure (30 minutes)

```bash
# Create directory structure
mkdir -p backend/adapters/{storage,ai,auth,notification,event,graph}
mkdir -p backend/config

# Create __init__.py files
touch backend/adapters/__init__.py
touch backend/adapters/storage/__init__.py
touch backend/adapters/ai/__init__.py
touch backend/adapters/auth/__init__.py
touch backend/config/__init__.py
```

### Step 2: Create Base Interfaces (1 hour)

Copy the interface definitions from `ADAPTER_PATTERN_CODE_EXAMPLES.md`:
- `backend/adapters/storage/base.py`
- `backend/adapters/ai/base.py`
- `backend/adapters/auth/base.py`

### Step 3: Implement Local Adapters (2-3 hours)

Copy the local implementations:
- `backend/adapters/storage/local.py` (SQLite)
- `backend/adapters/ai/local.py` (in-memory models)
- `backend/adapters/auth/local.py` (simple JWT)

### Step 4: Create Configuration System (1 hour)

1. Create `backend/config/settings.py`
2. Create `.env.development` file
3. Install dependencies:
```bash
pip install pydantic-settings python-jose[cryptography]
```

### Step 5: Create Adapter Factory (30 minutes)

Create `backend/adapters/factory.py` and `backend/adapters/dependencies.py`

### Step 6: Update Routes (2-3 hours)

Update each route file to use dependency injection:
- `backend/routes/beneficiaries.py`
- `backend/routes/complaints.py`
- `backend/routes/alerts.py`
- `backend/routes/analytics.py`

### Step 7: Update Frontend (1 hour)

1. Create `frontend/src/config.js`
2. Update `frontend/src/api.js`
3. Create `.env.development` in frontend

### Step 8: Test Everything (2-3 hours)

1. Test with local adapters
2. Verify all features work
3. Test adapter switching

---

## 📝 Minimal Working Example

### 1. Settings File

```python
# backend/config/settings.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    storage_adapter: str = "local"
    database_url: str = "sqlite:///./leakage_detection.db"
    ai_adapter: str = "local"
    auth_adapter: str = "local"
    jwt_secret_key: str = "dev-secret"
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()
```

### 2. Storage Adapter

```python
# backend/adapters/storage/base.py
from abc import ABC, abstractmethod

class StorageAdapter(ABC):
    @abstractmethod
    async def get(self, table: str, key: str):
        pass
    
    @abstractmethod
    async def put(self, table: str, item: dict):
        pass
```

### 3. Factory

```python
# backend/adapters/factory.py
from config.settings import Settings
from .storage.local import LocalStorageAdapter

class AdapterFactory:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._storage = None
    
    def get_storage_adapter(self):
        if self._storage is None:
            if self.settings.storage_adapter == 'local':
                self._storage = LocalStorageAdapter(
                    self.settings.database_url
                )
        return self._storage
```

### 4. Dependencies

```python
# backend/adapters/dependencies.py
from fastapi import Depends
from config.settings import get_settings
from .factory import AdapterFactory

_factory = None

def get_factory(settings = Depends(get_settings)):
    global _factory
    if _factory is None:
        _factory = AdapterFactory(settings)
    return _factory

def get_storage(factory = Depends(get_factory)):
    return factory.get_storage_adapter()
```

### 5. Updated Route

```python
# backend/routes/beneficiaries.py
from fastapi import APIRouter, Depends
from adapters.dependencies import get_storage

router = APIRouter()

@router.get("/beneficiaries/{id}")
async def get_beneficiary(
    id: str,
    storage = Depends(get_storage)
):
    return await storage.get("beneficiaries", id)
```

---

## 🧪 Testing Adapter Switching

### Test 1: Local Adapters (Development)

```bash
# .env
STORAGE_ADAPTER=local
AI_ADAPTER=local
AUTH_ADAPTER=local
DATABASE_URL=sqlite:///./leakage_detection.db
```

```bash
# Run backend
cd backend
python app.py
```

### Test 2: Cloud Adapters (Production - Stubs)

```bash
# .env
STORAGE_ADAPTER=cloud
AI_ADAPTER=remote
AUTH_ADAPTER=cognito
DYNAMODB_TABLE_PREFIX=leakage-detection
```

```bash
# Run backend - should show NotImplementedError with helpful messages
cd backend
python app.py
```

---

## ✅ Verification Checklist

### Backend
- [ ] Adapter interfaces created
- [ ] Local adapters implemented
- [ ] Configuration system working
- [ ] Factory pattern implemented
- [ ] Dependencies injected into routes
- [ ] No global state
- [ ] All operations async
- [ ] Health check endpoint added

### Frontend
- [ ] Environment configuration created
- [ ] API client uses environment URL
- [ ] No hardcoded localhost

### Testing
- [ ] All features work with local adapters
- [ ] Can switch adapters via environment
- [ ] Tests pass
- [ ] No errors in console

---

## 🎓 Key Concepts

### 1. Adapter Pattern
**Purpose:** Abstract away implementation details

**Example:**
```python
# Instead of:
db = sqlite3.connect("db.sqlite")

# Use:
storage = get_storage_adapter()  # Could be SQLite or DynamoDB
```

### 2. Dependency Injection
**Purpose:** Provide dependencies to functions

**Example:**
```python
# Instead of:
def get_user(id):
    db = get_db()  # Global function
    return db.query(...)

# Use:
def get_user(id, storage: StorageAdapter = Depends(get_storage)):
    return await storage.get("users", id)
```

### 3. Environment Configuration
**Purpose:** Different settings for different environments

**Example:**
```python
# Development
STORAGE_ADAPTER=local

# Production
STORAGE_ADAPTER=cloud
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Module not found"
**Solution:** Ensure all `__init__.py` files are created

### Issue 2: "Settings not loading"
**Solution:** Check `.env` file exists and is in correct location

### Issue 3: "Adapter not found"
**Solution:** Verify adapter name in settings matches factory

### Issue 4: "Database connection error"
**Solution:** Check database URL in settings

---

## 📚 Reference Documents

1. **AWS_INTEGRATION_PREPARATION.md** - Comprehensive guide
2. **CLOUD_READY_REFACTORING_ROADMAP.md** - Phase-by-phase plan
3. **ADAPTER_PATTERN_CODE_EXAMPLES.md** - Complete code examples
4. **AWS_PREPARATION_SUMMARY.md** - Executive summary

---

## 🎯 Success Criteria

You're ready for AWS integration when:

✅ All code uses adapter pattern
✅ No hardcoded configuration
✅ Backend is stateless
✅ All operations are async
✅ Can switch adapters via environment variable
✅ All tests pass
✅ Development experience is smooth

---

## 💡 Pro Tips

1. **Start Small:** Implement one adapter at a time
2. **Test Often:** Test after each change
3. **Keep It Simple:** Don't over-engineer
4. **Document:** Add comments explaining adapter pattern
5. **Ask Questions:** Review reference documents when stuck

---

## 🚦 Next Steps After Refactoring

1. **Code Review:** Team reviews refactored code
2. **Documentation:** Update README and docs
3. **AWS Setup:** Create AWS accounts and resources
4. **Cloud Adapters:** Implement DynamoDB, SageMaker, etc.
5. **Staging Deploy:** Deploy to AWS staging environment
6. **Testing:** Comprehensive testing in cloud
7. **Production:** Deploy to production

---

## 📞 Support

If you need help:
1. Check the reference documents
2. Review code examples
3. Test with local adapters first
4. Verify environment configuration

**Remember:** The goal is to make the code cloud-ready, not to implement AWS services yet. Focus on the adapter pattern and environment configuration first.
