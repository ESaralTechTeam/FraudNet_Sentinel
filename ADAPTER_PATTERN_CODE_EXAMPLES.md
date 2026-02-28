# Adapter Pattern Code Examples
## Complete Implementation Reference

---

## 1. Storage Adapter

### Base Interface

```python
# backend/adapters/storage/base.py
from abc import ABC, abstractmethod
from typing import Dict, List, Optional

class StorageAdapter(ABC):
    """Base interface for storage operations"""
    
    @abstractmethod
    async def get(self, table: str, key: str) -> Optional[Dict]:
        """Get a single item by key"""
        pass
    
    @abstractmethod
    async def put(self, table: str, item: Dict) -> str:
        """Create or update an item, returns ID"""
        pass
    
    @abstractmethod
    async def query(self, table: str, filters: Dict, limit: int = 100) -> List[Dict]:
        """Query items with filters"""
        pass
    
    @abstractmethod
    async def delete(self, table: str, key: str) -> bool:
        """Delete an item"""
        pass
    
    @abstractmethod
    async def scan(self, table: str, limit: int = 100) -> List[Dict]:
        """Scan all items in table"""
        pass
```

### Local Implementation (SQLite)

```python
# backend/adapters/storage/local.py
import sqlite3
import json
from typing import Dict, List, Optional
from .base import StorageAdapter

class LocalStorageAdapter(StorageAdapter):
    """SQLite implementation for local development"""
    
    def __init__(self, database_url: str):
        self.database_url = database_url.replace('sqlite:///', '')
        self._init_connection()
    
    def _init_connection(self):
        """Initialize database connection"""
        self.conn = sqlite3.connect(self.database_url, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
    
    async def get(self, table: str, key: str) -> Optional[Dict]:
        """Get item by ID"""
        cursor = self.conn.cursor()
        cursor.execute(f"SELECT * FROM {table} WHERE id = ?", (key,))
        row = cursor.fetchone()
        return dict(row) if row else None
    
    async def put(self, table: str, item: Dict) -> str:
        """Insert or update item"""
        cursor = self.conn.cursor()
        
        # Check if exists
        existing = await self.get(table, item.get('id', ''))
        
        if existing:
            # Update
            set_clause = ', '.join([f"{k} = ?" for k in item.keys() if k != 'id'])
            values = [v for k, v in item.items() if k != 'id']
            values.append(item['id'])
            cursor.execute(f"UPDATE {table} SET {set_clause} WHERE id = ?", values)
        else:
            # Insert
            columns = ', '.join(item.keys())
            placeholders = ', '.join(['?' for _ in item])
            cursor.execute(
                f"INSERT INTO {table} ({columns}) VALUES ({placeholders})",
                list(item.values())
            )
        
        self.conn.commit()
        return item.get('id', str(cursor.lastrowid))
    
    async def query(self, table: str, filters: Dict, limit: int = 100) -> List[Dict]:
        """Query with filters"""
        cursor = self.conn.cursor()
        
        where_clause = ' AND '.join([f"{k} = ?" for k in filters.keys()])
        query = f"SELECT * FROM {table}"
        
        if where_clause:
            query += f" WHERE {where_clause}"
        
        query += f" LIMIT {limit}"
        
        cursor.execute(query, list(filters.values()))
        return [dict(row) for row in cursor.fetchall()]
    
    async def delete(self, table: str, key: str) -> bool:
        """Delete item"""
        cursor = self.conn.cursor()
        cursor.execute(f"DELETE FROM {table} WHERE id = ?", (key,))
        self.conn.commit()
        return cursor.rowcount > 0
    
    async def scan(self, table: str, limit: int = 100) -> List[Dict]:
        """Scan all items"""
        cursor = self.conn.cursor()
        cursor.execute(f"SELECT * FROM {table} LIMIT {limit}")
        return [dict(row) for row in cursor.fetchall()]
```


