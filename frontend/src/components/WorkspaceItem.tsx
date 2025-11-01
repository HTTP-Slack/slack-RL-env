import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Workspace } from '../types/workspace';

interface WorkspaceItemProps {
  workspace: Workspace;
}

// Generate default avatar URLs
const getDefaultAvatars = (count: number) => {
  const avatars = [
    'https://a.slack-edge.com/80588/img/avatars/ava_0001-88.png',
    'https://a.slack-edge.com/80588/img/avatars/ava_0002-88.png',
    'https://a.slack-edge.com/80588/img/avatars/ava_0003-88.png',
    'https://a.slack-edge.com/80588/img/avatars/ava_0004-88.png',
    'https://a.slack-edge.com/80588/img/avatars/ava_0005-88.png',
  ];
  return avatars.slice(0, Math.min(count, 5));
};

export const WorkspaceItem: React.FC<WorkspaceItemProps> = ({ workspace }) => {
  const navigate = useNavigate();
  const memberCount = workspace.coWorkers?.length || 0;
  const memberAvatars = getDefaultAvatars(Math.min(memberCount, 5));

  const handleLaunchClick = () => {
    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-row items-center">
      {/* Workspace Icon */}
      <div className="w-[75px] h-[75px] mr-4 rounded-[5px] overflow-clip bg-[rgb(74,21,75)] flex items-center justify-center">
        <span className="text-white text-3xl font-bold">
          {workspace.name?.charAt(0).toUpperCase() || 'W'}
        </span>
      </div>

      {/* Workspace Content */}
      <div className="flex flex-col my-3 flex-1">
        <span className="block mb-2 text-[18px] font-bold text-black">
          {workspace.name || 'Unnamed Workspace'}
        </span>
        <div className="flex flex-row items-center">
          {/* Avatar Stack */}
          {memberCount > 0 && (
            <>
              <div className="flex flex-row items-center">
                {memberAvatars.map((avatar, index) => (
                  <img
                    key={index}
                    className="relative inline-block overflow-clip w-5 h-5 border border-white rounded-[4px] whitespace-nowrap"
                    src={avatar}
                    alt=""
                    height="20"
                    width="20"
                    style={{
                      marginLeft: index > 0 ? '-4px' : '0',
                      marginRight: index === memberAvatars.length - 1 ? '10px' : '0',
                      zIndex: 5 - index,
                      textIndent: '100%',
                    }}
                  />
                ))}
              </div>
              <span className="block text-[14px] leading-5 text-[rgb(105,105,105)]">
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </span>
            </>
          )}
          {memberCount === 0 && (
            <span className="block text-[14px] leading-5 text-[rgb(105,105,105)]">
              No members yet
            </span>
          )}
        </div>
        {/* Show channels count if available */}
        {workspace.channels && workspace.channels.length > 0 && (
          <span className="block mt-1 text-[12px] text-[rgb(105,105,105)]">
            {workspace.channels.length} {workspace.channels.length === 1 ? 'channel' : 'channels'}
          </span>
        )}
      </div>

      {/* Launch Button */}
      <button
        onClick={handleLaunchClick}
        className="ml-auto p-4 rounded-[4px] text-[14px] font-bold leading-[18px] text-center uppercase tracking-[0.798px] whitespace-nowrap text-white bg-[rgb(97,31,105)] cursor-pointer transition-[box-shadow_0.42s_cubic-bezier(0.165,0.84,0.44,1),color_0.42s_cubic-bezier(0.165,0.84,0.44,1),background_0.42s_cubic-bezier(0.165,0.84,0.44,1)] hover:bg-[rgb(77,25,85)]"
      >
        Launch Slack
      </button>
    </div>
  );
};
