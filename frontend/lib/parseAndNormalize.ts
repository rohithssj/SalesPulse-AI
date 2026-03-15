'use client';

import type { GlobalData, NormalizedDeal, NormalizedAccount } from '@/context/DataSourceContext';

const fmt = (v: number) =>
  v >= 1000000 ? `$${(v/1000000).toFixed(1)}M`
  : v >= 1000 ? `$${(v/1000).toFixed(0)}K`
  : `$${v.toFixed(0)}`;

const $n = (v: string | undefined): number =>
  parseFloat(String(v || '0').replace(/[$,\s%]/g, '')) || 0;

const daysLeft = (dateStr: string): number => {
  if (!dateStr) return 30;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 30;
  return Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86400000));
};

const findCol = (headers: string[], keywords: string[]): string =>
  headers.find(h => keywords.some(k =>
    h.toLowerCase().replace(/[\s_-]/g, '').includes(k.toLowerCase())
  )) || '';

const inferEngagement = (prob: number): 'High' | 'Medium' | 'Low' =>
  prob >= 70 ? 'High' : prob >= 40 ? 'Medium' : 'Low';

const inferSignals = (stage: string, prob: number): string[] => {
  const signals: string[] = [];
  const s = stage.toLowerCase();
  if (s.includes('negotiation')) signals.push('Requested pricing', 'Budget confirmed');
  if (s.includes('proposal')) signals.push('Asked for detailed proposal');
  if (s.includes('closing')) signals.push('Ready to sign', 'Legal review started');
  if (prob >= 80) signals.push('High engagement', 'Multiple touchpoints');
  if (prob >= 60) signals.push('Scheduled demo');
  return signals.length > 0 ? signals : ['Initial contact'];
};

export const parseFileToRows = async (
  file: File
): Promise<Record<string, string>[]> => {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'csv') {
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) throw new Error('CSV file has no data rows');
    const headers = lines[0].split(',').map(h =>
      h.trim().replace(/"/g, '').toLowerCase()
    );
    return lines.slice(1)
      .filter(l => l.trim())
      .map(line => {
        const vals = line.match(/(".*?"|[^,]+|(?<=,)(?=,))/g)
          || line.split(',');
        return headers.reduce((obj, h, i) => {
          obj[h] = (vals[i] || '').trim().replace(/"/g, '');
          return obj;
        }, {} as Record<string, string>);
      });
  }

  if (ext === 'json') {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const arr = Array.isArray(parsed) ? parsed : [parsed];
    return arr.map(row =>
      Object.fromEntries(
        Object.entries(row as Record<string, unknown>).map(
          ([k, v]) => [k.toLowerCase().trim(), String(v ?? '')]
        )
      )
    );
  }

  if (ext === 'xlsx' || ext === 'xls') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const XLSX = (window as unknown as Record<string, unknown>).XLSX as {
            read: (data: unknown, opts: unknown) => unknown;
            utils: {
              sheet_to_json: (ws: unknown, opts: unknown) => Record<string, string>[];
            };
            SheetNames: string[];
            Sheets: Record<string, unknown>;
          };
          if (!XLSX) throw new Error('SheetJS not loaded. Add to index.html.');
          const wb = XLSX.read(e.target?.result, { type: 'binary' }) as {
            SheetNames: string[];
            Sheets: Record<string, unknown>;
          };
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
          resolve(rows.map((row: Record<string, string>) =>
            Object.fromEntries(
              Object.entries(row).map(([k, v]) =>
                [k.toLowerCase().trim(), String(v ?? '')]
              )
            )
          ));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Could not read Excel file'));
      reader.readAsBinaryString(file);
    });
  }

  throw new Error(`Unsupported file type .${ext}. Use CSV, Excel, or JSON.`);
};