### Cloud Implementation (DynamoDB Stub)

```python
# backend/adapters/storage/cloud.py
from typing import Dict, List, Optional
from .base import StorageAdapter

class CloudStorageAdapter(StorageAdapter):
    """DynamoDB implementation for production (stub)"""
    
    def __init__(self, table_prefix: str, region: str):
        self.table_prefix = table_prefix
        self.region = region
        # TODO: Initialize boto3 DynamoDB client
        # self.dynamodb = boto3.resource('dynamodb', region_name=region)
    
    async def get(self, table: str, key: str) -> Optional[Dict]:
        """Get item from DynamoDB"""
        raise NotImplementedError(
            "DynamoDB adapter not yet implemented. "
            "Required: boto3, AWS credentials, DynamoDB tables created"
        )
    
    async def put(self, table: str, item: Dict) -> str:
        """Put item to DynamoDB"""
        raise NotImplementedError("DynamoDB adapter not yet implemented")
    
    async def query(self, table: str, filters: Dict, limit: int = 100) -> List[Dict]:
        """Query DynamoDB"""
        raise NotImplementedError("DynamoDB adapter not yet implemented")
    
    async def delete(self, table: str, key: str) -> bool:
        """Delete from DynamoDB"""
        raise NotImplementedError("DynamoDB adapter not yet implemented")
    
    async def scan(self, table: str, limit: int = 100) -> List[Dict]:
        """Scan DynamoDB table"""
        raise NotImplementedError("DynamoDB adapter not yet implemented")
```

---

## 2. AI Model Adapter

### Base Interface

```python
# backend/adapters/ai/base.py
from abc import ABC, abstractmethod
from typing import Dict, List

class AIModelAdapter(ABC):
    """Base interface for AI model inference"""
    
    @abstractmethod
    async def predict(self, model_name: str, features: Dict) -> Dict:
        """Single prediction"""
        pass
    
    @abstractmethod
    async def batch_predict(self, model_name: str, features: List[Dict]) -> List[Dict]:
        """Batch predictions"""
        pass
    
    @abstractmethod
    def get_model_info(self, model_name: str) -> Dict:
        """Get model metadata"""
        pass
```

### Local Implementation

```python
# backend/adapters/ai/local.py
from typing import Dict, List
from .base import AIModelAdapter
from ai_models.anomaly_detector import AnomalyDetector
from ai_models.duplicate_detector import DuplicateDetector
from ai_models.risk_scorer import RiskScorer

class LocalAIAdapter(AIModelAdapter):
    """In-memory model implementation for local development"""
    
    def __init__(self):
        # Lazy load models
        self._models = {}
        self._model_classes = {
            'anomaly_detector': AnomalyDetector,
            'duplicate_detector': DuplicateDetector,
            'risk_scorer': RiskScorer,
        }
    
    def _get_model(self, model_name: str):
        """Lazy load model"""
        if model_name not in self._models:
            if model_name not in self._model_classes:
                raise ValueError(f"Unknown model: {model_name}")
            self._models[model_name] = self._model_classes[model_name]()
        return self._models[model_name]
    
    async def predict(self, model_name: str, features: Dict) -> Dict:
        """Run prediction"""
        model = self._get_model(model_name)
        
        if model_name == 'anomaly_detector':
            return model.predict(features)
        elif model_name == 'duplicate_detector':
            return model.check_duplicate(features, [])
        elif model_name == 'risk_scorer':
            return {
                'risk_score': model.calculate_risk_score(features),
                'risk_category': model.categorize_risk(features.get('risk_score', 0)),
                'explanation': model.explain_risk(features)
            }
        
        raise ValueError(f"Unknown model: {model_name}")
    
    async def batch_predict(self, model_name: str, features: List[Dict]) -> List[Dict]:
        """Batch predictions"""
        results = []
        for feature in features:
            result = await self.predict(model_name, feature)
            results.append(result)
        return results
    
    def get_model_info(self, model_name: str) -> Dict:
        """Get model metadata"""
        return {
            'model_name': model_name,
            'type': 'local',
            'version': '1.0.0',
            'status': 'loaded'
        }
```


