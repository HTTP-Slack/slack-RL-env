import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LeftNav from '../components/chat/LeftNav';
import Sidebar from '../components/chat/Sidebar';
import ChatPane from '../components/chat/ChatPane';
import ThreadPanel from '../components/chat/ThreadPanel';
import { PreferencesModal } from '../features/preferences/PreferencesModal';
import { ProfilePanel } from '../features/profile/ProfilePanel';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { getWorkspaces } from '../services/workspaceApi';
import type { Workspace } from '../types/workspace';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
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
    const message = messages.find((m) => m._id === messageId);
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

  const handleChannelSelect = (channelId: string) => {
    console.log('Channel selected:', channelId);
    // TODO: Implement channel selection logic
    // This will be similar to conversation selection but for channels
  };

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
          currentUser={user}
          workspaceName={currentWorkspace?.name}
          conversations={conversations}
          users={users}
          activeConversation={activeConversation}
          onConversationSelect={setActiveConversation}
          onUserSelect={handleUserSelect}
          onChannelSelect={handleChannelSelect}
        />
        {activeConversation && activeUser ? (
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
              <p className="text-[#d1d2d3] text-lg mb-4">Select a conversation to start chatting</p>
              <p className="text-[#616061] text-sm">or choose a user from the sidebar</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Preferences and Profile Modals */}
      <PreferencesModal />
      <ProfilePanel />
    </div>
  );
};

export default Dashboard;

