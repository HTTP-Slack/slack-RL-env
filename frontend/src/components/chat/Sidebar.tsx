import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  pointerWithin,
  useDroppable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { User, Conversation } from '../../services/messageApi';
import { useWorkspace } from '../../context/WorkspaceContext';
import { updateChannelOrder, updateSectionOrder } from '../../services/sectionApi';
import type { ISection } from '../../types/section.js';
import type { IChannel } from '../../types/channel.js';
import { CreateSectionModal } from './CreateSectionModal';
import { CreateChannelModal } from './CreateChannelModal';
import SidebarNavLink from './SidebarNavLink';
import StarredSection from './StarredSection';

interface SidebarProps {
  currentUser: User | null;
  workspaceName?: string;
  conversations: Conversation[];
  users: User[];
  activeConversation: Conversation | null;
  activeChannel?: IChannel | null;
  onConversationSelect: (conversation: Conversation) => void;
  onUserSelect: (userId: string) => void;
  onChannelSelect: (channelId: string) => void;
  onChannelMenuClick?: (channel: IChannel, position: { x: number; y: number }) => void;
}

interface SortableChannelProps {
  channel: IChannel;
  isActive?: boolean;
  onChannelSelect: (channelId: string) => void;
  onChannelMenuClick?: (channel: IChannel, position: { x: number; y: number }) => void;
}

