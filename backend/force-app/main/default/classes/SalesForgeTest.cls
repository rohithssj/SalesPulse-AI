@isTest
private class SalesForgeTest {

    @testSetup
    static void setupData(){

        Account acc = new Account(
            Name='Test Tech Corp',
            Industry='Technology'
        );
        insert acc;

        Opportunity opp = new Opportunity(
            Name='Test Opportunity',
            StageName='Prospecting',
            CloseDate=Date.today().addDays(30),
            Amount=50000,
            Probability=50,
            AccountId=acc.Id
        );
        insert opp;
    }

    @isTest
    static void testAgents(){

        Account acc = [SELECT Id, Name, Industry FROM Account LIMIT 1];

        Test.startTest();

        Map<String,Object> intel = IntelAgent.process(acc.Id);
        Map<String,Object> email = GenerateAgent.processEmail(acc.Id);
        Map<String,Object> proposal = GenerateAgent.processProposal(acc.Id);
        Map<String,Object> strategy = ScoreAgent.processStrategy(acc.Id);

        Test.stopTest();

        System.assertNotEquals(null, intel);
        System.assertNotEquals(null, email);
        System.assertNotEquals(null, proposal);
        System.assertNotEquals(null, strategy);
    }
}