"""
Generative AI Insight Generator
Provides governance intelligence using LLM
"""

from typing import Dict, List, Optional
from .llm_adapter import llm_adapter

class InsightGenerator:
    """Generate governance insights using GenAI"""
    
    def __init__(self):
        self.llm = llm_adapter
    
    def summarize_complaint(self, complaint: Dict) -> Dict:
        """Generate officer-friendly complaint summary"""
        prompt = f"""Summarize this citizen complaint for a government officer:

Complaint Type: {complaint.get('complaint_type')}
Description: {complaint.get('description')}
Location: {complaint.get('location', {}).get('district')}
Urgency Score: {complaint.get('urgency_score', 0):.2f}

Provide a concise summary highlighting:
1. Main issue
2. Urgency level
3. Recommended immediate actions"""

        summary = self.llm.generate(prompt, max_tokens=300)
        
        return {
            "complaint_id": complaint.get('complaint_id'),
            "summary": summary,
            "generated_at": "now",
            "key_points": self._extract_key_points(summary),
            "recommended_actions": self._extract_actions(summary)
        }
    
    def generate_case_summary(self, case_data: Dict) -> Dict:
        """Generate audit case summary"""
        prompt = f"""Generate an audit case summary:

Case ID: {case_data.get('case_id')}
Beneficiaries Involved: {len(case_data.get('beneficiary_ids', []))}
Risk Score: {case_data.get('risk_score', 0):.2f}
Fraud Indicators: {', '.join(case_data.get('fraud_indicators', []))}

Provide:
1. Executive summary
2. Key findings
3. Estimated impact
4. Recommendations"""

        summary = self.llm.generate(prompt, max_tokens=500)
        
        return {
            "case_id": case_data.get('case_id'),
            "executive_summary": summary,
            "generated_at": "now",
            "confidence": "high"
        }
    
    def analyze_corruption_patterns(self, patterns: List[Dict]) -> Dict:
        """Analyze and explain corruption patterns"""
        pattern_desc = "\n".join([
            f"- {p.get('pattern_type')}: {p.get('count')} instances"
            for p in patterns
        ])
        
        prompt = f"""Analyze these corruption patterns:

{pattern_desc}

Provide:
1. Pattern analysis
2. Trend insights
3. Risk assessment
4. Preventive recommendations"""

        analysis = self.llm.generate(prompt, max_tokens=400)
        
        return {
            "analysis": analysis,
            "patterns_analyzed": len(patterns),
            "severity": self._assess_severity(patterns),
            "recommendations": self._extract_actions(analysis)
        }
    
    def answer_governance_query(self, query: str, context: Dict) -> Dict:
        """Answer natural language governance queries"""
        prompt = f"""Answer this governance query using system data:

Query: {query}

Context:
- Total Beneficiaries: {context.get('total_beneficiaries', 0)}
- High Risk Cases: {context.get('high_risk_count', 0)}
- Active Alerts: {context.get('active_alerts', 0)}
- Fraud Networks: {context.get('fraud_networks', 0)}

Provide a clear, actionable answer."""

        answer = self.llm.generate(prompt, max_tokens=300)
        
        return {
            "query": query,
            "answer": answer,
            "confidence": "medium",
            "sources": ["system_data", "analytics"]
        }
    
    def generate_district_insights(self, district_data: Dict) -> Dict:
        """Generate district-level insights"""
        prompt = f"""Analyze this district's welfare program performance:

District: {district_data.get('district')}
Risk Score: {district_data.get('risk_score', 0):.2f}
High Risk Beneficiaries: {district_data.get('high_risk_count', 0)}
Total Beneficiaries: {district_data.get('total_beneficiaries', 0)}
Fraud Cases: {district_data.get('fraud_cases', 0)}

Provide:
1. Performance assessment
2. Risk factors
3. Improvement recommendations"""

        insights = self.llm.generate(prompt, max_tokens=350)
        
        return {
            "district": district_data.get('district'),
            "insights": insights,
            "risk_level": self._categorize_risk(district_data.get('risk_score', 0)),
            "priority": self._calculate_priority(district_data)
        }
    
    def generate_fraud_network_explanation(self, network: Dict) -> Dict:
        """Explain fraud network in simple terms"""
        prompt = f"""Explain this fraud network to a non-technical officer:

Network Size: {network.get('size', 0)} beneficiaries
Pattern: {network.get('pattern', 'unknown')}
Shared Resource: {network.get('shared_resource', 'unknown')}
Total Amount: ₹{network.get('total_amount', 0):,}

Explain:
1. What this network means
2. Why it's suspicious
3. What actions to take"""

        explanation = self.llm.generate(prompt, max_tokens=300)
        
        return {
            "network_id": network.get('network_id'),
            "explanation": explanation,
            "severity": "high" if network.get('size', 0) > 3 else "medium",
            "action_required": True
        }
    
    def _extract_key_points(self, text: str) -> List[str]:
        """Extract key points from generated text"""
        points = []
        for line in text.split('\n'):
            line = line.strip()
            if line and (line.startswith(('1.', '2.', '3.', '-', '•')) or 
                        'ISSUE:' in line or 'URGENCY:' in line):
                points.append(line)
        return points[:5]
    
    def _extract_actions(self, text: str) -> List[str]:
        """Extract recommended actions"""
        actions = []
        in_actions = False
        
        for line in text.split('\n'):
            if 'ACTION' in line.upper() or 'RECOMMENDATION' in line.upper():
                in_actions = True
                continue
            if in_actions and line.strip():
                if line.strip().startswith(('1.', '2.', '3.', '-', '•')):
                    actions.append(line.strip())
        
        return actions[:5]
    
    def _assess_severity(self, patterns: List[Dict]) -> str:
        """Assess overall severity of patterns"""
        total_count = sum(p.get('count', 0) for p in patterns)
        if total_count > 10:
            return "high"
        elif total_count > 5:
            return "medium"
        else:
            return "low"
    
    def _categorize_risk(self, risk_score: float) -> str:
        """Categorize risk level"""
        if risk_score >= 0.8:
            return "critical"
        elif risk_score >= 0.6:
            return "high"
        elif risk_score >= 0.4:
            return "medium"
        else:
            return "low"
    
    def _calculate_priority(self, district_data: Dict) -> str:
        """Calculate action priority"""
        risk_score = district_data.get('risk_score', 0)
        high_risk_count = district_data.get('high_risk_count', 0)
        
        if risk_score >= 0.7 and high_risk_count > 10:
            return "urgent"
        elif risk_score >= 0.5 or high_risk_count > 5:
            return "high"
        else:
            return "normal"

# Global instance
insight_generator = InsightGenerator()
