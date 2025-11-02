import React, { useState } from 'react';
import type { ILaterItem, LaterItemStatus } from '../../types/later';
import { updateLaterItemStatus, deleteLaterItem } from '../../services/laterApi';

interface LaterItemProps {
  item: ILaterItem;
  onUpdate: (updatedItem: ILaterItem) => void;
  onDelete: (itemId: string) => void;
  onEdit: (item: ILaterItem) => void;
}

const LaterItem: React.FC<LaterItemProps> = ({ item, onUpdate, onDelete, onEdit }) => {
  const [showActions, setShowActions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleMoveToStatus = async (newStatus: LaterItemStatus) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const updatedItem = await updateLaterItemStatus(item._id, newStatus);
      onUpdate(updatedItem);
      setShowActions(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Failed to update item status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    await handleMoveToStatus('completed');
  };

  const handleDelete = async () => {
    if (isLoading) return;
    if (!confirm('Are you sure you want to delete this item?')) return;

    setIsLoading(true);
    try {
      await deleteLaterItem(item._id);
      onDelete(item._id);
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 0) {
      return 'Overdue';
    } else if (diffMinutes < 60) {
      return `Due in ${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Due in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  // Parse description for rich text (simple bold support)
  const renderDescription = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div
      className="relative border-b border-[rgba(239,225,245,0.22)] py-3 px-3 hover:bg-[rgba(239,225,245,0.08)] cursor-pointer transition-colors group"
      style={{ fontFamily: 'Slack-Lato, sans-serif' }}
    >
      {/* Header - Due date and type */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center text-[13px]">
          <div className="flex items-center">
            {item.dueDate && (
              <button
                className="font-semibold rounded-full px-0 text-[#cfa1de] hover:text-[#d8b0e6]"
                style={{ fontWeight: 600 }}
              >
                {formatDueDate(item.dueDate)}
              </button>
            )}
            {item.dueDate && (
              <div className="mx-2 text-[rgba(227,206,235,0.8)]">•</div>
            )}
            <span className="text-[rgba(227,206,235,0.8)]">Reminder</span>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="flex gap-2">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div
            className="w-9 h-9 rounded-lg bg-[rgba(232,232,232,0.13)] flex items-center justify-center text-white font-bold overflow-hidden"
            style={{ borderRadius: 'clamp(6px, 22.222%, 12px)' }}
          >
            {/* Use first letter of user as avatar placeholder */}
            <span className="text-[15px]">
              {item.userId ? item.userId.charAt(0).toUpperCase() : 'U'}
            </span>
          </div>
        </div>

        {/* Message content */}
        <div className="flex-1 relative">
          {/* Action buttons - show on hover */}
          <div
            className="absolute -top-3 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="flex gap-1 p-1 bg-[#1a1d21] rounded-xl shadow-lg border border-[rgba(232,232,232,0.13)]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleComplete();
                }}
                className="p-2 text-[rgba(232,232,232,0.7)] hover:bg-[rgba(232,232,232,0.1)] rounded-lg transition-colors"
                title="Mark complete"
                disabled={isLoading}
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M17.234 3.677a.75.75 0 0 1 .089 1.057l-9.72 11.5a.75.75 0 0 1-1.19-.058L2.633 10.7a.75.75 0 0 1 1.234-.852l3.223 4.669 9.087-10.751a.75.75 0 0 1 1.057-.089" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="p-2 text-[rgba(232,232,232,0.7)] hover:bg-[rgba(232,232,232,0.1)] rounded-lg transition-colors"
                title="Edit reminder"
                disabled={isLoading}
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.5 10a7.5 7.5 0 1 1 15 0 7.5 7.5 0 0 1-15 0M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18m.75 4.75a.75.75 0 0 0-1.5 0v4.75c0 .414.336.75.75.75h3.75a.75.75 0 0 0 0-1.5h-3z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                className="p-2 text-[rgba(232,232,232,0.7)] hover:bg-[rgba(232,232,232,0.1)] rounded-lg transition-colors relative"
                title="More actions"
                disabled={isLoading}
              >
                <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5m0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5m-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0" clipRule="evenodd" />
                </svg>

                {/* Dropdown menu */}
                {showActions && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowActions(false);
                      }}
                    />
                    <div className="absolute right-0 top-10 z-20 bg-white rounded shadow-lg border border-gray-200 py-1 min-w-[180px]">
                      {item.status !== 'in-progress' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveToStatus('in-progress');
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 text-sm"
                        >
                          Move to In Progress
                        </button>
                      )}

                      {item.status !== 'archived' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveToStatus('archived');
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 text-sm"
                        >
                          Move to Archived
                        </button>
                      )}

                      {item.status !== 'completed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveToStatus('completed');
                          }}
                          className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 text-sm"
                        >
                          Mark as Completed
                        </button>
                      )}

                      <hr className="my-1 border-gray-200" />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* User name */}
          <div className="font-bold text-white text-[15px] mb-1">
            {item.userId || 'Unknown User'}
          </div>

          {/* Description with rich text */}
          <div className="text-white text-[15px] leading-[22px] whitespace-pre-wrap">
            {renderDescription(item.description)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaterItem;
