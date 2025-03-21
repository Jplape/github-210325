import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings, SettingDefinition } from '../types/settings';

interface SettingsState {
  settings: AppSettings;
  definitions: SettingDefinition[];
  updateSetting: (category: keyof AppSettings, key: string, value: any) => void;
  lockSetting: (settingId: string) => void;
  unlockSetting: (settingId: string) => void;
  requireSync: () => void;
  syncSettings: () => Promise<void>;
}

const defaultSettings: AppSettings = {
  mobileSettings: {
    offlineMode: true,
    notifications: true,
    autoSync: true,
    dataRetention: 30,
  },
  security: {
    lockedSettings: [],
    requireAuth: true,
    sessionTimeout: 30,
  },
  notifications: {
    email: true,
    browser: true,
    mobile: true,
    sound: true,
  },
  sync: {
    lastSync: null,
    syncInterval: 15,
    pendingChanges: false,
  },
};

export const settingDefinitions: SettingDefinition[] = [
  {
    id: 'offlineMode',
    label: 'Mode hors ligne',
    description: 'Permet aux techniciens de travailler sans connexion internet',
    type: 'boolean',
    defaultValue: true,
    category: 'mobile',
    requiresAdmin: true,
  },
  {
    id: 'notifications',
    label: 'Notifications mobiles',
    description: 'Active les notifications push sur les appareils mobiles',
    type: 'boolean',
    defaultValue: true,
    category: 'mobile',
    requiresAdmin: false,
  },
  {
    id: 'autoSync',
    label: 'Synchronisation automatique',
    description: 'Synchronise automatiquement les données avec le serveur',
    type: 'boolean',
    defaultValue: true,
    category: 'mobile',
    requiresAdmin: true,
  },
  {
    id: 'dataRetention',
    label: 'Rétention des données',
    description: 'Durée de conservation des données hors ligne (en jours)',
    type: 'number',
    defaultValue: 30,
    category: 'mobile',
    requiresAdmin: true,
  },
];

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      definitions: settingDefinitions,

      updateSetting: (category, key, value) => {
        const currentSettings = get().settings;
        const newSettings = {
          ...currentSettings,
          [category]: {
            ...currentSettings[category],
            [key]: value,
          },
        };

        // Si le paramètre est verrouillé, on ne permet pas la modification
        if (currentSettings.security.lockedSettings.includes(`${category}.${key}`)) {
          console.warn(`Setting ${category}.${key} is locked`);
          return;
        }

        set({ 
          settings: newSettings,
          sync: {
            ...currentSettings.sync,
            pendingChanges: true,
          }
        });
      },

      lockSetting: (settingId) => {
        set((state) => ({
          settings: {
            ...state.settings,
            security: {
              ...state.settings.security,
              lockedSettings: [...state.settings.security.lockedSettings, settingId],
            },
          },
        }));
      },

      unlockSetting: (settingId) => {
        set((state) => ({
          settings: {
            ...state.settings,
            security: {
              ...state.settings.security,
              lockedSettings: state.settings.security.lockedSettings.filter(
                (id) => id !== settingId
              ),
            },
          },
        }));
      },

      requireSync: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            sync: {
              ...state.settings.sync,
              pendingChanges: true,
            },
          },
        }));
      },

      syncSettings: async () => {
        // Simuler une synchronisation
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        set((state) => ({
          settings: {
            ...state.settings,
            sync: {
              ...state.settings.sync,
              lastSync: new Date().toISOString(),
              pendingChanges: false,
            },
          },
        }));
      },
    }),
    {
      name: 'settings-storage',
      version: 1,
    }
  )
);