import React, { useState, useRef, useEffect } from 'react';

export type SearchType = 'messages' | 'dms' | 'files' | 'people' | 'channels' | 'canvases' | 'all';

interface SearchTypeFilterProps {
  selected: SearchType;
  onSelect: (type: SearchType) => void;
  results?: {
    messages: number;
    dms: number;
    files: number;
    people: number;
    channels: number;
    canvases: number;
  };
}

export const SearchTypeFilter: React.FC<SearchTypeFilterProps> = ({
  selected,
  onSelect,
  results = {
    messages: 0,
    dms: 0,
    files: 0,
    people: 0,
    channels: 0,
    canvases: 0,
  },
}) => {
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

  const getLabel = (type: SearchType) => {
    switch (type) {
      case 'messages':
        return 'Messages';
      case 'dms':
        return 'DMs';
      case 'files':
        return 'Files';
      case 'people':
        return 'People';
      case 'channels':
        return 'Channels';
      case 'canvases':
        return 'Canvases';
      default:
        return 'All';
    }
  };

  const getIcon = () => {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-[#2c2d30] hover:bg-[#3f3f3f] rounded text-sm flex items-center gap-2 min-w-[140px]"
      >
        {getIcon()}
        <span className="flex-1 text-left">{getLabel(selected)}</span>
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
        <div className="absolute top-full left-0 mt-1 w-64 bg-[#1a1d21] border border-[#3f3f3f] rounded-lg shadow-2xl z-50">
          {/* Messages */}
          <button
            onClick={() => {
              onSelect('messages');
              setIsOpen(false);
            }}
            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-[#1164a3] transition-colors ${
              selected === 'messages' ? 'bg-[#1164a3]' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {selected === 'messages' && (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {selected !== 'messages' && <div className="w-5" />}
              <span className="font-medium">Messages</span>
            </div>
            <span className="text-[#d1d2d3]">{results.messages}</span>
          </button>

          {/* DMs */}
          <button
            onClick={() => {
              onSelect('dms');
              setIsOpen(false);
            }}
            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-[#3f3f3f] transition-colors ${
              selected === 'dms' ? 'bg-[#3f3f3f]' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {selected === 'dms' && (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {selected !== 'dms' && <div className="w-5" />}
              <span>DMs</span>
            </div>
            <span className="text-[#d1d2d3]">{results.dms}</span>
          </button>

          {/* Files */}
          <button
            onClick={() => {
              onSelect('files');
              setIsOpen(false);
            }}
            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-[#3f3f3f] transition-colors ${
              selected === 'files' ? 'bg-[#3f3f3f]' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {selected === 'files' && (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {selected !== 'files' && <div className="w-5" />}
              <span>Files</span>
            </div>
            <span className="text-[#d1d2d3]">{results.files}</span>
          </button>

          {/* People */}
          <button
            onClick={() => {
              onSelect('people');
              setIsOpen(false);
            }}
            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-[#3f3f3f] transition-colors ${
              selected === 'people' ? 'bg-[#3f3f3f]' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {selected === 'people' && (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {selected !== 'people' && <div className="w-5" />}
              <span>People</span>
            </div>
            <span className="text-[#d1d2d3]">{results.people}</span>
          </button>

          {/* Channels */}
          <button
            onClick={() => {
              onSelect('channels');
              setIsOpen(false);
            }}
            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-[#3f3f3f] transition-colors ${
              selected === 'channels' ? 'bg-[#3f3f3f]' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {selected === 'channels' && (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {selected !== 'channels' && <div className="w-5" />}
              <span>Channels</span>
            </div>
            <span className="text-[#d1d2d3]">{results.channels}</span>
          </button>

          {/* Canvases */}
          <button
            onClick={() => {
              onSelect('canvases');
              setIsOpen(false);
            }}
            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-[#3f3f3f] transition-colors ${
              selected === 'canvases' ? 'bg-[#3f3f3f]' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              {selected === 'canvases' && (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {selected !== 'canvases' && <div className="w-5" />}
              <span>Canvases</span>
            </div>
            <span className="text-[#d1d2d3]">{results.canvases}</span>
          </button>

          {/* Divider */}
          <div className="border-t border-[#3f3f3f] my-2" />

          {/* Display options */}
          <div className="px-4 py-2 text-sm text-[#d1d2d3]">Display options</div>

          {/* Show as list sidebar */}
          <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#3f3f3f] transition-colors text-left">
            <span className="text-sm">Show as a list sidebar</span>
          </button>
        </div>
      )}
    </div>
  );
};
