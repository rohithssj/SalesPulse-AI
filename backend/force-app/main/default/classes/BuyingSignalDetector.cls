public with sharing class BuyingSignalDetector {

    public class SignalResult {
        public String keyword { get; set; }
        public String intentLevel { get; set; } // HIGH, MEDIUM, LOW
        public String quoteContext { get; set; }
        
        public SignalResult(String keyword, String intentLevel, String quoteContext) {
            this.keyword = keyword;
            this.intentLevel = intentLevel;
            this.quoteContext = quoteContext;
        }
    }

    private static final Map<String, Integer> KEYWORD_SCORES = new Map<String, Integer>{
        'budget approved' => 50,
        'ready to move forward' => 45,
        'send proposal' => 40,
        'contract review' => 35,
        'pricing discussion' => 25,
        'next steps' => 20,
        'schedule a demo' => 15,
        'interested' => 10,
        'follow up' => 5,
        'questions' => 5,
        'help' => 5,
        'demo' => 15,
        'pricing' => 20,
        'proposal' => 30,
        'call' => 10,
        'meeting' => 15,
        'ai platform' => 30,
        'integration' => 25,
        'enterprise support' => 20,
        'security' => 25,
        'automation' => 30
    };

    // Scan Task subjects and descriptions
    public List<SignalResult> detectSignalsFromTasks(List<Task> tasks) {
        List<SignalResult> detectedSignals = new List<SignalResult>();
        if (tasks == null || tasks.isEmpty()) return detectedSignals;
        
        for (Task t : tasks) {
            String text = (t.Subject + ' ' + (t.Description != null ? t.Description : '')).toLowerCase();
            for (String keyword : KEYWORD_SCORES.keySet()) {
                if (text.contains(keyword)) {
                    detectedSignals.add(new SignalResult(keyword, classifyIntent(KEYWORD_SCORES.get(keyword)), 'Task: ' + t.Subject));
                }
            }
        }
        return detectedSignals;
    }

    // Scan email bodies and detect buying signals
    public List<SignalResult> detectSignals(List<EmailMessage> emails) {
        List<SignalResult> detectedSignals = new List<SignalResult>();
        
        if (emails == null || emails.isEmpty()) {
            return detectedSignals;
        }
        
        for (EmailMessage email : emails) {
            String bodyToScan = '';
            if (String.isNotBlank(email.TextBody)) {
                bodyToScan = email.TextBody.toLowerCase();
            } else if (String.isNotBlank(email.HtmlBody)) {
                bodyToScan = email.HtmlBody.stripHtmlTags().toLowerCase();
            }
            
            if (String.isBlank(bodyToScan)) continue;
            
            for (String keyword : KEYWORD_SCORES.keySet()) {
                if (bodyToScan.contains(keyword)) {
                    Integer score = KEYWORD_SCORES.get(keyword);
                    String intentLevel = classifyIntent(score);
                    
                    // Extract a snippet around the keyword for context (naive implementation)
                    Integer startIndex = Math.max(0, bodyToScan.indexOf(keyword) - 30);
                    Integer endIndex = Math.min(bodyToScan.length(), bodyToScan.indexOf(keyword) + keyword.length() + 30);
                    String quote = bodyToScan.substring(startIndex, endIndex).trim();
                    
                    detectedSignals.add(new SignalResult(keyword, intentLevel, '...' + quote + '...'));
                }
            }
        }
        
        return detectedSignals;
    }

    // Classify intent based on weight score
    public String classifyIntent(Integer score) {
        if (score >= 40) {
            return 'HIGH';
        } else if (score >= 20) {
            return 'MEDIUM';
        } else {
            return 'LOW';
        }
    }
}