import type { FileMetadata } from '../types/file';

interface RecentFile extends FileMetadata {
  uploadedAt: string;
}

const RECENT_FILES_KEY = 'slack_recent_files';
const MAX_RECENT_FILES = 50;

/**
 * Get all recent files from localStorage
 */
export const getRecentFiles = (): RecentFile[] => {
  try {
    const stored = localStorage.getItem(RECENT_FILES_KEY);
    if (!stored) return [];
    
    const files: RecentFile[] = JSON.parse(stored);
    // Filter out old files (older than 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return files.filter(file => new Date(file.uploadedAt).getTime() > thirtyDaysAgo);
  } catch (error) {
    console.error('Error reading recent files:', error);
    return [];
  }
};

/**
 * Add a file to recent files
 */
export const addRecentFile = (file: FileMetadata): void => {
  try {
    const recentFiles = getRecentFiles();
    
    // Check if file already exists (by id)
    const existingIndex = recentFiles.findIndex(f => f.id === file.id);
    
    const recentFile: RecentFile = {
      ...file,
      uploadedAt: new Date().toISOString(),
    };
    
    if (existingIndex !== -1) {
      // Update existing file's timestamp
      recentFiles[existingIndex] = recentFile;
    } else {
      // Add new file to the beginning
      recentFiles.unshift(recentFile);
    }
    
    // Keep only the most recent files
    const trimmedFiles = recentFiles.slice(0, MAX_RECENT_FILES);
    
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(trimmedFiles));
  } catch (error) {
    console.error('Error adding recent file:', error);
  }
};

/**
 * Add multiple files to recent files
 */
export const addRecentFiles = (files: FileMetadata[]): void => {
  try {
    const recentFiles = getRecentFiles();
    const now = new Date().toISOString();
    
    // Create a map for quick lookup
    const fileMap = new Map<string, RecentFile>();
    
    // Add existing files to the map
    recentFiles.forEach(f => fileMap.set(f.id, f));
    
    // Add/update incoming files
    files.forEach(file => {
      fileMap.set(file.id, { ...file, uploadedAt: now });
    });
    
    // Convert map back to array, sort by uploadedAt descending
    const updatedFiles = Array.from(fileMap.values())
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, MAX_RECENT_FILES);
    
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updatedFiles));
  } catch (error) {
    console.error('Error adding recent files:', error);
  }
};

/**
 * Remove a file from recent files
 */
export const removeRecentFile = (fileId: string): void => {
  try {
    const recentFiles = getRecentFiles();
    const filtered = recentFiles.filter(f => f.id !== fileId);
    localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing recent file:', error);
  }
};

/**
 * Clear all recent files
 */
export const clearRecentFiles = (): void => {
  try {
    localStorage.removeItem(RECENT_FILES_KEY);
  } catch (error) {
    console.error('Error clearing recent files:', error);
  }
};

/**
 * Get recent files by type
 */
export const getRecentFilesByType = (type: 'image' | 'video' | 'audio' | 'document' | 'all' = 'all'): RecentFile[] => {
  const files = getRecentFiles();
  
  if (type === 'all') return files;
  
  return files.filter(file => {
    const contentType = file.contentType.toLowerCase();
    const filename = file.filename.toLowerCase();
    
    switch (type) {
      case 'image':
        return contentType.startsWith('image/') || 
          ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].some(ext => filename.endsWith(`.${ext}`));
      case 'video':
        return contentType.startsWith('video/') || 
          ['mp4', 'mov', 'avi', 'webm', 'mkv'].some(ext => filename.endsWith(`.${ext}`));
      case 'audio':
        return contentType.startsWith('audio/') || 
          ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].some(ext => filename.endsWith(`.${ext}`));
      case 'document':
        return contentType.includes('pdf') || 
          contentType.includes('document') || 
          contentType.includes('presentation') ||
          contentType.includes('spreadsheet') ||
          ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv'].some(ext => filename.endsWith(`.${ext}`));
      default:
        return false;
    }
  });
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

/**
 * Format relative time
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
};

