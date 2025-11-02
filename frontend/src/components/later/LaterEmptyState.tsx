import React from 'react';
import type { LaterItemStatus } from '../../types/later';

interface LaterEmptyStateProps {
  status: LaterItemStatus;
  onCreateReminder?: () => void;
}

const LaterEmptyState: React.FC<LaterEmptyStateProps> = ({ status, onCreateReminder }) => {
  if (status === 'in-progress') {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8">
        <div className="mb-4">
          <svg
            className="w-12 h-12 text-[#868686]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-white text-lg mb-1">Nothing here</h3>
        <p className="text-[#868686] text-sm mb-6">
          Enjoy a little moment to yourself.
        </p>
        {onCreateReminder && (
          <button
            onClick={onCreateReminder}
            className="px-4 py-2 bg-white text-[#1a1d21] font-medium rounded text-[15px] hover:bg-[#e8e8e8] transition-colors"
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
