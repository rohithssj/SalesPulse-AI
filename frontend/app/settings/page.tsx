import { Suspense } from 'react';
import { SettingsContent } from './settings-content';

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
