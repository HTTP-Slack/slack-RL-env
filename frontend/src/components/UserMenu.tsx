import { useState, useRef, useEffect } from 'react';
import { usePreferencesModal } from '../features/preferences/PreferencesContext';
import { useProfile } from '../features/profile/ProfileContext';

export function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { openModal } = usePreferencesModal();
  const { openPanel } = useProfile();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handlePreferencesClick = () => {
    setIsMenuOpen(false);
    openModal();
  };

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    openPanel();
  };

  return (
    <div ref={menuRef} className="fixed bottom-4 right-4 z-40">
      {/* Menu Dropdown */}
      {isMenuOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-64 bg-[#1a1d21] rounded-lg shadow-xl border border-gray-700 overflow-hidden">
          {/* User Info */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-orange-700 flex items-center justify-center text-white text-lg font-semibold">
                a
              </div>
              <div>
                <div className="text-white font-semibold">aban hasan</div>
                <div className="flex items-center gap-1 text-sm text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="p-3 border-b border-gray-700">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-700 rounded transition-colors text-left">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Update your status</span>
            </button>
          </div>

          {/* Menu Options */}
          <div className="py-2">
            <button className="w-full px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-left text-sm">
              Set yourself as away
            </button>
            <button className="w-full px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-left text-sm flex items-center justify-between">
              <span>Pause notifications</span>
              <span className="text-gray-500">On</span>
            </button>
          </div>

          <div className="border-t border-gray-700 py-2">
            <button 
              onClick={handleProfileClick}
              className="w-full px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-left text-sm"
            >
              Profile
            </button>
            <button
              onClick={handlePreferencesClick}
              className="w-full px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors text-left text-sm font-medium"
            >
              Preferences
            </button>
          </div>

          <div className="border-t border-gray-700 py-2">
            <button className="w-full px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-left text-sm">
              Sign out of HTTP Test Environment
            </button>
          </div>
        </div>
      )}

      {/* Avatar Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-12 h-12 rounded bg-orange-700 flex items-center justify-center text-white text-lg font-semibold hover:opacity-90 transition-opacity shadow-lg relative"
      >
        a
        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0d1117]"></div>
      </button>
    </div>
  );
}

