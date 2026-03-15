'use client';

interface SettingsToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

export function SettingsToggle({ label, description, value, onChange }: SettingsToggleProps) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '16px 0',
      borderBottom: '1px solid #2a2a3e'
    }}>
      <div>
        <p style={{ color: '#f9fafb', fontSize: '14px', fontWeight: '500', margin: 0 }}>
          {label}
        </p>
        {description && (
          <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>
            {description}
          </p>
        )}
      </div>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: '44px', height: '24px', borderRadius: '12px',
          backgroundColor: value ? '#6366f1' : '#374151',
          cursor: 'pointer', position: 'relative',
          transition: 'background-color 0.2s ease', flexShrink: 0
        }}
      >
        <div style={{
          position: 'absolute', top: '2px',
          left: value ? '22px' : '2px',
          width: '20px', height: '20px',
          borderRadius: '50%', backgroundColor: '#fff',
          transition: 'left 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }} />
      </div>
    </div>
  );
}
