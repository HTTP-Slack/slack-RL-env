import React from 'react';
import { UserMenu } from '../UserMenu';

const LeftNav: React.FC = () => {
  return (
    <div className="w-[70px] bg-[#350d36] flex flex-col items-center py-3 gap-2 border-r border-[#3b2d3e] relative">
      {/* Workspace Icon */}
      <button className="w-12 h-12 rounded bg-white hover:rounded-xl transition-all duration-200 flex items-center justify-center mb-3">
        <span className="text-[20px] font-bold text-[#522653]">HT</span>
      </button>

      {/* Home */}
      <div className="flex flex-col items-center gap-0.5">
        <button className="w-11 h-11 flex items-center justify-center rounded hover:bg-[#6f4d72] transition-colors bg-[#350d36]">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
        <span className="text-white text-[10px] font-medium">Home</span>
      </div>

      {/* DMs */}
      <div className="flex flex-col items-center gap-0.5">
        <button className="w-11 h-11 flex items-center justify-center rounded hover:bg-[#6f4d72] transition-colors relative">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        <span className="text-white text-[10px] font-medium">DMs</span>
      </div>

      {/* Activity */}
      <div className="flex flex-col items-center gap-0.5">
        <button className="w-11 h-11 flex items-center justify-center rounded hover:bg-[#6f4d72] transition-colors">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <span className="text-white text-[10px] font-medium">Activity</span>
      </div>

      {/* Files */}
      <div className="flex flex-col items-center gap-0.5">
        <button className="w-11 h-11 flex items-center justify-center rounded hover:bg-[#6f4d72] transition-colors">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        </button>
        <span className="text-white text-[10px] font-medium">Files</span>
      </div>

      {/* More */}
      <div className="flex flex-col items-center gap-0.5">
        <button className="w-11 h-11 flex items-center justify-center rounded hover:bg-[#6f4d72] transition-colors">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </button>
        <span className="text-white text-[10px] font-medium">More</span>
      </div>

      <div className="flex-1"></div>

      {/* Add workspace */}
      <button className="w-10 h-10 flex items-center justify-center rounded hover:bg-[#6f4d72] transition-colors mb-2">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* User Profile Menu */}
      <UserMenu />
    </div>
  );
};

export default LeftNav;
