import React from 'react';

const UnreadDivider: React.FC = () => {
  return (
    <div className="relative w-full py-5">
      <div className="flex items-center relative w-full h-0 -mt-px">
        {/* Red/orange line */}
        <hr
          className="relative z-[1] clear-both overflow-hidden flex-1 h-px -mb-px border-0 opacity-50 transition-opacity duration-100 delay-[3s]"
          style={{
            backgroundImage: 'linear-gradient(90deg, rgb(222, 78, 43) 0%, rgb(222, 78, 43) 100%)',
            backgroundRepeat: 'repeat-x',
            backgroundSize: '10px 1px'
          }}
          aria-hidden="true"
        />

        {/* "New" label */}
        <span
          className="relative z-[1] px-1 -mt-2.5 mr-[15px] text-[13px] font-bold leading-[19.5px] text-[rgb(222,78,43)] cursor-default"
        >
          New
        </span>
      </div>
    </div>
  );
};

export default UnreadDivider;
