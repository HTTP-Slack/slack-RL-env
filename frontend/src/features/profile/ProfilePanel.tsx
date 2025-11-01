import { useEffect, useState } from 'react';
import { useProfile } from './ProfileContext';

export function ProfilePanel() {
  const { isPanelOpen, closePanel, openEditModal } = useProfile();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!isPanelOpen) {
      setShowMenu(false);
    }
  }, [isPanelOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPanelOpen) {
        closePanel();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isPanelOpen, closePanel]);

  if (!isPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60"
        onClick={closePanel}
      />

      {/* Profile Panel - Right Side */}
      <div className="ml-auto relative w-full max-w-md h-full bg-[#1a1d21] shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#1a1d21] border-b border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Profile</h2>
          <button
            onClick={closePanel}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close profile panel"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="w-40 h-40 rounded bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center text-white text-6xl font-semibold mb-4"
              aria-label="Profile picture placeholder for aban hasan"
            >
              a
            </div>
            
            {/* Name and Edit */}
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-bold text-white">aban hasan</h3>
              <button 
                onClick={openEditModal}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
              >
                Edit
              </button>
            </div>

            {/* Add name pronunciation */}
            <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Add name pronunciation</span>
            </button>

            {/* Status */}
            <div className="flex items-center gap-2 text-gray-300 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm">Active, notifications snoozed</span>
            </div>

            {/* Local Time */}
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} local time</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mb-6">
            <button className="flex-1 px-4 py-2 bg-[#2d3139] hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors">
              Set a status
            </button>
            <button className="px-4 py-2 bg-[#2d3139] hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors flex items-center gap-1">
              <span>View as</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="px-3 py-2 bg-[#2d3139] hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
                aria-label="More options"
                aria-expanded={showMenu}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>

              {/* Three-dot menu dropdown */}
              {showMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-[#1a1d21] rounded-lg shadow-xl border border-gray-700 overflow-hidden z-20" role="menu">
                  <button className="w-full px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-left text-sm" role="menuitem">
                    Copy display name: @aban hasan
                  </button>
                  <button className="w-full px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-left text-sm" role="menuitem">
                    View preferences
                  </button>
                  <button className="w-full px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-left text-sm flex items-center justify-between" role="menuitem">
                    <span>Account settings</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </button>
                  <div className="border-t border-gray-700"></div>
                  <button className="w-full px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-left text-sm" role="menuitem">
                    View your files
                  </button>
                  <button className="w-full px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-left text-sm" role="menuitem">
                    Set yourself away
                  </button>
                  <div className="border-t border-gray-700"></div>
                  <button className="w-full px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-left text-sm" role="menuitem">
                    Copy member ID
                  </button>
                  <button className="w-full px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-left text-sm" role="menuitem">
                    Copy link to profile
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-bold text-white">Contact information</h4>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Edit
              </button>
            </div>
            <div className="flex items-start gap-3 p-3 bg-[#0d1117] rounded">
              <svg className="w-5 h-5 text-gray-400 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <div>
                <div className="text-xs text-gray-400 mb-1">Email Address</div>
                <a href="mailto:abanpersonal@gmail.com" className="text-blue-400 hover:text-blue-300 text-sm">
                  abanpersonal@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* About Me */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-bold text-white">About me</h4>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                Edit
              </button>
            </div>
            <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Add Start Date</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

