export const getDealColor = (probability: number) => {
  if (probability >= 75) return {
    dot: '#22c55e',        // green
    glow: 'rgba(34, 197, 94, 0.4)',
    label: 'High',
    badge: '#166534',
    text: '#bbf7d0'
  };
  if (probability >= 50) return {
    dot: '#f59e0b',        // amber
    glow: 'rgba(245, 158, 11, 0.4)',
    label: 'Medium',
    badge: '#92400e',
    text: '#fde68a'
  };
  if (probability >= 25) return {
    dot: '#f97316',        // orange
    glow: 'rgba(249, 115, 22, 0.4)',
    label: 'At Risk',
    badge: '#9a3412',
    text: '#fed7aa'
  };
  return {
    dot: '#ef4444',        // red
    glow: 'rgba(239, 68, 68, 0.4)',
    label: 'Critical',
    badge: '#7f1d1d',
    text: '#fecaca'
  };
};

export const getStageBorderColor = (stage: string) => {
  const stageColors: Record<string, string> = {
    'Prospecting':   '#6366f1',   // indigo
    'Qualification': '#8b5cf6',   // violet
    'Proposal':      '#3b82f6',   // blue
    'Negotiation':   '#f59e0b',   // amber
    'Closed Won':    '#22c55e',   // green
    'Closed Lost':   '#ef4444',   // red
  };
  return stageColors[stage] || '#6b7280';
};