### Remote Implementation (SageMaker Stub)

```python
# backend/adapters/ai/remote.py
from typing import Dict, List
from .base import AIModelAdapter

class RemoteAIAdapter(AIModelAdapter):
    """SageMaker endpoint implementation (stub)"""
    
    def __init__(self, endpoints: Dict[str, str], region: str):
        self.endpoints = endpoints
        self.region = region
        # TODO: Initialize boto3 SageMaker runtime client
        # self.sagemaker = boto3.client('sagemaker-runtime', region_name=region)
    
    async def predict(self, model_name: str, features: Dict) -> Dict:
        """Invoke SageMaker endpoint"""
        raise NotImplementedError(
            f"SageMaker adapter not yet implemented. "
            f"Required: boto3, SageMaker endpoint for {model_name}"
        )
    
    async def batch_predict(self, model_name: str, features: List[Dict]) -> List[Dict]:
        """Batch transform job"""
        raise NotImplementedError("SageMaker batch transform not yet implemented")
    
    def get_model_info(self, model_name: str) -> Dict:
        """Get endpoint info"""
        return {
            'model_name': model_name,
            'type': 'remote',
            'endpoint': self.endpoints.get(model_name, 'not_configured'),
            'status': 'stub'
        }
```

---

## 3. Authentication Adapter

### Base Interface

```python
# backend/adapters/auth/base.py
from abc import ABC, abstractmethod
from typing import Dict, Optional

class AuthAdapter(ABC):
    """Base interface for authentication"""
    
    @abstractmethod
    async def authenticate(self, credentials: Dict) -> Dict:
        """Authenticate user, return tokens"""
        pass
    
    @abstractmethod
    async def validate_token(self, token: str) -> Optional[Dict]:
        """Validate token, return user info"""
        pass
    
    @abstractmethod
    async def refresh_token(self, refresh_token: str) -> Dict:
        """Refresh access token"""
        pass
    
    @abstractmethod
    async def check_permission(self, user: Dict, resource: str, action: str) -> bool:
        """Check if user has permission"""
        pass
```

### Local Implementation (Simple JWT)

```python
# backend/adapters/auth/local.py
from datetime import datetime, timedelta
from typing import Dict, Optional
import jwt
from .base import AuthAdapter

class LocalAuthAdapter(AuthAdapter):
    """Simple JWT implementation for local development"""
    
    def __init__(self, secret_key: str, algorithm: str = "HS256"):
        self.secret_key = secret_key
        self.algorithm = algorithm
        self.expiration_minutes = 60
        
        # Mock users for development
        self.users = {
            'officer@example.com': {
                'id': 'OFF123',
                'email': 'officer@example.com',
                'password': 'password123',  # In real app, hash this
                'role': 'district_officer',
                'district': 'District1'
            }
        }
    
    async def authenticate(self, credentials: Dict) -> Dict:
        """Authenticate with email/password"""
        email = credentials.get('email')
        password = credentials.get('password')
        
        user = self.users.get(email)
        if not user or user['password'] != password:
            raise ValueError("Invalid credentials")
        
        # Generate tokens
        access_token = self._generate_token(user)
        refresh_token = self._generate_token(user, expiration_days=7)
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer',
            'expires_in': self.expiration_minutes * 60
        }
    
    async def validate_token(self, token: str) -> Optional[Dict]:
        """Validate JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    async def refresh_token(self, refresh_token: str) -> Dict:
        """Refresh access token"""
        user = await self.validate_token(refresh_token)
        if not user:
            raise ValueError("Invalid refresh token")
        
        access_token = self._generate_token(user)
        return {
            'access_token': access_token,
            'token_type': 'Bearer',
            'expires_in': self.expiration_minutes * 60
        }
    
    async def check_permission(self, user: Dict, resource: str, action: str) -> bool:
        """Simple role-based permission check"""
        role = user.get('role')
        
        # Simple permission logic
        if role == 'admin':
            return True
        
        if role == 'district_officer':
            if resource in ['beneficiaries', 'alerts', 'cases']:
                return action in ['read', 'write']
        
        if role == 'citizen':
            if resource == 'complaints':
                return action in ['read', 'write']
        
        return False
    
    def _generate_token(self, user: Dict, expiration_days: int = None) -> str:
        """Generate JWT token"""
        expiration = datetime.utcnow() + timedelta(
            days=expiration_days if expiration_days else 0,
            minutes=self.expiration_minutes if not expiration_days else 0
        )
        
        payload = {
            'user_id': user['id'],
            'email': user['email'],
            'role': user['role'],
            'exp': expiration
        }
        
        return jwt.encode(payload, self.secret_key, algorithm=self.algorithm)
```


