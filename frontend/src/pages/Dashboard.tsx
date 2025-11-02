import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import LeftNav from '../components/chat/LeftNav';
import Sidebar from '../components/chat/Sidebar';
import ChatPane from '../components/chat/ChatPane';
import ChannelChatPane from '../components/chat/ChannelChatPane';
import ThreadPanel from '../components/chat/ThreadPanel';
import { ActivityPanel } from '../components/chat/ActivityPanel';
import { DMPanel } from '../components/chat/DMPanel';
import { LaterPanel } from '../components/chat/LaterPanel';
import ChannelContextMenu from '../components/chat/ChannelContextMenu';
import ChannelSettingsModal from '../components/chat/ChannelSettingsModal';
import ChannelActionsMenu from '../components/chat/ChannelActionsMenu';
import { ConfirmDialog } from '../features/preferences/components/ConfirmDialog';
import { PreferencesModal } from '../features/preferences/PreferencesModal';
import { ProfilePanel } from '../features/profile/ProfilePanel';
import { UserProfileModal } from '../features/profile/UserProfileModal';
import { useProfile } from '../features/profile/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { getWorkspaces } from '../services/workspaceApi';
import { getChannel, leaveChannel, starChannel, unstarChannel } from '../services/channelApi';
import { getMessages } from '../services/messageApi';
import { SearchModal } from '../components/search/SearchModal';
import type { Workspace } from '../types/workspace';
import type { IChannel } from '../types/channel';
import type { SearchResult } from '../types/search';

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
    refreshSections,
  } = useWorkspace();
  
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<any | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [activeChannel, setActiveChannel] = useState<IChannel | null>(null);
  const [channelMessages, setChannelMessages] = useState<any[]>([]);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isDMsOpen, setIsDMsOpen] = useState(false);
  const [isLaterOpen, setIsLaterOpen] = useState(false);
  const [channelContextMenu, setChannelContextMenu] = useState<{
    channel: IChannel;
    position: { x: number; y: number };
  } | null>(null);
  const [isChannelSettingsOpen, setIsChannelSettingsOpen] = useState(false);
  const [moreOptionsMenu, setMoreOptionsMenu] = useState<{
    position: { x: number; y: number };
  } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchChannelFilter, setSearchChannelFilter] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Keyboard shortcut for search (Cmd/Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for notification navigation events
  useEffect(() => {
    const handleNavigateToChannel = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const { channelId } = customEvent.detail;
      if (channelId) {
        try {
          const channelData = await getChannel(channelId);
          setActiveChannel(channelData.data);
          setActiveConversation(null);
          setChannelMessages([]);
          
          if (socket && currentWorkspaceId && user) {
            socket.emit('channel-open', { 
              id: channelId,
              userId: user._id 
            });
            
            const messages = await getMessages({
              channelId,
              organisation: currentWorkspaceId,
            });
            setChannelMessages(messages);
          }
        } catch (error) {
          console.error('Failed to load channel:', error);
        }
      }
    };

    const handleNavigateToConversation = async (e: Event) => {
      const customEvent = e as CustomEvent;
      const { conversationId } = customEvent.detail;
      if (conversationId) {
        const conversation = conversations.find(c => c._id === conversationId);
        if (conversation) {
          setActiveConversation(conversation);
          setActiveChannel(null);
        }
      }
    };

    window.addEventListener('navigate-to-channel', handleNavigateToChannel);
    window.addEventListener('navigate-to-conversation', handleNavigateToConversation);

    return () => {
      window.removeEventListener('navigate-to-channel', handleNavigateToChannel);
      window.removeEventListener('navigate-to-conversation', handleNavigateToConversation);
    };
  }, [conversations, setActiveConversation, socket, currentWorkspaceId, user]);

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

  const handleSearchResultSelect = async (result: SearchResult) => {
    console.log('Search result selected:', result);

    switch (result.type) {
      case 'user':
        // Navigate to/create conversation with user
        await handleUserSelect(result._id);
        break;
      case 'channel':
        // Navigate to channel
        await handleChannelSelect(result._id);
        break;
      case 'message':
        // Navigate to channel/conversation and highlight message
        if (result.channel) {
          await handleChannelSelect(result.channel._id);
        } else if (result.conversation?._id) {
          const conversation = conversations.find(c => c._id === result.conversation?._id);
          if (conversation) {
            setActiveConversation(conversation);
            setActiveChannel(null);
          }
        }
        break;
      case 'file':
        // Open file in new tab or download
        const fileUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/files/${result._id}`;
        window.open(fileUrl, '_blank');
        break;
      case 'canvas':
        // Navigate to canvas view
        console.log('Canvas navigation not implemented yet');
        break;
      case 'conversation':
        // Set as active conversation
        const conversation = conversations.find(c => c._id === result._id);
        if (conversation) {
          setActiveConversation(conversation);
          setActiveChannel(null);
        }
        break;
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
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full bg-[#6f4d72] text-white placeholder-[#d1d2d3] px-3 py-1.5 rounded border border-transparent hover:border-white transition-colors text-[13px] flex items-center justify-between"
            >
              <span className="text-[#d1d2d3]">Search workspace</span>
              <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-[#5a3b5d] rounded text-xs">
                  {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}K
                </kbd>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </button>
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
        <LeftNav 
          workspaceName={currentWorkspace?.name}
          onActivityClick={() => {
            setIsActivityOpen(true);
            setIsDMsOpen(false);
            setIsLaterOpen(false);
          }}
          onHomeClick={() => {
            setIsActivityOpen(false);
            setIsDMsOpen(false);
            setIsLaterOpen(false);
          }}
          onDMsClick={() => {
            setIsDMsOpen(true);
            setIsActivityOpen(false);
            setIsLaterOpen(false);
          }}
          onLaterClick={() => {
            setIsLaterOpen(true);
            setIsDMsOpen(false);
            setIsActivityOpen(false);
          }}
          isActivityOpen={isActivityOpen}
          isDMsOpen={isDMsOpen}
          isLaterOpen={isLaterOpen}
        />
        {isDMsOpen ? (
          <>
            {/* DMs Panel - Like Activity Panel */}
            <DMPanel
              isOpen={isDMsOpen}
              onClose={() => setIsDMsOpen(false)}
              onConversationSelect={(conv) => {
                setActiveConversation(conv);
                setActiveChannel(null);
              }}
            />
            {/* Chat content shown alongside DM panel */}
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
                  <p className="text-[#616061] text-sm">Choose a user from the sidebar</p>
                </div>
              </div>
            )}
          </>
        ) : isActivityOpen ? (
          <>
            <ActivityPanel
              isOpen={isActivityOpen}
              onClose={() => setIsActivityOpen(false)}
              onNavigate={(type, id) => {
                // Don't close Activity panel - keep it open alongside chat
                if (type === 'channel') {
                  handleChannelSelect(id);
                } else if (type === 'conversation') {
                  const conversation = conversations.find(c => c._id === id);
                  if (conversation) {
                    setActiveConversation(conversation);
                    setActiveChannel(null);
                  }
                }
              }}
            />
            {/* Chat content shown alongside Activity panel */}
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
              onOpenChannelSettings={() => {
                setIsChannelSettingsOpen(true);
              }}
              onOpenMoreOptions={(position) => {
                setMoreOptionsMenu({ position });
              }}
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
          </>
        ) : isLaterOpen ? (
          <LaterPanel
            isOpen={isLaterOpen}
            onClose={() => setIsLaterOpen(false)}
          />
        ) : (
          <>
            <Sidebar
              currentUser={user || null}
              workspaceName={currentWorkspace?.name}
              conversations={conversations}
              users={users}
              activeConversation={activeConversation}
              activeChannel={activeChannel}
              onConversationSelect={(conv) => {
                setActiveConversation(conv);
                setActiveChannel(null);
              }}
              onUserSelect={handleUserSelect}
              onChannelSelect={handleChannelSelect}
              onChannelMenuClick={(channel, position) => {
                setChannelContextMenu({ channel, position });
              }}
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
                  onOpenChannelSettings={() => {
                    setIsChannelSettingsOpen(true);
                  }}
                  onOpenMoreOptions={(position) => {
                    setMoreOptionsMenu({ position });
                  }}
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
          </>
        )}
      </div>
      
      {/* Channel Context Menu */}
      {channelContextMenu && (
        <ChannelContextMenu
          channel={channelContextMenu.channel}
          position={channelContextMenu.position}
          onClose={() => setChannelContextMenu(null)}
          currentUserId={user?._id}
          onOpenChannelDetails={() => {
            setActiveChannel(channelContextMenu.channel);
            setIsChannelSettingsOpen(true);
          }}
          onSummarizeChannel={() => {
            // TODO: Implement channel summarization
            console.log('Summarize channel:', channelContextMenu.channel._id);
          }}
          onEditNotifications={() => {
            setActiveChannel(channelContextMenu.channel);
            setIsChannelSettingsOpen(true);
            // Could add logic to open notifications tab directly
          }}
          onStarChannel={async () => {
            try {
              await starChannel(channelContextMenu.channel._id);
              // Refresh sections to update starred status across all channels
              await refreshSections();
              // Refresh channel if it's active
              if (activeChannel?._id === channelContextMenu.channel._id) {
                await handleRefreshChannel();
              }
              setChannelContextMenu(null);
            } catch (error) {
              console.error('Failed to star channel:', error);
            }
          }}
          onUnstarChannel={async () => {
            try {
              await unstarChannel(channelContextMenu.channel._id);
              // Refresh sections to update starred status across all channels
              await refreshSections();
              // Refresh channel if it's active
              if (activeChannel?._id === channelContextMenu.channel._id) {
                await handleRefreshChannel();
              }
              setChannelContextMenu(null);
            } catch (error) {
              console.error('Failed to unstar channel:', error);
            }
          }}
          onMoveChannel={() => {
            // TODO: Implement move channel
            console.log('Move channel:', channelContextMenu.channel._id);
          }}
          onAddTemplate={() => {
            // TODO: Implement add template
            console.log('Add template to channel:', channelContextMenu.channel._id);
          }}
          onAddWorkflow={() => {
            // TODO: Implement add workflow
            console.log('Add workflow to channel:', channelContextMenu.channel._id);
          }}
          onEditSettings={() => {
            setActiveChannel(channelContextMenu.channel);
            setIsChannelSettingsOpen(true);
          }}
          onCopy={(type) => {
            console.log('Copy', type, 'from channel:', channelContextMenu.channel._id);
          }}
          onSearchInChannel={() => {
            setSearchChannelFilter({
              id: channelContextMenu.channel._id,
              name: channelContextMenu.channel.name,
            });
            setIsSearchOpen(true);
            setChannelContextMenu(null);
          }}
          onLeaveChannel={() => {
            setConfirmDialog({
              title: 'Leave Channel',
              message: `Are you sure you want to leave #${channelContextMenu.channel.name}? You'll stop receiving notifications about activity in this channel.`,
              onConfirm: async () => {
                try {
                  await leaveChannel(channelContextMenu.channel._id);
                  setActiveChannel(null);
                  setChannelContextMenu(null);
                  setConfirmDialog(null);
                } catch (error) {
                  console.error('Failed to leave channel:', error);
                  setConfirmDialog(null);
                }
              },
            });
          }}
        />
      )}

      {/* Channel Settings Modal */}
      {isChannelSettingsOpen && activeChannel && (
        <ChannelSettingsModal
          isOpen={isChannelSettingsOpen}
          onClose={() => {
            setIsChannelSettingsOpen(false);
          }}
          channel={activeChannel}
          currentUser={user!}
          onChannelUpdated={async (updatedChannel) => {
            setActiveChannel(updatedChannel);
            await handleRefreshChannel();
          }}
        />
      )}

      {/* More Options Menu */}
      {moreOptionsMenu && activeChannel && (
        <ChannelActionsMenu
          position={moreOptionsMenu.position}
          onClose={() => setMoreOptionsMenu(null)}
          channel={activeChannel}
          currentUserId={user?._id}
          onOpenChannelDetails={() => {
            setIsChannelSettingsOpen(true);
            setMoreOptionsMenu(null);
          }}
          onSummarizeChannel={() => {
            // TODO: Implement channel summarization
            console.log('Summarize channel:', activeChannel._id);
            setMoreOptionsMenu(null);
          }}
          onEditNotifications={() => {
            setIsChannelSettingsOpen(true);
            setMoreOptionsMenu(null);
            // Could add logic to open notifications tab directly
          }}
          onStarChannel={async () => {
            try {
              await starChannel(activeChannel._id);
              // Refresh sections to update starred status across all channels
              await refreshSections();
              await handleRefreshChannel();
              setMoreOptionsMenu(null);
            } catch (error) {
              console.error('Failed to star channel:', error);
            }
          }}
          onUnstarChannel={async () => {
            try {
              await unstarChannel(activeChannel._id);
              // Refresh sections to update starred status across all channels
              await refreshSections();
              await handleRefreshChannel();
              setMoreOptionsMenu(null);
            } catch (error) {
              console.error('Failed to unstar channel:', error);
            }
          }}
          onMoveChannel={() => {
            // TODO: Implement move channel
            console.log('Move channel:', activeChannel._id);
            setMoreOptionsMenu(null);
          }}
          onAddTemplate={() => {
            // TODO: Implement add template
            console.log('Add template to channel:', activeChannel._id);
            setMoreOptionsMenu(null);
          }}
          onAddWorkflow={() => {
            // TODO: Implement add workflow
            console.log('Add workflow to channel:', activeChannel._id);
            setMoreOptionsMenu(null);
          }}
          onEditSettings={() => {
            setIsChannelSettingsOpen(true);
            setMoreOptionsMenu(null);
          }}
          onCopy={() => {
            // TODO: Implement copy options
            console.log('Copy from channel:', activeChannel._id);
            setMoreOptionsMenu(null);
          }}
          onSearchInChannel={() => {
            setSearchChannelFilter({
              id: activeChannel._id,
              name: activeChannel.name,
            });
            setIsSearchOpen(true);
            setMoreOptionsMenu(null);
          }}
          onLeaveChannel={() => {
            setConfirmDialog({
              title: 'Leave Channel',
              message: `Are you sure you want to leave #${activeChannel.name}? You'll stop receiving notifications about activity in this channel.`,
              onConfirm: async () => {
                try {
                  await leaveChannel(activeChannel._id);
                  setActiveChannel(null);
                  setMoreOptionsMenu(null);
                  setConfirmDialog(null);
                } catch (error) {
                  console.error('Failed to leave channel:', error);
                  setConfirmDialog(null);
                }
              },
            });
            setMoreOptionsMenu(null);
          }}
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={!!confirmDialog}
          title={confirmDialog.title}
          message={confirmDialog.message}
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          onConfirm={() => {
            confirmDialog.onConfirm();
          }}
          onCancel={() => setConfirmDialog(null)}
        />
      )}

      {/* Preferences and Profile Modals */}
      <PreferencesModal />
      <ProfilePanel />
      {selectedUser && <UserProfileModal user={selectedUser} />}

      {/* Search Modal */}
      {currentWorkspaceId && (
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => {
            setIsSearchOpen(false);
            setSearchChannelFilter(null);
          }}
          organisationId={currentWorkspaceId}
          channelFilter={searchChannelFilter || undefined}
          onResultSelect={handleSearchResultSelect}
        />
      )}
    </div>
  );
};

export default Dashboard;

