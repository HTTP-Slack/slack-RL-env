import React, { useState, useEffect, useRef } from 'react';
import type { Message, Thread, User } from '../../services/messageApi';
import { getThreadReplies } from '../../services/messageApi';
import MessageItem from './MessageItem';
import MessageComposer from './MessageComposer';
import { useWorkspace } from '../../context/WorkspaceContext';

interface ThreadPanelProps {
  parentMessage: Message;
  currentUser: User;
  onClose: () => void;
}

const ThreadPanel: React.FC<ThreadPanelProps> = ({
  parentMessage,
  currentUser,
  onClose,
}) => {
  const { socket } = useWorkspace();
  const [threadReplies, setThreadReplies] = useState<Thread[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadReplies]);

  // Fetch existing thread replies when component mounts
  useEffect(() => {
    const fetchReplies = async () => {
      setLoading(true);
      const replies = await getThreadReplies(parentMessage._id);
      setThreadReplies(replies);
      setLoading(false);
    };

    fetchReplies();
  }, [parentMessage._id]);

  // Join the thread room
  useEffect(() => {
    if (socket && parentMessage._id) {
      console.log('🧵 Joining thread room:', parentMessage._id);
      console.log('🔌 Socket connected:', socket.connected);
      console.log('🆔 Socket ID:', socket.id);
      
      socket.emit('thread-open', { messageId: parentMessage._id, userId: currentUser._id });
      
      // Listen for new thread messages
      const handleThreadMessage = ({ newMessage }: { newMessage: Thread }) => {
        console.log('📨 Received thread message via socket:', newMessage);
        setThreadReplies((prev) => [...prev, newMessage]);
      };

      // Listen for thread message updates (edits, reactions)
      const handleMessageUpdated = ({ id, message, isThread }: { id: string; message: Thread; isThread?: boolean }) => {
        if (isThread) {
          console.log('✏️ Thread message updated:', id);
          setThreadReplies((prev) =>
            prev.map((reply) => (reply._id === id ? message : reply))
          );
        }
      };

      // Listen for thread message deletions
      const handleMessageDeleted = ({ id, isThread }: { id: string; isThread?: boolean }) => {
        if (isThread) {
          console.log('🗑️ Thread message deleted:', id);
          setThreadReplies((prev) => prev.filter((reply) => reply._id !== id));
        }
      };

      console.log('👂 Registering socket listeners for thread events');
      
      // Debug: Log all socket events
      const debugListener = (eventName: string) => {
        return (...args: any[]) => {
          console.log(`🔔 Socket event "${eventName}" received:`, args);
        };
      };
      
      socket.onAny(debugListener('ANY'));
      
      socket.on('thread-message', handleThreadMessage);
      socket.on('message-updated', handleMessageUpdated);
      socket.on('message-deleted', handleMessageDeleted);

      return () => {
        console.log('🧹 Cleaning up thread socket listeners');
        socket.offAny(debugListener('ANY'));
        socket.off('thread-message', handleThreadMessage);
        socket.off('message-updated', handleMessageUpdated);
        socket.off('message-deleted', handleMessageDeleted);
      };
    } else {
      console.warn('⚠️ Thread room setup skipped:', { hasSocket: !!socket, messageId: parentMessage._id });
    }
  }, [socket, parentMessage._id, currentUser._id]);

  const handleSendReply = (text: string, _attachments?: string[]) => {
    console.log('🔍 handleSendReply called:', { hasSocket: !!socket, text, trimmed: text.trim() });
    
    if (!socket) {
      console.error('❌ No socket available!');
      return;
    }
    
    if (!text.trim()) {
      console.warn('⚠️ Empty text, not sending');
      return;
    }
    
    // TODO: Implement file attachments in thread replies (_attachments parameter available)

    console.log('📤 Emitting thread-message event:', {
      userId: currentUser._id,
      messageId: parentMessage._id,
      content: text,
    });
    
    socket.emit('thread-message', {
      userId: currentUser._id,
      messageId: parentMessage._id,
      message: {
        sender: currentUser._id,
        content: text,
      },
    });
    
    console.log('✅ thread-message event emitted successfully');
  };

  const handleEditMessage = (messageId: string, newText: string) => {
    console.log('✏️ Edit thread message:', messageId, newText);
    if (!socket) return;

    socket.emit('edit-message', {
      messageId,
      newContent: newText,
      isThread: true,
    });
    setEditingMessageId(null);
  };

  const handleDeleteMessage = (messageId: string) => {
    console.log('🗑️ Delete thread message:', messageId);
    if (!socket) return;

    socket.emit('delete-message', {
      messageId,
      isThread: true,
    });
  };

  const handleReaction = (messageId: string, emoji: string) => {
    console.log('👍 Add reaction to thread message:', emoji, messageId);
    if (!socket) return;

    socket.emit('reaction', {
      emoji,
      id: messageId,
      isThread: true,
      userId: currentUser._id,
    });
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="w-[450px] h-full bg-[rgb(26,29,33)] border-l border-[rgb(82,82,82)] flex flex-col">
      {/* Thread Header */}
      <div className="h-[60px] px-5 border-b border-[rgb(49,48,44)] flex items-center justify-between bg-[rgb(26,29,33)]">
        <div className="flex items-center gap-2">
          <h2 className="text-[18px] font-bold text-white">Thread</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[rgb(49,48,44)] rounded transition-colors"
          title="Close thread"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Thread Messages */}
      <div className="flex-1 overflow-y-auto px-5 pt-5">
        {/* Parent Message */}
        <div className="mb-4">
          <MessageItem
            message={parentMessage}
            user={parentMessage.sender}
            isCurrentUser={parentMessage.sender._id === currentUser._id}
            showAvatar={true}
            threadCount={0}
            isEditing={false}
            onEdit={() => {}}
            onDelete={() => {}}
            onOpenThread={() => {}}
            onMarkUnread={() => {}}
            onReaction={(emoji) => {
              if (!socket) return;
              socket.emit('reaction', {
                emoji,
                id: parentMessage._id,
                isThread: false,
                userId: currentUser._id,
              });
            }}
            formatTime={formatTime}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[rgb(209,210,211)]"></div>
          </div>
        )}

        {/* Reply Count */}
        {!loading && threadReplies.length > 0 && (
          <div className="flex items-center gap-2 mb-4 text-sm text-[rgb(209,210,211)]">
            <div className="h-px flex-1 bg-[rgb(82,82,82)]"></div>
            <span>{threadReplies.length} {threadReplies.length === 1 ? 'reply' : 'replies'}</span>
            <div className="h-px flex-1 bg-[rgb(82,82,82)]"></div>
          </div>
        )}

        {/* Thread Replies */}
        {!loading && threadReplies.map((reply, index) => {
          const showAvatar =
            index === 0 ||
            threadReplies[index - 1].sender._id !== reply.sender._id ||
            new Date(reply.createdAt).getTime() -
              new Date(threadReplies[index - 1].createdAt).getTime() >
              300000; // 5 minutes

          return (
            <MessageItem
              key={reply._id}
              message={{
                ...reply,
                channel: parentMessage.channel,
                conversation: parentMessage.conversation,
                organisation: parentMessage.organisation,
              } as any}
              user={reply.sender}
              isCurrentUser={reply.sender._id === currentUser._id}
              showAvatar={showAvatar}
              threadCount={0}
              isEditing={editingMessageId === reply._id}
              onEdit={(newText) => handleEditMessage(reply._id, newText)}
              onDelete={() => handleDeleteMessage(reply._id)}
              onOpenThread={() => {}}
              onMarkUnread={() => {}}
              onReaction={(emoji) => handleReaction(reply._id, emoji)}
              formatTime={formatTime}
            />
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply Composer */}
      <div className="border-t border-[rgb(82,82,82)] px-5 py-3 bg-[rgb(26,29,33)]">
        <MessageComposer
          onSend={handleSendReply}
          placeholder={`Reply to ${parentMessage.sender.username}...`}
        />
        <div className="mt-2 flex items-center text-xs text-[rgb(134,134,134)]">
          <input
            type="checkbox"
            id="alsoSendToChannel"
            className="mr-2 w-4 h-4 rounded border-[rgb(134,134,134)]"
          />
          <label htmlFor="alsoSendToChannel">
            Also send to # {parentMessage.channel ? 'channel' : 'conversation'}
          </label>
        </div>
      </div>
    </div>
  );
};

export default ThreadPanel;

