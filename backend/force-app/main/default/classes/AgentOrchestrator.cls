public with sharing class AgentOrchestrator {
    
    public class RoutingResult {
        public String agentName { get; set; }
        public String action { get; set; }
        public String message { get; set; }
        
        public RoutingResult(String agentName, String action, String message) {
            this.agentName = agentName;
            this.action = action;
            this.message = message;
        }
    }

    // Routes request to the correct agent based on requestType
    public RoutingResult routeRequest(String requestType) {
        if (String.isBlank(requestType)) {
            return new RoutingResult('UnknownAgent', 'UNKNOWN', 'Invalid request type provided.');
        }
        
        String standardizedType = requestType.trim().toUpperCase();
        
        switch on standardizedType {
            when 'ACCOUNT_BRIEF' {
                return new RoutingResult(
                    'IntelAgent', 
                    'GENERATE_BRIEF', 
                    'IntelAgent is compiling Account intelligence and recent activities.'
                );
            }
            when 'GENERATE_EMAIL' {
                return new RoutingResult(
                    'GenerateAgent', 
                    'DRAFT_EMAIL', 
                    'GenerateAgent is drafting a personalized email based on context.'
                );
            }
            when 'BUILD_PROPOSAL' {
                return new RoutingResult(
                    'GenerateAgent', 
                    'CREATE_PROPOSAL', 
                    'GenerateAgent is structuring a sales proposal using CRM data.'
                );
            }
            when 'MEETING_PREP' {
                return new RoutingResult(
                    'IntelAgent', 
                    'PREP_MEETING', 
                    'IntelAgent is summarizing deal history for the upcoming meeting.'
                );
            }
            when 'SCORE_DEAL' {
                return new RoutingResult(
                    'ScoreAgent', 
                    'EVALUATE_HEALTH', 
                    'ScoreAgent is analyzing factors to compute deal health score.'
                );
            }
            when else {
                return new RoutingResult(
                    'FallbackAgent', 
                    'DEFAULT_HANDLING', 
                    'Request type not recognized. Fallback agent invoked.'
                );
            }
        }
    }
}