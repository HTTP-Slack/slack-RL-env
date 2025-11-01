import React, { useRef, useEffect } from 'react';
import type { Thread, User } from '../../constants/chat';
import MessageComposer from './MessageComposer';

interface ThreadPanelProps {
  thread: Thread;
  currentUser: User;
  users: User[];
  onClose: () => void;
  onSendMessage: (text: string) => void;
}

const ThreadPanel: React.FC<ThreadPanelProps> = ({
  thread,
  currentUser,
  users,
  onClose,
  onSendMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thread.messages]);

  const getUserById = (userId: string) => {
    return users.find((u) => u.id === userId) || users[0];
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="w-[360px] bg-white border-l border-[rgb(221,221,221)] flex flex-col">
      {/* Thread Header */}
      <div className="h-[60px] px-4 border-b border-[rgb(221,221,221)] flex items-center justify-between bg-white">
        <div className="flex items-center flex-1 min-w-0">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-[rgb(97,96,97)] mr-2"
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
            <span className="text-[15px] font-semibold text-[rgb(26,29,33)]">
              Thread
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-4 p-1 rounded hover:bg-[rgb(248,248,248)] text-[rgb(97,96,97)] hover:text-[rgb(26,29,33)]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Thread Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {thread.messages.map((message, index) => {
            const messageUser = getUserById(message.userId);
            const isCurrentUser = message.userId === currentUser.id;
            const showAvatar = index === 0 || thread.messages[index - 1].userId !== message.userId;

            return (
              <div
                key={message.id}
                className={`flex ${showAvatar ? 'mt-4' : 'mt-1'} ${
                  isCurrentUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 ${isCurrentUser ? 'ml-3' : 'mr-3'}`}>
                  {showAvatar ? (
                    <div className="w-6 h-6 rounded bg-[rgb(97,31,105)] flex items-center justify-center text-white text-xs font-semibold">
                      {messageUser.displayName.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-6 h-6"></div>
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`flex-1 min-w-0 ${isCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}
                >
                  {showAvatar && (
                    <div
                      className={`flex items-center mb-1 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <span className="text-[13px] font-semibold text-[rgb(26,29,33)] mr-2">
                        {messageUser.displayName}
                      </span>
                      <span className="text-[11px] text-[rgb(97,96,97)]">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`inline-block px-1 py-0.5 rounded ${
                      isCurrentUser ? 'bg-[rgb(248,248,248)]' : ''
                    }`}
                  >
                    <div className="text-[15px] text-[rgb(26,29,33)] whitespace-pre-wrap break-words">
                      {message.text}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Thread Composer */}
      <div className="border-t border-[rgb(221,221,221)] bg-white px-4 py-3">
        <MessageComposer onSend={onSendMessage} placeholder="Reply to thread..." />
      </div>
    </div>
  );
};

export default ThreadPanel;

