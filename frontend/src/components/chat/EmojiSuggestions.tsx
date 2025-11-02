import React, { useEffect, useRef } from 'react';

interface EmojiSuggestionsProps {
  searchTerm: string;
  onSelect: (emojiCode: string) => void;
  position: { bottom: number; left: number };
  selectedIndex: number;
}

// Common emoji suggestions (subset of the full map for quick access)
const commonEmojis: Array<{ code: string; emoji: string; description: string }> = [
  { code: 'smile', emoji: '😊', description: 'Smiling face' },
  { code: 'smiley', emoji: '😃', description: 'Grinning face' },
  { code: 'grin', emoji: '😁', description: 'Beaming face' },
  { code: 'laughing', emoji: '😆', description: 'Laughing' },
  { code: 'joy', emoji: '😂', description: 'Face with tears of joy' },
  { code: 'rofl', emoji: '🤣', description: 'Rolling on the floor laughing' },
  { code: 'wink', emoji: '😉', description: 'Winking face' },
  { code: 'heart_eyes', emoji: '😍', description: 'Heart eyes' },
  { code: 'kissing_heart', emoji: '😘', description: 'Kissing heart' },
  { code: 'thinking', emoji: '🤔', description: 'Thinking face' },
  { code: 'sunglasses', emoji: '😎', description: 'Sunglasses' },
  { code: 'angry', emoji: '😠', description: 'Angry face' },
  { code: 'cry', emoji: '😢', description: 'Crying face' },
  { code: 'sob', emoji: '😭', description: 'Loudly crying' },
  { code: 'confused', emoji: '😕', description: 'Confused face' },
  { code: 'tired_face', emoji: '😫', description: 'Tired face' },
  { code: 'sleeping', emoji: '😴', description: 'Sleeping face' },
  { code: 'mask', emoji: '😷', description: 'Face with medical mask' },
  { code: 'clown_face', emoji: '🤡', description: 'Clown face' },
  { code: 'wave', emoji: '👋', description: 'Waving hand' },
  { code: 'raised_hand', emoji: '✋', description: 'Raised hand' },
  { code: 'ok_hand', emoji: '👌', description: 'OK hand' },
  { code: 'v', emoji: '✌️', description: 'Victory hand' },
  { code: '+1', emoji: '👍', description: 'Thumbs up' },
  { code: 'thumbsup', emoji: '👍', description: 'Thumbs up' },
  { code: '-1', emoji: '👎', description: 'Thumbs down' },
  { code: 'thumbsdown', emoji: '👎', description: 'Thumbs down' },
  { code: 'fist', emoji: '✊', description: 'Raised fist' },
  { code: 'punch', emoji: '👊', description: 'Oncoming fist' },
  { code: 'clap', emoji: '👏', description: 'Clapping hands' },
  { code: 'raised_hands', emoji: '🙌', description: 'Raising hands' },
  { code: 'pray', emoji: '🙏', description: 'Folded hands' },
  { code: 'muscle', emoji: '💪', description: 'Flexed biceps' },
  { code: 'heart', emoji: '❤️', description: 'Red heart' },
  { code: 'orange_heart', emoji: '🧡', description: 'Orange heart' },
  { code: 'yellow_heart', emoji: '💛', description: 'Yellow heart' },
  { code: 'green_heart', emoji: '💚', description: 'Green heart' },
  { code: 'blue_heart', emoji: '💙', description: 'Blue heart' },
  { code: 'purple_heart', emoji: '💜', description: 'Purple heart' },
  { code: 'broken_heart', emoji: '💔', description: 'Broken heart' },
  { code: 'star', emoji: '⭐', description: 'Star' },
  { code: 'sparkles', emoji: '✨', description: 'Sparkles' },
  { code: 'zap', emoji: '⚡', description: 'Lightning' },
  { code: 'fire', emoji: '🔥', description: 'Fire' },
  { code: 'rainbow', emoji: '🌈', description: 'Rainbow' },
  { code: 'sunny', emoji: '☀️', description: 'Sun' },
  { code: 'cloud', emoji: '☁️', description: 'Cloud' },
  { code: 'snowflake', emoji: '❄️', description: 'Snowflake' },
  { code: 'coffee', emoji: '☕', description: 'Coffee' },
  { code: 'tea', emoji: '🍵', description: 'Tea' },
  { code: 'beer', emoji: '🍺', description: 'Beer' },
  { code: 'wine_glass', emoji: '🍷', description: 'Wine glass' },
  { code: 'cocktail', emoji: '🍸', description: 'Cocktail' },
  { code: 'pizza', emoji: '🍕', description: 'Pizza' },
  { code: 'hamburger', emoji: '🍔', description: 'Hamburger' },
  { code: 'fries', emoji: '🍟', description: 'French fries' },
  { code: 'cake', emoji: '🍰', description: 'Cake' },
  { code: 'birthday', emoji: '🎂', description: 'Birthday cake' },
  { code: 'cookie', emoji: '🍪', description: 'Cookie' },
  { code: 'apple', emoji: '🍎', description: 'Red apple' },
  { code: 'banana', emoji: '🍌', description: 'Banana' },
  { code: 'strawberry', emoji: '🍓', description: 'Strawberry' },
  { code: 'rocket', emoji: '🚀', description: 'Rocket' },
  { code: 'airplane', emoji: '✈️', description: 'Airplane' },
  { code: 'car', emoji: '🚗', description: 'Car' },
  { code: 'bike', emoji: '🚲', description: 'Bicycle' },
  { code: 'computer', emoji: '💻', description: 'Laptop' },
  { code: 'laptop', emoji: '💻', description: 'Laptop' },
  { code: 'iphone', emoji: '📱', description: 'Mobile phone' },
  { code: 'email', emoji: '📧', description: 'Email' },
  { code: 'memo', emoji: '📝', description: 'Memo' },
  { code: 'pencil', emoji: '📝', description: 'Memo' },
  { code: 'book', emoji: '📖', description: 'Book' },
  { code: 'calendar', emoji: '📅', description: 'Calendar' },
  { code: 'clock', emoji: '🕐', description: 'Clock' },
  { code: 'lock', emoji: '🔒', description: 'Locked' },
  { code: 'unlock', emoji: '🔓', description: 'Unlocked' },
  { code: 'key', emoji: '🔑', description: 'Key' },
  { code: 'bulb', emoji: '💡', description: 'Light bulb' },
  { code: 'wrench', emoji: '🔧', description: 'Wrench' },
  { code: 'hammer', emoji: '🔨', description: 'Hammer' },
  { code: 'mag', emoji: '🔍', description: 'Magnifying glass' },
  { code: 'link', emoji: '🔗', description: 'Link' },
  { code: 'white_check_mark', emoji: '✅', description: 'Check mark' },
  { code: 'x', emoji: '❌', description: 'Cross mark' },
  { code: 'warning', emoji: '⚠️', description: 'Warning' },
  { code: 'exclamation', emoji: '❗', description: 'Exclamation' },
  { code: 'question', emoji: '❓', description: 'Question' },
  { code: 'chart_with_upwards_trend', emoji: '📈', description: 'Chart increasing' },
  { code: 'bar_chart', emoji: '📊', description: 'Bar chart' },
  { code: 'money_with_wings', emoji: '💸', description: 'Money with wings' },
  { code: 'moneybag', emoji: '💰', description: 'Money bag' },
  { code: 'trophy', emoji: '🏆', description: 'Trophy' },
  { code: 'medal', emoji: '🏅', description: 'Medal' },
  { code: 'first_place_medal', emoji: '🥇', description: 'First place' },
  { code: 'dart', emoji: '🎯', description: 'Direct hit' },
  { code: 'gift', emoji: '🎁', description: 'Gift' },
  { code: 'balloon', emoji: '🎈', description: 'Balloon' },
  { code: 'tada', emoji: '🎉', description: 'Party popper' },
  { code: 'confetti_ball', emoji: '🎊', description: 'Confetti ball' },
  { code: 'microphone', emoji: '🎤', description: 'Microphone' },
  { code: 'headphones', emoji: '🎧', description: 'Headphones' },
  { code: 'musical_note', emoji: '🎵', description: 'Musical note' },
  { code: 'art', emoji: '🎨', description: 'Artist palette' },
  { code: 'camera', emoji: '📷', description: 'Camera' },
  { code: 'dog', emoji: '🐶', description: 'Dog face' },
  { code: 'cat', emoji: '🐱', description: 'Cat face' },
  { code: 'mouse', emoji: '🐭', description: 'Mouse face' },
  { code: 'rabbit', emoji: '🐰', description: 'Rabbit face' },
  { code: 'fox_face', emoji: '🦊', description: 'Fox face' },
  { code: 'bear', emoji: '🐻', description: 'Bear' },
  { code: 'panda_face', emoji: '🐼', description: 'Panda' },
  { code: 'lion_face', emoji: '🦁', description: 'Lion' },
  { code: 'tiger', emoji: '🐯', description: 'Tiger face' },
  { code: 'monkey_face', emoji: '🐵', description: 'Monkey face' },
  { code: 'see_no_evil', emoji: '🙈', description: 'See-no-evil monkey' },
  { code: 'hear_no_evil', emoji: '🙉', description: 'Hear-no-evil monkey' },
  { code: 'speak_no_evil', emoji: '🙊', description: 'Speak-no-evil monkey' },
  { code: 'penguin', emoji: '🐧', description: 'Penguin' },
  { code: 'bird', emoji: '🐦', description: 'Bird' },
  { code: 'unicorn_face', emoji: '🦄', description: 'Unicorn' },
  { code: 'bee', emoji: '🐝', description: 'Honeybee' },
  { code: 'bug', emoji: '🐛', description: 'Bug' },
  { code: 'butterfly', emoji: '🦋', description: 'Butterfly' },
  { code: 'tree', emoji: '🌲', description: 'Evergreen tree' },
  { code: 'palm_tree', emoji: '🌴', description: 'Palm tree' },
  { code: 'cactus', emoji: '🌵', description: 'Cactus' },
  { code: 'tulip', emoji: '🌷', description: 'Tulip' },
  { code: 'rose', emoji: '🌹', description: 'Rose' },
  { code: 'sunflower', emoji: '🌻', description: 'Sunflower' },
  { code: 'four_leaf_clover', emoji: '🍀', description: 'Four leaf clover' },
  { code: 'mushroom', emoji: '🍄', description: 'Mushroom' },
];

