import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LeftNav from '../components/chat/LeftNav';
import Sidebar from '../components/chat/Sidebar';
import ChatPane from '../components/chat/ChatPane';
import ChannelChatPane from '../components/chat/ChannelChatPane';
import ThreadPanel from '../components/chat/ThreadPanel';
import { PreferencesModal } from '../features/preferences/PreferencesModal';
import { ProfilePanel } from '../features/profile/ProfilePanel';
import { UserProfileModal } from '../features/profile/UserProfileModal';
import { useProfile } from '../features/profile/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { getWorkspaces } from '../services/workspaceApi';
import { getChannel } from '../services/channelApi';
import { getMessages } from '../services/messageApi';
import type { Workspace } from '../types/workspace';
import type { IChannel } from '../types/channel';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { selectedUser } = useProfile();
  const {
    currentWorkspaceId,
    setCurrentWorkspaceId,
    conversations,
    users,
    activeConversation,
    setActiveConversation,
    messages,
    sendMessage,
    startConversation,
    socket,
  } = useWorkspace();
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<any | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [activeChannel, setActiveChannel] = useState<IChannel | null>(null);
  const [channelMessages, setChannelMessages] = useState<any[]>([]);

  // Initialize workspace from URL or fetch workspaces
  useEffect(() => {
    const initWorkspace = async () => {
      const workspaceIdFromUrl = searchParams.get('workspace');
      
      // Fetch workspaces
      console.log('🔍 Fetching workspaces...');
      const workspaces = await getWorkspaces();
      console.log('📦 Found workspaces:', workspaces.length);
      
      if (workspaceIdFromUrl) {
        console.log('🏢 Setting workspace from URL:', workspaceIdFromUrl);
        setCurrentWorkspaceId(workspaceIdFromUrl);
        // Find and set the current workspace details
        const workspace = workspaces.find(w => w._id === workspaceIdFromUrl);
        if (workspace) {
          setCurrentWorkspace(workspace);
        }
      } else {
        // Select the first workspace
        if (workspaces.length > 0) {
          setCurrentWorkspaceId(workspaces[0]._id);
          setCurrentWorkspace(workspaces[0]);
          navigate(`/dashboard?workspace=${workspaces[0]._id}`, { replace: true });
        } else {
          // No workspaces found, redirect to create one
          console.log('⚠️ No workspaces found, redirecting to create...');
          navigate('/create-workspace');
        }
      }
    };

    if (user) {
      initWorkspace();
    }
  }, [user, searchParams]);

  const handleUserSelect = async (userId: string) => {
    // Check if conversation already exists
    const existingConversation = conversations.find(
      (c) => c.collaborators.some((collab) => collab._id === userId)
    );

    if (existingConversation) {
      setActiveConversation(existingConversation);
    } else {
      // Create new conversation
      await startConversation(userId);
    }
  };

  const handleSendMessage = async (text: string, attachments?: string[]) => {
    if (!activeConversation) return;
    await sendMessage(text, attachments);
  };

  const handleEditMessage = (messageId: string, newText: string) => {
    console.log('Edit message:', messageId, newText);
    if (!socket || !user) return;
    
    socket.emit('edit-message', {
      messageId,
      newContent: newText,
      isThread: false,
    });
    setEditingMessageId(null);
  };

  const handleDeleteMessage = (messageId: string) => {
    console.log('Delete message:', messageId);
    if (!socket || !user) return;
    
    socket.emit('delete-message', {
      messageId,
      isThread: false,
    });
  };

  const handleOpenThread = (messageId: string) => {
    console.log('Open thread for message:', messageId);
    // Check if we're in a channel or conversation
    const messagesToSearch = activeChannel ? channelMessages : messages;
    const message = messagesToSearch.find((m) => m._id === messageId);
    if (message) {
      setActiveThread(message);
    }
  };

  const handleCloseThread = () => {
    setActiveThread(null);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    // TODO: Implement reaction API via socket
    console.log('Add reaction:', emoji, 'to message:', messageId);
    if (!socket || !user) return;
    
    socket.emit('reaction', {
      emoji,
      id: messageId,
      isThread: false,
      userId: user._id,
    });
  };

  const handleChannelSelect = async (channelId: string) => {
    console.log('Channel selected:', channelId);
    try {
      const channelData = await getChannel(channelId);
      setActiveChannel(channelData.data);
      setActiveConversation(null); // Clear conversation when selecting channel
      setChannelMessages([]); // Clear previous messages
      
      // Join the channel room and open it
      if (socket && currentWorkspaceId && user) {
        socket.emit('channel-open', { 
          id: channelId,
          userId: user._id 
        });
        
        // Fetch channel messages via REST API
        const messages = await getMessages({
          channelId,
          organisation: currentWorkspaceId,
        });
        console.log('📥 Fetched channel messages:', messages.length);
        setChannelMessages(messages);
      }
    } catch (error) {
      console.error('Failed to load channel:', error);
    }
  };

  const handleRefreshChannel = async () => {
    if (activeChannel) {
      try {
        const channelData = await getChannel(activeChannel._id);
        setActiveChannel(channelData.data);
      } catch (error) {
        console.error('Failed to refresh channel:', error);
      }
    }
  };

  const handleSendChannelMessage = async (text: string, attachments?: string[]) => {
    if (!activeChannel || !socket || !user || !currentWorkspaceId) return;
    
    const messageData = {
      sender: user._id,
      content: text,
      attachments: attachments || [],
    };

    // Get list of users who haven't opened this channel (all collaborators except sender)
    const hasNotOpen = activeChannel.collaborators
      .filter((collab) => collab._id !== user._id)
      .map((collab) => collab._id);

    socket.emit('message', {
      channelId: activeChannel._id,
      channelName: activeChannel.name,
      message: messageData,
      organisation: currentWorkspaceId,
      collaborators: activeChannel.collaborators.map((c) => c._id),
      hasNotOpen,
    });
  };

  // Listen for channel messages and updates
  useEffect(() => {
    if (!socket || !activeChannel) return;

    const handleChannelMessage = (data: any) => {
      console.log('📨 Received message event:', data);
      if (data.newMessage && data.newMessage.channel === activeChannel._id) {
        console.log('✅ Adding message to channel:', data.newMessage);
        setChannelMessages((prev) => [...prev, data.newMessage]);
      }
    };

    const handleMessageUpdated = ({ id, message, isThread }: { id: string; message: any; isThread?: boolean }) => {
      if (!isThread && message.channel === activeChannel._id) {
        console.log('✏️ Channel message updated:', id);
        setChannelMessages((prev) =>
          prev.map((msg) => (msg._id === id ? message : msg))
        );
      }
    };

    const handleMessageDeleted = ({ id, isThread }: { id: string; isThread?: boolean }) => {
      if (!isThread) {
        console.log('🗑️ Channel message deleted:', id);
        setChannelMessages((prev) => prev.filter((msg) => msg._id !== id));
      }
    };

    // Handle thread message updates to update parent message thread count
    const handleThreadMessage = () => {
      // When a thread message is added, we'll get a message-updated event for the parent
      // which will update the threadRepliesCount
      console.log('🧵 Thread message received');
    };

    // Handle channel updates (like hasNotOpen changes)
    const handleChannelUpdated = (updatedChannel: any) => {
      if (updatedChannel._id === activeChannel._id) {
        console.log('📢 Channel updated:', updatedChannel);
        setActiveChannel(updatedChannel);
      }
    };

    socket.on('message', handleChannelMessage);
    socket.on('message-updated', handleMessageUpdated);
    socket.on('message-deleted', handleMessageDeleted);
    socket.on('thread-message', handleThreadMessage);
    socket.on('channel-updated', handleChannelUpdated);

    return () => {
      socket.off('message', handleChannelMessage);
      socket.off('message-updated', handleMessageUpdated);
      socket.off('message-deleted', handleMessageDeleted);
      socket.off('thread-message', handleThreadMessage);
      socket.off('channel-updated', handleChannelUpdated);
    };
  }, [socket, activeChannel]);

  if (!user || !currentWorkspaceId) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1a1d21] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading workspace...</p>
        </div>
      </div>
    );
  }

  // Get the other user from active conversation
  const activeUser = activeConversation
    ? activeConversation.collaborators.find((c) => c._id !== user._id)
    : null;

  return (
    <div className="flex flex-col h-screen bg-[#1a1d21] text-white overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="h-11 bg-[#350d36] flex items-center px-2 shrink-0">
        {/* Left spacer */}
        <div className="flex-1"></div>
        
        {/* Centered content */}
        <div className="flex items-center gap-2">
          {/* Back/Forward buttons */}
          <button className="p-1.5 hover:bg-[#6f4d72] rounded transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="p-1.5 hover:bg-[#6f4d72] rounded transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="p-1.5 hover:bg-[#6f4d72] rounded transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Search Bar */}
          <div className="w-[600px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search workspace"
                className="w-full bg-[#6f4d72] text-white placeholder-[#d1d2d3] px-3 py-1.5 rounded border border-transparent focus:border-white focus:outline-none text-[13px]"
              />
              <svg className="w-4 h-4 text-white absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right spacer with help button at the end */}
        <div className="flex-1 flex justify-end">
          <button className="p-1.5 hover:bg-[#6f4d72] rounded transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <LeftNav workspaceName={currentWorkspace?.name} />
        <Sidebar
          currentUser={user || null}
          workspaceName={currentWorkspace?.name}
          conversations={conversations}
          users={users}
          activeConversation={activeConversation}
          onConversationSelect={(conv) => {
            setActiveConversation(conv);
            setActiveChannel(null); // Clear channel when selecting conversation
          }}
          onUserSelect={handleUserSelect}
          onChannelSelect={handleChannelSelect}
        />
        {activeChannel ? (
          <>
            <ChannelChatPane
              currentUser={user}
              channel={activeChannel}
              messages={channelMessages}
              threads={{}}
              editingMessageId={editingMessageId}
              onSendMessage={handleSendChannelMessage}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onOpenThread={handleOpenThread}
              onReaction={handleReaction}
              onRefreshChannel={handleRefreshChannel}
            />
            {activeThread && (
              <ThreadPanel
                parentMessage={activeThread}
                currentUser={user}
                onClose={handleCloseThread}
              />
            )}
          </>
        ) : activeConversation && activeUser ? (
          <>
            <ChatPane
              currentUser={user}
              activeUser={activeUser}
              messages={messages}
              threads={{}}
              editingMessageId={editingMessageId}
              onSendMessage={handleSendMessage}
              onEditMessage={handleEditMessage}
              onDeleteMessage={handleDeleteMessage}
              onOpenThread={handleOpenThread}
              onReaction={handleReaction}
            />
            {activeThread && (
              <ThreadPanel
                parentMessage={activeThread}
                currentUser={user}
                onClose={handleCloseThread}
              />
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#1a1d21]">
            <div className="text-center">
              <p className="text-[#d1d2d3] text-lg mb-4">Select a conversation or channel to start chatting</p>
              <p className="text-[#616061] text-sm">Choose a user or channel from the sidebar</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Preferences and Profile Modals */}
      <PreferencesModal />
      <ProfilePanel />
      {selectedUser && <UserProfileModal user={selectedUser} />}
    </div>
  );
};

export default Dashboard;

