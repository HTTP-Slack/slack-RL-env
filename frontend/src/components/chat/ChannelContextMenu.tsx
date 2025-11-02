import React, { useState, useRef, useEffect } from 'react';
import type { IChannel } from '../../types/channel';

interface ChannelContextMenuProps {
  channel: IChannel;
  position: { x: number; y: number };
  onClose: () => void;
  onOpenChannelDetails?: () => void;
  onSummarizeChannel?: () => void;
  onEditNotifications?: () => void;
  onStarChannel?: () => void;
  onMoveChannel?: () => void;
  onAddTemplate?: () => void;
  onAddWorkflow?: () => void;
  onEditSettings?: () => void;
  onCopy?: (type: 'name' | 'link' | 'huddleLink') => void;
  onSearchInChannel?: () => void;
  onLeaveChannel?: () => void;
  currentNotificationSetting?: string;
}

const ChannelContextMenu: React.FC<ChannelContextMenuProps> = ({
  channel,
  position,
  onClose,
  onOpenChannelDetails,
  onSummarizeChannel,
  onEditNotifications,
  onStarChannel,
  onMoveChannel,
  onAddTemplate,
  onAddWorkflow,
  onEditSettings,
  onCopy,
  onSearchInChannel,
  onLeaveChannel,
  currentNotificationSetting = 'All new posts',
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showNotificationsSubmenu, setShowNotificationsSubmenu] = useState(false);
  const [showCopySubmenu, setShowCopySubmenu] = useState(false);
  const notificationsSubmenuRef = useRef<HTMLDivElement>(null);
  const copySubmenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        // Check if click is in submenu
        if (
          notificationsSubmenuRef.current?.contains(event.target as Node) ||
          copySubmenuRef.current?.contains(event.target as Node)
        ) {
          return;
        }
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Adjust position to prevent overflow
  useEffect(() => {
    if (menuRef.current) {
      const menuWidth = 260;
      const menuHeight = menuRef.current.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y;

      // Check if menu overflows right edge
      if (newX + menuWidth > viewportWidth) {
        newX = viewportWidth - menuWidth - 10;
      }

      // Check if menu overflows bottom edge
      if (newY + menuHeight > viewportHeight) {
        newY = viewportHeight - menuHeight - 10;
      }

      if (menuRef.current) {
        menuRef.current.style.left = `${newX}px`;
        menuRef.current.style.top = `${newY}px`;
      }
    }
  }, [position]);

  const handleNotificationsMouseEnter = () => {
    if (notificationsSubmenuRef.current && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const submenuX = menuRect.right - 10;
      const submenuY = menuRect.top;
      
      if (notificationsSubmenuRef.current) {
        notificationsSubmenuRef.current.style.left = `${submenuX}px`;
        notificationsSubmenuRef.current.style.top = `${submenuY}px`;
      }
    }
    setShowNotificationsSubmenu(true);
  };

  const handleCopyMouseEnter = () => {
    if (copySubmenuRef.current && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const submenuX = menuRect.right - 10;
      const submenuY = menuRect.top;
      
      if (copySubmenuRef.current) {
        copySubmenuRef.current.style.left = `${submenuX}px`;
        copySubmenuRef.current.style.top = `${submenuY}px`;
      }
    }
    setShowCopySubmenu(true);
  };

  const handleCopyName = () => {
    navigator.clipboard.writeText(channel.name);
    onCopy?.('name');
    onClose();
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/dashboard?channel=${channel._id}`;
    navigator.clipboard.writeText(link);
    onCopy?.('link');
    onClose();
  };

  const handleCopyHuddleLink = () => {
    // Placeholder for huddle link
    navigator.clipboard.writeText(`huddle://${channel._id}`);
    onCopy?.('huddleLink');
    onClose();
  };

  return (
    <>
      <div
        ref={menuRef}
        className="fixed z-[100] bg-[#211125] rounded shadow-lg border border-[#3b2d3e] py-1 min-w-[260px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <button
          onClick={() => {
            onOpenChannelDetails?.();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors"
        >
          Open channel details
        </button>

        <button
          onClick={() => {
            onSummarizeChannel?.();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors flex items-center justify-between"
        >
          <span>Summarize channel</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="border-t border-[#3b2d3e] my-1" />

        <div
          onMouseEnter={handleNotificationsMouseEnter}
          onMouseLeave={() => setShowNotificationsSubmenu(false)}
          className="relative"
        >
          <button
            onClick={() => {
              onEditNotifications?.();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span>Edit notifications</span>
              <span className="text-[13px] text-[#868686]">{currentNotificationSetting}</span>
            </div>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <button
          onClick={() => {
            onStarChannel?.();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors"
        >
          Star channel
        </button>

        <button
          onClick={() => {
            onMoveChannel?.();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors"
        >
          Move channel
        </button>

        <div className="border-t border-[#3b2d3e] my-1" />

        <button
          onClick={() => {
            onAddTemplate?.();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors"
        >
          Add template to channel
        </button>

        <button
          onClick={() => {
            onAddWorkflow?.();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors"
        >
          Add a workflow
        </button>

        <button
          onClick={() => {
            onEditSettings?.();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors"
        >
          Edit settings
        </button>

        <div className="border-t border-[#3b2d3e] my-1" />

        <div
          onMouseEnter={handleCopyMouseEnter}
          onMouseLeave={() => setShowCopySubmenu(false)}
          className="relative"
        >
          <button
            className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors flex items-center justify-between"
          >
            <span>Copy</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <button
          onClick={() => {
            onSearchInChannel?.();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors"
        >
          Search in channel
        </button>

        <div className="border-t border-[#3b2d3e] my-1" />

        <button
          onClick={() => {
            onLeaveChannel?.();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-[15px] text-[#ec5e6f] hover:bg-[#302234] transition-colors"
        >
          Leave channel
        </button>
      </div>

      {/* Notifications Submenu */}
      {showNotificationsSubmenu && (
        <div
          ref={notificationsSubmenuRef}
          className="fixed z-[101] bg-[#211125] rounded shadow-lg border border-[#3b2d3e] py-1 min-w-[280px]"
        >
          <div className="px-4 py-2 text-[13px] font-semibold text-[#868686]">
            Get notifications for...
          </div>
          <button
            onClick={() => {
              onEditNotifications?.();
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-[15px] text-[#5ba4f5] hover:bg-[#302234] transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            All new posts
          </button>
          <button
            className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors"
          >
            Messages and threads you follow
          </button>
          <button
            className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors"
          >
            <div className="flex flex-col">
              <span>Just mentions</span>
              <span className="text-[13px] text-[#868686]">@you, @channel, @here</span>
            </div>
          </button>
          <button
            className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors"
          >
            <div className="flex flex-col">
              <span>Nothing</span>
              <span className="text-[13px] text-[#868686]">Don't get push notifications for this channel</span>
            </div>
          </button>
          <div className="border-t border-[#3b2d3e] my-1" />
          <button
            className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors"
          >
            <div className="flex flex-col">
              <span>Mute channel</span>
              <span className="text-[13px] text-[#868686]">Only get notified if someone @mentions you personally</span>
            </div>
          </button>
          <div className="border-t border-[#3b2d3e] my-1" />
          <div className="px-4 py-2 text-[13px] font-semibold text-[#868686]">
            Advanced options
          </div>
          <button
            className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors"
          >
            Edit default preferences
          </button>
        </div>
      )}

      {/* Copy Submenu */}
      {showCopySubmenu && (
        <div
          ref={copySubmenuRef}
          className="fixed z-[101] bg-[#211125] rounded shadow-lg border border-[#3b2d3e] py-1 min-w-[200px]"
        >
          <button
            onClick={handleCopyName}
            className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors"
          >
            Copy name
          </button>
          <button
            onClick={handleCopyLink}
            className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors"
          >
            Copy link
          </button>
          <button
            onClick={handleCopyHuddleLink}
            className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors"
          >
            Copy huddle link
          </button>
        </div>
      )}
    </>
  );
};

export default ChannelContextMenu;

