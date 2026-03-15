
import { parseAnyResponse } from '@/lib/responseParser';

interface RenderedContentProps {
  data: unknown;
  fallback?: string;
  style?: React.CSSProperties;
}

export function RenderedContent({ data, fallback = '', style }: RenderedContentProps) {
  const text = parseAnyResponse(data);
  const display = text || fallback;

  if (!display) return null;

  // Clean escape sequences
  const cleaned = display
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '  ')
    .replace(/\\\"/g, '"')
    .trim();

  return (
    <pre style={{
      color: 'inherit',
      fontSize: '13px',
      lineHeight: '1.8',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      fontFamily: 'inherit',
      margin: 0,
      ...style
    }}>
      {cleaned}
    </pre>
  );
}
