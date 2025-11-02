import React, { useState, useEffect, useRef, useCallback } from 'react';
import { searchWorkspace } from '../../services/searchApi';
import type { SearchResults, SearchResult } from '../../types/search';

interface ChannelSearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  organisationId: string;
  channelId: string;
  channelName: string;
  onResultSelect: (result: SearchResult) => void;
  anchorElement?: HTMLElement | null;
}

export const ChannelSearchDropdown: React.FC<ChannelSearchDropdownProps> = ({
  isOpen,
  onClose,
  organisationId,
  channelId,
  channelName,
  onResultSelect,
  anchorElement,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Flatten results for keyboard navigation
  const flatResults = results
    ? [...results.messages, ...results.files]
    : [];

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Debounced search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      try {
        const searchResults = await searchWorkspace({
          query: searchQuery,
          organisationId,
          channelId,
          limit: 10,
        });
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [organisationId, channelId]
  );

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, performSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, flatResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && flatResults[selectedIndex]) {
      e.preventDefault();
      onResultSelect(flatResults[selectedIndex]);
      onClose();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  if (!isOpen) return null;

  const getResultIcon = (type: string) => {
    if (type === 'message') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  };

  const getResultTitle = (result: any) => {
    if (result.type === 'message') {
      return result.content.length > 60 ? `${result.content.substring(0, 60)}...` : result.content;
    }
    return result.filename || 'Untitled file';
  };

  const getResultSubtitle = (result: any) => {
    if (result.type === 'message') {
      return `From ${result.sender?.username || 'Unknown'}`;
    }
    const fileSize = result.length ? `${(result.length / 1024).toFixed(1)} KB` : '';
    const fileType = result.contentType ? ` • ${result.contentType.split('/')[1]?.toUpperCase() || 'File'}` : '';
    return `${fileSize}${fileType}`;
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-[#1a1d21] rounded-lg shadow-2xl max-h-[500px] flex flex-col border border-[#3f3f3f] z-50"
      style={{ minWidth: '500px' }}
    >
      {/* Search Input */}
      <div className="p-3 border-b border-[#3f3f3f]">
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d1d2d3]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Search in #${channelName}`}
            className="w-full bg-[#1a1d21] text-white placeholder-[#d1d2d3] pl-9 pr-9 py-2 rounded border border-[#3f3f3f] focus:border-white focus:outline-none text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d1d2d3] hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto max-h-[400px]">
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
          </div>
        )}

        {!isLoading && query && flatResults.length === 0 && (
          <div className="flex items-center justify-center py-6 text-[#d1d2d3] text-sm">
            <p>No results found in #{channelName}</p>
          </div>
        )}

        {!isLoading && !query && (
          <div className="flex items-center justify-center py-6 text-[#d1d2d3] text-sm">
            <p>Start typing to search in this channel</p>
          </div>
        )}

        {!isLoading && flatResults.length > 0 && (
          <div className="py-1">
            {results?.messages && results.messages.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-semibold text-[#d1d2d3] uppercase tracking-wider">
                  Messages
                </div>
                {results.messages.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <button
                      key={item._id}
                      onClick={() => {
                        onResultSelect(item);
                        onClose();
                      }}
                      className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-[#1164a3] transition-colors ${
                        isSelected ? 'bg-[#1164a3]' : ''
                      }`}
                    >
                      <div className="text-[#d1d2d3] shrink-0">{getResultIcon(item.type)}</div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-white text-sm truncate">{getResultTitle(item)}</div>
                        <div className="text-[#d1d2d3] text-xs truncate">{getResultSubtitle(item)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {results?.files && results.files.length > 0 && (
              <div className="mt-2">
                <div className="px-3 py-2 text-xs font-semibold text-[#d1d2d3] uppercase tracking-wider">
                  Files
                </div>
                {results.files.map((item, index) => {
                  const isSelected = results.messages.length + index === selectedIndex;
                  return (
                    <button
                      key={item._id}
                      onClick={() => {
                        onResultSelect(item);
                        onClose();
                      }}
                      className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-[#1164a3] transition-colors ${
                        isSelected ? 'bg-[#1164a3]' : ''
                      }`}
                    >
                      <div className="text-[#d1d2d3] shrink-0">{getResultIcon(item.type)}</div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-white text-sm truncate">{getResultTitle(item)}</div>
                        <div className="text-[#d1d2d3] text-xs truncate">{getResultSubtitle(item)}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
