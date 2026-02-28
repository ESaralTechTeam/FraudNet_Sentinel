import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Optional
import hashlib

DB_PATH = "leakage_detection.db"

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Beneficiaries table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS beneficiaries (
            beneficiary_id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            date_of_birth TEXT,
            gender TEXT,
            address TEXT,
            phone TEXT,
            bank_account_hash TEXT,
            district TEXT,
            scheme TEXT,
            amount REAL,
            risk_score REAL DEFAULT 0.0,
            risk_category TEXT DEFAULT 'low',
            is_duplicate INTEGER DEFAULT 0,
            is_flagged INTEGER DEFAULT 0,
            created_at TEXT
        )
    """)
    
    # Complaints table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            complaint_id TEXT PRIMARY KEY,
            complaint_type TEXT,
            status TEXT DEFAULT 'submitted',
            description TEXT,
            subject_beneficiary_id TEXT,
            location TEXT,
            urgency_score REAL,
            sentiment_score REAL,
            submitter_name TEXT,
            submitter_phone TEXT,
            is_anonymous INTEGER,
            created_at TEXT
        )
    """)
    
    # Alerts table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            alert_id TEXT PRIMARY KEY,
            alert_type TEXT,
            severity TEXT,
            beneficiary_id TEXT,
            risk_score REAL,
            title TEXT,
            description TEXT,
            status TEXT DEFAULT 'open',
            created_at TEXT
        )
    """)
    
    # Transactions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS transactions (
            transaction_id TEXT PRIMARY KEY,
            beneficiary_id TEXT,
            amount REAL,
            timestamp TEXT,
            officer_id TEXT,
            approval_time_hours REAL,
            is_anomalous INTEGER DEFAULT 0,
            anomaly_score REAL DEFAULT 0.0
        )
    """)
    
    # Fraud networks table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS fraud_networks (
            network_id TEXT PRIMARY KEY,
            pattern TEXT,
            size INTEGER,
            beneficiary_ids TEXT,
            shared_resource TEXT,
            risk_score REAL,
            total_amount REAL,
            created_at TEXT
        )
    """)
    
    conn.commit()
    conn.close()
    
    # Seed sample data
    seed_sample_data()

def seed_sample_data():
    conn = get_db()
    cursor = conn.cursor()
    
    # Check if data exists
    cursor.execute("SELECT COUNT(*) FROM beneficiaries")
    if cursor.fetchone()[0] > 0:
        conn.close()
        return
    
    # Sample beneficiaries
    sample_beneficiaries = [
        ("BEN001", "Rajesh Kumar", "1985-06-15", "M", "123 Main St, Village A", "+919876543210", 
         hashlib.sha256("ACC001".encode()).hexdigest()[:16], "District1", "PMAY", 50000, 0.85, "high", 1, 1),
        ("BEN002", "Rajesh Kumarr", "1985-06-16", "M", "124 Main St, Village A", "+919876543211",
         hashlib.sha256("ACC001".encode()).hexdigest()[:16], "District1", "PMAY", 50000, 0.82, "high", 1, 1),
        ("BEN003", "Priya Sharma", "1990-03-20", "F", "456 Park Rd, Village B", "+919876543212",
         hashlib.sha256("ACC002".encode()).hexdigest()[:16], "District1", "MGNREGA", 30000, 0.25, "low", 0, 0),
        ("BEN004", "Amit Patel", "1988-11-10", "M", "789 Lake View, Village C", "+919876543213",
         hashlib.sha256("ACC003".encode()).hexdigest()[:16], "District2", "PMAY", 55000, 0.65, "medium", 0, 1),
        ("BEN005", "Sunita Devi", "1992-08-25", "F", "321 Hill Top, Village D", "+919876543214",
         hashlib.sha256("ACC004".encode()).hexdigest()[:16], "District2", "MGNREGA", 28000, 0.15, "low", 0, 0),
    ]
    
    for ben in sample_beneficiaries:
        cursor.execute("""
            INSERT INTO beneficiaries VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (*ben, datetime.now().isoformat()))
    
    # Sample transactions
    sample_transactions = [
        ("TXN001", "BEN001", 50000, datetime.now().isoformat(), "OFF001", 2.0, 1, 0.78),
        ("TXN002", "BEN002", 50000, datetime.now().isoformat(), "OFF001", 2.5, 1, 0.75),
        ("TXN003", "BEN003", 30000, datetime.now().isoformat(), "OFF002", 120.0, 0, 0.15),
        ("TXN004", "BEN004", 55000, datetime.now().isoformat(), "OFF003", 48.0, 0, 0.45),
    ]
    
    for txn in sample_transactions:
        cursor.execute("""
            INSERT INTO transactions VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, txn)
    
    # Sample alerts
    sample_alerts = [
        ("ALT001", "high_risk_beneficiary", "critical", "BEN001", 0.85,
         "High Risk Duplicate Detected", "Beneficiary shows high similarity to BEN002", "open"),
        ("ALT002", "fraud_network", "high", "BEN001", 0.82,
         "Fraud Network Identified", "Multiple beneficiaries sharing bank account", "open"),
    ]
    
    for alert in sample_alerts:
        cursor.execute("""
            INSERT INTO alerts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (*alert, datetime.now().isoformat()))
    
    conn.commit()
    conn.close()
    print("✅ Sample data seeded")

