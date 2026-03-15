/**
 * Summarizes parsed sales data to extract key metrics for AI analysis
 */
export const summarizeUploadedData = (parsedData: any) => {
  const { rows, headers, fileType, totalRows } = parsedData;

  // Auto-detect column types by scanning headers
  const findColumn = (keywords: string[]) =>
    headers.find((h: string) =>
      keywords.some(kw => h.toLowerCase().includes(kw.toLowerCase()))
    );

  const accountCol    = findColumn(['account', 'company', 'organization', 'client', 'customer']);
  const valueCol      = findColumn(['value', 'amount', 'revenue', 'deal', 'price', 'arr', 'mrr']);
  const stageCol      = findColumn(['stage', 'status', 'phase', 'pipeline']);
  const ownerCol      = findColumn(['owner', 'rep', 'salesperson', 'assigned', 'user']);
  const dateCol       = findColumn(['date', 'close', 'created', 'modified', 'updated']);
  const probabilityCol= findColumn(['probability', 'confidence', 'likelihood', 'chance']);
  const contactCol    = findColumn(['contact', 'name', 'person', 'lead']);
  const emailCol      = findColumn(['email', 'mail']);

  // Calculate summary statistics
  const values = rows
    .map((r: any) => {
        const valStr = String(valueCol ? r[valueCol] : '').replace(/[$,]/g, '');
        return parseFloat(valStr);
    })
    .filter((v: number) => !isNaN(v) && v > 0);

  const totalValue = values.reduce((sum: number, v: number) => sum + v, 0);
  const avgValue = values.length ? totalValue / values.length : 0;
  const maxValue = values.length ? Math.max(...values) : 0;

  // Stage distribution
  const stageDistribution = stageCol
    ? rows.reduce((acc: any, row: any) => {
        const stage = row[stageCol] || 'Unknown';
        acc[stage] = (acc[stage] || 0) + 1;
        return acc;
      }, {})
    : {};

  // Get unique accounts
  const uniqueAccounts = accountCol
    ? [...new Set(rows.map((r: any) => r[accountCol]).filter(Boolean))]
    : [];

  // Get top deals by value
  const topDeals = valueCol
    ? rows
        .map((r: any) => ({
          account: accountCol ? r[accountCol] : 'Unknown',
          value: parseFloat(String(r[valueCol]).replace(/[$,]/g, '')) || 0,
          stage: stageCol ? r[stageCol] : 'Unknown',
          contact: contactCol ? r[contactCol] : 'Unknown',
          probability: probabilityCol ? r[probabilityCol] : null
        }))
        .filter((d: any) => d.value > 0)
        .sort((a: any, b: any) => b.value - a.value)
        .slice(0, 5)
    : [];

  return {
    fileType,
    totalRows,
    totalRecords: rows.length,
    detectedColumns: {
      account: accountCol,
      value: valueCol,
      stage: stageCol,
      owner: ownerCol,
      date: dateCol,
      probability: probabilityCol,
      contact: contactCol,
      email: emailCol
    },
    statistics: {
      totalPipelineValue: totalValue,
      averageDealValue: avgValue,
      maxDealValue: maxValue,
      totalDeals: values.length,
      uniqueAccounts: uniqueAccounts.length,
      stageDistribution
    },
    topDeals,
    sampleRows: rows.slice(0, 10),
    rawHeaders: headers
  };
};

/**
 * Builds a rich analysis prompt for the AI based on the data summary
 */
export const buildAnalysisPrompt = (fileName: string, summary: any) => {
    const { statistics, topDeals, stageDistribution, detectedColumns } = summary;
  
    const formatCurrency = (val: number) =>
      val >= 1000000
        ? `$${(val / 1000000).toFixed(1)}M`
        : val >= 1000
        ? `$${(val / 1000).toFixed(0)}K`
        : `$${val.toFixed(0)}`;
  
    const stageBreakdown = Object.entries(stageDistribution || {})
      .map(([stage, count]) => `  - ${stage}: ${count} deals`)
      .join('\n');
  
    const topDealsText = topDeals
      .map((d: any, i: number) =>
        `  ${i + 1}. ${d.account} — ${formatCurrency(d.value)} (${d.stage})`
      )
      .join('\n');
  
    return `
  You are a senior sales intelligence analyst. Analyze this uploaded sales data file 
  and provide actionable insights for the sales team.
  
  FILE: ${fileName}
  TOTAL RECORDS: ${summary.totalRows}
  DETECTED DATA COLUMNS: ${Object.entries(detectedColumns)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k} → "${v}"`)
      .join(', ')}
  
  PIPELINE STATISTICS:
  - Total Pipeline Value: ${formatCurrency(statistics.totalPipelineValue)}
  - Average Deal Value: ${formatCurrency(statistics.averageDealValue)}
  - Largest Deal: ${formatCurrency(statistics.maxDealValue)}
  - Total Deals: ${statistics.totalDeals}
  - Unique Accounts: ${statistics.uniqueAccounts}
  
  STAGE DISTRIBUTION:
  ${stageBreakdown || '  No stage data detected'}
  
  TOP 5 DEALS BY VALUE:
  ${topDealsText || '  No deal value data detected'}
  
  Please provide a comprehensive analysis including:
  
  1. PIPELINE HEALTH ASSESSMENT
     - Overall pipeline health score (1-10) with justification
     - Revenue at risk and revenue likely to close
     - Pipeline coverage ratio assessment
  
  2. KEY INSIGHTS (5 specific insights from this data)
     - Each insight must reference specific numbers from the data above
     - Focus on patterns, anomalies, and opportunities
  
  3. IMMEDIATE ACTION ITEMS (Top 3 priority actions)
     - Which deals need attention RIGHT NOW and why
     - Specific rep actions with deadlines
  
  Make all insights specific and quantitative. Reference actual account names, 
  deal values, and stage names from the data. Avoid generic advice.
    `.trim();
  };
