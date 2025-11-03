import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import type { Message as ApiMessage, User as ApiUser } from '../../services/messageApi';
import { parseMarkdown } from '../../utils/markdown';
import { getFileUrl, getFileInfo, type FileMetadata } from '../../services/fileApi';
import { getList } from '../../services/listApi';
import type { ListData } from '../../types/list';
import { useWorkspace } from '../../context/WorkspaceContext';
import EmojiPicker from './EmojiPicker';
import FileContextMenu from './FileContextMenu';
import MessageContextMenu from './MessageContextMenu';
import { convertEmojiShortcodes } from '../../constants/emojis';
import './MessageComposer.css';

// Check if content contains actual HTML tags (not just text starting with <)
const containsHtmlTags = (content: string): boolean => {
  // Match HTML tags like <p>, </p>, <strong>, etc.
  // Pattern: < or </, followed by a letter, followed by tag name and attributes
  const htmlTagRegex = /<\/?[a-z][^>]*>/i;
  return htmlTagRegex.test(content);
};

// Sanitize HTML content with safe configuration
const sanitizeHtml = (html: string): string => {
  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'u', 's', 'strike', 'code', 'pre',
        'ul', 'ol', 'li', 'a', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'span', 'div'
      ],
      ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      KEEP_CONTENT: true,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
      RETURN_TRUSTED_TYPE: false,
    });
  } catch (error) {
    console.error('HTML sanitization failed:', error);
    // Return empty string on error - will fall back to markdown rendering
    return '';
  }
};

interface MessageItemProps {
  message: ApiMessage;
  user: ApiUser;
  isCurrentUser: boolean;
  showAvatar: boolean;
  threadCount: number;
  isEditing: boolean;
  isPinned?: boolean;
  onEdit: (newText: string) => void;
  onDelete: () => void;
  onOpenThread: () => void;
  onReaction: (emoji: string) => void;
  onMarkUnread: () => void;
  onPin?: () => void;
  onUserClick?: (user: ApiUser) => void;
  formatTime: (date: Date) => string;
}

