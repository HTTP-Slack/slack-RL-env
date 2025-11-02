import React, { useState } from 'react';
import type { IChannel } from '../../types/channel';

interface StarredSectionProps {
  isExpanded?: boolean;
  onToggle?: () => void;
  starredChannels?: IChannel[];
  onChannelSelect?: (channelId: string) => void;
  onChannelMenuClick?: (channel: IChannel, position: { x: number; y: number }) => void;
}

const StarredSection: React.FC<StarredSectionProps> = ({
  isExpanded = true,
  onToggle,
  starredChannels = [],
  onChannelSelect,
  onChannelMenuClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative">
      {/* Divider */}
      <div className="h-0 border-t border-[rgba(227,206,235,0.1)] mx-2 my-2" />

      {/* Starred Section */}
      <div
        className="mx-2 my-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={`
            flex items-center
            h-[28px]
            px-[10px]
            rounded-[6px]
            transition-all duration-150
            cursor-pointer
            ${
              isHovered
                ? 'bg-[rgba(239,225,245,0.08)]'
                : 'bg-transparent'
            }
          `}
        >
          {/* Star Icon and Collapse Icon Container */}
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-[28px] h-[28px] flex-shrink-0 -ml-[2px]"
            aria-label={isExpanded ? 'Collapse Starred' : 'Expand Starred'}
          >
            <span className="relative flex items-center justify-center w-[16px] h-[16px]">
              {/* Star Icon */}
              <svg
                data-r2k="true"
                aria-hidden="true"
                viewBox="0 0 20 20"
                className="w-[16px] h-[16px] text-[rgba(227,206,235,0.8)]"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M9.044 4.29c-.393.923-.676 2.105-.812 3.065a.75.75 0 0 1-.825.64l-.25-.027c-1.066-.12-2.106-.236-2.942-.202-.45.018-.773.079-.98.167-.188.08-.216.15-.227.187-.013.042-.027.148.112.37.143.229.4.497.77.788.734.579 1.755 1.128 2.66 1.54a.75.75 0 0 1 .35 1.036c-.466.87-1.022 2.125-1.32 3.239-.15.56-.223 1.04-.208 1.396.015.372.113.454.124.461l.003.001a.2.2 0 0 0 .042.006.9.9 0 0 0 .297-.06c.297-.1.678-.319 1.116-.64.87-.635 1.8-1.55 2.493-2.275a.75.75 0 0 1 1.085 0c.692.724 1.626 1.639 2.5 2.275.44.32.822.539 1.12.64a.9.9 0 0 0 .3.06q.038-.003.044-.006h.002c.011-.009.109-.09.123-.46.013-.357-.06-.836-.212-1.397-.303-1.114-.864-2.368-1.33-3.24a.75.75 0 0 1 .35-1.037c.903-.41 1.92-.96 2.652-1.54.369-.292.625-.56.768-.787.139-.223.124-.329.112-.37-.012-.038-.039-.107-.226-.186-.206-.088-.527-.149-.976-.167-.835-.034-1.874.082-2.941.201l-.246.027a.75.75 0 0 1-.825-.64c-.136-.96-.42-2.142-.813-3.064-.198-.464-.405-.82-.605-1.048-.204-.232-.319-.243-.34-.243s-.135.01-.34.243c-.2.228-.407.584-.605 1.048m-.522-2.036c.343-.39.833-.754 1.467-.754s1.125.363 1.467.754c.348.396.63.914.858 1.449.359.84.627 1.83.798 2.723.913-.1 1.884-.192 2.708-.158.521.021 1.052.094 1.503.285.47.2.902.556 1.076 1.14.177.597-.004 1.153-.279 1.592-.271.434-.676.826-1.108 1.168-.662.524-1.482 1.003-2.256 1.392.41.85.836 1.884 1.1 2.856.17.625.286 1.271.264 1.846-.021.56-.182 1.218-.749 1.623-.555.398-1.205.316-1.7.148-.51-.173-1.034-.493-1.523-.849-.754-.55-1.523-1.261-2.158-1.896-.634.634-1.4 1.346-2.15 1.895-.487.356-1.01.677-1.518.85-.495.168-1.144.25-1.699-.148-.565-.405-.727-1.062-.75-1.62-.024-.574.09-1.22.257-1.846.261-.972.684-2.007 1.093-2.858-.775-.389-1.597-.867-2.262-1.39-.433-.342-.84-.734-1.111-1.168-.276-.44-.457-.997-.28-1.595.174-.585.608-.941 1.079-1.141.45-.191.983-.264 1.505-.285.826-.033 1.799.059 2.713.159.17-.893.439-1.882.797-2.723.228-.535.51-1.053.858-1.449"
                  clipRule="evenodd"
                />
              </svg>

              {/* Collapse/Expand Icon */}
              <svg
                data-r2k="true"
                aria-hidden="true"
                viewBox="0 0 20 20"
                className={`absolute w-[15px] h-[15px] text-[rgba(227,206,235,0.8)] transition-transform duration-150 ${
                  isExpanded ? 'rotate-0' : '-rotate-90'
                }`}
                style={{ left: '1px', top: '1px' }}
              >
                <path
                  fill="currentColor"
                  d="M13.22 9.423a.75.75 0 0 1 .001 1.151l-4.49 3.755a.75.75 0 0 1-1.231-.575V6.25a.75.75 0 0 1 1.23-.575z"
                />
              </svg>
            </span>
          </button>

          {/* Label */}
          <button
            onClick={onToggle}
            className="flex-1 flex items-center h-[28px] ml-1 text-left"
          >
            <span className="text-[15px] font-medium text-[rgba(227,206,235,0.8)] leading-[28px] whitespace-nowrap">
              Starred
            </span>
          </button>

          {/* Ellipsis Menu Button (appears on hover) */}
          <button
            className={`
              flex items-center justify-center
              w-[24px] h-[24px]
              rounded-[6px]
              transition-opacity duration-100
              ${
                isHovered
                  ? 'opacity-100 hover:bg-[rgba(239,225,245,0.08)]'
                  : 'opacity-0'
              }
            `}
            aria-label="Starred section options"
            aria-haspopup="menu"
          >
            <svg
              data-r2k="true"
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="w-[15px] h-[15px] text-[rgba(227,206,235,0.8)]"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5m0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5m-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Starred Channels List or Empty State */}
      {isExpanded && (
        <div className="px-3 py-2">
          {starredChannels.length > 0 ? (
            <div className="space-y-1">
              {starredChannels.map((channel) => (
                <div key={channel._id} className="relative group/channel">
                  <button
                    onClick={() => onChannelSelect?.(channel._id)}
                    className="w-full px-2 py-1 rounded flex items-center hover:bg-[#302234] transition-colors"
                  >
                    <span className="text-[#d1d2d3] mr-2">#</span>
                    <span className="text-[15px] text-[#d1d2d3] truncate flex-1 text-left">
                      {channel.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onChannelMenuClick) {
                          const rect = e.currentTarget.getBoundingClientRect();
                          onChannelMenuClick(channel, {
                            x: rect.right + 4,
                            y: rect.top,
                          });
                        }
                      }}
                      className="p-1 opacity-0 group-hover/channel:opacity-100 transition-opacity hover:bg-[#4a3a4d] rounded"
                      title="Channel options"
                    >
                      <svg className="w-3 h-3 text-[#d1d2d3]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 5.5A1.75 1.75 0 1 1 10 2a1.75 1.75 0 0 1 0 3.5m0 6.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5m-1.75 4.5a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0" />
                      </svg>
                    </button>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[rgba(227,206,235,0.6)] italic">
              Star important channels to keep them here
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default StarredSection;

