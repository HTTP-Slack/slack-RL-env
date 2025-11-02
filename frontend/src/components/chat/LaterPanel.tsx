import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import InProgressTab from '../later/InProgressTab';
import ArchivedTab from '../later/ArchivedTab';
import CompletedTab from '../later/CompletedTab';
import CreateReminderModal from '../later/CreateReminderModal';
import EditReminderModal from '../later/EditReminderModal';
import { getLaterItems } from '../../services/laterApi';
import type { ILaterItem, LaterItemStatus } from '../../types/later';

type TabType = 'in-progress' | 'archived' | 'completed';

interface LaterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LaterPanel: React.FC<LaterPanelProps> = ({ isOpen }) => {
  const { currentWorkspaceId } = useWorkspace();
  const [activeTab, setActiveTab] = useState<TabType>('in-progress');
  const [items, setItems] = useState<ILaterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ILaterItem | null>(null);

  // Fetch items when workspace changes or panel opens
  useEffect(() => {
    if (isOpen && currentWorkspaceId) {
      fetchItems();
    }
  }, [isOpen, currentWorkspaceId]);

  const fetchItems = async () => {
    if (!currentWorkspaceId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log('Fetching later items for workspace:', currentWorkspaceId);
      const allItems = await getLaterItems(currentWorkspaceId);
      console.log('Fetched later items:', allItems);
      setItems(allItems);
    } catch (error) {
      console.error('Failed to fetch later items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSuccess = (newItem: ILaterItem) => {
    setItems((prev) => [newItem, ...prev]);
  };

  const handleUpdate = (updatedItem: ILaterItem) => {
    setItems((prev) =>
      prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
    );
  };

  const handleDelete = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item._id !== itemId));
  };

  const handleEdit = (item: ILaterItem) => {
    setItemToEdit(item);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = (updatedItem: ILaterItem) => {
    handleUpdate(updatedItem);
    setItemToEdit(null);
  };

  const filterItemsByStatus = (status: LaterItemStatus) => {
    return items.filter((item) => item.status === status);
  };

  const tabButtonClass = (tab: TabType) =>
    `pb-2.5 px-2.5 text-[13px] font-normal border-b-2 transition-colors ${
      activeTab === tab
        ? 'text-white border-white'
        : 'text-[#9d8aa7] border-transparent hover:text-white'
    }`;

  if (!isOpen) return null;

  return (
    <>
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Later Sidebar */}
        <div className="w-[550px] bg-linear-to-b from-[#211125] to-[#180d1b] flex flex-col shrink-0 border-r border-[#3b2d3e]">
          {/* Header */}
          <div className="h-[52px] px-4 flex items-center justify-between border-b border-[#3b2d3e]">
            <div className="flex items-center gap-3">
              <h1 className="text-white text-[18px] font-bold">Later</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1.5 hover:bg-[#4a2b4e] rounded transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (!currentWorkspaceId) {
                    console.error('No workspace ID available');
                    return;
                  }
                  setIsCreateModalOpen(true);
                }}
                disabled={!currentWorkspaceId}
                className="p-1.5 hover:bg-[#4a2b4e] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={!currentWorkspaceId ? 'Loading workspace...' : 'Create a new reminder'}
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-0 px-5 pt-2.5 border-b border-[#3b2d3e]">
            <button
              onClick={() => setActiveTab('in-progress')}
              className={tabButtonClass('in-progress')}
            >
              In progress
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={tabButtonClass('archived')}
            >
              Archived
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={tabButtonClass('completed')}
            >
              Completed
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'in-progress' && (
              <InProgressTab
                items={filterItemsByStatus('in-progress')}
                onCreateReminder={() => setIsCreateModalOpen(true)}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isLoading={isLoading}
              />
            )}
            {activeTab === 'archived' && (
              <ArchivedTab
                items={filterItemsByStatus('archived')}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isLoading={isLoading}
              />
            )}
            {activeTab === 'completed' && (
              <CompletedTab
                items={filterItemsByStatus('completed')}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onEdit={handleEdit}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>

        {/* Right Panel - Illustration Area */}
        <div className="flex-1 bg-[#1a1d21] flex items-center justify-center">
          <div className="relative" style={{ width: '280px', height: '200px' }}>
            {/* Purple Stacked Layers Illustration */}
            <svg viewBox="0 0 280 200" className="w-full h-full" style={{ filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.3))' }}>
              {/* Bottom dark purple layer */}
              <path
                d="M 60 120 L 210 120 Q 220 120 220 130 L 220 175 Q 220 185 210 185 L 60 185 Q 50 185 50 175 L 50 130 Q 50 120 60 120 Z"
                fill="#6B4B7F"
              />
              {/* Middle medium purple layer */}
              <path
                d="M 90 80 L 240 80 Q 250 80 250 90 L 250 145 Q 250 155 240 155 L 90 155 Q 80 155 80 145 L 80 90 Q 80 80 90 80 Z"
                fill="#8B5A9E"
              />
              {/* Top light purple layer */}
              <path
                d="M 50 40 L 200 40 Q 210 40 210 50 L 210 115 Q 210 125 200 125 L 50 125 Q 40 125 40 115 L 40 50 Q 40 40 50 40 Z"
                fill="#C4A3D4"
              />
              {/* Top edge highlight */}
              <path
                d="M 50 40 L 200 40 Q 210 40 210 50 L 210 55 Q 210 60 200 60 L 50 60 Q 40 60 40 55 L 40 50 Q 40 40 50 40 Z"
                fill="#D4BFE3"
                opacity="0.8"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateReminderModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
        organisationId={currentWorkspaceId || ''}
      />

      <EditReminderModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setItemToEdit(null);
        }}
        onSuccess={handleEditSuccess}
        item={itemToEdit}
      />
    </>
  );
};
