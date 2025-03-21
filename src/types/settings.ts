export interface AppSettings {
  mobileSettings: {
    offlineMode: boolean;
    notifications: boolean;
    autoSync: boolean;
    dataRetention: number; // en jours
  };
  security: {
    lockedSettings: string[];
    requireAuth: boolean;
    sessionTimeout: number; // en minutes
  };
  notifications: {
    email: boolean;
    browser: boolean;
    mobile: boolean;
    sound: boolean;
  };
  sync: {
    lastSync: string | null;
    syncInterval: number; // en minutes
    pendingChanges: boolean;
  };
}

export interface SettingDefinition {
  id: string;
  label: string;
  description: string;
  type: 'boolean' | 'number' | 'select';
  defaultValue: any;
  options?: { value: string; label: string }[];
  category: 'mobile' | 'security' | 'notifications' | 'sync';
  requiresAdmin: boolean;
  locked?: boolean;
}