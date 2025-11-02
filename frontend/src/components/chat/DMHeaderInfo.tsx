import React from 'react';
import type { User } from '../../services/messageApi';

interface DMHeaderInfoProps {
  user: User;
  onViewProfile: () => void;
}

const DMHeaderInfo: React.FC<DMHeaderInfoProps> = ({ user, onViewProfile }) => {
  const avatarUrl = user.profilePicture;
  const avatarInitial = user.username?.charAt(0).toUpperCase() || 'U';
  const username = user.username || 'Unknown User';

  return (
    <div className="px-5 pt-5 pb-4 border-b border-[rgba(121,124,129,0.3)]">
      {/* User Avatar */}
      <div className="mb-4">
        <div
          className="w-16 h-16 rounded-lg bg-[rgb(97,31,105)] flex items-center justify-center text-white text-2xl font-bold overflow-hidden"
          style={{
            borderRadius: 'clamp(6px, min(22.222%, 12px), 12px)',
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{avatarInitial}</span>
          )}
        </div>
      </div>

      {/* User Name */}
      <h1 className="text-[28px] font-bold text-white mb-3 flex items-center gap-2">
        {username}
        <button
          onClick={onViewProfile}
          className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-[rgb(49,48,44)] transition-colors"
          aria-label="View profile"
        >
          <svg
            viewBox="0 0 20 20"
            className="w-4 h-4"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.25 5.5a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM8 1.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM2.78 13.22a.75.75 0 0 0-1.06 1.06l6.5 6.5a.75.75 0 0 0 1.06 0l6.5-6.5a.75.75 0 1 0-1.06-1.06L8 18.94l-5.22-5.22Z"
              fill="rgba(232,232,232,0.7)"
            />
          </svg>
        </button>
      </h1>

      {/* Description */}
      <div className="text-[15px] text-[rgb(209,210,211)] leading-[1.46668] mb-4">
        This conversation is just between{' '}
        <button
          onClick={onViewProfile}
          className="text-[rgb(97,192,250)] hover:underline font-medium"
        >
          @{username}
        </button>
        {' '}and you. Check out their profile to learn more about them.
      </div>

      {/* View Profile Button */}
      <button
        onClick={onViewProfile}
        className="px-4 py-2 rounded-[6px] bg-[rgb(26,29,33)] border border-[rgba(121,124,129,0.3)] hover:bg-[rgb(49,48,44)] transition-colors text-[15px] font-medium text-white"
      >
        View Profile
      </button>
    </div>
  );
};

export default DMHeaderInfo;