const EmojiSuggestions: React.FC<EmojiSuggestionsProps> = ({
  searchTerm,
  onSelect,
  position,
  selectedIndex,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  // Filter emojis based on search term
  const filteredEmojis = searchTerm
    ? commonEmojis.filter((emoji) =>
        emoji.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emoji.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : commonEmojis.slice(0, 20); // Show first 20 most common if no search

  // Scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current && listRef.current) {
      const listRect = listRef.current.getBoundingClientRect();
      const itemRect = selectedItemRef.current.getBoundingClientRect();
      
      if (itemRect.bottom > listRect.bottom) {
        selectedItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else if (itemRect.top < listRect.top) {
        selectedItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  if (filteredEmojis.length === 0) {
    return null;
  }

  return (
    <div
      ref={listRef}
      className="absolute z-50 bg-[rgb(34,37,41)] border border-[rgb(60,56,54)] rounded-lg shadow-2xl overflow-hidden"
      style={{
        bottom: `${position.bottom}px`,
        left: `${position.left}px`,
        maxHeight: '300px',
        width: '320px',
      }}
    >
      <div className="overflow-y-auto max-h-[300px] py-1">
        {filteredEmojis.map((emoji, index) => (
          <div
            key={emoji.code}
            ref={index === selectedIndex ? selectedItemRef : null}
            onClick={() => onSelect(emoji.code)}
            className={`px-3 py-2 cursor-pointer flex items-center gap-3 ${
              index === selectedIndex
                ? 'bg-[#1164a3] text-white'
                : 'hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]'
            }`}
          >
            <span className="text-[24px] leading-none">{emoji.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-medium truncate">:{emoji.code}:</div>
              <div className="text-[13px] text-[rgb(134,134,134)] truncate">
                {emoji.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-[rgb(60,56,54)] bg-[rgb(26,29,33)] px-3 py-1.5">
        <div className="text-[11px] text-[rgb(134,134,134)] flex items-center justify-between">
          <span>↑↓ navigate • Enter to select • Esc to dismiss</span>
          <span>{filteredEmojis.length} emoji{filteredEmojis.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
};

export default EmojiSuggestions;
