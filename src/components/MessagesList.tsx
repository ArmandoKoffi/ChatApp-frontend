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
      // Check if socket already exists to prevent multiple connections
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

        socketConnection.on('disconnect', () => {
          console.log('MessagesList disconnected from Socket.IO server');
        });

        socketConnection.on('reconnect', () => {
          console.log('MessagesList reconnected to Socket.IO server');
          socketConnection.emit('join', user._id);
        });

        socketConnection.on('connect_error', (error) => {
          console.error('MessagesList Socket.IO connection error:', error);
        });
      }

      // Fonction utilitaire pour mettre à jour ou ajouter un message
      const updateOrAddMessage = (senderId: string, content: string, timestamp: string, isUnread: boolean = true, status: string = 'sent') => {
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const index = updatedMessages.findIndex(msg => msg.id === senderId);
          
          if (index !== -1) {
            // Mettre à jour le message existant
            updatedMessages[index] = {
              ...updatedMessages[index],
              lastMessage: content,
              time: new Date(timestamp).toLocaleTimeString(),
              unread: isUnread,
              messageStatus: status
            };
            // Déplacer en haut de la liste
            const [updatedMsg] = updatedMessages.splice(index, 1);
            updatedMessages.unshift(updatedMsg);
          } else {
            // Ajouter un nouveau message avec des données de base
            updatedMessages.unshift({
              id: senderId,
              name: 'Chargement...',
              avatar: '/placeholder.svg',
              lastMessage: content,
              time: new Date(timestamp).toLocaleTimeString(),
              unread: isUnread,
              online: false,
              messageStatus: status
            });
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

      // Écouter les messages privés reçus
      socketConnection.on('privateMessage', async (data) => {
        const { senderId, content, messageId, timestamp } = data;
        console.log('Message reçu:', data);
        
        // Mettre à jour immédiatement avec le contenu
        updateOrAddMessage(senderId, content, timestamp, true, 'sent');
        
        // Récupérer les données utilisateur pour mettre à jour l'avatar et le nom
        await fetchAndUpdateUserData(senderId);
      });

      // Écouter les messages privés envoyés
      socketConnection.on('privateMessageSent', async (data) => {
        const { receiverId, content, messageId, timestamp } = data;
        console.log('Message envoyé:', data);
        
        // Mettre à jour le message envoyé
        updateOrAddMessage(receiverId, content, timestamp, false, 'sent');
        
        // Récupérer les données utilisateur pour s'assurer que l'avatar est à jour
        await fetchAndUpdateUserData(receiverId);
      });

      // Écouter les mises à jour de profil en temps réel
      socketConnection.on('profileUpdate', (data) => {
        const { userId, profilePicture, username, isOnline } = data;
        console.log('Mise à jour de profil reçue:', data);
        
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const index = updatedMessages.findIndex(msg => msg.id === userId);
          if (index !== -1) {
            updatedMessages[index] = {
              ...updatedMessages[index],
              avatar: profilePicture || updatedMessages[index].avatar,
              name: username || updatedMessages[index].name,
              online: isOnline !== undefined ? isOnline : updatedMessages[index].online
            };
          }
          return updatedMessages;
        });
      });

      // Écouter les mises à jour du statut de lecture
      socketConnection.on('messageRead', (data) => {
        const { messageId, userId } = data;
        console.log('Message lu:', data);
        
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const index = updatedMessages.findIndex(msg => msg.id === userId);
          if (index !== -1) {
            updatedMessages[index] = {
              ...updatedMessages[index],
              messageStatus: 'read'
            };
          }
          return updatedMessages;
        });
      });

      // Écouter les mises à jour du statut en ligne
      socketConnection.on('userStatusUpdate', (data) => {
        const { userId, isOnline } = data;
        console.log('Statut utilisateur mis à jour:', data);
        
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const index = updatedMessages.findIndex(msg => msg.id === userId);
          if (index !== -1) {
            updatedMessages[index] = {
              ...updatedMessages[index],
              online: isOnline
            };
          }
          return updatedMessages;
        });
      });

      return () => {
        // Ne pas déconnecter le socket ici car il peut être utilisé ailleurs
        // Juste retirer les listeners spécifiques à ce composant
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
