import React, { useState, useRef, useEffect } from 'react';

export type SortOption = 'relevant' | 'newest' | 'oldest';

interface SortDropdownProps {
  selected: SortOption;
  onSelect: (option: SortOption) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({ selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getLabel = (option: SortOption) => {
    switch (option) {
      case 'relevant':
        return 'Most relevant (default)';
      case 'newest':
        return 'Newest';
      case 'oldest':
        return 'Oldest';
    }
  };

  const handleSelect = (option: SortOption) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-[#d1d2d3] hover:text-white flex items-center gap-1"
      >
        Sort: {getLabel(selected)}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-[#1a1d21] border border-[#3f3f3f] rounded-lg shadow-2xl z-50">
          <button
            onClick={() => handleSelect('relevant')}
            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1164a3] transition-colors ${
              selected === 'relevant' ? 'bg-[#1164a3]' : ''
            }`}
          >
            {selected === 'relevant' && (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {selected !== 'relevant' && <div className="w-5" />}
            <span className="flex-1 text-left text-white">Most relevant (default)</span>
          </button>

          <button
            onClick={() => handleSelect('newest')}
            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1164a3] transition-colors ${
              selected === 'newest' ? 'bg-[#1164a3]' : ''
            }`}
          >
            {selected === 'newest' && (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {selected !== 'newest' && <div className="w-5" />}
            <span className="flex-1 text-left text-white">Newest</span>
          </button>

          <button
            onClick={() => handleSelect('oldest')}
            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1164a3] transition-colors ${
              selected === 'oldest' ? 'bg-[#1164a3]' : ''
            }`}
          >
            {selected === 'oldest' && (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {selected !== 'oldest' && <div className="w-5" />}
            <span className="flex-1 text-left text-white">Oldest</span>
          </button>

          <div className="border-t border-[#3f3f3f] my-1" />

          <button className="w-full px-4 py-3 hover:bg-[#3f3f3f] transition-colors text-left text-white">
            Edit default
          </button>
        </div>
      )}
    </div>
  );
};