class BeneficiaryDB:
    @staticmethod
    def create(data: dict) -> str:
        conn = get_db()
        cursor = conn.cursor()
        
        beneficiary_id = f"BEN{datetime.now().strftime('%Y%m%d%H%M%S')}"
        bank_hash = hashlib.sha256(data['bank_account'].encode()).hexdigest()[:16]
        
        cursor.execute("""
            INSERT INTO beneficiaries VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            beneficiary_id, data['name'], data['date_of_birth'], data['gender'],
            data['address'], data['phone'], bank_hash, data['district'],
            data['scheme'], data['amount'], 0.0, 'low', 0, 0,
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        return beneficiary_id
    
    @staticmethod
    def get(beneficiary_id: str) -> Optional[Dict]:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM beneficiaries WHERE beneficiary_id = ?", (beneficiary_id,))
        row = cursor.fetchone()
        conn.close()
        return dict(row) if row else None
    
    @staticmethod
    def get_all() -> List[Dict]:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM beneficiaries")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]
    
    @staticmethod
    def update_risk(beneficiary_id: str, risk_score: float, risk_category: str, is_duplicate: bool):
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE beneficiaries 
            SET risk_score = ?, risk_category = ?, is_duplicate = ?, is_flagged = 1
            WHERE beneficiary_id = ?
        """, (risk_score, risk_category, 1 if is_duplicate else 0, beneficiary_id))
        conn.commit()
        conn.close()

class ComplaintDB:
    @staticmethod
    def create(data: dict) -> str:
        conn = get_db()
        cursor = conn.cursor()
        
        complaint_id = f"CMP{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        cursor.execute("""
            INSERT INTO complaints VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            complaint_id, data['complaint_type'], 'submitted', data['description'],
            data.get('subject_beneficiary_id'), json.dumps(data['location']),
            data.get('urgency_score', 0.5), data.get('sentiment_score', 0.0),
            data.get('submitter_name'), data.get('submitter_phone'),
            1 if data.get('is_anonymous') else 0, datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        return complaint_id
    
    @staticmethod
    def get_all() -> List[Dict]:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM complaints ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

class AlertDB:
    @staticmethod
    def create(data: dict) -> str:
        conn = get_db()
        cursor = conn.cursor()
        
        alert_id = f"ALT{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        cursor.execute("""
            INSERT INTO alerts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            alert_id, data['alert_type'], data['severity'], data['beneficiary_id'],
            data['risk_score'], data['title'], data['description'], 'open',
            datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        return alert_id
    
    @staticmethod
    def get_all() -> List[Dict]:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM alerts WHERE status = 'open' ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        return [dict(row) for row in rows]

class FraudNetworkDB:
    @staticmethod
    def create(data: dict) -> str:
        conn = get_db()
        cursor = conn.cursor()
        
        network_id = f"NET{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        cursor.execute("""
            INSERT INTO fraud_networks VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            network_id, data['pattern'], data['size'],
            json.dumps(data['beneficiary_ids']), data['shared_resource'],
            data['risk_score'], data['total_amount'], datetime.now().isoformat()
        ))
        
        conn.commit()
        conn.close()
        return network_id
    
    @staticmethod
    def get_all() -> List[Dict]:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM fraud_networks")
        rows = cursor.fetchall()
        conn.close()
        result = []
        for row in rows:
            data = dict(row)
            data['beneficiary_ids'] = json.loads(data['beneficiary_ids'])
            result.append(data)
        return result
