import { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface InterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
}

const availableInterests = [
  'voyages', 'cuisine', 'lecture', 'cinema', 'sport', 'musique', 'art', 'photographie',
  'technologie', 'gaming', 'nature', 'danse', 'mode', 'fitness', 'yoga', 'meditation',
  'sciences', 'histoire', 'langues', 'ecriture', 'jardinage', 'bricolage', 'animaux',
  'benevolat', 'entrepreneuriat', 'finance', 'politique', 'philosophie', 'spiritualite'
];

export function InterestsModal({ isOpen, onClose, selectedInterests, onInterestsChange }: InterestsModalProps) {
  const [customInterest, setCustomInterest] = useState('');

  const { t } = useLanguage();

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      onInterestsChange(selectedInterests.filter(i => i !== interest));
    } else {
      onInterestsChange([...selectedInterests, interest]);
    }
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      onInterestsChange([...selectedInterests, customInterest.trim()]);
      setCustomInterest('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">{t('interests')}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={t('close')}
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {/* Custom Interest Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('addCustomInterest')}
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomInterest()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={t('customInterest')}
              />
              <button
                onClick={addCustomInterest}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                title={t('add')}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interest Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableInterests.map((interest) => (
              <button
                key={interest}
                onClick={() => toggleInterest(interest)}
                className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                  selectedInterests.includes(interest)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                }`}
              >
                {t(interest)}
              </button>
            ))}
          </div>

          {/* Selected Custom Interests */}
          {selectedInterests.filter(i => !availableInterests.includes(i)).length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">{t('customInterests')}</h3>
              <div className="flex flex-wrap gap-2">
                {selectedInterests
                  .filter(i => !availableInterests.includes(i))
                  .map((interest) => (
                    <div
                      key={interest}
                      className="flex items-center space-x-2 bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full text-sm"
                    >
                      <span>{interest}</span>
                        <button
                          onClick={() => toggleInterest(interest)}
                          className="hover:bg-green-200 rounded-full p-1"
                          title={t('remove')}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedInterests.length} {t('selectedInterests')}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('done')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
