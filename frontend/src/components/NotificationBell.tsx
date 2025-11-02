import { useState, useEffect, useCallback } from 'react';
import { NotificationDropdown } from './NotificationDropdown';
import { getUnreadCount } from '../services/notificationApi';
import { useWorkspace } from '../context/WorkspaceContext';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { currentWorkspaceId, socket } = useWorkspace();

  const fetchUnreadCount = useCallback(async () => {
    if (!currentWorkspaceId) return;
    try {
      const count = await getUnreadCount(currentWorkspaceId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [currentWorkspaceId]);

  useEffect(() => {
    if (currentWorkspaceId) {
      fetchUnreadCount();
      
      // Set up interval to periodically fetch unread count
      const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [currentWorkspaceId, fetchUnreadCount]);

  useEffect(() => {
    if (!socket) return;

    // Listen for new notifications
    const handleNewNotification = () => {
      fetchUnreadCount();
    };

    socket.on('new-notification', handleNewNotification);

    return () => {
      socket.off('new-notification', handleNewNotification);
    };
  }, [socket, isOpen, fetchUnreadCount]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-11 h-11 flex items-center justify-center rounded hover:bg-[#6f4d72] transition-colors"
        aria-label="Notifications"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#350d36]">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      <NotificationDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        workspaceId={currentWorkspaceId}
        onUnreadCountChange={setUnreadCount}
      />
    </div>
  );
}

