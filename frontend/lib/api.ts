export const API_URL = (process.env.REACT_APP_SF_PROXY_URL || 'http://localhost:3001') + '/api';

export async function apiFetch(endpoint: string, options?: RequestInit) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!res.ok) {
      console.error(`API Error on ${endpoint}:`, res.statusText);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`Network Error on ${endpoint}:`, err);
    return null;
  }
}

export const fetchCompleteData = (accountId?: string) => apiFetch(`/completeData${accountId ? `?accountId=${accountId}` : ''}`);
export const fetchAccounts = () => apiFetch('/accounts');
export const fetchStrategy = (params?: any, accountId?: string) => apiFetch(`/strategy${accountId ? `?accountId=${accountId}` : ''}`, { method: 'POST', body: JSON.stringify(params || {}) });
export const fetchEmail = (params?: any, accountId?: string) => apiFetch(`/email${accountId ? `?accountId=${accountId}` : ''}`, { method: 'POST', body: JSON.stringify(params || {}) });
export const fetchProposal = (params?: any, accountId?: string) => apiFetch(`/proposal${accountId ? `?accountId=${accountId}` : ''}`, { method: 'POST', body: JSON.stringify(params || {}) });
export const fetchMeetingPrep = (params?: any, accountId?: string) => apiFetch(`/meetingPrep${accountId ? `?accountId=${accountId}` : ''}`, { method: 'POST', body: JSON.stringify(params || {}) });
export const fetchAccountBrief = (accountId?: string) => apiFetch(`/accountBrief${accountId ? `?accountId=${accountId}` : ''}`);

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
