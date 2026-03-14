@isTest
private class CRMDataServiceTest {

    @isTest
    static void testCRMService() {

        // Create Account
        Account acc = new Account(
            Name = 'Test Account'
        );
        insert acc;

        // Create Opportunity
        Opportunity opp = new Opportunity(
            Name = 'Test Opp',
            StageName = 'Prospecting',
            CloseDate = Date.today().addDays(30),
            AccountId = acc.Id
        );
        insert opp;

        // Create Contact
        Contact con = new Contact(
            FirstName = 'Test',
            LastName = 'User',
            AccountId = acc.Id
        );
        insert con;

        // Create Task
        Task t = new Task(
            Subject = 'Follow up',
            WhatId = acc.Id,
            Status = 'Not Started',
            Priority = 'Normal',
            ActivityDate = Date.today()
        );
        insert t;

        CRMDataService service = new CRMDataService();

        // Test account query
        Account resultAcc = service.getAccountData(acc.Id);
        System.assertNotEquals(null, resultAcc);

        // Test opportunity query
        List<Opportunity> opps = service.getOpportunityData(acc.Id);
        System.assert(opps.size() > 0);

        // Test tasks query
        List<Task> tasks = service.getRecentTasks(acc.Id);
        System.assert(tasks.size() > 0);

        // Test contacts query
        List<Contact> contacts = service.getAccountContacts(acc.Id);
        System.assert(contacts.size() > 0);

        // Test email method safely (no insert)
        List<EmailMessage> emails = service.getRecentEmails(acc.Id);
        System.assertNotEquals(null, emails);

        // Test null cases
        System.assertEquals(null, service.getAccountData(null));
        System.assertEquals(0, service.getOpportunityData(null).size());
        System.assertEquals(0, service.getRecentTasks(null).size());
        System.assertEquals(0, service.getAccountContacts(null).size());
    }
}