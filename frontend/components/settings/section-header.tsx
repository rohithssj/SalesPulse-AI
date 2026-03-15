'use client';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ color: '#f9fafb', fontSize: '18px', fontWeight: '600', margin: 0 }}>
        {title}
      </h3>
      <p style={{ color: '#6b7280', fontSize: '13px', margin: '6px 0 0' }}>
        {subtitle}
      </p>
    </div>
  );
}
