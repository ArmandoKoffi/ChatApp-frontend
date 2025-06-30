
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatArea } from '@/components/ChatArea';
import { GroupChatArea } from '@/components/GroupChatArea';
import { ProfilePanel } from '@/components/ProfilePanel';
import { GroupInfoPanel } from '@/components/GroupInfoPanel';
import { AdminPanel } from '@/components/AdminPanel';
import { UserProfile } from '@/components/UserProfile';
import { Home } from './Home';
import { Bookmarks } from './Bookmarks';
import { Gallery } from './Gallery';
import { Settings } from './Settings';
import { CurrentView } from '@/types';

const Index = () => {
  const navigate = useNavigate();
const [selectedChat, setSelectedChat] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<CurrentView>(() => {
    const savedView = localStorage.getItem('currentView') as CurrentView | null;
    return savedView || 'home';
  });
  const [userRole] = useState<'user' | 'admin'>('user');

  useEffect(() => {
    localStorage.setItem('currentView', currentView);
  }, [currentView]);

  const handleLogout = () => {
    navigate('/landing');
  };

  // Détermine si la sidebar gauche doit être visible
  const shouldShowLeftSidebar = ['messages', 'rooms'].includes(currentView);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <Home />;
      case 'bookmarks':
        return <Bookmarks />;
      case 'gallery':
        return <Gallery />;
      case 'settings':
        return <Settings />;
      case 'admin':
        return userRole === 'admin' ? <AdminPanel /> : <Home />;
      case 'profile':
        return <UserProfile />;
      case 'messages':
        return (
          <div className="flex h-full">
            <div className="flex-1">
              <ChatArea 
                selectedChat={selectedChat}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
              />
            </div>
            {rightSidebarOpen && (
              <div className="w-80 flex-shrink-0 border-l border-gray-200 animate-slide-in-right">
                <ProfilePanel selectedChat={selectedChat} />
              </div>
            )}
          </div>
        );
      case 'rooms':
        return (
          <div className="flex h-full">
            <div className="flex-1">
              <GroupChatArea 
                selectedRoom={selectedRoom}
                sidebarOpen={sidebarOpen}
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                onToggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
              />
            </div>
            {rightSidebarOpen && (
              <div className="w-80 flex-shrink-0 border-l border-gray-200 animate-slide-in-right">
                <GroupInfoPanel selectedRoom={selectedRoom} />
              </div>
            )}
          </div>
        );
      default:
        return <Home />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden animate-fade-in">
      {/* Sidebar gauche - Visible seulement pour les discussions */}
      {shouldShowLeftSidebar && (
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0`}>
          <ChatSidebar 
            selectedChat={selectedChat} 
            onSelectChat={setSelectedChat}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            currentView={currentView}
            onViewChange={setCurrentView}
            selectedRoom={selectedRoom}
            onRoomSelect={setSelectedRoom}
            userRole={userRole}
            onLogout={handleLogout}
          />
        </div>
      )}

      {/* Sidebar flottante pour les sections non-discussion */}
      {!shouldShowLeftSidebar && (
        <div className="fixed top-0 left-0 h-full z-50">
          <div className="w-16 h-full">
            <ChatSidebar 
              selectedChat={selectedChat} 
              onSelectChat={setSelectedChat}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              currentView={currentView}
              onViewChange={setCurrentView}
              selectedRoom={selectedRoom}
              onRoomSelect={setSelectedRoom}
              userRole={userRole}
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      {/* Zone principale */}
      <div className={`flex-1 min-w-0 animate-scale-in ${
        !shouldShowLeftSidebar ? 'ml-16' : ''
      }`}>
        {renderCurrentView()}
      </div>

      {/* Overlay pour mobile */}
      {(sidebarOpen || rightSidebarOpen) && shouldShowLeftSidebar && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden animate-fade-in"
          onClick={() => {
            setSidebarOpen(false);
            setRightSidebarOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default Index;
