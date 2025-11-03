import React, { useState } from 'react';

interface ColumnMenuProps {
  x: number;
  y: number;
  onEdit: () => void;
  onInsertLeft: () => void;
  onInsertRight: () => void;
  onDelete: () => void;
  onClose: () => void;
}

const ColumnMenu: React.FC<ColumnMenuProps> = ({
  x,
  y,
  onEdit,
  onInsertLeft,
  onInsertRight,
  onDelete,
  onClose,
}) => {
  const [showInsertMenu, setShowInsertMenu] = useState(false);

  return (
    <>
      <div
        className="fixed bg-[#2c2d31] border border-gray-600 rounded shadow-lg py-1 z-50 min-w-[200px]"
        style={{ left: x, top: y }}
      >
        <button
          onClick={() => {
            onEdit();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-white hover:bg-[#3a3b40] flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          <span>Edit field</span>
        </button>

        <div className="relative">
          <button
            onMouseEnter={() => setShowInsertMenu(true)}
            onClick={() => {
              onClose();
            }}
            className="w-full px-4 py-2 text-left text-white hover:bg-[#3a3b40] flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Insert field</span>
            </div>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {showInsertMenu && (
            <div
              className="absolute left-full top-0 ml-1 bg-[#2c2d31] border border-gray-600 rounded shadow-lg py-1 min-w-[150px]"
              onMouseLeave={() => setShowInsertMenu(false)}
            >
              <button
                onClick={() => {
                  onInsertLeft();
                  onClose();
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-[#3a3b40] flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span>Insert field left</span>
              </button>
              <button
                onClick={() => {
                  onInsertRight();
                  onClose();
                }}
                className="w-full px-4 py-2 text-left text-white hover:bg-[#3a3b40] flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
                <span>Insert field right</span>
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            onDelete();
            onClose();
          }}
          className="w-full px-4 py-2 text-left text-red-400 hover:bg-[#3a3b40] flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          <span>Delete field</span>
        </button>
      </div>
      <div className="fixed inset-0 z-40" onClick={onClose} />
    </>
  );
};

export default ColumnMenu;

