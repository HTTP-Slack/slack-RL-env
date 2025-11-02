import React, { useRef, useEffect } from 'react';

interface MoreOptionsMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  onChangeToPrivate?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

const MoreOptionsMenu: React.FC<MoreOptionsMenuProps> = ({
  position,
  onClose,
  onChangeToPrivate,
  onArchive,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    if (menuRef.current) {
      const menuWidth = 260;
      const viewportWidth = window.innerWidth;

      let newX = position.x;
      if (newX + menuWidth > viewportWidth) {
        newX = viewportWidth - menuWidth - 10;
      }

      if (menuRef.current) {
        menuRef.current.style.left = `${newX}px`;
        menuRef.current.style.top = `${position.y}px`;
      }
    }
  }, [position]);

  return (
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
          onChangeToPrivate?.();
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-[15px] text-[#d1d2d3] hover:bg-[#302234] transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Change to a private channel
      </button>

      <button
        onClick={() => {
          onArchive?.();
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-[15px] text-[#ec5e6f] hover:bg-[#302234] transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
        Archive channel for everyone
      </button>

      <button
        onClick={() => {
          onDelete?.();
          onClose();
        }}
        className="w-full px-4 py-2 text-left text-[15px] text-[#ec5e6f] hover:bg-[#302234] transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete this channel
      </button>
    </div>
  );
};

export default MoreOptionsMenu;

