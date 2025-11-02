import React, { useEffect, useRef } from 'react';

interface MessageContextMenuProps {
  isCurrentUser: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onMarkUnread: () => void;
  onClose: () => void;
  position: { x: number; y: number };
}

const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  isCurrentUser,
  onEdit,
  onDelete,
  onMarkUnread,
  onClose,
  position,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = React.useState(position);
  const [showRemindSubmenu, setShowRemindSubmenu] = React.useState(false);
  const [remindSubmenuPosition, setRemindSubmenuPosition] = React.useState({ x: 0, y: 0 });

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

  // Adjust position to prevent overflow
  useEffect(() => {
    if (menuRef.current) {
      const menuWidth = 300; // menu width
      const menuHeight = menuRef.current.offsetHeight;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newX = position.x;
      let newY = position.y;

      // Check if menu overflows right edge
      if (newX + menuWidth > viewportWidth) {
        newX = viewportWidth - menuWidth - 10; // 10px padding from edge
      }

      // Check if menu overflows left edge
      if (newX < 10) {
        newX = 10;
      }

      // Check if menu overflows bottom edge
      if (newY + menuHeight > viewportHeight) {
        newY = viewportHeight - menuHeight - 10; // 10px padding from edge
      }

      // Check if menu overflows top edge
      if (newY < 10) {
        newY = 10;
      }

      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [position, menuRef.current?.offsetHeight]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-[300px] bg-[rgb(34,37,41)] rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_11px_rgba(0,0,0,0.1)] overflow-hidden"
      style={{
        top: `${adjustedPosition.y}px`,
        left: `${adjustedPosition.x}px`,
      }}
    >
      {/* Menu items */}
      <div className="py-2">
        {/* Forward message */}
        <button
          className="w-full px-6 py-2 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] flex items-center justify-between transition-colors"
        >
          <span>Forward message...</span>
          <span className="text-[rgb(171,171,173)] text-[13px]">F</span>
        </button>

        {/* Save for later */}
        <button
          className="w-full px-6 py-2 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] flex items-center justify-between transition-colors"
        >
          <span>Save for later</span>
          <span className="text-[rgb(171,171,173)] text-[13px]">A</span>
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-[rgb(60,56,54)] mx-2"></div>

      {/* Turn off notifications */}
      <div className="py-2">
        <button
          className="w-full px-6 py-2 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] transition-colors"
        >
          Turn off notifications for replies
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-[rgb(60,56,54)] mx-2"></div>

      {/* Mark unread section */}
      <div className="py-2">
        <button
          onClick={() => {
            onMarkUnread();
            onClose();
          }}
          className="w-full px-6 py-2 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] flex items-center justify-between transition-colors"
        >
          <span>Mark unread</span>
          <span className="text-[rgb(171,171,173)] text-[13px]">U</span>
        </button>

        {/* Summarize message - PRO */}
        <button
          className="w-full px-6 py-2 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] flex items-center justify-between transition-colors"
        >
          <span>Summarize message</span>
          <span className="px-2 py-0.5 text-[11px] font-bold text-white bg-[rgb(74,21,75)] rounded">PRO</span>
        </button>

        {/* Remind me about this */}
        <button
          onMouseEnter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setRemindSubmenuPosition({
              x: rect.left - 200 - 4, // Position to the left with 4px gap
              y: rect.top,
            });
            setShowRemindSubmenu(true);
          }}
          onMouseLeave={() => {
            // Don't immediately hide - let submenu handle it
            setTimeout(() => setShowRemindSubmenu(false), 100);
          }}
          className="w-full px-6 py-2 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] flex items-center justify-between transition-colors relative"
        >
          <span>Remind me about this</span>
          <svg className="w-4 h-4 text-[rgb(171,171,173)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-[rgb(60,56,54)] mx-2"></div>

      {/* Copy/Pin section */}
      <div className="py-2">
        <button
          className="w-full px-6 py-2 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] flex items-center justify-between transition-colors"
        >
          <span>Copy link</span>
          <span className="text-[rgb(171,171,173)] text-[13px]">L</span>
        </button>

        <button
          className="w-full px-6 py-2 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] flex items-center justify-between transition-colors"
        >
          <span>Pin to this conversation</span>
          <span className="text-[rgb(171,171,173)] text-[13px]">P</span>
        </button>

        <button
          className="w-full px-6 py-2 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] transition-colors"
        >
          Add to list...
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-[rgb(60,56,54)] mx-2"></div>

      {/* Start a huddle */}
      <div className="py-2">
        <button
          className="w-full px-6 py-2 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] transition-colors"
        >
          Start a huddle in thread...
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-[rgb(60,56,54)] mx-2"></div>

      {/* Edit/Delete section - only show for current user */}
      {isCurrentUser && (
        <>
          <div className="py-2">
            <button
              onClick={onEdit}
              className="w-full px-6 py-2 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] flex items-center justify-between transition-colors"
            >
              <span>Edit message</span>
              <span className="text-[rgb(171,171,173)] text-[13px]">E</span>
            </button>

            <button
              onClick={onDelete}
              className="w-full px-6 py-2 text-left text-[15px] text-[rgb(232,106,106)] hover:bg-[rgb(18,100,163)] hover:text-[rgb(232,106,106)] flex items-center justify-between transition-colors"
            >
              <span>Delete message...</span>
              <span className="text-[rgb(171,171,173)] text-[13px]">delete</span>
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-[rgb(60,56,54)] mx-2"></div>
        </>
      )}

      {/* Add a message shortcut */}
      <div className="py-2">
        <button
          className="w-full px-6 py-2 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] flex items-center justify-between transition-colors"
        >
          <span>Add a message shortcut...</span>
          <svg className="w-4 h-4 text-[rgb(171,171,173)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </button>
      </div>

      {/* Remind me submenu - appears to the left */}
      {showRemindSubmenu && (
        <div
          onMouseEnter={() => setShowRemindSubmenu(true)}
          onMouseLeave={() => setShowRemindSubmenu(false)}
          className="fixed z-50 w-[200px] bg-[rgb(34,37,41)] rounded-lg shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_4px_11px_rgba(0,0,0,0.1)] overflow-hidden py-3"
          style={{
            top: `${remindSubmenuPosition.y}px`,
            left: `${remindSubmenuPosition.x}px`,
          }}
        >
          <button className="w-full px-6 py-1 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] transition-colors">
            In 20 minutes
          </button>
          <button className="w-full px-6 py-1 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] transition-colors">
            In 1 hour
          </button>
          <button className="w-full px-6 py-1 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] transition-colors">
            In 3 hours
          </button>
          <button className="w-full px-6 py-1 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] transition-colors">
            Tomorrow
          </button>
          <button className="w-full px-6 py-1 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] transition-colors">
            Next week
          </button>
          <button className="w-full px-6 py-1 text-left text-[15px] text-white hover:bg-[rgb(18,100,163)] flex items-center justify-between transition-colors">
            <span>Custom…</span>
            <span className="text-[rgb(154,155,158)] text-[13px]">M</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageContextMenu;
