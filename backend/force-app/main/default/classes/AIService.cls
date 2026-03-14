public with sharing class AIService {

    public static String generateAccountSummary(Account acc){
        return 'AI generated summary for ' + (acc != null ? acc.Name : 'Unknown Account');
    }

    public static String generateSalesEmail(Account acc){
        return 'AI generated sales email for ' + (acc != null ? acc.Name : 'client');
    }

    public static String generateProposal(Account acc){
        return 'AI generated proposal for ' + (acc != null ? acc.Name : 'client');
    }

    public static String generateMeetingPrep(Account acc){
        return 'AI generated meeting preparation notes for ' + (acc != null ? acc.Name : 'client');
    }

    public static String generateSalesStrategy(Account acc){
        return 'AI generated sales strategy for ' + (acc != null ? acc.Name : 'client');
    }

}