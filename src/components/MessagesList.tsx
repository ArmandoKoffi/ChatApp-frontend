import { Check, CheckCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuthContext } from "../contexts";
import io from "socket.io-client";

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

export function MessagesList({
  selectedChat,
  onSelectChat,
  searchQuery = "",
}: MessagesListProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Socket.IO connection for real-time updates
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchMessages = async () => {
      console.log('Fetching messages...');
      setLoading(true);
      setError(null);
      try {
        const api = (await import("../services/api")).default;
        const response = await api.get("/messages/last-messages");
        if (response.data.success) {
          // Ensure the data is in the correct format before setting it
          const data = response.data.data || [];
          const formattedMessages = data.map((msg) => {
            // Fonction pour valider et nettoyer l'URL de la photo de profil
            const getValidProfilePicture = (picture) => {
              if (!picture || typeof picture !== 'string') return "/placeholder.svg";
              
              // Nettoyer la chaîne de caractères étranges
              const cleanPicture = picture.trim();
              
              // Détecter les chaînes de hash malformées (comme dans l'erreur)
              if (cleanPicture.length > 50 && cleanPicture.includes(':') && !cleanPicture.startsWith('http')) {
                console.warn('Detected malformed hash-like profile picture URL, using placeholder');
                return "/placeholder.svg";
              }
              
              // Si c'est une chaîne vide
              if (!cleanPicture) {
                return "/placeholder.svg";
              }
              
              // Vérifier si c'est une URL valide
              try {
                if (cleanPicture.startsWith('http://') || cleanPicture.startsWith('https://')) {
                  new URL(cleanPicture);
                  return cleanPicture;
                }
                // Si c'est un chemin relatif valide
                if (cleanPicture.startsWith('/')) {
                  return cleanPicture;
                }
                // Si c'est un nom de fichier simple
                if (/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif|svg|webp)$/i.test(cleanPicture)) {
                  return `/uploads/${cleanPicture}`;
                }
                // Si c'est une chaîne étrange, utiliser placeholder
                console.warn('Unrecognized profile picture format, using placeholder');
                return "/placeholder.svg";
              } catch (error) {
                console.warn('Error validating profile picture URL, using placeholder');
                return "/placeholder.svg";
              }
            };
            
            const profilePicture = getValidProfilePicture(
              msg.user?.profilePicture || msg.avatar
            );
            
            return {
              id: msg._id || msg.id || String(Date.now() + Math.random()),
              name: msg.user?.username || msg.name || "Unknown User",
              avatar: profilePicture,
              lastMessage:
                msg.lastMessage?.content ||
                (typeof msg.lastMessage === "string"
                  ? msg.lastMessage
                  : "No message"),
              time: msg.lastMessage?.createdAt
                ? new Date(msg.lastMessage.createdAt).toLocaleTimeString()
                : new Date(Date.now()).toLocaleTimeString(),
              unread:
                msg.lastMessage?.isRead === false &&
                String(msg.lastMessage?.sender) !== String(user?._id),
              online: msg.user?.isOnline || msg.online || false,
              messageStatus: msg.lastMessage?.isRead ? "read" : "sent",
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

    // Appel initial
    fetchMessages();

    // Mettre en place l'intervalle de mise à jour
    const updateInterval = setInterval(fetchMessages, 500); // 500ms = 0.5 seconde

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(updateInterval);
  }, [user]);

  useEffect(() => {
    if (user) {
      let socketConnection;
      if ((window as WindowWithSocket).socket) {
        socketConnection = (window as WindowWithSocket).socket;
      } else {
        socketConnection = io("https://chatapp-shi2.onrender.com", {
          transports: ["websocket"],
          path: "/socket.io",
        });
        (window as WindowWithSocket).socket = socketConnection;

        socketConnection.on("connect", () => {
          console.log("MessagesList connected to Socket.IO server");
          socketConnection.emit("join", user._id);
        });
      }

      // Fonction optimisée pour mettre à jour les messages
      const updateMessageInList = (
        userId: string,
        updates: Partial<Message>
      ) => {
        setMessages((prev) => {
          const updatedMessages = [...prev];
          const index = updatedMessages.findIndex((msg) => msg.id === userId);

          if (index !== -1) {
            // Préserver les données existantes importantes comme avatar et name
            const existingMessage = updatedMessages[index];
            updatedMessages[index] = {
              ...existingMessage,
              ...updates,
              // S'assurer que l'avatar et le nom ne sont pas écrasés par des valeurs vides
              avatar: updates.avatar || existingMessage.avatar || "/placeholder.svg",
              name: updates.name || existingMessage.name || "Utilisateur",
            };

            // Si c'est un nouveau message, déplacer en haut
            if (updates.lastMessage) {
              const [updatedMsg] = updatedMessages.splice(index, 1);
              updatedMessages.unshift(updatedMsg);
            }
          } else if (updates.lastMessage) {
            // Ajouter un nouvel utilisateur si il n'existe pas et qu'il y a un message
            const newMessage: Message = {
              id: userId,
              name: "Utilisateur",
              avatar: "/placeholder.svg",
              lastMessage: "",
              time: "",
              unread: false,
              online: false,
              messageStatus: "sent",
              ...updates,
            };
            updatedMessages.unshift(newMessage);
            
            // Récupérer les données utilisateur en arrière-plan
            fetchAndUpdateUserData(userId);
          }

          return updatedMessages;
        });
      };

      // Fonction pour récupérer et mettre à jour les données utilisateur
      const fetchAndUpdateUserData = async (userId: string) => {
        try {
          const api = (await import("../services/api")).default;
          const response = await api.get(`/users/${userId}`);
          if (response.data.success) {
            const userData = response.data.data;
            
            // Fonction pour valider l'URL de la photo de profil
            const getValidProfilePicture = (picture) => {
              if (!picture || typeof picture !== 'string') return "/placeholder.svg";
              
              const cleanPicture = picture.trim();
              
              // Détecter les chaînes de hash malformées
              if (cleanPicture.length > 50 && cleanPicture.includes(':') && !cleanPicture.startsWith('http')) {
                return "/placeholder.svg";
              }
              
              try {
                if (cleanPicture.startsWith('http://') || cleanPicture.startsWith('https://')) {
                  new URL(cleanPicture);
                  return cleanPicture;
                }
                if (cleanPicture.startsWith('/')) {
                  return cleanPicture;
                }
                if (/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif|svg|webp)$/i.test(cleanPicture)) {
                  return `/uploads/${cleanPicture}`;
                }
                return "/placeholder.svg";
              } catch {
                return "/placeholder.svg";
              }
            };
            
            // Mettre à jour seulement les données utilisateur, pas les données de message
            setMessages((prev) => {
              const updatedMessages = [...prev];
              const index = updatedMessages.findIndex(
                (msg) => msg.id === userId
              );
              
              if (index !== -1) {
                updatedMessages[index] = {
                  ...updatedMessages[index],
                  name: userData.username || updatedMessages[index].name || "Utilisateur",
                  avatar: getValidProfilePicture(userData.profilePicture),
                  online: userData.isOnline !== undefined ? userData.isOnline : updatedMessages[index].online,
                };
              }
              
              return updatedMessages;
            });
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données utilisateur:", error);
        }
      };

      // Écouter les mises à jour de la liste de messages
      socketConnection.on("messageListUpdate", (data) => {
        const { senderId, lastMessage, timestamp, isUnread } = data;
        console.log("Message list update:", data);

        updateMessageInList(senderId, {
          lastMessage,
          time: new Date(timestamp).toLocaleTimeString(),
          unread: isUnread && senderId !== user._id,
          messageStatus: isUnread ? "sent" : "read",
        });
      });

      // Écouter les mises à jour de profil utilisateur
      socketConnection.on("userProfileUpdated", (data) => {
        const { userId, profilePicture, username } = data;
        console.log("Profile updated:", data);

        // Valider l'URL de la photo de profil
        const getValidProfilePicture = (picture) => {
          if (!picture || typeof picture !== 'string') return "/placeholder.svg";
          
          const cleanPicture = picture.trim();
          
          // Détecter les chaînes de hash malformées
          if (cleanPicture.length > 50 && cleanPicture.includes(':') && !cleanPicture.startsWith('http')) {
            return "/placeholder.svg";
          }
          
          try {
            if (cleanPicture.startsWith('http://') || cleanPicture.startsWith('https://')) {
              new URL(cleanPicture);
              return cleanPicture;
            }
            if (cleanPicture.startsWith('/')) {
              return cleanPicture;
            }
            if (/^[a-zA-Z0-9._-]+\.(jpg|jpeg|png|gif|svg|webp)$/i.test(cleanPicture)) {
              return `/uploads/${cleanPicture}`;
            }
            return "/placeholder.svg";
          } catch {
            return "/placeholder.svg";
          }
        };

        updateMessageInList(userId, {
          avatar: getValidProfilePicture(profilePicture),
          name: username,
        });
      });

      // Écouter les messages marqués comme lus
      socketConnection.on("messageRead", (data) => {
        const { conversationId, userId } = data;
        console.log("Message marked as read:", data);
        
        updateMessageInList(conversationId || userId, {
          unread: false,
          messageStatus: "read",
        });
      });

      // Écouter les mises à jour de statut utilisateur (en ligne/hors ligne)
      socketConnection.on("userStatusUpdate", (data) => {
        const { userId, isOnline } = data;
        console.log("User status updated:", data);
        
        updateMessageInList(userId, {
          online: isOnline,
        });
      });

      // Écouter les nouveaux messages privés
      socketConnection.on("privateMessage", async (data) => {
        const { senderId, content, timestamp } = data;
        console.log("Message reçu:", data);

        updateMessageInList(senderId, {
          lastMessage: content,
          time: new Date(timestamp).toLocaleTimeString(),
          unread: true,
          messageStatus: "sent",
        });

        await fetchAndUpdateUserData(senderId);
      });

      // Écouter les messages envoyés (pour mettre à jour la liste)
      socketConnection.on("privateMessageSent", async (data) => {
        const { receiverId, content, timestamp } = data;
        console.log("Message envoyé:", data);

        updateMessageInList(receiverId, {
          lastMessage: content,
          time: new Date(timestamp).toLocaleTimeString(),
          unread: false,
          messageStatus: "sent",
        });

        await fetchAndUpdateUserData(receiverId);
      });

      // Écouter les mises à jour de connexion/déconnexion
      socketConnection.on("userOnline", (data) => {
        const { userId } = data;
        console.log("User came online:", userId);
        
        updateMessageInList(userId, {
          online: true,
        });
      });

      socketConnection.on("userOffline", (data) => {
        const { userId } = data;
        console.log("User went offline:", userId);
        
        updateMessageInList(userId, {
          online: false,
        });
      });

      return () => {
        if (socketConnection) {
          socketConnection.off("messageListUpdate");
          socketConnection.off("userProfileUpdated");
          socketConnection.off("privateMessage");
          socketConnection.off("privateMessageSent");
          socketConnection.off("messageRead");
          socketConnection.off("userStatusUpdate");
          socketConnection.off("userOnline");
          socketConnection.off("userOffline");
        }
      };
    }
  }, [user]);

  const filteredMessages = messages.filter(
    (message) =>
      (message.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (message.lastMessage || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  const getMessageIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-4 h-4 text-gray-400" />;
      case "read":
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
          onClick={async () => {
            // Marquer le message comme lu si il était non lu
            if (message.unread) {
              try {
                const api = (await import("../services/api")).default;
                await api.post(`/messages/mark-read`, {
                  conversationId: message.id,
                  userId: message.id
                });
                
                // Mettre à jour localement
                setMessages((prev) => {
                  const updatedMessages = [...prev];
                  const index = updatedMessages.findIndex((msg) => msg.id === message.id);
                  if (index !== -1) {
                    updatedMessages[index] = {
                      ...updatedMessages[index],
                      unread: false,
                      messageStatus: "read",
                    };
                  }
                  return updatedMessages;
                });
                
                // Émettre l'événement Socket.IO pour notifier les autres clients
                const socketConnection = (window as WindowWithSocket).socket;
                if (socketConnection) {
                  socketConnection.emit("markMessageAsRead", {
                    conversationId: message.id,
                    userId: message.id
                  });
                }
              } catch (error) {
                console.error("Error marking message as read:", error);
              }
            }
            
            onSelectChat(message.id);
          }}
          className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
            selectedChat === message.id ? "bg-blue-50" : "hover:bg-gray-50"
          }`}
        >
          <div className="relative flex-shrink-0 mr-3">
            <img
              src={message.avatar || "/placeholder.svg"}
              alt={message.name}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.svg";
              }}
            />
            {message.online && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900 truncate">
                {message.name}
              </h4>
              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                {message.time}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className={`text-sm truncate flex-1 ${
                message.unread 
                  ? "text-gray-900 font-bold" 
                  : "text-gray-600"
              }`}>
                {message.lastMessage}
              </p>
              <div className="flex items-center ml-2">
                {getMessageIcon(message.messageStatus)}
                {message.unread && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
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
