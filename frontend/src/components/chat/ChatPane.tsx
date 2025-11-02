import React, { useRef, useEffect, useState } from 'react';
import type { Thread } from '../../constants/chat';
import type { User, Message } from '../../services/messageApi';
import MessageItem from './MessageItem';
import MessageComposer from './MessageComposer';
import UnreadDivider from './UnreadDivider';
import JumpToMenu from './JumpToMenu';
import PinnedMessageLabel from './PinnedMessageLabel';
import { useProfile } from '../../features/profile/ProfileContext';
import { getTargetDate } from '../../utils/dateUtils';
import {
  getPinnedMessages,
  pinMessage,
  unpinMessage,
  type PinnedMessage,
} from '../../services/pinnedMessageApi';
import { useWorkspace } from '../../context/WorkspaceContext';

interface ChatPaneProps {
  currentUser: User;
  activeUser: User;
  messages: Message[];
  threads: Record<string, Thread[]>;
  editingMessageId: string | null;
  conversationId?: string;
  onSendMessage: (text: string, attachments?: string[]) => void;
  onEditMessage: (messageId: string, newText: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onOpenThread: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
}

const ChatPane: React.FC<ChatPaneProps> = ({
  currentUser,
  activeUser,
  messages,
  editingMessageId,
  conversationId,
  onSendMessage,
  onEditMessage,
  onDeleteMessage,
  onOpenThread,
  onReaction,
}) => {
  const { currentWorkspaceId } = useWorkspace();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { openPanel } = useProfile();
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<string | null>(null);
  const [pinnedMessages, setPinnedMessages] = useState<Map<string, PinnedMessage>>(new Map());

  // Get conversation ID from messages if not provided as prop
  const effectiveConversationId = conversationId || messages[0]?.conversation;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch pinned messages when conversation changes
  useEffect(() => {
    if (effectiveConversationId && currentWorkspaceId) {
      fetchPinnedMessages();
    }
  }, [effectiveConversationId, currentWorkspaceId]);

  const fetchPinnedMessages = async () => {
    try {
      if (!currentWorkspaceId || !effectiveConversationId) return;

      const pinned = await getPinnedMessages(
        undefined,
        effectiveConversationId,
        currentWorkspaceId
      );

      const pinnedMap = new Map<string, PinnedMessage>();
      pinned.forEach((pin) => {
        pinnedMap.set(pin.message._id, pin);
      });
      setPinnedMessages(pinnedMap);
    } catch (error) {
      console.error('Error fetching pinned messages:', error);
    }
  };

  const handlePinMessage = async (messageId: string) => {
    try {
      if (!currentWorkspaceId || !effectiveConversationId) return;

      const isPinned = pinnedMessages.has(messageId);

      if (isPinned) {
        // Unpin the message
        await unpinMessage(messageId, undefined, effectiveConversationId);
        const newPinnedMessages = new Map(pinnedMessages);
        newPinnedMessages.delete(messageId);
        setPinnedMessages(newPinnedMessages);
      } else {
        // Pin the message
        const pinnedMessage = await pinMessage(
          messageId,
          undefined,
          effectiveConversationId,
          currentWorkspaceId
        );
        const newPinnedMessages = new Map(pinnedMessages);
        newPinnedMessages.set(messageId, pinnedMessage);
        setPinnedMessages(newPinnedMessages);
      }
    } catch (error) {
      console.error('Error pinning/unpinning message:', error);
    }
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const getThreadCount = (message: Message) => {
    // Get thread count from message.threadRepliesCount
    return message.threadRepliesCount || 0;
  };

  const handleMarkUnread = (messageId: string) => {
    setFirstUnreadMessageId(messageId);
  };

  const handleJumpToDate = (
    option: 'today' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'beginning' | 'custom',
    customDate?: Date
  ) => {
    const targetDate = getTargetDate(option, customDate);

    // Find the first message on or after the target date
    const targetMessage = messages.find(msg => {
      const msgDate = new Date(msg.createdAt);
      return msgDate >= targetDate;
    });

    if (targetMessage) {
      // Scroll to the message
      const messageElement = messageRefs.current.get(targetMessage._id);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else if (messages.length > 0) {
      // If no message found after target date, scroll to the beginning
      const firstMessage = messages[0];
      const messageElement = messageRefs.current.get(firstMessage._id);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const setMessageRef = (messageId: string, element: HTMLDivElement | null) => {
    if (element) {
      messageRefs.current.set(messageId, element);
    } else {
      messageRefs.current.delete(messageId);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[rgb(26,29,33)]">
      {/* Chat Header */}
      <div className="h-[60px] px-5 border-b border-[rgb(49,48,44)] flex items-center justify-between bg-[rgb(26,29,33)]">
        <div className="flex items-center flex-1 min-w-0">
          <button className="flex items-center gap-2 hover:bg-[rgb(49,48,44)] px-2 py-1 rounded transition-colors">
            <span className="text-white text-xl">#</span>
            <span className="text-[18px] font-bold text-white">
              {activeUser.username || 'Unknown User'}
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
                {activeUser.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h2 className="text-[15px] font-bold text-white mb-2">
                {activeUser.username || 'Unknown User'}
              </h2>
              <div className="text-[15px] text-white leading-[1.46668] mb-4">
                This conversation is just between <strong className="font-bold">@{activeUser.username || 'Unknown User'}</strong> and you. Check out their profile to learn more about them.
              </div>
              <button 
                onClick={openPanel}
                className="px-4 py-2 bg-[rgb(26,29,33)] border border-white rounded text-[15px] font-medium text-white hover:bg-[rgb(49,48,44)] transition-colors"
              >
                View profile
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5">
            {/* Jump to date menu */}
            <div className="flex items-center justify-center my-4">
              <JumpToMenu onJumpToDate={handleJumpToDate} />
            </div>
            {messages
              .filter(message => message.sender && message.sender._id) // Filter out messages with missing sender
              .map((message, index, validMessages) => {
              const isCurrentUser = message.sender._id === currentUser._id;
              const messageUser = isCurrentUser ? currentUser : activeUser;
              const timeSincePrevious = index > 0
                ? new Date(message.createdAt).getTime() - new Date(validMessages[index - 1].createdAt).getTime()
                : 0;
              const showAvatar = index === 0 ||
                !validMessages[index - 1].sender ||
                validMessages[index - 1].sender._id !== message.sender._id ||
                timeSincePrevious > 600000; // Show avatar if more than 10 minutes apart
              const threadCount = getThreadCount(message);
              const shouldShowTimestamp = index === 0 || timeSincePrevious > 600000; // 10 minutes

              const isPinned = pinnedMessages.has(message._id);
              const pinnedInfo = pinnedMessages.get(message._id);

              return (
                <div key={message._id} ref={(el) => setMessageRef(message._id, el)}>
                  {/* Show unread divider before this message if it's marked as first unread */}
                  {firstUnreadMessageId === message._id && <UnreadDivider />}

                  {shouldShowTimestamp && index > 0 && (
                    <div className="flex items-center my-4">
                      <div className="flex-1 border-t border-[rgb(49,48,44)]"></div>
                      <span className="px-2 text-[13px] text-[rgb(209,210,211)]">
                        {formatTime(new Date(message.createdAt))}
                      </span>
                      <div className="flex-1 border-t border-[rgb(49,48,44)]"></div>
                    </div>
                  )}

                  {/* Show pinned label if message is pinned */}
                  {isPinned && pinnedInfo && (
                    <PinnedMessageLabel
                      pinnedByCurrentUser={pinnedInfo.pinnedBy._id === currentUser._id}
                      pinnedBy={pinnedInfo.pinnedBy}
                    />
                  )}

                  <MessageItem
                    message={message}
                    user={messageUser}
                    isCurrentUser={isCurrentUser}
                    showAvatar={showAvatar}
                    threadCount={threadCount}
                    isEditing={editingMessageId === message._id}
                    isPinned={isPinned}
                    onEdit={(newText) => onEditMessage(message._id, newText)}
                    onDelete={() => onDeleteMessage(message._id)}
                    onOpenThread={() => onOpenThread(message._id)}
                    onReaction={(emoji) => onReaction(message._id, emoji)}
                    onMarkUnread={() => handleMarkUnread(message._id)}
                    onPin={() => handlePinMessage(message._id)}
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
          placeholder={`Message ${activeUser.username || 'Unknown User'}`}
          userName={activeUser.username || 'Unknown User'}
        />
      </div>
    </div>
  );
};

export default ChatPane;

