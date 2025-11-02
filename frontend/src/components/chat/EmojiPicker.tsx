import React, { useState } from 'react';

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_CATEGORIES = {
  'Frequently Used': ['👍', '❤️', '😂', '😊', '🎉', '🔥', '👀', '✅', '⭐', '💯'],
  'Smileys & People': [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
    '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
    '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺',
    '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
    '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '👍',
    '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌',
  ],
  'Animals & Nature': [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
    '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
    '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋',
    '🐌', '🐞', '🐜', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🦖',
    '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬',
    '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘',
    '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎',
    '🌸', '🌺', '🌻', '🌹', '🌷', '💐', '🌾', '🌿', '☘️', '🍀',
  ],
  'Food & Drink': [
    '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑',
    '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒',
    '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞',
    '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩',
    '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮',
    '🌯', '🥗', '🥘', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟',
    '☕', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃',
  ],
  'Activities': [
    '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
    '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🏹', '🎣',
    '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂',
    '🏋️', '🤸', '🤼', '🤽', '🤾', '🤹', '🧘', '🎪', '🎭', '🎨',
    '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕',
    '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩', '🎉', '🎊',
  ],
  'Travel & Places': [
    '🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐',
    '🚚', '🚛', '🚜', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔',
    '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝',
    '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫',
    '🛬', '🛩️', '💺', '🚁', '🛰️', '🚀', '🛸', '🚢', '⛵', '🛥️',
    '⛴️', '🛳️', '⚓', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛲',
  ],
  'Objects': [
    '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️',
    '🗜️', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️',
    '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️', '🎛️',
    '🧭', '⏰', '⏱️', '⏲️', '⏳', '💡', '🔦', '🕯️', '🪔', '🧯',
    '🛢️', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '🔨', '🪓',
    '⚒️', '🛠️', '⛏️', '🔧', '🔩', '⚙️', '🗜️', '⚖️', '🦯', '🔗',
  ],
  'Symbols': [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
    '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
    '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
    '✅', '☑️', '✔️', '✖️', '❌', '❎', '➕', '➖', '➗', '➰',
    '⭐', '🌟', '✨', '⚡', '💥', '💫', '💦', '💨', '🔥', '💯',
  ],
};

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelectEmoji, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string>('Frequently Used');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = Object.keys(EMOJI_CATEGORIES);

  const handleEmojiClick = (emoji: string) => {
    onSelectEmoji(emoji);
    onClose();
  };

  const filteredEmojis = searchQuery
    ? Object.values(EMOJI_CATEGORIES).flat().filter(emoji => emoji.includes(searchQuery))
    : EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES];

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Emoji Picker Modal */}
      <div className="fixed right-4 bottom-20 w-[420px] bg-[rgb(34,37,41)] rounded-lg shadow-2xl border border-[rgb(82,82,82)] z-50 overflow-hidden">
        {/* Header */}
        <div className="bg-[rgb(34,37,41)] border-b border-[rgb(82,82,82)]">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">😀</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all emoji"
                className="flex-1 px-3 py-1.5 text-sm bg-[rgb(26,29,33)] text-white border border-[rgb(82,82,82)] rounded focus:outline-none focus:border-[rgb(29,155,209)] focus:ring-1 focus:ring-[rgb(29,155,209)] placeholder-gray-400"
                style={{ width: '280px' }}
                autoFocus
              />
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors ml-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex items-center gap-2 px-4 py-2 bg-[rgb(26,29,33)] border-b border-[rgb(82,82,82)] overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-2 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
                activeCategory === category
                  ? 'bg-[rgb(34,37,41)] text-white shadow-sm border border-[rgb(82,82,82)]'
                  : 'text-gray-400 hover:bg-[rgb(34,37,41)] hover:text-white hover:shadow-sm'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Emoji Grid */}
      <div className="p-3 h-[400px] overflow-y-auto bg-[rgb(34,37,41)]">
        <div className="grid grid-cols-9 gap-1">
          {filteredEmojis.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              onClick={() => handleEmojiClick(emoji)}
              className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-[rgb(29,155,209)] hover:bg-opacity-20 rounded transition-colors"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
        {filteredEmojis.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            No emoji found
          </div>
        )}
      </div>
      
      {/* Footer with Add Emoji and Skin Tone */}
      <div className="flex items-center justify-between px-4 py-2 bg-[rgb(34,37,41)] border-t border-[rgb(82,82,82)]">
        <button className="flex items-center gap-2 text-sm text-gray-300 hover:text-[rgb(29,155,209)] transition-colors">
          <span className="text-lg">➕</span>
          <span>Add Emoji</span>
        </button>
        <button className="flex items-center gap-2 text-sm text-gray-300 hover:text-[rgb(29,155,209)] transition-colors">
          <span className="text-lg">👍</span>
          <span>Skin Tone</span>
        </button>
      </div>
    </div>
    </>
  );
};

export default EmojiPicker;
