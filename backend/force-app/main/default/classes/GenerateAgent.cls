/**
 * @description Agent responsible for generating sales content (emails, proposals).
 */
public with sharing class GenerateAgent {
    
    /**
     * @description Generates a sales email for a given account.
     * @param recordId The Account ID
     * @return Result map with generated email content
     */
    public static Map<String, Object> processEmail(Id recordId) {
        CRMDataService dataService = new CRMDataService();
        Account acc = dataService.getAccountData(recordId);
        String emailContent = AIService.generateSalesEmail(acc);
        
        return new Map<String, Object>{
            'content' => emailContent,
            'type' => 'Email',
            'subject' => 'Follow up: ' + (acc != null ? acc.Name : 'Client')
        };
    }
    
    /**
     * @description Generates a sales proposal for a given account.
     * @param recordId The Account ID
     * @return Result map with generated proposal content
     */
    public static Map<String, Object> processProposal(Id recordId) {
        CRMDataService dataService = new CRMDataService();
        Account acc = dataService.getAccountData(recordId);
        String proposalContent = AIService.generateProposal(acc);
        
        return new Map<String, Object>{
            'content' => proposalContent,
            'type' => 'Proposal',
            'title' => 'Proposal for ' + (acc != null ? acc.Name : 'Client')
        };
    }
}