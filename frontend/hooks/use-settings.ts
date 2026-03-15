import { useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  // Salesforce
  salesforceConnected: false,
  salesforceOrgUrl: 'https://orgfarm-a0a66fa8a5-dev-ed.develop.my.salesforce.com',
  salesforceLastSync: null,

  // Notifications
  buyingSignalAlerts: true,
  dealExpiryWarnings: true,
  dealExpiryDays: 7,
  highEngagementAlerts: true,
  dailyPipelineDigest: false,

  // AI Preferences
  defaultTone: 'Formal',
  buyingSignalSensitivity: 'Medium',
  scoringWeightEngagement: 40,
  scoringWeightRecency: 35,
  scoringWeightValue: 25,
  autoGenerateSuggestions: true,
  aiResponseLength: 'Detailed',

  // Data & Sync
  autoSyncEnabled: true,
  syncFrequency: 'Every 30 minutes',
  lastSyncTime: null,
  totalRecordsSynced: 0,

  // Display
  dashboardDensity: 'Comfortable',
  defaultLandingPage: 'Dashboard',
  showWinProbability: true,
  showBuyingSignalBadges: true,
};

const STORAGE_KEY = 'salespulse_settings';

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => {
      const updated = { ...prev, [key]: value };
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const resetSettings = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    }
    setSettings(DEFAULT_SETTINGS);
  };

  return { settings, updateSetting, resetSettings };
}
