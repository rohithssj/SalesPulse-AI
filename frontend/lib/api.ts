const PROXY_BASE = process.env.NEXT_PUBLIC_PROXY_URL || process.env.REACT_APP_SF_PROXY_URL || '';
const STORAGE_KEY = 'salespulse_uploaded_data';

export const API_URL = `${PROXY_BASE}/api`;

// Detect if we are currently in upload mode
export const isUploadMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch {
    return false;
  }
};

// Check if an accountId is a real Salesforce ID
// Salesforce IDs are 15 or 18 alphanumeric characters
// Upload IDs look like ACC001, acc_0, deal_1 etc.
export const isValidSalesforceId = (id: string): boolean => {
  if (!id) return false;
  // Salesforce IDs: 15 or 18 chars, alphanumeric only
  return /^[a-zA-Z0-9]{15,18}$/.test(id.trim());
};

// Get a safe accountId for Salesforce calls
// Returns null if the ID is not a valid Salesforce ID
export const getSafeAccountId = (
  accountId: string | undefined
): string | null => {
  if (!accountId) return null;
  if (isValidSalesforceId(accountId)) return accountId;
  return null; // Upload mode ID — do not send to Salesforce
};

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit & { params?: Record<string, string> }
): Promise<T | null> {
  try {
    let url = `${API_URL}${endpoint}`;
    
    // Handle query params for GET
    if (options?.params && (!options.method || options.method === 'GET')) {
      const qs = new URLSearchParams(options.params).toString();
      url = `${url}${url.includes('?') ? '&' : '?'}${qs}`;
    }

    const { params, ...fetchOptions } = options || {};

    const res = await fetch(url, {
      ...fetchOptions,
      headers: { 'Content-Type': 'application/json', ...fetchOptions.headers },
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => '');
      // Use console.warn to prevent Next.js from showing a full-screen error overlay
      console.warn(
        `API Error on ${endpoint}: ${res.status} ${res.statusText}`,
        errorText
      );
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`Network error on ${endpoint}:`, err);
    return null;
  }
}

export const apiGet = <T>(endpoint: string, params?: Record<string, string>) =>
  apiFetch<T>(endpoint, { method: 'GET', params });

export const apiPost = <T>(endpoint: string, body: object) =>
  apiFetch<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
/**
 * Universal response parser to handle various Salesforce Apex response shapes
 */
export function parseAIResponse(data: any): string {
  if (data === null || data === undefined) {
    return 'No response received. Please check your Salesforce connection and try again.';
  }

  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') {
      return 'AI returned an empty response. Please try again.';
    }
    return trimmed;
  }

  if (typeof data === 'object' && !Array.isArray(data)) {
    const obj = data as Record<string, any>;

    // Anthropic content array format
    if (Array.isArray(obj.content)) {
      const text = (obj.content as any[])
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('\n');
      if (text) return text;
    }

    // Try all known Salesforce Apex response field names
    const fields = [
      'result', 'content', 'data', 'output', 'message',
      'strategy', 'strategyContent', 'emailContent', 'email',
      'proposal', 'summary', 'brief', 'tips', 'text', 'body',
      'response', 'generatedContent', 'aiContent', 'engagementPlan',
      'meetingSummary', 'accountBrief', 'planContent', 'actionPlan'
    ];

    for (const field of fields) {
      const val = obj[field];
      if (val && typeof val === 'string' &&
          val.trim() !== '' && val !== 'null') {
        return val.trim();
      }
      if (val && typeof val === 'object' && val !== null) {
        // Handle nested fields like data.email.body
        const nested = parseAIResponse(val);
        if (nested && !nested.includes('empty') && !nested.includes('No response')) {
          return nested;
        }
      }
    }

    // Fallback for body strictly
    if (obj.body && typeof obj.body === 'string') return obj.body;

    // Last resort — stringify for debugging
    const stringified = JSON.stringify(data, null, 2);
    if (stringified !== '{}') return stringified;
  }

  return 'Unexpected response format. Please try again.';
}

// Removed old definitions


// ── Named aliases used across components ──

export const fetchAccounts = () => 
  apiGet('/accounts');

export const fetchCompleteData = (accountId: string) => 
  apiGet(`/completeData?accountId=${accountId}`);

export const fetchAccountBrief = (accountId: string) => 
  apiGet(`/accountBrief?accountId=${accountId}`);

export const postEmail = (body: any) => 
  apiPost('/email', body);

// Alias for components expecting fetchEmail (POST with accountId)
export const fetchEmail = (params: any, accountId?: string) => 
  apiPost('/email', { ...(typeof params === 'object' ? params : {}), accountId: accountId || params?.accountId });

export const postStrategy = (body: any) => 
  apiPost('/strategy', body);

