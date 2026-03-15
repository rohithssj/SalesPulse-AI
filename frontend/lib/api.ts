export const API_URL = (process.env.REACT_APP_SF_PROXY_URL || 'http://localhost:3001') + '/api';

export async function apiFetch<T>(
  endpoint: string, 
  options?: {
    method?: 'GET' | 'POST';
    body?: any;
    params?: Record<string, string>;
    headers?: Record<string, string>;
  }
): Promise<T | null> {
  try {
    let url = `${API_URL}${endpoint}`;
    
    // Handle query params for GET
    if (options?.params && (!options.method || options.method === 'GET')) {
      const qs = new URLSearchParams(options.params).toString();
      url = `${url}${url.includes('?') ? '&' : '?'}${qs}`;
    }

    const fetchOptions: RequestInit = {
      method: options?.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    };

    if (options?.method === 'POST' && options.body) {
      fetchOptions.body = JSON.stringify(options.body);
    }

    const res = await fetch(url, fetchOptions);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API Error on ${endpoint}: ${res.status} ${res.statusText}`, errorText);
      return null;
    }
    
    return await res.json();
  } catch (err) {
    console.error(`Network Error on ${endpoint}:`, err);
    return null;
  }
}

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

// GET helper
export async function apiGet<T>(endpoint: string): Promise<T | null> {
  return apiFetch<T>(endpoint, { method: 'GET' });
}

// POST helper
export async function apiPost<T>(endpoint: string, body: object): Promise<T | null> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: body,
  });
}

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

export function extractSignalsFromActivities(activities: any[]) {
  // Use real data types if possible, or fall back to descriptive mapping
  return activities.map((act, i) => ({
    id: act.id,
    type: act.type || 'Engagement Signal',
    account: 'Active Account',
    detail: act.subject,
    severity: (act.priority === 'High' || act.subject.toLowerCase().includes('urgent')) ? 'High' : 'Medium',
    confidence: 85,
    time: act.activityDate ? new Date(act.activityDate).toLocaleDateString() : 'Recent'
  }));
}
