import React, { useState } from 'react';
import type { Message, User } from '../../constants/chat';
import { parseMarkdown } from '../../utils/markdown';

interface MessageItemProps {
  message: Message;
  user: User;
  isCurrentUser: boolean;
  showAvatar: boolean;
  threadCount: number;
  isEditing: boolean;
  onEdit: (newText: string) => void;
  onDelete: () => void;
  onOpenThread: () => void;
  formatTime: (date: Date) => string;
}

const MessageItem: React.FC<MessageItemProps> = ({
  message,
  user,
  isCurrentUser,
  showAvatar,
  threadCount,
  isEditing,
  onEdit,
  onDelete,
  onOpenThread,
  formatTime,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [showEditInput, setShowEditInput] = useState(false);

  const handleEdit = () => {
    setShowEditInput(true);
    setEditText(message.text);
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.text) {
      onEdit(editText.trim());
    }
    setShowEditInput(false);
  };

  const handleCancelEdit = () => {
    setEditText(message.text);
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


  return (
    <div
      className={`flex mb-1 group relative ${showAvatar ? 'mt-4' : 'mt-0.5'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mr-3">
        {showAvatar ? (
          <div className="w-8 h-8 rounded bg-[rgb(97,31,105)] flex items-center justify-center text-white text-sm font-semibold">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="w-8 h-8"></div>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {showAvatar && (
          <div className="flex items-center mb-1">
            <span className="text-[15px] font-bold text-white mr-2">
              {user.displayName}
            </span>
            <span className="text-[12px] font-normal text-[rgb(209,210,211)]">
              {formatTime(message.timestamp)}
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
                <div>
                  {parseMarkdown(message.text).map((part, idx) => (
                    <React.Fragment key={idx}>{part}</React.Fragment>
                  ))}
                </div>
                {message.edited && (
                  <span className="text-[12px] text-[rgb(209,210,211)] ml-1">(edited)</span>
                )}
              </div>

              {/* Thread indicator */}
              {threadCount > 0 && (
                <button
                  onClick={onOpenThread}
                  className="mt-1 flex items-center text-[13px] text-[rgb(54,197,240)] hover:underline cursor-pointer"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  {threadCount} {threadCount === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hover Actions - Right Side */}
      {isHovered && !showEditInput && (
        <div className="absolute right-0 top-0 flex items-center gap-1 bg-[rgb(49,48,44)] rounded px-2 py-1 shadow-lg">
          {/* Quick reactions */}
          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-[rgb(60,56,54)]" title="Checkmark">
            <span className="text-sm">✅</span>
          </button>
          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-[rgb(60,56,54)]" title="Eyes">
            <span className="text-sm">👀</span>
          </button>
          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-[rgb(60,56,54)]" title="Trophy">
            <span className="text-sm">🏆</span>
          </button>
          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-[rgb(60,56,54)]" title="Clapping">
            <span className="text-sm">👏</span>
          </button>
          
          <div className="w-[1px] h-5 bg-[rgb(60,56,54)] mx-1"></div>
          
          {/* Action buttons */}
          <button
            onClick={onOpenThread}
            className="px-2 py-1 text-[13px] text-[rgb(209,210,211)] hover:text-white hover:bg-[rgb(60,56,54)] rounded flex items-center gap-1"
            title="React"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>React</span>
          </button>
          <button
            onClick={onOpenThread}
            className="px-2 py-1 text-[13px] text-[rgb(209,210,211)] hover:text-white hover:bg-[rgb(60,56,54)] rounded flex items-center gap-1"
            title="Reply"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Reply</span>
          </button>
          {isCurrentUser && (
            <>
              <button
                onClick={handleEdit}
                className="px-2 py-1 text-[13px] text-[rgb(209,210,211)] hover:text-white hover:bg-[rgb(60,56,54)] rounded"
                title="Edit"
              >
                Edit
              </button>
              <button
                onClick={onDelete}
                className="px-2 py-1 text-[13px] text-[rgb(209,210,211)] hover:text-white hover:bg-[rgb(60,56,54)] rounded"
                title="Delete"
              >
                Delete
              </button>
            </>
          )}
          <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-[rgb(60,56,54)]" title="More actions">
            <svg className="w-4 h-4 text-[rgb(209,210,211)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageItem;

