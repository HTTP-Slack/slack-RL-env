import React, { useState } from 'react';
import { createSection } from '../../services/sectionApi';
import { useWorkspace } from '../../context/WorkspaceContext';

interface CreateSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  organisationId: string;
}

export const CreateSectionModal: React.FC<CreateSectionModalProps> = ({
  isOpen,
  onClose,
  organisationId,
}) => {
  const [sectionName, setSectionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { sections, setSections } = useWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim()) {
      setError('Section name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newSection = await createSection(sectionName, organisationId);
      setSections([...sections, newSection]);
      setSectionName('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create section');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-w-[90vw]">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create a new section</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label htmlFor="sectionName" className="block text-sm font-medium text-gray-700 mb-2">
              Section name
            </label>
            <input
              type="text"
              id="sectionName"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="e.g., Marketing, Engineering"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
              autoFocus
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
