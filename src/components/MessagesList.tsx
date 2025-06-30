
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

      socketConnection.on('privateMessage', async (data) => {
        const { senderId, content, messageId, timestamp } = data;
        // Update the message list with the new message
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const index = updatedMessages.findIndex(msg => msg.id === senderId);
          if (index !== -1) {
            updatedMessages[index].lastMessage = content;
            updatedMessages[index].time = new Date(timestamp).toLocaleTimeString();
            updatedMessages[index].unread = true;
            // Move to top of list
            const [updatedMsg] = updatedMessages.splice(index, 1);
            updatedMessages.unshift(updatedMsg);
          } else {
            // If sender not in list, add with placeholder data
            updatedMessages.unshift({
              id: senderId,
              name: 'Unknown User',
              avatar: '',
              lastMessage: content,
              time: new Date(timestamp).toLocaleTimeString(),
              unread: true,
              online: false,
              messageStatus: 'sent'
            });
          }
          return updatedMessages;
        });
        // Fetch updated user data for avatar
        try {
          const api = (await import('../services/api')).default;
          const response = await api.get(`/users/${senderId}`);
          if (response.data.success) {
            const userData = response.data.data;
            setMessages((prev) => {
              const updatedMessages = [...prev];
              const index = updatedMessages.findIndex(msg => msg.id === senderId);
              if (index !== -1) {
                updatedMessages[index].name = userData.username || 'Unknown User';
                updatedMessages[index].avatar = userData.profilePicture || '/placeholder.svg';
                updatedMessages[index].online = userData.isOnline || false;
              }
              return updatedMessages;
            });
          }
        } catch (err) {
          console.error("Error fetching user data for message update:", err);
        }
      });

      socketConnection.on('privateMessageSent', async (data) => {
        const { receiverId, content, messageId, timestamp } = data;
        // Update the message list with the sent message
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const index = updatedMessages.findIndex(msg => msg.id === receiverId);
          if (index !== -1) {
            updatedMessages[index].lastMessage = content;
            updatedMessages[index].time = new Date(timestamp).toLocaleTimeString();
            updatedMessages[index].unread = false;
            updatedMessages[index].messageStatus = 'sent';
            // Move to top of list
            const [updatedMsg] = updatedMessages.splice(index, 1);
            updatedMessages.unshift(updatedMsg);
          }
          return updatedMessages;
        });
      });

      socketConnection.on('profileUpdate', async (data) => {
        const { userId, profilePicture, username, isOnline } = data;
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const index = updatedMessages.findIndex(msg => msg.id === userId);
          if (index !== -1) {
            updatedMessages[index].avatar = profilePicture || '/placeholder.svg';
            updatedMessages[index].name = username || updatedMessages[index].name;
            updatedMessages[index].online = isOnline !== undefined ? isOnline : updatedMessages[index].online;
          }
          return updatedMessages;
        });
      });

      return () => {
        if (!(window as WindowWithSocket).socket) {
          socketConnection.disconnect();
        }
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
      
      {filteredMessages.length === 0 && searchQuery && (
        <div className="text-center py-8 text-gray-500">
          <p>Aucun résultat trouvé pour "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
