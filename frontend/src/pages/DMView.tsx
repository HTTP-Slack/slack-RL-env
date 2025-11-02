import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext';
import DMList from '../components/chat/DMList';
import DMConversationPane from '../components/chat/DMConversationPane';
import LeftNav from '../components/chat/LeftNav';

const DMView: React.FC = () => {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const { conversations, activeConversation, setActiveConversation, loading } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState('');

  // Set active conversation when conversationId changes
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c._id === conversationId);
      if (conversation) {
        setActiveConversation(conversation);
      }
    } else if (!conversationId) {
      setActiveConversation(null);
    }
  }, [conversationId, conversations, setActiveConversation]);

  // Handle conversation selection
  const handleConversationSelect = (convId: string) => {
    navigate(`/dms/${convId}`);
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;

    // Search by collaborator names
    const collaboratorNames = conv.collaborators
      ?.map(c => c.username?.toLowerCase() || '')
      .join(' ') || '';

    return collaboratorNames.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-[#1a1d21]">
      {/* Left Navigation */}
      <LeftNav workspaceName={localStorage.getItem('selectedWorkspaceName') || undefined} />

      {/* DM List Panel */}
      <div className="w-[420px] border-r border-[#3b2d3e] flex flex-col">
        <DMList
          conversations={filteredConversations}
          activeConversationId={conversationId}
          onConversationSelect={handleConversationSelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={loading}
        />
      </div>

      {/* Conversation Panel */}
      <div className="flex-1 flex flex-col">
        {conversationId && activeConversation ? (
          <DMConversationPane />
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#868686]">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-[#49302c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DMView;
