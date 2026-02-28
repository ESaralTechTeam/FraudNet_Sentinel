#!/usr/bin/env python3
"""
Quick Backend Test Script
Run this after starting the backend to verify everything works
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/v1"

def print_test(name, passed, details=""):
    status = "✅" if passed else "❌"
    print(f"{status} {name}")
    if details:
        print(f"   {details}")

def test_health():
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        passed = response.status_code == 200 and response.json().get("status") == "healthy"
        print_test("Health Check", passed, f"Status: {response.json().get('status')}")
        return passed
    except Exception as e:
        print_test("Health Check", False, f"Error: {str(e)}")
        return False

def test_get_beneficiaries():
    try:
        response = requests.get(f"{API_URL}/beneficiaries", timeout=5)
        data = response.json()
        passed = response.status_code == 200 and len(data) >= 5
        print_test("Get Beneficiaries", passed, f"Found {len(data)} beneficiaries")
        return passed
    except Exception as e:
        print_test("Get Beneficiaries", False, f"Error: {str(e)}")
        return False

def test_get_alerts():
    try:
        response = requests.get(f"{API_URL}/alerts", timeout=5)
        data = response.json()
        passed = response.status_code == 200 and data.get("total", 0) >= 2
        print_test("Get Alerts", passed, f"Found {data.get('total', 0)} alerts")
        return passed
    except Exception as e:
        print_test("Get Alerts", False, f"Error: {str(e)}")
        return False

def test_risk_assessment():
    try:
        response = requests.get(f"{API_URL}/beneficiaries/BEN001/risk", timeout=5)
        data = response.json()
        passed = response.status_code == 200 and "risk_score" in data
        print_test("Risk Assessment", passed, f"Risk Score: {data.get('risk_score', 'N/A')}")
        return passed
    except Exception as e:
        print_test("Risk Assessment", False, f"Error: {str(e)}")
        return False

def test_fraud_network():
    try:
        response = requests.get(f"{API_URL}/beneficiaries/BEN001/network", timeout=5)
        data = response.json()
        passed = response.status_code == 200 and "nodes" in data
        node_count = len(data.get("nodes", []))
        print_test("Fraud Network", passed, f"Found {node_count} nodes")
        return passed
    except Exception as e:
        print_test("Fraud Network", False, f"Error: {str(e)}")
        return False

def test_submit_complaint():
    try:
        complaint = {
            "complaint_type": "fraud",
            "description": "URGENT! This is a test complaint with fraud keywords",
            "location": {"district": "TestDistrict"},
            "is_anonymous": False
        }
        response = requests.post(f"{API_URL}/complaints", json=complaint, timeout=5)
        data = response.json()
        passed = response.status_code == 200 and "complaint_id" in data
        urgency = data.get("urgency_score", 0)
        print_test("Submit Complaint", passed, f"ID: {data.get('complaint_id', 'N/A')}, Urgency: {urgency:.2f}")
        return passed
    except Exception as e:
        print_test("Submit Complaint", False, f"Error: {str(e)}")
        return False

def test_analytics_summary():
    try:
        response = requests.get(f"{API_URL}/analytics/summary", timeout=5)
        data = response.json()
        passed = response.status_code == 200 and "total_beneficiaries" in data
        print_test("Analytics Summary", passed, f"Total: {data.get('total_beneficiaries', 0)}, High Risk: {data.get('high_risk_count', 0)}")
        return passed
    except Exception as e:
        print_test("Analytics Summary", False, f"Error: {str(e)}")
        return False

def test_fraud_networks():
    try:
        response = requests.get(f"{API_URL}/analytics/fraud-networks", timeout=5)
        data = response.json()
        passed = response.status_code == 200 and "networks" in data
        network_count = data.get("total_networks", 0)
        print_test("Fraud Networks Detection", passed, f"Found {network_count} networks")
        return passed
    except Exception as e:
        print_test("Fraud Networks Detection", False, f"Error: {str(e)}")
        return False

def test_district_risk():
    try:
        response = requests.get(f"{API_URL}/analytics/district-risk", timeout=5)
        data = response.json()
        passed = response.status_code == 200 and isinstance(data, list)
        print_test("District Risk Analysis", passed, f"Analyzed {len(data)} districts")
        return passed
    except Exception as e:
        print_test("District Risk Analysis", False, f"Error: {str(e)}")
        return False

def main():
    print("=" * 60)
    print("🧪 Backend API Test Suite")
    print("=" * 60)
    print(f"Testing: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print()
    
    tests = [
        ("Health Check", test_health),
        ("Get Beneficiaries", test_get_beneficiaries),
        ("Get Alerts", test_get_alerts),
        ("Risk Assessment", test_risk_assessment),
        ("Fraud Network", test_fraud_network),
        ("Submit Complaint", test_submit_complaint),
        ("Analytics Summary", test_analytics_summary),
        ("Fraud Networks", test_fraud_networks),
        ("District Risk", test_district_risk),
    ]
    
    results = []
    for name, test_func in tests:
        results.append(test_func())
        print()
    
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    percentage = (passed / total * 100) if total > 0 else 0
    
    print(f"Results: {passed}/{total} tests passed ({percentage:.1f}%)")
    
    if passed == total:
        print("🎉 All tests passed! Backend is working perfectly.")
    elif passed > total / 2:
        print("⚠️  Most tests passed. Check failed tests above.")
    else:
        print("❌ Many tests failed. Check if backend is running:")
        print("   cd backend && python app.py")
    
    print("=" * 60)
    
    return passed == total

if __name__ == "__main__":
    try:
        success = main()
        exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {str(e)}")
        exit(1)
