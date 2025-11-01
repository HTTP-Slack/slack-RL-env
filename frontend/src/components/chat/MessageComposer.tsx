import React, { useState, useRef, useEffect } from 'react';
import { insertMarkdown, parseMarkdown } from '../../utils/markdown';

interface MessageComposerProps {
  onSend: (text: string) => void;
  placeholder?: string;
  userName?: string;
}

const MessageComposer: React.FC<MessageComposerProps> = ({ onSend, placeholder = 'Message...', userName }) => {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmedText = text.trim();
    if (trimmedText) {
      onSend(trimmedText);
      setText('');
      setShowPreview(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

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

  return (
    <div className="p-message_pane_input">
      {userName && (
        <div className="mb-2 text-[13px] text-[rgb(209,210,211)] leading-[1.38463]">
          <span className="font-semibold text-white">{userName}</span> has paused their notifications
        </div>
      )}
      <div 
        className={`bg-[rgb(26,29,33)] rounded-lg border transition-colors ${
          isFocused ? 'border-[rgb(29,28,29)] shadow-[0_0_0_1px_rgb(29,28,29),0_0_0_5px_rgba(29,122,177,0.3)]' : 'border-[rgb(134,134,134)]'
        }`}
      >
        {/* Formatting Toolbar - Top */}
        <div className="px-2 pt-1 pb-1 border-b border-[rgb(60,56,54)] flex items-center gap-0">
          <button 
            onClick={(e) => handleFormatClick(e, 'bold')}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]" 
            title="Bold"
          >
            <span className="text-[13px] font-bold">B</span>
          </button>
          <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-0.5"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'italic')}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]" 
            title="Italic"
          >
            <span className="text-[13px] italic font-serif">I</span>
          </button>
          <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-0.5"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'underline')}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]" 
            title="Underline"
          >
            <span className="text-[13px] underline">U</span>
          </button>
          <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-0.5"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'strikethrough')}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]" 
            title="Strikethrough"
          >
            <span className="text-[13px] line-through">S</span>
          </button>
          <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-0.5"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'link')}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]" 
            title="Link"
          >
            <svg className="w-4 h-4" viewBox="0 0 14 14" fill="currentColor">
              <path d="M6.5 9.5l-1 1c-.6.6-1.6.6-2.1 0-.6-.6-.6-1.6 0-2.1l2-2c.6-.6 1.6-.6 2.1 0 .1.1.2.2.2.4h1.5c0-.5-.2-.9-.5-1.3-1.2-1.2-3.1-1.2-4.2 0l-2 2c-1.2 1.2-1.2 3.1 0 4.2 1.2 1.2 3.1 1.2 4.2 0l1-1h-1.2zm5.5-5.5l-1 1h1.2l1-1c.6-.6.6-1.6 0-2.1-.6-.6-1.6-.6-2.1 0l-2 2c-.6.6-.6 1.6 0 2.1.1.1.2.2.4.2V4.7c-.5 0-.9-.2-1.3-.5-1.2-1.2-1.2-3.1 0-4.2l2-2c1.2-1.2 3.1-1.2 4.2 0 1.2 1.2 1.2 3.1 0 4.2z"></path>
            </svg>
          </button>
          <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-0.5"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'orderedList')}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]" 
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
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]" 
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
            onClick={(e) => handleFormatClick(e, 'blockquote')}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]" 
            title="Blockquote"
          >
            <svg className="w-4 h-4" viewBox="0 0 14 14" fill="currentColor">
              <line x1="2" y1="3" x2="2" y2="11" stroke="currentColor" strokeWidth="1.5"></line>
              <line x1="4" y1="5" x2="12" y2="5" stroke="currentColor" strokeWidth="1"></line>
              <line x1="4" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1"></line>
              <line x1="4" y1="9" x2="12" y2="9" stroke="currentColor" strokeWidth="1"></line>
            </svg>
          </button>
          <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-0.5"></div>
          <button 
            onClick={(e) => handleFormatClick(e, 'code')}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]" 
            title="Code block"
          >
            <svg className="w-4 h-4" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M4.5 9.5L2 7l2.5-2.5L3.8 3.8 0.5 7l3.3 3.2.7-.7zm5 0L12 7 9.5 4.5l.7-.7L13.5 7l-3.3 3.2-.7-.7z"></path>
            </svg>
          </button>
          <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-0.5"></div>
          <button 
            onClick={(e) => {
              e.preventDefault();
              const textarea = textareaRef.current;
              if (textarea) {
                const start = textarea.selectionStart;
                const before = text.slice(0, start);
                const after = text.slice(start);
                const newText = `${before}\`\`\`\ncode\n\`\`\`${after}`;
                setText(newText);
                setTimeout(() => {
                  textarea.focus();
                  textarea.setSelectionRange(start + 7, start + 11);
                }, 0);
              }
            }}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]" 
            title="Code snippet"
          >
            <svg className="w-4 h-4" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="1" y="3" width="12" height="8" rx="1"></rect>
              <path d="M4.5 7l2 2 2-2"></path>
            </svg>
          </button>
        </div>

        {/* Message Input Area */}
        <div className="px-3 pt-2 pb-1">
          {showPreview && text ? (
            <div className="min-h-[22px] text-[15px] text-white leading-[1.46668] whitespace-pre-wrap break-words">
              {parseMarkdown(text).map((part, idx) => (
                <React.Fragment key={idx}>{part}</React.Fragment>
              ))}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="w-full resize-none outline-none bg-transparent text-[15px] text-white placeholder-[rgb(209,210,211)] min-h-[22px] max-h-[150px] overflow-y-auto leading-[1.46668]"
              rows={1}
            />
          )}
        </div>

        {/* Action Bar - Bottom */}
        <div className="px-3 pb-2 flex items-center justify-between border-t border-[rgb(60,56,54)]">
          {/* Left side - Action icons */}
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]" title="Add">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.2" fill="none"></circle>
                <path d="M8 5v6M5 8h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"></path>
              </svg>
            </button>
            <button 
              onClick={() => setShowPreview(!showPreview)}
              className={`w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] ${
                showPreview ? 'bg-[rgb(49,48,44)]' : ''
              } text-[rgb(209,210,211)]`} 
              title="Format"
            >
              <span className="text-[13px] font-medium underline">Aa</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]" title="Emoji">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1" fill="none"></circle>
                <circle cx="5.5" cy="7" r="1" fill="currentColor"></circle>
                <circle cx="10.5" cy="7" r="1" fill="currentColor"></circle>
                <path d="M5.5 10.5c0.5 1.5 2 2.5 3.5 2.5s3-1 3.5-2.5" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round"></path>
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]" title="Mention">
              <span className="text-[13px] font-medium">@</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]" title="Video call">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <rect x="3" y="4" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1" fill="none"></rect>
                <path d="M12 6l2-2v6l-2-2" stroke="currentColor" strokeWidth="1" fill="none"></path>
              </svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]" title="Voice message">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <rect x="4" y="3" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1" fill="none"></rect>
                <path d="M6 6h4M6 8h4M6 10h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round"></path>
                <circle cx="8" cy="8" r="1" fill="currentColor"></circle>
              </svg>
            </button>
            <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-1"></div>
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgb(49,48,44)] text-[rgb(209,210,211)]" title="Attach file">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="12" height="8" rx="1"></rect>
                <path d="M6 8h4"></path>
              </svg>
            </button>
          </div>

          {/* Right side - Hint text and send button */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[rgb(209,210,211)]">
              <span className="font-medium text-white">Shift + Return</span> to add a new line
            </span>
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="px-3 py-1.5 bg-[rgb(46,204,113)] hover:bg-[rgb(42,185,103)] disabled:opacity-40 disabled:cursor-not-allowed rounded flex items-center gap-1.5 transition-colors"
              title="Send"
            >
              <svg className="w-4 h-4 text-white" viewBox="0 0 16 16" fill="currentColor">
                <path d="M1.5 8l12-6v12L1.5 8zm12-4L4.5 8l9 4V4z"></path>
              </svg>
              <div className="w-[1px] h-4 bg-white/30"></div>
              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 9l-3-3 3-3 3 3-3 3z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageComposer;

