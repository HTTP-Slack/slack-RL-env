import React, { useState, useMemo } from 'react';
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

interface SidebarProps {
  currentUser: User | null;
  workspaceName?: string;
  conversations: Conversation[];
  users: User[];
  activeConversation: Conversation | null;
  onConversationSelect: (conversation: Conversation) => void;
  onUserSelect: (userId: string) => void;
  onChannelSelect: (channelId: string) => void;
}

interface SortableChannelProps {
  channel: IChannel;
  onChannelSelect: (channelId: string) => void;
}

const SortableChannel: React.FC<SortableChannelProps> = ({ channel, onChannelSelect }) => {
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

  return (
    <div ref={setNodeRef} style={style} className="relative group/channel">
      <button
        onClick={() => onChannelSelect(channel._id)}
        className="w-full px-2 py-1 rounded flex items-center hover:bg-[#302234] transition-colors"
      >
        <span className="text-[#d1d2d3] mr-2">#</span>
        <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">
          {channel.name}
        </span>
        <div
          {...attributes}
          {...listeners}
          className="p-1 cursor-grab active:cursor-grabbing opacity-0 group-hover/channel:opacity-100 transition-opacity hover:bg-[#4a3a4d] rounded"
          onClick={(e) => e.stopPropagation()}
          title="Drag to reorder"
        >
          <svg className="w-3 h-3 text-[#d1d2d3]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 3h2v2H9V3zm0 4h2v2H9V7zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm0 4h2v2H9v-2zm4-16h2v2h-2V3zm0 4h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z" />
          </svg>
        </div>
      </button>
    </div>
  );
};

interface SortableSectionProps {
  section: ISection;
  onChannelSelect: (channelId: string) => void;
}

const SortableSection: React.FC<SortableSectionProps> = ({ section, onChannelSelect }) => {
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
                  onChannelSelect={onChannelSelect}
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
  onConversationSelect,
  onUserSelect,
  onChannelSelect,
}) => {
  const { sections, setSections, currentWorkspaceId } = useWorkspace();
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  const sensors = useSensors(pointerSensor, keyboardSensor);

  // Return null if currentUser is not available (after all hooks are called)
  if (!currentUser) {
    return null;
  }

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
      <div className="h-[60px] px-4 flex items-center border-b border-[#3b2d3e] shrink-0">
        <div className="flex items-center flex-1 min-w-0">
          <span className="text-2xl font-bold text-white truncate">
            {workspaceName || 'Workspace'}
          </span>
        </div>
      </div>

      {/* Channels and Direct Messages */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-y-auto">
          {/* Channels Section */}
          <SortableContext
            items={sections.map((s) => s._id)}
            strategy={verticalListSortingStrategy}
          >
            {sections.map((section) => (
              <SortableSection
                key={section._id}
                section={section}
                onChannelSelect={onChannelSelect}
              />
            ))}
          </SortableContext>

          {/* Add Section/Channel Buttons */}
          <div className="px-3 py-2">
            <button
              onClick={() => setIsCreateSectionOpen(true)}
              className="w-full px-2 py-1.5 rounded flex items-center group hover:bg-[#302234] transition-colors"
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
              <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">
                Add section
              </span>
            </button>
            <button
              onClick={() => setIsCreateChannelOpen(true)}
              className="w-full px-2 py-1.5 rounded flex items-center group hover:bg-[#302234] transition-colors"
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
              <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">
                Add channels
              </span>
            </button>
          </div>

          {/* Direct Messages Section */}
          <div className="px-3 py-2 mt-4">
            <button className="w-full flex items-center justify-between px-2 py-1 hover:bg-[#302234] rounded transition-colors group">
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
                  Direct messages
                </span>
              </div>
            </button>
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

