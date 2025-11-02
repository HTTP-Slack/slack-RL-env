import React from 'react';
import DMListItem from './DMListItem';
import type { Conversation } from '../../services/messageApi';

interface DMListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  loading: boolean;
}

const DMList: React.FC<DMListProps> = ({
  conversations,
  activeConversationId,
  onConversationSelect,
  searchQuery,
  onSearchChange,
  loading
}) => {
  return (
    <div className="flex flex-col h-full bg-[#1a1d21]">
      {/* Header */}
      <div className="px-5 py-3 border-b border-[#3b2d3e]">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white text-[22px] font-bold flex items-center gap-2">
            Direct messages
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-[#d1d2d3] text-[13px]">Unreads</span>
            <button className="w-10 h-5 rounded-full bg-[#302234] relative transition-colors">
              <div className="w-4 h-4 rounded-full bg-white absolute left-0.5 top-0.5 transition-transform"></div>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#302234] transition-colors">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg className="w-4 h-4 text-[#868686]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Find a DM"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#1a1d21] border border-[#49302c] rounded px-9 py-1.5 text-[13px] text-white placeholder-[#868686] focus:outline-none focus:border-[#7d3986]"
          />
        </div>
      </div>

      {/* Onboarding Message */}
      <div className="px-5 py-6 border-b border-[#3b2d3e]">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🐳</div>
          <div className="flex-1">
            <p className="text-white text-[15px] mb-3">
              <span className="font-semibold">Slack is better when everyone's here.</span> Add your team and get the conversation started.
            </p>
            <button className="px-4 py-2 border border-[#868686] rounded text-white text-[13px] hover:bg-[#302234] transition-colors">
              Add Coworkers
            </button>
          </div>
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-[#868686] text-[13px]">Loading conversations...</div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-[#868686] text-[13px]">
              {searchQuery ? 'No conversations found' : 'No direct messages yet'}
            </div>
          </div>
        ) : (
          conversations.map((conversation) => (
            <DMListItem
              key={conversation._id}
              conversation={conversation}
              isActive={conversation._id === activeConversationId}
              onClick={() => onConversationSelect(conversation._id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default DMList;
