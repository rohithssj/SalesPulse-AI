'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Copy, Trash2, Sparkles, Database } from 'lucide-react';
import { parseUploadedFile } from '@/utils/parse-uploaded-file';
import { summarizeUploadedData, buildAnalysisPrompt } from '@/utils/summarize-uploaded-data';
import { parseApiResponse } from '@/utils/parse-api-response';
import { useAccount } from '@/context/account-context';

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  status: 'parsing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  error?: string;
}

interface AnalysisResult {
  fileName: string;
  summary: any;
  aiInsights: string;
  analyzedAt: string;
}

export function UploadPortal() {
  const { selectedAccountId } = useAccount();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResult>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const updateFileStatus = (id: string, updates: Partial<UploadedFile>) => {
    setUploadedFiles(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      const fileId = `${file.name}-${Date.now()}`;
      
      setUploadedFiles(prev => [...prev, {
        id: fileId,
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        status: 'parsing',
        progress: 10
      }]);

      try {
        // Step 1: Parse file
        updateFileStatus(fileId, { progress: 30 });
        const parsedData = await parseUploadedFile(file);
        
        // Step 2: Summarize
        updateFileStatus(fileId, { status: 'analyzing', progress: 50 });
        const summary = summarizeUploadedData(parsedData);
        
        // Step 3: AI Analysis via fetchStrategy endpoint
        const analysisPrompt = buildAnalysisPrompt(file.name, summary);
        
        const res = await fetch('http://localhost:3001/api/strategy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId: selectedAccountId || 'remote_upload',
            context: analysisPrompt
          })
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);
        
        const data = await res.json();
        console.log(`Upload analysis raw response for ${file.name}:`, JSON.stringify(data, null, 2));
        const aiInsights = parseApiResponse(data);

        setAnalysisResults(prev => ({
          ...prev,
          [fileId]: {
            fileName: file.name,
            summary,
            aiInsights,
            analyzedAt: new Date().toISOString()
          }
        }));

        updateFileStatus(fileId, { status: 'complete', progress: 100 });
      } catch (err: any) {
        console.error(`Upload/Analysis error for ${file.name}:`, err);
        updateFileStatus(fileId, { status: 'error', progress: 100, error: err.message });
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    setAnalysisResults(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const formatCurrency = (val: number) => 
    val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : 
    val >= 1000 ? `$${(val / 1000).toFixed(0)}K` : `$${val.toFixed(0)}`;

  return (
    <div className="glass luxury-panel rounded-xl p-6 border-glow-accent h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-gradient-primary">Data Upload Portal</h2>
        </div>
        <p className="text-xs text-muted-foreground">Import sales data for instant AI analysis and enrichment</p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = true;
            input.onchange = (e) => handleFileUpload((e.target as HTMLInputElement).files);
            input.click();
        }}
        className="mb-8 p-10 rounded-xl border-2 border-dashed border-accent/20 bg-white/2 hover:bg-white/5 hover:border-accent/40 transition-all duration-300 cursor-pointer group text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-all scale-110">
            <Upload className="w-8 h-8 text-accent group-hover:text-accent-light" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">Select files or drag & drop</p>
            <p className="text-xs text-muted-foreground mt-1">Supports CSV, Excel (.xlsx, .xls), and JSON</p>
          </div>
        </div>
      </div>

      {/* Upload List & Results */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {uploadedFiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Database className="w-12 h-12 text-white/5 mb-4" />
            <p className="text-sm text-muted-foreground">No files uploaded yet</p>
          </div>
        )}

        {uploadedFiles.map((file) => (
          <div key={file.id} className="space-y-3">
            {/* File Info Card */}
            <div className={`p-4 rounded-lg bg-white/5 border border-white/10 hover:border-accent/30 transition-all duration-300 group`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${file.status === 'error' ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                    <FileText className={`w-5 h-5 ${file.status === 'error' ? 'text-destructive' : 'text-primary'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{file.size}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {file.status === 'complete' && <CheckCircle className="w-5 h-5 text-success" />}
                  {file.status === 'error' && <AlertCircle className="w-5 h-5 text-destructive" />}
                  {(file.status === 'parsing' || file.status === 'analyzing') && (
                    <div className="w-4 h-4 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
                  )}
                  <button 
                    onClick={() => removeFile(file.id)}
                    className="p-1.5 rounded-md hover:bg-white/10 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ease-out ${
                      file.status === 'complete' ? 'bg-success' : 
                      file.status === 'error' ? 'bg-destructive' : 'bg-accent shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                    }`}
                    style={{ width: `${file.progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className={file.status === 'error' ? 'text-destructive' : 'text-muted-foreground'}>
                    {file.status === 'parsing' && '⟳ Parsing file structure...'}
                    {file.status === 'analyzing' && '✦ Generating AI insights...'}
                    {file.status === 'complete' && '✓ Analysis complete'}
                    {file.status === 'error' && `✗ ${file.error || 'Failed'}`}
                  </span>
                  <span className="text-foreground">{file.progress}%</span>
                </div>
              </div>
            </div>

            {/* AI Results Panel */}
            {file.status === 'complete' && analysisResults[file.id] && (
              <div className="animate-fade-up-soft p-5 rounded-xl bg-[#0f172a] border border-accent/20 ml-2 shadow-2xl">
                {/* Statistics Grid */}
                {analysisResults[file.id].summary && (
                  <div className="grid grid-cols-4 gap-3 mb-6">
                    {[
                      { label: 'Pipeline Val', value: formatCurrency(analysisResults[file.id].summary.statistics.totalPipelineValue) },
                      { label: 'Deals Count', value: analysisResults[file.id].summary.statistics.totalDeals },
                      { label: 'Accounts', value: analysisResults[file.id].summary.statistics.uniqueAccounts },
                      { label: 'Avg Deal', value: formatCurrency(analysisResults[file.id].summary.statistics.averageDealValue) },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/3 border border-white/5 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">{stat.label}</p>
                        <p className="text-base font-bold text-accent">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Insights Content */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-[11px] font-bold text-accent uppercase tracking-widest">Pipeline Health & AI Insights</span>
                  </div>
                  <div className="p-4 rounded-lg bg-white/2 border border-white/5 relative group">
                    <p className="text-xs text-[#d1d5db] leading-relaxed whitespace-pre-wrap">
                      {analysisResults[file.id].aiInsights}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => handleCopy(file.id, analysisResults[file.id].aiInsights)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent/10 border border-accent/20 hover:bg-accent/20 text-accent transition-all text-xs font-bold uppercase tracking-tight"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedId === file.id ? 'Copied' : 'Copy Insights'}
                    </button>
                    <span className="text-[10px] text-muted-foreground ml-auto italic">
                      Analyzed at {new Date(analysisResults[file.id].analyzedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-3 gap-6 animate-fade-up">
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Total</p>
            <p className="text-xl font-black text-foreground">{uploadedFiles.length}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Success</p>
            <p className="text-xl font-black text-success">{uploadedFiles.filter(f => f.status === 'complete').length}</p>
          </div>
          <div className="text-center border-l border-white/5 pl-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Pipeline Sum</p>
            <p className="text-xl font-black text-accent-light">
              {formatCurrency(Object.values(analysisResults).reduce((sum, res) => sum + (res.summary?.statistics?.totalPipelineValue || 0), 0))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
