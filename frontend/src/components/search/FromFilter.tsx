import React, { useState, useRef, useEffect } from 'react';
import type { UserSearchResult } from '../../types/search';

interface FromFilterProps {
  selectedUser: string | null;
  onSelect: (userId: string | null, username: string | null) => void;
  users: UserSearchResult[];
  currentUserId?: string;
}

export const FromFilter: React.FC<FromFilterProps> = ({
  selectedUser,
  onSelect,
  users,
  currentUserId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const filteredUsers = users.filter((user) => {
    const username = user.username?.toLowerCase() || '';
    const email = user.email?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return username.includes(query) || email.includes(query);
  });

  // Separate current user for "Recent" section
  const currentUser = currentUserId ? filteredUsers.find(u => u._id === currentUserId) : null;
  const otherUsers = filteredUsers.filter(u => u._id !== currentUserId);

  const handleSelect = (userId: string, username: string) => {
    onSelect(userId, username);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getDisplayText = () => {
    if (!selectedUser) return 'From';
    const user = users.find(u => u._id === selectedUser);
    return user ? `@${user.username}` : 'From';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded text-sm flex items-center gap-1 ${
          selectedUser
            ? 'bg-[#1164a3] text-white hover:bg-[#0d4f8a]'
            : 'bg-[#2c2d30] hover:bg-[#3f3f3f]'
        }`}
      >
        {getDisplayText()}
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-[500px] bg-[#1a1d21] border border-[#3f3f3f] rounded-lg shadow-2xl z-50">
          {/* Search Input */}
          <div className="p-4">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#d1d2d3]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ex. Zoe Maxwell"
                className="w-full bg-transparent text-white placeholder-[#d1d2d3] pl-10 pr-4 py-2.5 rounded border-2 border-[#1164a3] focus:outline-none text-[15px]"
              />
            </div>
          </div>

          {/* Recent / Suggestions */}
          <div className="max-h-[400px] overflow-y-auto">
            {currentUser && searchQuery === '' && (
              <>
                <div className="px-4 py-2 text-xs text-[#d1d2d3]">Recent</div>
                <button
                  onClick={() => handleSelect(currentUser._id, currentUser.username || '')}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                    selectedUser === currentUser._id ? 'bg-[#1164a3]' : 'hover:bg-[#1164a3]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedUser === currentUser._id}
                    onChange={() => {}}
                    className="w-4 h-4 rounded"
                  />
                  <div className="w-8 h-8 bg-[#e01e5a] rounded flex items-center justify-center text-white font-semibold text-sm">
                    {currentUser.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium">
                      {currentUser.username} <span className="text-[#d1d2d3]">(you)</span>
                    </div>
                  </div>
                </button>
              </>
            )}

            {otherUsers.length > 0 && (
              <>
                <div className="px-4 py-2 text-xs text-[#d1d2d3]">
                  {searchQuery ? 'Suggestions' : 'All Users'}
                </div>
                {otherUsers.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleSelect(user._id, user.username || '')}
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                      selectedUser === user._id ? 'bg-[#1164a3]' : 'hover:bg-[#1164a3]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUser === user._id}
                      onChange={() => {}}
                      className="w-4 h-4 rounded"
                    />
                    <div className="w-8 h-8 bg-[#1164a3] rounded flex items-center justify-center text-white font-semibold text-sm">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-white font-medium">{user.username}</div>
                      {user.email && <div className="text-xs text-[#d1d2d3]">{user.email}</div>}
                    </div>
                  </button>
                ))}
              </>
            )}

            {filteredUsers.length === 0 && (
              <div className="px-4 py-6 text-center text-[#d1d2d3]">
                No users found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
