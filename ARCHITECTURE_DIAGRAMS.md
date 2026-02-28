# Architecture Diagrams
## Visual Guide to Cloud-Ready Refactoring

---

## 1. Current Architecture (Before Refactoring)

```
┌───────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  API Client (api.js)                                │    │
│  │  const API_BASE_URL = 'http://localhost:8000'       │    │
│  │  ❌ Hardcoded URL                                    │    │
│  │  ❌ No authentication                                │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬───────────────────────────────────┘
                            │ HTTP
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI)                         │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  app.py                                             │    │
│  │  ❌ Global state: models loaded at startup          │    │
│  │  ❌ Direct database calls                           │    │
│  │  ❌ No dependency injection                         │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Routes                                             │    │
│  │  ❌ Direct model access                             │    │
│  │  ❌ No authentication checks                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  AI Models (in-memory)                              │    │
│  │  - AnomalyDetector()                                │    │
│  │  - DuplicateDetector()                              │    │
│  │  - RiskScorer()                                     │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  SQLite Database                                    │    │
│  │  leakage_detection.db                               │    │
│  │  ❌ Not scalable                                     │    │
│  │  ❌ Single instance only                            │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  NetworkX Graph (in-memory)                         │    │
│  │  ❌ Not persistent                                   │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘

PROBLEMS:
❌ Hardcoded configuration
❌ Global state (not Lambda-compatible)
❌ Direct dependencies (not testable)
❌ Not scalable
❌ No authentication
❌ Single backend implementation
```

---

## 2. Target Architecture (After Refactoring)

```
┌───────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  config.js                                          │    │
│  │  apiBaseUrl: process.env.REACT_APP_API_BASE_URL    │    │
│  │  ✅ Environment-based                                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  API Client (api.js)                                │    │
│  │  ✅ Uses config                                      │    │
│  │  ✅ Authentication support                           │    │
│  │  ✅ Error handling                                   │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬───────────────────────────────────┘
                            │ HTTP + JWT
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                     API LAYER (FastAPI)                       │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  app.py                                             │    │
│  │  ✅ Stateless                                        │    │
│  │  ✅ No global state                                  │    │
│  │  ✅ Health checks                                    │    │
│  │  ✅ Middleware (auth, logging, CORS)                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Routes (with Dependency Injection)                 │    │
│  │  ✅ Inject adapters                                  │    │
│  │  ✅ Authentication decorators                        │    │
│  │  ✅ Permission checks                                │    │
│  └─────────────────────────────────────────────────────┘    │
└───────────────────────────┬───────────────────────────────────┘
                            │
                            ▼
┌───────────────────────────────────────────────────────────────┐
│                     ADAPTER LAYER                             │
│                     (Abstraction)                             │
│                                                               │
│  ┌──────────────┬──────────────┬──────────────┬────────┐    │
│  │  Storage     │  AI Models   │  Auth        │  Graph │    │
│  │  Adapter     │  Adapter     │  Adapter     │ Adapter│    │
│  │              │              │              │        │    │
│  │  Interface   │  Interface   │  Interface   │Interface│   │
│  └──────────────┴──────────────┴──────────────┴────────┘    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Adapter Factory                                     │   │
│  │  - Reads environment configuration                   │   │
│  │  - Creates appropriate adapter                       │   │
│  │  - Manages adapter lifecycle                         │   │
│  └──────────────────────────────────────────────────────┘   │
└───────────────────────────┬───────────────────────────────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
┌───────────────────────────┐  ┌───────────────────────────┐
│   LOCAL ADAPTERS          │  │   CLOUD ADAPTERS          │
│   (Development)           │  │   (Production)            │
│                           │  │                           │
│  ┌─────────────────────┐ │  │  ┌─────────────────────┐ │
│  │ LocalStorageAdapter │ │  │  │ CloudStorageAdapter │ │
│  │ - SQLite            │ │  │  │ - DynamoDB          │ │
│  │ - Fast              │ │  │  │ - Scalable          │ │
│  │ - No cost           │ │  │  │ - Managed           │ │
│  └─────────────────────┘ │  │  └─────────────────────┘ │
│                           │  │                           │
│  ┌─────────────────────┐ │  │  ┌─────────────────────┐ │
│  │ LocalAIAdapter      │ │  │  │ RemoteAIAdapter     │ │
│  │ - In-memory models  │ │  │  │ - SageMaker         │ │
│  │ - Fast inference    │ │  │  │ - Auto-scaling      │ │
│  └─────────────────────┘ │  │  └─────────────────────┘ │
│                           │  │                           │
│  ┌─────────────────────┐ │  │  ┌─────────────────────┐ │
│  │ LocalAuthAdapter    │ │  │  │ CognitoAuthAdapter  │ │
│  │ - Simple JWT        │ │  │  │ - AWS Cognito       │ │
│  │ - Mock users        │ │  │  │ - MFA support       │ │
│  └─────────────────────┘ │  │  └─────────────────────┘ │
│                           │  │                           │
│  ┌─────────────────────┐ │  │  ┌─────────────────────┐ │
│  │ LocalGraphAdapter   │ │  │  │ NeptuneGraphAdapter │ │
│  │ - NetworkX          │ │  │  │ - AWS Neptune       │ │
│  │ - In-memory         │ │  │  │ - Gremlin queries   │ │
│  └─────────────────────┘ │  │  └─────────────────────┘ │
└───────────────────────────┘  └───────────────────────────┘

BENEFITS:
✅ Environment-driven configuration
✅ Stateless (Lambda-compatible)
✅ Testable (mock adapters)
✅ Scalable (cloud adapters)
✅ Flexible (switch via env var)
✅ Maintainable (clear separation)
```

