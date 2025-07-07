import {
  Search,
  Home,
  Bookmark,
  MessageCircle,
  Image,
  Settings,
  LogOut,
  Users,
  MessageSquare,
  User,
} from "lucide-react";
import { useAuthContext } from "../contexts";
import { ContactList } from "./ContactList";
import { MessagesList } from "./MessagesList";
import { ChatRooms } from "./ChatRooms";
import { OnlineUsers } from "./OnlineUsers";
import { CurrentView } from "@/types";
import { useState, useEffect } from "react";
import io from 'socket.io-client';
import { useLanguage } from "./LanguageContext";

interface ChatSidebarProps {
  selectedChat: string;
  onSelectChat: (chatId: string) => void;
  onToggleSidebar: () => void;
  currentView: CurrentView;
  onViewChange: (view: CurrentView) => void;
  selectedRoom?: string;
  onRoomSelect: (roomId: string) => void;
  userRole?: "user" | "admin";
  onLogout: () => void;
}

export function ChatSidebar({
  selectedChat,
  onSelectChat,
  onToggleSidebar,
  currentView,
  onViewChange,
  selectedRoom,
  onRoomSelect,
  userRole = "user",
  onLogout,
}: ChatSidebarProps) {
  const { user } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [onlineUsers, setOnlineUsers] = useState<{ id: string, username: string, profilePicture: string }[]>([]);
  
  useEffect(() => {
    const socket = io('https://chatapp-shi2.onrender.com', {
      transports: ['websocket'],
      path: '/socket.io'
    });
    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      if (user) {
        socket.emit('join', user._id);
      }
    });
    
    socket.on('onlineUsers', async (userIds) => {
      console.log('Received online users:', userIds);
      if (user) {
        // Filter out the current user from the list
        const filteredUserIds = userIds.filter(id => id !== user._id);
        // Fetch user details for each ID
        try {
          const userDetails = [];
          for (const userId of filteredUserIds) {
            const response = await fetch(`https://chatapp-shi2.onrender.com/api/users/${userId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
              }
            });
            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                userDetails.push({
                  id: data.data._id,
                  username: data.data.username,
                  profilePicture: data.data.profilePicture || ''
                });
              }
            }
          }
          setOnlineUsers(userDetails);
        } catch (error) {
          console.error('Error fetching user details:', error);
          setOnlineUsers([]);
        }
      } else {
        setOnlineUsers([]);
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });
    
    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Détermine si on est en mode discussion (avec contenu étendu)
  const isDiscussionMode = ["messages", "rooms"].includes(currentView);

  const { t } = useLanguage();

  const navigationItems = [
    { id: "home" as CurrentView, icon: Home, label: t("home") },
    { id: "bookmarks" as CurrentView, icon: Bookmark, label: t("bookmarks") },
    {
      id: "messages" as CurrentView,
      icon: MessageSquare,
      label: t("privateMessages"),
    },
    { id: "rooms" as CurrentView, icon: Users, label: t("chatRooms") },
    { id: "gallery" as CurrentView, icon: Image, label: t("gallery") },
    { id: "settings" as CurrentView, icon: Settings, label: t("settings") },
  ];

  const handleNavClick = (item: (typeof navigationItems)[0]) => {
    onViewChange(item.id);
  };

  const { logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    onLogout();
    // Navigate to the landing page after logout to avoid loading state issues
    window.location.href = '/';
  };

  if (!isDiscussionMode) {
    // Mode icônes seulement pour les sections non-discussion
    return (
      <div className="h-full bg-gray-100 flex relative z-50 animate-slide-in-right">
        <div className="w-16 bg-gray-200 flex flex-col items-center py-6">
          {/* Profile Avatar at top */}
          <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden animate-scale-in cursor-pointer mb-6">
            <img 
              src={user?.profilePicture || ""} 
              alt={t('profile')}
              className="w-full h-full object-cover bg-gray-300 hover:scale-105 transition-transform duration-200"
              onClick={() => onViewChange('profile')}
              title={t('profile')}
            />
          </div>

          {/* Navigation Icons */}
          <div className="flex-1 space-y-6 flex flex-col items-center">
            {navigationItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-8 h-8 p-1 rounded-lg transition-all duration-300 transform hover:scale-110 animate-fade-in ${
                  currentView === item.id && item.id !== "search"
                    ? "bg-blue-500 text-white scale-110"
                    : "text-gray-500 hover:bg-gray-300 hover:text-gray-700"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                title={item.label}
              >
                <item.icon className="w-6 h-6" />
              </button>
            ))}
          </div>

          {/* Logout at bottom */}
          <div className="flex flex-col items-center mt-8">
            <button
              onClick={handleLogout}
              className="w-8 h-8 p-1 rounded-lg transition-all duration-300 transform hover:scale-110 animate-fade-in text-gray-500 hover:bg-red-100 hover:text-red-500"
              title={t("Déconnexion")}
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mode complet pour les discussions
  return (
    <div className="h-full bg-gray-100 flex relative z-50 animate-slide-in-right">
      {/* Navigation Icons - Vertical layout */}
      <div className="w-16 bg-gray-200 flex flex-col items-center py-6">
        {/* Profile Avatar at top */}
        <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden animate-scale-in cursor-pointer mb-6">
          <img
            src={user?.profilePicture || ""}
            alt={t('profile')}
            className="w-full h-full object-cover bg-gray-300 hover:scale-105 transition-transform duration-200"
            onClick={() => onViewChange("profile")}
            title={t('profile')}
          />
        </div>

        {/* Navigation Icons */}
        <div className="flex-1 space-y-6 flex flex-col items-center">
          {navigationItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`w-8 h-8 p-1 rounded-lg transition-all duration-300 transform hover:scale-110 animate-fade-in hover:rotate-12 ${
                currentView === item.id && item.id !== "search"
                  ? "bg-blue-500 text-white scale-110"
                  : "text-gray-500 hover:bg-gray-300 hover:text-gray-700"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              title={item.label}
            >
              <item.icon className="w-6 h-6" />
            </button>
          ))}
        </div>

        {/* Logout at bottom */}
        <div className="flex flex-col items-center mt-8">
          <button
            onClick={handleLogout}
            className="w-8 h-8 p-1 rounded-lg transition-all duration-300 transform hover:scale-110 animate-fade-in hover:rotate-12 text-gray-500 hover:bg-red-100 hover:text-red-500"
            title={t("Déconnexion")}
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Search Bar - Always shown and made prominent for messages view */}
        {currentView === "messages" && (
          <div className="p-3 xs:p-4 sm:p-5 border-b border-gray-200 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 xs:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 xs:pl-12 pr-3 xs:pr-5 py-3 bg-gray-100 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 input-focus shadow-md border border-gray-300"
                aria-label={t("Rechercher une conversation")}
                placeholder={t("Rechercher une conversation")}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Content based on current view */}
        {currentView === "messages" && (
          <div className="flex-1 overflow-y-auto animate-fade-in">
            {/* Online Users Section - Using real-time data from Socket.IO */}
            <div className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center animate-slide-in-right">
                {t("En ligne")}
              </h3>
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {onlineUsers.map((onlineUser, index) => (
                  <div 
                    key={onlineUser.id} 
                    className="flex-shrink-0 relative cursor-pointer animate-fade-in hover:scale-105 transition-transform duration-200"
                    style={{ animationDelay: `${index * 0.1}s` }}
                    onClick={() => onSelectChat(onlineUser.id)}
                  >
                    <img
                      src={onlineUser.profilePicture || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'}
                      alt={onlineUser.username}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                ))}
                {onlineUsers.length === 0 && (
                  <p className="text-gray-500 text-xs italic text-center w-full">{t("Aucun utilisateur en ligne")}</p>
                )}
              </div>
            </div>

            {/* Messages List */}
            <div className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 sm:mb-3 flex items-center animate-slide-in-right">
                {t("Messages")}
              </h3>
              <MessagesList
                selectedChat={selectedChat}
                onSelectChat={onSelectChat}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        )}

        {currentView === "rooms" && (
          <div className="flex-1 overflow-y-auto animate-fade-in">
            <div className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 sm:py-3">
              <h3 className="text-xs xs:text-sm font-semibold text-gray-900 mb-1.5 xs:mb-2 sm:mb-3 flex items-center animate-slide-in-right">
                <Users className="w-3 h-3 xs:w-4 h-4 mr-1 xs:mr-2 text-green-500" />
                {t("Salons de discussion")}
              </h3>
              <ChatRooms
                onRoomSelect={onRoomSelect}
                selectedRoom={selectedRoom}
                userRole={userRole}
                searchQuery={searchQuery}
              />
            </div>
          </div>
        )}

        {!["messages", "rooms"].includes(currentView) && (
          <div className="flex-1 flex items-center justify-center p-3 xs:p-4 sm:p-6 animate-fade-in">
            <div className="text-center">
              <div className="w-12 h-12 xs:w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 xs:mb-3 sm:mb-4 animate-scale-in">
                {(() => {
                  const currentItem = navigationItems.find(
                    (item) => item.id === currentView
                  );
                  return currentItem ? (
                    <currentItem.icon className="w-6 h-6 xs:w-8 h-8 text-gray-400" />
                  ) : null;
                })()}
              </div>
              <p className="text-gray-500 text-xs xs:text-sm animate-fade-in">
                {currentView === "home" && t("welcomeMessage")}
                {currentView === "bookmarks" && t("favoriteConversations")}
                {currentView === "gallery" && t("sharePhotos")}
                {currentView === "settings" && t("customizeExperience")}
                {currentView === "admin" && t("adminPanel")}
                {currentView === "profile" && t("manageProfile")}
                {currentView === "search" && t("searchConversations")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
