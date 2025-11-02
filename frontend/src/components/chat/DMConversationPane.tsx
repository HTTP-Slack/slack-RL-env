import React, { useState } from 'react';
import ChatPane from './ChatPane';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';

const DMConversationPane: React.FC = () => {
  const { activeConversation, messages, sendMessage } = useWorkspace();
  const { user } = useAuth();
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  console.log('🎨 DMConversationPane: Rendering');
  console.log('💬 Active conversation:', activeConversation?._id);
  console.log('📨 Total messages:', messages.length);

  if (!activeConversation || !user) {
    console.log('⚠️ DMConversationPane: Missing activeConversation or user');
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
  console.log('💬 Filtered conversation messages:', conversationMessages.length);

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
    console.error('❌ DMConversationPane: No activeUser found');
    return (
      <div className="flex-1 flex items-center justify-center text-[#868686]">
        <p>User not found</p>
      </div>
    );
  }

  console.log('✅ DMConversationPane: Ready to render with', conversationMessages.length, 'messages');

  // Just render ChatPane directly like Dashboard does
  // ChatPane has its own headers and layout
  return (
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
  );
};

export default DMConversationPane;