---

## 4. Adapter Factory

```python
# backend/adapters/factory.py
from config.settings import Settings
from .storage.local import LocalStorageAdapter
from .storage.cloud import CloudStorageAdapter
from .ai.local import LocalAIAdapter
from .ai.remote import RemoteAIAdapter
from .auth.local import LocalAuthAdapter
from .auth.cognito import CognitoAuthAdapter

class AdapterFactory:
    """Factory for creating adapters based on configuration"""
    
    def __init__(self, settings: Settings):
        self.settings = settings
        self._storage = None
        self._ai = None
        self._auth = None
    
    def get_storage_adapter(self):
        """Get storage adapter based on configuration"""
        if self._storage is None:
            if self.settings.storage_adapter == 'local':
                self._storage = LocalStorageAdapter(self.settings.database_url)
            elif self.settings.storage_adapter == 'cloud':
                self._storage = CloudStorageAdapter(
                    table_prefix=self.settings.dynamodb_table_prefix,
                    region=self.settings.aws_region
                )
            else:
                raise ValueError(f"Unknown storage adapter: {self.settings.storage_adapter}")
        
        return self._storage
    
    def get_ai_adapter(self):
        """Get AI adapter based on configuration"""
        if self._ai is None:
            if self.settings.ai_adapter == 'local':
                self._ai = LocalAIAdapter()
            elif self.settings.ai_adapter == 'remote':
                self._ai = RemoteAIAdapter(
                    endpoints=self.settings.sagemaker_endpoints,
                    region=self.settings.aws_region
                )
            else:
                raise ValueError(f"Unknown AI adapter: {self.settings.ai_adapter}")
        
        return self._ai
    
    def get_auth_adapter(self):
        """Get auth adapter based on configuration"""
        if self._auth is None:
            if self.settings.auth_adapter == 'local':
                self._auth = LocalAuthAdapter(
                    secret_key=self.settings.jwt_secret_key,
                    algorithm=self.settings.jwt_algorithm
                )
            elif self.settings.auth_adapter == 'cognito':
                self._auth = CognitoAuthAdapter(
                    user_pool_id=self.settings.cognito_user_pool_id,
                    client_id=self.settings.cognito_client_id,
                    region=self.settings.aws_region
                )
            else:
                raise ValueError(f"Unknown auth adapter: {self.settings.auth_adapter}")
        
        return self._auth
```

---

## 5. FastAPI Dependencies

