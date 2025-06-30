import { useState } from 'react';
import { User, Shield, Bell, Palette, Globe, HelpCircle, ChevronRight, Moon, Sun, Eye, EyeOff, X, Plus, LogOut } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';
import { useAuthContext } from '../contexts';
import { useToast } from '../hooks';
import { useNavigate } from 'react-router-dom';

interface SettingsComponentsProps {
  activeSection: string;
}

export function SettingsComponents({ activeSection }: SettingsComponentsProps) {
  const { language, setLanguage, t } = useLanguage();
  const { theme, textSize, setTheme, setTextSize } = useTheme();
  const { user, updateProfile, changePassword, logout, loading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState({
    messages: true,
    calls: true,
    groups: true,
    email: false
  });
  
  const [profileData, setProfileData] = useState({
    photo: user?.profilePicture || 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=60&h=60&fit=crop&crop=face',
    fullName: user?.username || 'Utilisateur',
    age: '25',
    gender: user?.gender || 'Autre',
    biography: user?.bio || 'Passionnée par la technologie et les voyages. Toujours à la recherche de nouvelles aventures !',
    location: 'Paris, France',
    status: 'Disponible pour discuter'
  });
  
  // État pour le changement de mot de passe
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [interests, setInterests] = useState<string[]>(['Technologie', 'Voyages', 'Photographie', 'Cuisine']);
  const [newInterest, setNewInterest] = useState('');

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' }
  ];

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        username: profileData.fullName,
        bio: profileData.biography,
        interests: interests
      });
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil",
        variant: "destructive"
      });
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const renderProfileSettings = () => (
    <div className="space-y-4 sm:space-y-6">
<h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t('profile')}</h2>
      
      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('profilePhoto')}</label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <img 
              src={profileData.photo} 
              alt="Profil"
              className="w-12 h-12 sm:w-15 sm:h-15 rounded-full object-cover"
            />
            <button className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              {t('changePhoto')}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">{t('fullName')}</label>
          <input
            id="fullName"
            type="text"
            value={profileData.fullName}
            onChange={(e) => handleProfileChange('fullName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('fullName')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">{t('age')}</label>
            <input
              id="age"
              type="text"
              value={profileData.age}
              onChange={(e) => handleProfileChange('age', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={t('age')}
            />
          </div>
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">{t('gender')}</label>
            <input
              id="gender"
              type="text"
              value={profileData.gender}
              onChange={(e) => handleProfileChange('gender', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={t('gender')}
            />
          </div>
        </div>

        <div>
          <label htmlFor="biography" className="block text-sm font-medium text-gray-700 mb-2">{t('biography')}</label>
          <textarea
            id="biography"
            value={profileData.biography}
            onChange={(e) => handleProfileChange('biography', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('biography')}
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">{t('location')}</label>
          <input
            id="location"
            type="text"
            value={profileData.location}
            onChange={(e) => handleProfileChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('location')}
          />
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">{t('status')}</label>
          <input
            id="status"
            type="text"
            value={profileData.status}
            onChange={(e) => handleProfileChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t('status')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('interests')}</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {interests.map((interest, index) => (
              <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                {interest}
                <button 
                  onClick={() => handleRemoveInterest(interest)}
                  className="ml-1 focus:outline-none"
                  title={`${t('delete')} ${interest}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <button 
            onClick={() => setShowInterestsModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            title={t('addInterest')}
          >
            <Plus className="w-4 h-4 mr-1" />
            {t('add')}
          </button>
        </div>

        <div className="pt-4">
          <button 
            onClick={handleSaveProfile}
            className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            title={t('save')}
          >
            {t('save')}
          </button>
        </div>
      </div>

      {/* Modal for Interests */}
      {showInterestsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full sm:w-96">
            <h3 className="text-lg font-semibold mb-4">{t('manageInterests')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <label htmlFor="newInterest" className="sr-only">{t('newInterest')}</label>
                <input
                  id="newInterest"
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={t('newInterest')}
                />
                <button 
                  onClick={handleAddInterest}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  title={t('addInterest')}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {interests.map((interest, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    {interest}
                    <button 
                      onClick={() => handleRemoveInterest(interest)}
                      className="text-red-500 hover:text-red-700"
                      title={`${t('delete')} ${interest}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setShowInterestsModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                title={t('close')}
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-4 sm:space-y-6">
<h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t('privacy')}</h2>
      
      <div className="space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm sm:text-base">{t('whoCanSeeOnline')}</h3>
            <p className="text-xs sm:text-sm text-gray-600">{t('controlOnlineStatus')}</p>
          </div>
          <div className="w-full sm:w-auto">
            <label htmlFor="onlineVisibility" className="sr-only">{t('whoCanSeeOnline')}</label>
            <select 
              id="onlineVisibility"
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title={t('whoCanSeeOnline')}
            >
              <option>{t('everyone')}</option>
              <option>{t('contactsOnly')}</option>
              <option>{t('nobody')}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm sm:text-base">{t('privateMessages')}</h3>
            <p className="text-xs sm:text-sm text-gray-600">{t('whoCanSendMessages')}</p>
          </div>
          <div className="w-full sm:w-auto">
            <label htmlFor="privateMessages" className="sr-only">{t('privateMessages')}</label>
            <select 
              id="privateMessages"
              className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title={t('privateMessages')}
            >
              <option>{t('everyone')}</option>
              <option>{t('contactsOnly')}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm sm:text-base">{t('readReceipts')}</h3>
            <p className="text-xs sm:text-sm text-gray-600">{t('showReadReceipts')}</p>
          </div>
          <div className="relative inline-flex items-center cursor-pointer">
            <label htmlFor="readReceipts" className="sr-only">{t('readReceipts')}</label>
            <input type="checkbox" id="readReceipts" className="sr-only peer" defaultChecked />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4 sm:space-y-6">
<h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t('notifications')}</h2>
      
      <div className="space-y-3 sm:space-y-4">
        {Object.entries(notifications).map(([key, value]) => (
          <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 capitalize text-sm sm:text-base">
                {key === 'messages' && t('privateMessages')}
                {key === 'calls' && t('calls')}
                {key === 'groups' && t('groupMessages')}
                {key === 'email' && t('emailNotifications')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                {key === 'messages' && t('newMessagesNotification')}
                {key === 'calls' && t('callsNotification')}
                {key === 'groups' && t('groupMessagesNotification')}
                {key === 'email' && t('emailSummary')}
              </p>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <label htmlFor={`notification-${key}`} className="sr-only">{`Activer les notifications pour ${key}`}</label>
              <input 
                type="checkbox" 
                id={`notification-${key}`}
                className="sr-only peer" 
                checked={value}
                onChange={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderThemeSettings = () => (
    <div className="space-y-4 sm:space-y-6">
<h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t('appearance')}</h2>
      
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h3 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">{t('theme')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-3 sm:p-4 border-2 rounded-lg transition-all ${
                theme === 'light' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              title={t('light')}
            >
              <Sun className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-yellow-500" />
              <p className="font-medium text-sm sm:text-base">{t('light')}</p>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-3 sm:p-4 border-2 rounded-lg transition-all ${
                theme === 'dark' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
              title={t('dark')}
            >
              <Moon className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2 text-gray-600" />
              <p className="font-medium text-sm sm:text-base">{t('dark')}</p>
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-3 text-sm sm:text-base">{t('textSize')}</h3>
          <div className="w-full sm:w-auto">
            <label htmlFor="textSize" className="sr-only">{t('textSize')}</label>
            <select 
              id="textSize"
              value={textSize}
              onChange={(e) => setTextSize(e.target.value as 'small' | 'normal' | 'large')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              title={t('textSize')}
            >
              <option value="small">{t('small')}</option>
              <option value="normal">{t('normal')}</option>
              <option value="large">{t('large')}</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLanguageSettings = () => (
    <div className="space-y-4 sm:space-y-6">
<h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t('language')}</h2>
      
      <div className="space-y-2 sm:space-y-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as 'fr')}
            className={`w-full flex items-center justify-between p-3 sm:p-4 border-2 rounded-lg transition-all ${
              language === lang.code ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}
            title={`Sélectionner ${lang.name} comme langue`}
          >
            <div className="flex items-center space-x-3">
              <span className="text-xl sm:text-2xl">{lang.flag}</span>
              <span className="font-medium text-sm sm:text-base">{lang.name}</span>
            </div>
            {language === lang.code && (
              <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // Fonction pour gérer le changement de mot de passe
  const handlePasswordChange = async () => {
    // Vérifier que les mots de passe correspondent
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      
      // Réinitialiser le formulaire
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Fermer le modal
      setShowPasswordModal(false);
      
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès.",
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du changement de mot de passe",
        variant: "destructive"
      });
    }
  };

  const renderSecuritySettings = () => (
    <div className="space-y-4 sm:space-y-6">
<h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t('account')}</h2>
      
      <div className="space-y-3 sm:space-y-4">
        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{t('changePassword')}</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-3">{t('updatePassword')}</p>
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base"
          >
            {t('edit')}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-3 sm:space-y-0">
          <div className="flex-1">
            <h3 className="font-medium text-gray-900 text-sm sm:text-base">{t('twoFactorAuth')}</h3>
            <p className="text-xs sm:text-sm text-gray-600">{t('extraSecurity')}</p>
          </div>
          <div className="relative inline-flex items-center cursor-pointer">
            <label htmlFor="twoFactorAuth" className="sr-only">{t('twoFactorAuth')}</label>
            <input type="checkbox" id="twoFactorAuth" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </div>
        </div>

        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{t('activeSessions')}</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-3">{t('manageDevices')}</p>
          <button className="text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base">
            {t('viewSessions')}
          </button>
        </div>

        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{t('logout')}</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-3">{t('logoutDescription')}</p>
          <button 
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="text-red-600 hover:text-red-700 transition-colors text-sm sm:text-base flex items-center"
          >
            <LogOut className="w-4 h-4 mr-1" />
            {t('logout')}
          </button>
        </div>
      </div>
    </div>
  );

  const renderHelpSettings = () => (
    <div className="space-y-4 sm:space-y-6">
<h2 className="text-lg sm:text-xl font-semibold text-gray-900">{t('help')}</h2>
      
      <div className="space-y-3 sm:space-y-4">
        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{t('faq')}</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-3">{t('faqDescription')}</p>
          <button className="text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base">
            {t('viewFAQ')}
          </button>
        </div>

        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{t('contactSupport')}</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-3">{t('needHelp')}</p>
          <button className="text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base">
            {t('sendMessage')}
          </button>
        </div>

        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">{t('reportIssue')}</h3>
          <p className="text-xs sm:text-sm text-gray-600 mb-3">{t('reportBug')}</p>
          <button className="text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base">
            {t('report')}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Contenu principal basé sur la section active */}
      {(() => {
        switch (activeSection) {
          case 'profile':
            return renderProfileSettings();
          case 'security':
            return renderSecuritySettings();
          case 'privacy':
            return renderPrivacySettings();
          case 'notifications':
            return renderNotificationSettings();
          case 'theme':
            return renderThemeSettings();
          case 'language':
            return renderLanguageSettings();
          case 'help':
            return renderHelpSettings();
          default:
            return renderSecuritySettings();
        }
      })()}
      
      {/* Modal de changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{t('changePassword')}</h3>
            <div className="space-y-4">
              {/* Mot de passe actuel */}
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('currentPassword')}
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    type={showPassword.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    aria-label={t('currentPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword.current ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Nouveau mot de passe */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('newPassword')}
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    aria-label={t('newPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword.new ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Confirmer le nouveau mot de passe */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    aria-label={t('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword.confirm ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={authLoading}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center ${authLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {authLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                )}
                {authLoading ? t('processing') : t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