const SortableChannel: React.FC<SortableChannelProps> = ({ channel, isActive, onChannelSelect, onChannelMenuClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: channel._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChannelMenuClick) {
      const rect = e.currentTarget.getBoundingClientRect();
      onChannelMenuClick(channel, {
        x: rect.right + 4,
        y: rect.top,
      });
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/channel">
      <button
        onClick={() => onChannelSelect(channel._id)}
        className={`w-full px-2 py-1 rounded flex items-center hover:bg-[#302234] transition-colors ${
          isActive ? 'bg-[#7d3986]' : ''
        }`}
      >
        <span className="text-[#d1d2d3] mr-2">#</span>
        <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">
          {channel.name}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover/channel:opacity-100 transition-opacity">
          <button
            onClick={handleMenuClick}
            className="p-1 hover:bg-[#4a3a4d] rounded transition-colors"
            title="Channel options"
          >
            <svg className="w-3 h-3 text-[#d1d2d3]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5m0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5m-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0" />
            </svg>
          </button>
          <div
            {...attributes}
            {...listeners}
            className="p-1 cursor-grab active:cursor-grabbing hover:bg-[#4a3a4d] rounded"
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder"
          >
            <svg className="w-3 h-3 text-[#d1d2d3]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm4-16h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
};

interface SortableSectionProps {
  section: ISection;
  activeChannelId?: string;
  onChannelSelect: (channelId: string) => void;
  onChannelMenuClick?: (channel: IChannel, position: { x: number; y: number }) => void;
}

const SortableSection: React.FC<SortableSectionProps> = ({ section, activeChannelId, onChannelSelect, onChannelMenuClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section._id });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `section-droppable-${section._id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div ref={setNodeRef} style={style} className="px-3 py-2">
      <div className="w-full flex items-center justify-between px-2 py-1 hover:bg-[#302234] rounded transition-colors group">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 flex-1"
        >
          <svg
            className={`w-3 h-3 text-[#d1d2d3] transition-transform ${
              isExpanded ? 'rotate-0' : '-rotate-90'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
          <span className="text-[15px] font-semibold text-[#d1d2d3]">
            {section.name}
          </span>
        </button>
        <div
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#4a3a4d] rounded"
          title="Drag to reorder"
        >
          <svg className="w-4 h-4 text-[#d1d2d3]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm4-16h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
          </svg>
        </div>
      </div>
      {isExpanded && (
        <div
          ref={setDroppableRef}
          className={`mt-1 rounded transition-all ${
            section.channels.length === 0 ? 'min-h-16' : 'min-h-10'
          } ${
            isOver ? 'bg-[#4a3a4d] bg-opacity-50 border-2 border-dashed border-[#d1d2d3]' : ''
          }`}
        >
          <SortableContext
            items={section.channels.map((c) => c._id)}
            strategy={verticalListSortingStrategy}
          >
            {section.channels.length === 0 ? (
              <div className={`px-2 py-3 text-[13px] text-center ${
                isOver ? 'text-[#d1d2d3]' : 'text-[#868686]'
              } italic`}>
                {isOver ? 'Drop channel here' : 'No channels yet'}
              </div>
            ) : (
              section.channels.map((channel) => (
                <SortableChannel
                  key={channel._id}
                  channel={channel}
                  isActive={activeChannelId === channel._id}
                  onChannelSelect={onChannelSelect}
                  onChannelMenuClick={onChannelMenuClick}
                />
              ))
            )}
          </SortableContext>
        </div>
      )}
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  workspaceName,
  conversations,
  users,
  activeConversation,
  activeChannel,
  onConversationSelect,
  onUserSelect,
  onChannelSelect,
  onChannelMenuClick,
}) => {
  const { sections, setSections, currentWorkspaceId } = useWorkspace();
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isChannelsDropdownOpen, setIsChannelsDropdownOpen] = useState(false);
  const [isDirectMessagesExpanded, setIsDirectMessagesExpanded] = useState(true);
  const [isStarredExpanded, setIsStarredExpanded] = useState(true);
  const channelsDropdownRef = useRef<HTMLDivElement>(null);
  const channelsButtonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  const sensors = useSensors(pointerSensor, keyboardSensor);

  // Calculate dropdown position and handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        channelsDropdownRef.current &&
        !channelsDropdownRef.current.contains(event.target as Node) &&
        channelsButtonRef.current &&
        !channelsButtonRef.current.contains(event.target as Node)
      ) {
        setIsChannelsDropdownOpen(false);
      }
    };

    if (isChannelsDropdownOpen && channelsButtonRef.current) {
      const buttonRect = channelsButtonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: buttonRect.top,
        left: buttonRect.right + 4, // 4px gap (ml-1 = 4px)
      });
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isChannelsDropdownOpen]);

  // Return null if currentUser is not available (after all hooks are called)
  if (!currentUser) {
    return null;
  }

  // Get all starred channels across all sections
  const starredChannels = useMemo(() => {
    const allChannels = sections.flatMap((section) => section.channels);
    return allChannels.filter((channel) =>
      channel.starred && channel.starred.includes(currentUser._id)
    );
  }, [sections, currentUser._id]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Could be used for additional visual feedback
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);

    if (!over || active.id === over.id) return;

    // Check if we're dragging a section
    const isSectionDrag = sections.some((s) => s._id === active.id);

    if (isSectionDrag) {
      const oldIndex = sections.findIndex((s) => s._id === active.id);
      const newIndex = sections.findIndex((s) => s._id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(sections, oldIndex, newIndex);
        setSections(newSections);
        await updateSectionOrder(newSections.map((s) => s._id));
      }
    } else {
      // It's a channel drag
      const activeSection = sections.find((s) =>
        s.channels.some((c) => c._id === active.id)
      );
      
      if (!activeSection) return;

      // Determine the target section
      let overSection = sections.find((s) =>
        s.channels.some((c) => c._id === over.id)
      );

      // Check if dropped over a section droppable zone (for empty sections)
      const overIdStr = String(over.id);
      if (!overSection && overIdStr.startsWith('section-droppable-')) {
        const sectionId = overIdStr.replace('section-droppable-', '');
        overSection = sections.find((s) => s._id === sectionId);
      }

      if (!overSection) return;

      if (activeSection._id === overSection._id) {
        // Moving within the same section
        const oldIndex = activeSection.channels.findIndex((c) => c._id === active.id);
        const newIndex = activeSection.channels.findIndex((c) => c._id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newChannels = arrayMove(activeSection.channels, oldIndex, newIndex);
          const newSections = sections.map((s) =>
            s._id === activeSection._id ? { ...s, channels: newChannels } : s
          );

          setSections(newSections);
          await updateChannelOrder(
            activeSection._id,
            activeSection._id,
            newChannels.map((c) => c._id),
            newChannels.map((c) => c._id)
          );
        }
      } else {
        // Moving to a different section
        const activeChannel = activeSection.channels.find((c) => c._id === active.id);
        if (!activeChannel) return;

        const sourceChannels = activeSection.channels.filter((c) => c._id !== active.id);
        
        // If dropping on an empty section or at the end
        const destChannels = [...overSection.channels];
        const overIndex = overSection.channels.findIndex((c) => c._id === over.id);
        
        if (overIndex !== -1) {
          // Insert at the specific position
          destChannels.splice(overIndex, 0, activeChannel);
        } else {
          // Add to the end (for empty sections)
          destChannels.push(activeChannel);
        }

        const newSections = sections.map((s) => {
          if (s._id === activeSection._id) {
            return { ...s, channels: sourceChannels };
          }
          if (s._id === overSection._id) {
            return { ...s, channels: destChannels };
          }
          return s;
        });

        setSections(newSections);
        await updateChannelOrder(
          activeSection._id,
          overSection._id,
          sourceChannels.map((c) => c._id),
          destChannels.map((c) => c._id)
        );
      }
    }
  };

  return (
    <div className="w-[350px] bg-linear-to-b from-[#211125] to-[#180d1b] flex flex-col border-r border-[#3b2d3e]">
      {/* Sidebar Header */}
      <div 
        className="h-[49px] min-h-[49px] px-[12px] pr-[8px] flex items-center justify-between shrink-0"
        role="toolbar"
        aria-orientation="horizontal"
        aria-label="Workspace actions"
      >
        {/* Workspace Name with Dropdown */}
        <div className="flex items-center flex-1 min-w-0 max-w-[calc(100%-80px)]">
          <button
            className="flex items-center gap-1 px-[8px] py-[3px] rounded-[6px] hover:bg-[rgba(255,255,255,0.1)] transition-colors cursor-pointer group"
            aria-label={`${workspaceName || 'Workspace'} Actions`}
            aria-haspopup="menu"
            type="button"
          >
            <span className="text-[18px] font-[900] leading-[24px] text-[rgb(248,248,248)] whitespace-nowrap overflow-hidden block max-w-[192px]">
              {workspaceName || 'Workspace'}
            </span>
            <svg
              data-r2k="true"
              aria-hidden="true"
              aria-label="caret-down"
              viewBox="0 0 20 20"
              className="w-[18px] h-[18px] text-[rgb(248,248,248)] shrink-0"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M5.72 7.47a.75.75 0 0 1 1.06 0L10 10.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L5.72 8.53a.75.75 0 0 1 0-1.06"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-0 ml-auto">
          {/* Settings Button */}
          <button
            className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border border-[rgba(239,225,245,0.22)] hover:bg-[rgba(255,255,255,0.1)] transition-all cursor-pointer"
            aria-label="Manage my sidebar"
            aria-haspopup="menu"
            type="button"
          >
            <svg
              data-r2k="true"
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="w-[16px] h-[16px] text-[rgba(227,206,235,0.8)]"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="m9.151 3.676.271-1.108a2.5 2.5 0 0 1 1.156 0l.271 1.108a2 2 0 0 0 3.022 1.252l.976-.592a2.5 2.5 0 0 1 .817.817l-.592.975a2 2 0 0 0 1.252 3.023l1.108.27c.09.38.09.777 0 1.157l-1.108.27a2 2 0 0 0-1.252 3.023l.592.975a2.5 2.5 0 0 1-.817.818l-.976-.592a2 2 0 0 0-3.022 1.251l-.271 1.109a2.5 2.5 0 0 1-1.156 0l-.27-1.108a2 2 0 0 0-3.023-1.252l-.975.592a2.5 2.5 0 0 1-.818-.818l.592-.975a2 2 0 0 0-1.252-3.022l-1.108-.271a2.5 2.5 0 0 1 0-1.156l1.108-.271a2 2 0 0 0 1.252-3.023l-.592-.975a2.5 2.5 0 0 1 .818-.817l.975.592A2 2 0 0 0 9.15 3.676m2.335-2.39a4 4 0 0 0-2.972 0 .75.75 0 0 0-.45.518l-.372 1.523-.004.018a.5.5 0 0 1-.758.314l-.016-.01-1.34-.813a.75.75 0 0 0-.685-.048 4 4 0 0 0-2.1 2.1.75.75 0 0 0 .047.685l.814 1.34.01.016a.5.5 0 0 1-.314.759l-.018.004-1.523.372a.75.75 0 0 0-.519.45 4 4 0 0 0 0 2.971.75.75 0 0 0 .519.45l1.523.373.018.004a.5.5 0 0 1 .314.758l-.01.016-.814 1.34a.75.75 0 0 0-.048.685 4 4 0 0 0 2.101 2.1.75.75 0 0 0 .685-.048l1.34-.813.016-.01a.5.5 0 0 1 .758.314l.004.018.372 1.523a.75.75 0 0 0 .45.518 4 4 0 0 0 2.972 0 .75.75 0 0 0 .45-.518l.372-1.523.004-.018a.5.5 0 0 1 .758-.314l.016.01 1.34.813a.75.75 0 0 0 .685.049 4 4 0 0 0 2.101-2.101.75.75 0 0 0-.048-.685l-.814-1.34-.01-.016a.5.5 0 0 1 .314-.758l.018-.004 1.523-.373a.75.75 0 0 0 .519-.45 4 4 0 0 0 0-2.97.75.75 0 0 0-.519-.45l-1.523-.373-.018-.004a.5.5 0 0 1-.314-.759l.01-.015.814-1.34a.75.75 0 0 0 .048-.685 4 4 0 0 0-2.101-2.101.75.75 0 0 0-.685.048l-1.34.814-.016.01a.5.5 0 0 1-.758-.315l-.004-.017-.372-1.524a.75.75 0 0 0-.45-.518M8 10a2 2 0 1 1 4 0 2 2 0 0 1-4 0m2-3.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Compose/New Message Button */}
          <button
            className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border border-[rgba(239,225,245,0.22)] hover:bg-[rgba(255,255,255,0.1)] transition-all cursor-pointer ml-[4px]"
            aria-label="New message"
            type="button"
          >
            <svg
              data-r2k="true"
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="w-[16px] h-[16px] text-[rgba(227,206,235,0.8)]"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M16.707 3.268a1 1 0 0 0-1.414 0l-.482.482 1.439 1.44.482-.483a1 1 0 0 0 0-1.414zM15.19 6.25l-1.44-1.44-5.068 5.069-.431 1.872 1.87-.432zm-.957-4.043a2.5 2.5 0 0 1 3.536 0l.025.025a2.5 2.5 0 0 1 0 3.536l-6.763 6.763a.75.75 0 0 1-.361.2l-3.25.75a.75.75 0 0 1-.9-.9l.75-3.25a.75.75 0 0 1 .2-.361zM5.25 4A2.25 2.25 0 0 0 3 6.25v8.5A2.25 2.25 0 0 0 5.25 17h8.5A2.25 2.25 0 0 0 16 14.75v-4.5a.75.75 0 0 1 1.5 0v4.5a3.75 3.75 0 0 1-3.75 3.75h-8.5a3.75 3.75 0 0 1-3.75-3.75v-8.5A3.75 3.75 0 0 1 5.25 2.5h4.5a.75.75 0 0 1 0 1.5z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="px-3 py-2 border-b border-[rgba(227,206,235,0.1)] space-y-1">
        <SidebarNavLink
          icon={
            <svg
              data-r2k="true"
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="w-[20px] h-[20px]"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M10 3a7 7 0 1 0 3.394 13.124.75.75 0 0 1 .542-.074l2.794.68-.68-2.794a.75.75 0 0 1 .073-.542A7 7 0 0 0 10 3m-8.5 7a8.5 8.5 0 1 1 16.075 3.859l.904 3.714a.75.75 0 0 1-.906.906l-3.714-.904A8.5 8.5 0 0 1 1.5 10M6 8.25a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 8.25M6.75 11a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5z"
                clipRule="evenodd"
              />
            </svg>
          }
          label="Threads"
          isActive={true}
        />
        <SidebarNavLink
          icon={
            <svg
              data-r2k="true"
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="w-[20px] h-[20px]"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M10 2a8 8 0 0 0-8 8c0 1.957.719 3.75 1.91 5.142a.75.75 0 0 1-.107 1.051l-.682.568a.75.75 0 0 1-1.047-.096l-.682-.682a.75.75 0 0 1-.096-1.047l.568-.682A9.5 9.5 0 0 1 .5 10a9.5 9.5 0 0 1 19 0 9.5 9.5 0 0 1-1.364 4.856l.568.682a.75.75 0 0 1-.096 1.047l-.682.682a.75.75 0 0 1-1.047.096l-.682-.568a.75.75 0 0 1-.107-1.051A8 8 0 0 0 10 2M4.5 10a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0"
                clipRule="evenodd"
              />
            </svg>
          }
          label="Huddles"
          isActive={false}
        />
        <SidebarNavLink
          icon={
            <svg
              data-r2k="true"
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="w-[20px] h-[20px]"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M1.856 1.612a.75.75 0 0 1 .73-.033l15.5 7.75a.75.75 0 0 1 0 1.342l-15.5 7.75A.75.75 0 0 1 1.5 17.75v-6.046c0-.68.302-1.29.78-1.704a2.25 2.25 0 0 1-.78-1.704V2.25a.75.75 0 0 1 .356-.638M3 3.464v4.832a.75.75 0 0 0 .727.75l6.546.204a.75.75 0 0 1 0 1.5l-6.546.204a.75.75 0 0 0-.727.75v4.833L16.073 10z"
                clipRule="evenodd"
              />
            </svg>
          }
          label="Drafts & sent"
          isActive={false}
          badge={1}
        />
        <SidebarNavLink
          icon={
            <svg
              data-r2k="true"
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="w-[20px] h-[20px]"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M4.75 1.5A1.75 1.75 0 0 0 3 3.25v.5a.75.75 0 0 0 1.5 0v-.5A.25.25 0 0 1 4.75 3h10c.69 0 1.25.56 1.25 1.25v11.5c0 .69-.56 1.25-1.25 1.25h-10a.25.25 0 0 1-.25-.25v-.5a.75.75 0 0 0-1.5 0v.5c0 .966.784 1.75 1.75 1.75h10a2.75 2.75 0 0 0 2.75-2.75V4.25a2.75 2.75 0 0 0-2.75-2.75zM2.25 6a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5zm-.75 4a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 0 1.5h-2A.75.75 0 0 1 1.5 10m.75 2.5a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5zm5.79.472.02.01q.037.016.09.018h4.7a.23.23 0 0 0 .11-.028 2.1 2.1 0 0 0-.736-.991c-.372-.271-.92-.481-1.724-.481-.805 0-1.353.21-1.724.481a2.1 2.1 0 0 0-.736.991m4.12-2.702q.117-.13.218-.268C12.784 9.437 13 8.712 13 8c0-1.624-1.287-2.5-2.5-2.5S8 6.376 8 8c0 .712.217 1.437.622 2.002q.1.139.219.268-.53.191-.949.5a3.6 3.6 0 0 0-1.285 1.755 1.42 1.42 0 0 0 .294 1.431 1.68 1.68 0 0 0 1.249.544h4.7a1.68 1.68 0 0 0 1.249-.544 1.42 1.42 0 0 0 .293-1.431 3.6 3.6 0 0 0-2.233-2.255M9.5 8c0-.65.463-1 1-1s1 .35 1 1c0 .426-.133.838-.34 1.127-.203.282-.434.398-.66.398s-.457-.116-.66-.398A2 2 0 0 1 9.5 8"
                clipRule="evenodd"
              />
            </svg>
          }
          label="Directories"
          isActive={false}
        />
      </div>

      {/* Starred Section */}
      <StarredSection
        isExpanded={isStarredExpanded}
        onToggle={() => setIsStarredExpanded(!isStarredExpanded)}
        starredChannels={starredChannels}
        onChannelSelect={onChannelSelect}
        onChannelMenuClick={onChannelMenuClick}
      />

      {/* Spacing before Channels */}
      <div className="h-4" />

      {/* Channels and Direct Messages */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Channels Header with Dropdown */}
          <div className="px-3 py-2">
            <div className="relative">
              <button
                ref={channelsButtonRef}
                onClick={() => setIsChannelsDropdownOpen(!isChannelsDropdownOpen)}
                className={`w-full flex items-center justify-between px-2 py-1 hover:bg-[#302234] rounded transition-colors group ${
                  isChannelsDropdownOpen ? 'bg-[#302234]' : ''
                }`}
              >
                <div className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3 text-[#d1d2d3]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                  <span className="text-[15px] font-semibold text-[#d1d2d3]">
                    Channels
                  </span>
                </div>
                <svg
                  className={`w-3 h-3 text-[#d1d2d3] transition-transform ${
                    isChannelsDropdownOpen ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Dropdown Menu - Fixed positioning to appear above all */}
          {isChannelsDropdownOpen && (
            <div
              ref={channelsDropdownRef}
              className="fixed w-[200px] bg-[#211125] rounded shadow-lg border border-[#3b2d3e] z-[100] overflow-hidden"
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
              }}
            >
              <button
                onClick={() => {
                  setIsCreateChannelOpen(true);
                  setIsChannelsDropdownOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors flex items-center"
              >
                <svg
                  className="w-4 h-4 text-[#d1d2d3] mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create channel
              </button>
              <button
                onClick={() => {
                  setIsCreateSectionOpen(true);
                  setIsChannelsDropdownOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors flex items-center"
              >
                <svg
                  className="w-4 h-4 text-[#d1d2d3] mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create section
              </button>
            </div>
          )}

          {/* Channels Section */}
          <SortableContext
            items={sections.map((s) => s._id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SortableSection
                key={section._id}
                section={section}
                activeChannelId={activeChannel?._id}
                onChannelSelect={onChannelSelect}
                onChannelMenuClick={onChannelMenuClick}
              />
            ))}
          </SortableContext>

          {/* Direct Messages Section */}
          <div className="px-3 py-2 mt-4">
            <button
              onClick={() => setIsDirectMessagesExpanded(!isDirectMessagesExpanded)}
              className="w-full flex items-center justify-between px-2 py-1 hover:bg-[#302234] rounded transition-colors group"
            >
              <div className="flex items-center gap-1">
                <svg
                  className={`w-3 h-3 text-[#d1d2d3] transition-transform ${
                    isDirectMessagesExpanded ? 'rotate-0' : '-rotate-90'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <span className="text-[15px] font-semibold text-[#d1d2d3]">
                  Direct messages
                </span>
              </div>
            </button>
            {isDirectMessagesExpanded && (
              <div
                role="tree"
                aria-label="Direct messages"
                className="mt-1"
              >
              {/* Existing conversations */}
              {conversations.map((conversation) => {
                // Safety check: ensure collaborators is an array of User objects
                if (
                  !conversation.collaborators ||
                  !Array.isArray(conversation.collaborators)
                ) {
                  console.warn(
                    '⚠️ Conversation missing collaborators array:',
                    conversation._id
                  );
                  return null;
                }

                const otherUser = conversation.collaborators.find((c) => {
                  // Handle both populated and unpopulated collaborators
                  const collabId = typeof c === 'string' ? c : c?._id;
                  return collabId !== currentUser._id;
                });

                if (!otherUser) {
                  console.warn(
                    '⚠️ Could not find other user in conversation:',
                    conversation._id
                  );
                  return null;
                }

                // If otherUser is just a string (ID), skip rendering or show placeholder
                if (typeof otherUser === 'string') {
                  console.warn(
                    '⚠️ Collaborator not populated in conversation:',
                    conversation._id,
                    'collabId:',
                    otherUser
                  );
                  return null; // Don't show unpopulated conversations
                }

                const isActive =
                  activeConversation?._id === conversation._id;

                return (
                  <button
                    key={conversation._id}
                    onClick={() => onConversationSelect(conversation)}
                    className={`w-full px-2 py-1.5 rounded flex items-center group hover:bg-[#302234] transition-colors ${
                      isActive ? 'bg-[#7d3986]' : ''
                    }`}
                  >
                    <div className="relative mr-2 shrink-0">
                      <div className="w-5 h-5 rounded bg-[#522653] flex items-center justify-center text-white text-[10px] font-semibold">
                        {otherUser.username?.charAt(0).toUpperCase() ||
                          'U'}
                      </div>
                    </div>
                    <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">
                      {otherUser.username || 'Unknown User'}
                    </span>
                  </button>
                );
              })}

              {/* Available users to start conversations with */}
              {(() => {
                // Create a Set of user IDs that are already in conversations for O(n) lookup
                const usersInConversations = new Set(
                  conversations.flatMap((c) =>
                    c.collaborators.map((collab) => collab._id)
                  )
                );

                return users
                  .filter((user) => !usersInConversations.has(user._id))
                  .map((user) => (
                    <button
                      key={user._id}
                      onClick={() => onUserSelect(user._id)}
                      className="w-full px-2 py-1.5 rounded flex items-center group hover:bg-[#302234] transition-colors"
                    >
                      <div className="relative mr-2 shrink-0">
                        <div className="w-5 h-5 rounded bg-[#522653] flex items-center justify-center text-white text-[10px] font-semibold">
                          {user.username?.charAt(0).toUpperCase() ||
                            'U'}
                        </div>
                      </div>
                      <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">
                        {user.username || 'Unknown User'}
                      </span>
                    </button>
                  ));
              })()}

              <button className="w-full px-2 py-1.5 rounded flex items-center group hover:bg-[#302234] transition-colors mt-1">
                <svg
                  className="w-4 h-4 text-[#d1d2d3] mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">
                  Invite people
                </span>
              </button>
              </div>
            )}
          </div>
        </div>
        <DragOverlay>
          {activeId ? (
            <div className="px-2 py-1.5 rounded bg-[#302234] shadow-lg opacity-90">
              <div className="flex items-center">
                <span className="text-[15px] text-[#d1d2d3]">
                  {(() => {
                    // Find the dragged channel
                    for (const section of sections) {
                      const channel = section.channels.find((c) => c._id === activeId);
                      if (channel) {
                        return `# ${channel.name}`;
                      }
                    }
                    // Find the dragged section
                    const section = sections.find((s) => s._id === activeId);
                    if (section) {
                      return section.name;
                    }
                    return '';
                  })()}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      {currentWorkspaceId && (
        <>
          <CreateSectionModal
            isOpen={isCreateSectionOpen}
            onClose={() => setIsCreateSectionOpen(false)}
            organisationId={currentWorkspaceId}
          />
          <CreateChannelModal
            isOpen={isCreateChannelOpen}
            onClose={() => setIsCreateChannelOpen(false)}
            organisationId={currentWorkspaceId}
          />
        </>
      )}
    </div>
  );
};

export default Sidebar;

