'use client';

import { X, Copy, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

interface GeneratedContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  onRegenerate?: () => void;
  isLoading?: boolean;
}

import { RenderedContent } from '../shared/RenderedContent';

export function GeneratedContentModal({
  isOpen,
  onClose,
  title,
  content,
  onRegenerate,
  isLoading
}: GeneratedContentModalProps) {
  const { copied, copy } = useCopyToClipboard();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div 
        className="bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-[#888] hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-primary font-medium">Generating content...</p>
            </div>
          ) : (
            <RenderedContent data={content} fallback="No content generated." />
          )}
        </div>

        <div className="p-6 border-t border-white/5 flex items-center gap-3">
          <Button 
            onClick={() => copy(content)}
            disabled={!content || isLoading}
            className="flex-1 gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10"
          >
            <Copy className="w-4 h-4" />
            {copied ? '✓ Copied!' : 'Copy to Clipboard'}
          </Button>
          
          {onRegenerate && (
            <Button 
              onClick={onRegenerate} 
              disabled={isLoading}
              className="flex-1 gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/10"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Regenerate
            </Button>
          )}
          
          <Button 
            onClick={onClose}
            className="px-6 bg-primary hover:bg-primary/90 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
