import React, { useEffect, useRef } from 'react';

interface User {
  _id: string;
  username: string;
  email?: string;
  avatar?: string;
}

interface MentionSuggestionsProps {
  users: User[];
  searchTerm: string;
  selectedIndex: number;
  position: { bottom: number; left: number };
  onSelect: (username: string) => void;
  onClose: () => void;
}

const MentionSuggestions: React.FC<MentionSuggestionsProps> = ({
  users,
  searchTerm,
  selectedIndex,
  position,
  onSelect,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add special mentions at the top
  const specialMentions = [
    { _id: 'channel', username: 'channel', displayName: 'Notify everyone in the channel' },
    { _id: 'here', username: 'here', displayName: 'Notify active members' },
    { _id: 'everyone', username: 'everyone', displayName: 'Notify all workspace members' },
  ].filter(mention =>
    mention.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allSuggestions = [...specialMentions, ...filteredUsers];

  // Scroll selected item into view
  useEffect(() => {
    if (menuRef.current) {
      const selectedElement = menuRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (allSuggestions.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 bg-[#1a1d21] border border-[#545454] rounded shadow-lg overflow-y-auto"
      style={{
        bottom: `${position.bottom}px`,
        left: `${position.left}px`,
        maxHeight: '300px',
        minWidth: '280px',
      }}
    >
      {allSuggestions.map((suggestion, index) => {
        const isSpecial = ['channel', 'here', 'everyone'].includes(suggestion.username);
        const isSelected = index === selectedIndex;

        return (
          <button
            key={suggestion._id}
            className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors ${
              isSelected ? 'bg-[#1164A3]' : 'hover:bg-[#1164A3] hover:bg-opacity-50'
            }`}
            onClick={() => onSelect(suggestion.username)}
            onMouseEnter={() => {
              // Mouse hover handled by CSS
            }}
          >
            {/* Avatar or Icon */}
            {isSpecial ? (
              <div className="w-8 h-8 flex items-center justify-center bg-[#ffc107] rounded">
                <span className="text-[18px] font-bold text-white">@</span>
              </div>
            ) : (
              <div className="w-8 h-8 flex items-center justify-center bg-[#1164A3] rounded">
                <span className="text-[14px] font-medium text-white">
                  {suggestion.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Username and description */}
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-medium text-white">
                {isSpecial && '@'}{suggestion.username}
              </div>
              {isSpecial ? (
                <div className="text-[13px] text-[#ababad]">
                  {(suggestion as any).displayName}
                </div>
              ) : (
                ('email' in suggestion && suggestion.email) && (
                  <div className="text-[13px] text-[#ababad] truncate">
                    {suggestion.email}
                  </div>
                )
              )}
            </div>

            {/* Keyboard shortcut hint for selected */}
            {isSelected && (
              <div className="text-[12px] text-[#ababad]">
                ↵
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default MentionSuggestions;
