import { Check, CheckCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts';
import io from 'socket.io-client';

// Extend Window interface to include socket property
interface WindowWithSocket extends Window {
  socket?: ReturnType<typeof io>;
}

interface MessagesListProps {
  selectedChat: string;
  onSelectChat: (chatId: string) => void;
  searchQuery?: string;
}

interface Message {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  online: boolean;
  messageStatus: string;
}

export function MessagesList({ selectedChat, onSelectChat, searchQuery = '' }: MessagesListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Socket.IO connection for real-time updates
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const api = (await import('../services/api')).default;
        const response = await api.get('/messages/last-messages');
        if (response.data.success) {
          // Ensure the data is in the correct format before setting it
          const data = response.data.data || [];
          const formattedMessages = data.map(msg => {
            const profilePicture = msg.user?.profilePicture || msg.avatar || '/placeholder.svg';
            console.log(`Profile picture for ${msg.user?.username || 'Unknown User'}: ${profilePicture}`);
            return {
              id: msg._id || msg.id || String(Date.now() + Math.random()),
              name: msg.user?.username || msg.name || 'Unknown User',
              avatar: profilePicture,
              lastMessage: msg.lastMessage?.content || (typeof msg.lastMessage === 'string' ? msg.lastMessage : 'No message'),
              time: msg.lastMessage?.createdAt ? new Date(msg.lastMessage.createdAt).toLocaleTimeString() : new Date(Date.now()).toLocaleTimeString(),
              unread: msg.lastMessage?.isRead === false && String(msg.lastMessage?.sender) !== String(user?._id),
              online: msg.user?.isOnline || msg.online || false,
              messageStatus: msg.lastMessage?.isRead ? 'read' : 'sent'
            };
          });
          setMessages(formattedMessages);
        } else {
          setError(response.data.message || "Error fetching messages");
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

  useEffect(() => {
    if (user) {
      let socketConnection;
      if ((window as WindowWithSocket).socket) {
        socketConnection = (window as WindowWithSocket).socket;
      } else {
        socketConnection = io('https://chatapp-shi2.onrender.com', {
          transports: ['websocket'],
          path: '/socket.io'
        });
        (window as WindowWithSocket).socket = socketConnection;

        socketConnection.on('connect', () => {
          console.log('MessagesList connected to Socket.IO server');
          socketConnection.emit('join', user._id);
        });
      }

      // Fonction optimisée pour mettre à jour les messages
      const updateMessageInList = (userId: string, updates: Partial<Message>) => {
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const index = updatedMessages.findIndex(msg => msg.id === userId);
          
          if (index !== -1) {
            updatedMessages[index] = {
              ...updatedMessages[index],
              ...updates
            };
            
            // Si c'est un nouveau message, déplacer en haut
            if (updates.lastMessage) {
              const [updatedMsg] = updatedMessages.splice(index, 1);
              updatedMessages.unshift(updatedMsg);
            }
          } else if (updates.lastMessage) {
            // Nouveau message d'un utilisateur inconnu
            updatedMessages.unshift({
              id: userId,
              name: 'Chargement...',
              avatar: '/placeholder.svg',
              lastMessage: updates.lastMessage || '',
              time: updates.time || new Date().toLocaleTimeString(),
              unread: updates.unread || false,
              online: updates.online || false,
              messageStatus: updates.messageStatus || 'sent'
            });
            
            // Charger les données utilisateur
            fetchAndUpdateUserData(userId);
          }
          
          return updatedMessages;
        });
      };

      // Fonction pour récupérer et mettre à jour les données utilisateur
      const fetchAndUpdateUserData = async (userId: string) => {
        try {
          const api = (await import('../services/api')).default;
          const response = await api.get(`/users/${userId}`);
          if (response.data.success) {
            const userData = response.data.data;
            setMessages((prev) => {
              const updatedMessages = [...prev];
              const index = updatedMessages.findIndex(msg => msg.id === userId);
              if (index !== -1) {
                updatedMessages[index] = {
                  ...updatedMessages[index],
                  name: userData.username || 'Unknown User',
                  avatar: userData.profilePicture || '/placeholder.svg',
                  online: userData.isOnline || false
                };
              }
              return updatedMessages;
            });
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      };

      // Écouter les mises à jour de la liste de messages
      socketConnection.on('messageListUpdate', (data) => {
        const { senderId, lastMessage, timestamp, isUnread } = data;
        console.log('Message list update:', data);
        
        updateMessageInList(senderId, {
          lastMessage,
          time: new Date(timestamp).toLocaleTimeString(),
          unread: isUnread && senderId !== user._id,
          messageStatus: isUnread ? 'sent' : 'read'
        });
      });

      // Écouter les mises à jour de profil utilisateur
      socketConnection.on('userProfileUpdated', (data) => {
        const { userId, profilePicture, username } = data;
        console.log('Profile updated:', data);
        
        updateMessageInList(userId, {
          avatar: profilePicture,
          name: username
        });
      });

      // Conserver les autres événements existants...
      socketConnection.on('privateMessage', async (data) => {
        const { senderId, content, timestamp } = data;
        console.log('Message reçu:', data);
        
        updateMessageInList(senderId, {
          lastMessage: content,
          time: new Date(timestamp).toLocaleTimeString(),
          unread: true,
          messageStatus: 'sent'
        });
        
        await fetchAndUpdateUserData(senderId);
      });

      return () => {
        socketConnection.off('messageListUpdate');
        socketConnection.off('userProfileUpdated');
        socketConnection.off('privateMessage');
        socketConnection.off('privateMessageSent');
        socketConnection.off('profileUpdate');
        socketConnection.off('messageRead');
        socketConnection.off('userStatusUpdate');
      };
    }
  }, [user]);

  const filteredMessages = messages.filter(message =>
    (message.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (message.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMessageIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">Chargement des messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {filteredMessages.map((message) => (
        <div 
          key={message.id}
          onClick={() => onSelectChat(message.id)}
          className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
            selectedChat === message.id ? 'bg-blue-50' : 'hover:bg-gray-50'
          }`}
        >
          <div className="relative flex-shrink-0 mr-3">
            <img 
              src={message.avatar || '/placeholder.svg'} 
              alt={message.name}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            {message.online && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900 truncate">{message.name}</h4>
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{message.time}</span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 truncate flex-1">{message.lastMessage}</p>
              <div className="flex items-center ml-2">
                {getMessageIcon(message.messageStatus)}
                {message.unread && (
                  <div className="w-2 h-2 bg-green-400 rounded-full ml-2"></div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {filteredMessages.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          {searchQuery ? (
            <p>Aucun résultat trouvé pour "{searchQuery}"</p>
          ) : (
            <p>Aucune conversation trouvée</p>
          )}
        </div>
      )}
    </div>
  );
}
