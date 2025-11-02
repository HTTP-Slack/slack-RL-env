import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { advancedSearch } from '../../services/searchApi';
import { parseSearchQuery, buildSearchQuery } from '../../utils/searchParser';
import { SearchTypeFilter, type SearchType } from '../../components/search/SearchTypeFilter';
import { FromFilter } from '../../components/search/FromFilter';
import { InFilter } from '../../components/search/InFilter';
import { SortDropdown, type SortOption } from '../../components/search/SortDropdown';
import type { SearchResults as SearchResultsType, SearchResult } from '../../types/search';
import type { SearchFilters } from '../../utils/searchParser';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';

export const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentWorkspaceId } = useWorkspace();

  const queryFromUrl = searchParams.get('q') || '';
  const [query, setQuery] = useState(queryFromUrl);
  const [filters, setFilters] = useState<SearchFilters>(parseSearchQuery(queryFromUrl));
  const [results, setResults] = useState<SearchResultsType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<SearchType>('messages');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('relevant');
  const [onlyMyChannels, setOnlyMyChannels] = useState(false);
  const [excludeAutomations, setExcludeAutomations] = useState(false);

  // Perform search when query or filters change
  useEffect(() => {
    if (query && currentWorkspaceId) {
      performSearch();
    }
  }, [query, currentWorkspaceId, selectedUser, selectedChannel]);

  const performSearch = async () => {
    if (!currentWorkspaceId) return;

    setIsLoading(true);
    try {
      const parsedFilters = parseSearchQuery(query);

      // Apply additional filters from UI controls
      if (selectedUser) {
        parsedFilters.from = selectedUser;
      }
      if (selectedChannel) {
        parsedFilters.in = selectedChannel;
      }

      setFilters(parsedFilters);
      const searchResults = await advancedSearch(parsedFilters, currentWorkspaceId, 50);
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    setSearchParams({ q: newQuery });
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    const newQuery = buildSearchQuery(updatedFilters);
    handleSearch(newQuery);
  };

  const handleFromSelect = (userId: string | null, username: string | null) => {
    setSelectedUser(userId);
    if (userId && username) {
      handleFilterChange({ from: username });
    } else {
      const { from, ...rest } = filters;
      setFilters(rest);
      handleSearch(buildSearchQuery(rest));
    }
  };

  const handleInSelect = (channelId: string | null, channelName: string | null) => {
    setSelectedChannel(channelId);
    if (channelId && channelName) {
      handleFilterChange({ in: channelName });
    } else {
      const { in: _, ...rest } = filters;
      setFilters(rest);
      handleSearch(buildSearchQuery(rest));
    }
  };

  const totalResults = results
    ? results.users.length +
      results.channels.length +
      results.messages.length +
      results.files.length +
      results.canvases.length +
      results.conversations.length
    : 0;

  const sortResults = <T extends SearchResult>(items: T[]): T[] => {
    if (sortOption === 'newest') {
      return [...items].sort((a, b) => {
        const getDate = (item: SearchResult) => {
          if ('createdAt' in item) return new Date(item.createdAt).getTime();
          if ('uploadDate' in item) return new Date(item.uploadDate).getTime();
          return 0;
        };
        return getDate(b) - getDate(a);
      });
    } else if (sortOption === 'oldest') {
      return [...items].sort((a, b) => {
        const getDate = (item: SearchResult) => {
          if ('createdAt' in item) return new Date(item.createdAt).getTime();
          if ('uploadDate' in item) return new Date(item.uploadDate).getTime();
          return 0;
        };
        return getDate(a) - getDate(b);
      });
    }
    return items; // Most relevant (default) - keep original order
  };

  const getFilteredResults = () => {
    if (!results) return null;

    let filtered: SearchResultsType;

    switch (selectedType) {
      case 'messages':
        filtered = { ...results, users: [], channels: [], files: [], canvases: [], conversations: [] };
        break;
      case 'dms':
        filtered = { ...results, users: [], channels: [], messages: [], files: [], canvases: [] };
        break;
      case 'files':
        filtered = { ...results, users: [], channels: [], messages: [], canvases: [], conversations: [] };
        break;
      case 'people':
        filtered = { ...results, channels: [], messages: [], files: [], canvases: [], conversations: [] };
        break;
      case 'channels':
        filtered = { ...results, users: [], messages: [], files: [], canvases: [], conversations: [] };
        break;
      case 'canvases':
        filtered = { ...results, users: [], channels: [], messages: [], files: [], conversations: [] };
        break;
      default:
        filtered = results;
    }

    // Apply sorting
    return {
      ...filtered,
      messages: sortResults(filtered.messages),
      files: sortResults(filtered.files),
      users: filtered.users, // Users don't need date sorting
      channels: filtered.channels, // Channels don't need date sorting
      canvases: sortResults(filtered.canvases),
      conversations: filtered.conversations,
    };
  };

  const filteredResults = getFilteredResults();
  const resultCounts = {
    messages: results?.messages.length || 0,
    dms: results?.conversations.length || 0,
    files: results?.files.length || 0,
    people: results?.users.length || 0,
    channels: results?.channels.length || 0,
    canvases: results?.canvases.length || 0,
  };

  const handleResultClick = (result: SearchResult) => {
    // Navigate back to dashboard and handle the result
    if (result.type === 'channel') {
      navigate(`/dashboard?workspace=${currentWorkspaceId}&channel=${result._id}`);
    } else if (result.type === 'file') {
      const fileUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/files/${result._id}`;
      window.open(fileUrl, '_blank');
    }
    // Add more navigation logic as needed
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1d21] text-white">
      {/* Header */}
      <div className="h-14 bg-[#350d36] flex items-center px-4 shrink-0 border-b border-[#3f3f3f]">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-1.5 hover:bg-[#6f4d72] rounded transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold">Search: "{query}"</h1>
        <button
          onClick={() => navigate(`/dashboard?workspace=${currentWorkspaceId}`)}
          className="ml-auto text-[#1164a3] hover:underline text-sm"
        >
          Give feedback
        </button>
      </div>

      {/* Search Filters Bar */}
      <div className="bg-[#1a1d21] border-b border-[#3f3f3f] px-4 py-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type Filter */}
          <SearchTypeFilter
            selected={selectedType}
            onSelect={setSelectedType}
            results={resultCounts}
          />

          {/* From Filter */}
          <FromFilter
            selectedUser={selectedUser}
            onSelect={handleFromSelect}
            users={results?.users || []}
            currentUserId={user?._id}
          />

          {/* In Filter */}
          <InFilter
            selectedChannel={selectedChannel}
            onSelect={handleInSelect}
            channels={results?.channels || []}
          />

          {/* Only my channels checkbox */}
          <label className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors ${
            onlyMyChannels ? 'bg-[#1164a3] text-white' : 'bg-[#2c2d30] hover:bg-[#3f3f3f]'
          }`}>
            <input
              type="checkbox"
              checked={onlyMyChannels}
              onChange={(e) => setOnlyMyChannels(e.target.checked)}
              className="rounded"
            />
            Only my channels
          </label>

          {/* Exclude automations checkbox */}
          <label className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm cursor-pointer transition-colors ${
            excludeAutomations ? 'bg-[#1164a3] text-white' : 'bg-[#2c2d30] hover:bg-[#3f3f3f]'
          }`}>
            <input
              type="checkbox"
              checked={excludeAutomations}
              onChange={(e) => setExcludeAutomations(e.target.checked)}
              className="rounded"
            />
            Exclude automations
          </label>

          {/* Sort Dropdown */}
          <div className="ml-auto">
            <SortDropdown selected={sortOption} onSelect={setSortOption} />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}

        {!isLoading && totalResults === 0 && query && (
          <div className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Nothing turned up</h2>
            <p className="text-[#d1d2d3] text-center mb-2">
              You may want to try using different keywords, checking for
            </p>
            <p className="text-[#d1d2d3] text-center mb-4">
              typos, or adjusting your filters.{' '}
              <a href="#" className="text-[#1164a3] hover:underline">
                Learn more about search
              </a>
            </p>
            <p className="text-[#d1d2d3]">
              Not the results you expected?{' '}
              <a href="#" className="text-[#1164a3] hover:underline">
                Give feedback
              </a>
            </p>
          </div>
        )}

        {!isLoading && filteredResults && totalResults > 0 && (
          <div>
            <div className="mb-4 text-sm text-[#d1d2d3]">
              {selectedType === 'messages' && `${resultCounts.messages} result${resultCounts.messages !== 1 ? 's' : ''}`}
              {selectedType === 'dms' && `${resultCounts.dms} result${resultCounts.dms !== 1 ? 's' : ''}`}
              {selectedType === 'files' && `${resultCounts.files} result${resultCounts.files !== 1 ? 's' : ''}`}
              {selectedType === 'people' && `${resultCounts.people} result${resultCounts.people !== 1 ? 's' : ''}`}
              {selectedType === 'channels' && `${resultCounts.channels} result${resultCounts.channels !== 1 ? 's' : ''}`}
              {selectedType === 'canvases' && `${resultCounts.canvases} result${resultCounts.canvases !== 1 ? 's' : ''}`}
            </div>

            {/* Messages */}
            {filteredResults.messages.length > 0 && (
              <div className="mb-6">
                {filteredResults.messages.map((message) => (
                  <div
                    key={message._id}
                    className="mb-4 p-4 bg-[#2c2d30] hover:bg-[#3f3f3f] rounded cursor-pointer transition-colors"
                    onClick={() => handleResultClick(message)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-[#1164a3] rounded flex items-center justify-center text-white font-semibold">
                        {message.sender?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="font-semibold">{message.sender?.username || 'Unknown'}</span>
                          <span className="text-xs text-[#d1d2d3]">
                            {message.channel ? `in #${message.channel.name}` : 'Direct Message'}
                          </span>
                          <span className="text-xs text-[#d1d2d3]">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-[#d1d2d3]">{message.content}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Files */}
            {filteredResults.files.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-[#d1d2d3] uppercase">Files</h3>
                {filteredResults.files.map((file) => (
                  <div
                    key={file._id}
                    className="mb-3 p-4 bg-[#2c2d30] hover:bg-[#3f3f3f] rounded cursor-pointer transition-colors"
                    onClick={() => handleResultClick(file)}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-8 h-8 text-[#d1d2d3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <div className="flex-1">
                        <div className="font-medium">{file.filename}</div>
                        <div className="text-sm text-[#d1d2d3]">
                          {(file.length / 1024).toFixed(1)} KB • {file.contentType}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* People/Users */}
            {filteredResults.users.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-[#d1d2d3] uppercase">People</h3>
                {filteredResults.users.map((user) => (
                  <div
                    key={user._id}
                    className="mb-3 p-4 bg-[#2c2d30] hover:bg-[#3f3f3f] rounded cursor-pointer transition-colors"
                    onClick={() => handleResultClick(user)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[#1164a3] rounded flex items-center justify-center text-white font-semibold">
                        {user.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-[#d1d2d3]">{user.email}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Channels */}
            {filteredResults.channels.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-[#d1d2d3] uppercase">Channels</h3>
                {filteredResults.channels.map((channel) => (
                  <div
                    key={channel._id}
                    className="mb-3 p-4 bg-[#2c2d30] hover:bg-[#3f3f3f] rounded cursor-pointer transition-colors"
                    onClick={() => handleResultClick(channel)}
                  >
                    <div className="font-medium">#{channel.name}</div>
                    <div className="text-sm text-[#d1d2d3]">{channel.description}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Conversations/DMs */}
            {filteredResults.conversations.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-[#d1d2d3] uppercase">Direct Messages</h3>
                {filteredResults.conversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    className="mb-3 p-4 bg-[#2c2d30] hover:bg-[#3f3f3f] rounded cursor-pointer transition-colors"
                    onClick={() => handleResultClick(conversation)}
                  >
                    <div className="font-medium">{conversation.name}</div>
                    <div className="text-sm text-[#d1d2d3]">Direct message</div>
                  </div>
                ))}
              </div>
            )}

            {/* Canvases */}
            {filteredResults.canvases.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-[#d1d2d3] uppercase">Canvases</h3>
                {filteredResults.canvases.map((canvas) => (
                  <div
                    key={canvas._id}
                    className="mb-3 p-4 bg-[#2c2d30] hover:bg-[#3f3f3f] rounded cursor-pointer transition-colors"
                    onClick={() => handleResultClick(canvas)}
                  >
                    <div className="font-medium">{canvas.title}</div>
                    <div className="text-sm text-[#d1d2d3]">
                      Created by {canvas.createdBy?.username || 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
