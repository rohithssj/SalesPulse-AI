@isTest
private class ProposalBuilderTest {

    @isTest
    static void testProposalCreation() {

        ProposalBuilder builder = new ProposalBuilder();

        // Test with full data
        ProposalBuilder.Proposal proposal =
            builder.buildProposal('Acme Corp', 100000, 'Technology');

        System.assertNotEquals(null, proposal);
        System.assertEquals('Acme Corp', proposal.accountName);
        System.assertEquals(100000, proposal.totalValue);
        System.assert(proposal.executiveSummary.contains('Acme Corp'));
        System.assert(proposal.solutionDescription.contains('SalesPulse'));
        System.assert(proposal.roiEstimate.contains('ROI'));
        System.assertNotEquals(null, proposal.implementationTimeline);
        System.assertNotEquals(null, proposal.nextSteps);

        // Test when industry is blank
        ProposalBuilder.Proposal proposal2 =
            builder.buildProposal('Global Inc', 50000, '');

        System.assert(proposal2.executiveSummary.contains('corporate'));

        // Test when deal amount is null
        ProposalBuilder.Proposal proposal3 =
            builder.buildProposal('Test Company', null, 'Finance');

        System.assertNotEquals(null, proposal3);
    }
}