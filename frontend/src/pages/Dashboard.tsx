import React, { useState, useMemo } from 'react';
import Sidebar from '../components/chat/Sidebar';
import ChatPane from '../components/chat/ChatPane';
import ThreadPanel from '../components/chat/ThreadPanel';
import {
  MOCK_CURRENT_USER,
  MOCK_USERS,
  MOCK_MESSAGES,
  MOCK_THREADS,
} from '../constants/chat';
import type { User, Message, Thread } from '../constants/chat';

const Dashboard: React.FC = () => {
  const [activeUserId, setActiveUserId] = useState<string>(MOCK_USERS[0].id);
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [threads, setThreads] = useState<Record<string, Thread[]>>(MOCK_THREADS);
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const activeUser = useMemo(() => {
    return MOCK_USERS.find((u) => u.id === activeUserId) || MOCK_USERS[0];
  }, [activeUserId]);

  const activeMessages = useMemo(() => {
    return messages[activeUserId] || [];
  }, [messages, activeUserId]);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      userId: MOCK_CURRENT_USER.id,
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => ({
      ...prev,
      [activeUserId]: [...(prev[activeUserId] || []), newMessage],
    }));
  };

  const handleEditMessage = (messageId: string, newText: string) => {
    setMessages((prev) => ({
      ...prev,
      [activeUserId]: (prev[activeUserId] || []).map((msg) =>
        msg.id === messageId
          ? { ...msg, text: newText, edited: true }
          : msg
      ),
    }));
    setEditingMessageId(null);
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => ({
      ...prev,
      [activeUserId]: (prev[activeUserId] || []).filter((msg) => msg.id !== messageId),
    }));
  };

  const handleOpenThread = (messageId: string) => {
    // Check if thread already exists
    let threadId = Object.keys(threads).find(
      (tid) => threads[tid]?.[0]?.messageId === messageId
    );

    // Create new thread if it doesn't exist
    if (!threadId) {
      threadId = `thread-${messageId}`;
      const newThread: Thread = {
        id: threadId,
        messageId,
        messages: [],
      };
      setThreads((prev) => ({
        ...prev,
        [threadId]: [newThread],
      }));
    }

    setOpenThreadId(threadId);
  };

  const handleSendThreadMessage = (threadId: string, text: string) => {
    const thread = threads[threadId]?.[0];
    if (!thread) return;

    const newThreadMessage: Message = {
      id: `thread-msg-${Date.now()}`,
      userId: MOCK_CURRENT_USER.id,
      text,
      timestamp: new Date(),
      threadId,
    };

    setThreads((prev) => ({
      ...prev,
      [threadId]: [
        {
          ...thread,
          messages: [...thread.messages, newThreadMessage],
        },
      ],
    }));
  };

  return (
    <div className="flex h-screen bg-[rgb(26,29,33)] text-white overflow-hidden">
      <Sidebar
        currentUser={MOCK_CURRENT_USER}
        users={MOCK_USERS}
        activeUserId={activeUserId}
        onUserSelect={setActiveUserId}
      />
      <ChatPane
        currentUser={MOCK_CURRENT_USER}
        activeUser={activeUser}
        messages={activeMessages}
        threads={threads}
        editingMessageId={editingMessageId}
        onSendMessage={handleSendMessage}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onOpenThread={handleOpenThread}
      />
      {openThreadId && threads[openThreadId]?.[0] && (
        <ThreadPanel
          thread={threads[openThreadId][0]}
          currentUser={MOCK_CURRENT_USER}
          users={[...MOCK_USERS, MOCK_CURRENT_USER]}
          onClose={() => setOpenThreadId(null)}
          onSendMessage={(text) => handleSendThreadMessage(openThreadId, text)}
        />
      )}
    </div>
  );
};

export default Dashboard;

