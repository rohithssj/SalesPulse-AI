'use client';

interface SettingsSelectProps {
  label: string;
  description?: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

export function SettingsSelect({ label, description, value, onChange, options }: SettingsSelectProps) {
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          background: '#1f2937', color: '#f9fafb',
          border: '1px solid #374151', borderRadius: '8px',
          padding: '6px 12px', fontSize: '13px', cursor: 'pointer',
          outline: 'none'
        }}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
