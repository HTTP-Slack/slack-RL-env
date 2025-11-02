import React, { useEffect, useRef } from 'react';
import { getShareableFileLink, copyToClipboard } from '../../services/fileApi';
import type { FileMetadata } from '../../types/file';

interface FileContextMenuProps {
  file: FileMetadata;
  workspaceId: string;
  onClose: () => void;
  position: { x: number; y: number };
}

const FileContextMenu: React.FC<FileContextMenuProps> = ({ file, workspaceId, onClose, position }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      // Clean up toast timeout if component unmounts
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [onClose]);

  const handleCopyLink = async () => {
    const shareableLink = getShareableFileLink(file.id, workspaceId, file.filename);
    const success = await copyToClipboard(shareableLink);
    
    if (success) {
      // Show a toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-[rgb(18,100,163)] text-white px-4 py-2 rounded-lg shadow-lg z-[60] text-sm';
      toast.textContent = 'Link copied to clipboard';
      document.body.appendChild(toast);
      
      toastTimeoutRef.current = setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
        toastTimeoutRef.current = null;
      }, 2000);
    } else {
      alert('Failed to copy link. Please try again.');
    }
    
    onClose();
  };

  const handleDownload = () => {
    const downloadUrl = `${window.location.origin}/api/files/${file.id}`;
    window.open(downloadUrl, '_blank');
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-[60] bg-[rgb(34,37,41)] border border-[rgb(60,56,54)] rounded-lg shadow-xl py-1 min-w-[200px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <button
        onClick={handleCopyLink}
        className="w-full px-4 py-2 text-left text-[15px] text-white hover:bg-[rgb(49,48,44)] transition-colors flex items-center justify-between"
      >
        <span>Copy link to file</span>
      </button>
      
      <div className="border-t border-[rgb(60,56,54)] my-1"></div>
      
      <button
        onClick={handleDownload}
        className="w-full px-4 py-2 text-left text-[15px] text-white hover:bg-[rgb(49,48,44)] transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span>Download</span>
      </button>
    </div>
  );
};

export default FileContextMenu;

