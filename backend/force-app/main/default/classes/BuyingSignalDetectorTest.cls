@isTest
private class BuyingSignalDetectorTest {

    @isTest
    static void testSignalDetection() {

        // Create test emails
        EmailMessage e1 = new EmailMessage();
        e1.TextBody = 'Hi team, the budget approved and we are ready to move forward with the deal.';

        EmailMessage e2 = new EmailMessage();
        e2.TextBody = 'Can we schedule a demo next week? We are interested in the platform.';

        EmailMessage e3 = new EmailMessage();
        e3.TextBody = 'Let us discuss pricing discussion and next steps soon.';

        List<EmailMessage> emails = new List<EmailMessage>{e1, e2, e3};

        // Run detector
        BuyingSignalDetector detector = new BuyingSignalDetector();
        List<BuyingSignalDetector.SignalResult> results = detector.detectSignals(emails);

        // Validate results
        System.assert(results.size() > 0);

        // Test classifyIntent directly
        System.assertEquals('HIGH', detector.classifyIntent(50));
        System.assertEquals('MEDIUM', detector.classifyIntent(25));
        System.assertEquals('LOW', detector.classifyIntent(10));
    }
}