```python
# backend/adapters/dependencies.py
from fastapi import Depends, HTTPException, Header
from typing import Optional
from config.settings import get_settings, Settings
from .factory import AdapterFactory

# Global factory instance
_factory = None

def get_factory(settings: Settings = Depends(get_settings)) -> AdapterFactory:
    """Get or create adapter factory"""
    global _factory
    if _factory is None:
        _factory = AdapterFactory(settings)
    return _factory

def get_storage(factory: AdapterFactory = Depends(get_factory)):
    """Dependency for storage adapter"""
    return factory.get_storage_adapter()

def get_ai_adapter(factory: AdapterFactory = Depends(get_factory)):
    """Dependency for AI adapter"""
    return factory.get_ai_adapter()

def get_auth_adapter(factory: AdapterFactory = Depends(get_factory)):
    """Dependency for auth adapter"""
    return factory.get_auth_adapter()

async def get_current_user(
    authorization: Optional[str] = Header(None),
    auth_adapter = Depends(get_auth_adapter)
):
    """Dependency for getting current authenticated user"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        scheme, token = authorization.split()
        if scheme.lower() != 'bearer':
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        
        user = await auth_adapter.validate_token(token)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        return user
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")

def require_permission(resource: str, action: str):
    """Dependency factory for permission checking"""
    async def permission_checker(
        current_user = Depends(get_current_user),
        auth_adapter = Depends(get_auth_adapter)
    ):
        has_permission = await auth_adapter.check_permission(
            current_user, resource, action
        )
        if not has_permission:
            raise HTTPException(
                status_code=403,
                detail=f"Permission denied: {action} on {resource}"
            )
        return current_user
    
    return permission_checker
```

---

## 6. Configuration Settings

```python
# backend/config/settings.py
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Dict

class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    app_env: str = "development"
    app_name: str = "economic-leakage-detection"
    app_version: str = "1.0.0"
    log_level: str = "INFO"
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # Storage
    storage_adapter: str = "local"
    database_url: str = "sqlite:///./leakage_detection.db"
    dynamodb_table_prefix: str = "leakage-detection"
    
    # AI Models
    ai_adapter: str = "local"
    sagemaker_endpoints: Dict[str, str] = {}
    
    # Authentication
    auth_adapter: str = "local"
    jwt_secret_key: str = "dev-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    cognito_user_pool_id: str = ""
    cognito_client_id: str = ""
    
    # AWS
    aws_region: str = "ap-south-1"
    
    # CORS
    cors_origins: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
```

---

## 7. Updated Route Example

```python
# backend/routes/beneficiaries.py
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict
from adapters.dependencies import (
    get_storage,
    get_ai_adapter,
    get_current_user,
    require_permission
)
from adapters.storage.base import StorageAdapter
from adapters.ai.base import AIModelAdapter

router = APIRouter()

@router.get("/beneficiaries/{beneficiary_id}")
async def get_beneficiary(
    beneficiary_id: str,
    storage: StorageAdapter = Depends(get_storage),
    current_user: Dict = Depends(require_permission("beneficiaries", "read"))
):
    """Get beneficiary details"""
    beneficiary = await storage.get("beneficiaries", beneficiary_id)
    
    if not beneficiary:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    
    return beneficiary

@router.get("/beneficiaries/{beneficiary_id}/risk")
async def get_risk_assessment(
    beneficiary_id: str,
    storage: StorageAdapter = Depends(get_storage),
    ai_adapter: AIModelAdapter = Depends(get_ai_adapter),
    current_user: Dict = Depends(require_permission("beneficiaries", "read"))
):
    """Get risk assessment for beneficiary"""
    # Get beneficiary data
    beneficiary = await storage.get("beneficiaries", beneficiary_id)
    if not beneficiary:
        raise HTTPException(status_code=404, detail="Beneficiary not found")
    
    # Calculate risk score using AI adapter
    risk_result = await ai_adapter.predict("risk_scorer", beneficiary)
    
    return {
        "beneficiary_id": beneficiary_id,
        "risk_score": risk_result.get("risk_score"),
        "risk_category": risk_result.get("risk_category"),
        "explanation": risk_result.get("explanation")
    }
```

This demonstrates the complete adapter pattern implementation with dependency injection, making the code cloud-ready and testable.
