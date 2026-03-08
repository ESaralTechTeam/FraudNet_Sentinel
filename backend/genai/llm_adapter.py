"""
Pluggable LLM Adapter Interface
Supports multiple LLM backends (OpenAI, Anthropic, Local models, etc.)
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional
import json

class LLMAdapter(ABC):
    """Abstract base class for LLM adapters"""
    
    @abstractmethod
    def generate(self, prompt: str, max_tokens: int = 500) -> str:
        """Generate text from prompt"""
        pass
    
    @abstractmethod
    def generate_structured(self, prompt: str, schema: Dict) -> Dict:
        """Generate structured output matching schema"""
        pass

class LocalLLMAdapter(LLMAdapter):
    """Local LLM adapter using rule-based generation for demo"""
    
    def __init__(self):
        self.model_name = "local-demo"
    
    def generate(self, prompt: str, max_tokens: int = 500) -> str:
        """Generate text using template-based approach"""
        # In production, this would call a local LLM
        # For demo, use intelligent templates
        
        if "summarize complaint" in prompt.lower():
            return self._generate_complaint_summary(prompt)
        elif "case summary" in prompt.lower():
            return self._generate_case_summary(prompt)
        elif "corruption pattern" in prompt.lower():
            return self._generate_pattern_analysis(prompt)
        elif "governance query" in prompt.lower():
            return self._generate_query_response(prompt)
        else:
            return self._generate_generic_response(prompt)
    
    def generate_structured(self, prompt: str, schema: Dict) -> Dict:
        """Generate structured output"""
        # Extract key information and structure it
        response = self.generate(prompt)
        
        # Parse response into schema
        if "summary" in schema:
            return {
                "summary": response,
                "key_points": self._extract_key_points(response),
                "recommendations": self._extract_recommendations(response)
            }
        
        return {"response": response}
    
    def _generate_complaint_summary(self, prompt: str) -> str:
        """Generate complaint summary"""
        # Extract complaint details from prompt
        lines = prompt.split('\n')
        
        summary_parts = []
        summary_parts.append("COMPLAINT SUMMARY:")
        summary_parts.append("A citizen has reported concerns regarding potential fraud in welfare fund distribution.")
        
        # Extract key details
        if "urgent" in prompt.lower() or "critical" in prompt.lower():
            summary_parts.append("URGENCY: HIGH - Immediate attention required.")
        
        if "duplicate" in prompt.lower():
            summary_parts.append("ISSUE: Suspected duplicate beneficiary registration.")
        elif "ghost" in prompt.lower():
            summary_parts.append("ISSUE: Suspected ghost beneficiary (non-existent person).")
        elif "bribe" in prompt.lower() or "corrupt" in prompt.lower():
            summary_parts.append("ISSUE: Alleged corruption or bribery in approval process.")
        
        summary_parts.append("\nRECOMMENDED ACTION: Field verification and document review required.")
        
        return "\n".join(summary_parts)
    
    def _generate_case_summary(self, prompt: str) -> str:
        """Generate case summary for audits"""
        return """AUDIT CASE SUMMARY:

Investigation revealed multiple indicators of fraudulent activity:
- Duplicate identity patterns detected with 85% similarity
- Shared bank account across multiple beneficiaries
- Unusually fast approval timeline (2 hours vs average 5 days)
- Geographic inconsistencies in address verification

FINDINGS:
The case involves a coordinated fraud network with 3-5 connected beneficiaries sharing resources. Pattern analysis suggests organized fraud rather than isolated incidents.

RECOMMENDATION:
1. Freeze all related payments pending investigation
2. Conduct field verification of all linked beneficiaries
3. Review approval officer's recent cases for similar patterns
4. Escalate to vigilance department for criminal investigation

ESTIMATED IMPACT: ₹2.5L in potential fraudulent disbursements prevented."""
    
    def _generate_pattern_analysis(self, prompt: str) -> str:
        """Generate corruption pattern analysis"""
        return """CORRUPTION PATTERN ANALYSIS:

