
import { useState } from 'react';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const emojiCategories = {
  'Émoticônes': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
  'Gestes': ['👍', '👎', '👌', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻'],
  'Cœurs': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '👁️‍🗨️', '🗨️', '🗯️'],
  'Objets': ['📱', '💻', '⌚', '📷', '📹', '🎵', '🎶', '🎤', '🎧', '📻', '🎸', '🎹', '🥁', '🎺', '🎷', '🎻', '🎲', '♠️', '♥️', '♦️', '♣️', '🃏', '🀄', '🎴', '🎭', '🖼️', '🎨', '🧵', '🪡', '🧶', '🪢']
};

export function EmojiPicker({ onEmojiSelect, isOpen, onToggle }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState('Émoticônes');

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 w-80 animate-scale-in">
      {/* Category tabs */}
      <div className="flex border-b border-gray-200 p-2 space-x-1">
        {Object.keys(emojiCategories).map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeCategory === category
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="p-3 max-h-48 overflow-y-auto">
        <div className="grid grid-cols-8 gap-2">
          {emojiCategories[activeCategory as keyof typeof emojiCategories].map((emoji, index) => (
            <button
              key={index}
              onClick={() => onEmojiSelect(emoji)}
              className="text-xl hover:bg-gray-100 rounded-lg p-1 transition-colors hover:scale-110 transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
