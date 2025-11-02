import api from '../config/axios';
import { addRecentFiles } from './recentFilesService';
import type { FileMetadata } from '../types/file';

// Re-export for convenience
export type { FileMetadata };

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Upload files to the server
 */
export const uploadFiles = async (
  files: File[],
  organisation: string,
  channelId?: string,
  conversationId?: string
): Promise<FileMetadata[]> => {
  try {
    const formData = new FormData();
    
    // Append all files
    files.forEach((file) => {
      formData.append('files', file);
    });
    
    // Append metadata
    formData.append('organisation', organisation);
    if (channelId) {
      formData.append('channelId', channelId);
    }
    if (conversationId) {
      formData.append('conversationId', conversationId);
    }

    const response = await api.post<ApiResponse<FileMetadata[]>>('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (response.data.success && response.data.data) {
      // Add uploaded files to recent files cache
      addRecentFiles(response.data.data);
      return response.data.data;
    }

    return [];
  } catch (error: any) {
    console.error('Error uploading files:', error);
    throw error;
  }
};

/**
 * Get file metadata
 */
export const getFileInfo = async (fileId: string): Promise<FileMetadata | null> => {
  try {
    const response = await api.get<ApiResponse<FileMetadata>>(`/files/${fileId}/info`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error fetching file info:', error);
    return null;
  }
};

/**
 * Get file download URL
 */
export const getFileUrl = (fileId: string, inline: boolean = false): string => {
  const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

  // Ensure we don't end up with double /api (e.g. http://localhost:8080/api/api/files)
  const normalizedBaseUrl = rawBaseUrl.replace(/\/?api\/?$/, '');
  const origin = normalizedBaseUrl || rawBaseUrl;

  return `${origin}/api/files/${fileId}${inline ? '?inline=1' : ''}`;
};

/**
 * Get shareable file link in Slack format: {baseUrl}/files/{workspaceId}/{fileId}/{filename}
 */
export const getShareableFileLink = (fileId: string, workspaceId: string, filename: string): string => {
  const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  const normalizedBaseUrl = rawBaseUrl.replace(/\/?api\/?$/, '');
  const origin = normalizedBaseUrl || rawBaseUrl;
  
  // Format filename: replace spaces with underscores and sanitize
  const sanitizedFilename = filename
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/_+/g, '_');
  
  return `${origin}/files/${workspaceId}/${fileId}/${sanitizedFilename}`;
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

