
import { useState, useEffect } from 'react';
import { X, Send, Search, User } from 'lucide-react';

interface ShareImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

export function ShareImageModal({ isOpen, onClose, imageUrl, imageName }: ShareImageModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetch('/api/users');
          if (!response.ok) {
            throw new Error('Failed to fetch users');
          }
          const data = await response.json();
          if (data.success) {
            setUsers(data.users || []);
          } else {
            setError(data.message || 'Error fetching users');
          }
        } catch (err) {
          console.error('Error fetching users:', err);
          setError('Failed to load users. Please try again later.');
        } finally {
          setLoading(false);
        }
      };

      fetchUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) {
      alert('Veuillez sélectionner au moins un utilisateur');
      return;
    }

    try {
      const response = await fetch('/api/share-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          imageUrl,
          imageName,
          message: message || '',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to share image');
      }

      const data = await response.json();
      if (data.success) {
        alert(`Image partagée avec ${selectedUsers.length} utilisateur(s)`);
        onClose();
        setSelectedUsers([]);
        setMessage('');
        setSearchQuery('');
      } else {
        alert(data.message || 'Erreur lors du partage de l\'image');
      }
    } catch (err) {
      console.error('Error sharing image:', err);
      alert('Erreur lors du partage de l\'image. Veuillez réessayer plus tard.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-scale-in">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Partager l'image</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fermer la fenêtre de partage"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Image preview */}
          <div className="text-center">
            <img
              src={imageUrl}
              alt={imageName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover mx-auto mb-2"
            />
            <p className="text-sm text-gray-600 truncate">{imageName}</p>
          </div>

          {/* Search users */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              aria-label="Rechercher un utilisateur"
            />
          </div>

          {/* Users list */}
          <div className="max-h-48 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center p-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-2 animate-pulse"></div>
                <p className="text-sm text-gray-500">Chargement des utilisateurs...</p>
              </div>
            ) : error ? (
              <div className="text-center p-3 text-red-500 text-sm">
                {error}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center p-3 text-gray-500 text-sm">
                Aucun utilisateur trouvé
              </div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => toggleUserSelection(user.id)}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    selectedUsers.includes(user.id)
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="relative mr-3 flex-shrink-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    {user.online && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{user.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {user.online ? 'En ligne' : 'Hors ligne'}
                    </p>
                  </div>
                  {selectedUsers.includes(user.id) && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Message optionnel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (optionnel)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              aria-label="Ajouter un message"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedUsers.length} utilisateur(s) sélectionné(s)
            </p>
            <button
              onClick={handleShare}
              disabled={selectedUsers.length === 0}
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 text-sm sm:text-base"
            >
              <Send className="w-4 h-4" />
              <span>Partager</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
