'use client';

import type {
  GlobalData,
  NormalizedDeal,
  NormalizedAccount,
  NormalizedActivity,
} from '@/context/DataSourceContext';

// ─────────────────────────────────────────
// TYPES for raw sheet rows
// ─────────────────────────────────────────

interface RawAccount {
  accountid: string;
  accountname: string;
  industry: string;
  annualrevenue: number;
  employees: number;
  website: string;
  city: string;
  country: string;
}

interface RawContact {
  contactid: string;
  contactname: string;
  accountid: string;
  title: string;
  email: string;
  phone: string;
}

interface RawOpportunity {
  opportunityid: string;
  opportunityname: string;
  accountid: string;
  stage: string;
  amount: number;
  probability: number;
  closedate: string;
}

interface RawActivity {
  taskid: string;
  accountid: string;
  contactid: string;
  subject: string;
  activitydate: string;
  status: string;
}

interface RawEmail {
  emailid: string;
  accountid: string;
  contactid: string;
  subject: string;
  sentdate: string;
}

interface RawSignal {
  signalid: string;
  accountid: string;
  signaltype: string;
  confidence: number;
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

const fmt = (v: number): string => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

const daysLeft = (dateStr: string): number => {
  if (!dateStr) return 30;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 30;
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86_400_000));
};

const inferEngagement = (
  signals: RawSignal[],
  activities: RawActivity[],
  emails: RawEmail[]
): 'High' | 'Medium' | 'Low' => {
  const score =
    signals.length * 3 + activities.length * 2 + emails.length;
  if (score >= 10) return 'High';
  if (score >= 4) return 'Medium';
  return 'Low';
};

// Normalise a row — lower-case all keys, coerce types
const normaliseRow = (
  row: Record<string, unknown>
): Record<string, string | number> =>
  Object.fromEntries(
    Object.entries(row).map(([k, v]) => [
      k.toLowerCase().trim().replace(/\s+/g, ''),
      v === null || v === undefined ? '' : v,
    ])
  ) as Record<string, string | number>;

// ─────────────────────────────────────────
// FILE PARSERS
// ─────────────────────────────────────────

// Read ALL sheets from an XLSX file buffer
// Returns a map of sheetName → array of normalised row objects
const readAllSheets = (
  buffer: ArrayBuffer
): Map<string, Record<string, string | number>[]> => {
  // SheetJS must be loaded via <script> tag in index.html / layout.tsx
  const XLSX = (window as unknown as { XLSX: {
    read: (data: ArrayBuffer, opts: { type: string }) => {
      SheetNames: string[];
      Sheets: Record<string, unknown>;
    };
    utils: {
      sheet_to_json: <T>(ws: unknown, opts?: { defval: string }) => T[];
    };
  } }).XLSX;

  if (!XLSX) {
    throw new Error(
      'SheetJS (XLSX) is not loaded. Add this to your HTML head:\n' +
      '<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>'
    );
  }

  const wb = XLSX.read(buffer, { type: 'array' });
  const result = new Map<string, Record<string, string | number>[]>();

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
      defval: '',
    });
    result.set(
      sheetName.toLowerCase().trim(),
      rows.map(normaliseRow)
    );
  }

  return result;
};