---

## 3. Adapter Pattern Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. REQUEST ARRIVES                                     │
│                                                         │
│  GET /api/v1/beneficiaries/BEN123456                   │
│  Authorization: Bearer <token>                         │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  2. FASTAPI DEPENDENCY INJECTION                        │
│                                                         │
│  @router.get("/beneficiaries/{id}")                    │
│  async def get_beneficiary(                            │
│      id: str,                                          │
│      storage = Depends(get_storage),    ◄─────┐       │
│      auth = Depends(get_auth),          ◄─────┤       │
│      user = Depends(get_current_user)   ◄─────┤       │
│  ):                                            │       │
└────────────────────┬───────────────────────────┼───────┘
                     │                           │
                     ▼                           │
┌─────────────────────────────────────────────────────────┐
│  3. ADAPTER FACTORY                            │       │
│                                                │       │
│  def get_storage():                            │       │
│      settings = get_settings()                 │       │
│      factory = AdapterFactory(settings)        │       │
│                                                │       │
│      if settings.storage_adapter == 'local':   │       │
│          return LocalStorageAdapter()  ────────┘       │
│      elif settings.storage_adapter == 'cloud':         │
│          return CloudStorageAdapter()                  │
└────────────────────┬───────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  4. ADAPTER EXECUTES                                    │
│                                                         │
│  storage.get("beneficiaries", "BEN123456")             │
│                                                         │
│  IF LOCAL:                                             │
│    → SQLite query                                      │
│    → Return dict                                       │
│                                                         │
│  IF CLOUD:                                             │
│    → DynamoDB GetItem                                  │
│    → Return dict                                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  5. RESPONSE RETURNED                                   │
│                                                         │
│  {                                                      │
│    "id": "BEN123456",                                  │
│    "name": "John Doe",                                 │
│    "risk_score": 0.85                                  │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 4. Configuration Flow

```
┌─────────────────────────────────────────────────────────┐
│  ENVIRONMENT FILES                                      │
│                                                         │
│  .env.development          .env.production             │
│  ┌──────────────────┐     ┌──────────────────┐        │
│  │ STORAGE=local    │     │ STORAGE=cloud    │        │
│  │ AI=local         │     │ AI=remote        │        │
│  │ AUTH=local       │     │ AUTH=cognito     │        │
│  └──────────────────┘     └──────────────────┘        │
└────────────────────┬───────────────┬──────────────────┘
                     │               │
                     ▼               ▼
┌─────────────────────────────────────────────────────────┐
│  SETTINGS LOADER (Pydantic)                             │
│                                                         │
│  class Settings(BaseSettings):                         │
│      storage_adapter: str                              │
│      ai_adapter: str                                   │
│      auth_adapter: str                                 │
│                                                         │
│      class Config:                                     │
│          env_file = ".env"                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  ADAPTER FACTORY                                        │
│                                                         │
│  if settings.storage_adapter == 'local':               │
│      return LocalStorageAdapter()                      │
│  elif settings.storage_adapter == 'cloud':             │
│      return CloudStorageAdapter()                      │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────┐          ┌──────────────┐
│   LOCAL      │          │   CLOUD      │
│   ADAPTER    │          │   ADAPTER    │
└──────────────┘          └──────────────┘
```

---

## 5. Dependency Injection Pattern

```
WITHOUT DEPENDENCY INJECTION (❌ Bad)
┌─────────────────────────────────────────────────────────┐
│  Route Handler                                          │
│                                                         │
│  @app.get("/beneficiaries/{id}")                       │
│  async def get_beneficiary(id: str):                   │
│      db = get_db()              ◄── Global function    │
│      model = get_model()        ◄── Global function    │
│      return db.query(...)                              │
│                                                         │
│  PROBLEMS:                                             │
│  - Hard to test (can't mock)                           │
│  - Hard to change implementation                       │
│  - Tight coupling                                      │
└─────────────────────────────────────────────────────────┘

WITH DEPENDENCY INJECTION (✅ Good)
┌─────────────────────────────────────────────────────────┐
│  Route Handler                                          │
│                                                         │
│  @app.get("/beneficiaries/{id}")                       │
│  async def get_beneficiary(                            │
│      id: str,                                          │
│      storage = Depends(get_storage),  ◄── Injected    │
│      ai = Depends(get_ai_adapter)     ◄── Injected    │
│  ):                                                     │
│      return await storage.get("beneficiaries", id)     │
│                                                         │
│  BENEFITS:                                             │
│  - Easy to test (inject mocks)                         │
│  - Easy to change (swap adapters)                      │
│  - Loose coupling                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Testing Strategy

```
┌─────────────────────────────────────────────────────────┐
│  UNIT TESTS                                             │
│                                                         │
│  Test each adapter independently                       │
│                                                         │
│  def test_local_storage_adapter():                     │
│      adapter = LocalStorageAdapter("test.db")          │
│      result = await adapter.get("users", "123")        │
│      assert result["id"] == "123"                      │
│                                                         │
│  ✅ Fast                                                 │
│  ✅ No external dependencies                            │
│  ✅ Isolated                                            │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  INTEGRATION TESTS                                      │
│                                                         │
│  Test with real adapters                               │
│                                                         │
│  def test_get_beneficiary_endpoint():                  │
│      # Uses local adapters                             │
│      response = client.get("/beneficiaries/123")       │
│      assert response.status_code == 200                │
│                                                         │
│  ✅ Tests full flow                                     │
│  ✅ Uses local adapters (fast)                          │
│  ✅ No AWS costs                                        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  CLOUD TESTS (Staging)                                  │
│                                                         │
│  Test with cloud adapters                              │
│                                                         │
│  def test_cloud_storage():                             │
│      # Uses DynamoDB                                   │
│      adapter = CloudStorageAdapter(...)                │
│      result = await adapter.get("users", "123")        │
│                                                         │
│  ✅ Tests cloud integration                             │
│  ✅ Validates AWS setup                                 │
│  ⚠️  Requires AWS resources                             │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Deployment Environments

```
┌─────────────────────────────────────────────────────────┐
│  DEVELOPMENT                                            │
│  (Local Machine)                                        │
│                                                         │
│  Environment: .env.development                         │
│  Adapters: All local                                   │
│  Database: SQLite                                      │
│  AI Models: In-memory                                  │
│  Auth: Simple JWT                                      │
│  Cost: $0                                              │
│                                                         │
│  Use for:                                              │
│  - Feature development                                 │
│  - Unit testing                                        │
│  - Rapid iteration                                     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  STAGING                                                │
│  (AWS - Test Environment)                              │
│                                                         │
│  Environment: .env.staging                             │
│  Adapters: Mix of local and cloud                      │
│  Database: DynamoDB (small tables)                     │
│  AI Models: SageMaker (small instances)                │
│  Auth: Cognito (test pool)                             │
│  Cost: ~$500/month                                     │
│                                                         │
│  Use for:                                              │
│  - Integration testing                                 │
│  - Cloud adapter validation                            │
│  - Performance testing                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  PRODUCTION                                             │
│  (AWS - Live System)                                   │
│                                                         │
│  Environment: .env.production                          │
│  Adapters: All cloud                                   │
│  Database: DynamoDB (auto-scaling)                     │
│  AI Models: SageMaker (production endpoints)           │
│  Auth: Cognito (production pool)                       │
│  Cost: ~$50,000/month (national scale)                │
│                                                         │
│  Use for:                                              │
│  - Live traffic                                        │
│  - Real users                                          │
│  - Production workloads                                │
└─────────────────────────────────────────────────────────┘
```

---

## Summary

These diagrams illustrate the transformation from a monolithic local application to a cloud-ready, modular architecture using the adapter pattern. The key insight is that the same business logic works with both local and cloud adapters, controlled entirely by environment configuration.
