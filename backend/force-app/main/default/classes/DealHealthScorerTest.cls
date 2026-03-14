@isTest
private class DealHealthScorerTest {

    @isTest
    static void testDealHealthCalculation() {

        // Create Account (required for Opportunity)
        Account acc = new Account(Name = 'Test Deal Account');
        insert acc;

        // Opportunity with good health
        Opportunity opp1 = new Opportunity(
            Name = 'Healthy Deal',
            StageName = 'Negotiation/Review',
            CloseDate = Date.today().addDays(20),
            Probability = 80,
            Amount = 100000,
            AccountId = acc.Id
        );
        insert opp1;

        // Opportunity with medium health
        Opportunity opp2 = new Opportunity(
            Name = 'Medium Deal',
            StageName = 'Qualification',
            CloseDate = Date.today().addDays(60),
            Probability = 50,
            Amount = 50000,
            AccountId = acc.Id
        );
        insert opp2;

        // Opportunity with poor health (overdue)
        Opportunity opp3 = new Opportunity(
            Name = 'Risky Deal',
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(-10),
            Probability = 10,
            Amount = 20000,
            AccountId = acc.Id
        );
        insert opp3;

        DealHealthScorer scorer = new DealHealthScorer();

        // Test calculateScore
        DealHealthScorer.DealHealthResult r1 = scorer.calculateScore(opp1);
        DealHealthScorer.DealHealthResult r2 = scorer.calculateScore(opp2);
        DealHealthScorer.DealHealthResult r3 = scorer.calculateScore(opp3);

        // Assertions
        System.assertNotEquals(null, r1);
        System.assertNotEquals(null, r2);
        System.assertNotEquals(null, r3);

        System.assert(r1.score > r2.score);
        System.assert(r2.score > r3.score);

        // Test next action logic
        String actionA = scorer.determineNextAction(85);
        String actionB = scorer.determineNextAction(65);
        String actionC = scorer.determineNextAction(45);
        String actionD = scorer.determineNextAction(20);

        System.assertNotEquals(null, actionA);
        System.assertNotEquals(null, actionB);
        System.assertNotEquals(null, actionC);
        System.assertNotEquals(null, actionD);
    }
}