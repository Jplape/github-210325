import { useState } from 'react';
import { Bell, Globe, Lock, Moon, User, Shield, Smartphone, RefreshCw } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { toast } from 'react-hot-toast';

const sections = [
  {
    id: 'mobile',
    title: 'Application Mobile',
    icon: Smartphone,
    description: 'Paramètres de l\'application mobile'
  },
  {
    id: 'security',
    title: 'Sécurité',
    icon: Lock,
    description: 'Paramètres de sécurité'
  },
  {
    id: 'notifications',
    title: 'Notifications',
    icon: Bell,
    description: 'Gérez vos préférences de notifications'
  },
  {
    id: 'sync',
    title: 'Synchronisation',
    icon: RefreshCw,
    description: 'Paramètres de synchronisation'
  }
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState('mobile');
  const { settings, definitions, updateSetting, lockSetting, unlockSetting, syncSettings } = useSettingsStore();

  const handleSettingChange = async (category: string, key: string, value: any) => {
    updateSetting(category as any, key, value);
    
    // Simuler une notification aux techniciens
    if (category === 'mobile') {
      toast.success('Les techniciens seront notifiés des changements', {
        duration: 3000,
      });
    }

    // Synchroniser les paramètres
    try {
      await syncSettings();
      toast.success('Paramètres synchronisés avec succès');
    } catch (error) {
      toast.error('Erreur lors de la synchronisation');
    }
  };

  const handleLockSetting = (settingId: string, locked: boolean) => {
    if (locked) {
      lockSetting(settingId);
      toast.success(`Paramètre "${settingId}" verrouillé`);
    } else {
      unlockSetting(settingId);
      toast.success(`Paramètre "${settingId}" déverrouillé`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Paramètres</h2>
        <p className="mt-1 text-sm text-gray-500">
          Gérez les paramètres système et les préférences des applications
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
          {/* Sidebar */}
          <div className="p-4">
            <nav className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeSection === section.id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {section.title}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="col-span-2 p-6">
            {activeSection === 'mobile' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Application Mobile</h3>
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    {settings.sync.pendingChanges ? 'Modifications en attente' : 'À jour'}
                  </span>
                </div>

                <div className="space-y-4">
                  {definitions
                    .filter(def => def.category === 'mobile')
                    .map(setting => {
                      const isLocked = settings.security.lockedSettings.includes(setting.id);
                      const value = settings.mobileSettings[setting.id as keyof typeof settings.mobileSettings];

                      return (
                        <div key={setting.id} className="flex items-start justify-between py-4 border-t">
                          <div className="flex-1">
                            <label className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">{setting.label}</span>
                              {setting.requiresAdmin && (
                                <Shield className="h-4 w-4 ml-2 text-indigo-500" />
                              )}
                            </label>
                            <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
                          </div>

                          <div className="ml-4 flex items-center space-x-4">
                            {setting.type === 'boolean' && (
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={value as boolean}
                                  onChange={(e) => handleSettingChange('mobileSettings', setting.id, e.target.checked)}
                                  disabled={isLocked}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                              </div>
                            )}

                            {setting.type === 'number' && (
                              <input
                                type="number"
                                value={value as number}
                                onChange={(e) => handleSettingChange('mobileSettings', setting.id, parseInt(e.target.value, 10))}
                                disabled={isLocked}
                                className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                              />
                            )}

                            {setting.requiresAdmin && (
                              <button
                                onClick={() => handleLockSetting(setting.id, !isLocked)}
                                className={`p-1 rounded-full ${
                                  isLocked 
                                    ? 'text-indigo-600 hover:text-indigo-700' 
                                    : 'text-gray-400 hover:text-gray-500'
                                }`}
                              >
                                <Lock className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Autres sections... */}
          </div>
        </div>
      </div>
    </div>
  );
}