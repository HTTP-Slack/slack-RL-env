import React, { useState } from 'react';
import type { IChannel } from '../../types/channel';
import type { User } from '../../services/messageApi';
import { isToday } from '../../utils/dateUtils';
import AddMembersToChannelModal from './AddMembersToChannelModal';
import EditDescriptionModal from './EditDescriptionModal';
import SendEmailsToChannelModal from './SendEmailsToChannelModal';

interface ChannelHeaderInfoProps {
  channel: IChannel;
  currentUser: User;
  onRefreshChannel?: () => void;
}

const ChannelHeaderInfo: React.FC<ChannelHeaderInfoProps> = ({
  channel,
  currentUser,
  onRefreshChannel,
}) => {
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [showAddDescription, setShowAddDescription] = useState(false);
  const [showSendEmails, setShowSendEmails] = useState(false);

  // Get creator (first collaborator) and creation date
  const creator = channel.collaborators?.[0];
  const createdAt = channel.createdAt ? new Date(channel.createdAt) : new Date();
  const isCreatedToday = isToday(createdAt);

  const formatCreatedDate = () => {
    if (isCreatedToday) {
      return 'today';
    }
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const createdDate = new Date(createdAt);
    createdDate.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    
    if (createdDate.getTime() === yesterday.getTime()) {
      return 'yesterday';
    }
    
    // Format as "Month Day, Year" if not today or yesterday
    return createdAt.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Handle both username (from User model) and name (from IUser type)
  const creatorName = (creator as any)?.username || (creator as any)?.name || 'Someone';
  const createdDateText = formatCreatedDate();

  return (
    <>
      <div className="px-5 pt-5 pb-4 border-b border-[rgba(121,124,129,0.3)]">
        {/* Channel Name */}
        <h1 className="text-[28px] font-bold text-white mb-3">
          #{channel.name}
        </h1>

        {/* Channel Description/Info */}
        <div className="text-[15px] text-[rgb(209,210,211)] leading-[1.46668] mb-4">
          {channel.description ? (
            <p className="mb-2">{channel.description}</p>
          ) : null}
          <span>
            <button
              onClick={() => setShowAddDescription(true)}
              className="text-[rgb(97,192,250)] hover:underline font-medium"
            >
              @{creatorName}
            </button>
            {' '}created this channel {createdDateText}. This is the very beginning of the{' '}
            <strong className="font-bold">#{channel.name}</strong> channel.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Add Description Button */}
          <button
            onClick={() => setShowAddDescription(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-[6px] bg-[rgb(26,29,33)] border border-[rgba(121,124,129,0.3)] hover:bg-[rgb(49,48,44)] transition-colors text-[15px] font-medium text-white"
          >
            <svg
              viewBox="0 0 20 20"
              className="w-4 h-4"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M13.293 2.293a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1 0 1.414l-9 9a1 1 0 0 1-.5.277l-4 1a1 1 0 0 1-1.225-1.225l1-4a1 1 0 0 1 .277-.5l9-9ZM14 4.414l-8 8L4.586 14l8-8L14 4.414Zm1.707-1.707L16.586 3l-8 8-.793.793-1 4 4-1 .793-.793 8-8-1.293-1.293Z"
                fill="currentColor"
              />
            </svg>
            <span>Add Description</span>
          </button>

          {/* Add People to Channel Button */}
          <button
            onClick={() => setShowAddMembers(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-[6px] bg-[rgb(26,29,33)] border border-[rgba(121,124,129,0.3)] hover:bg-[rgb(49,48,44)] transition-colors text-[15px] font-medium text-white"
          >
            <svg
              viewBox="0 0 20 20"
              className="w-4 h-4"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM5 5a5 5 0 1 1 10 0A5 5 0 0 1 5 5Zm-1 8a7 7 0 0 1 12 0 1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Zm9-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm3 1a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-6 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                fill="currentColor"
              />
            </svg>
            <span>Add People to Channel</span>
          </button>

          {/* Send Emails to Channel Button */}
          <button
            onClick={() => setShowSendEmails(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-[6px] bg-[rgb(26,29,33)] border border-[rgba(121,124,129,0.3)] hover:bg-[rgb(49,48,44)] transition-colors text-[15px] font-medium text-white"
          >
            <svg
              viewBox="0 0 20 20"
              className="w-4 h-4"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3 4.5A1.5 1.5 0 0 1 4.5 3h11A1.5 1.5 0 0 1 17 4.5v11a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 15.5v-11Zm1.5-.5a.5.5 0 0 0-.5.5v11a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5h-11ZM5 6.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5Zm0 3a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5Zm0 3a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5Z"
                fill="currentColor"
              />
            </svg>
            <span>Send Emails to Channel</span>
          </button>
        </div>
      </div>

      {/* Add Members Modal */}
      <AddMembersToChannelModal
        isOpen={showAddMembers}
        onClose={() => setShowAddMembers(false)}
        channelId={channel._id}
        channelName={channel.name}
        onMembersAdded={() => {
          onRefreshChannel?.();
        }}
      />

      {/* Edit Description Modal */}
      <EditDescriptionModal
        isOpen={showAddDescription}
        onClose={() => setShowAddDescription(false)}
        channel={channel}
        onDescriptionUpdated={() => {
          onRefreshChannel?.();
        }}
      />

      {/* Send Emails Modal */}
      <SendEmailsToChannelModal
        isOpen={showSendEmails}
        onClose={() => setShowSendEmails(false)}
        channelName={channel.name}
      />
    </>
  );
};

export default ChannelHeaderInfo;

