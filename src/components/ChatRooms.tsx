import { Users, MessageCircle, Heart, UserCheck, Crown, Plus } from 'lucide-react';
import { ChatRoom } from '@/types';
import { useLanguage } from './LanguageContext';

interface ChatRoomsProps {
  onRoomSelect: (roomId: string) => void;
  selectedRoom?: string;
  userRole: 'user' | 'admin';
  searchQuery?: string;
}

export function ChatRooms({ onRoomSelect, selectedRoom, userRole, searchQuery = '' }: ChatRoomsProps) {
  const { t } = useLanguage();

  const chatRooms: ChatRoom[] = [
    {
      id: 'amis',
      name: t('amis'),
      description: t('amisDesc'),
      type: 'amis',
      connectedUsers: 24,
      maxUsers: 100,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'rencontres',
      name: t('rencontres'),
      description: t('rencontresDesc'),
      type: 'rencontres',
      connectedUsers: 18,
      maxUsers: 50,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'connaissances',
      name: t('connaissances'),
      description: t('connaissancesDesc'),
      type: 'connaissances',
      connectedUsers: 31,
      maxUsers: 80,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'mariage',
      name: t('mariage'),
      description: t('mariageDesc'),
      type: 'mariage',
      connectedUsers: 12,
      maxUsers: 30,
      isActive: true,
      createdAt: new Date(),
    },
    {
      id: 'general',
      name: t('general'),
      description: t('generalDesc'),
      type: 'general',
      connectedUsers: 45,
      maxUsers: 150,
      isActive: true,
      createdAt: new Date(),
    },
  ];

  const filteredRooms = chatRooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoomIcon = (type: ChatRoom['type']) => {
    switch (type) {
      case 'amis':
        return <Users className="w-5 h-5" />;
      case 'rencontres':
        return <Heart className="w-5 h-5" />;
      case 'connaissances':
        return <UserCheck className="w-5 h-5" />;
      case 'mariage':
        return <Crown className="w-5 h-5" />;
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  };

  const getRoomGradient = (type: ChatRoom['type']) => {
    switch (type) {
      case 'amis':
        return 'from-blue-500 to-blue-600';
      case 'rencontres':
        return 'from-pink-500 to-pink-600';
      case 'connaissances':
        return 'from-green-500 to-green-600';
      case 'mariage':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="space-y-3">
      {userRole === 'admin' && (
        <div className="flex items-center justify-between mb-4 animate-fade-in">
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {t('groupSettings')}
          </h4>
          <button 
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 transform" 
            title={t('newGroupChat')}
            aria-label={t('newGroupChat')}
          >
            <Plus className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      )}
      
      {filteredRooms.map((room, index) => (
        <div
          key={room.id}
          onClick={() => onRoomSelect(room.id)}
          className={`p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 transform animate-fade-in ${
            selectedRoom === room.id 
              ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 shadow-lg' 
              : 'hover:bg-gray-50 hover:shadow-md'
          }`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getRoomGradient(room.type)} flex items-center justify-center text-white animate-scale-in`}>
              {getRoomIcon(room.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 truncate text-sm">{room.name}</h4>
              <p className="text-xs text-gray-500 truncate">{room.description}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-600 font-medium">{room.connectedUsers} {t('online')}</span>
              </div>
            </div>
            {room.maxUsers && (
              <span className="text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {room.connectedUsers}/{room.maxUsers}
              </span>
            )}
          </div>
          
          {selectedRoom === room.id && (
            <div className="mt-3 pt-3 border-t border-gray-200 animate-fade-in">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{t('activeSince')} {room.createdAt.toLocaleDateString()}</span>
                <span className="text-green-500 font-medium">{t('online')}</span>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {filteredRooms.length === 0 && searchQuery && (
        <div className="text-center py-8 text-gray-500">
          <p>{t('noResults')} "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
