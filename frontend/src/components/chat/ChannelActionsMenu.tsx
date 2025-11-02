import React, { useRef, useEffect } from 'react';
import type { IChannel } from '../../types/channel';

interface ChannelActionsMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  channel: IChannel;
  onOpenChannelDetails?: () => void;
  onSummarizeChannel?: () => void;
  onEditNotifications?: () => void;
  onStarChannel?: () => void;
  onMoveChannel?: () => void;
  onAddTemplate?: () => void;
  onAddWorkflow?: () => void;
  onEditSettings?: () => void;
  onCopy?: () => void;
  onSearchInChannel?: () => void;
  onLeaveChannel?: () => void;
}

const ChannelActionsMenu: React.FC<ChannelActionsMenuProps> = ({
  position,
  onClose,
  channel,
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
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (menuRef.current) {
      const menuWidth = 300;
      const menuHeight = 500;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y;

      // Adjust horizontal position if menu overflows
      if (newX + menuWidth > viewportWidth) {
        newX = viewportWidth - menuWidth - 10;
      }

      // Adjust vertical position if menu overflows
      if (newY + menuHeight > viewportHeight) {
        newY = viewportHeight - menuHeight - 10;
      }

      if (menuRef.current) {
        menuRef.current.style.left = `${newX}px`;
        menuRef.current.style.top = `${newY}px`;
      }
    }
  }, [position]);

  const MenuItem = ({
    onClick,
    children,
    hasArrow = false,
    subtitle = '',
    isDanger = false,
  }: {
    onClick?: () => void;
    children: React.ReactNode;
    hasArrow?: boolean;
    subtitle?: string;
    isDanger?: boolean;
  }) => (
    <button
      onClick={() => {
        onClick?.();
        onClose();
      }}
      className={`w-full px-4 py-2 text-left text-[15px] transition-colors flex items-center justify-between ${
        isDanger
          ? 'text-[#ec5e6f] hover:bg-[rgba(255,255,255,0.1)]'
          : 'text-[rgb(248,248,248)] hover:bg-[rgba(255,255,255,0.1)]'
      }`}
    >
      <div className="flex flex-col flex-1">
        <span className={subtitle ? 'font-medium' : ''}>{children}</span>
        {subtitle && (
          <span className="text-[13px] text-[rgba(248,248,248,0.7)] mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
      {hasArrow && (
        <svg
          className="w-4 h-4 ml-2 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.69 10 7.21 6.52a.75.75 0 1 1 1.06-1.06l4 4a.75.75 0 0 1 0 1.06l-4 4a.75.75 0 0 1-1.06 0"
          />
        </svg>
      )}
    </button>
  );

  const Divider = () => (
    <div className="my-1 border-t border-[rgba(248,248,248,0.13)]" />
  );

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] bg-[rgb(26,29,33)] rounded-lg shadow-2xl border border-[rgba(121,124,129,0.3)] py-2 min-w-[300px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <MenuItem onClick={onOpenChannelDetails}>
        Open channel details
      </MenuItem>

      <Divider />

      <MenuItem onClick={onSummarizeChannel} hasArrow>
        Summarize channel
      </MenuItem>

      <MenuItem
        onClick={onEditNotifications}
        hasArrow
        subtitle="All new posts"
      >
        Edit notifications
      </MenuItem>

      <MenuItem onClick={onStarChannel}>Star channel</MenuItem>

      <MenuItem onClick={onMoveChannel}>Move channel</MenuItem>

      <Divider />

      <MenuItem onClick={onAddTemplate}>Add template to channel</MenuItem>

      <MenuItem onClick={onAddWorkflow}>Add a workflow</MenuItem>

      <MenuItem onClick={onEditSettings}>Edit settings</MenuItem>

      <Divider />

      <MenuItem onClick={onCopy} hasArrow>
        Copy
      </MenuItem>

      <MenuItem onClick={onSearchInChannel}>Search in channel</MenuItem>

      <Divider />

      <MenuItem onClick={onLeaveChannel} isDanger>
        Leave channel
      </MenuItem>
    </div>
  );
};

export default ChannelActionsMenu;
