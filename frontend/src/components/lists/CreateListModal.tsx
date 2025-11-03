import React, { useState, useEffect } from 'react';
import { createList, getTemplates } from '../../services/listApi';
import type { ListData, ListTemplate } from '../../types/list';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (list: ListData) => void;
  organisationId: string;
}

const CreateListModal: React.FC<CreateListModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  organisationId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ListTemplate | null>(null);
  const [templates, setTemplates] = useState<ListTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  const fetchTemplates = async () => {
    try {
      const data = await getTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!organisationId) {
      setError('Workspace not loaded. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newList = await createList({
        title: title.trim(),
        description: description.trim() || undefined,
        organisationId,
        columns: selectedTemplate?.columns || [],
        template: selectedTemplate?.id || undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setSelectedTemplate(null);

      onSuccess(newList);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setSelectedTemplate(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#1a1d21] rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Create new List</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled list"
                className="w-full px-3 py-2 bg-[#2c2d31] border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe how your team plans to use this list"
                rows={3}
                className="w-full px-3 py-2 bg-[#2c2d31] border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Template (optional)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-3 rounded border-2 text-left transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-600 bg-[#2c2d31] hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{template.icon}</span>
                      <span className="font-medium text-white">{template.name}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-sm">{error}</div>
            )}
          </div>

          <div className="p-4 border-t border-gray-700 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 bg-[#2c2d31] text-white rounded hover:bg-[#3a3b40] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListModal;

