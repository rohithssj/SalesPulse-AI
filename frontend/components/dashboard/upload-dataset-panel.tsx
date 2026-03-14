'use client';

import { useState } from 'react';
import { Upload, File, CheckCircle2, AlertCircle, BarChart3, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface DatasetFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  rows: number;
  columns: number;
}

const uploadedDatasets: DatasetFile[] = [
  {
    name: 'CRM_Data_2024.csv',
    size: 2.4,
    type: 'CSV',
    uploadedAt: '2 hours ago',
    rows: 1247,
    columns: 28,
  },
  {
    name: 'Pipeline_Snapshot.xlsx',
    size: 1.8,
    type: 'XLSX',
    uploadedAt: '1 day ago',
    rows: 345,
    columns: 15,
  },
];

const previewData = [
  { dealName: 'Acme Corp Enterprise', stage: 'Proposal', value: '$2.1M', health: 42, lastTouch: '2 days ago' },
  { dealName: 'TechFlow Inc', stage: 'Demo', value: '$1.8M', health: 78, lastTouch: '4 hours ago' },
  { dealName: 'CloudBase Systems', stage: 'Discovery', value: '$1.5M', health: 92, lastTouch: '1 day ago' },
  { dealName: 'Enterprise Solutions', stage: 'Negotiation', value: '$2.4M', health: 85, lastTouch: '30 min ago' },
  { dealName: 'Global Holdings Inc', stage: 'Proposal', value: '$1.2M', health: 75, lastTouch: '3 days ago' },
];

export function UploadDatasetPanel() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Simulate file upload
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        setUploadProgress(100);
        clearInterval(interval);
        setIsUploading(false);
      } else {
        setUploadProgress(progress);
      }
    }, 300);
  };

  const handleRunAnalysis = () => {
    setIsProcessing(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25;
      if (progress >= 100) {
        setProcessingProgress(100);
        clearInterval(interval);
        setIsProcessing(false);
      } else {
        setProcessingProgress(progress);
      }
    }, 400);
  };

  return (
    <div className="space-y-6 animate-fade-up-soft">
      {/* Drag & Drop Upload Area */}
      <Card
        className="glass luxury-panel border-2 border-dashed border-primary/30 p-12 rounded-lg cursor-pointer hover:border-primary/60 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Drag & Drop Your Dataset</h3>
          <p className="text-sm text-[#888] mb-4">or click to browse</p>
          <div className="flex items-center justify-center gap-3">
            <Badge className="bg-primary/10 text-primary border-primary/30 border">📊 CSV</Badge>
            <Badge className="bg-secondary/10 text-secondary border-secondary/30 border">📈 Excel</Badge>
            <Badge className="bg-warning/10 text-warning border-warning/30 border">📋 JSON</Badge>
          </div>
          <p className="text-xs text-[#666] mt-4">Max 100MB per file</p>
        </div>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white font-medium">Uploading...</span>
              <span className="text-sm text-[#888]">{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </Card>

      {/* Uploaded Datasets */}
      <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
        <h3 className="text-sm font-semibold text-white mb-4">Uploaded Datasets ({uploadedDatasets.length})</h3>
        <div className="space-y-3">
          {uploadedDatasets.map((dataset, idx) => (
            <div key={idx} className="flex items-start justify-between p-4 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
              <div className="flex items-start gap-4 flex-1">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <File className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{dataset.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <Badge className="text-[10px] bg-white/10 text-[#a3a3a3] border-white/20 border">{dataset.type}</Badge>
                    <span className="text-xs text-[#888]">{dataset.size}MB</span>
                    <span className="text-xs text-[#666]">•</span>
                    <span className="text-xs text-[#888]">{dataset.rows} rows</span>
                    <span className="text-xs text-[#666]">•</span>
                    <span className="text-xs text-[#888]">{dataset.columns} columns</span>
                  </div>
                  <p className="text-xs text-[#666] mt-2">Uploaded {dataset.uploadedAt}</p>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </Card>

      {/* Dataset Preview */}
      <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
        <h3 className="text-sm font-semibold text-white mb-4">Dataset Preview (CRM_Data_2024.csv)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">Deal Name</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">Stage</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">Value</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">Health</th>
                <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider">Last Touch</th>
              </tr>
            </thead>
            <tbody>
              {previewData.map((row, idx) => (
                <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="py-2 px-3 text-[#b3b3b3]">{row.dealName}</td>
                  <td className="py-2 px-3">
                    <Badge className="text-[10px] bg-white/10 text-white border-white/20 border">{row.stage}</Badge>
                  </td>
                  <td className="py-2 px-3 text-[#b3b3b3] font-medium">{row.value}</td>
                  <td className="py-2 px-3">
                    <Badge className={`text-[10px] ${row.health >= 80 ? 'bg-success/10 text-success border-success/30' : row.health >= 60 ? 'bg-warning/10 text-warning border-warning/30' : 'bg-red-500/10 text-red-500 border-red-500/30'} border`}>
                      {row.health}%
                    </Badge>
                  </td>
                  <td className="py-2 px-3 text-[#888]">{row.lastTouch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dataset Summary */}
      <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
        <h3 className="text-sm font-semibold text-white mb-4">Dataset Summary</h3>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
            <p className="text-xs text-[#888] mb-1">Total Records</p>
            <p className="text-2xl font-bold text-primary">1,247</p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
            <p className="text-xs text-[#888] mb-1">Columns</p>
            <p className="text-2xl font-bold text-secondary">28</p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
            <p className="text-xs text-[#888] mb-1">Last Updated</p>
            <p className="text-sm font-semibold text-[#a3a3a3] mt-3">2 hours ago</p>
          </div>
          <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
            <p className="text-xs text-[#888] mb-1">Data Quality</p>
            <p className="text-2xl font-bold text-success">98%</p>
          </div>
        </div>

        {/* Analysis Progress */}
        {isProcessing && (
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white font-medium">Running Analysis...</span>
              <span className="text-sm text-[#888]">{Math.round(processingProgress)}%</span>
            </div>
            <Progress value={processingProgress} className="h-2" />
            <div className="space-y-1 text-xs text-[#666]">
              <p>✓ Data validation complete</p>
              <p>✓ Duplicate detection complete</p>
              {processingProgress > 50 && <p>✓ Signal detection running...</p>}
            </div>
          </div>
        )}

        <Button onClick={handleRunAnalysis} disabled={isProcessing} className="w-full gap-2 bg-primary hover:bg-primary/90 text-white h-11 font-semibold">
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Analysis...
            </>
          ) : (
            <>
              <BarChart3 className="w-4 h-4" />
              Run AI Analysis
            </>
          )}
        </Button>
      </Card>
    </div>
  );
}
