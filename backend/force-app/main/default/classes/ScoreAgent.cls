public with sharing class ScoreAgent {
    
    public static Map<String, Object> processStrategy(Id recordId) {

        CRMDataService dataService = new CRMDataService();

        List<Opportunity> opps = dataService.getOpportunityData(recordId);
        Opportunity primaryOpp = !opps.isEmpty() ? opps[0] : null;

        if (primaryOpp == null) {
            return new Map<String, Object>{
                'status' => 'No active opportunities found for health scoring.'
            };
        }

        DealHealthScorer scorer = new DealHealthScorer();
        DealHealthScorer.DealHealthResult health = scorer.calculateScore(primaryOpp);

        Account acc = dataService.getAccountData(recordId);
        String strategyText = AIService.generateSalesStrategy(acc);

        return new Map<String, Object>{
            'healthScore' => health.score,
            'healthGrade' => health.grade,
            'winProbability' => health.winProbability,
            'recommendedNextAction' => health.recommendedNextAction,
            'strategyRecommendation' => strategyText,
            'priorities' => new List<Map<String, String>>{
                new Map<String, String>{'title' => 'Executive Alignment', 'desc' => 'Confirm budget sign-off with CFO.', 'badge' => 'Critical', 'color' => 'red-500'},
                new Map<String, String>{'title' => 'Technical Validation', 'desc' => 'Finalize integration specs.', 'badge' => 'High', 'color' => 'warning'},
                new Map<String, String>{'title' => 'Contract Review', 'desc' => 'Send final MSA for signature.', 'badge' => 'Medium', 'color' => 'blue-500'}
            },
            'checklist' => new List<String>{
                'Schedule executive closing call',
                'Verify budget allocation',
                'Complete security review',
                'Finalize implementation timeline'
            }
        };
    }
}