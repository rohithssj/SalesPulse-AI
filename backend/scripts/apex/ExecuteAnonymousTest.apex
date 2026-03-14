// 1. Query existing CRM data
Account[] accs = [SELECT Id, Name, Industry FROM Account LIMIT 1];
if (accs.isEmpty()) {
    System.debug('No Accounts found in the database. Please insert test data first.');
    return;
}
Account acc = accs[0];

Opportunity[] opps = [SELECT Id, StageName, CloseDate, Probability, Amount FROM Opportunity WHERE AccountId = :acc.Id LIMIT 1];
Opportunity opp = opps.isEmpty() ? null : opps[0];

List<EmailMessage> emails = [SELECT Id, Subject, TextBody, HtmlBody FROM EmailMessage LIMIT 5];

System.debug('--- TEST SCRIPT START ---');
System.debug('Account Context: ' + acc.Name);

// 2. Call all services
CRMDataService dataService = new CRMDataService();
System.debug('Account Data: ' + dataService.getAccountData(acc.Id));
System.debug('Opportunity Data: ' + dataService.getOpportunityData(acc.Id));

BuyingSignalDetector signalDetector = new BuyingSignalDetector();
System.debug('Detected Buying Signals: ' + signalDetector.detectSignals(emails));

DealHealthScorer healthScorer = new DealHealthScorer();
if (opp != null) {
    System.debug('Deal Health Score: ' + healthScorer.calculateScore(opp));
} else {
    System.debug('No Opportunity linked to Account found to score.');
}

AgentOrchestrator orchestrator = new AgentOrchestrator();
System.debug('Agent Orchestrator Routing: ' + orchestrator.routeRequest('SCORE_DEAL'));

ProposalBuilder propBuilder = new ProposalBuilder();
if (opp != null && opp.Amount != null) {
    System.debug('Generated Proposal: ' + propBuilder.buildProposal(acc.Name, opp.Amount, acc.Industry));
}

System.debug('--- Running AI Agents ---');
System.debug('IntelAgent: ' + IntelAgent.process(acc.Id));
System.debug('GenerateAgent Email: ' + GenerateAgent.processEmail(acc.Id));
System.debug('ScoreAgent Strategy: ' + ScoreAgent.processStrategy(acc.Id));

System.debug('--- TEST SCRIPT END ---');
