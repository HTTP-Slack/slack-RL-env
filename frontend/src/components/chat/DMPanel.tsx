import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import type { Conversation } from '../../services/messageApi';

interface DMPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationSelect: (conversation: Conversation) => void;
}

export const DMPanel: React.FC<DMPanelProps> = ({ isOpen, onClose, onConversationSelect }) => {
  const { conversations, users, activeConversation } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  if (!isOpen) return null;

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;

    // Search by collaborator names
    const collaboratorNames = conv.collaborators
      ?.map(c => c.username?.toLowerCase() || '')
      .join(' ') || '';

    return collaboratorNames.includes(searchQuery.toLowerCase());
  });

  // Get users that don't have active conversations
  const usersInConversations = new Set(
    conversations.flatMap((c) =>
      c.collaborators.map((collab) => collab._id)
    )
  );

  const availableUsers = users.filter((user) => !usersInConversations.has(user._id));

  return (
    <div className="w-[420px] h-full bg-gradient-to-b from-[#211125] to-[#180d1b] flex flex-col">
      {/* Header */}
      <div className="h-[49px] min-h-[49px] px-4 flex items-center justify-between shrink-0">
        <h2 className="text-white text-[18px] font-bold">Direct Messages</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center hover:bg-[#ffffff14] rounded transition-colors"
          aria-label="Close DMs panel"
        >
          <svg className="w-5 h-5 text-[#d1d2d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#868686]"
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
            type="text"
            placeholder="Search direct messages"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#0d0d0d] text-[#d1d2d3] text-sm border border-[#545454] rounded focus:outline-none focus:border-[#1164A3]"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        
        
        {filteredConversations.length === 0 && searchQuery ? (
          <div className="px-4 py-8 text-center text-[#868686]">
            <p>No conversations found</p>
          </div>
        ) : (
          <>
            {/* Active Conversations */}
            {filteredConversations.map((conversation) => {
              const otherUser = conversation.collaborators.find((c) => {
                const collabId = typeof c === 'string' ? c : c?._id;
                return collabId !== currentUser?._id;
              });

              if (!otherUser || typeof otherUser === 'string') {
                return null;
              }

              const isActive = activeConversation?._id === conversation._id;

              return (
                <button
                  key={conversation._id}
                  onClick={() => onConversationSelect(conversation)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#302234] transition-colors border-b border-[#ffffff0a] ${
                    isActive ? 'bg-[#312234]' : ''
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded bg-[#522653] flex items-center justify-center text-white text-base font-semibold">
                      {otherUser.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1d21]"></div>
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] text-[#d1d2d3] font-medium truncate">
                        {otherUser.username || 'Unknown User'}
                      </span>
                    </div>
                    <span className="text-sm text-[#868686] truncate block mt-0.5">
                      Click to open conversation
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Available Users */}
            {!searchQuery && availableUsers.length > 0 && (
              <>
                <div className="px-4 py-2 mt-4">
                  <span className="text-xs text-[#868686] font-semibold uppercase">People</span>
                </div>
                {availableUsers.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => {
                      // Create a temporary conversation object
                      const tempConversation: Conversation = {
                        _id: `new-${user._id}`,
                        collaborators: [currentUser!, user],
                        organisation: '',
                        name: '',
                        isConversation: true,
                        createdBy: currentUser._id,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      };
                      onConversationSelect(tempConversation);
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#302234] transition-colors"
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded bg-[#522653] flex items-center justify-center text-white text-base font-semibold">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1d21]"></div>
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <span className="text-[15px] text-[#d1d2d3] font-medium truncate block">
                        {user.username || 'Unknown User'}
                      </span>
                      <span className="text-sm text-[#868686] truncate block">
                        {user.email}
                      </span>
                    </div>
                  </button>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
