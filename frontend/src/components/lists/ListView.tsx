import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useAuth } from '../../context/AuthContext';
import { getList, updateList, createListItem, updateListItem, deleteListItem } from '../../services/listApi';
import type { ListData, ListItemData } from '../../types/list';

interface ListViewProps {
  list: ListData;
  onClose: () => void;
}

const ListView: React.FC<ListViewProps> = ({ list, onClose }) => {
  const { socket, currentWorkspaceId } = useWorkspace();
  const { user } = useAuth();
  const [items, setItems] = useState<ListItemData[]>(list.items || []);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [description, setDescription] = useState(list.description || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchListDetails();
    
    // Join list room for real-time updates
    if (socket && user?._id) {
      socket.emit('list-open', { listId: list._id, userId: user._id });
    }

    // Listen for real-time updates
    const handleItemCreate = (data: any) => {
      setItems((prev) => [...prev, data.newItem]);
    };

    const handleItemUpdate = (data: any) => {
      setItems((prev) =>
        prev.map((item) => (item._id === data.itemId ? data.item : item))
      );
    };

    const handleItemDelete = (data: any) => {
      setItems((prev) => prev.filter((item) => item._id !== data.itemId));
    };

    if (socket) {
      socket.on('list-item-create', handleItemCreate);
      socket.on('list-item-update', handleItemUpdate);
      socket.on('list-item-delete', handleItemDelete);
    }

    return () => {
      if (socket) {
        socket.off('list-item-create', handleItemCreate);
        socket.off('list-item-update', handleItemUpdate);
        socket.off('list-item-delete', handleItemDelete);
      }
    };
  }, [list._id, socket]);

  const fetchListDetails = async () => {
    setIsLoading(true);
    try {
      const data = await getList(list._id);
      setItems(data.items || []);
      setTitle(data.title);
      setDescription(data.description || '');
    } catch (error) {
      console.error('Failed to fetch list details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async () => {
    try {
      const newItem = await createListItem(list._id, {
        data: {},
        order: items.length,
      });
      
      if (socket) {
        socket.emit('list-item-create', {
          listId: list._id,
          item: newItem,
        });
      }
      
      setItems([...items, newItem]);
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleUpdateItem = async (itemId: string, columnId: string, value: any) => {
    try {
      const item = items.find((i) => i._id === itemId);
      if (!item) return;

      const updatedData = {
        ...item.data,
        [columnId]: value,
      };

      const updatedItem = await updateListItem(list._id, itemId, { data: updatedData });
      
      if (socket) {
        socket.emit('list-item-update', {
          listId: list._id,
          itemId: itemId,
          data: { data: updatedData },
        });
      }
      
      setItems((prev) =>
        prev.map((item) => (item._id === itemId ? updatedItem : item))
      );
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteListItem(list._id, itemId);
      
      if (socket) {
        socket.emit('list-item-delete', { listId: list._id, itemId });
      }
      
      setItems((prev) => prev.filter((item) => item._id !== itemId));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleSaveTitle = async () => {
    try {
      await updateList(list._id, { title });
      setIsEditingTitle(false);
      
      if (socket) {
        socket.emit('list-update', {
          listId: list._id,
          data: { title },
        });
      }
    } catch (error) {
      console.error('Failed to update title:', error);
    }
  };

  const handleSaveDescription = async () => {
    try {
      await updateList(list._id, { description });
      
      if (socket) {
        socket.emit('list-update', {
          listId: list._id,
          data: { description },
        });
      }
    } catch (error) {
      console.error('Failed to update description:', error);
    }
  };

  const renderCell = (item: ListItemData, column: any) => {
    const value = item.data[column.id];
    
    if (column.type === 'text') {
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => handleUpdateItem(item._id, column.id, e.target.value)}
          onBlur={() => {}}
          className="w-full px-2 py-1 bg-transparent text-white border-none focus:outline-none focus:ring-0"
        />
      );
    }
    
    if (column.type === 'enum' && column.options) {
      return (
        <select
          value={value || ''}
          onChange={(e) => handleUpdateItem(item._id, column.id, e.target.value)}
          className="px-2 py-1 bg-[#2c2d31] border border-gray-600 rounded text-white text-sm focus:outline-none"
        >
          <option value="">-</option>
          {column.options.map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }
    
    if (column.type === 'date') {
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => handleUpdateItem(item._id, column.id, e.target.value)}
          className="px-2 py-1 bg-[#2c2d31] border border-gray-600 rounded text-white text-sm focus:outline-none"
        />
      );
    }
    
    if (column.type === 'bool') {
      return (
        <input
          type="checkbox"
          checked={value || false}
          onChange={(e) => handleUpdateItem(item._id, column.id, e.target.checked)}
          className="w-4 h-4"
        />
      );
    }
    
    if (column.type === 'int') {
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => handleUpdateItem(item._id, column.id, parseInt(e.target.value) || 0)}
          className="px-2 py-1 bg-[#2c2d31] border border-gray-600 rounded text-white text-sm focus:outline-none"
        />
      );
    }
    
    return <span className="text-gray-400">-</span>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#1a1d21]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#1a1d21] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-700">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          {isEditingTitle ? (
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveTitle();
                }
              }}
              className="text-2xl font-bold bg-transparent text-white border-none focus:outline-none px-2 py-1 border border-transparent focus:border-blue-500"
              autoFocus
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="text-2xl font-bold text-white cursor-pointer hover:text-gray-300 px-2 py-1"
            >
              {title}
            </h1>
          )}
        </div>
        
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={handleSaveDescription}
          placeholder="Describe how your team plans to use this list"
          className="w-full px-2 py-1 bg-transparent text-white placeholder-gray-500 border-none focus:outline-none resize-none"
          rows={2}
        />
      </div>

      {/* Toolbar */}
      <div className="px-8 py-3 border-b border-gray-700 flex items-center gap-4">
        <button className="px-3 py-1.5 bg-[#2c2d31] text-white rounded text-sm flex items-center gap-2 hover:bg-[#3a3b40]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span>All items</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        <button className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        
        <button className="text-gray-400 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto px-8 py-4">
        <div className="border border-gray-700 rounded-lg overflow-hidden">
          {list.columns.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p>No columns defined. Add columns to start adding items.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-[#2c2d31] border-b border-gray-700">
                  {list.columns.map((column) => (
                    <th
                      key={column.id}
                      className="px-4 py-3 text-left text-sm font-semibold text-gray-300"
                    >
                      {column.name}
                    </th>
                  ))}
                  <th className="w-[40px]"></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={list.columns.length + 1} className="p-8 text-center text-gray-400">
                      No items yet. Click "Add item" to get started.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item._id} className="border-b border-gray-700 hover:bg-[#2c2d31]">
                      {list.columns.map((column) => (
                        <td key={column.id} className="px-4 py-2">
                          {renderCell(item, column)}
                        </td>
                      ))}
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleDeleteItem(item._id)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Add item button */}
        <button
          onClick={handleAddItem}
          className="mt-4 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add item</span>
        </button>
      </div>
    </div>
  );
};

export default ListView;

