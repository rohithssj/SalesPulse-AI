'use client';

export function AccentBar() {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-50">
      <div className="h-full bg-gradient-to-r from-primary via-secondary via-accent via-primary to-secondary animate-shimmer" />
    </div>
  );
}
