import boto3
import json
import os
from datetime import datetime
from typing import List, Dict, Optional
from decimal import Decimal
from boto3.dynamodb.conditions import Key, Attr

# DynamoDB client
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))

# Table names from environment or defaults
BENEFICIARIES_TABLE = os.environ.get('BENEFICIARIES_TABLE', 'beneficiaries')
COMPLAINTS_TABLE = os.environ.get('COMPLAINTS_TABLE', 'complaints')
RISK_SCORES_TABLE = os.environ.get('RISK_SCORES_TABLE', 'risk_scores')
ALERTS_TABLE = os.environ.get('ALERTS_TABLE', 'alerts')

# Helper function to convert float to Decimal for DynamoDB
def float_to_decimal(obj):
    if isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {k: float_to_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [float_to_decimal(i) for i in obj]
    return obj

# Helper function to convert Decimal to float for JSON serialization
def decimal_to_float(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: decimal_to_float(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_float(i) for i in obj]
    return obj

def init_db():
    """Initialize DynamoDB tables if they don't exist"""
    try:
        client = boto3.client('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
        
        # Check if tables exist
        existing_tables = client.list_tables()['TableNames']
        
        # Create beneficiaries table
        if BENEFICIARIES_TABLE not in existing_tables:
            client.create_table(
                TableName=BENEFICIARIES_TABLE,
                KeySchema=[
                    {'AttributeName': 'beneficiary_id', 'KeyType': 'HASH'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'beneficiary_id', 'AttributeType': 'S'},
                    {'AttributeName': 'district', 'AttributeType': 'S'},
                    {'AttributeName': 'risk_score', 'AttributeType': 'N'}
                ],
                GlobalSecondaryIndexes=[
                    {
                        'IndexName': 'district-index',
                        'KeySchema': [
                            {'AttributeName': 'district', 'KeyType': 'HASH'}
                        ],
                        'Projection': {'ProjectionType': 'ALL'},
                        'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
                    },
                    {
                        'IndexName': 'risk-score-index',
                        'KeySchema': [
                            {'AttributeName': 'risk_score', 'KeyType': 'HASH'}
                        ],
                        'Projection': {'ProjectionType': 'ALL'},
                        'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
                    }
                ],
                ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            )
            print(f"✅ Created table: {BENEFICIARIES_TABLE}")
        
        # Create complaints table
        if COMPLAINTS_TABLE not in existing_tables:
            client.create_table(
                TableName=COMPLAINTS_TABLE,
                KeySchema=[
                    {'AttributeName': 'complaint_id', 'KeyType': 'HASH'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'complaint_id', 'AttributeType': 'S'},
                    {'AttributeName': 'status', 'AttributeType': 'S'},
                    {'AttributeName': 'created_at', 'AttributeType': 'S'}
                ],
                GlobalSecondaryIndexes=[
                    {
                        'IndexName': 'status-created-index',
                        'KeySchema': [
                            {'AttributeName': 'status', 'KeyType': 'HASH'},
                            {'AttributeName': 'created_at', 'KeyType': 'RANGE'}
                        ],
                        'Projection': {'ProjectionType': 'ALL'},
                        'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
                    }
                ],
                ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            )
            print(f"✅ Created table: {COMPLAINTS_TABLE}")
        
        # Create risk_scores table
        if RISK_SCORES_TABLE not in existing_tables:
            client.create_table(
                TableName=RISK_SCORES_TABLE,
                KeySchema=[
                    {'AttributeName': 'beneficiary_id', 'KeyType': 'HASH'},
                    {'AttributeName': 'timestamp', 'KeyType': 'RANGE'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'beneficiary_id', 'AttributeType': 'S'},
                    {'AttributeName': 'timestamp', 'AttributeType': 'S'}
                ],
                ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            )
            print(f"✅ Created table: {RISK_SCORES_TABLE}")
        
        # Create alerts table
        if ALERTS_TABLE not in existing_tables:
            client.create_table(
                TableName=ALERTS_TABLE,
                KeySchema=[
                    {'AttributeName': 'alert_id', 'KeyType': 'HASH'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'alert_id', 'AttributeType': 'S'},
                    {'AttributeName': 'severity', 'AttributeType': 'S'},
                    {'AttributeName': 'created_at', 'AttributeType': 'S'}
                ],
                GlobalSecondaryIndexes=[
                    {
                        'IndexName': 'severity-created-index',
                        'KeySchema': [
                            {'AttributeName': 'severity', 'KeyType': 'HASH'},
                            {'AttributeName': 'created_at', 'KeyType': 'RANGE'}
                        ],
                        'Projection': {'ProjectionType': 'ALL'},
                        'ProvisionedThroughput': {'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
                    }
                ],
                ProvisionedThroughput={'ReadCapacityUnits': 5, 'WriteCapacityUnits': 5}
            )
            print(f"✅ Created table: {ALERTS_TABLE}")
        
        print("✅ DynamoDB tables initialized")
        
    except Exception as e:
        print(f"⚠️ DynamoDB initialization: {str(e)}")


# -----------------------------
# Beneficiary DB Operations
# -----------------------------
class BeneficiaryDB:
    
    @staticmethod
    def create(data: dict) -> str:
        """Create a new beneficiary"""
        table = dynamodb.Table(BENEFICIARIES_TABLE)
        
        beneficiary_id = f"BEN{datetime.now().strftime('%Y%m%d%H%M%S%f')[:17]}"
        
        import hashlib
        bank_hash = hashlib.sha256(data['bank_account'].encode()).hexdigest()[:16]
        
        item = {
            'beneficiary_id': beneficiary_id,
            'name': data['name'],
            'date_of_birth': data.get('date_of_birth', ''),
            'gender': data.get('gender', ''),
            'address': data.get('address', ''),
            'phone': data.get('phone', ''),
            'bank_account_hash': bank_hash,
            'district': data.get('district', ''),
            'scheme': data.get('scheme', ''),
            'amount': float_to_decimal(data.get('amount', 0)),
            'risk_score': Decimal('0.0'),
            'risk_category': 'low',
            'is_duplicate': False,
            'is_flagged': False,
            'created_at': datetime.now().isoformat()
        }
        
        table.put_item(Item=item)
        return beneficiary_id
    
    @staticmethod
    def get(beneficiary_id: str) -> Optional[Dict]:
        """Get beneficiary by ID"""
        table = dynamodb.Table(BENEFICIARIES_TABLE)
        
        response = table.get_item(Key={'beneficiary_id': beneficiary_id})
        
        if 'Item' in response:
            return decimal_to_float(response['Item'])
        return None
    
    @staticmethod
    def get_all() -> List[Dict]:
        """Get all beneficiaries"""
        table = dynamodb.Table(BENEFICIARIES_TABLE)
        
        response = table.scan()
        items = response.get('Items', [])
        
        # Handle pagination
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response.get('Items', []))
        
        return [decimal_to_float(item) for item in items]
    
    @staticmethod
    def update_risk(beneficiary_id: str, risk_score: float, risk_category: str, is_duplicate: bool):
        """Update risk assessment for beneficiary"""
        table = dynamodb.Table(BENEFICIARIES_TABLE)
        
        table.update_item(
            Key={'beneficiary_id': beneficiary_id},
            UpdateExpression='SET risk_score = :rs, risk_category = :rc, is_duplicate = :dup, is_flagged = :flag',
            ExpressionAttributeValues={
                ':rs': Decimal(str(risk_score)),
                ':rc': risk_category,
                ':dup': is_duplicate,
                ':flag': True
            }
        )
    
    @staticmethod
    def delete(beneficiary_id: str) -> bool:
        """Delete a beneficiary"""
        table = dynamodb.Table(BENEFICIARIES_TABLE)
        
        try:
            table.delete_item(Key={'beneficiary_id': beneficiary_id})
            return True
        except Exception:
            return False
    
    @staticmethod
    def query_by_district(district: str) -> List[Dict]:
        """Query beneficiaries by district"""
        table = dynamodb.Table(BENEFICIARIES_TABLE)
        
        response = table.query(
            IndexName='district-index',
            KeyConditionExpression=Key('district').eq(district)
        )
        
        return [decimal_to_float(item) for item in response.get('Items', [])]


# -----------------------------
# Complaint DB Operations
# -----------------------------
class ComplaintDB:
    
    @staticmethod
    def create(data: dict) -> str:
        """Create a new complaint"""
        table = dynamodb.Table(COMPLAINTS_TABLE)
        
        complaint_id = f"CMP{datetime.now().strftime('%Y%m%d%H%M%S%f')[:17]}"
        
        item = {
            'complaint_id': complaint_id,
            'complaint_type': data.get('complaint_type', ''),
            'status': 'submitted',
            'description': data.get('description', ''),
            'subject_beneficiary_id': data.get('subject_beneficiary_id', ''),
            'location': json.dumps(data.get('location', {})),
            'urgency_score': float_to_decimal(data.get('urgency_score', 0.5)),
            'sentiment_score': float_to_decimal(data.get('sentiment_score', 0.0)),
            'submitter_name': data.get('submitter_name', ''),
            'submitter_phone': data.get('submitter_phone', ''),
            'is_anonymous': data.get('is_anonymous', False),
            'created_at': datetime.now().isoformat()
        }
        
        table.put_item(Item=item)
        return complaint_id
    
    @staticmethod
    def get(complaint_id: str) -> Optional[Dict]:
        """Get complaint by ID"""
        table = dynamodb.Table(COMPLAINTS_TABLE)
        
        response = table.get_item(Key={'complaint_id': complaint_id})
        
        if 'Item' in response:
            return decimal_to_float(response['Item'])
        return None
    
    @staticmethod
    def get_all() -> List[Dict]:
        """Get all complaints"""
        table = dynamodb.Table(COMPLAINTS_TABLE)
        
        response = table.scan()
        items = response.get('Items', [])
        
        # Handle pagination
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response.get('Items', []))
        
        # Sort by created_at descending
        items.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return [decimal_to_float(item) for item in items]
    
    @staticmethod
    def update_status(complaint_id: str, status: str) -> bool:
        """Update complaint status"""
        table = dynamodb.Table(COMPLAINTS_TABLE)
        
        try:
            table.update_item(
                Key={'complaint_id': complaint_id},
                UpdateExpression='SET #status = :status',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':status': status}
            )
            return True
        except Exception:
            return False
    
    @staticmethod
    def delete(complaint_id: str) -> bool:
        """Delete a complaint"""
        table = dynamodb.Table(COMPLAINTS_TABLE)
        
        try:
            table.delete_item(Key={'complaint_id': complaint_id})
            return True
        except Exception:
            return False
    
    @staticmethod
    def query_by_status(status: str) -> List[Dict]:
        """Query complaints by status"""
        table = dynamodb.Table(COMPLAINTS_TABLE)
        
        response = table.query(
            IndexName='status-created-index',
            KeyConditionExpression=Key('status').eq(status)
        )
        
        return [decimal_to_float(item) for item in response.get('Items', [])]


# -----------------------------
# Risk Score DB Operations
# -----------------------------
class RiskScoreDB:
    
    @staticmethod
    def create(beneficiary_id: str, risk_data: dict) -> str:
        """Create a risk score record"""
        table = dynamodb.Table(RISK_SCORES_TABLE)
        
        timestamp = datetime.now().isoformat()
        
        item = {
            'beneficiary_id': beneficiary_id,
            'timestamp': timestamp,
            'risk_score': float_to_decimal(risk_data.get('risk_score', 0.0)),
            'risk_category': risk_data.get('risk_category', 'low'),
            'duplicate_score': float_to_decimal(risk_data.get('duplicate_score', 0.0)),
            'anomaly_score': float_to_decimal(risk_data.get('anomaly_score', 0.0)),
            'network_centrality': float_to_decimal(risk_data.get('network_centrality', 0.0)),
            'complaint_severity': float_to_decimal(risk_data.get('complaint_severity', 0.0)),
            'explanation': risk_data.get('explanation', ''),
            'factors': json.dumps(risk_data.get('factors', {}))
        }
        
        table.put_item(Item=item)
        return timestamp
    
    @staticmethod
    def get_latest(beneficiary_id: str) -> Optional[Dict]:
        """Get latest risk score for beneficiary"""
        table = dynamodb.Table(RISK_SCORES_TABLE)
        
        response = table.query(
            KeyConditionExpression=Key('beneficiary_id').eq(beneficiary_id),
            ScanIndexForward=False,
            Limit=1
        )
        
        items = response.get('Items', [])
        return decimal_to_float(items[0]) if items else None
    
    @staticmethod
    def get_history(beneficiary_id: str, limit: int = 10) -> List[Dict]:
        """Get risk score history for beneficiary"""
        table = dynamodb.Table(RISK_SCORES_TABLE)
        
        response = table.query(
            KeyConditionExpression=Key('beneficiary_id').eq(beneficiary_id),
            ScanIndexForward=False,
            Limit=limit
        )
        
        return [decimal_to_float(item) for item in response.get('Items', [])]


# -----------------------------
# Alert DB Operations
# -----------------------------
class AlertDB:
    
    @staticmethod
    def create(data: dict) -> str:
        """Create a new alert"""
        table = dynamodb.Table(ALERTS_TABLE)
        
        alert_id = f"ALT{datetime.now().strftime('%Y%m%d%H%M%S%f')[:17]}"
        
        item = {
            'alert_id': alert_id,
            'alert_type': data.get('alert_type', ''),
            'severity': data.get('severity', 'low'),
            'beneficiary_id': data.get('beneficiary_id', ''),
            'risk_score': float_to_decimal(data.get('risk_score', 0.0)),
            'title': data.get('title', ''),
            'description': data.get('description', ''),
            'status': 'open',
            'created_at': datetime.now().isoformat()
        }
        
        table.put_item(Item=item)
        return alert_id
    
    @staticmethod
    def get(alert_id: str) -> Optional[Dict]:
        """Get alert by ID"""
        table = dynamodb.Table(ALERTS_TABLE)
        
        response = table.get_item(Key={'alert_id': alert_id})
        
        if 'Item' in response:
            return decimal_to_float(response['Item'])
        return None
    
    @staticmethod
    def get_all() -> List[Dict]:
        """Get all open alerts"""
        table = dynamodb.Table(ALERTS_TABLE)
        
        response = table.scan(
            FilterExpression=Attr('status').eq('open')
        )
        
        items = response.get('Items', [])
        
        # Handle pagination
        while 'LastEvaluatedKey' in response:
            response = table.scan(
                FilterExpression=Attr('status').eq('open'),
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            items.extend(response.get('Items', []))
        
        # Sort by created_at descending
        items.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return [decimal_to_float(item) for item in items]
    
    @staticmethod
    def update_status(alert_id: str, status: str) -> bool:
        """Update alert status"""
        table = dynamodb.Table(ALERTS_TABLE)
        
        try:
            table.update_item(
                Key={'alert_id': alert_id},
                UpdateExpression='SET #status = :status',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':status': status}
            )
            return True
        except Exception:
            return False
    
    @staticmethod
    def delete(alert_id: str) -> bool:
        """Delete an alert"""
        table = dynamodb.Table(ALERTS_TABLE)
        
        try:
            table.delete_item(Key={'alert_id': alert_id})
            return True
        except Exception:
            return False
    
    @staticmethod
    def query_by_severity(severity: str) -> List[Dict]:
        """Query alerts by severity"""
        table = dynamodb.Table(ALERTS_TABLE)
        
        response = table.query(
            IndexName='severity-created-index',
            KeyConditionExpression=Key('severity').eq(severity)
        )
        
        return [decimal_to_float(item) for item in response.get('Items', [])]
    
    @staticmethod
    def get_by_beneficiary(beneficiary_id: str) -> List[Dict]:
        """Get all alerts for a specific beneficiary"""
        table = dynamodb.Table(ALERTS_TABLE)
        
        response = table.scan(
            FilterExpression=Attr('beneficiary_id').eq(beneficiary_id)
        )
        
        items = response.get('Items', [])
        
        # Handle pagination
        while 'LastEvaluatedKey' in response:
            response = table.scan(
                FilterExpression=Attr('beneficiary_id').eq(beneficiary_id),
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            items.extend(response.get('Items', []))
        
        return [decimal_to_float(item) for item in items]


# -----------------------------
# Fraud Network DB (Optional)
# -----------------------------
class FraudNetworkDB:
    
    @staticmethod
    def create(data: dict) -> str:
        """Create fraud network record"""
        # Using beneficiaries table with a special prefix for networks
        table = dynamodb.Table(BENEFICIARIES_TABLE)
        
        network_id = f"NET{datetime.now().strftime('%Y%m%d%H%M%S%f')[:17]}"
        
        item = {
            'beneficiary_id': network_id,  # Using same table, different prefix
            'pattern': data.get('pattern', ''),
            'size': data.get('size', 0),
            'beneficiary_ids': json.dumps(data.get('beneficiary_ids', [])),
            'shared_resource': data.get('shared_resource', ''),
            'risk_score': float_to_decimal(data.get('risk_score', 0.0)),
            'total_amount': float_to_decimal(data.get('total_amount', 0.0)),
            'created_at': datetime.now().isoformat()
        }
        
        table.put_item(Item=item)
        return network_id
    
    @staticmethod
    def get_all() -> List[Dict]:
        """Get all fraud networks"""
        table = dynamodb.Table(BENEFICIARIES_TABLE)
        
        response = table.scan(
            FilterExpression=Attr('beneficiary_id').begins_with('NET')
        )
        
        items = response.get('Items', [])
        
        # Handle pagination
        while 'LastEvaluatedKey' in response:
            response = table.scan(
                FilterExpression=Attr('beneficiary_id').begins_with('NET'),
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            items.extend(response.get('Items', []))
        
        result = []
        for item in items:
            data = decimal_to_float(item)
            if 'beneficiary_ids' in data:
                data['beneficiary_ids'] = json.loads(data['beneficiary_ids'])
            result.append(data)
        
        return result
