import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import api from '../config/axios';
import type { User, Message, Conversation } from '../services/messageApi';
import {
  getMessages,
  getOrCreateConversation,
  getOrganisationUsers,
} from '../services/messageApi';
import { useAuth } from './AuthContext';

interface WorkspaceContextType {
  currentWorkspaceId: string | null;
  setCurrentWorkspaceId: (id: string | null) => void;
  conversations: Conversation[];
  users: User[];
  activeConversation: Conversation | null;
  setActiveConversation: (conversation: Conversation | null) => void;
  messages: Message[];
  loading: boolean;
  socket: Socket | null;
  sendMessage: (content: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  startConversation: (otherUserId: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  // Use ref to track current workspace ID in socket handlers
  const currentWorkspaceIdRef = React.useRef<string | null>(null);
  
  // Update ref whenever currentWorkspaceId changes
  React.useEffect(() => {
    currentWorkspaceIdRef.current = currentWorkspaceId;
  }, [currentWorkspaceId]);

  // Initialize socket connection
  useEffect(() => {
    if (!user) return;

    // Socket.IO needs base URL without /api path
    const socketUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '') 
      : 'http://localhost:5000';
    
    console.log('Connecting socket to:', socketUrl);

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      console.log('✅ Socket connected successfully!', newSocket.id);
      if (user._id) {
        newSocket.emit('user-join', { id: user._id, isOnline: true });
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    newSocket.on('message', ({ newMessage, organisation }: { newMessage: Message; organisation: string }) => {
      console.log('📨 Received message via socket:', newMessage);
      console.log('📍 Message conversation:', newMessage.conversation);
      console.log('🏢 Message organisation:', organisation);
      console.log('🏢 Current workspace:', currentWorkspaceIdRef.current);
      console.log('👤 Message sender:', newMessage.sender);
      
      // Only process messages for current workspace
      if (organisation !== currentWorkspaceIdRef.current) {
        console.log('⚠️ Message is for different workspace, ignoring');
        return;
      }
      
      // Validate message has required fields
      if (!newMessage.sender || !newMessage.sender._id) {
        console.error('❌ Message missing sender, skipping:', newMessage);
        return;
      }
      
      // Only add message if it belongs to the currently active conversation
      setMessages((prev) => {
        // Check if message already exists (avoid duplicates)
        if (prev.some(m => m._id === newMessage._id)) {
          console.log('⚠️ Duplicate message, skipping');
          return prev;
        }
        console.log('✅ Adding message to state');
        return [...prev, newMessage];
      });
      
      // Also update the conversation list to show this conversation has a new message
      setConversations((prev) => {
        return prev.map((c) => {
          if (c._id === newMessage.conversation) {
            return { ...c, lastMessage: newMessage };
          }
          return c;
        });
      });
    });

    newSocket.on('message-updated', ({ id, message, isThread }: { id: string; message: Message; isThread: boolean }) => {
      console.log('🔄 Message updated:', id);
      if (isThread) {
        // TODO: Handle thread message updates
        console.log('Thread message update not yet implemented');
        return;
      }
      
      // Update the message in the messages array with the new reaction data
      setMessages((prev) => {
        return prev.map((m) => {
          if (m._id === id) {
            return { ...m, reactions: message.reactions };
          }
          return m;
        });
      });
    });

    newSocket.on('convo-updated', (updatedConversation: Conversation) => {
      console.log('🔄 Conversation updated:', updatedConversation._id);
      console.log('👥 Updated conversation collaborators:', updatedConversation.collaborators);
      
      // Check if collaborators are populated (objects vs string IDs)
      const hasPopulatedCollaborators = updatedConversation.collaborators?.length > 0 && 
        typeof updatedConversation.collaborators[0] === 'object';
      
      if (!hasPopulatedCollaborators) {
        console.warn('⚠️ Received conversation update without populated collaborators, skipping update');
        return;
      }
      
      setConversations((prev) =>
        prev.map((c) => (c._id === updatedConversation._id ? updatedConversation : c))
      );
    });

    newSocket.on('notification', async ({ conversationId, organisation }: any) => {
      console.log('🔔 Received notification for conversation:', conversationId);
      console.log('🏢 Notification organisation:', organisation);
      console.log('🏢 Current workspace:', currentWorkspaceIdRef.current);
      
      // Only refresh if notification is for current workspace
      if (organisation === currentWorkspaceIdRef.current) {
        console.log('✅ Notification matches current workspace, refreshing conversations');
        // Refresh conversations to pick up any new ones
        try {
          const response = await api.get(`/organisation/${organisation}`);
          if (response.data.success && response.data.data) {
            const convos = response.data.data.conversations || [];
            
            // Double-check conversations belong to this workspace
            const validConvos = convos.filter((c: Conversation) => c.organisation === organisation);
            setConversations(validConvos);
          }
        } catch (error) {
          console.error('❌ Error fetching conversations from notification:', error);
        }
      } else {
        console.log('⚠️ Notification is for different workspace, ignoring');
      }
    });

    setSocket(newSocket);
    
    // Expose socket to window for debugging
    if (typeof window !== 'undefined') {
      (window as any).socket = newSocket;
    }

    return () => {
      if (user._id) {
        newSocket.emit('user-leave', { id: user._id, isOnline: false });
      }
      newSocket.close();
      // Clean up window socket reference
      if (typeof window !== 'undefined') {
        delete (window as any).socket;
      }
    };
  }, [user]);

  // Fetch conversations when workspace changes
  useEffect(() => {
    if (currentWorkspaceId) {
      console.log('🔄 Workspace changed to:', currentWorkspaceId);
      
      // If there's an active conversation, check if it belongs to this workspace
      if (activeConversation && activeConversation.organisation !== currentWorkspaceId) {
        console.log('⚠️ Active conversation belongs to different workspace, clearing it');
        setActiveConversation(null);
      }
      
      // Clear state when switching workspaces
      setConversations([]);
      setUsers([]);
      setMessages([]);
      
      // Fetch new data
      fetchConversations();
      fetchUsers();
    } else {
      // Clear everything if no workspace selected
      setConversations([]);
      setUsers([]);
      setMessages([]);
      setActiveConversation(null);
    }
    // fetchConversations and fetchUsers are stable callbacks that depend on currentWorkspaceId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWorkspaceId]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversation && currentWorkspaceId) {
      console.log('💬 Active conversation changed:', activeConversation._id);
      // Clear messages when switching conversations
      setMessages([]);
      
      fetchMessages();
      
      // Join the conversation room
      if (socket && user) {
        console.log('🚪 Joining conversation room:', activeConversation._id);
        socket.emit('convo-open', {
          id: activeConversation._id,
          userId: user._id,
        });
      }
    } else {
      // Clear messages if no active conversation
      setMessages([]);
    }
    // fetchMessages is a stable callback that depends on activeConversation and currentWorkspaceId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversation?._id, currentWorkspaceId]);

  const fetchConversations = useCallback(async () => {
    if (!currentWorkspaceId) return;
    
    setLoading(true);
    try {
      console.log('📋 Fetching conversations for workspace:', currentWorkspaceId);
      const response = await api.get(`/organisation/${currentWorkspaceId}`);
      
      if (response.data.success && response.data.data) {
        const convos = response.data.data.conversations || [];
        console.log('✅ Conversations fetched:', convos.length, 'conversations');
        
        // Double-check that all conversations belong to this workspace
        const validConvos = convos.filter((c: Conversation) => {
          const belongsToWorkspace = c.organisation === currentWorkspaceId;
          if (!belongsToWorkspace) {
            console.warn('⚠️ Filtering out conversation from different workspace:', c._id, 'workspace:', c.organisation);
          }
          return belongsToWorkspace;
        });
        
        console.log('✅ Valid conversations for this workspace:', validConvos.length);
        setConversations(validConvos);
      }
    } catch (error) {
      console.error('❌ Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspaceId]);

  const fetchUsers = useCallback(async () => {
    if (!currentWorkspaceId) return;
    
    try {
      console.log('👥 Fetching users for workspace:', currentWorkspaceId);
      const usersData = await getOrganisationUsers(currentWorkspaceId);
      console.log('✅ Users fetched:', usersData.length, 'users');
      setUsers(usersData);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setUsers([]);
    }
  }, [currentWorkspaceId]);

  const fetchMessages = useCallback(async () => {
    if (!activeConversation || !currentWorkspaceId) return;
    
    setLoading(true);
    try {
      console.log('💬 Fetching messages for conversation:', activeConversation._id);
      const messagesData = await getMessages({
        conversationId: activeConversation._id,
        organisation: currentWorkspaceId,
      });
      console.log('✅ Messages fetched:', messagesData.length);
      
      // Validate all messages have sender populated
      const invalidMessages = messagesData.filter(m => !m.sender || !m.sender._id);
      if (invalidMessages.length > 0) {
        console.warn('⚠️ Found messages without sender:', invalidMessages);
      }
      
      // Filter out invalid messages
      const validMessages = messagesData.filter(m => m.sender && m.sender._id);
      setMessages(validMessages);
    } catch (error) {
      console.error('❌ Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [activeConversation, currentWorkspaceId]);

  const refreshMessages = async () => {
    await fetchMessages();
  };

  const startConversation = async (otherUserId: string) => {
    if (!currentWorkspaceId) return;
    
    setLoading(true);
    try {
      console.log('🆕 Starting conversation with user:', otherUserId);
      const conversation = await getOrCreateConversation(currentWorkspaceId, otherUserId);
      console.log('✅ Conversation created/retrieved (raw):', conversation);
      console.log('👥 Raw conversation collaborators:', conversation?.collaborators);

      if (conversation) {
        // Refresh organisation conversations from the server to ensure collaborators are populated
        try {
          console.log('🔄 Fetching organisation to get populated conversation...');
          const resp = await api.get(`/organisation/${currentWorkspaceId}`);
          if (resp.data?.success && resp.data?.data) {
            const remoteConvos = resp.data.data.conversations || [];
            console.log('📥 Remote conversations fetched:', remoteConvos.length);
            
            // find the populated conversation
            const populated = remoteConvos.find((c: any) => c._id === conversation._id) || conversation;
            console.log('✅ Populated conversation found:', populated);
            console.log('👥 Populated collaborators:', populated.collaborators);
            setActiveConversation(populated);

            // Update conversations list: replace if exists, or add
            setConversations((prev) => {
              const exists = prev.find((c) => c._id === populated._id);
              if (exists) {
                return prev.map((c) => (c._id === populated._id ? populated : c));
              }
              return [...prev, populated];
            });
            console.log('� Refreshed conversations and set active to populated conversation');
          } else {
            // Fallback: use the conversation returned from API
            setActiveConversation(conversation);
            setConversations((prev) => (prev.some((c) => c._id === conversation._id) ? prev : [...prev, conversation]));
            console.log('⚠️ Could not fetch populated conversations, used raw conversation');
          }
        } catch (err) {
          console.error('❌ Error refreshing conversations after create:', err);
          setActiveConversation(conversation);
          setConversations((prev) => (prev.some((c) => c._id === conversation._id) ? prev : [...prev, conversation]));
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!activeConversation || !currentWorkspaceId || !user || !socket) return;

    try {
      console.log('📤 Sending message via socket:', content);
      console.log('📍 ConversationId:', activeConversation._id);
      console.log('👥 Collaborators:', activeConversation.collaborators.map(c => c._id));
      
      // Emit via socket - backend will create the message and broadcast to the room
      const hasNotOpen = activeConversation.collaborators
        .filter((c) => c._id !== user._id)
        .map((c) => c._id);

      socket.emit('message', {
        conversationId: activeConversation._id,
        collaborators: activeConversation.collaborators.map((c) => c._id),
        isSelf: false,
        message: {
          sender: user._id,
          content,
        },
        organisation: currentWorkspaceId,
        hasNotOpen,
      });
      
      console.log('🚀 Socket message event emitted');
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  };

  const value = {
    currentWorkspaceId,
    setCurrentWorkspaceId,
    conversations,
    users,
    activeConversation,
    setActiveConversation,
    messages,
    loading,
    socket,
    sendMessage,
    fetchConversations,
    startConversation,
    refreshMessages,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};