IDENTIFIED PATTERNS:
1. Hub Pattern (Shared Resources):
   - Multiple beneficiaries using same bank account
   - Indicates coordinated fraud operation
   - Prevalence: 15% of high-risk cases

2. Rapid Approval Pattern:
   - Approvals completed in <4 hours
   - Bypasses normal verification procedures
   - Suggests officer involvement

3. Geographic Clustering:
   - Suspicious beneficiaries concentrated in specific blocks
   - May indicate local corruption networks

TREND ANALYSIS:
- Fraud detection rate increased 25% this month
- District1 shows highest concentration of suspicious activity
- Weekend approvals show 3x higher fraud rate

RECOMMENDATIONS:
- Strengthen approval workflows in high-risk districts
- Implement mandatory cooling period for high-value transactions
- Conduct officer training on fraud indicators"""
    
    def _generate_query_response(self, prompt: str) -> str:
        """Generate response to governance queries"""
        if "how many" in prompt.lower():
            return "Based on current data, there are 5 registered beneficiaries with 2 flagged as high-risk. The system has detected 1 active fraud network involving shared bank accounts."
        elif "what is" in prompt.lower():
            return "The risk score represents the probability of fraudulent activity based on multiple AI models analyzing duplicate patterns, transaction anomalies, network connections, and complaint history."
        else:
            return "The governance intelligence system analyzes multiple data sources to detect fraud patterns, assess risk, and provide actionable insights for decision-makers."
    
    def _generate_generic_response(self, prompt: str) -> str:
        """Generate generic response"""
        return "Analysis complete. The system has processed the request and generated insights based on available data."
    
    def _extract_key_points(self, text: str) -> List[str]:
        """Extract key points from text"""
        points = []
        for line in text.split('\n'):
            if line.strip() and (line.startswith('-') or line.startswith('•') or ':' in line):
                points.append(line.strip())
        return points[:5]  # Top 5 points
    
    def _extract_recommendations(self, text: str) -> List[str]:
        """Extract recommendations from text"""
        recommendations = []
        in_recommendations = False
        
        for line in text.split('\n'):
            if 'RECOMMENDATION' in line.upper():
                in_recommendations = True
                continue
            if in_recommendations and line.strip():
                if line.strip().startswith(('1.', '2.', '3.', '-', '•')):
                    recommendations.append(line.strip())
        
        return recommendations

class OpenAIAdapter(LLMAdapter):
    """OpenAI GPT adapter (for future use)"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.model = "gpt-4"
    
    def generate(self, prompt: str, max_tokens: int = 500) -> str:
        """Generate using OpenAI API"""
        # Placeholder for OpenAI integration
        # import openai
        # response = openai.ChatCompletion.create(...)
        raise NotImplementedError("OpenAI adapter requires API key configuration")
    
    def generate_structured(self, prompt: str, schema: Dict) -> Dict:
        """Generate structured output using function calling"""
        raise NotImplementedError("OpenAI adapter requires API key configuration")

class AnthropicAdapter(LLMAdapter):
    """Anthropic Claude adapter (for future use)"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.model = "claude-3-sonnet"
    
    def generate(self, prompt: str, max_tokens: int = 500) -> str:
        """Generate using Anthropic API"""
        raise NotImplementedError("Anthropic adapter requires API key configuration")
    
    def generate_structured(self, prompt: str, schema: Dict) -> Dict:
        """Generate structured output"""
        raise NotImplementedError("Anthropic adapter requires API key configuration")

# Factory function
def get_llm_adapter(adapter_type: str = "local", **kwargs) -> LLMAdapter:
    """Get LLM adapter instance"""
    adapters = {
        "local": LocalLLMAdapter,
        "openai": OpenAIAdapter,
        "anthropic": AnthropicAdapter
    }
    
    adapter_class = adapters.get(adapter_type.lower())
    if not adapter_class:
        raise ValueError(f"Unknown adapter type: {adapter_type}")
    
    return adapter_class(**kwargs)

# Global instance
llm_adapter = get_llm_adapter("local")
