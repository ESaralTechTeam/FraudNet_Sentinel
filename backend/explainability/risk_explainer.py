"""
Explainable AI - Risk Explainer
Provides human-readable explanations for AI decisions
"""

from typing import Dict, List

class RiskExplainer:
    """Generate explainable risk assessments"""
    
    def __init__(self):
        self.reason_codes = {
            'DUP_HIGH': 'High similarity to existing beneficiary',
            'DUP_MEDIUM': 'Moderate similarity to existing beneficiary',
            'ANOM_AMOUNT': 'Transaction amount is unusual',
            'ANOM_SPEED': 'Approval speed is abnormally fast',
            'ANOM_TIME': 'Transaction occurred at unusual time',
            'NET_HUB': 'Part of fraud network (shared resources)',
            'NET_CLUSTER': 'Connected to suspicious beneficiaries',
            'COMP_MULTIPLE': 'Multiple complaints filed',
            'COMP_SEVERE': 'Severe complaint allegations',
            'GEO_INCONSIST': 'Geographic inconsistencies detected',
            'DOC_MISSING': 'Missing or incomplete documentation',
            'HIST_FRAUD': 'Historical fraud indicators'
        }
        
        self.action_recommendations = {
            'critical': [
                'Immediate investigation required',
                'Freeze all pending payments',
                'Escalate to vigilance department',
                'Conduct field verification within 24 hours'
            ],
            'high': [
                'Priority investigation required',
                'Manual verification of documents',
                'Field verification recommended',
                'Review approval chain'
            ],
            'medium': [
                'Monitoring required',
                'Periodic review recommended',
                'Document verification suggested'
            ],
            'low': [
                'Normal processing',
                'Standard monitoring'
            ]
        }
    
    def explain_risk_score(self, beneficiary: Dict, risk_assessment: Dict) -> Dict:
        """Generate comprehensive risk explanation"""
        risk_score = risk_assessment.get('risk_score', 0)
        risk_category = risk_assessment.get('risk_category', 'low')
        factors = risk_assessment.get('factors', [])
        
        # Generate reason codes
        reason_codes = self._generate_reason_codes(factors)
        
        # Generate plain language explanation
        explanation = self._generate_explanation(beneficiary, risk_score, factors)
        
        # Generate factor breakdown
        factor_breakdown = self._explain_factors(factors)
        
        # Get recommendations
        recommendations = self.action_recommendations.get(risk_category, [])
        
        return {
            'beneficiary_id': beneficiary.get('beneficiary_id'),
            'risk_score': risk_score,
            'risk_category': risk_category,
            'risk_percentage': f"{risk_score * 100:.1f}%",
            'reason_codes': reason_codes,
            'plain_language_explanation': explanation,
            'factor_breakdown': factor_breakdown,
            'recommended_actions': recommendations,
            'confidence_level': self._calculate_confidence(factors),
            'explanation_timestamp': 'now'
        }
    
    def explain_duplicate_match(self, beneficiary1: Dict, beneficiary2: Dict, similarity: float) -> Dict:
        """Explain why two beneficiaries are flagged as duplicates"""
        explanation_parts = []
        
        # Name similarity
        if similarity > 0.8:
            explanation_parts.append({
                'factor': 'Name Match',
                'severity': 'high',
                'explanation': f"Names are {similarity*100:.1f}% similar",
                'details': f"'{beneficiary1.get('name')}' vs '{beneficiary2.get('name')}'"
            })
        
        # Same bank account
        if beneficiary1.get('bank_account_hash') == beneficiary2.get('bank_account_hash'):
            explanation_parts.append({
                'factor': 'Shared Bank Account',
                'severity': 'critical',
                'explanation': 'Both beneficiaries use the same bank account',
                'details': 'This is a strong indicator of duplicate or fraudulent registration'
            })
        
        # Same phone
        if beneficiary1.get('phone') == beneficiary2.get('phone'):
            explanation_parts.append({
                'factor': 'Shared Phone Number',
                'severity': 'high',
                'explanation': 'Both beneficiaries have the same contact number',
                'details': 'Legitimate beneficiaries typically have unique contact information'
            })
        
        # Similar address
        addr1 = beneficiary1.get('address', '').lower()
        addr2 = beneficiary2.get('address', '').lower()
        if addr1 and addr2 and addr1[:20] == addr2[:20]:
            explanation_parts.append({
                'factor': 'Similar Address',
                'severity': 'medium',
                'explanation': 'Addresses are very similar',
                'details': 'May indicate same household or fraudulent registration'
            })
        
        return {
            'beneficiary_1': beneficiary1.get('beneficiary_id'),
            'beneficiary_2': beneficiary2.get('beneficiary_id'),
            'similarity_score': similarity,
            'is_duplicate': similarity > 0.75,
            'explanation_factors': explanation_parts,
            'summary': self._generate_duplicate_summary(explanation_parts, similarity),
            'recommended_action': 'Field verification required to confirm identity'
        }
    
    def explain_anomaly(self, transaction: Dict, anomaly_result: Dict) -> Dict:
        """Explain why a transaction is flagged as anomalous"""
        reasons = anomaly_result.get('reasons', [])
        anomaly_score = anomaly_result.get('anomaly_score', 0)
        
        explanation_parts = []
        
        for reason in reasons:
            if 'amount' in reason.lower():
                explanation_parts.append({
                    'factor': 'Unusual Amount',
                    'explanation': reason,
                    'severity': 'high' if anomaly_score > 0.7 else 'medium',
                    'normal_range': 'Typical amounts: ₹20,000 - ₹60,000',
                    'this_transaction': f"₹{transaction.get('amount', 0):,}"
                })
            elif 'approval' in reason.lower() or 'speed' in reason.lower():
                explanation_parts.append({
                    'factor': 'Fast Approval',
                    'explanation': reason,
                    'severity': 'high',
                    'normal_range': 'Typical approval time: 3-7 days',
                    'this_transaction': f"{transaction.get('approval_time_hours', 0):.1f} hours"
                })
        
        return {
            'transaction_id': transaction.get('transaction_id'),
            'is_anomalous': anomaly_result.get('is_anomalous', False),
            'anomaly_score': anomaly_score,
            'anomaly_percentage': f"{anomaly_score * 100:.1f}%",
            'explanation_factors': explanation_parts,
            'summary': f"Transaction flagged due to {len(reasons)} unusual patterns",
            'recommended_action': 'Review transaction details and approval chain'
        }
    
    def explain_fraud_network(self, network: Dict) -> Dict:
        """Explain fraud network in simple terms"""
        size = network.get('size', 0)
        pattern = network.get('pattern', 'unknown')
        shared_resource = network.get('shared_resource', '')
        
        # Generate explanation based on pattern
        if pattern == 'hub':
            explanation = f"This network consists of {size} beneficiaries who all share the same {network.get('resource_type', 'resource')}. "
            explanation += "This pattern suggests coordinated fraud where multiple fake identities are created to claim benefits multiple times."
        else:
            explanation = f"This network shows {size} beneficiaries with suspicious connections. "
            explanation += "The pattern indicates potential organized fraud activity."
        
        # Risk assessment
        risk_level = 'critical' if size > 5 else 'high' if size > 3 else 'medium'
        
        # Impact
        total_amount = network.get('total_amount', 0)
        impact = f"Total funds involved: ₹{total_amount:,}"
        
        return {
            'network_id': network.get('network_id'),
            'pattern_type': pattern,
            'size': size,
            'risk_level': risk_level,
            'plain_language_explanation': explanation,
            'why_suspicious': self._explain_why_suspicious(pattern, size),
            'impact_assessment': impact,
            'recommended_actions': [
                'Investigate all beneficiaries in network',
                'Freeze payments to network members',
                'Conduct field verification',
                'Review approval officer involvement'
            ],
            'visual_description': self._describe_network_visually(network)
        }
    
    def _generate_reason_codes(self, factors: List[Dict]) -> List[str]:
        """Generate reason codes from factors"""
        codes = []
        
        for factor in factors:
            factor_name = factor.get('factor', '').lower()
            score = factor.get('score', 0)
            
            if 'duplicate' in factor_name:
                codes.append('DUP_HIGH' if score > 0.8 else 'DUP_MEDIUM')
            elif 'anomaly' in factor_name:
                codes.append('ANOM_AMOUNT')
            elif 'network' in factor_name:
                codes.append('NET_HUB' if score > 0.7 else 'NET_CLUSTER')
            elif 'complaint' in factor_name:
                codes.append('COMP_SEVERE' if score > 0.7 else 'COMP_MULTIPLE')
        
        return codes
    
    def _generate_explanation(self, beneficiary: Dict, risk_score: float, factors: List[Dict]) -> str:
        """Generate plain language explanation"""
        name = beneficiary.get('name', 'This beneficiary')
        
        if risk_score >= 0.8:
            explanation = f"{name} has been flagged as CRITICAL RISK ({risk_score*100:.0f}%). "
        elif risk_score >= 0.6:
            explanation = f"{name} has been flagged as HIGH RISK ({risk_score*100:.0f}%). "
        else:
            explanation = f"{name} shows MEDIUM RISK indicators ({risk_score*100:.0f}%). "
        
        # Add top factors
        if factors:
            top_factor = factors[0]
            explanation += f"The primary concern is: {top_factor.get('explanation', 'unusual patterns detected')}. "
        
        if len(factors) > 1:
            explanation += f"Additionally, {len(factors)-1} other risk factors were identified. "
        
        explanation += "Manual verification is recommended before proceeding with any payments."
        
        return explanation
    
    def _explain_factors(self, factors: List[Dict]) -> List[Dict]:
        """Provide detailed factor explanations"""
        explained_factors = []
        
        for factor in factors:
            explained = {
                'factor_name': factor.get('factor', 'Unknown').replace('_', ' ').title(),
                'contribution': factor.get('contribution', 0),
                'percentage': factor.get('percentage', 0),
                'score': factor.get('score', 0),
                'explanation': factor.get('explanation', 'No explanation available'),
                'severity': self._categorize_severity(factor.get('score', 0)),
                'what_it_means': self._explain_what_it_means(factor)
            }
            explained_factors.append(explained)
        
        return explained_factors
    
    def _calculate_confidence(self, factors: List[Dict]) -> str:
        """Calculate confidence in risk assessment"""
        if len(factors) >= 3:
            return 'high'
        elif len(factors) >= 2:
            return 'medium'
        else:
            return 'low'
    
    def _generate_duplicate_summary(self, factors: List[Dict], similarity: float) -> str:
        """Generate summary for duplicate explanation"""
        if similarity > 0.9:
            return f"Very high similarity ({similarity*100:.0f}%) with {len(factors)} matching factors. Likely duplicate."
        elif similarity > 0.75:
            return f"High similarity ({similarity*100:.0f}%) detected. Possible duplicate requiring verification."
        else:
            return f"Moderate similarity ({similarity*100:.0f}%). Further investigation needed."
    
    def _explain_why_suspicious(self, pattern: str, size: int) -> str:
        """Explain why pattern is suspicious"""
        if pattern == 'hub':
            return f"Legitimate beneficiaries do not typically share bank accounts or addresses. {size} beneficiaries sharing resources indicates coordinated fraud."
        else:
            return f"The connection pattern between {size} beneficiaries is unusual and warrants investigation."
    
    def _describe_network_visually(self, network: Dict) -> str:
        """Describe network structure"""
        size = network.get('size', 0)
        resource = network.get('shared_resource', 'resource')
        
        return f"Network shows {size} beneficiaries (nodes) all connected to shared {resource} (central hub)"
    
    def _categorize_severity(self, score: float) -> str:
        """Categorize factor severity"""
        if score >= 0.8:
            return 'critical'
        elif score >= 0.6:
            return 'high'
        elif score >= 0.4:
            return 'medium'
        else:
            return 'low'
    
    def _explain_what_it_means(self, factor: Dict) -> str:
        """Explain what a factor means in simple terms"""
        factor_name = factor.get('factor', '').lower()
        
        if 'duplicate' in factor_name:
            return "This person's information closely matches another beneficiary in the system"
        elif 'anomaly' in factor_name:
            return "The transaction pattern is unusual compared to normal cases"
        elif 'network' in factor_name:
            return "This person is connected to other suspicious beneficiaries"
        elif 'complaint' in factor_name:
            return "Complaints have been filed regarding this beneficiary"
        else:
            return "Unusual pattern detected requiring review"

# Global instance
risk_explainer = RiskExplainer()
