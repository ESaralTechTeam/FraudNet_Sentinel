"""
Case Management & Role-Based Workflows
Manages case lifecycle and role-specific actions
"""

from typing import Dict, List, Optional
from datetime import datetime, timedelta
from enum import Enum

class CaseStatus(str, Enum):
    CREATED = "created"
    ASSIGNED = "assigned"
    UNDER_INVESTIGATION = "under_investigation"
    PENDING_VERIFICATION = "pending_verification"
    VERIFIED = "verified"
    ESCALATED = "escalated"
    RESOLVED = "resolved"
    CLOSED = "closed"

class UserRole(str, Enum):
    CITIZEN = "citizen"
    OFFICER = "officer"
    AUDITOR = "auditor"
    ADMINISTRATOR = "administrator"
    VIGILANCE = "vigilance"

class CaseManager:
    """Manage case lifecycle and workflows"""
    
    def __init__(self):
        self.status_transitions = {
            CaseStatus.CREATED: [CaseStatus.ASSIGNED, CaseStatus.CLOSED],
            CaseStatus.ASSIGNED: [CaseStatus.UNDER_INVESTIGATION, CaseStatus.ESCALATED],
            CaseStatus.UNDER_INVESTIGATION: [CaseStatus.PENDING_VERIFICATION, CaseStatus.ESCALATED, CaseStatus.RESOLVED],
            CaseStatus.PENDING_VERIFICATION: [CaseStatus.VERIFIED, CaseStatus.UNDER_INVESTIGATION],
            CaseStatus.VERIFIED: [CaseStatus.RESOLVED, CaseStatus.ESCALATED],
            CaseStatus.ESCALATED: [CaseStatus.UNDER_INVESTIGATION, CaseStatus.RESOLVED],
            CaseStatus.RESOLVED: [CaseStatus.CLOSED],
            CaseStatus.CLOSED: []
        }
        
        self.role_permissions = {
            UserRole.OFFICER: [
                'view_case', 'assign_case', 'update_status', 'add_notes',
                'request_verification', 'resolve_case'
            ],
            UserRole.AUDITOR: [
                'view_case', 'view_all_cases', 'generate_report',
                'escalate_case', 'add_audit_notes'
            ],
            UserRole.ADMINISTRATOR: [
                'view_all_cases', 'assign_case', 'escalate_case',
                'close_case', 'view_analytics', 'manage_users'
            ],
            UserRole.VIGILANCE: [
                'view_all_cases', 'escalate_case', 'investigate',
                'recommend_action', 'close_case'
            ]
        }
    
    def create_case(self, case_data: Dict, created_by: str) -> Dict:
        """Create a new case"""
        case_id = f"CASE{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        case = {
            'case_id': case_id,
            'case_type': case_data.get('case_type', 'fraud_investigation'),
            'title': case_data.get('title'),
            'description': case_data.get('description'),
            'status': CaseStatus.CREATED,
            'priority': case_data.get('priority', 'medium'),
            'beneficiary_ids': case_data.get('beneficiary_ids', []),
            'alert_ids': case_data.get('alert_ids', []),
            'complaint_ids': case_data.get('complaint_ids', []),
            'assigned_to': None,
            'created_by': created_by,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'timeline': [
                {
                    'status': CaseStatus.CREATED,
                    'timestamp': datetime.now().isoformat(),
                    'actor': created_by,
                    'action': 'case_created',
                    'notes': 'Case created from alert/complaint'
                }
            ],
            'sla': self._calculate_sla(case_data.get('priority', 'medium'))
        }
        
        return case
    
    def assign_case(self, case: Dict, officer_id: str, assigned_by: str) -> Dict:
        """Assign case to an officer"""
        if not self._can_transition(case['status'], CaseStatus.ASSIGNED):
            raise ValueError(f"Cannot assign case in status {case['status']}")
        
        case['status'] = CaseStatus.ASSIGNED
        case['assigned_to'] = officer_id
        case['updated_at'] = datetime.now().isoformat()
        
        case['timeline'].append({
            'status': CaseStatus.ASSIGNED,
            'timestamp': datetime.now().isoformat(),
            'actor': assigned_by,
            'action': 'case_assigned',
            'notes': f'Case assigned to {officer_id}'
        })
        
        return case
    
    def update_status(self, case: Dict, new_status: CaseStatus, actor: str, notes: str = "") -> Dict:
        """Update case status"""
        if not self._can_transition(case['status'], new_status):
            raise ValueError(f"Cannot transition from {case['status']} to {new_status}")
        
        old_status = case['status']
        case['status'] = new_status
        case['updated_at'] = datetime.now().isoformat()
        
        case['timeline'].append({
            'status': new_status,
            'timestamp': datetime.now().isoformat(),
            'actor': actor,
            'action': 'status_updated',
            'notes': notes or f'Status changed from {old_status} to {new_status}'
        })
        
        return case
    
    def add_evidence(self, case: Dict, evidence: Dict, added_by: str) -> Dict:
        """Add evidence to case"""
        if 'evidence' not in case:
            case['evidence'] = []
        
        evidence_entry = {
            'evidence_id': f"EVD{len(case['evidence'])+1:03d}",
            'type': evidence.get('type'),
            'description': evidence.get('description'),
            'file_url': evidence.get('file_url'),
            'added_by': added_by,
            'added_at': datetime.now().isoformat()
        }
        
        case['evidence'].append(evidence_entry)
        case['updated_at'] = datetime.now().isoformat()
        
        return case
    
    def add_notes(self, case: Dict, notes: str, added_by: str) -> Dict:
        """Add notes to case"""
        if 'notes' not in case:
            case['notes'] = []
        
        note_entry = {
            'note_id': f"NOTE{len(case['notes'])+1:03d}",
            'content': notes,
            'added_by': added_by,
            'added_at': datetime.now().isoformat()
        }
        
        case['notes'].append(note_entry)
        case['updated_at'] = datetime.now().isoformat()
        
        return case
    
    def escalate_case(self, case: Dict, escalated_by: str, reason: str) -> Dict:
        """Escalate case to higher authority"""
        case['status'] = CaseStatus.ESCALATED
        case['priority'] = 'critical'
        case['updated_at'] = datetime.now().isoformat()
        
        case['timeline'].append({
            'status': CaseStatus.ESCALATED,
            'timestamp': datetime.now().isoformat(),
            'actor': escalated_by,
            'action': 'case_escalated',
            'notes': f'Case escalated: {reason}'
        })
        
        return case
    
    def resolve_case(self, case: Dict, resolution: Dict, resolved_by: str) -> Dict:
        """Resolve case with findings"""
        case['status'] = CaseStatus.RESOLVED
        case['resolution'] = {
            'outcome': resolution.get('outcome'),
            'findings': resolution.get('findings'),
            'actions_taken': resolution.get('actions_taken'),
            'resolved_by': resolved_by,
            'resolved_at': datetime.now().isoformat()
        }
        case['updated_at'] = datetime.now().isoformat()
        
        case['timeline'].append({
            'status': CaseStatus.RESOLVED,
            'timestamp': datetime.now().isoformat(),
            'actor': resolved_by,
            'action': 'case_resolved',
            'notes': f"Case resolved: {resolution.get('outcome')}"
        })
        
        return case
    
    def close_case(self, case: Dict, closed_by: str, closure_notes: str = "") -> Dict:
        """Close case"""
        if case['status'] != CaseStatus.RESOLVED:
            raise ValueError("Can only close resolved cases")
        
        case['status'] = CaseStatus.CLOSED
        case['closed_at'] = datetime.now().isoformat()
        case['closed_by'] = closed_by
        case['updated_at'] = datetime.now().isoformat()
        
        case['timeline'].append({
            'status': CaseStatus.CLOSED,
            'timestamp': datetime.now().isoformat(),
            'actor': closed_by,
            'action': 'case_closed',
            'notes': closure_notes or 'Case closed'
        })
        
        return case
    
    def check_permission(self, role: UserRole, action: str) -> bool:
        """Check if role has permission for action"""
        return action in self.role_permissions.get(role, [])
    
    def get_cases_for_role(self, role: UserRole, user_id: str, cases: List[Dict]) -> List[Dict]:
        """Get cases visible to role"""
        if role in [UserRole.AUDITOR, UserRole.ADMINISTRATOR, UserRole.VIGILANCE]:
            return cases  # Can see all cases
        elif role == UserRole.OFFICER:
            return [c for c in cases if c.get('assigned_to') == user_id or c.get('created_by') == user_id]
        else:
            return []
    
    def get_pending_actions(self, case: Dict, role: UserRole) -> List[str]:
        """Get pending actions for role"""
        actions = []
        status = case['status']
        
        if role == UserRole.OFFICER:
            if status == CaseStatus.CREATED:
                actions.append('assign_case')
            elif status == CaseStatus.ASSIGNED:
                actions.append('start_investigation')
            elif status == CaseStatus.UNDER_INVESTIGATION:
                actions.extend(['request_verification', 'resolve_case'])
            elif status == CaseStatus.VERIFIED:
                actions.append('resolve_case')
        
        elif role == UserRole.AUDITOR:
            if status in [CaseStatus.UNDER_INVESTIGATION, CaseStatus.VERIFIED]:
                actions.extend(['add_audit_notes', 'generate_report'])
        
        elif role == UserRole.ADMINISTRATOR:
            if status == CaseStatus.CREATED:
                actions.append('assign_case')
            if status in [CaseStatus.UNDER_INVESTIGATION, CaseStatus.VERIFIED]:
                actions.append('escalate_case')
            if status == CaseStatus.RESOLVED:
                actions.append('close_case')
        
        return actions
    
    def _can_transition(self, current_status: str, new_status: str) -> bool:
        """Check if status transition is valid"""
        allowed_transitions = self.status_transitions.get(current_status, [])
        return new_status in allowed_transitions
    
    def _calculate_sla(self, priority: str) -> Dict:
        """Calculate SLA deadlines"""
        now = datetime.now()
        
        if priority == 'critical':
            response_time = timedelta(hours=4)
            resolution_time = timedelta(days=2)
        elif priority == 'high':
            response_time = timedelta(hours=24)
            resolution_time = timedelta(days=7)
        elif priority == 'medium':
            response_time = timedelta(days=2)
            resolution_time = timedelta(days=14)
        else:  # low
            response_time = timedelta(days=5)
            resolution_time = timedelta(days=30)
        
        return {
            'response_deadline': (now + response_time).isoformat(),
            'resolution_deadline': (now + resolution_time).isoformat(),
            'priority': priority
        }

