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
    <div className="w-[260px] bg-[rgb(60,56,54)] flex flex-col border-r border-[rgb(49,48,44)]">
      {/* Sidebar Header */}
      <div className="h-[60px] px-4 flex items-center border-b border-[rgb(49,48,44)] flex-shrink-0">
        <div className="flex items-center flex-1 min-w-0">
          <div className="w-8 h-8 rounded bg-[rgb(97,31,105)] flex items-center justify-center text-white font-bold text-sm mr-3 flex-shrink-0">
            {currentUser.displayName.charAt(0).toUpperCase()}
          </div>
          <span className="text-[15px] font-semibold text-white truncate">
            {currentUser.displayName}
          </span>
        </div>
      </div>

      {/* Channels and Direct Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          <div className="text-[13px] font-semibold text-[rgb(209,210,211)] uppercase tracking-[0.5px] mb-1 px-2">
            Direct messages
          </div>
          <div role="tree" aria-label="Channels and direct messages" className="mt-1">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserSelect(user.id)}
                className={`w-full px-2 py-1.5 rounded flex items-center group hover:bg-[rgb(64,63,59)] transition-colors ${
                  activeUserId === user.id ? 'bg-[rgb(64,63,59)]' : ''
                }`}
              >
                <div className="relative mr-2 flex-shrink-0">
                  <div className="w-5 h-5 rounded bg-[rgb(97,31,105)] flex items-center justify-center text-white text-[10px] font-semibold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  {user.status === 'active' && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-[rgb(46,204,113)] rounded-full border border-[rgb(60,56,54)]"></div>
                  )}
                </div>
                <span className="text-[15px] text-[rgb(209,210,211)] truncate flex-1 text-left">
                  {user.displayName}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

