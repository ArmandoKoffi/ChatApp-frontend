import { useState } from 'react';
import { Send, MoreVertical, Phone, Video, Users, Menu, UserX, Paperclip, Smile } from 'lucide-react';
import { ChatRoom } from '@/types';
import { TypingIndicator } from './TypingIndicator';
import { BlockUserModal } from './BlockUserModal';
import { EmojiPicker } from './EmojiPicker';
import { VideoCallModal } from './VideoCallModal';
import { useLanguage } from './LanguageContext';

interface GroupChatAreaProps {
  selectedRoom: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onToggleRightSidebar: () => void;
}

export function GroupChatArea({ selectedRoom, sidebarOpen, onToggleSidebar, onToggleRightSidebar }: GroupChatAreaProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string} | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isAudioCall, setIsAudioCall] = useState(false);
  const [showFileErrorModal, setShowFileErrorModal] = useState(false);
  const [fileErrorMessage, setFileErrorMessage] = useState('');
  const { t } = useLanguage();

  const [messages, setMessages] = useState<{ id: number; sender: 'me' | 'other'; senderId: string; senderName?: string; content: string; time: string; avatar: string; hasImage?: boolean; hasAudio?: boolean; hasFile?: boolean; image?: string; audio?: string; fileName?: string; fileSize?: string }[]>([
    {
      id: 1,
      sender: 'other',
      senderId: 'marie',
      senderName: t('marie'),
      content: t('chatMessageBankaii1'),
      time: '14:27',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b789?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 2,
      sender: 'other',
      senderId: 'pierre',
      senderName: t('pierre'),
      content: t('chatMessageBankaii2'),
      time: '14:28',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 3,
      sender: 'me',
      senderId: 'me',
      content: t('chatMessageAleck1'),
      time: '14:30',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    }
  ]);

  const rooms: Record<string, ChatRoom> = {
    'amis': {
      id: 'amis',
      name: t('amis'),
      description: t('amisDesc'),
      type: 'amis',
      connectedUsers: 24,
      maxUsers: 100,
      isActive: true,
      createdAt: new Date(),
    },
    'rencontres': {
      id: 'rencontres',
      name: t('rencontres'),
      description: t('rencontresDesc'),
      type: 'rencontres',
      connectedUsers: 18,
      maxUsers: 50,
      isActive: true,
      createdAt: new Date(),
    },
    'connaissances': {
      id: 'connaissances',
      name: t('connaissances'),
      description: t('connaissancesDesc'),
      type: 'connaissances',
      connectedUsers: 31,
      maxUsers: 80,
      isActive: true,
      createdAt: new Date(),
    },
    'mariage': {
      id: 'mariage',
      name: t('mariage'),
      description: t('mariageDesc'),
      type: 'mariage',
      connectedUsers: 12,
      maxUsers: 30,
      isActive: true,
      createdAt: new Date(),
    },
    'general': {
      id: 'general',
      name: t('general'),
      description: t('generalDesc'),
      type: 'general',
      connectedUsers: 45,
      maxUsers: 150,
      isActive: true,
      createdAt: new Date(),
    },
  };

  const currentRoom = rooms[selectedRoom];

  const handleToggleBlock = (userId: string, block: boolean) => {
    setBlockedUsers(prev => 
      block 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
    console.log(`${block ? t('blocked') : t('unblocked')} utilisateur:`, userId);
  };

  const handleUserBlock = (userId: string, userName: string) => {
    setSelectedUser({ id: userId, name: userName });
    setShowBlockModal(true);
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log(t('messageSentGroup'), message);
      const newMessage = {
        id: messages.length + 1,
        sender: 'me' as const,
        senderId: 'me',
        content: message,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      setIsTyping(false);
      setShowEmojiPicker(false);

      // Simuler une réponse de groupe après 3 secondes
      setTimeout(() => {
        const autoResponse = {
          id: messages.length + 2,
          sender: 'other' as const,
          senderId: 'sophie',
          senderName: t('sophie'),
          content: t('chatMessageAutoResponse'),
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
        };
        setMessages(prev => [...prev, autoResponse]);
      }, 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    console.log(t('emojiAdded'), emoji);
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,audio/*,video/*,application/*';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        Array.from(files).forEach(file => {
          if (file.type.startsWith('video/') && file.size > 20 * 1024 * 1024) {
            setFileErrorMessage(t('videoSizeLimit'));
            setShowFileErrorModal(true);
            return;
          }

          if (!file.type.startsWith('video/') && file.size > 20 * 1024 * 1024) {
            setFileErrorMessage(t('fileSizeLimit'));
            setShowFileErrorModal(true);
            return;
          }

          if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.onloadedmetadata = () => {
              if (video.duration > 120) {
                setFileErrorMessage(t('videoDurationLimit'));
                setShowFileErrorModal(true);
                URL.revokeObjectURL(video.src);
                return;
              }
              console.log(t('videoUploaded'), file.name);
              addFileMessage(file);
            };
          } else {
            console.log(t('fileUploaded'), file.name);
            addFileMessage(file);
          }
        });
      }
    };
    input.click();
  };

  const addFileMessage = (file: File) => {
    const newMessage = {
      id: messages.length + 1,
      sender: 'me' as const,
      senderId: 'me',
      content: file.type.startsWith('image/') ? t('sharedPhoto') : 
               file.type.startsWith('audio/') ? t('sentVoiceMessage') :
               file.type.startsWith('video/') ? t('sharedVideo') : t('sharedFile'),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      hasImage: file.type.startsWith('image/'),
      hasAudio: file.type.startsWith('audio/'),
      hasFile: !file.type.startsWith('image/') && !file.type.startsWith('audio/'),
      image: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      audio: file.type.startsWith('audio/') ? URL.createObjectURL(file) : undefined,
      fileName: !file.type.startsWith('image/') ? file.name : undefined,
      fileSize: !file.type.startsWith('image/') ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : undefined
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const startGroupVideoCall = () => {
    console.log(t('groupVideoCallStarted'));
    setIsAudioCall(false);
    setShowVideoCall(true);
  };

  const startGroupAudioCall = () => {
    console.log(t('groupAudioCallStarted'));
    setIsAudioCall(true);
    setShowVideoCall(true);
  };

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 animate-fade-in">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
            <Users className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('selectRoom')}
          </h2>
          <p className="text-gray-600">
            {t('selectRoomDesc')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in transition-all duration-300 ease-in-out">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white animate-slide-in-right transition-all duration-300 ease-in-out">
        <div className="flex items-center">
          {!sidebarOpen && (
          <button 
            onClick={onToggleSidebar}
            className="mr-3 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 lg:hidden"
            title={t('toggleSidebar')}
            aria-label={t('toggleSidebar')}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          )}
          
          <div className="relative mr-3 animate-scale-in">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          
          <div className="animate-fade-in">
            <h3 className="font-semibold text-gray-900">{currentRoom.name}</h3>
            <p className="text-sm text-gray-500">{currentRoom.connectedUsers} {t('online')}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <button 
            onClick={startGroupAudioCall}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 transform"
            title={t('startAudioCall')}
            aria-label={t('startAudioCall')}
          >
            <Phone className="w-5 h-5 text-gray-600 hover:text-green-500 transition-colors" />
          </button>
          <button 
            onClick={startGroupVideoCall}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 transform"
            title={t('startVideoCall')}
            aria-label={t('startVideoCall')}
          >
            <Video className="w-5 h-5 text-gray-600 hover:text-blue-500 transition-colors" />
          </button>
          <button 
            onClick={onToggleRightSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 transform"
            title={t('moreOptions')}
            aria-label={t('moreOptions')}
          >
            <MoreVertical className="w-5 h-5 text-gray-600 hover:text-gray-800 transition-colors" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 transition-all duration-300 ease-in-out">
        {messages.map((msg, index) => (
          <div 
            key={msg.id} 
            className={`flex animate-fade-in hover-scale ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
              {msg.sender === 'other' && (
                <div className="relative group">
                  <img 
                    src={msg.avatar} 
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0 animate-scale-in cursor-pointer transition-transform duration-200 hover:scale-110"
                  />
                  <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap animate-fade-in">
                    <button 
                      onClick={() => handleUserBlock(msg.senderId, msg.senderName)}
                      className="flex items-center space-x-1 hover:text-red-300 transition-colors"
                    >
                      <UserX className="w-3 h-3" />
                      <span>{t('block')}</span>
                    </button>
                  </div>
                </div>
              )}
              
              <div className="space-y-1">
                {msg.sender === 'other' && (
                  <p className="text-xs text-gray-500 ml-2 animate-fade-in">{msg.senderName}</p>
                )}
                <div className={`px-4 py-2 rounded-2xl transition-all duration-200 hover:scale-105 ${
                  msg.sender === 'me' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-900 shadow-sm border'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  
                  {msg.hasImage && (
                    <div className="mt-2 animate-scale-in">
                      <img 
                        src={msg.image} 
                        alt={t('sharedImage')}
                        className="max-w-full h-auto rounded-lg transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}

                  {msg.hasAudio && (
                    <div className="mt-2 animate-scale-in">
                      <audio controls className="max-w-full">
                        <source src={msg.audio} type="audio/mpeg" />
                        {t('audioNotSupported')}
                      </audio>
                    </div>
                  )}

                  {msg.hasFile && (
                    <div className="mt-2 animate-scale-in">
                      <div className="bg-gray-50 px-3 py-2 rounded-lg border hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-2">
                          <div className="text-blue-500">📎</div>
                          <div>
                            <div className="text-sm font-medium">{msg.fileName}</div>
                            <div className="text-xs text-gray-500">{msg.fileSize}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className={`text-xs text-gray-500 animate-fade-in ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>
                  {msg.time}
                </div>
              </div>

              {msg.sender === 'me' && (
                <img 
                  src={msg.avatar} 
                  alt={t('me')}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 animate-scale-in transition-transform duration-200 hover:scale-110"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Typing Indicator */}
      <TypingIndicator isTyping={isTyping} userName="Pierre, Sophie" isGroupChat={true} />

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white animate-slide-in-right transition-all duration-300 ease-in-out">
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleFileUpload}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 transform"
            title={t('uploadFile')}
            aria-label={t('uploadFile')}
          >
            <Paperclip className="w-5 h-5 text-gray-600 hover:text-blue-500 transition-colors" />
          </button>
          <div className="relative">
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 transform"
              title={t('selectEmoji')}
              aria-label={t('selectEmoji')}
            >
              <Smile className="w-5 h-5 text-gray-600 hover:text-yellow-500 transition-colors" />
            </button>
            <EmojiPicker 
              isOpen={showEmojiPicker}
              onToggle={() => setShowEmojiPicker(!showEmojiPicker)}
              onEmojiSelect={handleEmojiSelect}
            />
          </div>
          
          <div className="flex-1 relative">
            <input 
              type="text"
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 input-focus"
              aria-label={t('writeGroupMessage')}
            />
          </div>
          
            <button 
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="p-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed btn-primary"
              title={t('send')}
              aria-label={t('send')}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Block User Modal */}
      {selectedUser && (
        <BlockUserModal
          isOpen={showBlockModal}
          onClose={() => {
            setShowBlockModal(false);
            setSelectedUser(null);
          }}
          userName={selectedUser.name}
          userId={selectedUser.id}
          isBlocked={blockedUsers.includes(selectedUser.id)}
          onToggleBlock={handleToggleBlock}
        />
      )}

      {/* Group Video Call Modal */}
        <VideoCallModal
          isOpen={showVideoCall}
          onClose={() => setShowVideoCall(false)}
          userName={`${t('group')} ${currentRoom.name}`}
          userAvatar="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=40&h=40&fit=crop&crop=face"
          isAudioOnly={isAudioCall}
          onToggleVideo={() => setIsAudioCall(!isAudioCall)}
          isGroupCall={true}
        />
      
      {/* File Error Modal */}
      {showFileErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-xl border border-gray-200 animate-scale-in">
            <h3 className="text-lg font-semibold text-red-600 mb-4">{t('fileError')}</h3>
            <p className="text-sm text-gray-700 mb-6">{fileErrorMessage}</p>
            <button
              onClick={() => setShowFileErrorModal(false)}
              className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
