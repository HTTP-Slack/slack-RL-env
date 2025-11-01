import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Workspace } from '../types/workspace';

interface WorkspaceItemProps {
  workspace: Workspace;
}

export const WorkspaceItem: React.FC<WorkspaceItemProps> = ({ workspace }) => {
  const navigate = useNavigate();

  const handleLaunch = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-row items-center">
      {/* Workspace Icon */}
      <img
        className="w-[75px] h-[75px] mr-4 rounded-[5px] overflow-clip"
        src={workspace.iconUrl}
        alt=""
        height="75"
        width="75"
      />

      {/* Workspace Content */}
      <div className="flex flex-col my-3 flex-1">
        <span className="block mb-2 text-[18px] font-bold text-black">
          {workspace.name}
        </span>
        <div className="flex flex-row items-center">
          {/* Avatar Stack */}
          <div className="flex flex-row items-center">
            {workspace.memberAvatars.slice(0, 5).map((avatar, index) => (
              <img
                key={index}
                className="relative inline-block overflow-clip w-5 h-5 border border-white rounded-[4px] whitespace-nowrap"
                src={avatar}
                alt=""
                height="20"
                width="20"
                style={{
                  marginLeft: index > 0 ? '-4px' : '0',
                  marginRight: index === workspace.memberAvatars.length - 1 ? '10px' : '0',
                  zIndex: 5 - index,
                  textIndent: '100%',
                }}
              />
            ))}
          </div>
          <span className="block text-[14px] leading-5 text-[rgb(105,105,105)]">
            {workspace.members} members
          </span>
        </div>
      </div>

      {/* Launch Button */}
      <button
        onClick={handleLaunch}
        className="ml-auto p-4 rounded-[4px] text-[14px] font-bold leading-[18px] text-center uppercase tracking-[0.798px] whitespace-nowrap text-white bg-[rgb(97,31,105)] cursor-pointer transition-[box-shadow_0.42s_cubic-bezier(0.165,0.84,0.44,1),color_0.42s_cubic-bezier(0.165,0.84,0.44,1),background_0.42s_cubic-bezier(0.165,0.84,0.44,1)]"
      >
        Launch Slack
      </button>
    </div>
  );
};
