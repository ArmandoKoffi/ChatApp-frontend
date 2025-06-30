import { useState } from "react";
import { Users, Settings, UserPlus, Shield, Flag } from "lucide-react";
import { ChatRoom } from "@/types";
import { useLanguage } from './LanguageContext';

interface GroupInfoPanelProps {
  selectedRoom: string;
}

export function GroupInfoPanel({ selectedRoom }: GroupInfoPanelProps) {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string, name: string } | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [reportedUsers, setReportedUsers] = useState<string[]>([]);
  const [backgroundColor, setBackgroundColor] = useState('#f0f2f5');
  const [inviteLink, setInviteLink] = useState('');
  const { t } = useLanguage();

  const handleInvite = () => {
    // Simulate generating an app-specific invite link
    const link = `lovable-app://group/${currentRoom.id}/join?token=${Math.random().toString(36).substring(2, 15)}`;
    setInviteLink(link);
    setShowInviteModal(true);
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      alert('Lien d\'invitation copié dans le presse-papiers');
    }, () => {
      alert('Échec de la copie du lien');
    });
  };

  const handleToggleBlock = (userId: string, block: boolean) => {
    setBlockedUsers(prev => 
      block 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
    console.log(`${block ? 'Bloqué' : 'Débloqué'} utilisateur:`, userId);
    setShowBlockModal(false);
    setSelectedUser(null);
  };

  const handleReport = (userId: string) => {
    setReportedUsers(prev => [...prev, userId]);
    console.log('Signalement envoyé pour l\'utilisateur:', userId);
    setShowReportModal(false);
    setSelectedUser(null);
    alert(`Signalement envoyé pour ${selectedUser?.name}`);
  };

  const handleUserBlock = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
    setShowBlockModal(true);
  };

  const handleUserReport = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
    setShowReportModal(true);
  };

  const rooms: Record<string, ChatRoom> = {
    amis: {
      id: "amis",
      name: t('amis'),
      description: t('amisDesc'),
      type: "amis",
      connectedUsers: 24,
      maxUsers: 100,
      isActive: true,
      createdAt: new Date(),
    },
    rencontres: {
      id: "rencontres",
      name: t('rencontres'),
      description: t('rencontresDesc'),
      type: "rencontres",
      connectedUsers: 18,
      maxUsers: 50,
      isActive: true,
      createdAt: new Date(),
    },
    connaissances: {
      id: "connaissances",
      name: t('connaissances'),
      description: t('connaissancesDesc'),
      type: "connaissances",
      connectedUsers: 31,
      maxUsers: 80,
      isActive: true,
      createdAt: new Date(),
    },
    mariage: {
      id: "mariage",
      name: t('mariage'),
      description: t('mariageDesc'),
      type: "mariage",
      connectedUsers: 12,
      maxUsers: 30,
      isActive: true,
      createdAt: new Date(),
    },
    general: {
      id: "general",
      name: t('general'),
      description: t('generalDesc'),
      type: "general",
      connectedUsers: 45,
      maxUsers: 150,
      isActive: true,
      createdAt: new Date(),
    },
  };

  const currentRoom = rooms[selectedRoom];

  const connectedUsers = [
    {
      id: "1",
      name: "Marie",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=40&h=40&fit=crop&crop=face",
      status: "En ligne",
    },
    {
      id: "2",
      name: "Pierre",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      status: "En ligne",
    },
    {
      id: "3",
      name: "Sophie",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      status: "En ligne",
    },
    {
      id: "4",
      name: "Lucas",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      status: "En ligne",
    },
    {
      id: "5",
      name: "Emma",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
      status: "En ligne",
    },
  ];

  if (!currentRoom) {
    return (
      <div className="h-full bg-white p-6 animate-fade-in">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm">
            {t('selectRoomInfo')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="text-center animate-scale-in">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            {currentRoom.name}
          </h2>
          <p className="text-sm text-gray-500 mb-3">
            {currentRoom.description}
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <span>{currentRoom.connectedUsers} {t('online')}</span>
            <span>•</span>
            <span>{t('max')} {currentRoom.maxUsers}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleInvite} className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200 hover:scale-105 transform" title={t('inviteMembers')}>
            <UserPlus className="w-4 h-4" />
            <span className="text-sm">{t('invite')}</span>
          </button>
          <button onClick={() => setShowSettingsModal(true)} className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 transform" title={t('groupSettings')}>
            <Settings className="w-4 h-4" />
            <span className="text-sm">{t('settings')}</span>
          </button>
        </div>
      </div>

      {/* Membres connectés */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {t('connectedMembers')} ({connectedUsers.length})
          </h3>
          <div className="space-y-3">
            {connectedUsers.map((user, index) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105 transform animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {user.name}
                    </h4>
                <p className="text-xs text-gray-500">{t('online')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button onClick={() => handleUserReport(user.id, user.name)} className="p-1 hover:bg-gray-100 rounded transition-all duration-200 hover:scale-110" title={t('reportUser')}>
                    <Flag className="w-3 h-3 text-gray-400" />
                  </button>
                  <button onClick={() => handleUserBlock(user.id, user.name)} className="p-1 hover:bg-gray-100 rounded transition-all duration-200 hover:scale-110" title={t('blockUser')}>
                    <Shield className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-xl border border-gray-200 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('inviteFriends')}</h3>
            <p className="text-sm text-gray-600 mb-4">{t('shareInviteLink')}</p>
            <div className="bg-gray-100 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-800 break-all">{inviteLink}</p>
            </div>
            <div className="flex space-x-3">
              <button onClick={handleCopyInviteLink} className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200">
                {t('copyLink')}
              </button>
              <button onClick={() => setShowInviteModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200">
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-xl border border-gray-200 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('groupSettings')}</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-2">{t('backgroundColor')}</label>
                <input id="backgroundColor" type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" title={t('chooseBackgroundColor')} />
              </div>
              <div>
                <label htmlFor="notifications" className="block text-sm font-medium text-gray-700 mb-2">{t('notifications')}</label>
                <select id="notifications" className="w-full p-2 border border-gray-300 rounded-lg" title={t('notificationSettings')}>
                  <option>{t('allMessages')}</option>
                  <option>{t('mentionsOnly')}</option>
                  <option>{t('disabled')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="privacy" className="block text-sm font-medium text-gray-700 mb-2">{t('privacy')}</label>
                <select id="privacy" className="w-full p-2 border border-gray-300 rounded-lg" title={t('privacySettings')}>
                  <option>{t('public')}</option>
                  <option>{t('private')}</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <button onClick={() => setShowSettingsModal(false)} className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200">
                {t('save')}
              </button>
              <button onClick={() => setShowSettingsModal(false)} className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200">
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {showBlockModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-xl border border-gray-200 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {blockedUsers.includes(selectedUser.id) ? t('unblock') : t('block')} {selectedUser.name}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {blockedUsers.includes(selectedUser.id) 
                ? t('unblockConfirmation')
                : t('blockConfirmation')}
            </p>
            <div className="flex space-x-3">
              <button 
                onClick={() => handleToggleBlock(selectedUser.id, !blockedUsers.includes(selectedUser.id))} 
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
              >
                {blockedUsers.includes(selectedUser.id) ? t('unblock') : t('block')}
              </button>
              <button 
                onClick={() => {
                  setShowBlockModal(false);
                  setSelectedUser(null);
                }} 
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report User Modal */}
      {showReportModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-xl border border-gray-200 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('report')} {selectedUser.name}</h3>
            <label htmlFor="reportReason" className="block text-sm text-gray-600 mb-2">{t('reportReasonPrompt')}</label>
            <select id="reportReason" className="w-full p-2 border border-gray-300 rounded-lg mb-6" title={t('reportReason')}>
              <option>{t('inappropriateBehavior')}</option>
              <option>{t('spam')}</option>
              <option>{t('harassment')}</option>
              <option>{t('other')}</option>
            </select>
            <div className="flex space-x-3">
              <button 
                onClick={() => handleReport(selectedUser.id)} 
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
              >
                {t('report')}
              </button>
              <button 
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedUser(null);
                }} 
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
