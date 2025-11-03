import React, { useState, useEffect } from 'react';
import { getLists } from '../../services/listApi';
import type { ListData } from '../../types/list';
import CreateListModal from './CreateListModal';

interface AttachListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (listId: string) => void;
  organisationId: string;
}

type FilterType = 'all' | 'shared' | 'created';
type SortType = 'recently-viewed' | 'last-updated' | 'name';

const AttachListModal: React.FC<AttachListModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  organisationId,
}) => {
  const [lists, setLists] = useState<ListData[]>([]);
  const [filteredLists, setFilteredLists] = useState<ListData[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('recently-viewed');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && organisationId) {
      fetchLists();
    }
  }, [isOpen, organisationId]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [lists, filter, sort, searchQuery]);

  const fetchLists = async () => {
    setIsLoading(true);
    try {
      const data = await getLists(organisationId);
      setLists(data);
    } catch (error) {
      console.error('Failed to fetch lists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...lists];

    // Apply filter
    if (filter === 'shared') {
      filtered = filtered.filter((list) => list.collaborators.length > 1);
    } else if (filter === 'created') {
      // You would need to get current user ID from context
      // For now, just filter by having the user in collaborators
      filtered = filtered.filter((list) => list.collaborators.length > 0);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (list) =>
          list.title.toLowerCase().includes(query) ||
          (list.description && list.description.toLowerCase().includes(query))
      );
    }

    // Apply sort
    if (sort === 'recently-viewed') {
      filtered.sort((a, b) => {
        const aRecent = a.lastViewedBy?.[0]?.timestamp
          ? new Date(a.lastViewedBy[0].timestamp).getTime()
          : 0;
        const bRecent = b.lastViewedBy?.[0]?.timestamp
          ? new Date(b.lastViewedBy[0].timestamp).getTime()
          : 0;
        return bRecent - aRecent;
      });
    } else if (sort === 'last-updated') {
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sort === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredLists(filtered);
  };

  const handleSelect = (listId: string) => {
    setSelectedList(listId);
  };

  const handleInsert = () => {
    if (selectedList) {
      onSelect(selectedList);
      onClose();
    }
  };

  const handleCreateSuccess = (newList: ListData) => {
    setLists([newList, ...lists]);
    setSelectedList(newList._id);
    setIsCreateModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-[#1a1d21] rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Attach a List</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-4 border-b border-gray-700">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by List name or keyword"
              className="w-full px-3 py-2 bg-[#2c2d31] border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-between p-4 border-b border-gray-700">
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
                onClick={() => setFilter('shared')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  filter === 'shared'
                    ? 'bg-blue-500 text-white'
                    : 'bg-[#2c2d31] text-gray-300 hover:bg-[#3a3b40]'
                }`}
              >
                Shared with you
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
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="px-3 py-1 bg-[#2c2d31] border border-gray-600 rounded text-sm text-white focus:outline-none focus:border-blue-500"
              >
                <option value="recently-viewed">Recently viewed</option>
                <option value="last-updated">Last updated</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredLists.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <p className="text-lg mb-2">No lists found</p>
                <p className="text-sm">Create a new list or try a different search</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLists.map((list) => (
                  <button
                    key={list._id}
                    onClick={() => handleSelect(list._id)}
                    className={`w-full p-3 rounded-lg border-2 transition-colors text-left ${
                      selectedList === list._id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-transparent hover:bg-[#2c2d31]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white truncate">{list.title}</h3>
                        {list.description && (
                          <p className="text-sm text-gray-400 truncate">{list.description}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-700 flex items-center justify-between">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-[#2c2d31] border border-gray-600 text-white rounded hover:bg-[#3a3b40] transition-colors"
            >
              Create new List
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#2c2d31] border border-gray-600 text-white rounded hover:bg-[#3a3b40] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInsert}
                disabled={!selectedList}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      </div>

      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        organisationId={organisationId}
      />
    </>
  );
};

export default AttachListModal;

