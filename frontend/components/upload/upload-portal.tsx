'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, Database, Sparkles } from 'lucide-react';
import { useDataSource, GlobalData } from '@/context/DataSourceContext';
import { parseFileToGlobalData } from '@/lib/parseAndNormalize';

export function UploadPortal() {
  const { switchToUpload } = useDataSource();
  const [uploadState, setUploadState] = useState<{
    status: 'idle' | 'parsing' | 'analyzing' | 'ready' | 'error';
    progress: number;
    fileName: string;
    preview: GlobalData | null;
    error: string;
  }>({ status: 'idle', progress: 0, fileName: '', preview: null, error: '' });

  const handleFileUpload = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) return;

    setUploadState({
      status: 'parsing', progress: 15,
      fileName: file.name, preview: null, error: ''
    });

    try {
      setUploadState(p => ({ ...p, progress: 35, status: 'parsing' }));
      
      const globalData = await parseFileToGlobalData(file);
      
      setUploadState(p => ({ ...p, progress: 75, status: 'analyzing' }));

      // Small delay so user sees the progress
      await new Promise(r => setTimeout(r, 400));

      setUploadState(p => ({
        ...p, progress: 100,
        status: 'ready',
        preview: globalData
      }));

      console.log('✅ Parsed data:', {
        accounts: globalData.accounts.length,
        deals: globalData.deals.length,
        activities: globalData.activities.length,
        summary: globalData.summary,
      });

    } catch (err: unknown) {
      console.error('Upload parse error:', err);
      setUploadState(p => ({
        ...p, status: 'error',
        error: err instanceof Error
          ? err.message
          : 'Failed to parse file. Check console for details.'
      }));
    }
  };

  const handleActivateData = () => {
    if (!uploadState.preview) return;
    switchToUpload(uploadState.preview);
  };

  const resetUpload = () => {
    setUploadState({ status: 'idle', progress: 0, fileName: '', preview: null, error: '' });
  };

  return (
    <div className="glass luxury-panel rounded-xl p-6 border-glow-accent h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-gradient-primary">Data Upload Portal</h2>
        </div>
        <p className="text-xs text-muted-foreground">Import sales data for instant AI analysis and enrichment</p>
      </div>

      {uploadState.status === 'idle' || uploadState.status === 'error' ? (
        <div
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFileUpload(e.dataTransfer.files); }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files || []);
            input.click();
          }}
          className="mb-8 p-10 rounded-xl border-2 border-dashed border-accent/20 bg-white/2 hover:bg-white/5 hover:border-accent/40 transition-all duration-300 cursor-pointer group text-center"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-all scale-110">
              <Upload className="w-8 h-8 text-accent group-hover:text-accent-light" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">Select file or drag & drop</p>
              <p className="text-xs text-muted-foreground mt-1">Supports CSV, Excel (.xlsx, .xls), and JSON</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-bold text-white">{uploadState.fileName}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  {uploadState.status === 'parsing' && '⟳ Parsing structure...'}
                  {uploadState.status === 'analyzing' && '✦ Normalizing data...'}
                  {uploadState.status === 'ready' && '✓ Ready to activate'}
                </p>
              </div>
            </div>
            <button onClick={resetUpload} className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        </div>
      )}

      {uploadState.status === 'ready' && uploadState.preview && (
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar animate-fade-up">
          {/* Summary Stats Grid */}
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Total Deals', value: uploadState.preview.summary.activeDeals },
              { label: 'Pipeline Value', value: `$${(uploadState.preview.summary.totalPipelineValue / 1000).toFixed(0)}K` },
              { label: 'Accounts', value: uploadState.preview.summary.totalAccounts },
              { label: 'Avg Deal Size', value: `$${(uploadState.preview.summary.avgDealSize / 1000).toFixed(0)}K` },
              { label: 'Win Rate', value: `${uploadState.preview.summary.winRate}%` },
            ].map(stat => (
              <div key={stat.label} className="bg-[#0f172a] rounded-xl p-4 border border-[#1e3a5f] text-center">
                <p className="text-[#6b7280] text-[10px] uppercase font-bold tracking-widest mb-2">{stat.label}</p>
                <p className="text-accent text-xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Deals Preview Table */}
          <div className="bg-[#0f172a] rounded-xl border border-[#1e3a5f] mb-6 overflow-hidden">
            <div className="p-4 border-b border-[#1e3a5f] flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-semibold flex items-center gap-2">
                  <Database className="w-4 h-4 text-accent" />
                  {uploadState.preview.deals.length} Deals Detected
                </p>
                <p className="text-[#6b7280] text-[10px] mt-1">Found in {uploadState.preview.rawFileName}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#1e293b]">
                  <tr>
                    {['Deal Name', 'Account', 'Value', 'Stage', 'Prob', 'Days', 'Contact'].map(h => (
                      <th key={h} className="text-[#6b7280] text-[10px] uppercase font-bold tracking-widest p-3 border-b border-[#1e3a5f]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a2744]">
                  {uploadState.preview.deals.slice(0, 10).map((deal, i) => {
                    const probColor = deal.probability >= 75 ? 'text-success'
                      : deal.probability >= 50 ? 'text-warning'
                      : 'text-destructive';
                    return (
                      <tr key={i} className="hover:bg-white/2 transition-colors">
                        <td className="p-3 text-white text-xs whitespace-nowrap">{deal.name}</td>
                        <td className="p-3 text-[#d1d5db] text-xs whitespace-nowrap">{deal.accountName}</td>
                        <td className="p-3 text-accent text-xs font-bold">
                          ${deal.value >= 1000 ? `${(deal.value / 1000).toFixed(0)}K` : deal.value}
                        </td>
                        <td className="p-3">
                          <span className="bg-[#1e293b] text-accent-light px-2 py-0.5 rounded text-[10px] font-bold border border-accent/30">
                            {deal.stage}
                          </span>
                        </td>
                        <td className={`p-3 text-xs font-bold ${probColor}`}>{deal.probability}%</td>
                        <td className={`p-3 text-xs ${deal.daysLeft <= 7 ? 'text-destructive font-bold' : 'text-[#d1d5db]'}`}>{deal.daysLeft}d</td>
                        <td className="p-3 text-[#d1d5db] text-xs whitespace-nowrap">{deal.contact}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {uploadState.preview.deals.length > 10 && (
                <div className="p-3 bg-[#1e293b]/30 text-center">
                  <p className="text-[#6b7280] text-[10px] font-medium">
                    + {uploadState.preview.deals.length - 10} more deals in this file
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Activate Button */}
          <button
            onClick={handleActivateData}
            className="w-full bg-gradient-to-r from-accent to-accent-light text-white rounded-xl py-4 text-base font-bold shadow-lg shadow-accent/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
          >
            <Sparkles className="w-5 h-5" />
            Activate — Use This Data Across All Pages
          </button>
          <p className="text-[#6b7280] text-[10px] text-center mt-3 font-medium">
            This will switch the entire command center to use this file data instead of live Salesforce
          </p>
        </div>
      )}

      {uploadState.status === 'error' && (
        <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-destructive text-xs font-medium">{uploadState.error}</p>
        </div>
      )}
    </div>
  );
}
