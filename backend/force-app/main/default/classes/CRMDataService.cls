public with sharing class CRMDataService {
    
    // Query Account information
    public Account getAccountData(Id accountId) {
        if (accountId == null) return null;
        
        List<Account> accs = [
            SELECT Id, Name, Industry, AnnualRevenue, BillingCity, BillingState 
            FROM Account 
            WHERE Id = :accountId 
            LIMIT 1
        ];
        return accs.isEmpty() ? null : accs[0];
    }
    
    // Query Opportunities along with related Contacts (via OpportunityContactRoles if needed, or just Account Contacts)
    public List<Opportunity> getOpportunityData(Id accountId) {
        if (accountId == null) return new List<Opportunity>();
        
        return [
            SELECT Id, Name, StageName, Amount, CloseDate, Probability, ExpectedRevenue
            FROM Opportunity 
            WHERE AccountId = :accountId
            ORDER BY CloseDate DESC
        ];
    }
    
    // Query recent EmailMessage records
    public List<EmailMessage> getRecentEmails(Id accountId) {
        if (accountId == null) return new List<EmailMessage>();
        
        // Fetch emails associated with the Account
        return [
            SELECT Id, Subject, TextBody, HtmlBody, Status, MessageDate, Incoming, ToAddress, FromAddress 
            FROM EmailMessage 
            WHERE RelatedToId = :accountId
            ORDER BY MessageDate DESC 
            LIMIT 50
        ];
    }
    
    // Query Tasks / Activities as requested
    public List<Task> getRecentTasks(Id accountId) {
        if (accountId == null) return new List<Task>();
        
        return [
            SELECT Id, Subject, Status, Priority, ActivityDate, Description 
            FROM Task 
            WHERE WhatId = :accountId 
            ORDER BY ActivityDate DESC 
            LIMIT 50
        ];
    }
    
    // Query recent Contacts related to the Account
    public List<Contact> getAccountContacts(Id accountId) {
        if (accountId == null) return new List<Contact>();
        
        return [
            SELECT Id, FirstName, LastName, Title, Email, Phone 
            FROM Contact 
            WHERE AccountId = :accountId
        ];
    }
}