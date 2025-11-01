import React, { useRef, useEffect } from 'react';
import type { User, Message, Thread } from '../../constants/chat';
import MessageItem from './MessageItem';
import MessageComposer from './MessageComposer';

interface ChatPaneProps {
  currentUser: User;
  activeUser: User;
  messages: Message[];
  threads: Record<string, Thread[]>;
  editingMessageId: string | null;
  onSendMessage: (text: string) => void;
  onEditMessage: (messageId: string, newText: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onOpenThread: (messageId: string) => void;
}

const ChatPane: React.FC<ChatPaneProps> = ({
  currentUser,
  activeUser,
  messages,
  threads,
  editingMessageId,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onOpenThread,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getThreadCount = (messageId: string) => {
    const thread = Object.values(threads).find((t) => t[0]?.messageId === messageId);
    return thread?.[0]?.messages.length || 0;
  };

  return (
    <div className="flex-1 flex flex-col bg-[rgb(26,29,33)]">
      {/* Chat Header */}
      <div className="h-[60px] px-5 border-b border-[rgb(49,48,44)] flex items-center justify-between bg-[rgb(26,29,33)]">
        <div className="flex items-center flex-1 min-w-0">
          <button className="flex items-center gap-2 hover:bg-[rgb(49,48,44)] px-2 py-1 rounded transition-colors">
            <span className="text-white text-xl">#</span>
            <span className="text-[18px] font-bold text-white">
              {activeUser.displayName.toLowerCase().replace(/\s/g, '-')}
            </span>
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 px-3 py-1 rounded border border-[rgb(134,134,134)] hover:bg-[rgb(49,48,44)] transition-colors">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[13px] text-white">4</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-transparent hover:bg-[rgb(49,48,44)] transition-colors border border-[rgb(134,134,134)]">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span className="text-[13px] text-white font-medium">Huddle</span>
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button className="p-1.5 hover:bg-[rgb(49,48,44)] rounded transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-[rgb(26,29,33)]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-start px-5 pt-5">
            <div className="mb-6 w-full">
              <div className="w-16 h-16 rounded bg-[rgb(97,31,105)] flex items-center justify-center text-white text-2xl font-bold mb-4">
                {activeUser.displayName.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-[15px] font-bold text-white mb-2">
                {activeUser.displayName}
              </h2>
              <div className="text-[15px] text-white leading-[1.46668] mb-4">
                This conversation is just between <strong className="font-bold">@{activeUser.displayName}</strong> and you. Check out their profile to learn more about them.
              </div>
              <button className="px-4 py-2 bg-[rgb(26,29,33)] border border-white rounded text-[15px] font-medium text-white hover:bg-[rgb(49,48,44)] transition-colors">
                View profile
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5">
            {/* Today divider */}
            <div className="flex items-center justify-center my-4">
              <button className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[rgb(49,48,44)] transition-colors">
                <span className="text-[13px] font-semibold text-[rgb(209,210,211)]">Today</span>
                <svg className="w-3 h-3 text-[rgb(209,210,211)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            {messages.map((message, index) => {
              const isCurrentUser = message.userId === currentUser.id;
              const messageUser = isCurrentUser ? currentUser : activeUser;
              const showAvatar = index === 0 || messages[index - 1].userId !== message.userId;
              const threadCount = getThreadCount(message.id);
              const shouldShowTimestamp = index === 0 || 
                new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() > 600000; // 10 minutes

              return (
                <div key={message.id}>
                  {shouldShowTimestamp && index > 0 && (
                    <div className="flex items-center my-4">
                      <div className="flex-1 border-t border-[rgb(49,48,44)]"></div>
                      <span className="px-2 text-[13px] text-[rgb(209,210,211)]">
                        {formatTime(message.timestamp)}
                      </span>
                      <div className="flex-1 border-t border-[rgb(49,48,44)]"></div>
                    </div>
                  )}
                  <MessageItem
                    message={message}
                    user={messageUser}
                    isCurrentUser={isCurrentUser}
                    showAvatar={showAvatar}
                    threadCount={threadCount}
                    isEditing={editingMessageId === message.id}
                    onEdit={(newText) => onEditMessage(message.id, newText)}
                    onDelete={() => onDeleteMessage(message.id)}
                    onOpenThread={() => onOpenThread(message.id)}
                    formatTime={formatTime}
                  />
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-[rgb(26,29,33)] px-5 pb-5">
        <MessageComposer
          onSend={onSendMessage}
          placeholder={`Message ${activeUser.displayName}`}
          userName={activeUser.displayName}
        />
      </div>
    </div>
  );
};

export default ChatPane;

