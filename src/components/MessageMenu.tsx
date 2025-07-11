import React from 'react';
import { Trash2, Star, MoreVertical } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface MessageMenuProps {
  messageId: string;
  isSender: boolean;
  isFavorite: boolean;
  onDelete: (messageId: string) => void;
  onToggleFavorite: (messageId: string) => void;
}

export function MessageMenu({ messageId, isSender, isFavorite, onDelete, onToggleFavorite }: MessageMenuProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(messageId);
    setIsOpen(false);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(messageId);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        title={t('moreOptions')}
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute z-50 right-0 mt-1 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
          {isSender && (
            <button
              title={t('deleteMessage')}
              onClick={handleDelete}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <Trash2 size={16} className="mr-2" />
              {t('deleteMessage')}
            </button>
          )}
          <button
            title={t('markAsFavorite')}
            onClick={handleToggleFavorite}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Star
              size={16}
              className={`mr-2 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`}
            />
            {isFavorite ? t('removeFromFavorites') : t('addToFavorites')}
          </button>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
