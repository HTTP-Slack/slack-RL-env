import React from 'react';

interface ChatViewHeaderProps {
  hasPins?: boolean;
  hasFiles?: boolean;
  activeView?: 'messages' | 'files' | 'pins';
  onViewChange?: (view: 'messages' | 'files' | 'pins') => void;
  onAddTab?: () => void;
}

const ChatViewHeader: React.FC<ChatViewHeaderProps> = ({
  hasPins = false,
  hasFiles = false,
  activeView = 'messages',
  onViewChange,
  onAddTab,
}) => {
  const handleViewClick = (view: 'messages' | 'files' | 'pins') => {
    onViewChange?.(view);
  };

  const isActive = (view: 'messages' | 'files' | 'pins') => activeView === view;

  return (
    <div
      className="flex items-center h-[38px] bg-[rgb(26,29,33)]"
      role="tablist"
      aria-orientation="horizontal"
      aria-label="Channel views"
    >
      {/* Tabs container */}
      <div className="flex items-center flex-1">
        {/* Messages tab - always shown */}
        <div className="flex flex-shrink-0">
          <button
            onClick={() => handleViewClick('messages')}
            className={`
              flex items-center justify-center h-[38px] px-2
              transition-[box-shadow,color] duration-[125ms] ease-out cursor-pointer whitespace-nowrap
              ${isActive('messages')
                ? 'text-[rgb(248,248,248)]'
                : 'text-[rgb(185,186,189)] hover:text-[rgb(209,210,211)]'
              }
            `}
            style={isActive('messages') ? { boxShadow: 'rgb(227, 206, 235) 0px -2px 0px 0px inset' } : { boxShadow: 'rgba(0, 0, 0, 0) 0px -2px 0px 0px inset' }}
            role="tab"
            aria-selected={isActive('messages')}
            aria-haspopup="false"
            type="button"
          >
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-4 flex items-center justify-center">
                <svg
                  viewBox="0 0 20 20"
                  className="w-4 h-4"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  {isActive('messages') ? (
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M10 1.5a8.5 8.5 0 1 0 3.859 16.075l3.714.904a.75.75 0 0 0 .906-.906l-.904-3.714A8.5 8.5 0 0 0 10 1.5"
                      fill="currentColor"
                    />
                  ) : (
                    <path
                      d="M3 6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H8.5l-3.7 2.8a1 1 0 0 1-1.6-.8V6Z"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      fill="currentColor"
                    />
                  )}
                </svg>
              </span>
              <span className="text-[13px] font-[700] leading-[18px]">Messages</span>
            </span>
          </button>
        </div>

        {/* Spacer */}
        <div className="w-1 flex-shrink-0" />

        {/* Add canvas tab */}
        <div className="flex flex-shrink-0">
          <button
            className="flex items-center justify-center h-[38px] px-2 text-[rgb(185,186,189)] hover:text-[rgb(209,210,211)] transition-all cursor-pointer whitespace-nowrap"
            role="tab"
            aria-selected="false"
            aria-haspopup="false"
            type="button"
          >
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-4 h-4 flex items-center justify-center">
                <svg
                  viewBox="0 0 20 20"
                  className="w-4 h-4"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3 5.25A2.25 2.25 0 0 1 5.25 3h9.5A2.25 2.25 0 0 1 17 5.25v5.5h-4.75a1.5 1.5 0 0 0-1.5 1.5V17h-5.5A2.25 2.25 0 0 1 3 14.75zm9.25 11.003 4.003-4.003H12.25zM5.25 1.5A3.75 3.75 0 0 0 1.5 5.25v9.5a3.75 3.75 0 0 0 3.75 3.75h5.736c.729 0 1.428-.29 1.944-.805l4.765-4.765a2.75 2.75 0 0 0 .805-1.944V5.25a3.75 3.75 0 0 0-3.75-3.75zm.25 4.75a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1-.75-.75m.75 2.25a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="text-[13px] font-[700] leading-[18px]">Add canvas</span>
            </span>
          </button>
        </div>

        {/* Spacer */}
        <div className="w-1 flex-shrink-0" />

        {/* Files tab - conditionally shown */}
        {hasFiles && (
          <>
            <div className="flex flex-shrink-0">
              <button
                onClick={() => handleViewClick('files')}
                className={`
                  flex items-center justify-center h-[38px] px-2
                  transition-[box-shadow,color] duration-[125ms] ease-out cursor-pointer whitespace-nowrap
                  ${isActive('files')
                    ? 'text-[rgb(248,248,248)]'
                    : 'text-[rgb(185,186,189)] hover:text-[rgb(209,210,211)]'
                  }
                `}
                style={isActive('files') ? { boxShadow: 'rgb(227, 206, 235) 0px -2px 0px 0px inset' } : { boxShadow: 'rgba(0, 0, 0, 0) 0px -2px 0px 0px inset' }}
                role="tab"
                aria-selected={isActive('files')}
                aria-haspopup="false"
                type="button"
              >
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-4 flex items-center justify-center">
                    <svg
                      viewBox="0 0 20 20"
                      className="w-4 h-4"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M8.86 1.328a2.15 2.15 0 0 1 2.28 0l6.118 3.824a1.59 1.59 0 0 1 0 2.696l-6.118 3.824a2.15 2.15 0 0 1-2.28 0L2.742 7.848a1.59 1.59 0 0 1 0-2.696zM10.345 2.6a.65.65 0 0 0-.69 0L3.537 6.424a.09.09 0 0 0 0 .152L9.655 10.4a.65.65 0 0 0 .69 0l6.118-3.824a.09.09 0 0 0 0-.152zm-8.246 7.462a.75.75 0 0 1 1.033-.239L9.655 13.9a.65.65 0 0 0 .688.001l6.519-4.074a.75.75 0 0 1 .795 1.272l-6.52 4.074a2.15 2.15 0 0 1-2.277 0l-6.523-4.078a.75.75 0 0 1-.238-1.033m1.033 3.261a.75.75 0 1 0-.795 1.272l6.523 4.077a2.15 2.15 0 0 0 2.278.001l6.519-4.074a.75.75 0 0 0-.795-1.272l-6.52 4.074a.65.65 0 0 1-.687 0z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <span className="text-[13px] font-[700] leading-[18px]">Files</span>
                </span>
              </button>
            </div>
            <div className="w-1 flex-shrink-0" />
          </>
        )}

        {/* Pins tab - conditionally shown */}
        {hasPins && (
          <>
            <div className="flex flex-shrink-0">
              <button
                onClick={() => handleViewClick('pins')}
                className={`
                  flex items-center justify-center h-[38px] px-2
                  transition-[box-shadow,color] duration-[125ms] ease-out cursor-pointer whitespace-nowrap
                  ${isActive('pins')
                    ? 'text-[rgb(248,248,248)]'
                    : 'text-[rgb(185,186,189)] hover:text-[rgb(209,210,211)]'
                  }
                `}
                style={isActive('pins') ? { boxShadow: 'rgb(227, 206, 235) 0px -2px 0px 0px inset' } : { boxShadow: 'rgba(0, 0, 0, 0) 0px -2px 0px 0px inset' }}
                role="tab"
                aria-selected={isActive('pins')}
                aria-haspopup="false"
                type="button"
              >
                <span className="flex items-center gap-1.5">
                  <span className="inline-block w-4 h-4 flex items-center justify-center">
                    <svg
                      viewBox="0 0 20 20"
                      className="w-4 h-4"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.718 3.272 3.271 7.719l2.644.528a.75.75 0 0 1 .383.205l2.107 2.108a.75.75 0 0 1 .198.712c-.257 1.025-.369 1.926-.252 2.8.086.644.3 1.302.71 2.003l7.013-7.013c-.7-.41-1.359-.625-2.004-.71-.873-.117-1.773-.005-2.799.251a.75.75 0 0 1-.712-.197L8.452 6.299a.75.75 0 0 1-.205-.383zm-.73-1.391a1.25 1.25 0 0 1 2.11.639l.575 2.879 1.651 1.65c.977-.214 1.95-.317 2.945-.185 1.146.153 2.27.612 3.431 1.483a.75.75 0 0 1 .08 1.13L14.16 13.1l4.121 4.121a.75.75 0 0 1-1.06 1.06l-4.122-4.12-3.621 3.62a.75.75 0 0 1-1.13-.08c-.872-1.161-1.33-2.284-1.483-3.43-.133-.995-.03-1.968.185-2.945L5.4 9.674l-2.88-.576a1.25 1.25 0 0 1-.639-2.11z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <span className="text-[13px] font-[700] leading-[18px]">Pins</span>
                </span>
              </button>
            </div>
            <div className="w-1 flex-shrink-0" />
          </>
        )}

        {/* Add tab button */}
        <div className="flex flex-shrink-0">
          <button
            onClick={onAddTab}
            className="flex items-center justify-center h-[38px] w-8 px-2 text-[rgb(185,186,189)] hover:text-[rgb(209,210,211)] transition-all cursor-pointer"
            aria-label="Add and Edit Channel Tabs"
            aria-haspopup="true"
            role="button"
            type="button"
          >
            <span className="flex items-center justify-center">
              <div className="relative w-4 h-4 flex items-center justify-center">
                <svg
                  viewBox="0 0 20 20"
                  className="w-4 h-4"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M11 3.5a1 1 0 1 0-2 0V9H3.5a1 1 0 0 0 0 2H9v5.5a1 1 0 1 0 2 0V11h5.5a1 1 0 1 0 0-2H11z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatViewHeader;
