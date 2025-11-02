import React, { useState } from 'react';
import type { User } from '../../services/messageApi';
import type { IChannel } from '../../types/channel';

interface ChatHeaderProps {
  user?: User; // For DM conversations
  channel?: IChannel; // For channel conversations
  onUserClick?: () => void;
  onHuddleClick?: () => void;
  onNotificationsClick?: () => void;
  onMoreClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  user,
  channel,
  onUserClick,
  onHuddleClick,
  onNotificationsClick,
  onMoreClick,
}) => {
  const [showHuddleTooltip, setShowHuddleTooltip] = useState(false);

  const displayName = user?.username || (channel ? `#${channel.name}` : 'Unknown');
  const avatarUrl = user?.profilePicture;
  const avatarInitial = user ? displayName.charAt(0).toUpperCase() : '#';

  return (
    <div
      className="flex items-center h-[49px] pl-[18px] pr-3 bg-[rgb(26,29,33)] border-b border-[rgba(121,124,129,0.3)]"
      role="toolbar"
      aria-orientation="horizontal"
      aria-label="Primary view actions"
    >
      {/* Star icon button */}
      <div className="w-7 h-[30px] flex items-center">
        <button
          className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-[rgba(121,124,129,0.3)] hover:border-[rgba(121,124,129,0.5)] transition-all mt-[1px]"
          aria-label="Move conversation"
          type="button"
        >
          <svg
            viewBox="0 0 20 20"
            className="w-5 h-5"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.044 4.29c-.393.923-.676 2.105-.812 3.065a.75.75 0 0 1-.825.64l-.25-.027c-1.066-.12-2.106-.236-2.942-.202-.45.018-.773.079-.98.167-.188.08-.216.15-.227.187-.013.042-.027.148.112.37.143.229.4.497.77.788.734.579 1.755 1.128 2.66 1.54a.75.75 0 0 1 .35 1.036c-.466.87-1.022 2.125-1.32 3.239-.15.56-.223 1.04-.208 1.396.015.372.113.454.124.461l.003.001a.2.2 0 0 0 .042.006.9.9 0 0 0 .297-.06c.297-.1.678-.319 1.116-.64.87-.635 1.8-1.55 2.493-2.275a.75.75 0 0 1 1.085 0c.692.724 1.626 1.639 2.5 2.275.44.32.822.539 1.12.64a.9.9 0 0 0 .3.06q.038-.003.044-.006h.002c.011-.009.109-.09.123-.46.013-.357-.06-.836-.212-1.397-.303-1.114-.864-2.368-1.33-3.24a.75.75 0 0 1 .35-1.037c.903-.41 1.92-.96 2.652-1.54.369-.292.625-.56.768-.787.139-.223.124-.329.112-.37-.012-.038-.039-.107-.226-.186-.206-.088-.527-.149-.976-.167-.835-.034-1.874.082-2.941.201l-.246.027a.75.75 0 0 1-.825-.64c-.136-.96-.42-2.142-.813-3.064-.198-.464-.405-.82-.605-1.048-.204-.232-.319-.243-.34-.243s-.135.01-.34.243c-.2.228-.407.584-.605 1.048m-.522-2.036c.343-.39.833-.754 1.467-.754s1.125.363 1.467.754c.348.396.63.914.858 1.449.359.84.627 1.83.798 2.723.913-.1 1.884-.192 2.708-.158.521.021 1.052.094 1.503.285.47.2.902.556 1.076 1.14.177.597-.004 1.153-.279 1.592-.271.434-.676.826-1.108 1.168-.662.524-1.482 1.003-2.256 1.392.41.85.836 1.884 1.1 2.856.17.625.286 1.271.264 1.846-.021.56-.182 1.218-.749 1.623-.555.398-1.205.316-1.7.148-.51-.173-1.034-.493-1.523-.849-.754-.55-1.523-1.261-2.158-1.896-.634.634-1.4 1.346-2.15 1.895-.487.356-1.01.677-1.518.85-.495.168-1.144.25-1.699-.148-.565-.405-.727-1.062-.75-1.62-.024-.574.09-1.22.257-1.846.261-.972.684-2.007 1.093-2.858-.775-.389-1.597-.867-2.262-1.39-.433-.342-.84-.734-1.111-1.168-.276-.44-.457-.997-.28-1.595.174-.585.608-.941 1.079-1.141.45-.191.983-.264 1.505-.285.826-.033 1.799.059 2.713.159.17-.893.439-1.882.797-2.723.228-.535.51-1.053.858-1.449"
              fill="rgba(232,232,232,0.7)"
            />
          </svg>
        </button>
      </div>

      {/* User/Channel info */}
      <div className="flex-1 min-w-0 flex items-baseline h-[30px]">
        <button
          onClick={onUserClick}
          className="flex items-center h-[30px] px-[3px] py-[3px] pr-2 rounded-[6px] hover:bg-[rgb(49,48,44)] transition-colors min-w-[96px]"
          aria-label={displayName}
        >
          <div className="flex items-center">
            {/* Avatar - only show for users */}
            {user && (
              <div className="relative w-6 h-6 mr-2">
                <div
                  className="w-6 h-6 bg-[rgba(232,232,232,0.13)] flex items-center justify-center overflow-hidden"
                  style={{
                    borderRadius: 'clamp(6px, min(22.222%, 12px), 12px)',
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[18px] font-[900] text-[rgb(209,210,211)]">
                      {avatarInitial}
                    </span>
                  )}
                </div>
                {/* Presence indicator (DND/Away) - shown for users only */}
                <div className="absolute top-[6px] left-[6px] w-[18px] h-[18px] flex items-center justify-center">
                  <svg
                    viewBox="0 0 20 20"
                    className="w-[18px] h-[18px]"
                    fill="currentColor"
                    aria-label="Away, notifications snoozed"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M11.25 3.5a.75.75 0 0 0 0 1.5h1.847l-2.411 2.756A.75.75 0 0 0 11.25 9h3.5a.75.75 0 0 0 0-1.5h-1.847l2.411-2.756A.75.75 0 0 0 14.75 3.5zM7 10a3 3 0 0 1 3-3V5.5a4.5 4.5 0 1 0 4.5 4.5H13a3 3 0 1 1-6 0"
                      fill="rgb(171,171,173)"
                    />
                  </svg>
                </div>
              </div>
            )}
            {/* Name */}
            <span className="text-[18px] font-[900] leading-[24px] text-[rgb(209,210,211)] whitespace-nowrap overflow-hidden text-ellipsis">
              {displayName}
            </span>
          </div>
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-0 ml-auto">
        {/* Huddle button */}
        <div className="relative">
          <div
            className="flex items-center border border-[rgba(121,124,129,0.3)] rounded-[8px] overflow-hidden"
            onMouseEnter={() => setShowHuddleTooltip(true)}
            onMouseLeave={() => setShowHuddleTooltip(false)}
          >
            <button
              onClick={onHuddleClick}
              className="flex items-center gap-1 px-2 py-1.5 hover:bg-[rgb(49,48,44)] transition-colors"
              aria-label={user ? `Start huddle with ${displayName}` : `Start huddle in ${displayName}`}
            >
              <svg
                viewBox="0 0 20 20"
                className="w-5 h-5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.094 4.571C3.785 5.825 3 7.444 3 8.966v1.371A3.45 3.45 0 0 1 5.25 9.5h.5c1.064 0 1.75.957 1.75 1.904v5.192c0 .947-.686 1.904-1.75 1.904h-.5c-2.168 0-3.75-1.99-3.75-4.211v-.578q0-.105.005-.211H1.5V8.966c0-2.02 1.024-4.01 2.556-5.478C5.595 2.014 7.711 1 10 1s4.405 1.014 5.944 2.488C17.476 4.956 18.5 6.945 18.5 8.966V13.5h-.005q.005.105.005.211v.578c0 2.221-1.582 4.211-3.75 4.211h-.5c-1.064 0-1.75-.957-1.75-1.904v-5.192c0-.947.686-1.904 1.75-1.904h.5c.864 0 1.635.316 2.25.837V8.966c0-1.522-.785-3.141-2.094-4.395C13.602 3.322 11.844 2.5 10 2.5s-3.602.822-4.906 2.071m9.016 6.508a.5.5 0 0 0-.11.325v5.192c0 .145.05.257.11.325.057.066.109.079.14.079h.5c1.146 0 2.25-1.11 2.25-2.711v-.578C17 12.11 15.896 11 14.75 11h-.5c-.031 0-.083.013-.14.08M3 13.711C3 12.11 4.105 11 5.25 11h.5c.031 0 .083.013.14.08.06.067.11.18.11.324v5.192a.5.5 0 0 1-.11.325c-.057.066-.109.079-.14.079h-.5C4.105 17 3 15.89 3 14.289z"
                  fill="rgba(232,232,232,0.7)"
                />
              </svg>
              <span className="text-[13px] font-[700] text-[rgba(232,232,232,0.7)] ml-1">
                Huddle
              </span>
            </button>
            {/* Divider */}
            <div className="w-px h-5 bg-[rgba(121,124,129,0.3)]" />
            {/* Dropdown button */}
            <button
              className="w-5 h-[26px] flex items-center justify-center hover:bg-[rgb(49,48,44)] transition-colors"
              aria-label="More Huddles options"
              aria-haspopup="menu"
            >
              <svg
                viewBox="0 0 20 20"
                className="w-5 h-5"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.72 7.47a.75.75 0 0 1 1.06 0L10 10.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-3.75 3.75a.75.75 0 0 1-1.06 0L5.72 8.53a.75.75 0 0 1 0-1.06"
                  fill="rgba(232,232,232,0.7)"
                />
              </svg>
            </button>
          </div>

          {/* Huddle tooltip - shown on hover */}
          {showHuddleTooltip && (
            <div className="absolute right-0 top-full mt-1 w-[350px] p-4 bg-[rgb(26,29,33)] border border-[rgba(121,124,129,0.5)] rounded-[8px] shadow-lg z-50">
              <div className="mb-4">
                <img
                  src="https://a.slack-edge.com/bv1-13-br/huddles_onboarding_tip_ia4-b74448b.gif"
                  alt="Skip the typing and talk real with people in real time with Huddles"
                  className="w-full rounded-[8px]"
                />
              </div>
              <div>
                <div className="text-[15px] font-[700] text-white mb-2">
                  Talk it out in real time
                </div>
                <div className="text-[15px] text-[rgb(248,248,248)] text-left">
                  Have a quick chat, just like you would in an office. Huddles are voice first, so no need to be camera ready.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notifications button */}
        <button
          onClick={onNotificationsClick}
          className="w-7 h-7 flex items-center justify-center rounded-[8px] border border-[rgba(121,124,129,0.3)] hover:border-[rgba(121,124,129,0.5)] transition-all ml-2"
          aria-label="Notifications"
        >
          <svg
            viewBox="0 0 20 20"
            className="w-5 h-5"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M9.357 3.256c-.157.177-.31.504-.36 1.062l-.05.558-.55.11c-1.024.204-1.691.71-2.145 1.662-.485 1.016-.736 2.566-.752 4.857l-.002.307-.217.217-2.07 2.077c-.145.164-.193.293-.206.374a.3.3 0 0 0 .034.199c.069.12.304.321.804.321h4.665l.07.672c.034.327.17.668.4.915.214.232.536.413 1.036.413.486 0 .802-.178 1.013-.41.227-.247.362-.588.396-.916l.069-.674h4.663c.5 0 .735-.202.804-.321a.3.3 0 0 0 .034-.199c-.013-.08-.061-.21-.207-.374l-2.068-2.077-.216-.217-.002-.307c-.015-2.291-.265-3.841-.75-4.857-.455-.952-1.123-1.458-2.147-1.663l-.549-.11-.05-.557c-.052-.558-.204-.885-.36-1.062C10.503 3.1 10.31 3 10 3s-.505.1-.643.256m-1.124-.994C8.689 1.746 9.311 1.5 10 1.5s1.31.246 1.767.762c.331.374.54.85.65 1.383 1.21.369 2.104 1.136 2.686 2.357.604 1.266.859 2.989.894 5.185l1.866 1.874.012.012.011.013c.636.7.806 1.59.372 2.342-.406.705-1.223 1.072-2.103 1.072H12.77c-.128.39-.336.775-.638 1.104-.493.538-1.208.896-2.12.896-.917 0-1.638-.356-2.136-.893A3 3 0 0 1 7.23 16.5H3.843c-.88 0-1.697-.367-2.104-1.072-.433-.752-.263-1.642.373-2.342l.011-.013.012-.012 1.869-1.874c.035-2.196.29-3.919.894-5.185.582-1.22 1.475-1.988 2.684-2.357.112-.533.32-1.009.651-1.383"
              fill="rgba(232,232,232,0.7)"
            />
          </svg>
        </button>

        {/* More options button */}
        <button
          onClick={(e) => onMoreClick?.(e)}
          className="w-7 h-7 flex items-center justify-center rounded-[8px] hover:bg-[rgb(49,48,44)] transition-all ml-2"
          aria-label={channel ? 'More channel actions' : 'More actions'}
          aria-haspopup="menu"
        >
          <svg
            viewBox="0 0 20 20"
            className="w-5 h-5"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5m0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5m-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0"
              fill="rgba(232,232,232,0.7)"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;

