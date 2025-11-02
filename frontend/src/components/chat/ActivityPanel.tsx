import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import axios from '../../config/axios';
import { parseMarkdown } from '../../utils/markdown';

interface ActivityItem {
  _id: string;
  type: 'mention' | 'channel_mention' | 'direct_message' | 'channel-invitation' | 'thread-reply' | 'reaction';
  message?: {
    _id: string;
    content: string;
  };
  channel?: {
    _id: string;
    name: string;
  };
  conversation?: {
    _id: string;
  };
  sender?: {
    _id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  isRead: boolean;
}

interface ActivityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (type: 'channel' | 'conversation', id: string) => void;
}

export const ActivityPanel: React.FC<ActivityPanelProps> = ({ isOpen, onNavigate }) => {
  const { currentWorkspaceId, socket } = useWorkspace();
  const [activeTab, setActiveTab] = useState<'all' | 'mentions' | 'threads' | 'reactions' | 'invitations'>('all');
  const [showUnreadsOnly, setShowUnreadsOnly] = useState(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentWorkspaceId) {
      fetchActivities();
    }
  }, [isOpen, currentWorkspaceId, activeTab, showUnreadsOnly]);

  // Listen for new notifications via Socket.IO
  useEffect(() => {
    if (!socket || !isOpen) return;

    const handleNewNotification = (notification: ActivityItem) => {
      // Map notification type to tab
      const typeToTab: Record<string, string> = {
        'mention': 'mentions',
        'channel_mention': 'mentions',
        'direct_message': 'mentions',
        'channel-invitation': 'invitations',
        'thread-reply': 'threads',
        'reaction': 'reactions',
      };
      
      const notificationTab = typeToTab[notification.type];
      
      // Add new notification to the list if it matches the current filter
      if (activeTab === 'all' || notificationTab === activeTab) {
        setActivities(prev => [notification, ...prev]);
      }
    };

    socket.on('new-notification', handleNewNotification);

    return () => {
      socket.off('new-notification', handleNewNotification);
    };
  }, [socket, isOpen, activeTab]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Map UI tab names to backend notification enum values
      const getTypeFilter = (): string | undefined => {
        switch (activeTab) {
          case 'all':
            return undefined;
          case 'mentions':
            return 'mention,channel_mention,direct_message';
          case 'threads':
            return 'thread-reply';
          case 'reactions':
            return 'reaction';
          case 'invitations':
            return 'channel-invitation';
          default:
            return undefined;
        }
      };

      const response = await axios.get('/notifications', {
        params: {
          organisation: currentWorkspaceId,
          type: getTypeFilter(),
          isRead: showUnreadsOnly ? false : undefined,
        },
      });
      setActivities(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActivityClick = async (activity: ActivityItem) => {
    // Mark as read
    try {
      await axios.patch(`/notifications/${activity._id}/read`);
      setActivities(prev => prev.map(a => a._id === activity._id ? { ...a, isRead: true } : a));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }

    // Navigate to channel or conversation
    if (activity.channel) {
      onNavigate('channel', activity.channel._id);
    } else if (activity.conversation) {
      onNavigate('conversation', activity.conversation._id);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} mins`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="w-[530px] h-full bg-linear-to-b from-[#211125] to-[#180d1b] flex flex-col">
      {/* Header */}
      <div className="h-[49px] px-5 flex items-center justify-between shrink-0">
        <h2 className="text-white text-[18px] font-bold">Activity</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <span className="text-[13px] text-[#d1d2d3]">Unreads</span>
            <button
              onClick={() => setShowUnreadsOnly(!showUnreadsOnly)}
              className={`relative w-[34px] h-[20px] rounded-full transition-colors ${
                showUnreadsOnly ? 'bg-[#007a5a]' : 'bg-[#4d394b]'
              }`}
            >
              <span
                className={`absolute top-[2px] ${
                  showUnreadsOnly ? 'left-[16px]' : 'left-[2px]'
                } w-[16px] h-[16px] bg-white rounded-full transition-all`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 py-2 shrink-0 border-b border-[#3b2d3e]">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded text-[13px] font-medium transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-[#ffffff14] text-white'
                : 'text-[#d1d2d3] hover:bg-[#ffffff14]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('mentions')}
            className={`px-2 py-1 rounded text-[13px] font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'mentions'
                ? 'bg-[#ffffff14] text-white'
                : 'text-[#d1d2d3] hover:bg-[#ffffff14]'
            }`}
          >
            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.002 3.5a1.25 1.25 0 0 1 1.248 1.25v9a1.25 1.25 0 0 1-1.248 1.25H12.5v1.498a1.25 1.25 0 0 1-2.125.884l-3.248-3.248a.15.15 0 0 0-.106-.043H4a1.25 1.25 0 0 1-1.25-1.25v-9A1.25 1.25 0 0 1 4 3.502zm-8 8.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5m4 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5" clipRule="evenodd" />
            </svg>
            Mentions
          </button>
          <button
            onClick={() => setActiveTab('threads')}
            className={`px-2 py-1 rounded text-[13px] font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'threads'
                ? 'bg-[#ffffff14] text-white'
                : 'text-[#d1d2d3] hover:bg-[#ffffff14]'
            }`}
          >
            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a8 8 0 0 0-6.646 12.438l-.959 2.877a.75.75 0 0 0 .928.928l2.877-.959A8 8 0 1 0 10 2M6.75 8.5a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75m.75 2.75a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5z" clipRule="evenodd" />
            </svg>
            Threads
          </button>
          <button
            onClick={() => setActiveTab('reactions')}
            className={`px-2 py-1 rounded text-[13px] font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'reactions'
                ? 'bg-[#ffffff14] text-white'
                : 'text-[#d1d2d3] hover:bg-[#ffffff14]'
            }`}
          >
            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16M6.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m7-1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m-7.25 5.5a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 .604 1.196 5.5 5.5 0 0 1-7.208 0A.75.75 0 0 1 6.25 13" clipRule="evenodd" />
            </svg>
            Reactions
          </button>
          <button
            onClick={() => setActiveTab('invitations')}
            className={`px-2 py-1 rounded text-[13px] font-medium transition-colors whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'invitations'
                ? 'bg-[#ffffff14] text-white'
                : 'text-[#d1d2d3] hover:bg-[#ffffff14]'
            }`}
          >
            <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 4.25A2.25 2.25 0 0 1 4.25 2h2.5A2.25 2.25 0 0 1 9 4.25v2.5A2.25 2.25 0 0 1 6.75 9h-2.5A2.25 2.25 0 0 1 2 6.75zm0 9A2.25 2.25 0 0 1 4.25 11h2.5A2.25 2.25 0 0 1 9 13.25v2.5A2.25 2.25 0 0 1 6.75 18h-2.5A2.25 2.25 0 0 1 2 15.75zm9-9A2.25 2.25 0 0 1 13.25 2h2.5A2.25 2.25 0 0 1 18 4.25v2.5A2.25 2.25 0 0 1 15.75 9h-2.5A2.25 2.25 0 0 1 11 6.75zm0 9A2.25 2.25 0 0 1 13.25 11h2.5a2.25 2.25 0 0 1 2.25 2.25v2.5A2.25 2.25 0 0 1 15.75 18h-2.5A2.25 2.25 0 0 1 11 15.75z" />
            </svg>
            Invitations
          </button>
          <button className="px-2 py-1 rounded text-[13px] font-medium text-[#d1d2d3] hover:bg-[#ffffff14] transition-colors">
            ...
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <p className="text-[#d1d2d3] mb-2">No activity yet</p>
            <p className="text-[#616061] text-sm">When you get notifications, they'll show up here</p>
          </div>
        ) : (
          <div>
            {activities.map((activity) => (
              <button
                key={activity._id}
                onClick={() => handleActivityClick(activity)}
                className={`w-full px-5 py-2 flex items-start gap-3 hover:bg-[#1164A3] hover:bg-opacity-[0.15] transition-colors text-left ${
                  !activity.isRead ? 'bg-[#1a1d29]' : ''
                }`}
              >
                {/* Left Section: Icon/Avatar */}
                <div className="shrink-0 mt-1 flex items-start gap-2">
                  {/* Type Icon */}
                  <div className="w-4 h-4 text-[#868686] shrink-0 mt-0.5">
                    {activity.type === 'mention' && (
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.002 3.5a1.25 1.25 0 0 1 1.248 1.25v9a1.25 1.25 0 0 1-1.248 1.25H12.5v1.498a1.25 1.25 0 0 1-2.125.884l-3.248-3.248a.15.15 0 0 0-.106-.043H4a1.25 1.25 0 0 1-1.25-1.25v-9A1.25 1.25 0 0 1 4 3.502zm-8 8.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5m4 0a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5" />
                      </svg>
                    )}
                    {activity.type === 'channel-invitation' && (
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M7 3.25A2.25 2.25 0 0 0 4.75 5.5v9c0 1.243 1.007 2.25 2.25 2.25h6A2.25 2.25 0 0 0 15.25 14.5v-9A2.25 2.25 0 0 0 13 3.25zm-.5 2.25a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75M7.25 8a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5zm0 2.5a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5zm0 2.5a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Avatar */}
                  {activity.sender?.avatar ? (
                    <img
                      src={activity.sender.avatar}
                      alt={activity.sender.username}
                      className="w-9 h-9 rounded"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded bg-[#611f69] flex items-center justify-center text-white text-[15px] font-medium">
                      {activity.sender?.username?.[0]?.toUpperCase() || 'A'}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  {(activity.type === 'mention' || activity.type === 'channel_mention') && activity.channel && (
                    <>
                      <div className="flex items-baseline gap-1 mb-0.5">
                        <span className="text-[#1d9bd1] text-[13px] font-medium">@ Mention in</span>
                        <span className="text-[#1d9bd1] text-[13px] font-medium"># {activity.channel.name}</span>
                      </div>
                      <div className="mb-1">
                        <span className="text-[#d1d2d3] text-[15px] font-bold">{activity.sender?.username}</span>
                        <span className="text-[#ababad] text-[15px] ml-1">
                          {activity.message?.content && parseMarkdown(activity.message.content).map((part, idx) => (
                            <React.Fragment key={idx}>{part}</React.Fragment>
                          ))}
                        </span>
                      </div>
                      <div className="text-[#ababad] text-[13px]">{formatTime(activity.createdAt)}</div>
                    </>
                  )}
                  
                  {activity.type === 'channel-invitation' && activity.channel && (
                    <>
                      <div className="flex items-baseline gap-1 mb-0.5">
                        <span className="text-[#1d9bd1] text-[13px] font-medium"># Channel Invitation</span>
                      </div>
                      <div className="mb-1">
                        <span className="text-[#d1d2d3] text-[15px] font-bold">{activity.sender?.username}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[#ababad] text-[15px]">Added you to</span>
                        <span className="text-[#1d9bd1] text-[15px]">#{activity.channel.name}</span>
                      </div>
                      <div className="text-[#ababad] text-[13px] mt-1">{formatTime(activity.createdAt)}</div>
                    </>
                  )}

                  {activity.type === 'direct_message' && activity.conversation && (
                    <>
                      <div className="flex items-baseline gap-1 mb-0.5">
                        <span className="text-[#1d9bd1] text-[13px] font-medium">Direct Message</span>
                      </div>
                      <div className="mb-1">
                        <span className="text-[#d1d2d3] text-[15px] font-bold">{activity.sender?.username}</span>
                        <span className="text-[#ababad] text-[15px] ml-1">
                          {activity.message?.content && parseMarkdown(activity.message.content).map((part, idx) => (
                            <React.Fragment key={idx}>{part}</React.Fragment>
                          ))}
                        </span>
                      </div>
                      <div className="text-[#ababad] text-[13px]">{formatTime(activity.createdAt)}</div>
                    </>
                  )}
                </div>

                {/* Right Section: Actions */}
                <div className="shrink-0 flex items-start gap-2 mt-1">
                  <button 
                    className="w-8 h-8 flex items-center justify-center hover:bg-[#ffffff14] rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Bookmark action
                    }}
                  >
                    <svg className="w-[18px] h-[18px] text-[#d1d2d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button 
                    className="w-8 h-8 flex items-center justify-center hover:bg-[#ffffff14] rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      // More options
                    }}
                  >
                    <svg className="w-[18px] h-[18px] text-[#d1d2d3]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 10a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m5.5 0a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m7-1.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3" />
                    </svg>
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
