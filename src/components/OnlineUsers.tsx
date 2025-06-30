import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts';
import io from 'socket.io-client';

// Extend Window interface to include socket property
interface WindowWithSocket extends Window {
  socket?: ReturnType<typeof io>;
}

interface OnlineUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy';
}

interface OnlineUsersProps {
  onSelectChat?: (chatId: string) => void;
}

export function OnlineUsers({ onSelectChat }: OnlineUsersProps) {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      // Check if socket already exists to prevent multiple connections
      let socketConnection;
      if ((window as WindowWithSocket).socket) {
        socketConnection = (window as WindowWithSocket).socket;
      } else {
        socketConnection = io('https://chatapp-shi2.onrender.com', {
          transports: ['websocket'],
          path: '/socket.io',
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000
        });
        (window as WindowWithSocket).socket = socketConnection;

        socketConnection.on('connect', () => {
          console.log('OnlineUsers connected to Socket.IO server');
          socketConnection.emit('join', user._id);
        });

        socketConnection.on('disconnect', () => {
          console.log('OnlineUsers disconnected from Socket.IO server');
        });

        socketConnection.on('reconnect', () => {
          console.log('OnlineUsers reconnected to Socket.IO server');
          socketConnection.emit('join', user._id);
        });

        socketConnection.on('connect_error', (error) => {
          console.error('OnlineUsers Socket.IO connection error:', error);
        });
      }

      socketConnection.on('onlineUsers', async (users) => {
        try {
          const api = (await import('../services/api')).default;
          const updatedUsers: OnlineUser[] = [];
          for (const userId of users) {
            if (userId !== user._id) { // Exclude current user
              try {
                const response = await api.get(`/users/${userId}`);
                if (response.data.success) {
                  const userData = response.data.data;
                  updatedUsers.push({
                    id: userId,
                    name: userData.username || 'Unknown User',
                    avatar: userData.profilePicture || '/placeholder.svg',
                    status: userData.isOnline ? 'online' : 'away'
                  });
                }
              } catch (err) {
                console.error(`Error fetching data for user ${userId}:`, err);
                updatedUsers.push({
                  id: userId,
                  name: 'Unknown User',
                  avatar: '/placeholder.svg',
                  status: 'online'
                });
              }
            }
          }
          setOnlineUsers(updatedUsers);
        } catch (err) {
          console.error("Error handling online users update:", err);
        }
      });

      socketConnection.on('profileUpdate', async (data) => {
        const { userId, profilePicture, username, isOnline } = data;
        setOnlineUsers((prev) => {
          const updatedUsers = [...prev];
          const index = updatedUsers.findIndex(user => user.id === userId);
          if (index !== -1) {
            updatedUsers[index].avatar = profilePicture || '/placeholder.svg';
            updatedUsers[index].name = username || updatedUsers[index].name;
            updatedUsers[index].status = isOnline ? 'online' : 'away';
          }
          return updatedUsers;
        });
      });

      return () => {
        if (!(window as WindowWithSocket).socket) {
          socketConnection.disconnect();
        }
      };
    }
  }, [user]);

  // Initial fetch of online users
  useEffect(() => {
    const fetchOnlineUsers = async () => {
      try {
        const api = (await import('../services/api')).default;
        const response = await api.get('/users/online');
        if (response.data.success) {
          const data = response.data.data || [];
          const formattedUsers = data
            .filter(u => u._id !== user?._id) // Exclude current user
            .map(userData => ({
              id: userData._id,
              name: userData.username || 'Unknown User',
              avatar: userData.profilePicture || '/placeholder.svg',
              status: userData.isOnline ? 'online' : 'away'
            }));
          setOnlineUsers(formattedUsers);
        }
      } catch (err) {
        console.error("Error fetching online users:", err);
      }
    };

    if (user) {
      fetchOnlineUsers();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-400';
      case 'away': return 'bg-yellow-400';
      case 'busy': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const handleUserClick = (userId: string) => {
    if (onSelectChat) {
      onSelectChat(userId);
    }
  };

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {onlineUsers.map((user, index) => (
        <div 
          key={user.id} 
          className="flex-shrink-0 relative cursor-pointer animate-fade-in hover:scale-105 transition-transform duration-200"
          style={{ animationDelay: `${index * 0.1}s` }}
          onClick={() => handleUserClick(user.id)}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(user.status)} rounded-full border-2 border-white`}></div>
        </div>
      ))}
    </div>
  );
}
