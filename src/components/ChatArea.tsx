import { useState, useEffect } from "react";
import {
  Phone,
  Video,
  MoreHorizontal,
  Paperclip,
  Smile,
  Send,
  Menu,
  UserX,
  Mic,
} from "lucide-react";
import { useAuthContext } from "../contexts";
import { TypingIndicator } from "./TypingIndicator";
import { BlockUserModal } from "./BlockUserModal";
import { EmojiPicker } from "./EmojiPicker";
import { VoiceMessageModal } from "./VoiceMessageModal";
import { VideoCallModal } from "./VideoCallModal";
import { useLanguage } from "./LanguageContext";
import io from "socket.io-client";

// Extend Window interface to include socket property
interface WindowWithSocket extends Window {
  socket?: ReturnType<typeof io>;
}

interface ChatAreaProps {
  selectedChat: string;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onToggleRightSidebar?: () => void;
}

interface BackendMessage {
  _id: string;
  sender: {
    _id: string;
  };
  content: string;
  createdAt: string;
  media?: {
    type: string;
    url: string;
    name: string;
    size: string;
    publicId: string;
  };
}

interface SocketMessage {
  senderId: string;
  content: string;
  messageId: string;
  timestamp: string;
  media?: {
    type: string;
    url: string;
  };
}

interface SocketMessageSent {
  receiverId: string;
  content: string;
  messageId: string;
  timestamp: string;
  media?: {
    type: string;
    url: string;
  };
}

interface TypingData {
  senderId: string;
  isTyping: boolean;
}

interface ProfileUpdateData {
  userId: string;
  profilePicture: string;
  username: string;
}

interface UserBlockedData {
  blockedBy: string;
}

interface UserUnblockedData {
  unblockedBy: string;
}

interface MessageBlockedData {
  receiverId: string;
  reason: string;
}