// Parse CSV text into normalised rows
const parseCSVText = (text: string): Record<string, string | number>[] => {
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(',')
    .map((h) => h.trim().replace(/"/g, '').toLowerCase());
  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const vals =
        line.match(/(".*?"|[^,]+|(?<=,)(?=,))/g) ?? line.split(',');
      return headers.reduce(
        (obj, h, i) => {
          const raw = (vals[i] ?? '').trim().replace(/"/g, '');
          const num = parseFloat(raw.replace(/[$,]/g, ''));
          obj[h] = isNaN(num) ? raw : num;
          return obj;
        },
        {} as Record<string, string | number>
      );
    });
};

// ─────────────────────────────────────────
// MULTI-SHEET NORMALISER (main function)
// ─────────────────────────────────────────

const buildGlobalDataFromSheets = (
  sheets: Map<string, Record<string, string | number>[]>,
  fileName: string
): GlobalData => {

  // ── Extract each sheet (case-insensitive sheet name matching) ──
  const findSheet = (
    ...names: string[]
  ): Record<string, string | number>[] => {
    for (const name of names) {
      const found = sheets.get(name.toLowerCase());
      if (found && found.length > 0) return found;
    }
    return [];
  };

  const rawAccounts = findSheet('accounts', 'account') as unknown as RawAccount[];
  const rawContacts = findSheet('contacts', 'contact') as unknown as RawContact[];
  const rawOpps     = findSheet('opportunities', 'opportunity', 'deals', 'deal', 'opps') as unknown as RawOpportunity[];
  const rawActivities = findSheet('activities', 'activity', 'tasks', 'task') as unknown as RawActivity[];
  const rawEmails   = findSheet('emails', 'email') as unknown as RawEmail[];
  const rawSignals  = findSheet('buyingsignals', 'signals', 'signal', 'buying_signals') as unknown as RawSignal[];

  // ── Build lookup maps by AccountId ──
  const contactsByAccount = new Map<string, RawContact[]>();
  rawContacts.forEach((c) => {
    const key = String(c.accountid);
    if (!contactsByAccount.has(key)) contactsByAccount.set(key, []);
    contactsByAccount.get(key)!.push(c);
  });

  const oppsByAccount = new Map<string, RawOpportunity[]>();
  rawOpps.forEach((o) => {
    const key = String(o.accountid);
    if (!oppsByAccount.has(key)) oppsByAccount.set(key, []);
    oppsByAccount.get(key)!.push(o);
  });

  const activitiesByAccount = new Map<string, RawActivity[]>();
  rawActivities.forEach((a) => {
    const key = String(a.accountid);
    if (!activitiesByAccount.has(key)) activitiesByAccount.set(key, []);
    activitiesByAccount.get(key)!.push(a);
  });

  const emailsByAccount = new Map<string, RawEmail[]>();
  rawEmails.forEach((e) => {
    const key = String(e.accountid);
    if (!emailsByAccount.has(key)) emailsByAccount.set(key, []);
    emailsByAccount.get(key)!.push(e);
  });

  const signalsByAccount = new Map<string, RawSignal[]>();
  rawSignals.forEach((s) => {
    const key = String(s.accountid);
    if (!signalsByAccount.has(key)) signalsByAccount.set(key, []);
    signalsByAccount.get(key)!.push(s);
  });

  // ── Build NormalizedDeals (from Opportunities sheet) ──
  const allDeals: NormalizedDeal[] = rawOpps.map((opp) => {
    const value   = Number(opp.amount) || 0;
    const prob    = Math.min(100, Math.max(0, Number(opp.probability) || 0));
    const stage   = String(opp.stage || 'Qualification');
    const close   = String(opp.closedate || '');
    const accId   = String(opp.accountid);
    const contacts = contactsByAccount.get(accId) || [];
    const primaryContact = contacts[0]?.contactname || 'Primary Contact';
    const accRow  = rawAccounts.find(
      (a) => String(a.accountid) === accId
    );
    const accName = accRow?.accountname || accId;

    // Build signals from BuyingSignals sheet
    const accountSignals = signalsByAccount.get(accId) || [];
    const signalLabels = accountSignals.map(
      (s) => `${s.signaltype} (${Math.round(Number(s.confidence) * 100)}%)`
    );

    return {
      id:            String(opp.opportunityid),
      name:          String(opp.opportunityname),
      accountId:     accId,
      accountName:   accName,
      value,
      formattedValue: fmt(value),
      stage,
      probability:   prob,
      closeDate:     close,
      daysLeft:      daysLeft(close),
      contact:       primaryContact,
      owner:         primaryContact,
      lastActivity:  close,
      signals:       signalLabels.length > 0
                       ? signalLabels
                       : ['Active opportunity'],
      industry:      String(accRow?.industry || 'Technology'),
      email:         contacts[0]?.email || '',
      phone:         contacts[0]?.phone || '',
    };
  });

  // ── Build NormalizedAccounts ──
  const allAccounts: NormalizedAccount[] = rawAccounts.map((acc) => {
    const accId    = String(acc.accountid);
    const contacts = contactsByAccount.get(accId) || [];
    const deals    = oppsByAccount.get(accId) || [];
    const acts     = activitiesByAccount.get(accId) || [];
    const emails   = emailsByAccount.get(accId) || [];
    const signals  = signalsByAccount.get(accId) || [];

    const primaryContact = contacts[0]?.contactname || 'Primary Contact';
    const lastActivity =
      acts[acts.length - 1]?.activitydate ||
      emails[emails.length - 1]?.sentdate ||
      '';

    const buyingSignals = signals.map((s) => s.signaltype);
    const engagement = inferEngagement(signals, acts, emails);

    const accountDeals = allDeals.filter((d) => d.accountId === accId);

    return {
      id:             accId,
      name:           String(acc.accountname),
      industry:       String(acc.industry || 'Technology'),
      revenue:        Number(acc.annualrevenue) || 0,
      employees:      Number(acc.employees) || 0,
      primaryContact,
      email:          contacts[0]?.email || '',
      phone:          contacts[0]?.phone || '',
      lastActivity,
      deals:          accountDeals,
      buyingSignals:  buyingSignals.length > 0
                        ? buyingSignals
                        : ['Active account'],
      engagementLevel: engagement,
      // Extra fields for UI display
      city:           String(acc.city || ''),
      country:        String(acc.country || ''),
      website:        String(acc.website || ''),
      contactCount:   contacts.length,
      dealCount:      deals.length,
      totalDealValue: deals.reduce((s, d) => s + (Number(d.amount) || 0), 0),
      contacts:       contacts.map((c) => ({
        id:    c.contactid,
        name:  c.contactname,
        title: c.title,
        email: c.email,
        phone: c.phone,
      })),
    };
  });

  // ── Build NormalizedActivities ──
  const allActivities: NormalizedActivity[] = [
    ...rawActivities.map((a) => {
      const accRow = rawAccounts.find(
        (acc) => String(acc.accountid) === String(a.accountid)
      );
      return {
        id:          String(a.taskid),
        type:        'Task',
        subject:     String(a.subject),
        accountName: accRow?.accountname || String(a.accountid),
        date:        String(a.activitydate),
        description: String(a.status),
      };
    }),
    ...rawEmails.map((e) => {
      const accRow = rawAccounts.find(
        (acc) => String(acc.accountid) === String(e.accountid)
      );
      return {
        id:          String(e.emailid),
        type:        'Email',
        subject:     String(e.subject),
        accountName: accRow?.accountname || String(e.accountid),
        date:        String(e.sentdate),
        description: 'Email sent',
      };
    }),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ── Summary statistics ──
  const totalValue = allDeals.reduce((s, d) => s + d.value, 0);
  const closedWon  = allDeals.filter(
    (d) => d.stage.toLowerCase().replace(/\s/g, '') === 'closedwon'
  ).length;
  const winRate = allDeals.length > 0
    ? Math.round((closedWon / allDeals.length) * 100) : 0;
  const avgDeal = allDeals.length > 0
    ? Math.round(totalValue / allDeals.length) : 0;

  return {
    deals:     allDeals,
    accounts:  allAccounts,
    activities: allActivities,
    summary: {
      totalPipelineValue:    totalValue,
      formattedPipelineValue: fmt(totalValue),
      activeDeals:           allDeals.length,
      winRate,
      avgDealSize:           avgDeal,
      totalAccounts:         allAccounts.length,
    },
    rawFileName: fileName,
    uploadedAt:  new Date().toISOString(),
  };
};

// ─────────────────────────────────────────
// SINGLE-SHEET FALLBACK (CSV / flat Excel)
// ─────────────────────────────────────────

const buildGlobalDataFromFlatRows = (
  rows: Record<string, string | number>[],
  fileName: string
): GlobalData => {
  if (!rows.length) throw new Error('No data rows found');

  const headers = Object.keys(rows[0]);
  const find = (...kws: string[]) =>
    headers.find((h) =>
      kws.some((k) => h.toLowerCase().includes(k.toLowerCase()))
    ) || '';

  const C = {
    id:       find('id', 'key', '#'),
    name:     find('name', 'title', 'deal', 'opportunity'),
    account:  find('account', 'company', 'client', 'customer'),
    value:    find('value', 'amount', 'revenue', 'price', 'arr'),
    stage:    find('stage', 'status', 'phase', 'pipeline'),
    prob:     find('probability', 'prob', 'confidence', 'win'),
    close:    find('close', 'date', 'due', 'deadline'),
    contact:  find('contact', 'owner', 'rep', 'assigned'),
    email:    find('email', 'mail'),
    phone:    find('phone', 'tel'),
    industry: find('industry', 'sector', 'vertical'),
  };

  const deals: NormalizedDeal[] = rows
    .filter((r) => r[C.name] || r[C.account])
    .map((r, i) => {
      const value = parseFloat(
        String(r[C.value] || 0).replace(/[$,]/g, '')
      ) || 0;
      const prob = Math.min(
        100,
        Math.max(0, parseFloat(String(r[C.prob] || 65)) || 65)
      );
      const stage = String(r[C.stage] || 'Qualification');
      const close = String(r[C.close] || '');
      return {
        id:            String(r[C.id] || `deal_${i}`),
        name:          String(r[C.name] || `Deal ${i + 1}`),
        accountId:     String(r[C.id] || `acc_${i}`),
        accountName:   String(r[C.account] || r[C.name] || `Account ${i}`),
        value,
        formattedValue: fmt(value),
        stage,
        probability:   prob,
        closeDate:     close,
        daysLeft:      daysLeft(close),
        contact:       String(r[C.contact] || 'Primary Contact'),
        owner:         String(r[C.contact] || 'Sales Rep'),
        lastActivity:  close || new Date().toISOString().split('T')[0],
        signals:       ['Active opportunity'],
        industry:      String(r[C.industry] || 'Technology'),
        email:         String(r[C.email] || ''),
        phone:         String(r[C.phone] || ''),
      };
    });

  const accountMap = new Map<string, NormalizedAccount>();
  deals.forEach((d) => {
    if (!accountMap.has(d.accountName)) {
      accountMap.set(d.accountName, {
        id:             d.accountId,
        name:           d.accountName,
        industry:       d.industry,
        revenue:        d.value,
        employees:      0,
        primaryContact: d.contact,
        email:          d.email,
        phone:          d.phone,
        lastActivity:   d.lastActivity,
        deals:          [],
        buyingSignals:  d.signals,
        engagementLevel: d.probability >= 70 ? 'High'
          : d.probability >= 40 ? 'Medium' : 'Low',
      });
    }
    accountMap.get(d.accountName)!.deals.push(d);
  });

  const accounts = Array.from(accountMap.values());
  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const closedWon  = deals.filter(
    (d) => d.stage.toLowerCase().includes('closed won')
  ).length;
  const winRate = deals.length > 0
    ? Math.round((closedWon / deals.length) * 100) : 0;

  return {
    deals, accounts,
    activities: deals.slice(0, 20).map((d, i) => ({
      id:          `act_${i}`,
      type:        'Update',
      subject:     d.name,
      accountName: d.accountName,
      date:        d.lastActivity,
      description: d.stage,
    })),
    summary: {
      totalPipelineValue:    totalValue,
      formattedPipelineValue: fmt(totalValue),
      activeDeals:           deals.length,
      winRate,
      avgDealSize:           deals.length > 0
        ? Math.round(totalValue / deals.length) : 0,
      totalAccounts:         accounts.length,
    },
    rawFileName: fileName,
    uploadedAt:  new Date().toISOString(),
  };
};

// ─────────────────────────────────────────
// MAIN EXPORT — handles ALL file types
// ─────────────────────────────────────────

export const parseFileToGlobalData = async (
  file: File
): Promise<GlobalData> => {
  const ext = file.name.split('.').pop()?.toLowerCase();

  // ── Excel: read ALL sheets, join by AccountId ──
  if (ext === 'xlsx' || ext === 'xls') {
    const buffer = await file.arrayBuffer();

    // Read all sheets
    const sheets = readAllSheets(buffer);

    // If multi-sheet relational format (has Accounts + Opportunities)
    const hasAccounts = sheets.has('accounts') || sheets.has('account');
    const hasOpps     = sheets.has('opportunities') || sheets.has('opportunity')
      || sheets.has('deals') || sheets.has('opps');

    if (hasAccounts && hasOpps) {
      console.log('✅ Multi-sheet Excel detected — joining by AccountId');
      return buildGlobalDataFromSheets(sheets, file.name);
    }

    // Single sheet fallback
    console.log('ℹ️ Single-sheet Excel — using flat parser');
    const firstSheet = sheets.values().next().value as
      Record<string, string | number>[];
    return buildGlobalDataFromFlatRows(firstSheet, file.name);
  }

  // ── CSV ──
  if (ext === 'csv') {
    const text = await file.text();
    const rows = parseCSVText(text);
    return buildGlobalDataFromFlatRows(rows, file.name);
  }

  // ── JSON ──
  if (ext === 'json') {
    const text  = await file.text();
    const parsed = JSON.parse(text);
    const arr    = Array.isArray(parsed) ? parsed : [parsed];
    const rows   = arr.map((r) =>
      Object.fromEntries(
        Object.entries(r as Record<string, unknown>).map(
          ([k, v]) => [k.toLowerCase().trim(), String(v ?? '')]
        )
      )
    ) as Record<string, string | number>[];
    return buildGlobalDataFromFlatRows(rows, file.name);
  }

  throw new Error(
    `Unsupported file type .${ext}. Please use .xlsx, .xls, .csv, or .json`
  );
};
