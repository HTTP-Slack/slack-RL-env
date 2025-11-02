import React, { useState, useRef, useEffect } from 'react';
import { insertMarkdown, parseMarkdown } from '../../utils/markdown';
import { useWorkspace } from '../../context/WorkspaceContext';
import { uploadFiles } from '../../services/fileApi';
import RecentFilesModal from './RecentFilesModal';
import EmojiPicker from './EmojiPicker';

interface MessageComposerProps {
  onSend: (text: string) => void;
  placeholder?: string;
  userName?: string;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ onSend, placeholder = 'Message...', userName }) => {
  const { sendMessage, activeConversation, currentWorkspaceId } = useWorkspace();
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showRecentFiles, setShowRecentFiles] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  
  // Track active formatting states
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  useEffect(() => {
    const textarea = textareaRef.current;
    const overlay = overlayRef.current;
    if (!textarea || !overlay) return;

    // Sync scroll between textarea and overlay
    const handleScroll = () => {
      overlay.scrollTop = textarea.scrollTop;
    };
    textarea.addEventListener('scroll', handleScroll);
    
    // Sync height and scroll
    textarea.style.height = 'auto';
    const height = Math.min(textarea.scrollHeight, 150);
    textarea.style.height = `${height}px`;
    overlay.style.height = `${height}px`;
    overlay.scrollTop = textarea.scrollTop;
    
    return () => {
      textarea.removeEventListener('scroll', handleScroll);
    };
  }, [text]);

  useEffect(() => {
    // Check active formatting at cursor position
    const textarea = textareaRef.current;
    if (!textarea || !text) {
      setActiveFormats(new Set());
      return;
    }
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const beforeCursor = text.slice(0, start);
    const afterCursor = text.slice(end);
    
    const formats = new Set<string>();
    
    // Check for bold
    if (beforeCursor.match(/\*\*[^*]*$/) && afterCursor.match(/^[^*]*\*\*/)) {
      formats.add('bold');
    }
    
    // Check for italic
    if ((beforeCursor.match(/\*[^*]*$/) && afterCursor.match(/^[^*]*\*/)) ||
        (beforeCursor.match(/_[^_]*$/) && !beforeCursor.match(/__[^_]*$/) && afterCursor.match(/^[^_]*_/) && !afterCursor.match(/^[^_]*__/))) {
      formats.add('italic');
    }
    
    // Check for underline
    if (beforeCursor.match(/__[^_]*$/) && afterCursor.match(/^[^_]*__/)) {
      formats.add('underline');
    }
    
    // Check for strikethrough
    if (beforeCursor.match(/~~[^~]*$/) && afterCursor.match(/^[^~]*~~/)) {
      formats.add('strikethrough');
    }
    
    // Check for code
    if (beforeCursor.match(/`[^`]*$/) && afterCursor.match(/^[^`]*`/)) {
      formats.add('code');
    }
    
    // Check for lists
    const lines = text.split('\n');
    const lineIndex = text.slice(0, start).split('\n').length - 1;
    const currentLine = lines[lineIndex] || '';
    if (currentLine.match(/^\s*\d+\.\s/) || currentLine.match(/^\s*[a-z]\.\s/i)) {
      formats.add('orderedList');
    }
    if (currentLine.match(/^\s*[-*]\s/)) {
      formats.add('bulletList');
    }
    
    setActiveFormats(formats);
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = async () => {
    const trimmedText = text.trim();
    const hasFiles = selectedFiles.length > 0;
    
    if (!trimmedText && !hasFiles) return;

    try {
      let attachmentIds: string[] = [];

      // Upload files first if any
      if (hasFiles && activeConversation && currentWorkspaceId) {
        setUploadingFiles(true);
        try {
          const uploadedFiles = await uploadFiles(
            selectedFiles,
            currentWorkspaceId,
            undefined,
            activeConversation._id
          );
          attachmentIds = uploadedFiles.map(f => f.id);
        } catch (error) {
          console.error('Error uploading files:', error);
          alert('Failed to upload files. Please try again.');
          setUploadingFiles(false);
          return;
        }
        setUploadingFiles(false);
        setSelectedFiles([]);
      }

      // Send message with attachments via socket
      if (activeConversation && currentWorkspaceId && (attachmentIds.length > 0 || trimmedText)) {
        await sendMessage(trimmedText, attachmentIds.length > 0 ? attachmentIds : undefined);
      } else {
        // Fallback to original onSend for backward compatibility
        onSend(trimmedText);
      }

      setText('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Filter files by size (25MB limit)
      const MAX_SIZE = 25 * 1024 * 1024;
      const validFiles = files.filter(file => {
        if (file.size > MAX_SIZE) {
          alert(`File ${file.name} is too large. Maximum size is 25MB.`);
          return false;
        }
        return true;
      });
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
    setShowAddMenu(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };

    if (showAddMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showAddMenu]);

  const handleFormat = (formatType: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const { newText, newCursorPosition } = insertMarkdown(text, start, end, formatType);
    setText(newText);

    // Set cursor position after markdown insertion
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  const handleFormatClick = (e: React.MouseEvent, formatType: string) => {
    e.preventDefault();
    handleFormat(formatType);
  };

  const handleContainerClick = () => {
    textareaRef.current?.focus();
  };

  const handleSelectRecentFile = async (fileId: string) => {
    // When a recent file is selected, send it as a message
    if (activeConversation && currentWorkspaceId) {
      try {
        await sendMessage('', [fileId]);
      } catch (error) {
        console.error('Error sending recent file:', error);
        alert('Failed to send file. Please try again.');
      }
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = text.slice(0, start) + emoji + text.slice(end);
    setText(newText);

    // Set cursor position after emoji
    setTimeout(() => {
      textarea.focus();
      const newPosition = start + emoji.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  return (
    <>
      {/* Recent Files Modal */}
      {showRecentFiles && (
        <RecentFilesModal
          onClose={() => setShowRecentFiles(false)}
          onSelectFile={handleSelectRecentFile}
        />
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <EmojiPicker
          onSelectEmoji={handleSelectEmoji}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

    <div className="p-message_pane_input">
      {userName && (
        <div className="mb-2 text-[13px] text-[rgb(209,210,211)] leading-[1.38463]">
          <span className="font-semibold text-white">{userName}</span> has paused their notifications
        </div>
      )}
      <div 
        ref={containerRef}
        className={`bg-[rgb(26,29,33)] rounded-lg border transition-all relative ${
          isFocused ? 'border-[rgb(209,210,211)] shadow-[0_0_0_1px_rgba(29,122,177,0.5)]' : 'border-[rgb(82,82,82)]'
        }`}
        onClick={handleContainerClick}
      >
        {/* Formatting Toolbar - Top */}
        <div className="px-3 py-1.5 border-b border-[rgb(60,56,54)] flex items-center gap-0.5 bg-[rgb(30,30,30)]">
          <button 
            onClick={(e) => handleFormatClick(e, 'bold')}
            className={`w-8 h-7 flex items-center justify-center rounded text-[rgb(209,210,211)] transition-colors ${
              activeFormats.has('bold') 
                ? 'bg-[rgb(60,56,54)]' 
                : 'hover:bg-[rgb(49,48,44)]'
            }`} 
            title="Bold"
          >
            <span className="text-sm font-bold">B</span>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'italic')}
            className={`w-8 h-7 flex items-center justify-center rounded text-[rgb(209,210,211)] transition-colors ${
              activeFormats.has('italic') 
                ? 'bg-[rgb(60,56,54)]' 
                : 'hover:bg-[rgb(49,48,44)]'
            }`} 
            title="Italic"
          >
            <span className="text-sm italic font-serif">I</span>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'underline')}
            className={`w-8 h-7 flex items-center justify-center rounded text-[rgb(209,210,211)] transition-colors ${
              activeFormats.has('underline') 
                ? 'bg-[rgb(60,56,54)]' 
                : 'hover:bg-[rgb(49,48,44)]'
            }`} 
            title="Underline"
          >
            <span className="text-sm underline">U</span>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'strikethrough')}
            className={`w-8 h-7 flex items-center justify-center rounded text-[rgb(209,210,211)] transition-colors ${
              activeFormats.has('strikethrough') 
                ? 'bg-[rgb(60,56,54)]' 
                : 'hover:bg-[rgb(49,48,44)]'
            }`} 
            title="Strikethrough"
          >
            <span className="text-sm line-through">S</span>
          </button>
          <div className="w-px h-5 bg-[rgb(60,56,54)] mx-2"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'link')}
            className="w-8 h-7 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)] transition-colors" 
            title="Link"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
            </svg>
          </button>
          <div className="w-px h-5 bg-[rgb(60,56,54)] mx-2"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'orderedList')}
            className={`w-8 h-7 flex items-center justify-center rounded text-[rgb(209,210,211)] transition-colors ${
              activeFormats.has('orderedList') 
                ? 'bg-[rgb(60,56,54)]' 
                : 'hover:bg-[rgb(49,48,44)]'
            }`} 
            title="Numbered list"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'bulletList')}
            className={`w-8 h-7 flex items-center justify-center rounded text-[rgb(209,210,211)] transition-colors ${
              activeFormats.has('bulletList') 
                ? 'bg-[rgb(60,56,54)]' 
                : 'hover:bg-[rgb(49,48,44)]'
            }`} 
            title="Bulleted list"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="3" cy="4" r="1.5" />
              <circle cx="3" cy="10" r="1.5" />
              <circle cx="3" cy="16" r="1.5" />
              <rect x="7" y="3" width="11" height="2" rx="1" />
              <rect x="7" y="9" width="11" height="2" rx="1" />
              <rect x="7" y="15" width="11" height="2" rx="1" />
            </svg>
          </button>
          <div className="w-px h-5 bg-[rgb(60,56,54)] mx-2"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'codeBlock')}
            className={`w-8 h-7 flex items-center justify-center rounded text-[rgb(209,210,211)] transition-colors ${
              activeFormats.has('codeBlock') 
                ? 'bg-[rgb(60,56,54)]' 
                : 'hover:bg-[rgb(49,48,44)]'
            }`} 
            title="Code block"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'code')}
            className={`w-8 h-7 flex items-center justify-center rounded text-[rgb(209,210,211)] transition-colors ${
              activeFormats.has('code') 
                ? 'bg-[rgb(60,56,54)]' 
                : 'hover:bg-[rgb(49,48,44)]'
            }`} 
            title="Inline code"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.854 4.854a.5.5 0 10-.708-.708l-3.5 3.5a.5.5 0 000 .708l3.5 3.5a.5.5 0 00.708-.708L2.707 8l3.147-3.146zm4.292 0a.5.5 0 01.708-.708l3.5 3.5a.5.5 0 010 .708l-3.5 3.5a.5.5 0 01-.708-.708L13.293 8l-3.147-3.146z"/>
            </svg>
          </button>
        </div>

        {/* Message Input Area - Dual Layer for Live Rendering */}
        <div className="relative px-3 pt-2 pb-1">
          {/* Overlay div for live markdown rendering */}
          <div
            ref={overlayRef}
            className="markdown-overlay absolute left-3 right-3 top-2 bottom-1 pointer-events-none overflow-y-auto"
            style={{ 
              maxHeight: '150px',
              wordWrap: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          >
            {text ? (
              <div className="text-[15px] text-white leading-[1.46668] min-h-[22px]">
                {parseMarkdown(text).map((part, idx) => (
                  <React.Fragment key={idx}>{part}</React.Fragment>
                ))}
              </div>
            ) : (
              <div className="text-[15px] text-[rgb(209,210,211)] leading-[1.46668] min-h-[22px]">
                {placeholder}
              </div>
            )}
          </div>
          
          {/* Textarea for input (transparent, but functional) */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            // Placeholder is intentionally empty to avoid double placeholders (overlay shows placeholder)
            placeholder=""
            className="textarea-overlay w-full resize-none outline-none bg-transparent text-[15px] min-h-[22px] max-h-[150px] overflow-y-auto leading-[1.46668] relative z-10 caret-white"
            rows={1}
            style={{ 
              color: 'transparent'
            }}
          />
        </div>

        {/* Action Bar - Bottom */}
        <div className="px-3 py-2 flex items-center justify-between bg-[rgb(26,29,33)] relative">
          {/* Left side - Action icons */}
          <div className="flex items-center gap-0.5 relative">
            <button 
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)] transition-colors" 
              title="Add"
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" fill="none"></circle>
                <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"></path>
              </svg>
            </button>

            {/* Add Menu Dropdown */}
            {showAddMenu && (
              <div 
                ref={addMenuRef}
                className="absolute bottom-full left-0 mb-2 w-[280px] bg-[rgb(34,37,41)] rounded-lg shadow-lg border border-[rgb(60,56,54)] py-2 z-50"
              >
                <button
                  onClick={handleAttachClick}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[rgb(49,48,44)] transition-colors text-left"
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[rgb(209,210,211)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-[15px] font-medium">Upload from your computer</div>
                  </div>
                </button>

                <div className="border-t border-[rgb(60,56,54)] my-2"></div>

                <button
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[rgb(49,48,44)] transition-colors text-left opacity-50 cursor-not-allowed"
                  disabled
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[rgb(209,210,211)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-[15px] font-medium">Canvas</div>
                  </div>
                </button>

                <button
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[rgb(49,48,44)] transition-colors text-left opacity-50 cursor-not-allowed"
                  disabled
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[rgb(209,210,211)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-[15px] font-medium">List</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowRecentFiles(true);
                    setShowAddMenu(false);
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[rgb(49,48,44)] transition-colors text-left"
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[rgb(209,210,211)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-[15px] font-medium">Recent file</div>
                  </div>
                  <svg className="w-5 h-5 text-[rgb(209,210,211)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="border-t border-[rgb(60,56,54)] my-2"></div>

                <button
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[rgb(49,48,44)] transition-colors text-left opacity-50 cursor-not-allowed"
                  disabled
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[rgb(209,210,211)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-[15px] font-medium">Text snippet</div>
                    <div className="text-[rgb(209,210,211)] text-[13px]">⌘ ⇧ ↵ Enter</div>
                  </div>
                </button>

                <button
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[rgb(49,48,44)] transition-colors text-left opacity-50 cursor-not-allowed"
                  disabled
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[rgb(209,210,211)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-[15px] font-medium">Workflow</div>
                  </div>
                </button>
              </div>
            )}
            <button 
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)] transition-colors" 
              title="Text formatting"
            >
              <span className="text-sm font-medium">Aa</span>
            </button>
            <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)] transition-colors" 
              title="Insert emoji"
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)] transition-colors" title="Mention someone">
              <span className="text-base font-medium">@</span>
            </button>
            <div className="w-px h-5 bg-[rgb(60,56,54)] mx-1"></div>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)] transition-colors" title="Start a video call">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)] transition-colors" title="Record an audio clip">
              <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="w-px h-5 bg-[rgb(60,56,54)] mx-1"></div>
            <button 
              onClick={handleAttachClick}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)] transition-colors" 
              title="Attach a file"
              disabled={uploadingFiles}
            >
              <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Right side - Send button */}
          <div className="flex items-center gap-0">
            <button
              onClick={handleSend}
              disabled={(!text.trim() && selectedFiles.length === 0) || uploadingFiles}
              className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
                (!text.trim() && selectedFiles.length === 0) || uploadingFiles
                  ? 'text-[rgb(134,134,134)] cursor-not-allowed'
                  : 'text-[rgb(209,210,211)] hover:bg-[rgb(49,48,44)]'
              }`}
              title="Send message"
            >
              {uploadingFiles ? (
                <svg className="w-[18px] h-[18px] animate-spin" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-[18px] h-[18px]" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="px-3 pt-2 pb-2 border-t border-[rgb(60,56,54)] bg-[rgb(30,30,30)]">
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-2 py-1 bg-[rgb(49,48,44)] rounded text-sm text-[rgb(209,210,211)]"
                >
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <span className="text-xs text-[rgb(134,134,134)]">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="ml-1 text-[rgb(209,210,211)] hover:text-white"
                    title="Remove file"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default MessageComposer;