export const normalizeToGlobalData = (
  rows: Record<string, string>[],
  fileName: string
): GlobalData => {
  if (!rows.length) throw new Error('No data found in file');

  const headers = Object.keys(rows[0]);

  // Auto-detect columns
  const C = {
    id:       findCol(headers, ['id','key','#','number','opportunityid','dealid']),
    name:     findCol(headers, ['name','title','deal','opportunity','subject','dealname']),
    account:  findCol(headers, ['account','company','client','customer','org','accountname']),
    value:    findCol(headers, ['value','amount','revenue','price','arr','mrr','dealvalue','dealsize']),
    stage:    findCol(headers, ['stage','status','phase','pipeline','dealstage']),
    prob:     findCol(headers, ['probability','prob','confidence','win','likelihood']),
    close:    findCol(headers, ['close','closedate','duedate','deadline','target','enddate']),
    contact:  findCol(headers, ['contact','owner','rep','assigned','person','lead','salesrep']),
    email:    findCol(headers, ['email','mail','emailaddress']),
    phone:    findCol(headers, ['phone','tel','mobile','phonenumber']),
    industry: findCol(headers, ['industry','sector','vertical','type','accounttype']),
    desc:     findCol(headers, ['description','desc','notes','detail','comment']),
    activity: findCol(headers, ['activity','action','log','interaction','laststep']),
  };

  // Build deals
  const deals: NormalizedDeal[] = rows
    .filter(r => r[C.name] || r[C.account])
    .map((r, i) => {
      const value = $n(r[C.value]);
      const prob = Math.min(100, Math.max(0, $n(r[C.prob]) || 65));
      const stage = r[C.stage] || 'Qualification';
      const close = r[C.close] || '';
      const name = r[C.name] || `Deal ${i + 1}`;
      const account = r[C.account] || name;
      return {
        id: r[C.id] || `deal_${i}`,
        name,
        accountId: r[C.id] || `acc_${account.replace(/\s/g, '_')}`,
        accountName: account,
        value,
        formattedValue: fmt(value),
        stage,
        probability: prob,
        closeDate: close,
        daysLeft: daysLeft(close),
        contact: r[C.contact] || 'Primary Contact',
        owner: r[C.contact] || 'Sales Rep',
        lastActivity: close || new Date().toISOString().split('T')[0],
        signals: inferSignals(stage, prob),
        industry: r[C.industry] || 'Technology',
        email: r[C.email] || '',
        phone: r[C.phone] || '',
      };
    });

  // Build accounts grouped by accountName
  const accountMap = new Map<string, NormalizedAccount>();
  deals.forEach(deal => {
    const key = deal.accountName;
    if (!accountMap.has(key)) {
      accountMap.set(key, {
        id: deal.accountId,
        name: deal.accountName,
        industry: deal.industry,
        revenue: deal.value,
        employees: 0,
        primaryContact: deal.contact,
        email: deal.email,
        phone: deal.phone,
        lastActivity: deal.lastActivity,
        deals: [],
        buyingSignals: deal.signals,
        engagementLevel: inferEngagement(deal.probability),
      });
    }
    const acc = accountMap.get(key)!;
    acc.deals.push(deal);
    acc.revenue = Math.max(acc.revenue, deal.value);
    if (deal.probability > $n(acc.engagementLevel === 'High' ? '70' : '40')) {
      acc.engagementLevel = inferEngagement(deal.probability);
    }
    acc.buyingSignals = [...new Set([...acc.buyingSignals, ...deal.signals])];
  });

  const accounts = Array.from(accountMap.values());

  // Summary stats
  const totalValue = deals.reduce((s, d) => s + d.value, 0);
  const closedWon = deals.filter(d =>
    d.stage.toLowerCase().replace(/\s/g, '').includes('closedwon')
  ).length;
  const winRate = deals.length > 0
    ? Math.round((closedWon / deals.length) * 100) : 42;
  const avgDeal = deals.length > 0
    ? Math.round(totalValue / deals.length) : 0;

  return {
    deals,
    accounts,
    activities: deals.slice(0, 20).map((d, i) => ({
      id: `act_${i}`,
      type: d.stage.includes('Email') ? 'Email' : 'Update',
      subject: `${d.stage} — ${d.name}`,
      accountName: d.accountName,
      date: d.lastActivity,
      description: d.signals.join(', '),
    })),
    summary: {
      totalPipelineValue: totalValue,
      formattedPipelineValue: fmt(totalValue),
      activeDeals: deals.length,
      winRate,
      avgDealSize: avgDeal,
      totalAccounts: accounts.length,
    },
    rawFileName: fileName,
    uploadedAt: new Date().toISOString(),
  };
};
;
