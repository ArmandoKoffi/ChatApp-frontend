import { useState, useEffect } from 'react';
import { ChevronRight, User } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import userService from '../services/userService';
import io from 'socket.io-client';

interface ProfilePanelProps {
  selectedChat?: string;
}

export function ProfilePanel({ selectedChat }: ProfilePanelProps) {
  const { t } = useLanguage();
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [showFilesModal, setShowFilesModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<{ title: string, content: string } | null>(null);
  const [profile, setProfile] = useState({
    name: '',
    avatar: '',
    status: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (selectedChat) {
        setLoading(true);
        try {
          const response = await userService.getUserById(selectedChat);
          if (response.success) {
            setProfile({
              name: response.data.username || 'User',
              avatar: response.data.profilePicture || '',
              status: response.data.isOnline ? t('online') : t('offline')
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();

    // Configuration Socket.IO pour les mises à jour en temps réel
    const socket = io('https://chatapp-shi2.onrender.com');
    
    const handleProfileUpdate = (data: { userId: string; profilePicture?: string; username?: string }) => {
      const { userId, profilePicture, username } = data;
      if (userId === selectedChat) {
        setProfile(prev => ({
          ...prev,
          avatar: profilePicture || prev.avatar,
          name: username || prev.name,
        }));
      }
    };

    const handleOnlineUsers = (users: string[]) => {
      if (selectedChat && users.includes(selectedChat)) {
        setProfile(prev => ({
          ...prev,
          status: t('online')
        }));
      } else if (selectedChat) {
        setProfile(prev => ({
          ...prev,
          status: t('offline')
        }));
      }
    };

    socket.on('userProfileUpdated', handleProfileUpdate);
    socket.on('onlineUsers', handleOnlineUsers);

    return () => {
      socket.off('userProfileUpdated', handleProfileUpdate);
      socket.off('onlineUsers', handleOnlineUsers);
      socket.disconnect();
    };
  }, [selectedChat, t]);

  interface MediaItem {
    id: number;
    type: string;
    src: string;
    count?: string;
  }

  interface LinkItem {
    id: number;
    title: string;
    preview: string;
  }

  interface FileItem {
    id: number;
    name: string;
    size: string;
    date: string;
  }

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [allMediaItems, setAllMediaItems] = useState<MediaItem[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [allLinks, setAllLinks] = useState<LinkItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [allFiles, setAllFiles] = useState<FileItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [linksLoading, setLinksLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [linksError, setLinksError] = useState<string | null>(null);
  const [filesError, setFilesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (selectedChat) {
        try {
          // Fetch Media
          setMediaLoading(true);
          setMediaError(null);
          const mediaResponse = await fetch(`/backend/api/profile/${selectedChat}/media`);
          if (!mediaResponse.ok) {
            console.error('Failed to fetch media, status:', mediaResponse.status);
            const responseText = await mediaResponse.text();
            console.error('Response content:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
            throw new Error('Failed to fetch media');
          }
          const contentType = mediaResponse.headers.get('content-type') || '';
          if (!contentType.includes('application/json')) {
            console.error('Unexpected content type:', contentType);
            const responseText = await mediaResponse.text();
            console.error('Response content:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
            setMediaError('Unexpected response format from server. Please try again later.');
          } else {
            const mediaData = await mediaResponse.json();
            if (mediaData.success) {
              setMediaItems(mediaData.mediaItems.slice(0, 3) || []);
              setAllMediaItems(mediaData.mediaItems || []);
            } else {
              setMediaError(mediaData.message || 'Error fetching media');
            }
          }
        } catch (error) {
          console.error('Error fetching media:', error);
          setMediaError('Failed to load media. Please try again later.');
        } finally {
          setMediaLoading(false);
        }

        try {
          // Fetch Links
          setLinksLoading(true);
          setLinksError(null);
          const linksResponse = await fetch(`/backend/api/profile/${selectedChat}/links`);
          if (!linksResponse.ok) {
            console.error('Failed to fetch links, status:', linksResponse.status);
            const responseText = await linksResponse.text();
            console.error('Response content:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
            throw new Error('Failed to fetch links');
          }
          const linksContentType = linksResponse.headers.get('content-type') || '';
          if (!linksContentType.includes('application/json')) {
            console.error('Unexpected content type:', linksContentType);
            const responseText = await linksResponse.text();
            console.error('Response content:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
            setLinksError('Unexpected response format from server. Please try again later.');
          } else {
            const linksData = await linksResponse.json();
            if (linksData.success) {
              setLinks(linksData.links.slice(0, 1) || []);
              setAllLinks(linksData.links || []);
            } else {
              setLinksError(linksData.message || 'Error fetching links');
            }
          }
        } catch (error) {
          console.error('Error fetching links:', error);
          setLinksError('Failed to load links. Please try again later.');
        } finally {
          setLinksLoading(false);
        }

        try {
          // Fetch Files
          setFilesLoading(true);
          setFilesError(null);
          const filesResponse = await fetch(`/backend/api/profile/${selectedChat}/files`);
          if (!filesResponse.ok) {
            console.error('Failed to fetch files, status:', filesResponse.status);
            const responseText = await filesResponse.text();
            console.error('Response content:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
            throw new Error('Failed to fetch files');
          }
          const filesContentType = filesResponse.headers.get('content-type') || '';
          if (!filesContentType.includes('application/json')) {
            console.error('Unexpected content type:', filesContentType);
            const responseText = await filesResponse.text();
            console.error('Response content:', responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
            setFilesError('Unexpected response format from server. Please try again later.');
          } else {
            const filesData = await filesResponse.json();
            if (filesData.success) {
              setFiles(filesData.files.slice(0, 2) || []);
              setAllFiles(filesData.files || []);
            } else {
              setFilesError(filesData.message || 'Error fetching files');
            }
          }
        } catch (error) {
          console.error('Error fetching files:', error);
          setFilesError('Failed to load files. Please try again later.');
        } finally {
          setFilesLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [selectedChat]);

  if (loading) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!selectedChat) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{t('selectChatToViewProfile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
      {/* Profile Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="text-center">
          <div className="relative inline-block">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="w-8 h-8 text-gray-600" />
              </div>
            )}
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">{profile.name}</h3>
          <p className="text-sm text-gray-500">{profile.status}</p>
        </div>
      </div>

      {/* Media Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-900">{t('media')}</h4>
          {mediaItems.length > 0 && (
            <button
              onClick={() => setShowMediaModal(true)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              {allMediaItems.length} <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
        {mediaLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : mediaError ? (
          <p className="text-sm text-red-500">{mediaError}</p>
        ) : mediaItems.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {mediaItems.map((item) => (
              <div key={item.id} className="aspect-square bg-gray-100 rounded overflow-hidden">
                <img src={item.src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t('noMediaShared')}</p>
        )}
      </div>

      {/* Links Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-900">{t('links')}</h4>
          {links.length > 0 && (
            <button
              onClick={() => setShowLinksModal(true)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              {allLinks.length} <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
        {linksLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        ) : linksError ? (
          <p className="text-sm text-red-500">{linksError}</p>
        ) : links.length > 0 ? (
          <div className="space-y-2">
            {links.map((link) => (
              <div key={link.id} className="p-2 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-900 truncate">{link.title}</p>
                <p className="text-xs text-gray-500 truncate">{link.preview}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t('noLinksShared')}</p>
        )}
      </div>

      {/* Files Section */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-900">{t('files')}</h4>
          {files.length > 0 && (
            <button
              onClick={() => setShowFilesModal(true)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              {allFiles.length} <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          )}
        </div>
        {filesLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filesError ? (
          <p className="text-sm text-red-500">{filesError}</p>
        ) : files.length > 0 ? (
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">📄</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{file.size} • {file.date}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">{t('noFilesShared')}</p>
        )}
      </div>

      {/* Media Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowMediaModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('allMedia')} ({allMediaItems.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {allMediaItems.map((item) => (
                <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={item.src} 
                    alt="Media"
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowMediaModal(false)}
              className="mt-6 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}

      {/* Links Modal */}
      {showLinksModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowLinksModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('allLinks')} ({allLinks.length})</h3>
            <div className="space-y-4">
              {allLinks.map((link) => (
                <div key={link.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 bg-green-500 rounded"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{link.title}</p>
                      <p className="text-xs text-gray-500">{link.preview}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowLinksModal(false)}
              className="mt-6 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}

      {/* Files Modal */}
      {showFilesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowFilesModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('allFiles')} ({allFiles.length})</h3>
            <div className="space-y-3">
              {allFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-blue-600">📄</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{file.size} • {file.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowFilesModal(false)}
              className="mt-6 w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowMessageModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{selectedMessage.title}</h3>
            <p className="text-gray-700 mb-6">{selectedMessage.content}</p>
            <button
              onClick={() => setShowMessageModal(false)}
              className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