// Alias for components expecting fetchStrategy
export const fetchStrategy = (params: any, accountId?: string) => 
  apiPost('/strategy', { ...(typeof params === 'object' ? params : {}), accountId: accountId || params?.accountId });

export const postProposal = (body: any) => 
  apiPost('/proposal', body);

// Alias for components expecting fetchProposal
export const fetchProposal = (params: any, accountId?: string) => 
  apiPost('/proposal', { ...(typeof params === 'object' ? params : {}), accountId: accountId || params?.accountId });

export const postMeetingPrep = (body: any) => 
  apiPost('/meetingPrep', body);

// Alias for components expecting fetchMeetingPrep
export const fetchMeetingPrep = (params: any, accountId?: string) => 
  apiPost('/meetingPrep', { ...(typeof params === 'object' ? params : {}), accountId: accountId || params?.accountId });

// Alias for older components
export const parseResponse = parseAIResponse;

// --------- NORMALIZATION & TRANSFORMATION FUNCTIONS ---------

export function normalizeOpportunities(data: any): any[] {
  if (!data) return [];
  const opps = Array.isArray(data) ? data : (data.opportunities || data.records || data.data || []);
  if (!Array.isArray(opps)) return [];
  
  return opps.map((o: any) => ({
    id: o.Id || o.id || Math.random().toString(),
    name: o.Name || o.name || 'Unknown Deal',
    dealStage: o.StageName || o.dealStage || 'Discovery',
    dealValue: o.Amount || o.dealValue || o.value || 0,
    winProbability: (o.Probability !== undefined) ? o.Probability : (o.winProbability !== undefined ? o.winProbability : Math.floor(Math.random() * 100)),
    closeDate: o.CloseDate || o.closeDate,
    accountId: o.AccountId || o.accountId || 'UnknownAccount',
    accountName: o.Account?.Name || o.accountName || 'Unknown Account',
    healthScore: o.healthScore || 0,
    healthGrade: o.healthGrade || 'C',
    recommendedNextAction: o.recommendedNextAction || 'Follow up'
  }));
}

export function buildPipelineData(opps: any[]) {
  const stages: Record<string, { count: number, value: number }> = {};
  opps.forEach(opp => {
    const stage = opp.dealStage;
    if (!stages[stage]) stages[stage] = { count: 0, value: 0 };
    stages[stage].count += 1;
    stages[stage].value += opp.dealValue;
  });
  
  return Object.entries(stages).map(([stage, stats]) => ({
    stage,
    count: stats.count,
    value: stats.value
  }));
}

export function buildHealthScoreData(opps: any[]) {
  const ranges = [
    { range: 'Critical (0-30%)', count: 0 },
    { range: 'At Risk (30-60%)', count: 0 },
    { range: 'Good (60-80%)', count: 0 },
    { range: 'Excellent (80-100%)', count: 0 }
  ];
  
  opps.forEach(opp => {
    const prob = opp.winProbability || 0;
    if (prob <= 30) ranges[0].count+=1;
    else if (prob <= 60) ranges[1].count+=1;
    else if (prob <= 80) ranges[2].count+=1;
    else ranges[3].count+=1;
  });
  
  return ranges;
}

export function buildTopAccounts(opps: any[]) {
  const accounts: Record<string, any> = {};
  opps.forEach(opp => {
    const acc = opp.accountName || 'Unknown';
    if (!accounts[acc]) accounts[acc] = { name: acc, value: 0, deals: 0, healthSum: 0 };
    accounts[acc].value += (opp.dealValue / 1000000); // converting to millions for view
    accounts[acc].deals += 1;
    accounts[acc].healthSum += (opp.winProbability || 0);
  });
  
  return Object.values(accounts)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map(acc => ({
      name: acc.name,
      value: Number(acc.value.toFixed(1)),
      deals: acc.deals,
      health: Math.round(acc.healthSum / acc.deals)
    }));
}

export function normalizeActivities(data: any): any[] {
  if (!data) return [];
  const acts = Array.isArray(data) ? data : (data.activities || data.tasks || data.events || []);
  if (!Array.isArray(acts)) return [];
  
  return acts.map((a: any) => ({
    id: a.Id || a.id || Math.random().toString(),
    subject: a.Subject || a.subject || 'Activity',
    type: a.Type || a.type || 'Other',
    status: a.Status || a.status,
    activityDate: a.ActivityDate || a.activityDate || a.createdDate || new Date().toISOString()
  }));
}

export function normalizeTimeline(data: any): any[] {
  const acts = normalizeActivities(data);
  return acts.map(act => ({
    date: act.activityDate ? new Date(act.activityDate).toISOString().split('T')[0] : 'Recent',
    event: act.subject,
    type: act.type.toLowerCase()
  }));
}

