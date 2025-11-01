import React, { useState, useMemo } from 'react';
import LeftNav from '../components/chat/LeftNav';
import Sidebar from '../components/chat/Sidebar';
import ChatPane from '../components/chat/ChatPane';
import ThreadPanel from '../components/chat/ThreadPanel';
import {
  MOCK_CURRENT_USER,
  MOCK_USERS,
  MOCK_MESSAGES,
  MOCK_THREADS,
} from '../constants/chat';
import type { Message, Thread } from '../constants/chat';

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
    const existingThreadId = Object.keys(threads).find(
      (tid) => threads[tid]?.[0]?.messageId === messageId
    );

    // Create new thread if it doesn't exist
    const threadId = existingThreadId || `thread-${messageId}`;
    
    if (!existingThreadId) {
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
    <div className="flex flex-col h-screen bg-[#1a1d21] text-white overflow-hidden">
      {/* Top Navigation Bar */}
      <div className="h-[44px] bg-[#350d36] flex items-center px-2 shrink-0">
        {/* Left spacer */}
        <div className="flex-1"></div>
        
        {/* Centered content */}
        <div className="flex items-center gap-2">
          {/* Back/Forward buttons */}
          <button className="p-1.5 hover:bg-[#6f4d72] rounded transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="p-1.5 hover:bg-[#6f4d72] rounded transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="p-1.5 hover:bg-[#6f4d72] rounded transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>

          {/* Search Bar */}
          <div className="w-[600px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search HTTP Test Environment"
                className="w-full bg-[#6f4d72] text-white placeholder-[#d1d2d3] px-3 py-1.5 rounded border border-transparent focus:border-white focus:outline-none text-[13px]"
              />
              <svg className="w-4 h-4 text-white absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Right spacer with help button at the end */}
        <div className="flex-1 flex justify-end">
          <button className="p-1.5 hover:bg-[#6f4d72] rounded transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <LeftNav />
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
    </div>
  );
};

export default Dashboard;

