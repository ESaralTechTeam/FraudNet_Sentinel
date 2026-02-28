"""
Policy Intelligence & Analytics
Provides policy-level insights for decision makers
"""

from typing import Dict, List, Tuple
from collections import defaultdict
from datetime import datetime, timedelta
import statistics

class PolicyInsightsEngine:
    """Generate policy-level insights and analytics"""
    
    def __init__(self):
        self.risk_thresholds = {
            'critical': 0.8,
            'high': 0.6,
            'medium': 0.4,
            'low': 0.0
        }
    
    def generate_district_rankings(self, districts_data: List[Dict]) -> List[Dict]:
        """Rank districts by risk level"""
        rankings = []
        
        for district in districts_data:
            risk_score = district.get('risk_score', 0)
            high_risk_count = district.get('high_risk_count', 0)
            total_beneficiaries = district.get('total_beneficiaries', 1)
            
            # Calculate composite score
            risk_percentage = high_risk_count / total_beneficiaries if total_beneficiaries > 0 else 0
            composite_score = (risk_score * 0.6) + (risk_percentage * 0.4)
            
            rankings.append({
                'district': district['district'],
                'rank': 0,  # Will be assigned after sorting
                'risk_score': risk_score,
                'composite_score': composite_score,
                'high_risk_count': high_risk_count,
                'total_beneficiaries': total_beneficiaries,
                'risk_percentage': risk_percentage * 100,
                'priority': self._determine_priority(composite_score, high_risk_count),
                'recommended_actions': self._recommend_district_actions(composite_score, high_risk_count)
            })
        
        # Sort by composite score and assign ranks
        rankings.sort(key=lambda x: x['composite_score'], reverse=True)
        for idx, ranking in enumerate(rankings, 1):
            ranking['rank'] = idx
        
        return rankings
    
    def analyze_scheme_leakage(self, scheme_data: Dict, historical_data: List[Dict]) -> Dict:
        """Analyze leakage trends for a scheme"""
        scheme_id = scheme_data.get('scheme_id')
        
        # Calculate current leakage
        total_disbursed = scheme_data.get('total_disbursed', 0)
        high_risk_amount = scheme_data.get('high_risk_amount', 0)
        leakage_percentage = (high_risk_amount / total_disbursed * 100) if total_disbursed > 0 else 0
        
        # Analyze trend
        trend_data = [d for d in historical_data if d.get('scheme_id') == scheme_id]
        trend_direction = self._calculate_trend(trend_data)
        
        # Calculate efficiency
        legitimate_disbursements = total_disbursed - high_risk_amount
        efficiency_score = (legitimate_disbursements / total_disbursed) if total_disbursed > 0 else 0
        
        return {
            'scheme_id': scheme_id,
            'scheme_name': scheme_data.get('scheme_name', scheme_id),
            'total_disbursed': total_disbursed,
            'high_risk_amount': high_risk_amount,
            'leakage_percentage': round(leakage_percentage, 2),
            'efficiency_score': round(efficiency_score * 100, 2),
            'trend_direction': trend_direction,
            'trend_change': self._calculate_trend_change(trend_data),
            'performance_rating': self._rate_scheme_performance(efficiency_score),
            'recommendations': self._recommend_scheme_improvements(leakage_percentage, trend_direction)
        }
    
    def identify_complaint_hotspots(self, complaints: List[Dict]) -> List[Dict]:
        """Identify geographic hotspots for complaints"""
        # Group by location
        location_counts = defaultdict(lambda: {
            'count': 0,
            'critical': 0,
            'high': 0,
            'complaints': []
        })
        
        for complaint in complaints:
            location = complaint.get('location', {})
            district = location.get('district', 'Unknown')
            block = location.get('block', 'Unknown')
            key = f"{district}_{block}"
            
            location_counts[key]['count'] += 1
            location_counts[key]['complaints'].append(complaint['complaint_id'])
            
            severity = complaint.get('severity', 'low')
            if severity == 'critical':
                location_counts[key]['critical'] += 1
            elif severity == 'high':
                location_counts[key]['high'] += 1
        
        # Convert to hotspots
        hotspots = []
        for location_key, data in location_counts.items():
            district, block = location_key.split('_')
            
            # Calculate hotspot score
            hotspot_score = (
                data['count'] * 0.4 +
                data['critical'] * 0.4 +
                data['high'] * 0.2
            )
            
            if data['count'] >= 3:  # Minimum threshold
                hotspots.append({
                    'district': district,
                    'block': block,
                    'complaint_count': data['count'],
                    'critical_count': data['critical'],
                    'high_count': data['high'],
                    'hotspot_score': hotspot_score,
                    'severity': self._categorize_hotspot(hotspot_score),
                    'requires_attention': hotspot_score > 5,
                    'recommended_actions': self._recommend_hotspot_actions(hotspot_score)
                })
        
        # Sort by hotspot score
        hotspots.sort(key=lambda x: x['hotspot_score'], reverse=True)
        
        return hotspots
    
    def summarize_fraud_patterns(self, fraud_networks: List[Dict], cases: List[Dict]) -> Dict:
        """Summarize fraud patterns across the system"""
        # Pattern distribution
        pattern_counts = defaultdict(int)
        for network in fraud_networks:
            pattern_counts[network.get('pattern', 'unknown')] += 1
        
        # Calculate total impact
        total_amount = sum(n.get('total_amount', 0) for n in fraud_networks)
        total_beneficiaries = sum(n.get('size', 0) for n in fraud_networks)
        
        # Identify most common pattern
        most_common_pattern = max(pattern_counts.items(), key=lambda x: x[1])[0] if pattern_counts else 'none'
        
        # Case resolution stats
        resolved_cases = [c for c in cases if c.get('status') == 'resolved']
        resolution_rate = (len(resolved_cases) / len(cases) * 100) if cases else 0
        
        return {
            'total_networks': len(fraud_networks),
            'total_beneficiaries_involved': total_beneficiaries,
            'total_amount_at_risk': total_amount,
            'pattern_distribution': dict(pattern_counts),
            'most_common_pattern': most_common_pattern,
            'average_network_size': total_beneficiaries / len(fraud_networks) if fraud_networks else 0,
            'total_cases': len(cases),
            'resolved_cases': len(resolved_cases),
            'resolution_rate': round(resolution_rate, 2),
            'key_insights': self._generate_fraud_insights(fraud_networks, pattern_counts),
            'prevention_recommendations': self._recommend_fraud_prevention(pattern_counts)
        }
    
    def analyze_time_based_risks(self, transactions: List[Dict], window_days: int = 30) -> Dict:
        """Analyze risk trends over time"""
        # Group by time periods
        now = datetime.now()
        periods = []
        
        for i in range(window_days, 0, -7):  # Weekly periods
            period_start = now - timedelta(days=i)
            period_end = now - timedelta(days=i-7)
            
            period_transactions = [
                t for t in transactions
                if period_start <= datetime.fromisoformat(t.get('timestamp', now.isoformat())) < period_end
            ]
            
            if period_transactions:
                anomalous_count = sum(1 for t in period_transactions if t.get('is_anomalous'))
                anomaly_rate = anomalous_count / len(period_transactions) if period_transactions else 0
                
                periods.append({
                    'period_start': period_start.strftime('%Y-%m-%d'),
                    'period_end': period_end.strftime('%Y-%m-%d'),
                    'transaction_count': len(period_transactions),
                    'anomalous_count': anomalous_count,
                    'anomaly_rate': round(anomaly_rate * 100, 2)
                })
        
        # Calculate trend
        if len(periods) >= 2:
            recent_rate = periods[-1]['anomaly_rate']
            previous_rate = periods[-2]['anomaly_rate']
            trend = 'increasing' if recent_rate > previous_rate else 'decreasing' if recent_rate < previous_rate else 'stable'
            change_percentage = ((recent_rate - previous_rate) / previous_rate * 100) if previous_rate > 0 else 0
        else:
            trend = 'insufficient_data'
            change_percentage = 0
        
        return {
            'analysis_period_days': window_days,
            'periods': periods,
            'trend': trend,
            'change_percentage': round(change_percentage, 2),
            'current_anomaly_rate': periods[-1]['anomaly_rate'] if periods else 0,
            'average_anomaly_rate': statistics.mean([p['anomaly_rate'] for p in periods]) if periods else 0,
            'insights': self._generate_time_insights(trend, change_percentage)
        }
    
    def generate_impact_metrics(self, system_data: Dict) -> Dict:
        """Generate overall impact metrics"""
        total_beneficiaries = system_data.get('total_beneficiaries', 0)
        high_risk_count = system_data.get('high_risk_count', 0)
        potential_leakage = system_data.get('potential_leakage', 0)
        fraud_cases_detected = system_data.get('fraud_cases_detected', 0)
        
        # Calculate prevention metrics
        detection_rate = (high_risk_count / total_beneficiaries * 100) if total_beneficiaries > 0 else 0
        
        # Estimate savings (assuming 70% of flagged cases are actual fraud)
        estimated_fraud_prevented = potential_leakage * 0.7
        
        return {
            'total_beneficiaries': total_beneficiaries,
            'high_risk_detected': high_risk_count,
            'detection_rate': round(detection_rate, 2),
            'fraud_cases_detected': fraud_cases_detected,
            'potential_leakage_identified': potential_leakage,
            'estimated_fraud_prevented': round(estimated_fraud_prevented, 2),
            'system_effectiveness': self._calculate_effectiveness(detection_rate, fraud_cases_detected),
            'roi_estimate': self._estimate_roi(estimated_fraud_prevented),
            'impact_summary': self._generate_impact_summary(estimated_fraud_prevented, fraud_cases_detected)
        }
    
    def _determine_priority(self, composite_score: float, high_risk_count: int) -> str:
        """Determine district priority"""
        if composite_score >= 0.7 and high_risk_count > 10:
            return 'urgent'
        elif composite_score >= 0.5 or high_risk_count > 5:
            return 'high'
        elif composite_score >= 0.3:
            return 'medium'
        else:
            return 'low'
    
    def _recommend_district_actions(self, composite_score: float, high_risk_count: int) -> List[str]:
        """Recommend actions for district"""
        actions = []
        
        if composite_score >= 0.7:
            actions.append('Immediate field verification campaign')
            actions.append('Strengthen approval workflows')
        
        if high_risk_count > 10:
            actions.append('Deploy additional verification officers')
            actions.append('Conduct officer training on fraud indicators')
        
        if composite_score >= 0.5:
            actions.append('Increase monitoring frequency')
            actions.append('Review recent approvals')
        
        if not actions:
            actions.append('Continue standard monitoring')
        
        return actions
    
    def _calculate_trend(self, historical_data: List[Dict]) -> str:
        """Calculate trend direction"""
        if len(historical_data) < 2:
            return 'insufficient_data'
        
        recent = historical_data[-3:] if len(historical_data) >= 3 else historical_data
        values = [d.get('leakage_percentage', 0) for d in recent]
        
        if len(values) >= 2:
            if values[-1] < values[0]:
                return 'improving'
            elif values[-1] > values[0]:
                return 'worsening'
        
        return 'stable'
    
    def _calculate_trend_change(self, historical_data: List[Dict]) -> float:
        """Calculate percentage change in trend"""
        if len(historical_data) < 2:
            return 0.0
        
        recent_value = historical_data[-1].get('leakage_percentage', 0)
        previous_value = historical_data[-2].get('leakage_percentage', 0)
        
        if previous_value > 0:
            return round(((recent_value - previous_value) / previous_value) * 100, 2)
        
        return 0.0
    
    def _rate_scheme_performance(self, efficiency_score: float) -> str:
        """Rate scheme performance"""
        if efficiency_score >= 0.95:
            return 'excellent'
        elif efficiency_score >= 0.90:
            return 'good'
        elif efficiency_score >= 0.85:
            return 'satisfactory'
        else:
            return 'needs_improvement'
    
    def _recommend_scheme_improvements(self, leakage_percentage: float, trend: str) -> List[str]:
        """Recommend scheme improvements"""
        recommendations = []
        
        if leakage_percentage > 5:
            recommendations.append('Implement stricter verification procedures')
        
        if trend == 'worsening':
            recommendations.append('Conduct immediate audit of recent disbursements')
            recommendations.append('Review and strengthen approval workflows')
        
        if leakage_percentage > 10:
            recommendations.append('Consider temporary suspension pending investigation')
        
        recommendations.append('Regular monitoring and periodic audits')
        
        return recommendations
    
    def _categorize_hotspot(self, hotspot_score: float) -> str:
        """Categorize hotspot severity"""
        if hotspot_score >= 10:
            return 'critical'
        elif hotspot_score >= 7:
            return 'high'
        elif hotspot_score >= 4:
            return 'medium'
        else:
            return 'low'
    
    def _recommend_hotspot_actions(self, hotspot_score: float) -> List[str]:
        """Recommend actions for hotspot"""
        if hotspot_score >= 10:
            return [
                'Deploy investigation team immediately',
                'Conduct comprehensive field verification',
                'Review all recent approvals in area'
            ]
        elif hotspot_score >= 7:
            return [
                'Increase monitoring in area',
                'Conduct targeted field verification',
                'Review complaint patterns'
            ]
        else:
            return ['Monitor situation', 'Standard verification procedures']
    
    def _generate_fraud_insights(self, networks: List[Dict], pattern_counts: Dict) -> List[str]:
        """Generate insights from fraud patterns"""
        insights = []
        
        if pattern_counts.get('hub', 0) > len(networks) * 0.5:
            insights.append('Shared resource fraud (hub pattern) is the dominant fraud type')
        
        avg_size = sum(n.get('size', 0) for n in networks) / len(networks) if networks else 0
        if avg_size > 4:
            insights.append(f'Large fraud networks detected (avg {avg_size:.1f} beneficiaries per network)')
        
        if len(networks) > 5:
            insights.append('Multiple fraud networks indicate systemic issues requiring policy intervention')
        
        return insights
    
    def _recommend_fraud_prevention(self, pattern_counts: Dict) -> List[str]:
        """Recommend fraud prevention measures"""
        recommendations = []
        
        if pattern_counts.get('hub', 0) > 0:
            recommendations.append('Implement unique bank account verification')
            recommendations.append('Cross-check addresses and phone numbers')
        
        recommendations.append('Strengthen identity verification procedures')
        recommendations.append('Implement cooling period for high-value transactions')
        recommendations.append('Regular officer training on fraud detection')
        
        return recommendations
    
    def _generate_time_insights(self, trend: str, change_percentage: float) -> List[str]:
        """Generate insights from time-based analysis"""
        insights = []
        
        if trend == 'increasing':
            insights.append(f'Anomaly rate increasing by {abs(change_percentage):.1f}% - requires attention')
        elif trend == 'decreasing':
            insights.append(f'Anomaly rate decreasing by {abs(change_percentage):.1f}% - positive trend')
        
        if abs(change_percentage) > 20:
            insights.append('Significant change detected - investigate causes')
        
        return insights
    
    def _calculate_effectiveness(self, detection_rate: float, fraud_cases: int) -> str:
        """Calculate system effectiveness"""
        if detection_rate > 5 and fraud_cases > 10:
            return 'high'
        elif detection_rate > 2 or fraud_cases > 5:
            return 'medium'
        else:
            return 'low'
    
    def _estimate_roi(self, fraud_prevented: float) -> Dict:
        """Estimate return on investment"""
        # Assume system cost is 0.1% of funds managed
        system_cost = fraud_prevented * 0.001
        roi_percentage = ((fraud_prevented - system_cost) / system_cost * 100) if system_cost > 0 else 0
        
        return {
            'estimated_system_cost': round(system_cost, 2),
            'fraud_prevented': round(fraud_prevented, 2),
            'net_savings': round(fraud_prevented - system_cost, 2),
            'roi_percentage': round(roi_percentage, 2)
        }
    
    def _generate_impact_summary(self, fraud_prevented: float, fraud_cases: int) -> str:
        """Generate impact summary"""
        return f"System has detected {fraud_cases} fraud cases and prevented approximately ₹{fraud_prevented:,.0f} in fraudulent disbursements, demonstrating significant positive impact on program integrity."

# Global instance
policy_insights_engine = PolicyInsightsEngine()
