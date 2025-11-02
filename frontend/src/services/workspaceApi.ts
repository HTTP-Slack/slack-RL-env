import api from '../config/axios';
import type { Workspace } from '../types/workspace';
import { getCurrentUser } from './authApi';

interface WorkspacesResponse {
  success: boolean;
  message?: string;
  data?: Workspace[];
}

/**
 * Get all workspaces for the current user
 * @route GET /api/organisation/workspaces
 */
export const getWorkspaces = async (): Promise<Workspace[]> => {
  try {
    const response = await api.get<WorkspacesResponse>('/organisation/workspaces');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch (error: any) {
    console.error('Error fetching workspaces:', error);
    if (error.response?.status === 401) {
      // User not authenticated, redirect to signin
      window.location.href = '/signin';
    }
    return [];
  }
};

/**
 * Get current user's email from localStorage
 */
export const getUserEmail = async (): Promise<string> => {
  const user = getCurrentUser();
  return user?.email || '';
};

interface CreateWorkspaceData {
  name: string;
}

interface CreateWorkspaceResponse {
  success: boolean;
  message?: string;
  data?: Workspace;
}

/**
 * Create a new workspace
 * @route POST /api/organisation
 */
export const createWorkspace = async (data: CreateWorkspaceData): Promise<CreateWorkspaceResponse> => {
  try {
    const response = await api.post<CreateWorkspaceResponse>('/organisation', data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating workspace:', error);
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error.message || 'Failed to create workspace',
    };
  }
};

interface InviteColleaguesData {
  workspaceId: string;
  emails: string[];
}

interface InviteColleaguesResponse {
  success: boolean;
  message?: string;
}

/**
 * Send invitation emails to colleagues
 * @route POST /api/organisation/:id/invite
 */
export const inviteColleagues = async (data: InviteColleaguesData): Promise<InviteColleaguesResponse> => {
  try {
    const response = await api.post<InviteColleaguesResponse>(
      `/organisation/${data.workspaceId}/invite`, 
      { emails: data.emails }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error sending invitations:', error);
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error.message || 'Failed to send invitations',
    };
  }
};

interface GetWorkspaceResponse {
  success: boolean;
  message?: string;
  data?: Workspace;
}

/**
 * Get workspace details including join link
 * @route GET /api/organisation/:id
 */
export const getWorkspace = async (workspaceId: string): Promise<Workspace | null> => {
  try {
    const response = await api.get<GetWorkspaceResponse>(`/organisation/${workspaceId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error fetching workspace:', error);
    return null;
  }
};

interface JoinByLinkResponse {
  success: boolean;
  message?: string;
  data?: Workspace;
}

/**
 * Join a workspace using invitation link
 * @route POST /api/organisation/join/:joinLink
 */
export const joinWorkspaceByLink = async (joinLink: string): Promise<JoinByLinkResponse> => {
  try {
    const response = await api.post<JoinByLinkResponse>(`/organisation/join/${joinLink}`);
    return response.data;
  } catch (error: any) {
    console.error('Error joining workspace:', error);
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error.message || 'Failed to join workspace',
    };
  }
};