class WorkflowEngine:
    """Execute role-specific workflows"""
    
    def __init__(self):
        self.case_manager = CaseManager()
    
    def officer_workflow(self, action: str, case: Dict, officer_id: str, **kwargs) -> Dict:
        """Execute officer workflow actions"""
        if action == 'review_case':
            return self._officer_review(case, officer_id)
        elif action == 'start_investigation':
            return self.case_manager.update_status(
                case, CaseStatus.UNDER_INVESTIGATION, officer_id,
                "Investigation started"
            )
        elif action == 'request_verification':
            return self.case_manager.update_status(
                case, CaseStatus.PENDING_VERIFICATION, officer_id,
                "Field verification requested"
            )
        elif action == 'resolve':
            return self.case_manager.resolve_case(
                case, kwargs.get('resolution', {}), officer_id
            )
        else:
            raise ValueError(f"Unknown officer action: {action}")
    
    def auditor_workflow(self, action: str, case: Dict, auditor_id: str, **kwargs) -> Dict:
        """Execute auditor workflow actions"""
        if action == 'generate_audit_report':
            return self._generate_audit_report(case, auditor_id)
        elif action == 'add_audit_notes':
            return self.case_manager.add_notes(
                case, kwargs.get('notes', ''), auditor_id
            )
        elif action == 'escalate':
            return self.case_manager.escalate_case(
                case, auditor_id, kwargs.get('reason', 'Audit findings require escalation')
            )
        else:
            raise ValueError(f"Unknown auditor action: {action}")
    
    def admin_workflow(self, action: str, case: Dict, admin_id: str, **kwargs) -> Dict:
        """Execute administrator workflow actions"""
        if action == 'assign':
            return self.case_manager.assign_case(
                case, kwargs.get('officer_id'), admin_id
            )
        elif action == 'escalate':
            return self.case_manager.escalate_case(
                case, admin_id, kwargs.get('reason', 'Administrative escalation')
            )
        elif action == 'close':
            return self.case_manager.close_case(
                case, admin_id, kwargs.get('notes', '')
            )
        else:
            raise ValueError(f"Unknown admin action: {action}")
    
    def _officer_review(self, case: Dict, officer_id: str) -> Dict:
        """Officer reviews case"""
        review = {
            'reviewed_by': officer_id,
            'reviewed_at': datetime.now().isoformat(),
            'status': 'reviewed',
            'next_actions': self.case_manager.get_pending_actions(case, UserRole.OFFICER)
        }
        
        if 'reviews' not in case:
            case['reviews'] = []
        case['reviews'].append(review)
        
        return case
    
    def _generate_audit_report(self, case: Dict, auditor_id: str) -> Dict:
        """Generate audit report for case"""
        report = {
            'report_id': f"RPT{datetime.now().strftime('%Y%m%d%H%M%S')}",
            'case_id': case['case_id'],
            'generated_by': auditor_id,
            'generated_at': datetime.now().isoformat(),
            'summary': f"Audit report for case {case['case_id']}",
            'findings': case.get('evidence', []),
            'recommendations': self._generate_recommendations(case)
        }
        
        return report
    
    def _generate_recommendations(self, case: Dict) -> List[str]:
        """Generate recommendations based on case"""
        recommendations = []
        
        if case.get('priority') == 'critical':
            recommendations.append('Immediate action required')
        
        if len(case.get('beneficiary_ids', [])) > 1:
            recommendations.append('Investigate all linked beneficiaries')
        
        recommendations.append('Document all findings thoroughly')
        recommendations.append('Follow up within SLA deadlines')
        
        return recommendations

# Global instances
case_manager = CaseManager()
workflow_engine = WorkflowEngine()
