public with sharing class ProposalBuilder {

    public class Proposal {
        public String accountName { get; set; }
        public String executiveSummary { get; set; }
        public String solutionDescription { get; set; }
        public String roiEstimate { get; set; }
        public String implementationTimeline { get; set; }
        public String nextSteps { get; set; }
        public Decimal totalValue { get; set; }
        
        public Proposal() {}
    }

    // Build a structured proposal
    public Proposal buildProposal(String accountName, Decimal dealAmount, String industry) {
        Proposal prop = new Proposal();
        prop.accountName = accountName;
        prop.totalValue = dealAmount;
        
        // Generate Executive Summary
        prop.executiveSummary = 'This proposal outlines a strategic partnership between our company and ' 
                                + accountName + ' to drive operational efficiency and revenue growth ' 
                                + 'specifically tailored for the ' + (String.isNotBlank(industry) ? industry : 'corporate') + ' sector.';
                                
        // Generate Solution Description
        prop.solutionDescription = 'Our AI-driven SalesPulse platform will seamlessly integrate into your workflow, '
                                 + 'providing real-time buying signal detection, automated deal scoring, '
                                 + 'and AI agent orchestration to maximize your sales output.';
                                 
        // Generate ROI Estimate based on deal amount as a simple heuristic
        Decimal estimatedRoi = (dealAmount != null && dealAmount > 0) ? (dealAmount * 3.5) : 0;
        prop.roiEstimate = 'Based on industry benchmarks, we project a return on investment of up to ' 
                         + estimatedRoi.format() + ' over the first 12 months, effectively yielding a 350% ROI.';
                         
        // Generate Implementation Timeline
        prop.implementationTimeline = 'Week 1-2: Discovery & Integration Setup\n'
                                    + 'Week 3: System Configuration & Pilot Testing\n'
                                    + 'Week 4: User Training & Full Go-Live\n'
                                    + 'Month 2+: Ongoing Optimization and Support';
                                    
        // Generate Next Steps
        prop.nextSteps = '1. Review and approve this proposal.\n'
                       + '2. Sign the master service agreement.\n'
                       + '3. Schedule the kickoff meeting with our implementation team.';
                       
        return prop;
    }
}