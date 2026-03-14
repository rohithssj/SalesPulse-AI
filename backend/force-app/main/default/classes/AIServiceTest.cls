@isTest
private class AIServiceTest {

    @isTest
    static void testAIService() {

        Account acc = new Account(
            Name = 'Test AI Account',
            Industry = 'Technology'
        );

        Test.startTest();

        String summary = AIService.generateAccountSummary(acc);
        String email = AIService.generateSalesEmail(acc);
        String proposal = AIService.generateProposal(acc);
        String meetingPrep = AIService.generateMeetingPrep(acc);
        String strategy = AIService.generateSalesStrategy(acc);

        Test.stopTest();

        System.assertNotEquals(null, summary);
        System.assertNotEquals(null, email);
        System.assertNotEquals(null, proposal);
        System.assertNotEquals(null, meetingPrep);
        System.assertNotEquals(null, strategy);
    }
}