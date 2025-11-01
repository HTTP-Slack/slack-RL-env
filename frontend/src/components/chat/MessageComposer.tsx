import React, { useState, useRef, useEffect } from 'react';
import { insertMarkdown, parseMarkdown } from '../../utils/markdown';
import { useWorkspace } from '../../context/WorkspaceContext';
import { uploadFiles } from '../../services/fileApi';

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

  return (
    <div className="p-message_pane_input">
      {userName && (
        <div className="mb-2 text-[13px] text-[rgb(209,210,211)] leading-[1.38463]">
          <span className="font-semibold text-white">{userName}</span> has paused their notifications
        </div>
      )}
      <div 
        ref={containerRef}
        className={`bg-[rgb(26,29,33)] rounded-lg border transition-colors relative ${
          isFocused ? 'border-[rgb(29,28,29)] shadow-[0_0_0_1px_rgb(29,28,29),0_0_0_5px_rgba(29,122,177,0.3)]' : 'border-[rgb(134,134,134)]'
        }`}
        onClick={handleContainerClick}
      >
        {/* Formatting Toolbar - Top */}
        <div className="px-2 pt-1 pb-1 border-b border-[rgb(60,56,54)] flex items-center gap-0 bg-[rgb(30,30,30)]">
          <button 
            onClick={(e) => handleFormatClick(e, 'bold')}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
              activeFormats.has('bold') 
                ? 'bg-[rgb(60,56,54)] text-white' 
                : 'hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]'
            }`} 
            title="Bold"
          >
            <span className="text-[13px] font-bold">B</span>
          </button>
          <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-0.5"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'italic')}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
              activeFormats.has('italic') 
                ? 'bg-[rgb(60,56,54)] text-white' 
                : 'hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]'
            }`} 
            title="Italic"
          >
            <span className="text-[13px] italic font-serif">I</span>
          </button>
          <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-0.5"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'underline')}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
              activeFormats.has('underline') 
                ? 'bg-[rgb(60,56,54)] text-white' 
                : 'hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]'
            }`} 
            title="Underline"
          >
            <span className="text-[13px] underline">U</span>
          </button>
          <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-0.5"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'strikethrough')}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
              activeFormats.has('strikethrough') 
                ? 'bg-[rgb(60,56,54)] text-white' 
                : 'hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]'
            }`} 
            title="Strikethrough"
          >
            <span className="text-[13px] line-through">S</span>
          </button>
          <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-0.5"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'link')}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)] transition-colors" 
            title="Link"
          >
            <svg className="w-4 h-4" viewBox="0 0 14 14" fill="currentColor">
              <path d="M6.5 9.5l-1 1c-.6.6-1.6.6-2.1 0-.6-.6-.6-1.6 0-2.1l2-2c.6-.6 1.6-.6 2.1 0 .1.1.2.2.2.4h1.5c0-.5-.2-.9-.5-1.3-1.2-1.2-3.1-1.2-4.2 0l-2 2c-1.2 1.2-1.2 3.1 0 4.2 1.2 1.2 3.1 1.2 4.2 0l1-1h-1.2zm5.5-5.5l-1 1h1.2l1-1c.6-.6.6-1.6 0-2.1-.6-.6-1.6-.6-2.1 0l-2 2c-.6.6-.6 1.6 0 2.1.1.1.2.2.4.2V4.7c-.5 0-.9-.2-1.3-.5-1.2-1.2-1.2-3.1 0-4.2l2-2c1.2-1.2 3.1-1.2 4.2 0 1.2 1.2 1.2 3.1 0 4.2z"></path>
            </svg>
          </button>
          <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-0.5"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'orderedList')}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
              activeFormats.has('orderedList') 
                ? 'bg-[rgb(60,56,54)] text-white' 
                : 'hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]'
            }`} 
            title="Numbered list"
          >
            <svg className="w-4 h-4" viewBox="0 0 14 14" fill="currentColor">
              <path d="M1 2h2v1H1V2zm0 3h2v1H1V5zm0 3h2v1H1V8zm0 3h2v1H1v-1z"></path>
              <path d="M5 2h8v1H5V2zm0 3h8v1H5V5zm0 3h8v1H5V8zm0 3h8v1H5v-1z"></path>
            </svg>
          </button>
          <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-0.5"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'bulletList')}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
              activeFormats.has('bulletList') 
                ? 'bg-[rgb(60,56,54)] text-white' 
                : 'hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]'
            }`} 
            title="Bulleted list"
          >
            <svg className="w-4 h-4" viewBox="0 0 14 14" fill="currentColor">
              <circle cx="2" cy="3" r="1" fill="currentColor"></circle>
              <circle cx="2" cy="7" r="1" fill="currentColor"></circle>
              <circle cx="2" cy="11" r="1" fill="currentColor"></circle>
              <line x1="4" y1="3" x2="12" y2="3" stroke="currentColor" strokeWidth="1"></line>
              <line x1="4" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1"></line>
              <line x1="4" y1="11" x2="12" y2="11" stroke="currentColor" strokeWidth="1"></line>
            </svg>
          </button>
          <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-0.5"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'codeBlock')}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
              activeFormats.has('codeBlock') 
                ? 'bg-[rgb(60,56,54)] text-white' 
                : 'hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]'
            }`} 
            title="Code block"
          >
            <span className="text-[13px] font-mono">&lt; /&gt;</span>
          </button>
          <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-0.5"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'code')}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
              activeFormats.has('code') 
                ? 'bg-[rgb(60,56,54)] text-white' 
                : 'hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]'
            }`} 
            title="Inline code"
          >
            <span className="text-[13px] font-mono">&lt;/&gt;</span>
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
        <div className="px-3 pb-2 flex items-center justify-between border-t border-[rgb(60,56,54)] bg-[rgb(30,30,30)] relative">
          {/* Left side - Action icons */}
          <div className="flex items-center gap-1 relative">
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
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[rgb(49,48,44)] transition-colors text-left opacity-50 cursor-not-allowed"
                  disabled
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[rgb(209,210,211)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-[15px] font-medium">Recent file</div>
                  </div>
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
              title="Format"
            >
              <span className="text-[13px] font-medium underline">Aa</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)] transition-colors" title="Emoji">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" fill="none"></circle>
                <circle cx="5.5" cy="7" r="1" fill="currentColor"></circle>
                <circle cx="10.5" cy="7" r="1" fill="currentColor"></circle>
                <path d="M5.5 10.5c0.5 1.5 2 2.5 3.5 2.5s3-1 3.5-2.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round"></path>
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)] transition-colors" title="Mention">
              <span className="text-[13px] font-medium">@</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)] transition-colors" title="Video call">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="4" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1" fill="none"></rect>
                <path d="M12 6l2-2v6l-2-2" stroke="currentColor" strokeWidth="1" fill="none"></path>
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)] transition-colors" title="Voice message">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <rect x="4" y="3" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1" fill="none"></rect>
                <path d="M6 6h4M6 8h4M6 10h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"></path>
                <circle cx="8" cy="8" r="1" fill="currentColor"></circle>
              </svg>
            </button>
            <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-1"></div>
            <button 
              onClick={handleAttachClick}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)] transition-colors" 
              title="Attach file"
              disabled={uploadingFiles}
            >
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="12" height="8" rx="1"></rect>
                <path d="M6 8h4"></path>
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

          {/* Right side - Hint text and send button */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[rgb(209,210,211)]">
              <span className="font-medium text-white">Shift + Return</span> to add a new line
            </span>
            <div className="flex items-center gap-0">
              <button
                onClick={handleSend}
                disabled={(!text.trim() && selectedFiles.length === 0) || uploadingFiles}
                className="px-3 py-1.5 bg-[rgb(46,204,113)] hover:bg-[rgb(42,185,103)] disabled:opacity-40 disabled:cursor-not-allowed rounded-l flex items-center gap-1.5 transition-colors"
                title="Send"
              >
                {uploadingFiles ? (
                  <span className="text-white text-xs">Uploading...</span>
                ) : (
                  <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M1.5 8l12-6v12L1.5 8zm12-4L4.5 8l9 4V4z" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                )}
              </button>
              <div className="w-[1px] h-4 bg-white/30"></div>
              <button
                className="px-1.5 py-1.5 bg-[rgb(46,204,113)] hover:bg-[rgb(42,185,103)] disabled:opacity-40 disabled:cursor-not-allowed rounded-r transition-colors"
                title="Send options"
                disabled={(!text.trim() && selectedFiles.length === 0) || uploadingFiles}
              >
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 9l-3-3 3-3 3 3-3 3z"></path>
                </svg>
              </button>
            </div>
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
  );
};

export default MessageComposer;
