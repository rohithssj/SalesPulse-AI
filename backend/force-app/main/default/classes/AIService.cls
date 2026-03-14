public with sharing class AIService {

    public static String generateAccountSummary(Account acc) {
        if (acc == null) return 'No account data available.';
        
        CRMDataService dataService = new CRMDataService();
        List<Opportunity> opps = dataService.getOpportunityData(acc.Id);
        List<Task> tasks = dataService.getRecentTasks(acc.Id);
        List<EmailMessage> emails = dataService.getRecentEmails(acc.Id);
        
        Decimal totalValue = 0;
        Integer activeCount = 0;
        for(Opportunity o : opps) {
            if (o.StageName != 'Closed Won' && o.StageName != 'Closed Lost') {
                activeCount++;
                if (o.Amount != null) totalValue += o.Amount;
            }
        }
        
        String industryStr = String.isNotBlank(acc.Industry) ? ' in the ' + acc.Industry + ' sector' : '';
        String summary = acc.Name + industryStr + ' currently has ' + activeCount + ' active opportunities worth $' + (totalValue/1000).setScale(0) + 'K. ';
        
        String engagement = '';
        if (!emails.isEmpty()) {
            engagement = 'Recent email engagement includes ' + emails.size() + ' interactions, with the latest on ' + emails[0].MessageDate.format() + '. ';
        }
        
        if (!tasks.isEmpty()) {
            engagement += 'The latest task was "' + tasks[0].Subject + '" completed on ' + tasks[0].ActivityDate + '. ';
        }
        
        if (String.isNotBlank(engagement)) {
            summary += 'Recent engagement: ' + engagement + 'This indicates a ' + (activeCount > 0 ? 'high level of buyer interest.' : 'stable holding pattern.');
        } else {
            summary += 'There has been no recorded activity in the last 30 days. Recommend outreach to re-establish contact.';
        }
        
        return summary;
    }

    public static String generateSalesEmail(Account acc) {
        if (acc == null) return 'Hi,\n\nI wanted to follow up on our recent discussion. Let me know if you have time to chat.';
        
        CRMDataService dataService = new CRMDataService();
        List<Opportunity> opps = dataService.getOpportunityData(acc.Id);
        String oppName = !opps.isEmpty() ? opps[0].Name : 'our solution';
        
        return 'Hi ' + acc.Name + ' team,\n\n' +
               'Following up on our recent discussion about the ' + oppName + '. ' +
               'Based on your requirements, I’ve prepared some tailored options to help you scale efficiently. ' +
               'Would you be available for a 15-minute sync this week to discuss next steps?\n\n' +
               'Best regards,\nYour SalesPulse AI Assistant';
    }

    public static String generateProposal(Account acc) {
        if (acc == null) return 'Proposal for Client\n\nDetails pending.';
        
        CRMDataService dataService = new CRMDataService();
        List<Opportunity> opps = dataService.getOpportunityData(acc.Id);
        Opportunity primary = !opps.isEmpty() ? opps[0] : null;
        
        String content = 'PROPOSAL FOR ' + acc.Name.toUpperCase() + '\n\n' +
               'Product: Enterprise CRM Suite Integration\n' +
               'Primary Goal: Sales Process Automation\n';
               
        if (primary != null) {
            content += 'Opportunity: ' + primary.Name + '\n' +
                       'Estimated Value: $' + (primary.Amount != null ? String.valueOf(primary.Amount) : 'TBD') + '\n' +
                       'Target Close Date: ' + (primary.CloseDate != null ? String.valueOf(primary.CloseDate) : 'TBD') + '\n';
        }
        
        content += '\nEXECUTIVE SUMMARY\n' +
                   'We propose a phased implementation of the SalesPulse AI platform to unify your CRM data ' +
                   'and leverage Agentforce for real-time deal intelligence. This solution will increase ' +
                   'your team\'s efficiency by automating manual follow-ups and providing predictive win scores.';
                   
        return content;
    }

    public static String generateMeetingPrep(Account acc) {
        if (acc == null) return 'No data for meeting prep.';
        return 'MEETING PREP: ' + acc.Name + '\n' +
               '1. Review latest opportunity status.\n' +
               '2. Address identified blockers in pricing.\n' +
               '3. Confirm decision maker alignment.';
    }

    public static String generateSalesStrategy(Account acc) {
        if (acc == null) return 'Focus on discovery.';
        CRMDataService dataService = new CRMDataService();
        List<Opportunity> opps = dataService.getOpportunityData(acc.Id);
        Opportunity primary = !opps.isEmpty() ? opps[0] : null;

        if (primary != null && primary.StageName == 'Negotiation/Review') {
             return 'Negotiation Strategy: Focus on executive alignment and ROI validation. Schedule a final pricing review call.';
        } else if (primary != null && primary.StageName == 'Value Proposition') {
             return 'Growth Strategy: Send tailored case studies and schedule a technical deep-dive demo.';
        }
        
        return 'Discovery Strategy: Increase engagement with senior stakeholders. Highlight specific ROI cases for ' + (acc.Industry != null ? acc.Industry : 'their sector') + '.';
    }
}