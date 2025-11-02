import React from 'react';

interface SidebarNavLinkProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  badge?: number;
}

const SidebarNavLink: React.FC<SidebarNavLinkProps> = ({
  icon,
  label,
  isActive = false,
  onClick,
  badge,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center
        w-full
        h-[28px]
        pl-[16px] pr-[10px]
        rounded-[6px]
        transition-all duration-150
        cursor-pointer
        ${
          isActive
            ? 'bg-[rgba(239,225,245,0.08)] text-[rgba(227,206,235,0.8)]'
            : 'bg-transparent text-[rgba(227,206,235,0.8)] hover:bg-[rgba(239,225,245,0.08)]'
        }
      `}
    >
      {/* Icon Container */}
      <span className="flex items-center w-[26px] h-[20px] -ml-[2px] flex-shrink-0 text-[rgba(227,206,235,0.8)]">
        <span className="block w-[20px] h-[20px]">{icon}</span>
      </span>

      {/* Label */}
      <span
        className={`
          block
          text-[15px]
          leading-[28px]
          whitespace-nowrap
          ${
            isActive
              ? 'font-[900] text-[rgb(248,248,248)]'
              : 'text-[rgba(227,206,235,0.8)]'
          }
        `}
      >
        {label}
      </span>

      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto flex items-center pl-[8px]">
          <span className="flex items-center pr-[2px]">
            <svg
              data-r2k="true"
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="w-[13px] h-[13px] text-[rgba(227,206,235,0.8)]"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M13.616 3.445a1.25 1.25 0 0 1 1.768 0l1.171 1.171a1.25 1.25 0 0 1 0 1.768L15.5 7.44 12.56 4.5zM11.5 5.56l-7.079 7.08-1.101 4.04 4.04-1.1 7.079-7.08zm4.945-3.177a2.75 2.75 0 0 0-3.89 0L3.22 11.72a.75.75 0 0 0-.194.333l-1.5 5.5a.75.75 0 0 0 .921.92l5.5-1.5a.75.75 0 0 0 .333-.192l9.336-9.336a2.75 2.75 0 0 0 0-3.89z"
                clipRule="evenodd"
              />
            </svg>
          </span>
          <span className="text-[rgba(227,206,235,0.8)] text-[13px] leading-[28px]">
            {badge}
          </span>
        </span>
      )}
    </button>
  );
};

export default SidebarNavLink;

