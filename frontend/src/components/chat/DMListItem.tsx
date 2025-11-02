import React, { useEffect, useState } from 'react';
import type { Conversation } from '../../services/messageApi';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import api from '../../config/axios';

interface DMListItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const DMListItem: React.FC<DMListItemProps> = ({ conversation, isActive, onClick }) => {
  const { user } = useAuth();
  const { messages } = useWorkspace();
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);

  // Get the other user in the conversation (not the current user)
  const otherUser = conversation.collaborators?.find((c: any) => c._id !== user?._id);

  // Get display name
  const displayName = conversation.isSelf
    ? `${user?.username || 'You'} (you)`
    : otherUser?.username || 'Unknown User';

  // Get last message for this conversation
  const conversationMessages = messages.filter(m => m.conversation === conversation._id);
  const lastMessage = conversationMessages[conversationMessages.length - 1];

  // Format last message preview
  const getLastMessagePreview = () => {
    if (!lastMessage) return 'No messages yet';

    const prefix = (lastMessage.sender as any)?._id === user?._id ? 'You: ' : '';
    const content = lastMessage.content || '';

    // Truncate if too long
    const maxLength = 50;
    if (content.length > maxLength) {
      return `${prefix}${content.substring(0, maxLength)}...`;
    }

    return `${prefix}${content}`;
  };

  // Format timestamp
  const formatTimestamp = () => {
    if (!lastMessage?.createdAt) return '';

    const messageDate = new Date(lastMessage.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Today - show time
      return messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Get initials for avatar
  const getInitials = () => {
    if (conversation.isSelf) {
      return user?.username?.charAt(0).toUpperCase() || 'Y';
    }
    return otherUser?.username?.charAt(0).toUpperCase() || '?';
  };

  // Get avatar color
  const getAvatarColor = () => {
    const colors = [
      'bg-purple-600',
      'bg-blue-600',
      'bg-green-600',
      'bg-yellow-600',
      'bg-red-600',
      'bg-pink-600',
      'bg-indigo-600',
      'bg-teal-600',
      'bg-orange-600'
    ];

    // Use conversation ID to consistently pick a color
    const hash = conversation._id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Fetch profile picture
  useEffect(() => {
    let localUrl: string | null = null;
    let mounted = true;

    const fetchProfilePic = async () => {
      if (conversation.isSelf && user?._id) {
        try {
          const response = await api.get(`/users/${user._id}/picture`, {
            responseType: 'blob'
          });
          const imageUrl = URL.createObjectURL(response.data);
          localUrl = imageUrl;
          
          // Only update state if still mounted and conversation hasn't changed
          if (mounted) {
            setProfilePicUrl(imageUrl);
          } else {
            // Component unmounted before fetch completed, revoke immediately
            URL.revokeObjectURL(imageUrl);
          }
        } catch (error) {
          console.error('Error fetching profile picture:', error);
        }
      } else if (otherUser?._id) {
        try {
          const response = await api.get(`/users/${otherUser._id}/picture`, {
            responseType: 'blob'
          });
          const imageUrl = URL.createObjectURL(response.data);
          localUrl = imageUrl;
          
          // Only update state if still mounted and conversation hasn't changed
          if (mounted) {
            setProfilePicUrl(imageUrl);
          } else {
            // Component unmounted before fetch completed, revoke immediately
            URL.revokeObjectURL(imageUrl);
          }
        } catch (error) {
          console.error('Error fetching profile picture:', error);
        }
      }
    };

    fetchProfilePic();

    return () => {
      mounted = false;
      // Revoke the locally tracked URL created in this effect run
      if (localUrl) {
        URL.revokeObjectURL(localUrl);
      }
    };
  }, [conversation._id, user?._id, otherUser?._id]);

  // Check if user is online
  const isOnline = conversation.isSelf ? user?.isOnline : otherUser?.isOnline;

  const handleClick = () => {
    console.log('🖱️ DMListItem: Clicked on conversation:', conversation._id);
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full px-5 py-2.5 flex items-start gap-3 hover:bg-[#302234] transition-colors ${
        isActive ? 'bg-[#7d3986]' : ''
      }`}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {profilePicUrl ? (
          <img
            src={profilePicUrl}
            alt={displayName}
            className="w-9 h-9 rounded"
          />
        ) : (
          <div className={`w-9 h-9 rounded ${getAvatarColor()} flex items-center justify-center text-white text-[15px] font-semibold`}>
            {getInitials()}
          </div>
        )}
        {isOnline && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1a1d21]"></div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-baseline justify-between gap-2 mb-0.5">
          <span className="text-white text-[15px] font-semibold truncate">
            {displayName}
          </span>
          {lastMessage && (
            <span className="text-[#868686] text-[12px] flex-shrink-0">
              {formatTimestamp()}
            </span>
          )}
        </div>
        <div className="text-[#d1d2d3] text-[13px] truncate">
          {getLastMessagePreview()}
        </div>
      </div>
    </button>
  );
};

export default DMListItem;
