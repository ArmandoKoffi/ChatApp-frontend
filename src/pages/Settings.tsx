import { Settings as SettingsIcon, User, Bell, Shield, Palette, Globe, HelpCircle, Trash2, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { SettingsComponents } from '@/components/SettingsComponents';

import { useLanguage } from '@/components/LanguageContext';

export function Settings() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('security');

  const settingsGroups = [
    {
      title: t('account'),
      items: [
        { id: 'security', icon: Shield, label: t('security'), description: t('manageSecuritySettings') },
        { id: 'privacy', icon: Shield, label: t('privacy'), description: t('managePrivacySettings') },
      ]
    },
    {
      title: t('notifications'),
      items: [
        { id: 'notifications', icon: Bell, label: t('notifications'), description: t('configureAlerts') },
      ]
    },
    {
      title: t('appearance'),
      items: [
        { id: 'theme', icon: Palette, label: t('theme'), description: t('darkLightMode') },
        { id: 'language', icon: Globe, label: t('language'), description: t('chooseLanguage') },
      ]
    },
    {
      title: t('support'),
      items: [
        { id: 'help', icon: HelpCircle, label: t('help'), description: t('helpCenterFAQ') },
      ]
    }
  ];

  return (
    <div className="flex flex-col md:flex-row h-full bg-white overflow-y-auto">
      {/* Sidebar des paramètres */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 overflow-y-auto">
        <div className="p-1 xs:p-2 sm:p-3 lg:p-4 border-b border-gray-200">
          <h1 className="text-sm xs:text-base sm:text-lg lg:text-xl font-bold text-gray-900">{t('settings')}</h1>
        </div>

        <div className="p-1 xs:p-2 sm:p-3 lg:p-4">
          {settingsGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="mb-1 xs:mb-2 sm:mb-4 lg:mb-6">
              <h2 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-0.5 xs:mb-1 sm:mb-2 lg:mb-3">{group.title}</h2>
              <div className="space-y-0.5 sm:space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center p-0.5 xs:p-1 sm:p-2 lg:p-3 rounded-lg transition-colors text-left ${
                      activeSection === item.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <item.icon className="w-2.5 h-2.5 xs:w-3 h-3 sm:w-4 h-4 lg:w-5 lg:h-5 mr-0.5 xs:mr-1 sm:mr-2 lg:mr-3" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-xs sm:text-sm lg:text-base">{item.label}</p>
                      <p className="text-xs text-gray-500 truncate">{item.description}</p>
                    </div>
                    <ChevronRight className="w-2 h-2 xs:w-2.5 h-2.5 sm:w-3 h-3 lg:w-4 lg:h-4 ml-0.5 sm:ml-1 lg:ml-2 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="border-t border-gray-200 pt-1 xs:pt-2 sm:pt-3 lg:pt-4 mt-1 xs:mt-2 sm:mt-4 lg:mt-6">
            <button className="w-full flex items-center p-0.5 xs:p-1 sm:p-2 lg:p-3 rounded-lg hover:bg-red-50 transition-colors text-left text-red-600">
              <Trash2 className="w-2.5 h-2.5 xs:w-3 h-3 sm:w-4 h-4 lg:w-5 lg:h-5 mr-0.5 xs:mr-1 sm:mr-2 lg:mr-3" />
              <span className="font-medium text-xs sm:text-sm lg:text-base">Supprimer mon compte</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenu des paramètres */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-1 xs:p-2 sm:p-4 lg:p-6">
          <SettingsComponents activeSection={activeSection} />
        </div>
      </div>
    </div>
  );
}
