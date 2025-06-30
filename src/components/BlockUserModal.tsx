import { useState } from 'react';
import { X, UserX, UserCheck } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  isBlocked: boolean;
  onToggleBlock: (userId: string, block: boolean) => void;
  userId: string;
}

export function BlockUserModal({ isOpen, onClose, userName, isBlocked, onToggleBlock, userId }: BlockUserModalProps) {
  const { t } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleToggleBlock = async () => {
    setIsProcessing(true);
    try {
      await onToggleBlock(userId, !isBlocked);
      onClose();
    } catch (error) {
      console.error('Erreur lors du blocage/déblocage:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isBlocked ? t('unblockUser') : t('blockUser')} {userName}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t('close')}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600">
            {isBlocked 
              ? t('confirmUnblock').replace('%s', userName)
              : t('confirmBlock').replace('%s', userName)
            }
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleToggleBlock}
            disabled={isProcessing}
            className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors flex items-center justify-center space-x-2 ${
              isBlocked 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-red-500 hover:bg-red-600'
            } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isBlocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
            <span>{isProcessing ? t('processing') : (isBlocked ? t('unblockUser') : t('blockUser'))}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
