import { useEffect, useState } from 'react';
import { useProfile } from './ProfileContext';
import type { User } from '../../services/messageApi';

interface UserProfileModalProps {
  user: User;
}

export function UserProfileModal({ user }: UserProfileModalProps) {
  const { isUserProfileModalOpen, closeUserProfile } = useProfile();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!isUserProfileModalOpen) {
      setShowMenu(false);
    }
  }, [isUserProfileModalOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isUserProfileModalOpen) {
        closeUserProfile();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isUserProfileModalOpen, closeUserProfile]);

  if (!isUserProfileModalOpen) return null;

  const getInitials = (username: string) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={closeUserProfile}
      />

      {/* Profile Panel - Right Side */}
      <div className="ml-auto relative w-full max-w-[480px] h-full bg-[#1a1d21] shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#1a1d21] border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Profile</h2>
          <button
            onClick={closeUserProfile}
            className="text-gray-400 hover:text-white transition-colors p-1.5 hover:bg-[#2d3139] rounded"
            aria-label="Close profile panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-6 py-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8">
            {/* Large Profile Image */}
            <div className="w-full max-w-[400px] aspect-square rounded-lg overflow-hidden mb-6 bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
              <span className="text-white text-8xl font-bold">
                {getInitials(user.username || '')}
              </span>
            </div>

            {/* Name with Status */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-[28px] font-bold text-white">{user.username || 'User'}</h3>
              {/* Status indicator - moon icon for away */}
              <span className="text-[#ababab]" title="Away, notifications snoozed">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.25 3.5a.75.75 0 0 0 0 1.5h1.847l-2.411 2.756A.75.75 0 0 0 11.25 9h3.5a.75.75 0 0 0 0-1.5h-1.847l2.411-2.756A.75.75 0 0 0 14.75 3.5zM7 10a3 3 0 0 1 3-3V5.5a4.5 4.5 0 1 0 4.5 4.5H13a3 3 0 1 1-6 0" clipRule="evenodd" />
                </svg>
              </span>
            </div>

            {/* Away status text */}
            <div className="flex items-center gap-2 text-[#d1d2d3] mb-3">
              <span className="text-[15px]">Away, notifications snoozed</span>
            </div>

            {/* Local Time */}
            <div className="flex items-center gap-2 text-[#d1d2d3] text-[15px]">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} local time</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-8 flex-wrap">
            <button className="flex items-center justify-center gap-2 px-3 py-2 bg-transparent hover:bg-[#2d3139] text-white rounded-lg text-[15px] font-bold transition-colors border border-[rgba(121,124,129,0.5)]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span>Message</span>
            </button>

            <button className="flex items-center justify-center gap-2 px-3 py-2 bg-transparent hover:bg-[#2d3139] text-white rounded-lg text-[15px] font-bold transition-colors border border-[rgba(121,124,129,0.5)]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span>Huddle</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            <button className="flex items-center justify-center gap-2 px-3 py-2 bg-transparent hover:bg-[#2d3139] text-white rounded-lg text-[15px] font-bold transition-colors border border-[rgba(121,124,129,0.5)]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span>VIP</span>
            </button>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="px-3 py-2 bg-transparent hover:bg-[#2d3139] text-white rounded-lg transition-colors border border-[rgba(121,124,129,0.5)]"
                aria-label="More options"
                aria-expanded={showMenu}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {/* Three-dot menu dropdown */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden z-20" role="menu">
                  <button className="w-full px-4 py-3 text-[#1d1c1d] hover:bg-[#1264a3] hover:text-white transition-colors text-left text-[15px]" role="menuitem">
                    Mute conversation
                  </button>
                  <button className="w-full px-4 py-3 text-[#1d1c1d] hover:bg-[#1264a3] hover:text-white transition-colors text-left text-[15px]" role="menuitem">
                    View full profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-8">
            <h4 className="text-[18px] font-bold text-white mb-4">Contact information</h4>

            <div className="flex items-start gap-3 py-3">
              <svg className="w-5 h-5 text-[#d1d2d3] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <div className="flex-1">
                <div className="text-[13px] text-[#d1d2d3] mb-1">Email Address</div>
                <a href={`mailto:${user.email || ''}`} className="text-[#1d9bd1] hover:underline text-[15px]">
                  {user.email || 'No email provided'}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
