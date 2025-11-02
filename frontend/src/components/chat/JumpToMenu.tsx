import React, { useState, useRef, useEffect } from 'react';
import DatePickerModal from './DatePickerModal';

interface JumpToMenuProps {
  onJumpToDate: (option: 'today' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'beginning' | 'custom', date?: Date) => void;
}

const JumpToMenu: React.FC<JumpToMenuProps> = ({ onJumpToDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowDatePicker(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (option: 'today' | 'yesterday' | 'lastWeek' | 'lastMonth' | 'beginning') => {
    onJumpToDate(option);
    setIsOpen(false);
  };

  const handleCustomDateClick = () => {
    setIsOpen(false);
    setShowDatePicker(true);
  };

  const handleDateSelect = (date: Date) => {
    onJumpToDate('custom', date);
    setShowDatePicker(false);
  };

  const handleCloseDatePicker = () => {
    setShowDatePicker(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Today Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[rgb(49,48,44)] transition-colors"
      >
        <span className="text-[13px] font-semibold text-[rgb(209,210,211)]">Today</span>
        <svg className="w-3 h-3 text-[rgb(209,210,211)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-[300px] bg-[rgb(34,37,41)] rounded shadow-lg border border-[rgb(82,82,82)] z-50">
          {/* Menu Header */}
          <div className="px-6 py-1 text-[13px] text-[rgba(232,232,232,0.7)]">
            Jump to…
          </div>

          {/* Menu Items */}
          <div role="menu">
            <button
              onClick={() => handleOptionClick('today')}
              className="w-full px-6 py-1 text-left text-[15px] text-[rgb(248,248,248)] hover:bg-[rgba(29,155,209,1)] transition-colors flex items-center min-h-[28px]"
              role="menuitem"
            >
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">Today</div>
            </button>

            <button
              onClick={() => handleOptionClick('yesterday')}
              className="w-full px-6 py-1 text-left text-[15px] text-[rgb(248,248,248)] hover:bg-[rgba(29,155,209,1)] transition-colors flex items-center min-h-[28px]"
              role="menuitem"
            >
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">Yesterday</div>
            </button>

            <button
              onClick={() => handleOptionClick('lastWeek')}
              className="w-full px-6 py-1 text-left text-[15px] text-[rgb(248,248,248)] hover:bg-[rgba(29,155,209,1)] transition-colors flex items-center min-h-[28px]"
              role="menuitem"
            >
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">Last week</div>
            </button>

            <button
              onClick={() => handleOptionClick('lastMonth')}
              className="w-full px-6 py-1 text-left text-[15px] text-[rgb(248,248,248)] hover:bg-[rgba(29,155,209,1)] transition-colors flex items-center min-h-[28px]"
              role="menuitem"
            >
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">Last month</div>
            </button>

            <button
              onClick={() => handleOptionClick('beginning')}
              className="w-full px-6 py-1 text-left text-[15px] text-[rgb(248,248,248)] hover:bg-[rgba(29,155,209,1)] transition-colors flex items-center min-h-[28px]"
              role="menuitem"
            >
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">The very beginning</div>
            </button>

            {/* Separator */}
            <div className="py-2">
              <hr className="border-t border-[rgba(232,232,232,0.13)]" />
            </div>

            {/* Custom Date Picker */}
            <button
              onClick={handleCustomDateClick}
              className="w-full px-6 py-1 text-left text-[15px] text-[rgb(248,248,248)] hover:bg-[rgba(29,155,209,1)] transition-colors flex items-center min-h-[28px]"
              role="menuitem"
            >
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">Jump to a specific date</div>
            </button>
          </div>
        </div>
      )}

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={handleCloseDatePicker}
        onDateSelect={handleDateSelect}
      />
    </div>
  );
};

export default JumpToMenu;
