'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadFile {
  name: string;
  size: string;
  status: 'processing' | 'complete' | 'error';
  progress: number;
}

export function UploadPortal() {
  const [files, setFiles] = useState<UploadFile[]>([
    { name: 'Q4_Pipeline_Data.csv', size: '2.4 MB', status: 'complete', progress: 100 },
    { name: 'Client_Interactions.xlsx', size: '1.8 MB', status: 'processing', progress: 75 },
    { name: 'Sales_Forecast_2024.xlsx', size: '945 KB', status: 'processing', progress: 45 },
  ]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="glass luxury-panel rounded-xl p-6 border-glow-accent h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-semibold text-gradient-primary">Data Upload Portal</h2>
        </div>
        <p className="text-xs text-muted-foreground">Import sales data for AI analysis</p>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="mb-6 p-8 rounded-lg border-2 border-dashed border-accent/30 bg-white/3 hover:bg-white/5 transition-all duration-300 cursor-pointer group text-center"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-all">
            <Upload className="w-6 h-6 text-accent group-hover:text-accent-light" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Drop files here to upload</p>
            <p className="text-xs text-muted-foreground mt-1">CSV, Excel, or JSON formats supported</p>
          </div>
        </div>
      </div>

      {/* Upload List */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {files.map((file, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-accent/30 transition-all duration-300 group animate-slide-in"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3 flex-1">
                <FileText className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{file.size}</p>
                </div>
              </div>

              {/* Status Icon */}
              {file.status === 'complete' && <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />}
              {file.status === 'error' && <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />}
              {file.status === 'processing' && (
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  file.status === 'complete'
                    ? 'bg-gradient-to-r from-success to-primary'
                    : file.status === 'error'
                      ? 'bg-gradient-to-r from-destructive to-accent'
                      : 'bg-gradient-to-r from-primary to-secondary animate-shimmer'
                }`}
                style={{ width: `${file.progress}%` }}
              />
            </div>

            {/* Status Text */}
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-muted-foreground">
                {file.status === 'complete' && 'Upload complete'}
                {file.status === 'processing' && 'Processing & analyzing...'}
                {file.status === 'error' && 'Upload failed'}
              </span>
              <span className="text-primary font-semibold">{file.progress}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-border grid grid-cols-3 gap-4 text-xs">
        <div className="text-center">
          <div className="text-lg font-bold text-gradient-primary mb-1">{files.length}</div>
          <span className="text-muted-foreground">Files</span>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gradient-primary mb-1">
            {((files.reduce((sum, f) => sum + f.progress, 0) / files.length) | 0)}%
          </div>
          <span className="text-muted-foreground">Complete</span>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-success mb-1">{files.filter((f) => f.status === 'complete').length}</div>
          <span className="text-muted-foreground">Processed</span>
        </div>
      </div>
    </div>
  );
}
