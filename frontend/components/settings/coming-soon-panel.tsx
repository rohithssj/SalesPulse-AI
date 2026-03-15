'use client';

interface ComingSoonPanelProps {
  name: string;
  description: string;
}

export const ComingSoonPanel = ({ name, description }: ComingSoonPanelProps) => (
  <div style={{
    padding: '20px', background: '#0f172a', borderRadius: '8px',
    border: '1px dashed #374151', textAlign: 'center'
  }}>
    <p style={{ fontSize: '24px', margin: '0 0 8px' }}>🔜</p>
    <p style={{ color: '#f9fafb', fontSize: '14px', fontWeight: '600', margin: '0 0 4px' }}>
      {name} Integration
    </p>
    <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 16px' }}>
      {description}
    </p>
    <span style={{
      background: '#1e1b4b', color: '#818cf8', fontSize: '11px',
      fontWeight: '700', padding: '4px 12px', borderRadius: '20px',
      border: '1px solid #4338ca', textTransform: 'uppercase',
      letterSpacing: '0.08em'
    }}>
      Coming Soon
    </span>
  </div>
);
