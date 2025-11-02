import React from 'react';
import type { User, Conversation } from '../../services/messageApi';

interface SidebarProps {
  currentUser: User;
  conversations: Conversation[];
  users: User[];
  activeConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  onUserSelect: (userId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentUser, 
  conversations, 
  users, 
  activeConversation, 
  onConversationSelect, 
  onUserSelect 
}) => {
  console.log('🔍 Sidebar render - Users:', users.length, users);
  console.log('🔍 Sidebar render - Conversations:', conversations.length, conversations);
  
  return (
    <div className="w-[350px] bg-gradient-to-b from-[#211125] to-[#180d1b] flex flex-col border-r border-[#3b2d3e]">
      {/* Sidebar Header */}
      <div className="h-[60px] px-4 flex items-center border-b border-[#3b2d3e] shrink-0">
        <div className="flex items-center flex-1 min-w-0">
          <div className="w-8 h-8 rounded bg-[#522653] flex items-center justify-center text-white font-bold text-sm mr-3 shrink-0">
            {currentUser.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="text-[15px] font-semibold text-white truncate">
            {currentUser.username || 'User'}
          </span>
        </div>
      </div>

      {/* Channels and Direct Messages */}
      <div className="flex-1 overflow-y-auto">
        {/* Channels Section */}
        <div className="px-3 py-2">
          <button className="w-full flex items-center justify-between px-2 py-1 hover:bg-[#302234] rounded transition-colors group">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-[#d1d2d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-[15px] font-semibold text-[#d1d2d3]">Channels</span>
            </div>
          </button>
          <div role="tree" aria-label="Channels" className="mt-1">
            <button className="w-full px-2 py-1 rounded flex items-center group hover:bg-[#302234] transition-colors">
              <span className="text-[#d1d2d3] mr-2">#</span>
              <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">general</span>
            </button>
            <button className="w-full px-2 py-1.5 rounded flex items-center group hover:bg-[#302234] transition-colors mt-1">
              <svg className="w-4 h-4 text-[#d1d2d3] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">Add channels</span>
            </button>
          </div>
        </div>

        {/* Direct Messages Section */}
        <div className="px-3 py-2 mt-4">
          <button className="w-full flex items-center justify-between px-2 py-1 hover:bg-[#302234] rounded transition-colors group">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-[#d1d2d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-[15px] font-semibold text-[#d1d2d3]">Direct messages</span>
            </div>
          </button>
          <div role="tree" aria-label="Direct messages" className="mt-1">
            {/* Existing conversations */}
            {conversations.map((conversation) => {
              // Safety check: ensure collaborators is an array of User objects
              if (!conversation.collaborators || !Array.isArray(conversation.collaborators)) {
                console.warn('⚠️ Conversation missing collaborators array:', conversation._id);
                return null;
              }
              
              const otherUser = conversation.collaborators.find((c) => {
                // Handle both populated and unpopulated collaborators
                const collabId = typeof c === 'string' ? c : c?._id;
                return collabId !== currentUser._id;
              });
              
              if (!otherUser) {
                console.warn('⚠️ Could not find other user in conversation:', conversation._id);
                return null;
              }
              
              // If otherUser is just a string (ID), skip rendering or show placeholder
              if (typeof otherUser === 'string') {
                console.warn('⚠️ Collaborator not populated in conversation:', conversation._id, 'collabId:', otherUser);
                return null; // Don't show unpopulated conversations
              }
              
              const isActive = activeConversation?._id === conversation._id;
              
              return (
                <button
                  key={conversation._id}
                  onClick={() => onConversationSelect(conversation)}
                  className={`w-full px-2 py-1.5 rounded flex items-center group hover:bg-[#302234] transition-colors ${
                    isActive ? 'bg-[#7d3986]' : ''
                  }`}
                >
                  <div className="relative mr-2 shrink-0">
                    <div className="w-5 h-5 rounded bg-[#522653] flex items-center justify-center text-white text-[10px] font-semibold">
                      {otherUser.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">
                    {otherUser.username || 'Unknown User'}
                  </span>
                </button>
              );
            })}
            
            {/* Available users to start conversations with */}
            {(() => {
              // Create a Set of user IDs that are already in conversations for O(n) lookup
              const usersInConversations = new Set(
                conversations.flatMap(c => 
                  c.collaborators.map(collab => collab._id)
                )
              );
              
              return users.filter(user => !usersInConversations.has(user._id)).map((user) => (
                <button
                  key={user._id}
                  onClick={() => onUserSelect(user._id)}
                  className="w-full px-2 py-1.5 rounded flex items-center group hover:bg-[#302234] transition-colors"
                >
                  <div className="relative mr-2 shrink-0">
                    <div className="w-5 h-5 rounded bg-[#522653] flex items-center justify-center text-white text-[10px] font-semibold">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">
                    {user.username || 'Unknown User'}
                  </span>
                </button>
              ));
            })()}
            
            <button className="w-full px-2 py-1.5 rounded flex items-center group hover:bg-[#302234] transition-colors mt-1">
              <svg className="w-4 h-4 text-[#d1d2d3] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">Invite people</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

