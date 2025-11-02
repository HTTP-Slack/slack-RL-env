import React, { useState, useRef, useEffect } from 'react';
import { insertMarkdown, parseMarkdown } from '../../utils/markdown';
import { useWorkspace } from '../../context/WorkspaceContext';
import { uploadFiles } from '../../services/fileApi';
import { getRecentFiles, formatRelativeTime } from '../../services/recentFilesService';
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
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [stickyBarPosition, setStickyBarPosition] = useState({ top: 0, left: 0 });
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(true);
  const [showRecentFilesSubmenu, setShowRecentFilesSubmenu] = useState(false);
  const [showScheduleMenu, setShowScheduleMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const stickyBarRef = useRef<HTMLDivElement>(null);
  const scheduleMenuRef = useRef<HTMLDivElement>(null);

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

  // Handle text selection for sticky formatting bar
  useEffect(() => {
    const handleSelectionChange = () => {
      const textarea = textareaRef.current;
      const container = containerRef.current;

      if (!textarea || !container) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const hasSelection = start !== end;

      if (hasSelection) {
        // Small delay to ensure selection is finalized
        setTimeout(() => {
          const containerRect = container.getBoundingClientRect();
          const parentRect = container.parentElement?.getBoundingClientRect();

          if (!parentRect) return;

          // Position the bar above the container, centered
          setStickyBarPosition({
            top: containerRect.top - parentRect.top - 45,
            left: 20
          });
          setShowStickyBar(true);
        }, 10);
      } else {
        setShowStickyBar(false);
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('mouseup', handleSelectionChange);
      textarea.addEventListener('keyup', handleSelectionChange);
      textarea.addEventListener('select', handleSelectionChange);

      return () => {
        textarea.removeEventListener('mouseup', handleSelectionChange);
        textarea.removeEventListener('keyup', handleSelectionChange);
        textarea.removeEventListener('select', handleSelectionChange);
      };
    }
  }, []);

  // Close sticky bar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stickyBarRef.current && !stickyBarRef.current.contains(event.target as Node)) {
        // Check if click is not in textarea (to allow selection)
        if (textareaRef.current && !textareaRef.current.contains(event.target as Node)) {
          setShowStickyBar(false);
        }
      }
    };

    if (showStickyBar) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showStickyBar]);

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

  // Close schedule menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (scheduleMenuRef.current && !scheduleMenuRef.current.contains(event.target as Node)) {
        setShowScheduleMenu(false);
      }
    };

    if (showScheduleMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showScheduleMenu]);

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

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = text.slice(0, start);
    const after = text.slice(end);
    
    const newText = `${before}${emoji}${after}`;
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
      {/* Sticky Formatting Bar */}
      {showStickyBar && (
        <div
          ref={stickyBarRef}
          className="absolute z-50 flex items-center gap-0 bg-[rgb(34,37,41)] rounded-lg shadow-lg border border-[rgb(60,56,54)] px-1 py-1"
          style={{
            top: `${stickyBarPosition.top}px`,
            left: `${stickyBarPosition.left}px`,
          }}
        >
          <button
            onClick={(e) => handleFormatClick(e, 'bold')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('bold')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Bold"
          >
            <svg data-qa="bold" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M4 2.75A.75.75 0 0 1 4.75 2h6.343a3.91 3.91 0 0 1 3.88 3.449A2 2 0 0 1 15 5.84l.001.067a3.9 3.9 0 0 1-1.551 3.118A4.627 4.627 0 0 1 11.875 18H4.75a.75.75 0 0 1-.75-.75V9.5a.8.8 0 0 1 .032-.218A.8.8 0 0 1 4 9.065zm2.5 5.565h3.593a2.157 2.157 0 1 0 0-4.315H6.5zm4.25 1.935H6.5v5.5h4.25a2.75 2.75 0 1 0 0-5.5" clipRule="evenodd"></path>
            </svg>
          </button>

          <button
            onClick={(e) => handleFormatClick(e, 'italic')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('italic')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Italic"
          >
            <svg data-qa="italic" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M7 2.75A.75.75 0 0 1 7.75 2h7.5a.75.75 0 0 1 0 1.5H12.3l-2.6 13h2.55a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5H7.7l2.6-13H7.75A.75.75 0 0 1 7 2.75" clipRule="evenodd"></path>
            </svg>
          </button>

          <button
            onClick={(e) => handleFormatClick(e, 'underline')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('underline')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Underline"
          >
            <svg data-qa="underline" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" d="M17.25 17.12a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5zM14.5 1.63a.75.75 0 0 1 .75.75v8a5.25 5.25 0 1 1-10.5 0v-8a.75.75 0 0 1 1.5 0v8a3.75 3.75 0 0 0 7.5 0v-8a.75.75 0 0 1 .75-.75"></path>
            </svg>
          </button>

          <button
            onClick={(e) => handleFormatClick(e, 'strikethrough')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('strikethrough')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Strikethrough"
          >
            <svg data-qa="strikethrough" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M11.721 3.84c-.91-.334-2.028-.36-3.035-.114-1.51.407-2.379 1.861-2.164 3.15C6.718 8.051 7.939 9.5 11.5 9.5l.027.001h5.723a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5h3.66c-.76-.649-1.216-1.468-1.368-2.377-.347-2.084 1.033-4.253 3.265-4.848l.007-.002.007-.002c1.252-.307 2.68-.292 3.915.16 1.252.457 2.337 1.381 2.738 2.874a.75.75 0 0 1-1.448.39c-.25-.925-.91-1.528-1.805-1.856m2.968 9.114a.75.75 0 1 0-1.378.59c.273.64.186 1.205-.13 1.674-.333.492-.958.925-1.82 1.137-.989.243-1.991.165-3.029-.124-.93-.26-1.613-.935-1.858-1.845a.75.75 0 0 0-1.448.39c.388 1.441 1.483 2.503 2.903 2.9 1.213.338 2.486.456 3.79.135 1.14-.28 2.12-.889 2.704-1.753.6-.888.743-1.992.266-3.104" clipRule="evenodd"></path>
            </svg>
          </button>

          <span className="w-[1px] h-5 bg-[rgba(232,232,232,0.13)] mx-1 self-center"></span>

          <button
            onClick={(e) => handleFormatClick(e, 'link')}
            className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]"
            title="Link"
          >
            <svg data-qa="link" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M12.306 3.756a2.75 2.75 0 0 1 3.889 0l.05.05a2.75 2.75 0 0 1 0 3.889l-3.18 3.18a2.75 2.75 0 0 1-3.98-.095l-.03-.034a.75.75 0 0 0-1.11 1.009l.03.034a4.25 4.25 0 0 0 6.15.146l3.18-3.18a4.25 4.25 0 0 0 0-6.01l-.05-.05a4.25 4.25 0 0 0-6.01 0L9.47 4.47a.75.75 0 1 0 1.06 1.06zm-4.611 12.49a2.75 2.75 0 0 1-3.89 0l-.05-.051a2.75 2.75 0 0 1 0-3.89l3.18-3.179a2.75 2.75 0 0 1 3.98.095l.03.034a.75.75 0 1 0 1.11-1.01l-.03-.033a4.25 4.25 0 0 0-6.15-.146l-3.18 3.18a4.25 4.25 0 0 0 0 6.01l.05.05a4.25 4.25 0 0 0 6.01 0l1.775-1.775a.75.75 0 0 0-1.06-1.06z" clipRule="evenodd"></path>
            </svg>
          </button>

          <button
            onClick={(e) => handleFormatClick(e, 'orderedList')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('orderedList')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Numbered list"
          >
            <svg data-qa="numbered-list" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M3.792 2.094A.5.5 0 0 1 4 2.5V6h1a.5.5 0 1 1 0 1H2a.5.5 0 1 1 0-1h1V3.194l-.842.28a.5.5 0 0 1-.316-.948l1.5-.5a.5.5 0 0 1 .45.068M7.75 3.5a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zM7 10.75a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10a.75.75 0 0 1-.75-.75m0 6.5a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10a.75.75 0 0 1-.75-.75m-4.293-3.36a1 1 0 0 1 .793-.39c.49 0 .75.38.75.75 0 .064-.033.194-.173.409a5 5 0 0 1-.594.711c-.256.267-.552.548-.87.848l-.088.084a42 42 0 0 0-.879.845A.5.5 0 0 0 2 18h3a.5.5 0 0 0 0-1H3.242l.058-.055c.316-.298.629-.595.904-.882a6 6 0 0 0 .711-.859c.18-.277.335-.604.335-.954 0-.787-.582-1.75-1.75-1.75a2 2 0 0 0-1.81 1.147.5.5 0 1 0 .905.427 1 1 0 0 1 .112-.184" clipRule="evenodd"></path>
            </svg>
          </button>

          <button
            onClick={(e) => handleFormatClick(e, 'bulletList')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('bulletList')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Bulleted list"
          >
            <svg data-qa="bulleted-list" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M4 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10A.75.75 0 0 1 7 3m.75 6.25a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zm0 7a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zM3 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2" clipRule="evenodd"></path>
            </svg>
          </button>

          <span className="w-[1px] h-5 bg-[rgba(232,232,232,0.13)] mx-1 self-center"></span>

          <button
            onClick={(e) => handleFormatClick(e, 'blockquote')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('blockquote')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Quote"
          >
            <svg data-qa="quote" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M3.5 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0zM6.75 3a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5zM6 10.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75m.75 5.25a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"></path>
            </svg>
          </button>

          <button
            onClick={(e) => handleFormatClick(e, 'code')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('code')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Inline code"
          >
            <svg data-qa="code" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M12.058 3.212c.396.12.62.54.5.936L8.87 16.29a.75.75 0 1 1-1.435-.436l3.686-12.143a.75.75 0 0 1 .936-.5M5.472 6.24a.75.75 0 0 1 .005 1.06l-2.67 2.693 2.67 2.691a.75.75 0 1 1-1.065 1.057l-3.194-3.22a.75.75 0 0 1 0-1.056l3.194-3.22a.75.75 0 0 1 1.06-.005m9.044 1.06a.75.75 0 1 1 1.065-1.056l3.194 3.221a.75.75 0 0 1 0 1.057l-3.194 3.219a.75.75 0 0 1-1.065-1.057l2.67-2.69z" clipRule="evenodd"></path>
            </svg>
          </button>

          <button
            onClick={(e) => handleFormatClick(e, 'codeBlock')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('codeBlock')
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white'
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`}
            title="Code block"
          >
            <svg data-qa="code-block" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M9.212 2.737a.75.75 0 1 0-1.424-.474l-2.5 7.5a.75.75 0 0 0 1.424.474zm6.038.265a.75.75 0 0 0 0 1.5h2a.25.25 0 0 1 .25.25v11.5a.25.25 0 0 1-.25.25h-13a.25.25 0 0 1-.25-.25v-3.5a.75.75 0 0 0-1.5 0v3.5c0 .966.784 1.75 1.75 1.75h13a1.75 1.75 0 0 0 1.75-1.75v-11.5a1.75 1.75 0 0 0-1.75-1.75zm-3.69.5a.75.75 0 1 0-1.12.996l1.556 1.754-1.556 1.75a.75.75 0 1 0 1.12.997l2-2.249a.75.75 0 0 0 0-.996zM3.999 9.061a.75.75 0 0 1-1.058-.062l-2-2.249a.75.75 0 0 1 0-.996l2-2.252a.75.75 0 1 1 1.12.996L2.504 6.252l1.557 1.75a.75.75 0 0 1-.062 1.059" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
      )}

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
          onSelectEmoji={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}
    <div className="p-message_pane_input relative">
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
        {showFormattingToolbar && (
        <div
          role="toolbar"
          aria-orientation="horizontal"
          aria-label="Formatting"
          className="px-1 py-1 border-b border-[rgb(60,56,54)] flex items-center gap-0 bg-[rgb(34,37,41)] rounded-t-lg"
        >
          <button 
            onClick={(e) => handleFormatClick(e, 'bold')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('bold') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Bold"
            aria-label="Bold"
            aria-pressed={activeFormats.has('bold')}
          >
            <svg data-qa="bold" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M4 2.75A.75.75 0 0 1 4.75 2h6.343a3.91 3.91 0 0 1 3.88 3.449A2 2 0 0 1 15 5.84l.001.067a3.9 3.9 0 0 1-1.551 3.118A4.627 4.627 0 0 1 11.875 18H4.75a.75.75 0 0 1-.75-.75V9.5a.8.8 0 0 1 .032-.218A.8.8 0 0 1 4 9.065zm2.5 5.565h3.593a2.157 2.157 0 1 0 0-4.315H6.5zm4.25 1.935H6.5v5.5h4.25a2.75 2.75 0 1 0 0-5.5" clipRule="evenodd"></path>
            </svg>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'italic')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('italic') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Italic"
            aria-label="Italic"
            aria-pressed={activeFormats.has('italic')}
          >
            <svg data-qa="italic" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M7 2.75A.75.75 0 0 1 7.75 2h7.5a.75.75 0 0 1 0 1.5H12.3l-2.6 13h2.55a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5H7.7l2.6-13H7.75A.75.75 0 0 1 7 2.75" clipRule="evenodd"></path>
            </svg>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'underline')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('underline') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Underline"
            aria-label="Underline"
            aria-pressed={activeFormats.has('underline')}
          >
            <svg data-qa="underline" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" d="M17.25 17.12a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5zM14.5 1.63a.75.75 0 0 1 .75.75v8a5.25 5.25 0 1 1-10.5 0v-8a.75.75 0 0 1 1.5 0v8a3.75 3.75 0 0 0 7.5 0v-8a.75.75 0 0 1 .75-.75"></path>
            </svg>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'strikethrough')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('strikethrough') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Strikethrough"
            aria-label="Strikethrough"
            aria-pressed={activeFormats.has('strikethrough')}
          >
            <svg data-qa="strikethrough" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M11.721 3.84c-.91-.334-2.028-.36-3.035-.114-1.51.407-2.379 1.861-2.164 3.15C6.718 8.051 7.939 9.5 11.5 9.5l.027.001h5.723a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5h3.66c-.76-.649-1.216-1.468-1.368-2.377-.347-2.084 1.033-4.253 3.265-4.848l.007-.002.007-.002c1.252-.307 2.68-.292 3.915.16 1.252.457 2.337 1.381 2.738 2.874a.75.75 0 0 1-1.448.39c-.25-.925-.91-1.528-1.805-1.856m2.968 9.114a.75.75 0 1 0-1.378.59c.273.64.186 1.205-.13 1.674-.333.492-.958.925-1.82 1.137-.989.243-1.991.165-3.029-.124-.93-.26-1.613-.935-1.858-1.845a.75.75 0 0 0-1.448.39c.388 1.441 1.483 2.503 2.903 2.9 1.213.338 2.486.456 3.79.135 1.14-.28 2.12-.889 2.704-1.753.6-.888.743-1.992.266-3.104" clipRule="evenodd"></path>
            </svg>
          </button>
          <span className="w-[1px] h-5 bg-[rgba(232,232,232,0.13)] mx-1 self-center"></span>
          <button 
            onClick={(e) => handleFormatClick(e, 'link')}
            className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]" 
            title="Link"
            aria-label="Link"
            aria-pressed="false"
          >
            <svg data-qa="link" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M12.306 3.756a2.75 2.75 0 0 1 3.889 0l.05.05a2.75 2.75 0 0 1 0 3.889l-3.18 3.18a2.75 2.75 0 0 1-3.98-.095l-.03-.034a.75.75 0 0 0-1.11 1.009l.03.034a4.25 4.25 0 0 0 6.15.146l3.18-3.18a4.25 4.25 0 0 0 0-6.01l-.05-.05a4.25 4.25 0 0 0-6.01 0L9.47 4.47a.75.75 0 1 0 1.06 1.06zm-4.611 12.49a2.75 2.75 0 0 1-3.89 0l-.05-.051a2.75 2.75 0 0 1 0-3.89l3.18-3.179a2.75 2.75 0 0 1 3.98.095l.03.034a.75.75 0 1 0 1.11-1.01l-.03-.033a4.25 4.25 0 0 0-6.15-.146l-3.18 3.18a4.25 4.25 0 0 0 0 6.01l.05.05a4.25 4.25 0 0 0 6.01 0l1.775-1.775a.75.75 0 0 0-1.06-1.06z" clipRule="evenodd"></path>
            </svg>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'orderedList')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('orderedList') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Ordered list"
            aria-label="Ordered list"
            aria-pressed={activeFormats.has('orderedList')}
          >
            <svg data-qa="numbered-list" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M3.792 2.094A.5.5 0 0 1 4 2.5V6h1a.5.5 0 1 1 0 1H2a.5.5 0 1 1 0-1h1V3.194l-.842.28a.5.5 0 0 1-.316-.948l1.5-.5a.5.5 0 0 1 .45.068M7.75 3.5a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zM7 10.75a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10a.75.75 0 0 1-.75-.75m0 6.5a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10a.75.75 0 0 1-.75-.75m-4.293-3.36a1 1 0 0 1 .793-.39c.49 0 .75.38.75.75 0 .064-.033.194-.173.409a5 5 0 0 1-.594.711c-.256.267-.552.548-.87.848l-.088.084a42 42 0 0 0-.879.845A.5.5 0 0 0 2 18h3a.5.5 0 0 0 0-1H3.242l.058-.055c.316-.298.629-.595.904-.882a6 6 0 0 0 .711-.859c.18-.277.335-.604.335-.954 0-.787-.582-1.75-1.75-1.75a2 2 0 0 0-1.81 1.147.5.5 0 1 0 .905.427 1 1 0 0 1 .112-.184" clipRule="evenodd"></path>
            </svg>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'bulletList')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('bulletList') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Bulleted list"
            aria-label="Bulleted list"
            aria-pressed={activeFormats.has('bulletList')}
          >
            <svg data-qa="bulleted-list" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M4 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0m3 0a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10A.75.75 0 0 1 7 3m.75 6.25a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zm0 7a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5zM3 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2m0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2" clipRule="evenodd"></path>
            </svg>
          </button>
          <span className="w-[1px] h-5 bg-[rgba(232,232,232,0.13)] mx-1 self-center"></span>
          <button 
            onClick={(e) => handleFormatClick(e, 'blockquote')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('blockquote') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Blockquote"
            aria-label="Blockquote"
            aria-pressed={activeFormats.has('blockquote')}
          >
            <svg data-qa="quote" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M3.5 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0zM6.75 3a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5zM6 10.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75m.75 5.25a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5z" clipRule="evenodd"></path>
            </svg>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'code')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('code') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Code"
            aria-label="Code"
            aria-pressed={activeFormats.has('code')}
          >
            <svg data-qa="code" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M12.058 3.212c.396.12.62.54.5.936L8.87 16.29a.75.75 0 1 1-1.435-.436l3.686-12.143a.75.75 0 0 1 .936-.5M5.472 6.24a.75.75 0 0 1 .005 1.06l-2.67 2.693 2.67 2.691a.75.75 0 1 1-1.065 1.057l-3.194-3.22a.75.75 0 0 1 0-1.056l3.194-3.22a.75.75 0 0 1 1.06-.005m9.044 1.06a.75.75 0 1 1 1.065-1.056l3.194 3.221a.75.75 0 0 1 0 1.057l-3.194 3.219a.75.75 0 0 1-1.065-1.057l2.67-2.69z" clipRule="evenodd"></path>
            </svg>
          </button>
          <button 
            onClick={(e) => handleFormatClick(e, 'codeBlock')}
            className={`w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all mx-0.5 mt-0.5 p-0.5 ${
              activeFormats.has('codeBlock') 
                ? 'opacity-100 bg-[rgba(232,232,232,0.1)] text-white' 
                : 'opacity-30 hover:opacity-100 text-[rgba(232,232,232,0.7)]'
            }`} 
            title="Code block"
            aria-label="Code block"
            aria-pressed={activeFormats.has('codeBlock')}
          >
            <svg data-qa="code-block" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
              <path fill="currentColor" fillRule="evenodd" d="M9.212 2.737a.75.75 0 1 0-1.424-.474l-2.5 7.5a.75.75 0 0 0 1.424.474zm6.038.265a.75.75 0 0 0 0 1.5h2a.25.25 0 0 1 .25.25v11.5a.25.25 0 0 1-.25.25h-13a.25.25 0 0 1-.25-.25v-3.5a.75.75 0 0 0-1.5 0v3.5c0 .966.784 1.75 1.75 1.75h13a1.75 1.75 0 0 0 1.75-1.75v-11.5a1.75 1.75 0 0 0-1.75-1.75zm-3.69.5a.75.75 0 1 0-1.12.996l1.556 1.754-1.556 1.75a.75.75 0 1 0 1.12.997l2-2.249a.75.75 0 0 0 0-.996zM3.999 9.061a.75.75 0 0 1-1.058-.062l-2-2.249a.75.75 0 0 1 0-.996l2-2.252a.75.75 0 1 1 1.12.996L2.504 6.252l1.557 1.75a.75.75 0 0 1-.062 1.059" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
        )}

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

        {/* Action Bar - Bottom - Slack Style */}
        <div className="px-1 py-1 flex items-center justify-between bg-[rgb(26,29,33)]">
          {/* Left side - Formatting & Action icons */}
          <div className="flex items-center gap-0 relative">
            {/* Circular Add Button */}
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="relative inline-flex w-7 h-7 min-w-[28px] items-center justify-center rounded-full bg-[rgba(232,232,232,0.13)] transition-all m-0.5 p-0.5 hover:bg-[rgba(232,232,232,0.2)] text-[rgb(209,210,211)]"
              title="Attach"
              aria-label="Attach"
              aria-haspopup="menu"
            >
              <svg data-qa="plus" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
                <path fill="currentColor" fillRule="evenodd" d="M10.75 3.25a.75.75 0 0 0-1.5 0v6H3.251L3.25 10v-.75a.75.75 0 0 0 0 1.5V10v.75h6v6a.75.75 0 0 0 1.5 0v-6h6a.75.75 0 0 0 0-1.5h-6z" clipRule="evenodd"></path>
              </svg>
            </button>

            {/* Formatting Toggle Button with animated indicator */}
            <button
              onClick={() => setShowFormattingToolbar(!showFormattingToolbar)}
              className="relative w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all m-0.5 p-0.5 hover:bg-[rgba(232,232,232,0.1)] text-[rgba(232,232,232,0.7)]"
              title={showFormattingToolbar ? "Hide formatting" : "Show formatting"}
              aria-label={showFormattingToolbar ? "Hide formatting" : "Show formatting"}
              aria-pressed={showFormattingToolbar}
            >
              <svg data-qa="formatting" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
                <path fill="currentColor" fillRule="evenodd" d="M6.941 3.952c-.459-1.378-2.414-1.363-2.853.022l-4.053 12.8a.75.75 0 0 0 1.43.452l1.101-3.476h6.06l1.163 3.487a.75.75 0 1 0 1.423-.474zm1.185 8.298L5.518 4.427 3.041 12.25zm6.198-5.537a4.74 4.74 0 0 1 3.037-.081A3.74 3.74 0 0 1 20 10.208V17a.75.75 0 0 1-1.5 0v-.745a8 8 0 0 1-2.847 1.355 3 3 0 0 1-3.15-1.143C10.848 14.192 12.473 11 15.287 11H18.5v-.792c0-.984-.641-1.853-1.581-2.143a3.24 3.24 0 0 0-2.077.056l-.242.089a2.22 2.22 0 0 0-1.34 1.382l-.048.145a.75.75 0 0 1-1.423-.474l.048-.145a3.72 3.72 0 0 1 2.244-2.315zM18.5 12.5h-3.213c-1.587 0-2.504 1.801-1.57 3.085.357.491.98.717 1.572.57a6.5 6.5 0 0 0 2.47-1.223l.741-.593z" clipRule="evenodd"></path>
              </svg>
              {/* Animated line indicator when active */}
              {showFormattingToolbar && (
                <span className="absolute w-[21px] h-[1.5px] bg-[rgba(232,232,232,0.7)] rounded-full -bottom-1 left-1/2 -translate-x-1/2"></span>
              )}
            </button>

            {/* Emoji Button with two-state icon */}
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="relative z-[1] w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all m-0.5 p-0.5 hover:bg-[rgba(232,232,232,0.1)] text-[rgba(232,232,232,0.7)]"
              title="Emoji"
              aria-label="Emoji"
            >
              <div className="relative w-[18px] h-[18px]">
                <svg data-qa="emoji" aria-hidden="true" viewBox="0 0 20 20" className={`absolute inset-0 w-[18px] h-[18px] transition-opacity ${showEmojiPicker ? 'opacity-0' : 'opacity-100'}`}>
                  <path fill="currentColor" fillRule="evenodd" d="M2.5 10a7.5 7.5 0 1 1 15 0 7.5 7.5 0 0 1-15 0M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18M7.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M14 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m-6.385 3.766a.75.75 0 1 0-1.425.468C6.796 14.08 8.428 15 10.027 15s3.23-.92 3.838-2.766a.75.75 0 1 0-1.425-.468c-.38 1.155-1.38 1.734-2.413 1.734s-2.032-.58-2.412-1.734" clipRule="evenodd"></path>
                </svg>
                <svg data-qa="emoji-filled" aria-hidden="true" viewBox="0 0 20 20" className={`absolute inset-0 w-[18px] h-[18px] transition-opacity ${showEmojiPicker ? 'opacity-100' : 'opacity-0'}`}>
                  <path fill="currentColor" fillRule="evenodd" d="M2.5 10a7.5 7.5 0 1 1 15 0 7.5 7.5 0 0 1-15 0M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18M7.5 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M14 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m-.523 4.597c-.616 1.576-2.046 2.364-3.477 2.364-1.43 0-2.86-.788-3.477-2.364-.22-.56.258-1.097.86-1.097h5.234c.602 0 1.08.537.86 1.097" clipRule="evenodd"></path>
                </svg>
              </div>
              {/* Yellow dot indicator when emoji picker is open */}
              {showEmojiPicker && (
                <span className="absolute w-[18px] h-[18px] bg-[rgb(242,199,68)] rounded-full opacity-0 -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></span>
              )}
            </button>

            {/* Mention Button */}
            <button
              className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all m-0.5 p-0.5 hover:bg-[rgba(232,232,232,0.1)] text-[rgba(232,232,232,0.7)]"
              title="Mention someone"
              aria-label="Mention someone"
            >
              <svg data-qa="mentions" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
                <path fill="currentColor" fillRule="evenodd" d="M2.5 10a7.5 7.5 0 1 1 15 0v.645c0 1.024-.83 1.855-1.855 1.855a1.145 1.145 0 0 1-1.145-1.145V6.75a.75.75 0 0 0-1.494-.098 4.5 4.5 0 1 0 .465 6.212A2.64 2.64 0 0 0 15.646 14 3.355 3.355 0 0 0 19 10.645V10a9 9 0 1 0-3.815 7.357.75.75 0 1 0-.865-1.225A7.5 7.5 0 0 1 2.5 10m7.5 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6" clipRule="evenodd"></path>
              </svg>
            </button>

            {/* Divider */}
            <span className="w-[1px] h-5 bg-[rgba(232,232,232,0.13)] mx-1.5 self-center"></span>

            {/* Video Clip Button */}
            <button
              className="relative w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all m-0.5 p-0.5 hover:bg-[rgba(232,232,232,0.1)] text-[rgba(232,232,232,0.7)]"
              title="Record video clip"
              aria-label="Record video clip"
            >
              <svg data-qa="video" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
                <path fill="currentColor" fillRule="evenodd" d="M3.75 4.5a.75.75 0 0 0-.75.75v9.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-2.59a.75.75 0 0 1 1.124-.65l3.376 1.943V6.547l-3.376 1.944A.75.75 0 0 1 13 7.84V5.25a.75.75 0 0 0-.75-.75zm-2.25.75A2.25 2.25 0 0 1 3.75 3h8.5a2.25 2.25 0 0 1 2.25 2.25v1.294l2.626-1.512A1.25 1.25 0 0 1 19 6.115v7.77a1.25 1.25 0 0 1-1.874 1.083L14.5 13.456v1.294A2.25 2.25 0 0 1 12.25 17h-8.5a2.25 2.25 0 0 1-2.25-2.25z" clipRule="evenodd"></path>
              </svg>
            </button>

            {/* Audio Clip Button */}
            <button
              className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all m-0.5 p-0.5 hover:bg-[rgba(232,232,232,0.1)] text-[rgba(232,232,232,0.7)]"
              title="Record audio clip"
              aria-label="Record audio clip"
            >
              <svg data-qa="microphone" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
                <path fill="currentColor" fillRule="evenodd" d="M10 2a3.5 3.5 0 0 0-3.5 3.5v3a3.5 3.5 0 1 0 7 0v-3A3.5 3.5 0 0 0 10 2M8 5.5a2 2 0 1 1 4 0v3a2 2 0 1 1-4 0zM5 8.25a.75.75 0 0 0-1.5 0v.25a6.5 6.5 0 0 0 5.75 6.457V16.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.543A6.5 6.5 0 0 0 16.5 8.5v-.25a.75.75 0 0 0-1.5 0v.25a5 5 0 0 1-10 0z" clipRule="evenodd"></path>
              </svg>
            </button>

            {/* Divider */}
            <span className="w-[1px] h-5 bg-[rgba(232,232,232,0.13)] mx-1.5 self-center"></span>

            {/* Slash Commands Button */}
            <button
              className="w-7 h-7 min-w-[28px] flex items-center justify-center rounded transition-all m-0.5 p-0.5 hover:bg-[rgba(232,232,232,0.1)] text-[rgba(232,232,232,0.7)]"
              title="Run shortcut"
              aria-label="Run shortcut"
            >
              <svg data-qa="slash-box" aria-hidden="true" viewBox="0 0 20 20" className="w-[18px] h-[18px]">
                <path fill="currentColor" fillRule="evenodd" d="M4.5 3h11A1.5 1.5 0 0 1 17 4.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3m-3 1.5a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3h-11a3 3 0 0 1-3-3zm11.64 1.391a.75.75 0 0 0-1.28-.782l-5.5 9a.75.75 0 0 0 1.28.782z" clipRule="evenodd"></path>
              </svg>
            </button>

            {/* Add Menu Dropdown - Slack Style */}
            {showAddMenu && (
              <div
                ref={addMenuRef}
                className="absolute bottom-full left-0 mb-2 w-[360px] bg-[rgb(34,37,41)] rounded-lg shadow-lg border border-[rgb(60,56,54)] py-3 z-50"
                role="menu"
                aria-label="Attach"
              >
                {/* Canvas */}
                <button
                  className="w-full h-7 min-h-[28px] px-6 flex items-center hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                  role="menuitem"
                  disabled
                >
                  <div className="w-5 h-7 mr-2 flex items-center justify-center">
                    <svg data-qa="canvas" aria-hidden="true" viewBox="0 0 20 20" className="w-5 h-5 text-[rgb(248,248,248)]">
                      <path fill="currentColor" fillRule="evenodd" d="M3 5.25A2.25 2.25 0 0 1 5.25 3h9.5A2.25 2.25 0 0 1 17 5.25v5.5h-4.75a1.5 1.5 0 0 0-1.5 1.5V17h-5.5A2.25 2.25 0 0 1 3 14.75zm9.25 11.003 4.003-4.003H12.25zM5.25 1.5A3.75 3.75 0 0 0 1.5 5.25v9.5a3.75 3.75 0 0 0 3.75 3.75h5.736c.729 0 1.428-.29 1.944-.805l4.765-4.765a2.75 2.75 0 0 0 .805-1.944V5.25a3.75 3.75 0 0 0-3.75-3.75z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[rgb(248,248,248)] text-[15px] leading-7 opacity-50">
                    Canvas
                  </div>
                </button>

                {/* List */}
                <button
                  className="w-full h-7 min-h-[28px] px-6 flex items-center hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                  role="menuitem"
                  disabled
                >
                  <div className="w-5 h-7 mr-2 flex items-center justify-center">
                    <svg data-qa="lists" aria-hidden="true" viewBox="0 0 20 20" className="w-5 h-5 text-[rgb(248,248,248)]">
                      <path fill="currentColor" fillRule="evenodd" d="M1.5 5.25A3.75 3.75 0 0 1 5.25 1.5h9.5a3.75 3.75 0 0 1 3.75 3.75v9.5a3.75 3.75 0 0 1-3.75 3.75h-9.5a3.75 3.75 0 0 1-3.75-3.75zM5.25 3A2.25 2.25 0 0 0 3 5.25v9.5A2.25 2.25 0 0 0 5.25 17h9.5A2.25 2.25 0 0 0 17 14.75v-9.5A2.25 2.25 0 0 0 14.75 3zm3.654 9.204a.75.75 0 1 0-1.044-1.078l-1.802 1.745-.654-.634a.75.75 0 1 0-1.044 1.077l1.177 1.14a.75.75 0 0 0 1.043 0zm1.714.782a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5zm0-3.687a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5zm-.75-2.938a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75m-3.28 2.482c.2 0 .402-.114.737-.343.85-.586 1.513-1.317 1.513-2.082 0-.595-.486-1.075-1.168-1.075-.832 0-1.082.757-1.082.757s-.258-.757-1.082-.757c-.68 0-1.168.48-1.168 1.075 0 .765.66 1.498 1.51 2.078.337.231.54.347.74.347" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[rgb(248,248,248)] text-[15px] leading-7 opacity-50">
                    List
                  </div>
                </button>

                {/* Recent file with submenu */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowRecentFilesSubmenu(true)}
                  onMouseLeave={() => setShowRecentFilesSubmenu(false)}
                >
                  <button
                    className="w-full h-7 min-h-[28px] px-6 flex items-center hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                    role="menuitem"
                    aria-haspopup="true"
                  >
                    <div className="w-5 h-7 mr-2 flex items-center justify-center">
                      <svg viewBox="0 0 20 20" className="w-5 h-5 text-[rgb(248,248,248)]" fill="currentColor">
                        <path d="M3 4a2 2 0 012-2h3.5a2 2 0 011.6.8l1.4 1.7c.2.3.5.5.9.5H15a2 2 0 012 2v1H3V4zm0 4h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"></path>
                      </svg>
                    </div>
                    <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[rgb(248,248,248)] text-[15px] leading-7">
                      Recent file
                    </div>
                    <div className="w-[15px] h-[15px]">
                      <svg data-qa="caret-right" aria-hidden="true" viewBox="0 0 20 20" className="w-[15px] h-[15px] text-[rgb(185,186,189)]">
                        <path fill="currentColor" fillRule="evenodd" d="M7.72 5.72a.75.75 0 0 1 1.06 0l3.75 3.75a.75.75 0 0 1 0 1.06l-3.75 3.75a.75.75 0 0 1-1.06-1.06L10.94 10 7.72 6.78a.75.75 0 0 1 0-1.06" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  </button>

                  {/* Recent Files Submenu */}
                  {showRecentFilesSubmenu && (
                    <div className="absolute left-full top-0 ml-1 w-[400px] max-h-[400px] bg-[rgb(34,37,41)] rounded-lg shadow-lg border border-[rgb(60,56,54)] py-3 overflow-y-auto z-50">
                      {(() => {
                        const recentFiles = getRecentFiles();
                        if (recentFiles.length === 0) {
                          return (
                            <div className="px-6 py-8 text-center">
                              <svg className="w-12 h-12 mx-auto mb-3 text-[rgb(209,210,211)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <p className="text-[rgb(209,210,211)] text-sm">No recent files</p>
                            </div>
                          );
                        }

                        return recentFiles.map((file) => {
                          const getFileIcon = () => {
                            const extension = file.filename.split('.').pop()?.toLowerCase() || '';

                            if (file.contentType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
                              return (
                                <div className="w-[60px] h-[60px] flex items-center justify-center bg-gray-200 rounded overflow-hidden flex-shrink-0">
                                  <img src={file.url || '/placeholder-image.png'} alt={file.filename} className="w-full h-full object-cover" />
                                </div>
                              );
                            }

                            if (file.contentType.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(extension)) {
                              return (
                                <div className="w-[60px] h-[60px] flex items-center justify-center bg-[rgb(76,133,226)] rounded flex-shrink-0">
                                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                  </svg>
                                </div>
                              );
                            }

                            if (file.contentType.includes('pdf') || extension === 'pdf') {
                              return (
                                <div className="w-[60px] h-[60px] flex items-center justify-center bg-[rgb(206,78,98)] rounded flex-shrink-0">
                                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
                                    <path d="M14 2v6h6M9 13h6v1H9v-1zm0 3h6v1H9v-1z" fill="white" opacity="0.8" />
                                  </svg>
                                </div>
                              );
                            }

                            if (file.contentType.includes('presentation') || ['ppt', 'pptx'].includes(extension)) {
                              return (
                                <div className="w-[60px] h-[60px] flex items-center justify-center bg-[rgb(210,70,37)] rounded flex-shrink-0">
                                  <span className="text-white text-2xl font-bold">P</span>
                                </div>
                              );
                            }

                            if (extension === 'epub') {
                              return (
                                <div className="w-[60px] h-[60px] flex items-center justify-center bg-[rgb(76,133,226)] rounded flex-shrink-0">
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 2h12a2 2 0 012 2v16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2zm0 2v16h12V4H6zm2 2h8v2H8V6zm0 4h8v2H8v-2zm0 4h5v2H8v-2z" />
                                  </svg>
                                </div>
                              );
                            }

                            // Canvas files
                            if (file.contentType.includes('canvas') || file.filename.toLowerCase().includes('canvas')) {
                              return (
                                <div className="w-[60px] h-[60px] flex items-center justify-center bg-[rgb(76,133,226)] rounded flex-shrink-0">
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                                    <path d="M7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
                                  </svg>
                                </div>
                              );
                            }

                            return (
                              <div className="w-[60px] h-[60px] flex items-center justify-center bg-[rgb(97,97,97)] rounded flex-shrink-0">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                              </div>
                            );
                          };

                          const getFileType = () => {
                            const extension = file.filename.split('.').pop()?.toLowerCase() || '';
                            if (file.contentType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'JPEG';
                            if (file.contentType.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(extension)) return 'MP3';
                            if (file.contentType.includes('pdf') || extension === 'pdf') return 'PDF';
                            if (file.contentType.includes('presentation') || ['ppt', 'pptx'].includes(extension)) return 'PowerPoint Presentation';
                            if (extension === 'epub') return 'EPUB';
                            if (file.contentType.includes('canvas')) return 'Canvas';
                            return extension.toUpperCase();
                          };

                          return (
                            <button
                              key={file.id}
                              onClick={() => {
                                handleSelectRecentFile(file.id);
                                setShowAddMenu(false);
                                setShowRecentFilesSubmenu(false);
                              }}
                              className="w-full px-4 py-2 flex items-center gap-3 hover:bg-[rgb(45,101,202)] transition-colors text-left"
                            >
                              {getFileIcon()}
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-[15px] font-normal truncate">
                                  {file.filename}
                                </div>
                                <div className="text-[rgb(209,210,211)] text-[13px] mt-0.5">
                                  {getFileType()} · {formatRelativeTime(file.uploadedAt)}
                                </div>
                              </div>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>

                {/* Text snippet */}
                <button
                  className="w-full h-7 min-h-[28px] px-6 flex items-center hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                  role="menuitem"
                  disabled
                >
                  <div className="w-5 h-7 mr-2 flex items-center justify-center">
                    <svg viewBox="0 0 20 20" className="w-5 h-5 text-[rgb(248,248,248)]" fill="currentColor">
                      <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm1 4h10v2H5V7zm0 4h6v2H5v-2z"></path>
                    </svg>
                  </div>
                  <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[rgb(248,248,248)] text-[15px] leading-7 opacity-50">
                    Text snippet
                  </div>
                  <div className="ml-2 text-[rgb(154,155,158)] text-[13px] leading-7 whitespace-nowrap">
                    ⌘⇧Enter
                  </div>
                </button>

                {/* Workflow */}
                <button
                  className="w-full h-7 min-h-[28px] px-6 flex items-center hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                  role="menuitem"
                  disabled
                >
                  <div className="w-5 h-7 mr-2 flex items-center justify-center">
                    <svg data-qa="play" aria-hidden="true" viewBox="0 0 20 20" className="w-5 h-5 text-[rgb(248,248,248)]">
                      <path fill="currentColor" fillRule="evenodd" d="M5.128 3.213A.75.75 0 0 0 4 3.861v12.277a.75.75 0 0 0 1.128.647l10.523-6.138a.75.75 0 0 0 0-1.296zM2.5 3.861c0-1.737 1.884-2.819 3.384-1.944l10.523 6.139c1.488.868 1.488 3.019 0 3.887L5.884 18.08c-1.5.875-3.384-.207-3.384-1.943z" clipRule="evenodd"></path>
                    </svg>
                  </div>
                  <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[rgb(248,248,248)] text-[15px] leading-7 opacity-50">
                    Workflow
                  </div>
                </button>

                {/* Upload from your computer */}
                <button
                  onClick={handleAttachClick}
                  className="w-full h-7 min-h-[28px] px-6 flex items-center hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                  role="menuitem"
                >
                  <div className="w-5 h-7 mr-2 flex items-center justify-center">
                    <svg viewBox="0 0 20 20" className="w-5 h-5 text-[rgb(248,248,248)]" fill="currentColor">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v1H3V4zm0 3h14v8a1 1 0 01-1 1H4a1 1 0 01-1-1V7zm7-1a1 1 0 00-1 1v3H7l3 3 3-3h-2V9a1 1 0 00-1-1z"></path>
                    </svg>
                  </div>
                  <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[rgb(248,248,248)] text-[15px] leading-7">
                    Upload from your computer
                  </div>
                </button>
              </div>
            )}

            {/* Hidden file input for uploads */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Right side - Send button (split button) */}
          <div className="relative flex items-center gap-0 rounded">
            {/* Send now button */}
            <button
              onClick={handleSend}
              disabled={(!text.trim() && selectedFiles.length === 0) || uploadingFiles}
              className={`relative flex items-center justify-center min-w-[28px] h-7 px-2 rounded-l transition-all ${
                (!text.trim() && selectedFiles.length === 0) || uploadingFiles
                  ? 'bg-[rgb(0,122,90)] opacity-30 cursor-default'
                  : 'bg-[rgb(0,122,90)] hover:bg-[rgb(0,108,78)] cursor-pointer'
              }`}
              title="Send now"
              aria-label="Send now"
              aria-disabled={(!text.trim() && selectedFiles.length === 0) || uploadingFiles}
            >
              {uploadingFiles ? (
                <span className="text-white text-xs">...</span>
              ) : (
                <svg data-qa="send-filled" aria-hidden="true" viewBox="0 0 20 20" className="w-4 h-4 text-white">
                  <path fill="currentColor" d="M1.5 2.106c0-.462.498-.754.901-.528l15.7 7.714a.73.73 0 0 1 .006 1.307L2.501 18.46l-.07.017a.754.754 0 0 1-.931-.733v-4.572c0-1.22.971-2.246 2.213-2.268l6.547-.17c.27-.01.75-.243.75-.797 0-.553-.5-.795-.75-.795l-6.547-.171C2.47 8.95 1.5 7.924 1.5 6.704z"></path>
                </svg>
              )}
              {/* Divider line */}
              <span className="absolute top-1/2 right-0 -translate-y-1/2 w-[1px] h-5 bg-[rgba(209,210,211,0.3)]"></span>
            </button>

            {/* Schedule/Options button */}
            <button
              onClick={() => setShowScheduleMenu(!showScheduleMenu)}
              disabled={(!text.trim() && selectedFiles.length === 0) || uploadingFiles}
              className={`flex items-center justify-center min-w-[28px] h-7 px-1 rounded-r transition-all ${
                (!text.trim() && selectedFiles.length === 0) || uploadingFiles
                  ? 'bg-[rgb(0,122,90)] opacity-30 cursor-default'
                  : 'bg-[rgb(0,122,90)] hover:bg-[rgb(0,108,78)] cursor-pointer'
              }`}
              title="Schedule for later"
              aria-label="Schedule for later"
              aria-haspopup="menu"
              aria-disabled={(!text.trim() && selectedFiles.length === 0) || uploadingFiles}
            >
              <svg data-qa="caret-down" aria-hidden="true" viewBox="0 0 20 20" className="w-4 h-4 text-white">
                <path fill="currentColor" fillRule="evenodd" d="M5.72 7.47a.75.75 0 0 1 1.06 0L10 10.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L5.72 8.53a.75.75 0 0 1 0-1.06" clipRule="evenodd"></path>
              </svg>
            </button>

            {/* Schedule Menu Dropdown */}
            {showScheduleMenu && (
              <div
                ref={scheduleMenuRef}
                className="absolute bottom-full right-0 mb-2 w-[260px] bg-[rgb(34,37,41)] rounded-lg shadow-lg border border-[rgb(60,56,54)] py-3 z-50"
                role="menu"
                aria-label="Schedule message"
              >
                {/* Header */}
                <div className="px-6 py-1 text-[rgba(232,232,232,0.7)] text-[13px] leading-[18px]">
                  Schedule message
                </div>

                {/* Suggested time option */}
                <button
                  onClick={() => {
                    // TODO: Handle scheduling for suggested time
                    console.log('Schedule for Monday at 9:00 AM');
                    setShowScheduleMenu(false);
                  }}
                  className="w-full h-7 min-h-[28px] px-6 flex items-center hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left"
                  role="menuitem"
                >
                  <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[rgb(248,248,248)] text-[15px] leading-7">
                    Monday at 9:00 AM
                  </div>
                </button>

                {/* Separator */}
                <div className="py-2">
                  <hr className="border-t border-[rgba(232,232,232,0.13)]" />
                </div>

                {/* Custom time option */}
                <button
                  onClick={() => {
                    // TODO: Open custom time picker
                    console.log('Open custom time picker');
                    setShowScheduleMenu(false);
                  }}
                  className="w-full h-7 min-h-[28px] px-6 flex items-center bg-[rgb(18,100,163)] hover:bg-[rgb(16,90,150)] transition-colors text-left"
                  role="menuitem"
                >
                  <div className="flex-1 overflow-hidden whitespace-nowrap text-ellipsis text-[rgb(248,248,248)] text-[15px] leading-7">
                    Custom time
                  </div>
                </button>
              </div>
            )}
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
