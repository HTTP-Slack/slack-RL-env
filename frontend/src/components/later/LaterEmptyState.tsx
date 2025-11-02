import React from 'react';
import type { LaterItemStatus } from '../../types/later';

interface LaterEmptyStateProps {
  status: LaterItemStatus;
  onCreateReminder?: () => void;
}

const LaterEmptyState: React.FC<LaterEmptyStateProps> = ({ status, onCreateReminder }) => {
  if (status === 'in-progress') {
    return (
      <div className="flex flex-col items-center justify-center py-28 px-8">
        <div className="text-4xl mb-3">✓</div>
        <h3 className="text-white text-[20px] font-semibold mb-1.5">All done</h3>
        <p className="text-[#a591b0] text-[14px] mb-7">
          Look at you go.
        </p>
        {onCreateReminder && (
          <button
            type='button'
            onClick={onCreateReminder}
            className="px-4 py-2 bg-transparent border border-[#595959] text-white font-normal rounded text-[13px] hover:bg-[#3b2d3e] transition-colors"
          >
            Create Reminder
          </button>
        )}
      </div>
    );
  }

  if (status === 'archived') {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8">
        <div className="mb-6">
          <svg
            className="w-24 h-24"
            viewBox="0 0 120 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Box illustration */}
            <path
              d="M30 30 L90 30 L90 80 L30 80 Z"
              fill="#7d3986"
              opacity="0.3"
            />
            <path
              d="M30 30 L60 15 L120 15 L90 30 Z"
              fill="#9b59a6"
              opacity="0.4"
            />
            <path
              d="M90 30 L120 15 L120 65 L90 80 Z"
              fill="#6f4d72"
              opacity="0.3"
            />
          </svg>
        </div>
        <h3 className="text-white text-xl font-semibold mb-2">
          Out of sight, but not out of mind
        </h3>
        <p className="text-[#868686] text-[15px] text-center max-w-md">
          No more wasting time searching for messages. Archive messages you come back to often.
        </p>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8">
        <div className="text-6xl mb-4">🙌</div>
        <h3 className="text-white text-xl font-semibold mb-2">
          Feels good to check things off your to-do list
        </h3>
        <p className="text-[#868686] text-[15px] text-center max-w-md mb-1">
          See all the things you've completed in one place.
        </p>
        <p className="text-[#868686] text-[15px] text-center max-w-md">
          Sometimes you need a reminder of how awesome you are.
        </p>
      </div>
    );
  }

  return null;
};

export default LaterEmptyState;
