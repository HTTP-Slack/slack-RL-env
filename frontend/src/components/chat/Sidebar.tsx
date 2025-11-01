import React from 'react';
import type { User } from '../../constants/chat';

interface SidebarProps {
  currentUser: User;
  users: User[];
  activeUserId: string;
  onUserSelect: (userId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentUser, users, activeUserId, onUserSelect }) => {
  return (
    <div className="w-[260px] bg-[#3c3836] flex flex-col border-r border-[#313030]">
      {/* Sidebar Header */}
      <div className="h-[60px] px-4 flex items-center border-b border-[#313030] shrink-0">
        <div className="flex items-center flex-1 min-w-0">
          <div className="w-8 h-8 rounded bg-[#522653] flex items-center justify-center text-white font-bold text-sm mr-3 shrink-0">
            {currentUser.displayName.charAt(0).toUpperCase()}
          </div>
          <span className="text-[15px] font-semibold text-white truncate">
            {currentUser.displayName}
          </span>
        </div>
      </div>

      {/* Channels and Direct Messages */}
      <div className="flex-1 overflow-y-auto">
        {/* Channels Section */}
        <div className="px-3 py-2">
          <button className="w-full flex items-center justify-between px-2 py-1 hover:bg-[#40403b] rounded transition-colors group">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-[#d1d2d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-[15px] font-semibold text-[#d1d2d3]">Channels</span>
            </div>
          </button>
          <div role="tree" aria-label="Channels" className="mt-1">
            <button className="w-full px-2 py-1 rounded flex items-center group hover:bg-[#40403b] transition-colors">
              <span className="text-[#d1d2d3] mr-2">#</span>
              <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">all-http-test-environment</span>
            </button>
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserSelect(user.id)}
                className={`w-full px-2 py-1 rounded flex items-center group hover:bg-[#40403b] transition-colors ${
                  activeUserId === user.id ? 'bg-[#40403b]' : ''
                }`}
              >
                <span className="text-[#d1d2d3] mr-2">#</span>
                <span className="text-[15px] text-white truncate flex-1 text-left font-normal">
                  {user.displayName.toLowerCase().replace(/\s/g, '-')}
                </span>
              </button>
            ))}
            <button className="w-full px-2 py-1 rounded flex items-center group hover:bg-[#40403b] transition-colors">
              <span className="text-[#d1d2d3] mr-2">#</span>
              <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">new-channel</span>
            </button>
            <button className="w-full px-2 py-1 rounded flex items-center group hover:bg-[#40403b] transition-colors">
              <span className="text-[#d1d2d3] mr-2">#</span>
              <span className="text-[#d1d2d3] truncate flex-1 text-left">social</span>
            </button>
            <button className="w-full px-2 py-1.5 rounded flex items-center group hover:bg-[#40403b] transition-colors mt-1">
              <svg className="w-4 h-4 text-[#d1d2d3] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">Add channels</span>
            </button>
          </div>
        </div>

        {/* Direct Messages Section */}
        <div className="px-3 py-2 mt-4">
          <button className="w-full flex items-center justify-between px-2 py-1 hover:bg-[#40403b] rounded transition-colors group">
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3 text-[#d1d2d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-[15px] font-semibold text-[#d1d2d3]">Direct messages</span>
            </div>
          </button>
          <div role="tree" aria-label="Direct messages" className="mt-1">
            <button className="w-full px-2 py-1.5 rounded flex items-center group hover:bg-[#40403b] transition-colors">
              <div className="relative mr-2 shrink-0">
                <div className="w-5 h-5 rounded bg-[#522653] flex items-center justify-center text-white text-[10px] font-semibold">
                  A
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#2ecc71] rounded-full border border-[#3c3836]"></div>
              </div>
              <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">aban hasan <span className="text-[#616061]">invited you</span></span>
            </button>
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserSelect(user.id)}
                className={`w-full px-2 py-1.5 rounded flex items-center group hover:bg-[#40403b] transition-colors ${
                  activeUserId === user.id ? 'bg-[#40403b]' : ''
                }`}
              >
                <div className="relative mr-2 shrink-0">
                  <div className="w-5 h-5 rounded bg-[#522653] flex items-center justify-center text-white text-[10px] font-semibold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  {user.status === 'active' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[#2ecc71] rounded-full border border-[#3c3836]"></div>
                  )}
                </div>
                <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">
                  {user.displayName}
                  {user.displayName === 'Shaurya Verma' && <span className="text-[#616061]"> you</span>}
                </span>
              </button>
            ))}
            <button className="w-full px-2 py-1.5 rounded flex items-center group hover:bg-[#40403b] transition-colors mt-1">
              <svg className="w-4 h-4 text-[#d1d2d3] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">Invite people</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

