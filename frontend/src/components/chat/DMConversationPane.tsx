import React, { useState } from 'react';
import ChatPane from './ChatPane';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';

const DMConversationPane: React.FC = () => {
  const { activeConversation, messages, sendMessage } = useWorkspace();
  const { user } = useAuth();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  if (!activeConversation || !user) {
    return null;
  }

  // Get the other user in the conversation
  const otherUser = activeConversation.collaborators?.find(c => c._id !== user._id);

  // Get display name for header
  const displayName = activeConversation.isSelf
    ? `${user.username || 'You'} (you)`
    : otherUser?.username || 'Unknown User';

  // Filter messages for this conversation
  const conversationMessages = messages.filter(m => m.conversation === activeConversation._id);

  // Handlers
  const handleSendMessage = async (text: string, attachments?: string[]) => {
    await sendMessage(text, attachments);
  };

  const handleEditMessage = (messageId: string, newText: string) => {
    // TODO: Implement edit message
    console.log('Edit message:', messageId, newText);
    setEditingMessageId(null);
  };

  const handleDeleteMessage = (messageId: string) => {
    // TODO: Implement delete message
    console.log('Delete message:', messageId);
  };

  const handleOpenThread = (messageId: string) => {
    // TODO: Implement open thread
    console.log('Open thread:', messageId);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    // TODO: Implement reaction
    console.log('Add reaction:', messageId, emoji);
  };

  // For self-conversations, use the current user as activeUser
  const activeUser = activeConversation.isSelf ? user : otherUser;

  if (!activeUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#868686]">
        <p>User not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#1a1d21]">
      {/* Custom DM Header */}
      <div className="h-[60px] border-b border-[#3b2d3e] px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-white text-[18px] font-bold">{displayName}</h2>
          {otherUser?.isOnline && (
            <span className="flex items-center gap-1 text-[#868686] text-[13px]">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Header actions */}
          <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#302234] transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#302234] transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Reuse existing ChatPane for messages */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatPane
          currentUser={user}
          activeUser={activeUser}
          messages={conversationMessages}
          threads={{}}
          editingMessageId={editingMessageId}
          conversationId={activeConversation._id}
          onSendMessage={handleSendMessage}
          onEditMessage={handleEditMessage}
          onDeleteMessage={handleDeleteMessage}
          onOpenThread={handleOpenThread}
          onReaction={handleReaction}
        />
      </div>
    </div>
  );
};

export default DMConversationPane;
