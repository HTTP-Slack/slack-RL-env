import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWorkspace } from '../context/WorkspaceContext';
import { getWorkspaces } from '../services/workspaceApi';
import LeftNav from '../components/chat/LeftNav';
import InProgressTab from '../components/later/InProgressTab';
import ArchivedTab from '../components/later/ArchivedTab';
import CompletedTab from '../components/later/CompletedTab';
import CreateReminderModal from '../components/later/CreateReminderModal';
import EditReminderModal from '../components/later/EditReminderModal';
import { getLaterItems } from '../services/laterApi';
import type { ILaterItem, LaterItemStatus } from '../types/later';

type TabType = 'in-progress' | 'archived' | 'completed';

const LaterView: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { currentWorkspaceId, setCurrentWorkspaceId } = useWorkspace();
  const [activeTab, setActiveTab] = useState<TabType>('in-progress');
  const [items, setItems] = useState<ILaterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<ILaterItem | null>(null);

  console.log('LaterView - currentWorkspaceId:', currentWorkspaceId);
  console.log('LaterView - isLoading:', isLoading);
  console.log('LaterView - items count:', items.length);
  console.log('LaterView - isCreateModalOpen:', isCreateModalOpen);

  // Initialize workspace from URL or fetch workspaces
  useEffect(() => {
    const initWorkspace = async () => {
      const workspaceIdFromUrl = searchParams.get('workspace');

      console.log('🔍 LaterView: Fetching workspaces...');
      const workspaces = await getWorkspaces();
      console.log('📦 LaterView: Found workspaces:', workspaces.length);

      if (workspaceIdFromUrl) {
        console.log('🏢 LaterView: Setting workspace from URL:', workspaceIdFromUrl);
        setCurrentWorkspaceId(workspaceIdFromUrl);
      } else if (workspaces.length > 0) {
        // Select the first workspace and add to URL
        console.log('🏢 LaterView: Setting first workspace:', workspaces[0]._id);
        setCurrentWorkspaceId(workspaces[0]._id);
        navigate(`/later?workspace=${workspaces[0]._id}`, { replace: true });
      } else {
        // No workspaces found
        console.log('⚠️ LaterView: No workspaces found');
        setIsLoading(false);
      }
    };

    if (user) {
      initWorkspace();
    }
  }, [user, searchParams, navigate, setCurrentWorkspaceId]);

  // Fetch items when workspace changes
  useEffect(() => {
    if (currentWorkspaceId) {
      fetchItems();
    } else {
      setIsLoading(false);
    }
  }, [currentWorkspaceId]);

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

  const workspaceName = localStorage.getItem('selectedWorkspaceName') || undefined;

  const tabButtonClass = (tab: TabType) =>
    `pb-2 px-1 text-[15px] font-medium border-b-2 transition-colors ${
      activeTab === tab
        ? 'text-[#d1d2d3] border-[#d1d2d3]'
        : 'text-[#868686] border-transparent hover:text-[#d1d2d3]'
    }`;

  return (
    <div className="flex h-screen bg-[#1a1d21]">
      {/* Left Navigation */}
      <LeftNav workspaceName={workspaceName} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 px-5 py-3 border-b border-[#3b2d3e] flex items-center justify-between">
          <h1 className="text-white text-[22px] font-bold">Later</h1>
          <button
            onClick={() => {
              console.log('New button clicked!');
              console.log('Current workspace ID:', currentWorkspaceId);
              if (!currentWorkspaceId) {
                console.error('No workspace ID available');
                return;
              }
              setIsCreateModalOpen(true);
            }}
            disabled={!currentWorkspaceId}
            className="px-4 py-1.5 bg-transparent border border-[#868686] text-white rounded text-[13px] hover:bg-[#302234] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={!currentWorkspaceId ? 'Loading workspace...' : 'Create a new reminder'}
          >
            + New
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-6 px-5 py-3 border-b border-[#3b2d3e]">
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
    </div>
  );
};

export default LaterView;
