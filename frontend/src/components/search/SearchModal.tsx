import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { advancedSearch } from '../../services/searchApi';
import { parseSearchQuery } from '../../utils/searchParser';
import type { SearchResults, SearchResult } from '../../types/search';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  organisationId: string;
  channelFilter?: {
    id: string;
    name: string;
  };
  onResultSelect: (result: SearchResult) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  organisationId,
  channelFilter,
  onResultSelect,
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Flatten results for keyboard navigation
  const flatResults = results
    ? [
        ...results.channels.map((r) => ({ ...r, category: 'Channels' })),
        ...results.users.map((r) => ({ ...r, category: 'People' })),
        ...results.messages.map((r) => ({ ...r, category: 'Messages' })),
        ...results.files.map((r) => ({ ...r, category: 'Files' })),
        ...results.canvases.map((r) => ({ ...r, category: 'Workflows' })),
        ...results.conversations.map((r) => ({ ...r, category: 'Direct Messages' })),
      ]
    : [];

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced search
  const performSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults(null);
        return;
      }

      setIsLoading(true);
      try {
        // Parse the search query for advanced syntax
        const filters = parseSearchQuery(searchQuery);

        // If there's a channel filter, add it
        if (channelFilter?.id) {
          filters.in = channelFilter.id;
        }

        const searchResults = await advancedSearch(filters, organisationId);
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [organisationId, channelFilter]
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
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatResults[selectedIndex]) {
        // If there's a selected result, open it
        onResultSelect(flatResults[selectedIndex]);
        onClose();
      } else if (query.trim()) {
        // If no result selected but there's a query, navigate to search results page
        navigate(`/search?q=${encodeURIComponent(query)}`);
        onClose();
      }
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
    switch (type) {
      case 'channel':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        );
      case 'user':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'message':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'file':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'canvas':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'conversation':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getResultTitle = (result: any) => {
    switch (result.type) {
      case 'channel':
        return `#${result.name}`;
      case 'user':
        return result.username || result.email;
      case 'message':
        return result.content.length > 60 ? `${result.content.substring(0, 60)}...` : result.content;
      case 'file':
        return result.filename || 'Untitled file';
      case 'canvas':
        return result.title;
      case 'conversation':
        return result.name;
      default:
        return 'Unknown';
    }
  };

  const getResultSubtitle = (result: any) => {
    switch (result.type) {
      case 'channel':
        return result.description || `${result.collaborators?.length || 0} members`;
      case 'user':
        return result.email;
      case 'message':
        return `in ${result.channel?.name || result.conversation?.name || 'conversation'}`;
      case 'file':
        const fileSize = result.length ? `${(result.length / 1024).toFixed(1)} KB` : '';
        const fileType = result.contentType ? ` • ${result.contentType.split('/')[1]?.toUpperCase() || 'File'}` : '';
        return `${fileSize}${fileType}`;
      case 'canvas':
        return `Created by ${result.createdBy?.username || 'Unknown'}`;
      case 'conversation':
        return 'Direct message';
      default:
        return '';
    }
  };

  const groupedResults = results
    ? [
        { title: 'Channels', items: results.channels },
        { title: 'People', items: results.users },
        { title: 'Messages', items: results.messages },
        { title: 'Files', items: results.files },
        { title: 'Workflows', items: results.canvases },
        { title: 'Direct Messages', items: results.conversations },
      ].filter((group) => group.items.length > 0)
    : [];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1d21] rounded-lg shadow-2xl w-full max-w-2xl max-h-[600px] flex flex-col border border-[#3f3f3f]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="p-4 border-b border-[#3f3f3f]">
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#d1d2d3]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              placeholder="Search across people, channels, files, workflows, and more"
              className="w-full bg-[#1a1d21] text-white placeholder-[#d1d2d3] pl-10 pr-10 py-3 rounded border border-[#3f3f3f] focus:border-white focus:outline-none text-[15px]"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#d1d2d3] hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {channelFilter && (
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#2c2d30] text-[#d1d2d3] text-xs rounded">
                Find in #{channelFilter.name}
              </span>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
            </div>
          )}

          {!isLoading && query && !results && (
            <div className="flex items-center justify-center py-8 text-[#d1d2d3]">
              <p>No results found</p>
            </div>
          )}

          {!isLoading && !query && (
            <div className="flex items-center justify-center py-8 text-[#d1d2d3]">
              <p>Start typing to search</p>
            </div>
          )}

          {!isLoading && results && groupedResults.length === 0 && (
            <div className="flex items-center justify-center py-8 text-[#d1d2d3]">
              <p>No results found for "{query}"</p>
            </div>
          )}

          {!isLoading && results && groupedResults.length > 0 && (
            <div className="py-2">
              {groupedResults.map((group, groupIndex) => (
                <div key={group.title} className={groupIndex > 0 ? 'mt-4' : ''}>
                  <div className="px-4 py-2 text-xs font-semibold text-[#d1d2d3] uppercase tracking-wider">
                    {group.title}
                  </div>
                  {group.items.map((item, itemIndex) => {
                    const globalIndex = flatResults.findIndex((r) => r._id === item._id);
                    const isSelected = globalIndex === selectedIndex;

                    return (
                      <button
                        key={item._id}
                        onClick={() => {
                          onResultSelect(item);
                          onClose();
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1164a3] transition-colors ${
                          isSelected ? 'bg-[#1164a3]' : ''
                        }`}
                      >
                        <div className="text-[#d1d2d3] shrink-0">{getResultIcon(item.type)}</div>
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-white text-sm font-medium truncate">{getResultTitle(item)}</div>
                          {getResultSubtitle(item) && (
                            <div className="text-[#d1d2d3] text-xs truncate">{getResultSubtitle(item)}</div>
                          )}
                        </div>
                        {isSelected && (
                          <div className="text-[#d1d2d3] text-xs shrink-0">Enter</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#3f3f3f] flex items-center justify-between text-xs text-[#d1d2d3]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#2c2d30] rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-[#2c2d30] rounded">↓</kbd>
              <span className="ml-1">Select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#2c2d30] rounded">Enter</kbd>
              <span className="ml-1">Open</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-[#2c2d30] rounded">Esc</kbd>
              <span className="ml-1">Close</span>
            </span>
          </div>
          <a href="#" className="text-[#1164a3] hover:underline">
            Give feedback
          </a>
        </div>
      </div>
    </div>
  );
};