export function ChatArea({
  selectedChat,
  sidebarOpen,
  onToggleSidebar,
  onToggleRightSidebar,
}: ChatAreaProps) {
  const { t, language } = useLanguage();
  const { user } = useAuthContext();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [isAudioCall, setIsAudioCall] = useState(false);
  const [showFileErrorModal, setShowFileErrorModal] = useState(false);
  const [fileErrorMessage, setFileErrorMessage] = useState("");
  const [showBlockedMessage, setShowBlockedMessage] = useState(false);
  const [blockedMessageText, setBlockedMessageText] = useState("");
  const [messages, setMessages] = useState<{
    [key: string]: {
      id: string;
      messageId: string;
      sender: "me" | "other";
      content: string;
      time: string;
      date: string | null;
      hasImage?: boolean;
      hasAudio?: boolean;
      hasFile?: boolean;
      image?: string;
      audio?: string;
      fileName?: string;
      fileSize?: string;
      isPlayed?: boolean;
      isExpired?: boolean;
      timestamp?: number;
      isFavorite?: boolean;
    }[];
  }>({});
  // Workaround for TypeScript error with Socket type from socket.io-client
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const [currentChat, setCurrentChat] = useState<{
    id: string;
    name: string;
    avatar: string;
    status: string;
    online: boolean;
    isBlocked: boolean;
    isBlockedByOther: boolean;
  }>({
    id: "",
    name: "",
    avatar: "",
    status: "",
    online: false,
    isBlocked: false,
    isBlockedByOther: false,
  });
  const [chatLoading, setChatLoading] = useState(true);
  const [chatError, setChatError] = useState<string | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  // Gestion du pop-up d'options de message
  const [selectedMessageOptions, setSelectedMessageOptions] = useState<
    string | null
  >(null);

  const handleDeleteMessageOption = async () => {
    if (!selectedMessageOptions) return;
    await handleDeleteMessage(selectedMessageOptions);
    setSelectedMessageOptions(null);
  };

  const handleToggleFavoriteOption = async () => {
    if (!selectedMessageOptions) return;
    await handleToggleFavorite(selectedMessageOptions);
    setSelectedMessageOptions(null);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const response = await fetch(
        `https://chatapp-shi2.onrender.com/api/messages/${messageId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete message");
      }

      // Mettre à jour l'état local des messages
      setMessages((prevMessages) => {
        const updatedMessages = { ...prevMessages };
        if (selectedChat in updatedMessages) {
          updatedMessages[selectedChat] = updatedMessages[selectedChat].filter(
            (message) => message.messageId !== messageId
          );
        }
        return updatedMessages;
      });

      // Synchronisation sidebar : émission de l'événement pour la suppression
      if (socket && user) {
        socket.emit("messageListUpdate", {
          senderId: user._id,
          lastMessage: "", // On peut aussi envoyer le nouveau dernier message si besoin
          timestamp: new Date().toISOString(),
          isUnread: false,
          deletedMessageId: messageId,
        });
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleToggleFavorite = async (messageId: string) => {
    try {
      const response = await fetch(
        `https://chatapp-shi2.onrender.com/api/messages/${messageId}/favorite`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to toggle favorite status");
      }

      const data = await response.json();

      // Mettre à jour l'état local des messages
      setMessages((prevMessages) => {
        const updatedMessages = { ...prevMessages };
        if (selectedChat in updatedMessages) {
          updatedMessages[selectedChat] = updatedMessages[selectedChat].map(
            (message) => {
              if (message.messageId === messageId) {
                return { ...message, isFavorite: data.data.isFavorite };
              }
              return message;
            }
          );
        }
        return updatedMessages;
      });

      // Synchronisation sidebar : émission de l'événement pour le favori
      if (socket && user) {
        socket.emit("messageListUpdate", {
          senderId: user._id,
          lastMessage: "", // On peut aussi envoyer le nouveau dernier message si besoin
          timestamp: new Date().toISOString(),
          isUnread: false,
          favoriteMessageId: messageId,
          isFavorite: data.data.isFavorite,
        });
      }
    } catch (error) {
      console.error("Error toggling favorite status:", error);
    }
  };

  useEffect(() => {
    const fetchChatData = async () => {
      if (!selectedChat) return;

      if (selectedChat) {
        setChatLoading(true);
        setChatError(null);
        setMessagesLoading(true);
        setMessagesError(null);
        try {
          // Fetch user info (as chat data)
          const userResponse = await fetch(
            `https://chatapp-shi2.onrender.com/api/users/${selectedChat}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
              },
            }
          );
          if (!userResponse.ok) {
            console.error(
              "Failed to fetch user data, status:",
              userResponse.status
            );
            // Read response body only once
            const responseText = await userResponse.text();
            console.error(
              "Response content:",
              responseText.substring(0, 200) +
                (responseText.length > 200 ? "..." : "")
            );
            throw new Error("Failed to fetch user data");
          }
          // Check content type before parsing JSON
          const contentType = userResponse.headers.get("content-type") || "";
          if (!contentType.includes("application/json")) {
            console.error("Unexpected content type:", contentType);
            const responseText = await userResponse.text();
            console.error(
              "Response content:",
              responseText.substring(0, 200) +
                (responseText.length > 200 ? "..." : "")
            );
            setChatError(
              "Unexpected response format from server. Please try again later."
            );
          } else {
            let userData;
            try {
              userData = await userResponse.json();
              if (userData.success) {
                setCurrentChat({
                  id: userData.data._id,
                  name: userData.data.username,
                  avatar: userData.data.profilePicture || "",
                  status: userData.data.isOnline ? t("online") : t("offline"),
                  online: userData.data.isOnline || false,
                  isBlocked: userData.data.isBlocked || false,
                  isBlockedByOther: userData.data.hasBlocked || false,
                });
              } else {
                setChatError(userData.message || "Error fetching user data");
              }
            } catch (jsonErr) {
              console.error("Error parsing user data JSON:", jsonErr);
              setChatError(
                "Failed to parse user data. Please try again later."
              );
            }
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setChatError("Failed to load user data. Please try again later.");
        } finally {
          setChatLoading(false);
        }

        try {
          // Fetch messages
          const messagesResponse = await fetch(
            `https://chatapp-shi2.onrender.com/api/messages/private/${selectedChat}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
              },
            }
          );
          if (!messagesResponse.ok) {
            console.error(
              "Failed to fetch messages, status:",
              messagesResponse.status
            );
            // Read response body only once
            const responseText = await messagesResponse.text();
            console.error(
              "Response content:",
              responseText.substring(0, 200) +
                (responseText.length > 200 ? "..." : "")
            );
            throw new Error("Failed to fetch messages");
          }
          // Check content type before parsing JSON
          const contentType =
            messagesResponse.headers.get("content-type") || "";
          if (!contentType.includes("application/json")) {
            console.error("Unexpected content type:", contentType);
            const responseText = await messagesResponse.text();
            console.error(
              "Response content:",
              responseText.substring(0, 200) +
                (responseText.length > 200 ? "..." : "")
            );
            setMessagesError(
              "Unexpected response format from server. Please try again later."
            );
          } else {
            let messagesData;
            try {
              messagesData = await messagesResponse.json();
              if (messagesData.success) {
                const formattedMessages = messagesData.data.map(
                  (msg: BackendMessage) => ({
                    id: String(msg._id || Date.now()),
                    messageId: msg._id ? String(msg._id) : String(Date.now()),
                    sender:
                      String(msg.sender._id) === String(user?._id)
                        ? "me"
                        : "other",
                    content: msg.content || "",
                    time: new Date(msg.createdAt).toLocaleTimeString(language, {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                    date: new Date(msg.createdAt).toLocaleDateString(language),
                    hasImage: msg.media && msg.media.type === "image",
                    hasAudio: msg.media && msg.media.type === "audio",
                    hasFile: msg.media && msg.media.type,
                    image:
                      msg.media && msg.media.type === "image"
                        ? msg.media.url
                        : undefined,
                    audio:
                      msg.media && msg.media.type === "audio"
                        ? msg.media.url
                        : undefined,
                    fileName: msg.media ? msg.media.name : undefined,
                    fileSize: msg.media ? msg.media.size : undefined,
                    mediaUrl: msg.media ? msg.media.url : undefined,
                    mediaType: msg.media ? msg.media.type : undefined,
                    mediaName: msg.media ? msg.media.name : undefined,
                    mediaSize: msg.media ? msg.media.size : undefined,
                    mediaPublicId: msg.media ? msg.media.publicId : undefined,
                  })
                );
                setMessages((prev) => ({
                  ...prev,
                  [selectedChat]: formattedMessages || [],
                }));
              } else {
                setMessagesError(
                  messagesData.message || "Error fetching messages"
                );
              }
            } catch (jsonErr) {
              console.error("Error parsing messages JSON:", jsonErr);
              setMessagesError(
                "Failed to parse messages. Please try again later."
              );
            }
          }
        } catch (err) {
          console.error("Error fetching messages:", err);
          setMessagesError("Failed to load messages. Please try again later.");
        } finally {
          setMessagesLoading(false);
        }
      }
    };

    fetchChatData();

    // Démarrer l'actualisation automatique
    const intervalId = setInterval(fetchChatData, 500);

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(intervalId);
  }, [selectedChat, t, user, language]);

  // Socket.IO connection setup
  useEffect(() => {
    if (user) {
      // Check if socket already exists to prevent multiple connections
      let socketConnection;
      if ((window as WindowWithSocket).socket) {
        socketConnection = (window as WindowWithSocket).socket;
        setSocket(socketConnection);
      } else {
        socketConnection = io("https://chatapp-shi2.onrender.com", {
          transports: ["websocket"],
          path: "/socket.io",
          reconnection: true,
          reconnectionAttempts: Infinity,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });
        setSocket(socketConnection);
        (window as WindowWithSocket).socket = socketConnection;

        socketConnection.on("connect", () => {
          console.log("Connected to Socket.IO server");
          if (user?._id) {
            socketConnection.emit("join", user._id);
          }
        });

        socketConnection.on("disconnect", () => {
          console.log("Disconnected from Socket.IO server");
        });

        socketConnection.on("reconnect", () => {
          console.log("Reconnected to Socket.IO server");
          if (user?._id) {
            socketConnection.emit("join", user._id);
          }
        });

        socketConnection.on("connect_error", (error) => {
          console.error("Socket.IO connection error:", error);
        });
      }

      // Ensure event listeners are registered for the current selected chat
      const handlePrivateMessage = (data: SocketMessage) => {
        const { senderId, content, messageId, timestamp, media } = data;
        console.log("Received private message via Socket.IO", {
          senderId,
          content,
          messageId,
          timestamp,
          media,
        });
        if (senderId === selectedChat) {
          const time = new Date(timestamp).toLocaleTimeString(language, {
            hour: "2-digit",
            minute: "2-digit",
          });
          setMessages((prev) => {
            const existingMessages = prev[selectedChat] || [];
            // Check if message already exists to avoid duplicates
            if (existingMessages.some((msg) => msg.messageId === messageId)) {
              return prev;
            }
            return {
              ...prev,
              [selectedChat]: [
                ...existingMessages,
                {
                  id: String(messageId || Date.now()), // Use server ID if available
                  messageId: messageId ? String(messageId) : String(Date.now()),
                  sender: "other" as const,
                  content: content || "",
                  time,
                  date: new Date(timestamp).toLocaleDateString(language), // always a string
                  hasImage: media && media.type === "image",
                  hasAudio: media && media.type === "audio",
                  hasFile:
                    media &&
                    media.type &&
                    media.type !== "image" &&
                    media.type !== "audio",
                  image:
                    media && media.type === "image"
                      ? media.url.startsWith("http")
                        ? media.url
                        : `https://chatapp-shi2.onrender.com${media.url}`
                      : undefined,
                  audio:
                    media && media.type === "audio"
                      ? media.url.startsWith("http")
                        ? media.url
                        : `https://chatapp-shi2.onrender.com${media.url}`
                      : undefined,
                  fileName:
                    media && media.type !== "image" && media.type !== "audio"
                      ? "File"
                      : undefined,
                  fileSize:
                    media && media.type !== "image" && media.type !== "audio"
                      ? "Unknown size"
                      : undefined,
                },
              ],
            };
          });
        }
      };

      const handleTyping = (data: TypingData) => {
        const { senderId, isTyping } = data;
        if (senderId === selectedChat) {
          console.log(
            `Typing event received: ${senderId} is ${
              isTyping ? "typing" : "not typing"
            }`
          );
          setIsTyping(isTyping);
        }
      };

      const handleOnlineUsers = (users: string[]) => {
        setOnlineUsers(users);
        if (currentChat.id && users.includes(currentChat.id)) {
          setCurrentChat((prev) => ({
            ...prev,
            online: true,
            status: t("online"),
          }));
        }
      };

      const handleProfileUpdate = (data: ProfileUpdateData) => {
        const { userId, profilePicture, username } = data;
        if (currentChat.id === userId) {
          setCurrentChat((prev) => ({
            ...prev,
            avatar: profilePicture || prev.avatar,
            name: username || prev.name,
          }));
        }
      };

      const handleUserBlocked = (data: UserBlockedData) => {
        const { blockedBy } = data;
        if (blockedBy === selectedChat) {
          setCurrentChat((prev) => ({
            ...prev,
            isBlockedByOther: true,
          }));
          setBlockedMessageText(t("youHaveBeenBlocked"));
          setShowBlockedMessage(true);
        }
      };

      const handleUserUnblocked = (data: UserUnblockedData) => {
        const { unblockedBy } = data;
        if (unblockedBy === selectedChat) {
          setCurrentChat((prev) => ({
            ...prev,
            isBlockedByOther: false,
          }));
          setShowBlockedMessage(false);
        }
      };

      const handleMessageBlocked = (data: MessageBlockedData) => {
        const { receiverId, reason } = data;
        if (receiverId === selectedChat) {
          if (reason === "blocked") {
            setBlockedMessageText(t("youHaveBeenBlocked"));
            setCurrentChat((prev) => ({
              ...prev,
              isBlockedByOther: true,
            }));
          } else if (reason === "you_blocked_user") {
            setBlockedMessageText(t("youBlockedThisUser"));
            setCurrentChat((prev) => ({
              ...prev,
              isBlocked: true,
            }));
          }
          setShowBlockedMessage(true);
        }
      };

      const handlePrivateMessageSent = (data: SocketMessageSent) => {
        const { receiverId, content, messageId, timestamp, media } = data;
        console.log("Received confirmation of sent message via Socket.IO", {
          receiverId,
          content,
          messageId,
        });
        if (receiverId === selectedChat) {
          const time = new Date(timestamp).toLocaleTimeString(language, {
            hour: "2-digit",
            minute: "2-digit",
          });
          setMessages((prev) => {
            const existingMessages = prev[selectedChat] || [];
            // Check if message already exists to avoid duplicates
            if (existingMessages.some((msg) => msg.messageId === messageId)) {
              return prev;
            }
            return {
              ...prev,
              [selectedChat]: [
                ...existingMessages,
                {
                  id: String(messageId || Date.now()), // Use server ID if available
                  messageId: messageId ? String(messageId) : String(Date.now()),
                  sender: "me" as const,
                  content: content || "",
                  time,
                  date: null as string | null,
                  hasImage: media && media.type === "image",
                  hasAudio: media && media.type === "audio",
                  hasFile:
                    media &&
                    media.type &&
                    media.type !== "image" &&
                    media.type !== "audio",
                  image:
                    media && media.type === "image"
                      ? media.url.startsWith("http")
                        ? media.url
                        : `https://chatapp-shi2.onrender.com${media.url}`
                      : undefined,
                  audio:
                    media && media.type === "audio"
                      ? media.url.startsWith("http")
                        ? media.url
                        : `https://chatapp-shi2.onrender.com${media.url}`
                      : undefined,
                  fileName:
                    media && media.type !== "image" && media.type !== "audio"
                      ? "File"
                      : undefined,
                  fileSize:
                    media && media.type !== "image" && media.type !== "audio"
                      ? "Unknown size"
                      : undefined,
                },
              ],
            };
          });
        }
      };

      socketConnection.on("onlineUsers", handleOnlineUsers);
      socketConnection.on("privateMessage", handlePrivateMessage);
      socketConnection.on("privateMessageSent", handlePrivateMessageSent);
      socketConnection.on("typing", handleTyping);
      socketConnection.on("userProfileUpdated", handleProfileUpdate);
      socketConnection.on("userBlocked", handleUserBlocked);
      socketConnection.on("userUnblocked", handleUserUnblocked);
      socketConnection.on("messageBlocked", handleMessageBlocked);
      socketConnection.on("messageDeleted", ({ messageId }) => {
        setMessages((prev) => {
          const updatedMessages = { ...prev };
          if (selectedChat in updatedMessages) {
            updatedMessages[selectedChat] = updatedMessages[
              selectedChat
            ].filter((message) => message.messageId !== messageId);
          }
          return updatedMessages;
        });
      });
      socketConnection.on(
        "messageFavoriteUpdated",
        ({ messageId, isFavorite }) => {
          setMessages((prev) => {
            const updatedMessages = { ...prev };
            if (selectedChat in updatedMessages) {
              updatedMessages[selectedChat] = updatedMessages[selectedChat].map(
                (message) => {
                  if (message.messageId === messageId) {
                    return { ...message, isFavorite };
                  }
                  return message;
                }
              );
            }
            return updatedMessages;
          });
        }
      );

      return () => {
        socketConnection.off("onlineUsers", handleOnlineUsers);
        socketConnection.off("privateMessage", handlePrivateMessage);
        socketConnection.off("privateMessageSent", handlePrivateMessageSent);
        socketConnection.off("typing", handleTyping);
        socketConnection.off("userProfileUpdated", handleProfileUpdate);
        socketConnection.off("userBlocked", handleUserBlocked);
        socketConnection.off("userUnblocked", handleUserUnblocked);
        socketConnection.off("messageDeleted");
        socketConnection.off("messageFavoriteUpdated");
        socketConnection.off("messageBlocked", handleMessageBlocked);
        if (!(window as WindowWithSocket).socket) {
          socketConnection.disconnect();
          setSocket(null);
        }
      };
    }
  }, [user, selectedChat, language, t, currentChat.id]);

  // Emit typing event when user types - handled in handleInputChange for real-time updates

  // Auto-scroll to bottom on new messages or typing indicator
  useEffect(() => {
    const chatContainer = document.querySelector(".overflow-y-auto");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [messages, isTyping]);

  // Ensure scroll to bottom on component mount and when chat changes
  useEffect(() => {
    const chatContainer = document.querySelector(".overflow-y-auto");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [selectedChat]);

  // Fallback polling for new messages if Socket.IO fails
  useEffect(() => {
    if (selectedChat) {
      const interval = setInterval(async () => {
        try {
          const response = await fetch(
            `https://chatapp-shi2.onrender.com/api/messages/private/${selectedChat}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
              },
            }
          );
          if (response.ok) {
            const messagesData = await response.json();
            if (messagesData.success) {
              const formattedMessages = messagesData.data.map(
                (msg: BackendMessage) => ({
                  id: String(msg._id || Date.now()),
                  messageId: msg._id ? String(msg._id) : String(Date.now()),
                  sender:
                    String(msg.sender._id) === String(user?._id)
                      ? "me"
                      : "other",
                  content: msg.content || "",
                  time: new Date(msg.createdAt).toLocaleTimeString(language, {
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                  date: new Date(msg.createdAt).toLocaleDateString(language),
                  hasImage: msg.media && msg.media.type === "image",
                  hasAudio: msg.media && msg.media.type === "audio",
                  hasFile:
                    msg.media &&
                    msg.media.type &&
                    msg.media.type !== "image" &&
                    msg.media.type !== "audio",
                  image:
                    msg.media && msg.media.type === "image"
                      ? `/uploads/messages/${msg.media.url}`
                      : undefined,
                  audio:
                    msg.media && msg.media.type === "audio"
                      ? `/uploads/messages/${msg.media.url}`
                      : undefined,
                  fileName:
                    msg.media &&
                    msg.media.type !== "image" &&
                    msg.media.type !== "audio"
                      ? "File"
                      : undefined,
                  fileSize:
                    msg.media &&
                    msg.media.type !== "image" &&
                    msg.media.type !== "audio"
                      ? "Unknown size"
                      : undefined,
                })
              );
              setMessages((prev) => ({
                ...prev,
                [selectedChat]: formattedMessages || [],
              }));
            }
          }
        } catch (err) {
          console.error("Error polling for new messages:", err);
        }
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  }, [selectedChat, user, language]);

  const isBlocked = currentChat.isBlocked;
  const isBlockedByOther = currentChat.isBlockedByOther;

  const handleToggleBlock = async (userId: string, block: boolean) => {
    try {
      const response = await fetch(`/api/block/${userId}`, {
        method: block ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(
          block ? "Failed to block user" : "Failed to unblock user"
        );
      }

      const data = await response.json();
      if (data.success) {
        setCurrentChat((prev) => ({
          ...prev,
          isBlocked: block,
        }));
        setBlockedUsers((prev) =>
          block ? [...prev, userId] : prev.filter((id) => id !== userId)
        );
      } else {
        console.error(
          data.message ||
            (block ? "Error blocking user" : "Error unblocking user")
        );
      }
    } catch (err) {
      console.error("Error toggling block status:", err);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() && !isBlocked && !isBlockedByOther) {
      try {
        const response = await fetch(
          `https://chatapp-shi2.onrender.com/api/messages/private/${selectedChat}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
            body: JSON.stringify({
              content: message,
              sender: "me",
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const data = await response.json();
        if (data.success) {
          const newMessage = {
            id: String(data.data._id || Date.now()), // Use server ID if available
            messageId: data.data._id || String(Date.now()),
            sender: "me" as const,
            content: message,
            time: new Date().toLocaleTimeString(language, {
              hour: "2-digit",
              minute: "2-digit",
            }),
            date: null as string | null,
          };
          setMessages((prev) => {
            const existingMessages = prev[selectedChat] || [];
            // Check if message already exists to avoid duplicates
            if (
              existingMessages.some((msg) => msg.messageId === newMessage.id)
            ) {
              return prev;
            }
            return {
              ...prev,
              [selectedChat]: [...existingMessages, newMessage],
            };
          });
          setMessage("");
          setShowEmojiPicker(false);
          // Emit real-time message via Socket.IO
          if (socket && user) {
            console.log("Sending private message via Socket.IO", {
              senderId: user._id,
              receiverId: selectedChat,
              content: message,
            });
            socket.emit("privateMessage", {
              senderId: user._id,
              receiverId: selectedChat,
              content: message,
              messageId: data.data._id,
              timestamp: new Date().toISOString(),
            });
            // Synchronisation sidebar : émission de l'événement pour le dernier message
            socket.emit("messageListUpdate", {
              senderId: user._id,
              lastMessage: message,
              timestamp: new Date().toISOString(),
              isUnread: false,
            });
            // Emit typing false when message is sent
            socket.emit("typing", {
              senderId: user._id,
              receiverId: selectedChat,
              isTyping: false,
            });
          }
        } else {
          console.error(data.message || "Error sending message");
        }
      } catch (err) {
        console.error("Error sending message:", err);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (socket && selectedChat && user) {
      const typingStatus = e.target.value.length > 0;
      console.log(
        `Emitting typing event: ${user._id} is ${
          typingStatus ? "typing" : "not typing"
        } to ${selectedChat}`
      );
      socket.emit("typing", {
        senderId: user._id,
        receiverId: selectedChat,
        isTyping: typingStatus,
      });
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    const inputElement = document.querySelector(
      'input[type="text"]'
    ) as HTMLInputElement;
    if (inputElement) {
      inputElement.focus();
    }
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  const handleFileUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*,audio/*,video/*,application/*";
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        for (const file of Array.from(files)) {
          if (file.type.startsWith("video/") && file.size > 30 * 1024 * 1024) {
            setFileErrorMessage(t("fileSizeError"));
            setShowFileErrorModal(true);
            continue;
          }
          if (!file.type.startsWith("video/") && file.size > 20 * 1024 * 1024) {
            setFileErrorMessage(t("fileSizeError"));
            setShowFileErrorModal(true);
            continue;
          }
          try {
            const formData = new FormData();
            formData.append("media", file);
            const response = await fetch(
              `https://chatapp-shi2.onrender.com/api/messages/private/${selectedChat}/upload`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${
                    localStorage.getItem("token") || ""
                  }`,
                },
                body: formData,
              }
            );
            if (!response.ok) {
              const errorText = await response.text();
              console.error("File upload error:", response.status, errorText);
              throw new Error("Failed to upload file");
            }
            const data = await response.json();
            if (data.success) {
              const newMessage = {
                id: String(data.message.id),
                messageId: data.message.id
                  ? String(data.message.id)
                  : String(Date.now()),
                sender: "me" as const,
                content: file.type.startsWith("image/")
                  ? "Image envoyée"
                  : file.type.startsWith("audio/")
                  ? "Audio envoyé"
                  : file.type.startsWith("video/")
                  ? "Vidéo envoyée"
                  : "Fichier envoyé",
                time: new Date().toLocaleTimeString(language, {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                date: new Date().toLocaleDateString(language),
                hasImage: file.type.startsWith("image/"),
                hasAudio: file.type.startsWith("audio/"),
                hasFile:
                  !file.type.startsWith("image/") &&
                  !file.type.startsWith("audio/"),
                image: file.type.startsWith("image/")
                  ? data.message.fileUrl
                  : undefined,
                audio: file.type.startsWith("audio/")
                  ? data.message.fileUrl
                  : undefined,
                fileName:
                  !file.type.startsWith("image/") &&
                  !file.type.startsWith("audio/")
                    ? file.name
                    : undefined,
                fileSize:
                  !file.type.startsWith("image/") &&
                  !file.type.startsWith("audio/")
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                    : undefined,
              };
              setMessages((prev) => ({
                ...prev,
                [selectedChat]: [...(prev[selectedChat] || []), newMessage],
              }));
            } else {
              console.error(data.message || "Error uploading file");
              setFileErrorMessage(t("fileUploadError"));
              setShowFileErrorModal(true);
            }
          } catch (err) {
            console.error("Error uploading file:", err);
            setFileErrorMessage(t("fileUploadError"));
            setShowFileErrorModal(true);
          }
        }
      }
    };
    input.click();
  };

  const handleVoiceMessage = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "voice-message.webm");
      formData.append("recipientId", selectedChat);
      const response = await fetch(
        `https://chatapp-shi2.onrender.com/api/messages/private/${selectedChat}/voice`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send voice message");
      }

      const data = await response.json();
      if (data.success) {
        const timestamp = Date.now();
        const newMessage = {
          id: String(data.message.id),
          messageId: data.message.id
            ? String(data.message.id)
            : String(Date.now()),
          sender: "me" as const,
          content: t("voiceMessage"),
          time: new Date().toLocaleTimeString(language, {
            hour: "2-digit",
            minute: "2-digit",
          }),
          date: new Date().toLocaleDateString(language),
          hasAudio: true,
          audio: data.message.audioUrl,
          isPlayed: false,
          isExpired: false,
          timestamp: timestamp,
        };
        setMessages((prev) => ({
          ...prev,
          [selectedChat]: [
            ...(prev[selectedChat] || []),
            {
              ...newMessage,
              messageId: newMessage.messageId ?? String(newMessage.id),
            },
          ],
        }));
      } else {
        console.error(data.message || "Error sending voice message");
        setFileErrorMessage(t("voiceMessageError"));
        setShowFileErrorModal(true);
      }
    } catch (err) {
      console.error("Error sending voice message:", err);
      setFileErrorMessage(t("voiceMessageError"));
      setShowFileErrorModal(true);
    }
  };

  const startVideoCall = async () => {
    console.log("Appel vidéo démarré avec", currentChat.name);
    try {
      const response = await fetch(
        `https://chatapp-shi2.onrender.com/api/calls/initiate/${selectedChat}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
          body: JSON.stringify({ isVideo: true }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to initiate video call");
      }

      const data = await response.json();
      if (data.success) {
        setIsAudioCall(false);
        setShowVideoCall(true);
      } else {
        console.error(data.message || "Error initiating video call");
        setFileErrorMessage(t("callInitiationError"));
        setShowFileErrorModal(true);
      }
    } catch (err) {
      console.error("Error initiating video call:", err);
      setFileErrorMessage(t("callInitiationError"));
      setShowFileErrorModal(true);
    }
  };

  const startAudioCall = async () => {
    console.log("Appel audio démarré avec", currentChat.name);
    try {
      const response = await fetch(`/api/calls/initiate/${selectedChat}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVideo: false }),
      });

      if (!response.ok) {
        throw new Error("Failed to initiate audio call");
      }

      const data = await response.json();
      if (data.success) {
        setIsAudioCall(true);
        setShowVideoCall(true);
      } else {
        console.error(data.message || "Error initiating audio call");
        setFileErrorMessage(t("callInitiationError"));
        setShowFileErrorModal(true);
      }
    } catch (err) {
      console.error("Error initiating audio call:", err);
      setFileErrorMessage(t("callInitiationError"));
      setShowFileErrorModal(true);
    }
  };

  const handleToggleVideo = () => {
    setIsAudioCall(!isAudioCall);
  };

  const handleAudioEnded = async (messageId: string, chatId: string) => {
    // Mark as played in the backend and update local state to show as expired
    const message = messages[chatId]?.find((m) => m.id === messageId);
    if (message) {
      try {
        const response = await fetch(
          `https://chatapp-shi2.onrender.com/api/messages/${messageId}/play`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
            },
          }
        );
        if (response.ok) {
          setMessages((prev) => {
            const updatedMessages = prev[chatId].map((msg) =>
              msg.id === messageId
                ? { ...msg, isPlayed: true, isExpired: true }
                : msg
            );
            return {
              ...prev,
              [chatId]: updatedMessages,
            };
          });
        } else {
          console.error("Failed to mark audio message as played");
        }
      } catch (error) {
        console.error("Error marking audio message as played:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white animate-fade-in transition-all duration-300 ease-in-out">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white animate-slide-in-right transition-all duration-300 ease-in-out">
        <div className="flex items-center min-w-0 flex-1">
          {!sidebarOpen && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="mr-2 sm:mr-3 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 lg:hidden"
              title="Toggle sidebar"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          )}

          <div className="relative mr-2 sm:mr-3 animate-scale-in flex-shrink-0">
            <img
              src={
                currentChat.avatar ||
                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
              }
              alt={currentChat.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>

          <div className="animate-fade-in min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
              {currentChat.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 truncate">
              {isBlocked ? t("blocked") : currentChat.status}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <button
            onClick={startAudioCall}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 transform"
            title={t("audioCall")}
          >
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-green-500 transition-colors" />
          </button>
          <button
            onClick={startVideoCall}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 transform"
            title={t("videoCall")}
          >
            <Video className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-blue-500 transition-colors" />
          </button>
          <button
            onClick={() => setShowBlockModal(true)}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 transform"
            title={isBlocked ? t("unblockUser") : t("blockUser")}
          >
            <UserX
              className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                isBlocked ? "text-red-500" : "text-gray-600 hover:text-red-500"
              }`}
            />
          </button>
          <button
            onClick={onToggleRightSidebar}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 transform"
            title="Plus d'options"
          >
            <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-gray-800 transition-colors" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 transition-all duration-300 ease-in-out">
        {(messages[selectedChat] || []).map((msg, index) => (
          <div
            key={msg.id}
            className={`flex animate-fade-in hover-scale ${
              msg.sender === "me" ? "justify-end" : "justify-start"
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-end space-x-2 max-w-xs lg:max-w-md">
              {msg.sender === "other" && (
                <img
                  src={currentChat.avatar || ""}
                  alt={currentChat.name}
                  className="w-8 h-8 rounded-full object-cover bg-gray-300 flex-shrink-0 animate-scale-in transition-transform duration-200 hover:scale-110"
                />
              )}

              <div className="space-y-1">
                <div
                  className={`px-4 py-2 rounded-2xl transition-all duration-200 hover:scale-105 ${
                    msg.sender === "me"
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-900 shadow-sm border"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>

                  {msg.hasImage && msg.image && (
                    <div className="mt-2 animate-scale-in">
                      <img
                        src={
                          msg.image.startsWith("http")
                            ? msg.image
                            : `https://chatapp-shi2.onrender.com${msg.image}`
                        }
                        alt="Image partagée"
                        className="max-w-full h-auto rounded-lg transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          (
                            e.target as HTMLImageElement
                          ).src = `https://chatapp-shi2.onrender.com/uploads/messages/${msg.image
                            ?.split("/")
                            .pop()}`;
                        }}
                      />
                    </div>
                  )}

                  {msg.hasAudio && msg.audio && (
                    <div className="mt-2 animate-scale-in">
                      {msg.isExpired ? (
                        <div className="text-xs text-gray-500 italic">
                          {t("voiceMessage")} {t("expired")}
                        </div>
                      ) : (
                        <>
                          <audio
                            controls
                            className="max-w-full"
                            onEnded={() =>
                              handleAudioEnded(String(msg.id), selectedChat)
                            }
                          >
                            <source
                              src={
                                msg.audio.startsWith("http")
                                  ? msg.audio
                                  : `https://chatapp-shi2.onrender.com${msg.audio}`
                              }
                              type="audio/mpeg"
                              onError={(e) => {
                                (
                                  e.target as HTMLSourceElement
                                ).src = `https://chatapp-shi2.onrender.com/uploads/messages/${msg.audio
                                  ?.split("/")
                                  .pop()}`;
                              }}
                            />
                            {t("browserNotSupportAudio")}
                          </audio>
                          <div className="text-xs text-gray-500 italic mt-1">
                            {msg.isPlayed
                              ? t("voiceMessagePlayed")
                              : t("voiceMessageNotPlayed")}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {msg.hasFile && (
                    <div className="mt-2 animate-scale-in">
                      {msg.content.toLowerCase().includes("video") ? (
                        <video
                          controls
                          className="max-w-full h-auto rounded-lg"
                        >
                          <source
                            src={`https://chatapp-shi2.onrender.com/uploads/messages/${msg.fileName}`}
                            type="video/mp4"
                          />
                          {t("browserNotSupportVideo")}
                        </video>
                      ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-lg border hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-2">
                            <div className="text-blue-500">📎</div>
                            <div>
                              <div className="text-sm font-medium">
                                <a
                                  href={`https://chatapp-shi2.onrender.com/uploads/messages/${msg.fileName}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {msg.fileName}
                                </a>
                              </div>
                              <div className="text-xs text-gray-500">
                                {msg.fileSize}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div
                  className={`text-xs text-gray-500 animate-fade-in ${
                    msg.sender === "me" ? "text-right" : "text-left"
                  }`}
                >
                  {msg.time}
                </div>
              </div>

              {msg.sender === "me" && (
                <div className="relative flex items-center">
                  <img
                    src={user?.profilePicture || ""}
                    alt="Moi"
                    className="w-8 h-8 rounded-full object-cover bg-gray-300 flex-shrink-0 animate-scale-in transition-transform duration-200 hover:scale-110"
                  />
                  <button
                    className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100 transition-all"
                    title="Options"
                    onClick={() =>
                      setSelectedMessageOptions(
                        msg.messageId ? String(msg.messageId) : String(msg.id)
                      )
                    }
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        <TypingIndicator
          isTyping={isTyping && currentChat.online}
          isRecording={isRecording}
          userName={currentChat.name}
        />
      </div>

      {/* Message Input */}
      <div className="p-3 sm:p-4 border-t border-gray-200 bg-white animate-slide-in-right transition-all duration-300 ease-in-out">
        {isBlocked ? (
          <div className="text-center text-gray-500 py-4 animate-fade-in">
            <p className="text-sm sm:text-base">{t("userBlockedMessage")}</p>
          </div>
        ) : isBlockedByOther ? (
          <div className="text-center text-gray-500 py-4 animate-fade-in">
            <p className="text-sm sm:text-base">{t("cannotSendMessage")}</p>
          </div>
        ) : (
          <div className="flex items-end space-x-2 sm:space-x-3">
            <div className="flex space-x-1 sm:space-x-2">
              <button
                onClick={handleFileUpload}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 transform"
                title={t("uploadFile")}
              >
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-blue-500 transition-colors" />
              </button>
              <button
                onClick={() => setShowVoiceModal(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 transform"
                title={t("recordVoiceMessage")}
              >
                <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-green-500 transition-colors" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 transform"
                  title={t("selectEmoji")}
                >
                  <Smile className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 hover:text-yellow-500 transition-colors" />
                </button>
                <EmojiPicker
                  isOpen={showEmojiPicker}
                  onToggle={() => setShowEmojiPicker(!showEmojiPicker)}
                  onEmojiSelect={handleEmojiSelect}
                />
              </div>
            </div>

            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 input-focus text-sm sm:text-base"
                aria-label={t("writeMessage")}
              />
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="p-2 sm:p-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed btn-primary"
              title={t("sendMessage")}
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Blocked Message Alert */}
      {showBlockedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-xl border border-gray-200 animate-scale-in">
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              {t("messageBlocked")}
            </h3>
            <p className="text-sm text-gray-700 mb-6">{blockedMessageText}</p>
            <button
              onClick={() => setShowBlockedMessage(false)}
              className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <BlockUserModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        userName={currentChat.name}
        userId={currentChat.id}
        isBlocked={isBlocked}
        onToggleBlock={handleToggleBlock}
      />

      <VoiceMessageModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSend={handleVoiceMessage}
      />

      <VideoCallModal
        isOpen={showVideoCall}
        onClose={() => setShowVideoCall(false)}
        userName={currentChat.name}
        userAvatar={currentChat.avatar}
        isAudioOnly={isAudioCall}
        onToggleVideo={handleToggleVideo}
      />

      {showFileErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-xl border border-gray-200 animate-scale-in">
            <h3 className="text-lg font-semibold text-red-600 mb-4">
              {t("fileError")}
            </h3>
            <p className="text-sm text-gray-700 mb-6">{fileErrorMessage}</p>
            <button
              onClick={() => setShowFileErrorModal(false)}
              className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}

      {selectedMessageOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-xs shadow-xl border border-gray-200 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Options du message
            </h3>
            <div className="space-y-3">
              <button
                onClick={handleDeleteMessageOption}
                className="w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
              >
                Supprimer
              </button>
              <button
                onClick={handleToggleFavoriteOption}
                className="w-full py-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-all duration-200"
              >
                {t("favorite")}
              </button>
              <button
                onClick={() => setSelectedMessageOptions(null)}
                className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
