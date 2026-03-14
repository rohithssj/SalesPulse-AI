/**
 * @description Agent responsible for account intelligence and meeting preparation.
 */
public with sharing class IntelAgent {

    /**
     * @description Processes an account brief request.
     * @param recordId The Account ID
     * @return Result map with account summary and buying signals
     */
    public static Map<String, Object> process(Id recordId) {
        CRMDataService dataService = new CRMDataService();
        Account acc = dataService.getAccountData(recordId);
        List<Opportunity> opps = dataService.getOpportunityData(recordId);
        
        String intentLevel = 'LOW';
        List<String> detectedKeywords = new List<String>();
        
        if (!opps.isEmpty()) {
            List<EmailMessage> emails = dataService.getRecentEmails(recordId);
            List<Task> tasks = dataService.getRecentTasks(recordId);
            
            BuyingSignalDetector detector = new BuyingSignalDetector();
            List<BuyingSignalDetector.SignalResult> emailSignals = detector.detectSignals(emails);
            List<BuyingSignalDetector.SignalResult> taskSignals = detector.detectSignalsFromTasks(tasks);
            
            List<BuyingSignalDetector.SignalResult> allSignals = new List<BuyingSignalDetector.SignalResult>();
            allSignals.addAll(emailSignals);
            allSignals.addAll(taskSignals);
            
            for(BuyingSignalDetector.SignalResult signal : allSignals) {
                if (!detectedKeywords.contains(signal.keyword)) {
                    detectedKeywords.add(signal.keyword);
                }
                if(signal.intentLevel == 'HIGH') {
                    intentLevel = 'HIGH';
                } else if(signal.intentLevel == 'MEDIUM' && intentLevel != 'HIGH') {
                    intentLevel = 'MEDIUM';
                }
            }
        }
        
        String summary = AIService.generateAccountSummary(acc);

        return new Map<String, Object>{
            'accountName' => (acc != null ? acc.Name : null),
            'industry' => (acc != null ? acc.Industry : null),
            'summary' => summary,
            'buyingSignal' => new Map<String, Object>{
                'level' => intentLevel,
                'keywords' => detectedKeywords
            }
        };
    }

    /**
     * @description Processes a meeting prep request.
     * @param recordId The Account ID
     * @return Result map with meeting prep notes
     */
    public static Map<String, Object> processMeetingPrep(Id recordId) {
        CRMDataService dataService = new CRMDataService();
        Account acc = dataService.getAccountData(recordId);
        String notes = AIService.generateMeetingPrep(acc);
        
        return new Map<String, Object>{
            'notes' => notes,
            'accountName' => (acc != null ? acc.Name : null)
        };
    }
}