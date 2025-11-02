import React, { useState, useEffect } from 'react';
import type { IChannel } from '../../types/channel';
import type { User } from '../../services/messageApi';
import { updateChannelDescription, addUsersToChannel } from '../../services/channelApi';

interface ChannelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: IChannel | null;
  currentUser: User;
  onChannelUpdated?: (channel: IChannel) => void;
}

type TabType = 'about' | 'members' | 'tabs' | 'integrations' | 'settings';

const ChannelSettingsModal: React.FC<ChannelSettingsModalProps> = ({
  isOpen,
  onClose,
  channel,
  currentUser,
  onChannelUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [isStarred, setIsStarred] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [membersFilter, setMembersFilter] = useState('Everyone');

  useEffect(() => {
    if (channel) {
      setChannelName(channel.name || '');
      setTopic(channel.title || '');
      setDescription(channel.description || '');
    }
  }, [channel]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !channel) return null;

  const handleSaveName = async () => {
    // TODO: Implement API call to update channel name
    setIsEditingName(false);
  };

  const handleSaveTopic = async () => {
    // TODO: Implement API call to update channel topic
    setIsEditingTopic(false);
  };

  const handleSaveDescription = async () => {
    try {
      await updateChannelDescription(channel._id, description);
      onChannelUpdated?.(channel);
      setIsEditingDescription(false);
    } catch (error) {
      console.error('Failed to update description:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const createdBy = channel.collaborators?.find((c) => {
    // In a real app, you'd check if this user created the channel
    // For now, we'll show the first collaborator
    return true;
  });

  const renderAboutTab = () => (
    <div className="space-y-4">
      {/* Channel name */}
      <div className="bg-[#1a1d21] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[13px] font-semibold text-[#868686]">Channel name</label>
          {!isEditingName && (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-[#5ba4f5] text-[13px] font-medium hover:underline"
            >
              Edit
            </button>
          )}
        </div>
        {isEditingName ? (
          <div className="space-y-2">
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full bg-[#211125] border border-[#3b2d3e] rounded px-3 py-2 text-[15px] text-[#d1d2d3] focus:outline-none focus:border-[#5ba4f5]"
              placeholder="Channel name"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveName}
                className="px-3 py-1.5 bg-[#5ba4f5] text-white rounded text-[13px] font-medium hover:bg-[#4a94e5]"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditingName(false);
                  setChannelName(channel.name || '');
                }}
                className="px-3 py-1.5 bg-[#302234] text-[#d1d2d3] rounded text-[13px] font-medium hover:bg-[#3a2535]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[15px] text-[#d1d2d3]">#{channel.name}</div>
        )}
      </div>

      {/* Topic */}
      <div className="bg-[#1a1d21] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[13px] font-semibold text-[#868686]">Topic</label>
          {!isEditingTopic && (
            <button
              onClick={() => setIsEditingTopic(true)}
              className="text-[#5ba4f5] text-[13px] font-medium hover:underline"
            >
              Edit
            </button>
          )}
        </div>
        {isEditingTopic ? (
          <div className="space-y-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-[#211125] border border-[#3b2d3e] rounded px-3 py-2 text-[15px] text-[#d1d2d3] focus:outline-none focus:border-[#5ba4f5]"
              placeholder="Add a topic"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveTopic}
                className="px-3 py-1.5 bg-[#5ba4f5] text-white rounded text-[13px] font-medium hover:bg-[#4a94e5]"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditingTopic(false);
                  setTopic(channel.title || '');
                }}
                className="px-3 py-1.5 bg-[#302234] text-[#d1d2d3] rounded text-[13px] font-medium hover:bg-[#3a2535]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[15px] text-[#d1d2d3]">
            {topic || <span className="text-[#868686]">Add a topic</span>}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="bg-[#1a1d21] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[13px] font-semibold text-[#868686]">Description</label>
          {!isEditingDescription && (
            <button
              onClick={() => setIsEditingDescription(true)}
              className="text-[#5ba4f5] text-[13px] font-medium hover:underline"
            >
              Edit
            </button>
          )}
        </div>
        {isEditingDescription ? (
          <div className="space-y-2">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#211125] border border-[#3b2d3e] rounded px-3 py-2 text-[15px] text-[#d1d2d3] focus:outline-none focus:border-[#5ba4f5] min-h-[80px] resize-none"
              placeholder="Add a description"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveDescription}
                className="px-3 py-1.5 bg-[#5ba4f5] text-white rounded text-[13px] font-medium hover:bg-[#4a94e5]"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditingDescription(false);
                  setDescription(channel.description || '');
                }}
                className="px-3 py-1.5 bg-[#302234] text-[#d1d2d3] rounded text-[13px] font-medium hover:bg-[#3a2535]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-[15px] text-[#d1d2d3]">
            {description || <span className="text-[#868686]">Add a description</span>}
          </div>
        )}
      </div>

      {/* Managed by */}
      <div className="bg-[#1a1d21] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <label className="text-[13px] font-semibold text-[#868686]">Managed by</label>
            <svg className="w-3 h-3 text-[#868686]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <button className="text-[#5ba4f5] text-[13px] font-medium hover:underline">
            Edit
          </button>
        </div>
        <div className="text-[15px] text-[#5ba4f5]">
          {createdBy ? (typeof createdBy === 'string' ? 'Unknown' : createdBy.username) : 'Unknown'}
        </div>
      </div>

      {/* Created by */}
      <div className="bg-[#1a1d21] rounded-lg p-4">
        <label className="text-[13px] font-semibold text-[#868686] block mb-2">Created by</label>
        <div className="text-[15px] text-[#d1d2d3]">
          {createdBy ? (typeof createdBy === 'string' ? 'Unknown' : createdBy.username) : 'Unknown'} on{' '}
          {formatDate(channel.createdAt)}
        </div>
      </div>

      {/* Leave channel */}
      <div className="bg-[#1a1d21] rounded-lg p-4">
        <button className="text-[#ec5e6f] text-[15px] font-medium hover:underline">
          Leave channel
        </button>
      </div>

      {/* Files */}
      <div className="bg-[#1a1d21] rounded-lg p-4">
        <label className="text-[13px] font-semibold text-[#868686] block mb-2">Files</label>
        <div className="text-[15px] text-[#868686]">
          There aren't any files to see here right now. But there could be — drag and drop any file into the message pane to add it to this conversation.
        </div>
      </div>
    </div>
  );

  const renderMembersTab = () => {
    const filteredMembers = channel.collaborators?.filter((member) => {
      if (typeof member === 'string') return false;
      if (searchQuery) {
        return member.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
               member.email?.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    }) || [];

    return (
      <div className="space-y-4">
        {/* Search and filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#868686]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find members"
              className="w-full bg-[#211125] border border-[#3b2d3e] rounded px-3 py-2 pl-10 text-[15px] text-[#d1d2d3] focus:outline-none focus:border-[#5ba4f5]"
            />
          </div>
          <select
            value={membersFilter}
            onChange={(e) => setMembersFilter(e.target.value)}
            className="bg-[#211125] border border-[#3b2d3e] rounded px-3 py-2 text-[15px] text-[#d1d2d3] focus:outline-none focus:border-[#5ba4f5]"
          >
            <option value="Everyone">Everyone</option>
            <option value="Admins">Admins</option>
            <option value="Members">Members</option>
          </select>
        </div>

        {/* Add people button */}
        <button className="w-full px-4 py-2 bg-[#1a1d21] rounded-lg text-left text-[15px] text-[#d1d2d3] hover:bg-[#211125] transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add people
        </button>

        {/* Members list */}
        <div className="space-y-2">
          {filteredMembers.map((member) => {
            if (typeof member === 'string') return null;
            const isCurrentUser = member._id === currentUser._id;
            const isManager = false; // TODO: Check if user is channel manager
            const initials = member.username?.charAt(0).toUpperCase() || 'U';

            return (
              <div
                key={member._id}
                className="flex items-center justify-between px-4 py-2 bg-[#1a1d21] rounded-lg hover:bg-[#211125] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#522653] flex items-center justify-center text-white text-[13px] font-semibold">
                    {initials}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] text-[#d1d2d3]">
                        {member.username || 'Unknown'}
                        {isCurrentUser && <span className="text-[#868686] ml-1">(you)</span>}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[#868686]">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {isManager && (
                  <button className="px-3 py-1 bg-[#302234] text-[#d1d2d3] rounded text-[13px] font-medium">
                    Channel Manager
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTabsTab = () => {
    const tabs = [
      { id: 'messages', name: 'Messages', icon: '💬', canHide: false },
      { id: 'canvas', name: 'Add canvas', icon: '📄', canHide: true, isVisible: true },
      { id: 'pins', name: 'Pins', icon: '📌', canHide: false },
      { id: 'workflows', name: 'Workflows', icon: '⚡', canHide: true, isVisible: false },
      { id: 'files', name: 'Files', icon: '📁', canHide: true, isVisible: false },
    ];

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-[18px] font-bold text-[#d1d2d3] mb-2">Manage tabs</h3>
          <p className="text-[15px] text-[#868686] mb-4">
            Reorder, add, remove, and hide the tabs that everyone sees in this channel.
          </p>
        </div>

        <div className="space-y-2">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className="flex items-center justify-between px-4 py-3 bg-[#1a1d21] rounded-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-[20px]">{tab.icon}</span>
                <span className="text-[15px] text-[#d1d2d3]">{tab.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {!tab.isVisible && (
                  <span className="text-[13px] text-[#868686]">Hidden</span>
                )}
                {tab.canHide && (
                  <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-[#302234] rounded transition-colors">
                      <svg className="w-4 h-4 text-[#d1d2d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="p-1 hover:bg-[#302234] rounded transition-colors">
                      <svg className="w-4 h-4 text-[#d1d2d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button className="p-1 hover:bg-[#302234] rounded transition-colors">
                      <svg className="w-4 h-4 text-[#d1d2d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button className="w-full px-4 py-2 bg-[#1a1d21] rounded-lg text-left text-[15px] text-[#d1d2d3] hover:bg-[#211125] transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Tab
        </button>
      </div>
    );
  };

  const renderIntegrationsTab = () => (
    <div className="space-y-4">
      <div className="text-center py-12">
        <p className="text-[15px] text-[#868686]">No integrations configured</p>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-4">
      {/* Channel name */}
      <div className="bg-[#1a1d21] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[13px] font-semibold text-[#868686]">Channel name</label>
          <button className="text-[#5ba4f5] text-[13px] font-medium hover:underline">
            Edit
          </button>
        </div>
        <div className="text-[15px] text-[#d1d2d3]">#{channel.name}</div>
      </div>

      {/* Slack Connect */}
      <div className="bg-[#1a1d21] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <label className="text-[13px] font-semibold text-[#868686]">Slack Connect</label>
            <span className="px-2 py-0.5 bg-[#5ba4f5] text-white text-[10px] font-bold rounded">PRO</span>
          </div>
        </div>
        <p className="text-[15px] text-[#868686] mb-4">
          Work with other companies and organizations in this channel.
        </p>
        <a href="#" className="text-[#5ba4f5] text-[13px] font-medium hover:underline mb-4 inline-block">
          Learn more
        </a>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#302234] text-[#d1d2d3] rounded text-[13px] font-medium hover:bg-[#3a2535] flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add People
          </button>
          <button className="px-4 py-2 bg-[#302234] text-[#d1d2d3] rounded text-[13px] font-medium hover:bg-[#3a2535] flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Share Link
          </button>
        </div>
      </div>

      {/* Huddles */}
      <div className="bg-[#1a1d21] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[13px] font-semibold text-[#868686]">Huddles</label>
          <button className="text-[#5ba4f5] text-[13px] font-medium hover:underline">
            Edit
          </button>
        </div>
        <p className="text-[15px] text-[#868686] mb-4">
          Members can start and join huddles in this channel.
        </p>
        <a href="#" className="text-[#5ba4f5] text-[13px] font-medium hover:underline mb-4 inline-block">
          Learn more
        </a>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#302234] text-[#d1d2d3] rounded text-[13px] font-medium hover:bg-[#3a2535] flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Start Huddle
          </button>
          <button className="px-4 py-2 bg-[#302234] text-[#d1d2d3] rounded text-[13px] font-medium hover:bg-[#3a2535] flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Copy Huddle Link
          </button>
        </div>
      </div>

      {/* Always Start AI Notes */}
      <div className="bg-[#1a1d21] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[13px] font-semibold text-[#868686]">Always Start AI Notes</label>
          <button className="text-[#5ba4f5] text-[13px] font-medium hover:underline">
            Edit
          </button>
        </div>
        <p className="text-[15px] text-[#868686]">
          Choose if all huddles in this channel will be transcribed and summarized by default. Members can change this setting.
        </p>
      </div>

      {/* Choose who can add, remove, and reorder tabs */}
      <div className="bg-[#1a1d21] rounded-lg p-4">
        <label className="text-[13px] font-semibold text-[#868686] block mb-2">
          Choose who can add, remove, and reorder tabs
        </label>
        <select className="w-full bg-[#211125] border border-[#3b2d3e] rounded px-3 py-2 text-[15px] text-[#d1d2d3] focus:outline-none focus:border-[#5ba4f5]">
          <option value="Everyone">Everyone</option>
          <option value="Admins">Admins only</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-[900px] h-[80vh] bg-[#1a1d21] rounded-lg shadow-2xl flex overflow-hidden">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 h-[60px] bg-[#1a1d21] border-b border-[#3b2d3e] flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-[18px] font-bold text-[#d1d2d3]">#{channel.name}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsStarred(!isStarred)}
                className="p-2 hover:bg-[#302234] rounded transition-colors"
              >
                <svg
                  className={`w-5 h-5 ${isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-[#868686]'}`}
                  fill={isStarred ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </button>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`px-3 py-1.5 rounded text-[13px] font-medium transition-colors ${
                  notificationsEnabled
                    ? 'bg-[#302234] text-[#d1d2d3] hover:bg-[#3a2535]'
                    : 'bg-[#5ba4f5] text-white hover:bg-[#4a94e5]'
                }`}
              >
                {notificationsEnabled ? 'Enable Notifications' : 'Disable Notifications'}
              </button>
              <button className="px-3 py-1.5 bg-[#302234] text-[#d1d2d3] rounded text-[13px] font-medium hover:bg-[#3a2535] transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Huddle
              </button>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#302234] rounded transition-colors"
          >
            <svg className="w-5 h-5 text-[#d1d2d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="absolute top-[60px] left-0 right-0 h-[50px] bg-[#1a1d21] border-b border-[#3b2d3e] flex items-center gap-6 px-6 z-10">
          {(['about', 'members', 'tabs', 'integrations', 'settings'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-1 text-[15px] font-medium transition-colors border-b-2 ${
                activeTab === tab
                  ? 'text-[#d1d2d3] border-[#d1d2d3]'
                  : 'text-[#868686] border-transparent hover:text-[#d1d2d3]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'members' && channel.collaborators && (
                <span className="ml-1">({channel.collaborators.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pt-[110px] p-6">
          {activeTab === 'about' && renderAboutTab()}
          {activeTab === 'members' && renderMembersTab()}
          {activeTab === 'tabs' && renderTabsTab()}
          {activeTab === 'integrations' && renderIntegrationsTab()}
          {activeTab === 'settings' && renderSettingsTab()}
        </div>
      </div>
    </div>
  );
};

export default ChannelSettingsModal;

