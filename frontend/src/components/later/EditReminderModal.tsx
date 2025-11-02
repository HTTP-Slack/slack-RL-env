import React, { useState, useEffect } from 'react';
import { updateLaterItem } from '../../services/laterApi';
import type { ILaterItem } from '../../types/later';

interface EditReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: ILaterItem) => void;
  item: ILaterItem | null;
}

const EditReminderModal: React.FC<EditReminderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  item,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || '');
      // Format date for datetime-local input
      if (item.dueDate) {
        const date = new Date(item.dueDate);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        setDueDate(localDate.toISOString().slice(0, 16));
      } else {
        setDueDate('');
      }
    }
  }, [item]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item) return;

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updatedItem = await updateLaterItem(item._id, {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || null,
      });

      onSuccess(updatedItem);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update reminder');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-[560px] max-w-[90vw]">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-[22px] font-bold text-gray-900">Edit reminder</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="edit-title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to remember?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              autoFocus
              disabled={isLoading}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 resize-none"
              disabled={isLoading}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="edit-dueDate" className="block text-sm font-medium text-gray-700 mb-2">
              Due date (optional)
            </label>
            <input
              type="datetime-local"
              id="edit-dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              disabled={isLoading}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded font-medium transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#611f69] text-white rounded font-medium hover:bg-[#4a174f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReminderModal;
