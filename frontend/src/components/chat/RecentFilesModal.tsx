import React, { useEffect, useState } from 'react';
import { getRecentFiles, formatRelativeTime } from '../../services/recentFilesService';

interface RecentFilesModalProps {
  onClose: () => void;
  onSelectFile: (fileId: string) => void;
}

const RecentFilesModal: React.FC<RecentFilesModalProps> = ({ onClose, onSelectFile }) => {
  const [recentFiles, setRecentFiles] = useState(getRecentFiles());
  
  // Refresh recent files when modal opens
  useEffect(() => {
    setRecentFiles(getRecentFiles());
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const getFileIcon = (contentType: string, filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    if (contentType.startsWith('image/')) {
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-white rounded text-gray-800 flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    }
    
    if (contentType.startsWith('video/')) {
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-black rounded text-white flex-shrink-0">
          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      );
    }
    
    if (contentType.startsWith('audio/')) {
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded text-white flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
      );
    }
    
    if (contentType.includes('pdf')) {
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-red-600 rounded text-white text-xs font-bold flex-shrink-0">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
            <path d="M14 2v6h6" />
            <path d="M16 13H8v-2h8v2zm0 4H8v-2h8v2zm-4-8H8V7h4v2z" />
          </svg>
        </div>
      );
    }
    
    if (contentType.includes('presentation') || ['ppt', 'pptx'].includes(extension)) {
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-[#D24625] rounded text-white text-xs font-bold flex-shrink-0">
          <span className="text-sm font-bold">P</span>
        </div>
      );
    }
    
    if (extension === 'epub') {
      return (
        <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded text-white flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
      );
    }
    
    return (
      <div className="w-10 h-10 flex items-center justify-center bg-gray-600 rounded text-white flex-shrink-0">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 pointer-events-none"
      onClick={onClose}
    >
      {/* Side Panel */}
      <div 
        className="absolute top-0 right-0 h-full w-[400px] bg-[rgb(34,37,41)] border-l border-[rgb(60,56,54)] shadow-2xl flex flex-col pointer-events-auto animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgb(60,56,54)]">
          <h2 className="text-[15px] font-semibold text-white">Recent files</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded hover:bg-[rgb(49,48,44)] flex items-center justify-center text-[rgb(209,210,211)] hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Files List */}
        <div className="flex-1 overflow-y-auto">
          {recentFiles.length === 0 ? (
            <div className="text-center py-12 px-4">
              <svg className="w-12 h-12 mx-auto mb-3 text-[rgb(209,210,211)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-[rgb(209,210,211)] text-sm">No recent files</p>
            </div>
          ) : (
            <div className="py-2">
              {recentFiles.map((file) => (
                <button
                  key={file.id}
                  onClick={() => {
                    onSelectFile(file.id);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[rgb(49,48,44)] transition-colors text-left group"
                >
                  {getFileIcon(file.contentType, file.filename)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-[13px] font-medium truncate">
                      {file.filename}
                    </div>
                    <div className="text-[rgb(209,210,211)] text-[12px] mt-0.5">
                      {formatRelativeTime(file.uploadedAt)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentFilesModal;

