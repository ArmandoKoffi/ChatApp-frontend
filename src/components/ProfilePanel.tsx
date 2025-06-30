import { useState, useEffect } from 'react';
import { ChevronRight, Camera, User } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { useAuthContext } from '../contexts/AuthContext';
import userService from '../services/userService';
import { useToast } from '../hooks';

interface ProfilePanelProps {
  selectedChat: string;
}

export function ProfilePanel({ selectedChat }: ProfilePanelProps) {
  const { t } = useLanguage();
  const { user, updateUser } = useAuthContext();
  const { toast } = useToast();
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
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [showProfileUpdate, setShowProfileUpdate] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setProfile({
          name: user.username || 'User',
          avatar: user.profilePicture || '',
          status: user.isOnline ? t('online') : t('offline')
        });
        setLoading(false);
      } else {
        try {
          const response = await userService.getUserById(selectedChat || 'me');
          if (response.success) {
            setProfile({
              name: response.data.username || 'User',
              avatar: response.data.profilePicture || '',
              status: response.data.isOnline ? t('online') : t('offline')
            });
          }
          setLoading(false);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user, selectedChat, t]);

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      try {
        const formData = {
          profilePicture: file
        };
        const response = await userService.updateProfile(formData);
        if (response.success) {
          setProfile(prev => ({ ...prev, avatar: response.data.profilePicture }));
          updateUser(response.data);
          toast({
            title: t('profileUpdated'),
            description: t('profilePictureUpdatedSuccess'),
            variant: 'default'
          });
          // Refresh user data from backend to ensure latest data is displayed
          const refreshedUser = await userService.getUserById('me');
          if (refreshedUser.success) {
            updateUser(refreshedUser.data);
            setProfile({
              name: refreshedUser.data.username || 'User',
              avatar: refreshedUser.data.profilePicture || '',
              status: refreshedUser.data.isOnline ? t('online') : t('offline')
            });
          }
        }
      } catch (error) {
        console.error('Error updating profile picture:', error);
        toast({
          title: t('error'),
          description: t('profilePictureUpdateFailed'),
          variant: 'destructive'
        });
      }
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      const formData = {
        removeProfilePicture: true
      };
      const response = await userService.updateProfile(formData);
      if (response.success) {
        setProfile(prev => ({ ...prev, avatar: response.data.profilePicture }));
        updateUser(response.data);
        toast({
          title: t('profileUpdated'),
          description: t('profilePictureRemovedSuccess'),
          variant: 'default'
        });
        // Refresh user data from backend to ensure latest data is displayed
        const refreshedUser = await userService.getUserById('me');
        if (refreshedUser.success) {
          updateUser(refreshedUser.data);
          setProfile({
            name: refreshedUser.data.username || 'User',
            avatar: refreshedUser.data.profilePicture || '',
            status: refreshedUser.data.isOnline ? t('online') : t('offline')
          });
        }
      }
    } catch (error) {
      console.error('Error removing profile picture:', error);
      toast({
        title: t('error'),
        description: t('profilePictureRemoveFailed'),
        variant: 'destructive'
      });
    }
  };

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
              setFiles(filesData.files.slice(0, 3) || []);
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

  return (
    <div className="h-full bg-white p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-transparent">
      {/* Profile Header */}
      <div className="text-center mb-8">
        {loading ? (
          <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 animate-pulse"></div>
        ) : (
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden flex items-center justify-center">
              {profile.avatar ? (
                <img 
                  src={profile.avatar} 
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            {user && user._id === selectedChat && (
              <label htmlFor="profilePictureUpdate" className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                <Camera className="w-4 h-4" />
                <input id="profilePictureUpdate" type="file" accept="image/*" onChange={handleProfilePictureChange} className="hidden" aria-label="Update profile picture" />
              </label>
            )}
          </div>
        )}
        <h2 className="text-xl font-semibold text-gray-900">{loading ? 'Loading...' : profile.name}</h2>
        <p className="text-sm text-green-500 font-medium">{profile.status}</p>
        {user && user._id === selectedChat && (
          <button 
            onClick={handleRemoveProfilePicture} 
            className="mt-2 text-sm text-red-500 hover:text-red-700"
            disabled={loading || !profile.avatar}
          >
            {t('removeProfilePicture')}
          </button>
        )}
      </div>

      {/* Media Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">{t('mediaSection')} <span className="text-gray-500">{allMediaItems.length}</span></h3>
          <button className="text-sm text-blue-500 hover:text-blue-600 flex items-center" onClick={() => setShowMediaModal(true)}>
            {t('seeAll')} <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        {mediaLoading ? (
          <div className="text-center p-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse"></div>
            <p className="text-sm text-gray-500">{t('loading')}</p>
          </div>
        ) : mediaError ? (
          <div className="text-center p-3 text-red-500 text-sm">
            {mediaError}
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="text-center p-3 text-gray-500 text-sm">
            {t('noMedia')}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {mediaItems.map((item) => (
              <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                {item.type === 'image' ? (
                  <img 
                    src={item.src} 
                    alt="Media"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white font-semibold">
                    {item.count}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Links Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">{t('linkSection')} <span className="text-gray-500">{allLinks.length}</span></h3>
          <button className="text-sm text-blue-500 hover:text-blue-600 flex items-center" onClick={() => setShowLinksModal(true)}>
            {t('seeAll')} <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        {linksLoading ? (
          <div className="text-center p-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse"></div>
            <p className="text-sm text-gray-500">{t('loading')}</p>
          </div>
        ) : linksError ? (
          <div className="text-center p-3 text-red-500 text-sm">
            {linksError}
          </div>
        ) : links.length === 0 ? (
          <div className="text-center p-3 text-gray-500 text-sm">
            {t('noLinks')}
          </div>
        ) : (
          links.map((link) => (
            <div key={link.id} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 bg-green-500 rounded"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-blue-500 truncate mb-1">{link.title}</p>
                  <p className="text-xs text-gray-600">{link.preview}</p>
                </div>
              </div>
            </div>
          ))
        )}
        
        {links.length > 0 && (
          <button className="text-sm text-blue-500 hover:text-blue-600 flex items-center mt-3">
            {t('viewMessages')} <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        )}
      </div>

      {/* Files Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">{t('files')} <span className="text-gray-500">{allFiles.length}</span></h3>
          <button className="text-sm text-blue-500 hover:text-blue-600 flex items-center" onClick={() => setShowFilesModal(true)}>
            {t('seeAll')} <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
        
        {filesLoading ? (
          <div className="text-center p-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse"></div>
            <p className="text-sm text-gray-500">{t('loading')}</p>
          </div>
        ) : filesError ? (
          <div className="text-center p-3 text-red-500 text-sm">
            {filesError}
          </div>
        ) : files.length === 0 ? (
          <div className="text-center p-3 text-gray-500 text-sm">
            {t('noFiles')}
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <div className="w-6 h-6 bg-gray-400 rounded"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{file.size} • {file.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Media Modal */}
      {showMediaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowMediaModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowLinksModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('allLinks')} ({allLinks.length})</h3>
            <div className="space-y-4">
              {allLinks.map((link) => (
                <div 
                  key={link.id} 
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-all duration-200"
                  onClick={() => {
                    console.log(`Navigating to message for link: ${link.title}`);
                    setSelectedMessage({
                      title: link.title,
                      content: link.preview || t('messageContentUnavailable')
                    });
                    setShowMessageModal(true);
                    setShowLinksModal(false);
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="w-6 h-6 bg-green-500 rounded"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-blue-500 truncate mb-1">{link.title}</p>
                      <p className="text-xs text-gray-600">{link.preview}</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowFilesModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('allFiles')} ({allFiles.length})</h3>
            <div className="space-y-3">
              {allFiles.map((file) => (
                <div key={file.id} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="w-6 h-6 bg-gray-400 rounded"></div>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowMessageModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('associatedMessage')}</h3>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-blue-500 mb-2 truncate">{selectedMessage.title}</p>
              <p className="text-sm text-gray-800">{selectedMessage.content}</p>
              <p className="text-xs text-gray-500 mt-2">{t('sentOnDateUnavailable')}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
              >
                {t('close')}
              </button>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setShowLinksModal(true);
                }}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                {t('returnToLinks')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
