import React, { useState } from 'react';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({ isOpen, onClose, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!isOpen) return null;

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handlePreviousYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth()));
  };

  const handleNextYear = () => {
    setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth()));
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateSelect(selectedDate);
    onClose();
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();
  const isCurrentMonth = currentDate.getMonth() === today.getMonth() &&
                         currentDate.getFullYear() === today.getFullYear();

  // Generate calendar days
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[rgb(34,37,41)] rounded-lg shadow-xl w-[600px] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-[28px] font-bold">Jump to a specific date</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-[rgb(49,48,44)] p-2 rounded transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Month/Year Navigation */}
        <div className="flex items-center justify-center gap-8 mb-6">
          {/* Previous Year */}
          <button
            onClick={handlePreviousYear}
            className="text-[rgb(209,210,211)] hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Previous Month */}
          <button
            onClick={handlePreviousMonth}
            className="text-[rgb(209,210,211)] hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Current Month/Year */}
          <div className="text-white text-[24px] font-semibold min-w-[250px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>

          {/* Next Month */}
          <button
            onClick={handleNextMonth}
            className="text-[rgb(209,210,211)] hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Next Year */}
          <button
            onClick={handleNextYear}
            className="text-[rgb(209,210,211)] hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0">
          {/* Day names header */}
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-[rgb(209,210,211)] text-[15px] font-semibold py-3"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const isToday = isCurrentMonth && day === today.getDate();

            return (
              <div
                key={index}
                className={`
                  aspect-square flex items-center justify-center text-[18px]
                  ${day === null ? '' : 'cursor-pointer hover:bg-[rgb(49,48,44)]'}
                  ${isToday ? 'text-white' : 'text-[rgb(209,210,211)]'}
                  transition-colors border border-[rgb(49,48,44)]
                `}
                onClick={() => day !== null && handleDateClick(day)}
              >
                {day !== null && (
                  <div className={`
                    w-12 h-12 flex items-center justify-center rounded-full
                    ${isToday ? 'border-2 border-[rgb(29,155,209)]' : ''}
                  `}>
                    {day}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DatePickerModal;
