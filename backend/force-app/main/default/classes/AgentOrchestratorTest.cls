@isTest
private class AgentOrchestratorTest {

    @isTest
    static void testRouting() {

        AgentOrchestrator orchestrator = new AgentOrchestrator();

        AgentOrchestrator.RoutingResult r;

        r = orchestrator.routeRequest('ACCOUNT_BRIEF');
        System.assertEquals('IntelAgent', r.agentName);

        r = orchestrator.routeRequest('GENERATE_EMAIL');
        System.assertEquals('GenerateAgent', r.agentName);

        r = orchestrator.routeRequest('BUILD_PROPOSAL');
        System.assertEquals('GenerateAgent', r.agentName);

        r = orchestrator.routeRequest('MEETING_PREP');
        System.assertEquals('IntelAgent', r.agentName);

        r = orchestrator.routeRequest('SCORE_DEAL');
        System.assertEquals('ScoreAgent', r.agentName);

        r = orchestrator.routeRequest('UNKNOWN');
        System.assertEquals('FallbackAgent', r.agentName);

        r = orchestrator.routeRequest('');
        System.assertEquals('UnknownAgent', r.agentName);
    }
}