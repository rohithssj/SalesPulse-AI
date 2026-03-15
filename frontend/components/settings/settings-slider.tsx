'use client';

interface SettingsSliderProps {
  label: string;
  description?: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  unit?: string;
}

export function SettingsSlider({ label, description, value, onChange, min=0, max=100, unit='%' }: SettingsSliderProps) {
  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid #2a2a3e' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
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
        <span style={{
          color: '#6366f1', fontSize: '14px', fontWeight: '700',
          background: '#1e1b4b', padding: '2px 10px',
          borderRadius: '6px', border: '1px solid #4338ca'
        }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
      />
    </div>
  );
}
