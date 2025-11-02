import api from '../config/axios';

export interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture?: string;
}

export interface Message {
  _id: string;
  sender: User;
  content: string;
  attachments?: string[];
  channel?: string;
  organisation: string;
  conversation?: string;
  collaborators?: string[];
  reactions?: {
    emoji: string;
    reactedToBy: string[];
  }[];
  threadReplies?: string[];
  threadRepliesCount?: number;
  threadLastReplyDate?: Date;
  isBookmarked?: boolean;
  isSelf?: boolean;
  hasRead?: boolean;
  type?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Thread {
  _id: string;
  sender: User;
  content: string;
  message: string;
  reactions?: {
    emoji: string;
    reactedToBy: string[];
  }[];
  isBookmarked?: boolean;
  hasRead?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  name: string;
  collaborators: User[];
  description?: string;
  isSelf?: boolean;
  isConversation: boolean;
  organisation: string;
  createdBy: User;
  isOnline?: boolean;
  hasNotOpen?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Get messages for a channel or conversation
 */
export const getMessages = async (params: {
  channelId?: string;
  conversationId?: string;
  isSelf?: boolean;
  organisation: string;
}): Promise<Message[]> => {
  try {
    const response = await api.get<ApiResponse<Message[]>>('/message', { params });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

/**
 * Get a single message by ID
 */
export const getMessage = async (messageId: string): Promise<Message | null> => {
  try {
    const response = await api.get<ApiResponse<Message>>(`/message/${messageId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error fetching message:', error);
    return null;
  }
};

/**
 * Create a new message
 */
export const createMessage = async (data: {
  content: string;
  organisation: string;
  channelId?: string;
  conversationId?: string;
  isSelf?: boolean;
}): Promise<Message | null> => {
  try {
    const response = await api.post<ApiResponse<Message>>('/message', data);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error creating message:', error);
    return null;
  }
};

/**
 * Get conversations for the current user in an organisation
 */
export const getConversations = async (organisationId: string): Promise<Conversation[]> => {
  try {
    // This endpoint should be available from the organisation controller
    const response = await api.get<ApiResponse<any>>(`/organisation/${organisationId}`);
    
    if (response.data.success && response.data.data) {
      // The organisation data includes conversations
      return response.data.data.conversations || [];
    }
    
    return [];
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    return [];
  }
};

/**
 * Get or create a 1:1 conversation with another user
 */
export const getOrCreateConversation = async (
  organisationId: string,
  otherUserId: string
): Promise<Conversation | null> => {
  try {
    const response = await api.post<ApiResponse<Conversation>>(
      `/organisation/${organisationId}/conversation`,
      { otherUserId }
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    return null;
  }
};

/**
 * Get all users in an organisation (excluding current user)
 */
export const getOrganisationUsers = async (organisationId: string): Promise<User[]> => {
  try {
    const response = await api.get<ApiResponse<User[]>>(
      `/organisation/${organisationId}/users`
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error: any) {
    console.error('Error fetching organisation users:', error);
    return [];
  }
};

/**
 * Get thread replies for a message
 */
export const getThreadReplies = async (messageId: string): Promise<Thread[]> => {
  try {
    const response = await api.get<ApiResponse<Thread[]>>(
      `/message/${messageId}/replies`
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error: any) {
    console.error('Error fetching thread replies:', error);
    return [];
  }
};
