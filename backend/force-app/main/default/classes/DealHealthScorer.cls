public with sharing class DealHealthScorer {

    public class DealHealthResult {
        public Integer score { get; set; }
        public String grade { get; set; } // A, B, C, D
        public Decimal winProbability { get; set; }
        public String recommendedNextAction { get; set; }
        
        public DealHealthResult(Integer score, String grade, Decimal winProbability, String recommendedNextAction) {
            this.score = score;
            this.grade = grade;
            this.winProbability = winProbability;
            this.recommendedNextAction = recommendedNextAction;
        }
    }

    // Calculate a composite health score out of 100
    public DealHealthResult calculateScore(Opportunity opp) {
        if (opp == null) return null;
        
        Integer compositeScore = 0;
        
        // 1. Opportunity Stage (up to 30 points)
        if (opp.StageName == 'Prospecting') compositeScore += 5;
        else if (opp.StageName == 'Qualification') compositeScore += 10;
        else if (opp.StageName == 'Needs Analysis') compositeScore += 15;
        else if (opp.StageName == 'Value Proposition') compositeScore += 20;
        else if (opp.StageName == 'Negotiation/Review') compositeScore += 25;
        else if (opp.StageName == 'Closed Won') compositeScore += 30;
        else compositeScore += 0;
        
        // 2. Close Date Realism (up to 20 points)
        if (opp.CloseDate != null) {
            Integer daysToClose = Date.today().daysBetween(opp.CloseDate);
            if (daysToClose > 0 && daysToClose <= 30) compositeScore += 20;
            else if (daysToClose > 30 && daysToClose <= 90) compositeScore += 15;
            else if (daysToClose > 90) compositeScore += 10;
            else if (daysToClose < 0) compositeScore -= 10; // Overdue close date penalty
        }
        
        // 3. Probability (up to 30 points)
        if (opp.Probability != null) {
            compositeScore += (Integer)(opp.Probability * 0.3);
        }
        
        // 4. Base volume padding (up to 20 points placeholder, assuming active engagement)
        // In a real scenario, this would evaluate task/event volume
        compositeScore += 15;
        
        // Ensure score bounds
        if (compositeScore > 100) compositeScore = 100;
        if (compositeScore < 0) compositeScore = 0;
        
        String grade = determineGrade(compositeScore);
        String nextAction = determineNextAction(compositeScore);
        Decimal winProb = opp.Probability != null ? opp.Probability : (compositeScore * 1.0);
        
        return new DealHealthResult(compositeScore, grade, winProb, nextAction);
    }
    
    private String determineGrade(Integer score) {
        if (score >= 80) return 'A';
        if (score >= 60) return 'B';
        if (score >= 40) return 'C';
        return 'D';
    }

    public String determineNextAction(Integer score) {
        if (score >= 80) {
            return 'Send final proposal and push for contract signature.';
        } else if (score >= 60) {
            return 'Schedule an executive alignment meeting to address any hidden objections.';
        } else if (score >= 40) {
            return 'Increase engagement. Send relevant case studies and ask for a discovery call.';
        } else {
            return 'Deal is at risk. Evaluate if this is a qualified lead or move to nurture campaign.';
        }
    }
}