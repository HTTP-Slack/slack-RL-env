import React, { useState } from 'react';
import { createChannel } from '../../services/channelApi';
import { useWorkspace } from '../../context/WorkspaceContext';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  organisationId: string;
}

export const CreateChannelModal: React.FC<CreateChannelModalProps> = ({
  isOpen,
  onClose,
  organisationId,
}) => {
  const [channelName, setChannelName] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { sections, setSections } = useWorkspace();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) {
      setError('Channel name is required');
      return;
    }

    if (!selectedSectionId) {
      setError('Please select a section');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await createChannel({
        name: channelName,
        organisationId,
        sectionId: selectedSectionId,
      });

      // Update the sections with the new channel
      const updatedSections = sections.map((section) => {
        if (section._id === selectedSectionId) {
          return {
            ...section,
            channels: [...section.channels, response.data],
          };
        }
        return section;
      });
      setSections(updatedSections);

      setChannelName('');
      setSelectedSectionId('');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create channel');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] max-w-[90vw]">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Create a channel</h2>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4">
          <div className="mb-4">
            <label htmlFor="channelName" className="block text-sm font-medium text-gray-700 mb-2">
              Channel name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">#</span>
              <input
                type="text"
                id="channelName"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g., marketing"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                autoFocus
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
              Section
            </label>
            <select
              id="section"
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
            >
              <option value="">Select a section...</option>
              {sections.map((section) => (
                <option key={section._id} value={section._id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

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
