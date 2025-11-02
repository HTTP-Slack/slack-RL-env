import React from 'react';

interface PinnedMessageLabelProps {
  pinnedByCurrentUser: boolean;
  pinnedBy?: {
    username?: string;
  };
}

const PinnedMessageLabel: React.FC<PinnedMessageLabelProps> = ({
  pinnedByCurrentUser,
  pinnedBy,
}) => {
  const labelText = pinnedByCurrentUser
    ? 'Pinned by you'
    : pinnedBy?.username
    ? `Pinned by ${pinnedBy.username}`
    : 'Pinned';

  return (
    <div className="flex items-baseline whitespace-nowrap pt-1 pb-0 px-5 mb-[-4px] bg-transparent">
      <div className="flex items-baseline text-[13px] leading-[19.0668px] font-[Slack-Lato,Slack-Fractions,appleLogo,sans-serif]">
        {/* Pin icon */}
        <div className="mr-2 text-right inline-flex items-center justify-center">
          <svg
            className="w-[13px] h-[13px] text-[rgb(232,145,45)]"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M10.927 1.745a.5.5 0 0 0-.854 0L8.5 4.5h-2a.5.5 0 0 0-.354.146l-2 2A.5.5 0 0 0 4.5 7.5V9a.5.5 0 0 0 .147.354l2.999 2.999V16.5a.5.5 0 0 0 1 0v-4.147a.5.5 0 0 0-.146-.353L5.5 9V7.707l1.646-1.647h2.208a.5.5 0 0 0 .427-.237L10.5 4.06l.719 1.763a.5.5 0 0 0 .427.237h2.208L15.5 7.707V9l-3 3a.5.5 0 0 0-.146.353V16.5a.5.5 0 0 0 1 0v-4.147l2.999-2.999A.5.5 0 0 0 16.5 9V7.5a.5.5 0 0 0-.354-.854l-2-2A.5.5 0 0 0 13.792 4.5h-2z" />
          </svg>
        </div>

        {/* Label text */}
        <span className="overflow-hidden text-ellipsis text-[rgba(232,232,232,0.7)]">
          {labelText}
        </span>
      </div>
    </div>
  );
};

export default PinnedMessageLabel;
