import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { getLists } from '../../services/listApi';
import type { ListData } from '../../types/list';
import CreateListModal from '../lists/CreateListModal';
import ListView from '../lists/ListView';

type ViewType = 'all' | 'canvases' | 'lists';

interface FilesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FilesPanel: React.FC<FilesPanelProps> = ({ isOpen }) => {
  const { currentWorkspaceId } = useWorkspace();
  const [activeView, setActiveView] = useState<ViewType>('all');
  const [lists, setLists] = useState<ListData[]>([]);
  const [filter, setFilter] = useState<'all' | 'created' | 'shared'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedList, setSelectedList] = useState<ListData | null>(null);

  useEffect(() => {
    if (isOpen && currentWorkspaceId) {
      fetchLists();
    }
  }, [isOpen, currentWorkspaceId]);

  const fetchLists = async () => {
    setIsLoading(true);
    try {
      const data = await getLists(currentWorkspaceId!);
      setLists(data);
    } catch (error) {
      console.error('Failed to fetch lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = (newList: ListData) => {
    setLists([newList, ...lists]);
    setIsCreateModalOpen(false);
  };

  const applyFilters = () => {
    let filtered = [...lists];

    if (filter === 'created') {
      // Filter by created by current user (you'll need to get userId from context)
      // filtered = filtered.filter((list) => list.createdBy._id === userId);
    } else if (filter === 'shared') {
      filtered = filtered.filter((list) => list.collaborators.length > 1);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (list) =>
          list.title.toLowerCase().includes(query) ||
          (list.description && list.description.toLowerCase().includes(query))
      );
    }

    // Sort by recently viewed
    filtered.sort((a, b) => {
      const aRecent = a.lastViewedBy?.[0]?.timestamp
        ? new Date(a.lastViewedBy[0].timestamp).getTime()
        : 0;
      const bRecent = b.lastViewedBy?.[0]?.timestamp
        ? new Date(b.lastViewedBy[0].timestamp).getTime()
        : 0;
      return bRecent - aRecent;
    });

    return filtered;
  };

  const filteredLists = applyFilters();

  if (!isOpen) return null;

  // If a list is selected, show the ListView
  if (selectedList) {
    return <ListView list={selectedList} onClose={() => setSelectedList(null)} />;
  }

  return (
    <>
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-[280px] bg-[#1a1d21] flex flex-col border-r border-gray-700">
          {/* Header */}
          <div className="h-[52px] px-4 flex items-center justify-between border-b border-gray-700">
            <h1 className="text-white text-lg font-bold">Files</h1>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <div className="px-4 py-2 border-b border-gray-700">
            <button
              onClick={() => setActiveView('all')}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded text-left transition-colors ${
                activeView === 'all'
                  ? 'bg-[#2c2d31] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>All files</span>
            </button>
            
            <button
              onClick={() => setActiveView('canvases')}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded text-left transition-colors ${
                activeView === 'canvases'
                  ? 'bg-[#2c2d31] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              <span>Canvases</span>
            </button>
            
            <button
              onClick={() => setActiveView('lists')}
              className={`w-full flex items-center gap-3 px-2 py-2 rounded text-left transition-colors ${
                activeView === 'lists'
                  ? 'bg-[#2c2d31] text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Lists</span>
            </button>
          </div>

          {/* Recently viewed */}
          <div className="px-4 py-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Recently viewed</h3>
            <div className="space-y-1">
              {lists.slice(0, 4).map((list) => (
                <button
                  key={list._id}
                  onClick={() => setSelectedList(list)}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-[#2c2d31] transition-colors"
                >
                  <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className="text-sm text-white truncate">{list.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Starred */}
          <div className="px-4 py-3 mt-auto">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Starred</h3>
            <p className="text-xs text-gray-500">
              Click the star on any canvas or list to add it here for later.
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#1a1d21] flex flex-col">
          {/* Header */}
          <div className="h-[52px] px-4 flex items-center justify-between border-b border-gray-700">
            <h2 className="text-white text-lg font-semibold">
              {activeView === 'lists' ? 'Lists' : activeView === 'canvases' ? 'Canvases' : 'All files'}
            </h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-full hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>New</span>
            </button>
          </div>

          {/* Search */}
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="relative">
              <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lists"
                className="w-full pl-10 pr-3 py-2 bg-[#2c2d31] border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#2c2d31] text-gray-300 hover:bg-[#3a3b40]'
                }`}
              >
                All Lists
              </button>
              <button
                onClick={() => setFilter('created')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filter === 'created'
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#2c2d31] text-gray-300 hover:bg-[#3a3b40]'
                }`}
              >
                Created by you
              </button>
              <button
                onClick={() => setFilter('shared')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filter === 'shared'
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#2c2d31] text-gray-300 hover:bg-[#3a3b40]'
                }`}
              >
                Shared with you
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <select className="px-3 py-1 bg-[#2c2d31] border border-gray-600 rounded text-sm text-white focus:outline-none">
                <option>Recently viewed</option>
                <option>Name</option>
                <option>Last updated</option>
              </select>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredLists.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <svg className="w-16 h-16 mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-lg mb-2">No lists found</p>
                <p className="text-sm">Create your first list or try a different search</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLists.map((list) => (
                  <button
                    key={list._id}
                    onClick={() => setSelectedList(list)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-gray-700 hover:bg-[#2c2d31] transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-yellow-500 rounded flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{list.title}</h3>
                      <p className="text-sm text-gray-400 truncate">
                        {list.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          Last viewed {list.lastViewedBy?.[0]?.timestamp ? 'today' : 'never'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      </button>
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        organisationId={currentWorkspaceId!}
      />
    </>
  );
};
