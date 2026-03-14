/**
 * @description Main REST API Controller for SalesForge AI endpoints.
 * Base URL: /services/apexrest/salesforge/*
 */
@RestResource(urlMapping='/salesforge/*')
global with sharing class SalesForgeController {

    // Helper wrapper class to standardize JSON response format
    global class ApiResponse {
        public Object data;
        
        public ApiResponse(Object data) {
            this.data = data;
        }
    }

    @HttpGet
    global static void handleGet() {
        RestRequest req = RestContext.request;
        RestResponse res = RestContext.response;
        res.addHeader('Content-Type', 'application/json');
        
        String requestUri = req.requestURI;
        String action = requestUri.substring(requestUri.lastIndexOf('/') + 1);
        String accountIdStr = req.params.get('accountId');
        
        try {
            Id accountId = null;
            if (String.isNotBlank(accountIdStr)) {
                try {
                    accountId = (Id)accountIdStr;
                } catch (Exception e) {
                    res.statusCode = 400;
                    res.responseBody = Blob.valueOf('{"error": "Invalid Account ID format."}');
                    return;
                }
            }
            
            Object resultData;
            
            if (action == 'accountBrief') {
                if(accountId == null) { res.statusCode = 400; res.responseBody = Blob.valueOf('{"error": "Missing accountId"}'); return; }
                resultData = generateAccountBrief(accountId);
            } 
            else if (action == 'email') {
                if(accountId == null) { res.statusCode = 400; res.responseBody = Blob.valueOf('{"error": "Missing accountId"}'); return; }
                resultData = generateEmail(accountId);
            }
            else if (action == 'proposal') {
                if(accountId == null) { res.statusCode = 400; res.responseBody = Blob.valueOf('{"error": "Missing accountId"}'); return; }
                resultData = generateProposal(accountId);
            }
            else if (action == 'strategy') {
                if(accountId == null) { res.statusCode = 400; res.responseBody = Blob.valueOf('{"error": "Missing accountId"}'); return; }
                resultData = generateStrategy(accountId);
            } 
            else if (action == 'meetingPrep') {
                if(accountId == null) { res.statusCode = 400; res.responseBody = Blob.valueOf('{"error": "Missing accountId"}'); return; }
                resultData = generateMeetingPrep(accountId);
            }
            else if (action == 'completeData') {
                if(accountId == null) { res.statusCode = 400; res.responseBody = Blob.valueOf('{"error": "Missing accountId"}'); return; }
                resultData = getCompleteAccountData(accountId);
            }
            else if (action == 'accounts') {
                resultData = getAccountList();
            }
            else {
                res.statusCode = 404;
                res.responseBody = Blob.valueOf('{"error": "Endpoint not found: ' + action + '"}');
                return;
            }
            
            res.statusCode = 200;
            res.responseBody = Blob.valueOf(JSON.serialize(resultData));
            
        } catch (Exception e) {
            res.statusCode = 500;
            res.responseBody = Blob.valueOf('{"error": "' + e.getMessage() + '"}');
        }
    }
    
    // --- Controller Methods ---
    
    private static Map<String, Object> generateAccountBrief(Id accountId) {
        AgentOrchestrator orchestrator = new AgentOrchestrator();
        AgentOrchestrator.RoutingResult route = orchestrator.routeRequest('ACCOUNT_BRIEF');
        Map<String, Object> response = IntelAgent.process(accountId);
        response.put('routing', route);
        return response;
    }
    
    private static Map<String, Object> generateEmail(Id accountId) {
        AgentOrchestrator orchestrator = new AgentOrchestrator();
        AgentOrchestrator.RoutingResult route = orchestrator.routeRequest('GENERATE_EMAIL');
        Map<String, Object> response = GenerateAgent.processEmail(accountId);
        response.put('routing', route);
        return response;
    }
    
    private static Map<String, Object> generateProposal(Id accountId) {
        AgentOrchestrator orchestrator = new AgentOrchestrator();
        AgentOrchestrator.RoutingResult route = orchestrator.routeRequest('BUILD_PROPOSAL');
        Map<String, Object> response = GenerateAgent.processProposal(accountId);
        response.put('routing', route);
        return response;
    }
    
    private static Map<String, Object> generateStrategy(Id accountId) {
        AgentOrchestrator orchestrator = new AgentOrchestrator();
        AgentOrchestrator.RoutingResult route = orchestrator.routeRequest('SCORE_DEAL');
        Map<String, Object> response = ScoreAgent.processStrategy(accountId);
        response.put('routing', route);
        return response;
    }
    
    private static Map<String, Object> generateMeetingPrep(Id accountId) {
        AgentOrchestrator orchestrator = new AgentOrchestrator();
        AgentOrchestrator.RoutingResult route = orchestrator.routeRequest('MEETING_PREP');
        Map<String, Object> response = IntelAgent.processMeetingPrep(accountId);
        response.put('routing', route);
        return response;
    }
    
    private static Map<String, Object> getCompleteAccountData(Id accountId) {
        CRMDataService dataService = new CRMDataService();
        Account acc = dataService.getAccountData(accountId);
        List<Opportunity> opps = dataService.getOpportunityData(accountId);
        List<Contact> contacts = dataService.getAccountContacts(accountId);
        List<Task> tasks = dataService.getRecentTasks(accountId);
        
        List<EmailMessage> emails = dataService.getRecentEmails(accountId);
        
        BuyingSignalDetector detector = new BuyingSignalDetector();
        List<BuyingSignalDetector.SignalResult> emailSignals = detector.detectSignals(emails);
        
        return new Map<String, Object>{
            'account' => acc,
            'opportunities' => opps,
            'contacts' => contacts,
            'tasks' => tasks,
            'recentOpportunityEmails' => emails,
            'buyingSignals' => emailSignals
        };
    }
    
    private static List<Account> getAccountList() {
        return [SELECT Id, Name, Industry, AnnualRevenue FROM Account ORDER BY CreatedDate DESC LIMIT 50];
    }
}
