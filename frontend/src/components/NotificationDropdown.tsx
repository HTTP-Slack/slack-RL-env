import { useState, useEffect, useRef } from 'react';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../services/notificationApi';
import type { Notification } from '../types/notification';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId?: string | null;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationDropdown({ isOpen, onClose, workspaceId, onUnreadCountChange }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && workspaceId) {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [isOpen, workspaceId]);

  const fetchNotifications = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const response = await getNotifications(workspaceId, undefined, 20, 0);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!workspaceId) return;
    try {
      const count = await getUnreadCount(workspaceId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markAsRead(notification._id);
        setNotifications(prev =>
          prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
        );
        const newCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newCount);
        
        // Notify parent component of count change
        onUnreadCountChange?.(newCount);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    onClose();

    // Navigate to the message/channel/conversation
    // We emit a custom event that Dashboard can listen to for navigation
    if (notification.channel) {
      const event = new CustomEvent('navigate-to-channel', {
        detail: { channelId: notification.channel._id }
      });
      window.dispatchEvent(event);
    } else if (notification.conversation) {
      const event = new CustomEvent('navigate-to-conversation', {
        detail: { conversationId: notification.conversation._id }
      });
      window.dispatchEvent(event);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!workspaceId) return;
    try {
      await markAllAsRead(workspaceId);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      
      // Notify parent component of count change
      onUnreadCountChange?.(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationText = (notification: Notification): string => {
    const senderName = notification.sender?.username || 'Someone';
    const channelName = notification.channel?.name || '';
    
    switch (notification.type) {
      case 'mention':
        return `${senderName} mentioned you in ${channelName || 'a conversation'}`;
      case 'channel_mention':
        if (notification.metadata?.hasChannelMention) {
          return `${senderName} mentioned @channel in ${channelName}`;
        } else if (notification.metadata?.hasHereMention) {
          return `${senderName} mentioned @here in ${channelName}`;
        }
        return `${senderName} mentioned the channel ${channelName}`;
      case 'direct_message':
        return `${senderName} sent you a message`;
      case 'thread_reply':
        return `${senderName} replied to a thread`;
      default:
        return `${senderName} notified you`;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute bottom-full left-0 mb-2 w-96 bg-[#1a1d21] rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50 max-h-[500px]"
      style={{ left: '-180px' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-400 text-sm">No notifications</div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onClick={() => handleNotificationClick(notification)}
              getText={getNotificationText}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
  getText: (notification: Notification) => string;
}

function NotificationItem({ notification, onClick, getText }: NotificationItemProps) {
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 ${
        !notification.isRead ? 'bg-gray-800/50' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
          !notification.isRead ? 'bg-blue-500' : 'bg-transparent'
        }`} />
        <div className="flex-1 min-w-0">
          <div className="text-white text-sm font-medium truncate">
            {getText(notification)}
          </div>
          {notification.message?.content && (
            <div className="text-gray-400 text-xs mt-1 truncate">
              {notification.message.content}
            </div>
          )}
          <div className="text-gray-500 text-xs mt-1">
            {formatTime(notification.createdAt)}
          </div>
        </div>
      </div>
    </button>
  );
}