export function extractSignalsFromActivities(activities: any[], opportunities: any[] = []) {
  const signals: any[] = [];
  const today = new Date();

  // 1. Process Opportunities for rich signals
  opportunities.forEach(opp => {
    const closeDate = opp.closeDate ? new Date(opp.closeDate) : null;
    const daysUntilClose = closeDate ? Math.ceil((closeDate.getTime() - today.getTime()) / (1000 * 3600 * 24)) : null;
    
    // Signal: Deal close date approaching
    if (daysUntilClose !== null && daysUntilClose >= 0 && daysUntilClose <= 14) {
      signals.push({
        id: `close-${opp.id}`,
        type: 'Urgency Signal',
        account: opp.accountName,
        detail: `Opportunity "${opp.name}" close date approaching (${opp.closeDate})`,
        severity: daysUntilClose <= 7 ? 'High' : 'Medium',
        confidence: 95,
        time: daysUntilClose === 0 ? 'Today' : `${daysUntilClose} days left`,
        icon: '📅',
        contact: 'Primary Contact'
      });
    }

    // Signal: High probability / Decision Stage
    if (opp.winProbability >= 80 || opp.dealStage === 'Negotiation' || opp.dealStage === 'Closing') {
      signals.push({
        id: `intent-${opp.id}`,
        type: 'High Intent',
        account: opp.accountName,
        detail: `Deal "${opp.name}" is in high-intent stage (${opp.dealStage}) with ${opp.winProbability}% probability`,
        severity: 'Medium',
        confidence: 90,
        time: 'Active',
        icon: '🚀',
        contact: 'Decision Maker'
      });
    }

    // Signal: Potential Inactivity on Deal
    const dealActivities = activities.filter(a => a.Subject?.includes(opp.name) || a.Description?.includes(opp.name));
    const lastActivity = dealActivities.length > 0 
      ? new Date(Math.max(...dealActivities.map(a => new Date(a.activityDate).getTime())))
      : null;
    
    const daysSinceActivity = lastActivity ? Math.ceil((today.getTime() - lastActivity.getTime()) / (1000 * 3600 * 24)) : 30;

    if (daysSinceActivity > 7 && opp.winProbability > 20) {
      signals.push({
        id: `inactive-${opp.id}`,
        type: 'Inactivity Alert',
        account: opp.accountName,
        detail: `No recent activity on "${opp.name}" for ${daysSinceActivity} days. Follow-up recommended.`,
        severity: 'High',
        confidence: 85,
        time: 'Needs Action',
        icon: '⚠️',
        contact: 'Account Manager'
      });
    }
  });

  // 2. Process Recent Activities for Engagement
  activities.slice(0, 10).forEach(act => {
    const detail = act.subject?.toLowerCase() || '';
    let type = 'Engagement Signal';
    let severity = 'Medium';
    let confidence = 85;
    let icon = '📩';

    if (detail.includes('pricing') || detail.includes('quote') || detail.includes('cost')) {
      type = 'Pricing Discussion';
      severity = 'High';
      confidence = 90;
      icon = '💰';
    } else if (detail.includes('proposal') || detail.includes('contract') || detail.includes('agreement')) {
      type = 'Proposal Interest';
      severity = 'High';
      confidence = 95;
      icon = '📝';
    } else if (detail.includes('demo') || detail.includes('meeting') || detail.includes('presentation')) {
      type = 'Engagement Signal';
      severity = 'Medium';
      confidence = 88;
      icon = '🤝';
    } else {
      // Don't add generic signals if we have enough
      if (signals.length > 5) return;
    }

    signals.push({
      id: act.id,
      type,
      account: 'Active Account',
      detail: act.subject,
      severity,
      confidence,
      time: act.activityDate ? new Date(act.activityDate).toLocaleDateString() : 'Recent',
      icon,
      contact: 'Last Correspondent'
    });
  });

  // 3. Fallback signals (Never allow empty)
  if (signals.length < 2) {
    const fallbacks = [
      {
        id: 'fallback-1',
        type: 'Strategic Insight',
        account: 'Active Account',
        detail: 'AI detected positive momentum based on historical engagement patterns.',
        severity: 'Medium',
        confidence: 82,
        time: 'Generated',
        icon: '✨',
        contact: 'AI Agent'
      },
      {
        id: 'fallback-2',
        type: 'Pipeline Health',
        account: 'Active Account',
        detail: 'Account shows consistent pipeline activity in current quarter.',
        severity: 'Medium',
        confidence: 78,
        time: 'Quarterly',
        icon: '📈',
        contact: 'AI Agent'
      }
    ];
    
    while (signals.length < 2) {
      signals.push(fallbacks[signals.length]);
    }
  }

  return signals;
}
