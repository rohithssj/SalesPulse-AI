
// ============================================================
// SECTION A — Raw JSON → Clean structured data
// ============================================================

export interface ParsedEngagementPlan {
  emailSubject?: string;
  emailBody?: string;
  nextActions?: string[];
  objections?: Array<{ objection: string; response: string }>;
  meetingAgenda?: string[];
  strategyRecommendation?: string;
  nextBestAction?: string;
  winProbability?: number;
  healthGrade?: string;
  healthScore?: number;
  checklist?: string[];
  priorities?: Array<{
    title: string;
    badge: string;
    desc: string;
    color: string;
  }>;
  notes?: string;
  accountName?: string;
  rawText?: string;
}

export interface ParsedAITips {
  tips: string[];
  stage?: string;
  strategy?: string;
  recommendation?: string;
}

// Parse ANY response shape from Salesforce Apex into clean data
export const parseAnyResponse = (data: unknown): string => {
  if (!data) return '';
  if (data === 'null' || data === null || data === undefined) return '';

  // Already a clean string
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if (trimmed && trimmed !== 'null' && !trimmed.startsWith('{')) {
      return trimmed;
    }
    // String that is actually JSON — parse it
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try {
        return parseAnyResponse(JSON.parse(trimmed));
      } catch {
        return trimmed;
      }
    }
  }

  if (typeof data !== 'object') return String(data);

  const obj = data as Record<string, unknown>;

  // ── Try plain text fields first ──
  const textFields = [
    'result', 'content', 'output', 'message', 'text',
    'body', 'response', 'generatedContent', 'aiContent'
  ];
  for (const field of textFields) {
    const val = obj[field];
    if (val && typeof val === 'string'
        && val !== 'null' && val.trim()
        && !val.trim().startsWith('{')) {
      return val.trim();
    }
  }

  // ── Structured response — build readable text ──
  return buildReadableFromStructured(obj);
};

// Convert structured Apex JSON into clean readable text
const buildReadableFromStructured = (obj: Record<string, unknown>): string => {
  const lines: string[] = [];

  // Account name header
  if (obj.accountName) {
    lines.push(`Account: ${obj.accountName}\n`);
  }

  // Strategy recommendation (top-level summary)
  if (obj.strategyRecommendation) {
    lines.push(`STRATEGY\n${obj.strategyRecommendation}\n`);
  }

  // Recommended next action
  if (obj.recommendedNextAction) {
    lines.push(`RECOMMENDED NEXT ACTION\n${obj.recommendedNextAction}\n`);
  }

  // Win probability + health
  if (obj.winProbability || obj.healthScore) {
    const parts = [];
    if (obj.winProbability) parts.push(`Win Probability: ${obj.winProbability}%`);
    if (obj.healthScore) parts.push(`Health Score: ${obj.healthScore}`);
    if (obj.healthGrade) parts.push(`Grade: ${obj.healthGrade}`);
    lines.push(parts.join('  |  ') + '\n');
  }

  // Priorities — render as titled list
  if (Array.isArray(obj.priorities) && obj.priorities.length > 0) {
    lines.push('PRIORITIES');
    (obj.priorities as Array<Record<string,string>>).forEach((p, i) => {
      const badge = p.badge ? `[${p.badge}]` : '';
      lines.push(`${i + 1}. ${p.title} ${badge}`);
      if (p.desc) lines.push(`   ${p.desc}`);
    });
    lines.push('');
  }

  // Checklist
  if (Array.isArray(obj.checklist) && obj.checklist.length > 0) {
    lines.push('CHECKLIST');
    (obj.checklist as string[]).forEach(item => {
      lines.push(`✓ ${item}`);
    });
    lines.push('');
  }

  // Notes field
  if (obj.notes && typeof obj.notes === 'string') {
    // Clean up \n1. \n2. style formatting
    const cleanNotes = obj.notes
      .replace(/\\n/g, '\n')
      .replace(/\n(\d+)\./g, '\n$1.')
      .trim();
    lines.push('NOTES\n' + cleanNotes + '\n');
  }

  // Email content
  if (obj.emailContent || obj.email) {
    const email = (obj.emailContent || obj.email) as string;
    lines.push('GENERATED EMAIL\n' + email.replace(/\\n/g, '\n').trim() + '\n');
  }

  // Routing info — render as agent label, not raw JSON
  if (obj.routing && typeof obj.routing === 'object') {
    const routing = obj.routing as Record<string, string>;
    if (routing.agentName && routing.message) {
      lines.push(`[${routing.agentName}]: ${routing.message}`);
    }
  }

  // If nothing was extracted — last resort flatten
  if (lines.length === 0) {
    const flatValues = Object.entries(obj)
      .filter(([k]) => k !== 'routing')
      .map(([k, v]) => {
        if (typeof v === 'string') return `${k}: ${v.replace(/\\n/g, '\n')}`;
        if (Array.isArray(v)) return `${k}:\n${v.map(i =>
          typeof i === 'object' ? JSON.stringify(i) : `• ${i}`
        ).join('\n')}`;
        return null;
      })
      .filter(Boolean);
    return flatValues.join('\n\n');
  }

  return lines.join('\n').trim();
};

// ============================================================
// SECTION B — Parse into structured object for rich rendering
// ============================================================

export const parseEngagementPlan = (data: unknown): ParsedEngagementPlan => {
  if (!data) return { rawText: '' };

  const obj = typeof data === 'string'
    ? (() => { try { return JSON.parse(data); } catch { return {}; } })()
    : data as Record<string, unknown>;

  return {
    emailBody: obj.emailContent as string
      || obj.email as string
      || obj.result as string || '',
    strategyRecommendation: obj.strategyRecommendation as string || '',
    nextBestAction: obj.recommendedNextAction as string || '',
    winProbability: obj.winProbability as number || 0,
    healthGrade: obj.healthGrade as string || '',
    healthScore: obj.healthScore as number || 0,
    checklist: Array.isArray(obj.checklist) ? obj.checklist as string[] : [],
    priorities: Array.isArray(obj.priorities)
      ? obj.priorities as ParsedEngagementPlan['priorities'] : [],
    notes: obj.notes as string || '',
    accountName: obj.accountName as string || '',
    rawText: parseAnyResponse(data),
  };
};

export const parseAITips = (data: unknown): ParsedAITips => {
  const raw = parseAnyResponse(data);

  // Try to split numbered tips
  const numbered = raw.match(/\d+\.\s+([\s\S]+?)(?=\n\d+\.|\n\n|$)/g);
  if (numbered && numbered.length >= 2) {
    return {
      tips: numbered.map(t => t.replace(/^\d+\.\s+/, '').trim()),
      strategy: '',
    };
  }

  // Try bullet points
  const bullets = raw.match(/[•\-\*]\s+(.+)/g);
  if (bullets && bullets.length >= 2) {
    return {
      tips: bullets.map(b => b.replace(/^[•\-\*]\s+/, '').trim()),
    };
  }

  // Split by newlines
  const lines = raw.split('\n').filter(l => l.trim().length > 20);
  if (lines.length >= 2) {
    return { tips: lines.slice(0, 6) };
  }

  return { tips: [raw], strategy: '' };
};