interface FileViewerProps {
  fileId: string;
  fileInfo: FileMetadata | null;
  onClose: () => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ fileId, fileInfo, onClose }) => {
  const fileUrl = getFileUrl(fileId, true);
  const isImage = fileInfo?.contentType?.startsWith('image/');
  const isVideo = fileInfo?.contentType?.startsWith('video/');
  const isPdf = fileInfo?.contentType?.includes('pdf');
  const isPpt = fileInfo?.contentType?.includes('presentation') || 
    fileInfo?.filename?.toLowerCase().endsWith('.ppt') ||
    fileInfo?.filename?.toLowerCase().endsWith('.pptx');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[rgb(34,37,41)] hover:bg-[rgb(49,48,44)] flex items-center justify-center text-white z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Header with file info */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="text-white">
            <div className="font-semibold">{fileInfo?.filename || 'Loading...'}</div>
            <div className="text-sm text-gray-400">
              {fileInfo && `${(fileInfo.length / 1024).toFixed(2)} KB`}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(getFileUrl(fileId, false), '_blank');
              }}
              className="px-4 py-2 rounded bg-[rgb(34,37,41)] hover:bg-[rgb(49,48,44)] text-white text-sm font-medium"
            >
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        className="max-w-7xl max-h-[90vh] p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {isImage && (
          <img
            src={fileUrl}
            alt={fileInfo?.filename || 'Image'}
            className="max-w-full max-h-[85vh] object-contain rounded"
          />
        )}
        {isVideo && (
          <video
            src={fileUrl}
            controls
            autoPlay
            className="max-w-full max-h-[85vh] rounded"
          >
            Your browser does not support the video tag.
          </video>
        )}
        {isPdf && (
          <iframe
            src={`${fileUrl}#toolbar=1&navpanes=0`}
            title={fileInfo?.filename || 'PDF document'}
            className="w-[80vw] h-[85vh] bg-white rounded"
          />
        )}
        {isPpt && (
          <div className="w-[80vw] h-[85vh] bg-white rounded flex items-center justify-center">
            <div className="text-center p-8">
              <div className="mb-6">
                <svg className="w-32 h-32 mx-auto text-[#D24625]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                  <path d="M14 2v6h6" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                {fileInfo?.filename}
              </h3>
              <p className="text-gray-600 mb-6">PowerPoint Presentation</p>
              <button
                onClick={() => window.open(getFileUrl(fileId, false), '_blank')}
                className="px-6 py-3 bg-[#D24625] hover:bg-[#B63920] text-white rounded-lg font-medium transition-colors"
              >
                Download to View
              </button>
            </div>
          </div>
        )}
        {!isImage && !isVideo && !isPdf && !isPpt && (
          <div className="text-white">Preview is not available. Use the download button above.</div>
        )}
      </div>

      {/* Navigation arrows (for future multi-file support) */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[rgb(34,37,41)] hover:bg-[rgb(49,48,44)] flex items-center justify-center text-white opacity-50"
        disabled
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[rgb(34,37,41)] hover:bg-[rgb(49,48,44)] flex items-center justify-center text-white opacity-50"
        disabled
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4">
          <button className="w-10 h-10 rounded hover:bg-white/10 flex items-center justify-center text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>
          <button className="w-10 h-10 rounded hover:bg-white/10 flex items-center justify-center text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const FileAttachment: React.FC<{ fileId: string; onClick: () => void; workspaceId: string }> = ({ fileId, onClick, workspaceId }) => {
  const [fileInfo, setFileInfo] = useState<FileMetadata | null>(null);
  const [isImage, setIsImage] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  const [isPpt, setIsPpt] = useState(false);
  const [isAudio, setIsAudio] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState<string>('');
  const [videoDuration, setVideoDuration] = useState<string>('');
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const fileUrl = getFileUrl(fileId, true);
  const downloadUrl = getFileUrl(fileId, false);

  useEffect(() => {
    getFileInfo(fileId).then((info) => {
      if (info) {
        setFileInfo(info);
        const contentType = info.contentType || '';
        const filename = info.filename || '';
        const extension = filename.split('.').pop()?.toLowerCase() || '';
        
        // Check by content type first, then by extension
        const isImageType = contentType.startsWith('image/') || 
          ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
        const isVideoType = contentType.startsWith('video/') || 
          ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(extension);
        const isPdfType = contentType.includes('pdf') || extension === 'pdf';
        const isPptType = contentType.includes('presentation') || 
          ['ppt', 'pptx'].includes(extension);
        const isAudioType = contentType.startsWith('audio/') || 
          ['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(extension);

        setIsImage(isImageType);
        setIsVideo(isVideoType);
        setIsPdf(isPdfType);
        setIsPpt(isPptType);
        setIsAudio(isAudioType);
      }
    });
  }, [fileId]);

  const handleMoreActionsClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.right - 200, // Position menu to the left of button
      y: rect.bottom + 5,  // Position menu below button
    });
    setShowContextMenu(true);
  };

  // Generate video thumbnail
  useEffect(() => {
    if (isVideo && fileUrl && fileInfo) {
      const video = document.createElement('video');
      video.src = fileUrl;
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';
      video.muted = true; // Required for autoplay in some browsers
      
      let timeoutId: ReturnType<typeof setTimeout>;
      
      video.onloadedmetadata = () => {
        // Seek to 1 second or 10% of video, whichever is smaller
        const seekTime = Math.min(1, video.duration * 0.1);
        video.currentTime = seekTime;
        
        // Get duration
        const duration = video.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        setVideoDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        
        // Timeout if seeked doesn't fire
        timeoutId = setTimeout(() => {
          if (!videoThumbnail) {
            // Fallback: use video element directly as thumbnail
            video.currentTime = 0;
          }
        }, 3000);
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setVideoThumbnail(canvas.toDataURL('image/jpeg', 0.8));
          }
        } catch (error) {
          console.error('Error generating video thumbnail:', error);
          // Fallback: show video element with poster
        }
        if (timeoutId) clearTimeout(timeoutId);
      };

      video.onerror = () => {
        console.error('Video load error');
        // Don't change isVideo state here, just log the error
        if (timeoutId) clearTimeout(timeoutId);
      };
      
      return () => {
        video.pause();
        video.src = '';
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [isVideo, fileUrl, fileInfo]);

  const getFileExtension = (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
  };

  const truncateFilename = (filename: string, maxLength: number = 30): string => {
    if (filename.length <= maxLength) return filename;
    const ext = filename.split('.').pop() || '';
    const nameWithoutExt = filename.slice(0, filename.length - ext.length - 1);
    const truncated = nameWithoutExt.slice(0, maxLength - ext.length - 4) + '...';
    return `${truncated}.${ext}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileTypeIcon = (contentType: string, extension: string) => {
    if (contentType?.startsWith('application/pdf')) {
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-red-600 rounded text-white text-xs font-bold">
          PDF
        </div>
      );
    }
    if (contentType?.includes('word') || extension === 'DOC' || extension === 'DOCX') {
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded text-white text-xs font-bold">
          DOC
        </div>
      );
    }
    if (contentType?.includes('sheet') || extension === 'XLS' || extension === 'XLSX') {
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-green-600 rounded text-white text-xs font-bold">
          XLS
        </div>
      );
    }
    if (contentType?.includes('epub') || extension === 'EPUB') {
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-teal-600 rounded text-white text-xs font-bold">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      );
    }
    if (contentType?.startsWith('audio/')) {
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-purple-600 rounded text-white text-xs font-bold">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 flex items-center justify-center bg-gray-600 rounded text-white text-xs font-bold">
        {extension.slice(0, 3)}
      </div>
    );
  };

  // Render video with thumbnail and duration
  if (isVideo && fileInfo) {
    return (
      <>
        <div 
          className="relative rounded-lg overflow-hidden cursor-pointer group max-w-[400px] bg-black"
          onClick={onClick}
        >
          {videoThumbnail ? (
            <>
              <img
                src={videoThumbnail}
                alt={fileInfo.filename}
                className="w-full h-auto max-h-[300px] object-cover"
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* Duration badge */}
              {videoDuration && (
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/80 text-white text-xs font-medium">
                  {videoDuration}
                </div>
              )}
              {/* More actions button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoreActionsClick(e);
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded bg-black/80 hover:bg-black flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="More actions"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
            </>
          ) : (
            <>
              {/* Fallback: Use video element as thumbnail */}
              <video
                src={fileUrl}
                className="w-full h-auto max-h-[300px] object-cover"
                preload="metadata"
                muted
                playsInline
                crossOrigin="use-credentials"
                onLoadedMetadata={(e) => {
                  const video = e.currentTarget;
                  const duration = video.duration;
                  const minutes = Math.floor(duration / 60);
                  const seconds = Math.floor(duration % 60);
                  setVideoDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
                }}
              />
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-black ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              {/* Duration badge */}
              {videoDuration && (
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/80 text-white text-xs font-medium">
                  {videoDuration}
                </div>
              )}
              {/* More actions button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMoreActionsClick(e);
                }}
                className="absolute top-2 right-2 w-8 h-8 rounded bg-black/80 hover:bg-black flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="More actions"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
            </>
          )}
        </div>
        
        {/* Context Menu */}
        {showContextMenu && fileInfo && (
          <FileContextMenu
            file={fileInfo}
            workspaceId={workspaceId}
            onClose={() => setShowContextMenu(false)}
            position={menuPosition}
          />
        )}
      </>
    );
  }

  // Render PDF preview card
  if (isPdf && fileInfo) {
    return (
      <>
        <div
          onClick={onClick}
          className="w-full max-w-[600px] bg-[rgb(30,30,30)] hover:bg-[rgb(35,35,35)] rounded-lg overflow-hidden cursor-pointer transition-colors shadow-lg"
        >
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3 bg-[rgb(40,40,40)]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded bg-[#D1453B] text-white shadow-md">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                <path d="M14 2v6h6" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-[15px] font-semibold truncate">
                {fileInfo.filename}
              </div>
              <div className="text-[13px] text-[rgb(209,210,211)] mt-0.5">
                View PDF in Slack
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(downloadUrl, '_blank');
              }}
              className="w-9 h-9 rounded hover:bg-[rgb(60,56,54)] flex items-center justify-center text-[rgb(209,210,211)] hover:text-white transition-colors"
              title="Download"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(fileUrl, '_blank');
              }}
              className="w-9 h-9 rounded hover:bg-[rgb(60,56,54)] flex items-center justify-center text-[rgb(209,210,211)] hover:text-white transition-colors"
              title="Open in new tab"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
            <button
              onClick={handleMoreActionsClick}
              className="w-9 h-9 rounded hover:bg-[rgb(60,56,54)] flex items-center justify-center text-[rgb(209,210,211)] hover:text-white transition-colors"
              title="More actions"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* PDF Preview */}
        <div className="bg-gradient-to-b from-[rgb(50,50,50)] to-[rgb(40,40,40)] border-t border-[rgb(60,56,54)]">
          <iframe
            title={`PDF preview of ${fileInfo.filename}`}
            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
            className="w-full h-[400px] bg-white pointer-events-none"
            loading="lazy"
          />
        </div>
      </div>
      
      {/* Context Menu */}
      {showContextMenu && fileInfo && (
        <FileContextMenu
          file={fileInfo}
          workspaceId={workspaceId}
          onClose={() => setShowContextMenu(false)}
          position={menuPosition}
        />
      )}
    </>
    );
  }

  // Render PowerPoint preview card
  if (isPpt && fileInfo) {
    return (
      <>
        <div
          onClick={onClick}
          className="w-full max-w-[600px] bg-[rgb(30,30,30)] hover:bg-[rgb(35,35,35)] rounded-lg overflow-hidden cursor-pointer transition-colors shadow-lg"
        >
        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3 bg-[rgb(40,40,40)]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded bg-[#D24625] text-white shadow-md">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                <path d="M14 2v6h6" />
                <text x="7" y="17" fontSize="8" fontWeight="bold" fill="white">P</text>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-[15px] font-semibold truncate">
                {fileInfo.filename}
              </div>
              <div className="text-[13px] text-[rgb(209,210,211)] mt-0.5">
                PowerPoint Presentation
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(downloadUrl, '_blank');
              }}
              className="w-9 h-9 rounded hover:bg-[rgb(60,56,54)] flex items-center justify-center text-[rgb(209,210,211)] hover:text-white transition-colors"
              title="Download"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(fileUrl, '_blank');
              }}
              className="w-9 h-9 rounded hover:bg-[rgb(60,56,54)] flex items-center justify-center text-[rgb(209,210,211)] hover:text-white transition-colors"
              title="Open in new tab"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
            <button
              onClick={handleMoreActionsClick}
              className="w-9 h-9 rounded hover:bg-[rgb(60,56,54)] flex items-center justify-center text-[rgb(209,210,211)] hover:text-white transition-colors"
              title="More actions"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Preview Area */}
        <div className="bg-gradient-to-b from-[rgb(50,50,50)] to-[rgb(40,40,40)] border-t border-[rgb(60,56,54)] p-8">
          <div className="bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="relative aspect-[16/9] bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
              <div className="text-center">
                <div className="mb-4">
                  <svg className="w-20 h-20 mx-auto text-[#D24625] opacity-50" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </div>
                <div className="text-gray-600 text-lg font-medium">PowerPoint Presentation</div>
                <div className="text-gray-500 text-sm mt-1">Click to view</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Context Menu */}
      {showContextMenu && fileInfo && (
        <FileContextMenu
          file={fileInfo}
          workspaceId={workspaceId}
          onClose={() => setShowContextMenu(false)}
          position={menuPosition}
        />
      )}
    </>
    );
  }

  // Render audio player
  if (isAudio && fileInfo) {
    return (
      <>
        <div className="w-full max-w-[500px] bg-[rgb(40,40,40)] rounded-lg border border-[rgb(60,56,54)] overflow-hidden relative group">
          <div className="px-4 py-3 flex items-center gap-3">
            <button className="w-10 h-10 flex-shrink-0 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-colors">
              <svg className="w-5 h-5 text-gray-800 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-white text-[13px] font-medium truncate mb-1">
                {fileInfo.filename}
              </div>
              <audio
                src={fileUrl}
                controls
                controlsList="nodownload"
                className="w-full h-8"
                style={{
                  filter: 'invert(1) hue-rotate(180deg)',
                }}
                onLoadedMetadata={(e) => {
                  const audio = e.currentTarget;
                  // Duration can be accessed via audio.duration if needed in the future
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleMoreActionsClick}
                className="w-8 h-8 rounded hover:bg-[rgb(60,56,54)] flex items-center justify-center text-[rgb(209,210,211)] hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                title="More actions"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Context Menu */}
        {showContextMenu && fileInfo && (
          <FileContextMenu
            file={fileInfo}
            workspaceId={workspaceId}
            onClose={() => setShowContextMenu(false)}
            position={menuPosition}
          />
        )}
      </>
    );
  }

  // Render inline image thumbnail
  if (isImage && fileInfo) {
    return (
      <>
        <div 
          className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity max-w-[400px] bg-[rgb(49,48,44)] relative group"
          onClick={onClick}
        >
          <img
            src={fileUrl}
            alt={fileInfo.filename}
            className="w-full h-auto max-h-[300px] object-contain"
            crossOrigin="use-credentials"
            onError={(e) => {
              console.error('Image load error:', fileInfo.filename, fileInfo.contentType);
              // Only set error if we're sure it's an image
              const extension = fileInfo.filename.split('.').pop()?.toLowerCase() || '';
              if (fileInfo.contentType?.startsWith('image/') || 
                  ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) {
                // Try loading without inline parameter as fallback
                const altUrl = downloadUrl;
                if (altUrl !== fileUrl) {
                  e.currentTarget.src = altUrl;
                } else {
                  setIsImage(false);
                }
              } else {
                setIsImage(false);
              }
            }}
            onLoad={() => {
              // Image loaded successfully
              setIsImage(true);
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMoreActionsClick(e);
            }}
            className="absolute top-2 right-2 w-8 h-8 rounded bg-[rgb(49,48,44)]/80 hover:bg-[rgb(49,48,44)] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="More actions"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>
        </div>
        
        {/* Context Menu */}
        {showContextMenu && fileInfo && (
          <FileContextMenu
            file={fileInfo}
            workspaceId={workspaceId}
            onClose={() => setShowContextMenu(false)}
            position={menuPosition}
          />
        )}
      </>
    );
  }

  // Render file card for other types
  if (!fileInfo) {
    return (
      <div className="w-full max-w-[400px] px-3 py-2 bg-[rgb(49,48,44)] rounded border border-[rgb(60,56,54)] animate-pulse">
        <div className="h-10 bg-[rgb(60,56,54)] rounded"></div>
      </div>
    );
  }

  const extension = getFileExtension(fileInfo.filename);

  return (
    <>
      <div className="flex items-center gap-3 px-3 py-2 bg-[rgb(49,48,44)] hover:bg-[rgb(60,56,54)] rounded border border-[rgb(60,56,54)] transition-colors w-full max-w-[400px] group relative">
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          {getFileTypeIcon(fileInfo.contentType, extension)}
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white font-medium truncate">
              {truncateFilename(fileInfo.filename)}
            </div>
            <div className="text-xs text-[rgb(209,210,211)]">
              {extension} • {formatFileSize(fileInfo.length)}
            </div>
          </div>
          <svg className="w-5 h-5 text-[rgb(209,210,211)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
        <button
          onClick={handleMoreActionsClick}
          className="w-8 h-8 rounded hover:bg-[rgb(60,56,54)] flex items-center justify-center text-[rgb(209,210,211)] hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          title="More actions"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      </div>
      
      {/* Context Menu */}
      {showContextMenu && fileInfo && (
        <FileContextMenu
          file={fileInfo}
          workspaceId={workspaceId}
          onClose={() => setShowContextMenu(false)}
          position={menuPosition}
        />
      )}
    </>
  );
};

const ListAttachment: React.FC<{ listId: string | ListData }> = ({ listId }) => {
  const [listData, setListData] = useState<ListData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListData = async () => {
      try {
        // If listId is already an object (populated), use it directly
        if (typeof listId === 'object' && listId !== null) {
          setListData(listId as ListData);
          setIsLoading(false);
          return;
        }
        
        // Otherwise, fetch by ID
        const data = await getList(listId as string);
        setListData(data);
      } catch (error) {
        console.error('Failed to fetch list data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchListData();
  }, [listId]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-[rgb(49,48,44)] rounded border border-[rgb(60,56,54)]">
        <div className="w-5 h-5 bg-yellow-500 rounded animate-pulse"></div>
        <span className="text-sm text-[rgb(209,210,211)]">Loading list...</span>
      </div>
    );
  }

  if (!listData) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 bg-[rgb(49,48,44)] rounded border border-[rgb(60,56,54)]">
        <div className="w-5 h-5 bg-gray-500 rounded"></div>
        <span className="text-sm text-[rgb(209,210,211)]">List not found</span>
      </div>
    );
  }

  return (
    <div 
      className="flex items-center gap-3 px-3 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg cursor-pointer hover:bg-yellow-500/30 transition-colors"
      onClick={() => {
        // TODO: Open list view modal
        const actualId = typeof listId === 'string' ? listId : listId._id;
        console.log('Open list:', actualId);
      }}
    >
      <div className="w-5 h-5 bg-yellow-500 rounded flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white font-medium truncate">
          {listData.title}
        </div>
        {listData.description && (
          <div className="text-xs text-yellow-200 truncate">
            {listData.description}
          </div>
        )}
      </div>
      <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </div>
  );
};

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  user,
  isCurrentUser,
  showAvatar,
  threadCount,
  isEditing,
  isPinned = false,
  onEdit,
  onDelete,
  onOpenThread,
  onReaction,
  onMarkUnread,
  onPin,
  onUserClick,
  formatTime,
}) => {
  const { currentWorkspaceId } = useWorkspace();
  const [isHovered, setIsHovered] = useState(false);
  const [showEditInput, setShowEditInput] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [viewerFileId, setViewerFileId] = useState<string | null>(null);
  const [viewerFileInfo, setViewerFileInfo] = useState<FileMetadata | null>(null);

  useEffect(() => {
    setShowEditInput(isEditing);
  }, [isEditing]);

  const handleEditClick = () => {
    setShowEditInput(true);
    setEditText(message.content);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.content) {
      onEdit(editText.trim());
    }
    setShowEditInput(false);
  };

  const handleCancelEdit = () => {
    setEditText(message.content);
    setShowEditInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleFileClick = async (fileId: string) => {
    const info = await getFileInfo(fileId);
    if (
      info &&
      (info.contentType?.startsWith('image/') ||
        info.contentType?.startsWith('video/') ||
        info.contentType?.includes('pdf') ||
        info.contentType?.includes('presentation') ||
        info.filename?.toLowerCase().endsWith('.ppt') ||
        info.filename?.toLowerCase().endsWith('.pptx'))
    ) {
      setViewerFileId(fileId);
      setViewerFileInfo(info);
    }
  };

  return (
    <div
      className={`flex py-2 px-5 group relative hover:bg-[rgb(26,27,30)] ${showAvatar ? '' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mr-2">
        {showAvatar ? (
          <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-[rgba(232,232,232,0.13)] text-white text-sm font-semibold">
            {user.username?.charAt(0).toUpperCase() || 'U'}
          </div>
        ) : (
          <div className="w-9 h-9"></div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {showAvatar && (
          <div className="flex items-center mb-0.5">
            <button
              onClick={() => onUserClick?.(user)}
              className="text-[15px] font-black text-[rgb(248,248,248)] mr-2 hover:underline cursor-pointer"
            >
              {user.username || 'Unknown User'}
            </button>
            <span className="text-[12px] font-normal text-[rgb(171,171,173)] hover:underline cursor-pointer">
              {formatTime(new Date(message.createdAt))}
            </span>
          </div>
        )}

        {/* Message Text */}
        <div className="relative group/message">
          {showEditInput ? (
            <div className="bg-[rgb(26,29,33)] border border-[rgb(18,100,163)] rounded px-3 py-2 shadow-sm">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full resize-none outline-none text-[15px] text-white bg-transparent"
                rows={Math.min(editText.split('\n').length, 10)}
                autoFocus
              />
              <div className="flex items-center mt-2 text-xs text-[rgb(209,210,211)]">
                <span>Press Enter to save, Esc to cancel</span>
              </div>
            </div>
          ) : (
            <>
              <div className="text-[15px] text-white break-words leading-[1.46668]">
                <div className="message-content">
                  {/* Check if content contains HTML tags or is markdown */}
                  {containsHtmlTags(message.content) ? (() => {
                    const sanitized = sanitizeHtml(convertEmojiShortcodes(message.content));
                    // If sanitization fails or removes all content, fall back to markdown
                    if (!sanitized || sanitized.trim() === '') {
                      return (
                        <>
                          {parseMarkdown(message.content).map((part, idx) => (
                            <React.Fragment key={idx}>{part}</React.Fragment>
                          ))}
                        </>
                      );
                    }
                    return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
                  })() : (
                    <>
                      {parseMarkdown(message.content).map((part, idx) => (
                        <React.Fragment key={idx}>{part}</React.Fragment>
                      ))}
                    </>
                  )}
                </div>
                {message.updatedAt && message.updatedAt !== message.createdAt && (
                  <span className="text-[12px] text-[rgb(209,210,211)] ml-1">(edited)</span>
                )}
              </div>

              {/* File Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2">
                  {/* Header with file count and download all */}
                  {message.attachments.length > 1 && (
                    <div className="flex items-center gap-2 mb-2">
                      <button 
                        className="text-sm text-[rgb(209,210,211)] hover:text-white flex items-center gap-1"
                        onClick={() => {
                          message.attachments?.forEach((fileId) => {
                            const url = getFileUrl(fileId, false);
                            window.open(url, '_blank');
                          });
                        }}
                      >
                        <span className="font-medium">{message.attachments.length} files</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Download all</span>
                      </button>
                      <button className="text-sm text-[rgb(209,210,211)] hover:text-white">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {/* Files list */}
                  <div className="space-y-2">
                    {message.attachments.map((fileId) => (
                      <FileAttachment 
                        key={fileId} 
                        fileId={fileId}
                        onClick={() => handleFileClick(fileId)}
                        workspaceId={currentWorkspaceId || ''}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* List Attachments */}
              {message.listAttachments && message.listAttachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.listAttachments.map((listId) => (
                    <ListAttachment key={typeof listId === 'string' ? listId : listId._id} listId={listId} />
                  ))}
                </div>
              )}

              {/* Reaction Bar */}
              <div className="flex items-center gap-1 mt-1">
                {message.reactions && message.reactions.map((reaction) => {
                  const users = reaction.reactedToBy || [];
                  return users.length > 0 ? (
                    <button
                      key={reaction.emoji}
                      onClick={() => onReaction(reaction.emoji)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
                        users.some((userId: string) => userId === user._id)
                          ? 'bg-[rgb(0,116,217)] text-white'
                          : 'bg-[rgb(49,48,44)] text-[rgb(209,210,211)] hover:bg-[rgb(60,56,54)]'
                      }`}
                    >
                      <span>{reaction.emoji}</span>
                      <span>{users.length}</span>
                    </button>
                  ) : null;
                })}
              </div>
            </>
          )}
        </div>

        {/* Thread Reply */}
        {threadCount > 0 && (
          <button
            onClick={onOpenThread}
            className="flex items-center gap-1.5 mt-2 text-[13px] text-[rgb(18,100,163)] hover:underline font-medium"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 3.5C3 2.67157 3.67157 2 4.5 2H11.5C12.3284 2 13 2.67157 13 3.5V9.5C13 10.3284 12.3284 11 11.5 11H9L6 14V11H4.5C3.67157 11 3 10.3284 3 9.5V3.5Z" />
            </svg>
            <span>{threadCount} {threadCount === 1 ? 'reply' : 'replies'}</span>
          </button>
        )}
      </div>

      {/* Hover Actions */}
      {isHovered && !showEditInput && (
        <div className="absolute -top-5 right-5 flex items-center gap-0 bg-[rgb(26,29,33)] rounded-xl shadow-[rgba(232,232,232,0.13)_0px_0px_0px_1px,rgba(0,0,0,0.08)_0px_1px_3px_0px] p-1">
          {/* Quick emoji reactions */}
          <button
            onClick={() => onReaction('✅')}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgb(49,48,44)] text-[rgb(171,171,173)] transition-colors p-1"
            title="React with white check mark"
          >
            <span className="text-base">✅</span>
          </button>
          <button
            onClick={() => onReaction('👀')}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgb(49,48,44)] text-[rgb(171,171,173)] transition-colors p-1"
            title="React with eyes"
          >
            <span className="text-base">👀</span>
          </button>
          <button
            onClick={() => onReaction('🙌')}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgb(49,48,44)] text-[rgb(171,171,173)] transition-colors p-1"
            title="React with raised hands"
          >
            <span className="text-base">🙌</span>
          </button>

          {/* React button with label */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="flex items-center gap-0.5 h-8 px-2 rounded-lg hover:bg-[rgb(49,48,44)] text-[rgb(171,171,173)] transition-colors"
            title="Add reaction"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M15.5 1a.75.75 0 0 1 .75.75v2h2a.75.75 0 0 1 0 1.5h-2v2a.75.75 0 0 1-1.5 0v-2h-2a.75.75 0 0 1 0-1.5h2v-2A.75.75 0 0 1 15.5 1m-13 10a6.5 6.5 0 0 1 7.166-6.466.75.75 0 0 0 .152-1.493 8 8 0 1 0 7.14 7.139.75.75 0 0 0-1.492.152A7 7 0 0 1 15.5 11a6.5 6.5 0 1 1-13 0m4.25-.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5m4.5 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5M9 15c1.277 0 2.553-.724 3.06-2.173.148-.426-.209-.827-.66-.827H6.6c-.452 0-.808.4-.66.827C6.448 14.276 7.724 15 9 15" clipRule="evenodd" />
            </svg>
            <span className="text-[12px] font-bold leading-[18px] whitespace-nowrap">React</span>
          </button>

          {/* Reply button with label */}
          <button
            onClick={onOpenThread}
            className="flex items-center gap-0.5 h-8 px-2 rounded-lg hover:bg-[rgb(49,48,44)] text-[rgb(171,171,173)] transition-colors"
            title="Reply in thread"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a7 7 0 1 0 3.394 13.124.75.75 0 0 1 .542-.074l2.794.68-.68-2.794a.75.75 0 0 1 .073-.542A7 7 0 0 0 10 3m-8.5 7a8.5 8.5 0 1 1 16.075 3.859l.904 3.714a.75.75 0 0 1-.906.906l-3.714-.904A8.5 8.5 0 0 1 1.5 10M6 8.25a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 8.25M6.75 11a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd" />
            </svg>
            <span className="text-[12px] font-bold leading-[18px] whitespace-nowrap">Reply</span>
          </button>

          {/* More actions menu */}
          <button
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setContextMenuPosition({
                x: rect.left,
                y: rect.bottom + 5,
              });
              setShowContextMenu(true);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgb(49,48,44)] text-[rgb(171,171,173)] transition-colors"
            title="More actions"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5m0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5m-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <div className="absolute top-0 right-0 z-20">
          <EmojiPicker
            onSelectEmoji={(emoji: string) => {
              onReaction(emoji);
              setShowEmojiPicker(false);
            }}
            onClose={() => setShowEmojiPicker(false)}
          />
        </div>
      )}

      {/* Message Context Menu */}
      {showContextMenu && (
        <MessageContextMenu
          isCurrentUser={isCurrentUser}
          onEdit={handleEditClick}
          onDelete={onDelete}
          onMarkUnread={onMarkUnread}
          onPin={onPin}
          isPinned={isPinned}
          onClose={() => setShowContextMenu(false)}
          position={contextMenuPosition}
        />
      )}

      {/* File Viewer Modal */}
      {viewerFileId && (
        <FileViewer
          fileId={viewerFileId}
          fileInfo={viewerFileInfo}
          onClose={() => {
            setViewerFileId(null);
            setViewerFileInfo(null);
          }}
        />
      )}
    </div>
  );
};

export default MessageItem;
