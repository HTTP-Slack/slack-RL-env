import React, { useState } from 'react';
import { createLaterItem } from '../../services/laterApi';
import type { ILaterItem } from '../../types/later';

interface CreateReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (item: ILaterItem) => void;
  organisationId: string;
}

const CreateReminderModal: React.FC<CreateReminderModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  organisationId,
}) => {
  const [whenOption, setWhenOption] = useState('today');
  const [time, setTime] = useState('17:45');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (!organisationId) {
      setError('Workspace not loaded. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Calculate due date based on when option and time
      const dueDate = calculateDueDate(whenOption, time);

      const newItem = await createLaterItem({
        title: description.trim().split('\n')[0].substring(0, 100), // First line as title
        description: description.trim(),
        dueDate: dueDate,
        organisationId,
      });

      // Reset form
      setWhenOption('today');
      setTime('17:45');
      setDescription('');

      onSuccess(newItem);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create reminder');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDueDate = (when: string, timeStr: string): string => {
    const now = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);

    let targetDate = new Date(now);

    switch (when) {
      case 'today':
        break;
      case 'tomorrow':
        targetDate.setDate(targetDate.getDate() + 1);
        break;
      case 'next-week':
        targetDate.setDate(targetDate.getDate() + 7);
        break;
      case 'custom':
        // For now, default to today
        break;
    }

    targetDate.setHours(hours, minutes, 0, 0);
    return targetDate.toISOString();
  };

  const handleClose = () => {
    setWhenOption('today');
    setTime('17:45');
    setDescription('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#1a1d21] rounded-lg shadow-2xl w-[700px] max-w-[90vw] border border-[#3b2d3e]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#3b2d3e] flex items-center justify-between">
          <h2 className="text-white text-[28px] font-bold">Reminder</h2>
          <button
            onClick={handleClose}
            className="text-[#868686] hover:text-white transition-colors"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5">
          {error && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-600/50 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* When and Time Row */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            {/* When */}
            <div>
              <label className="block text-white text-[15px] font-medium mb-2">
                When
              </label>
              <div className="relative">
                <select
                  value={whenOption}
                  onChange={(e) => setWhenOption(e.target.value)}
                  className="w-full px-3 py-2.5 pl-10 bg-[#1a1d21] border border-[#3b2d3e] rounded text-white text-[15px] appearance-none cursor-pointer hover:border-[#868686] focus:outline-none focus:border-[#1164a3] transition-colors"
                  disabled={isLoading}
                >
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="next-week">Next week</option>
                  <option value="custom">Custom</option>
                </select>
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#868686] pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#868686] pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Time */}
            <div>
              <label className="block text-white text-[15px] font-medium mb-2">
                Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2.5 pl-10 bg-[#1a1d21] border border-[#3b2d3e] rounded text-white text-[15px] hover:border-[#868686] focus:outline-none focus:border-[#1164a3] transition-colors [color-scheme:dark]"
                  disabled={isLoading}
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#868686] pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-white text-[15px] font-medium mb-2">
              Description
            </label>
            <div className="border border-[#3b2d3e] rounded overflow-hidden hover:border-[#868686] focus-within:border-[#1164a3] transition-colors">
              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 px-2 py-2 bg-[#0d0f11] border-b border-[#3b2d3e]">
                <button type="button" className="p-1.5 text-[#868686] hover:bg-[#1a1d21] rounded" title="Bold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                  </svg>
                </button>
                <button type="button" className="p-1.5 text-[#868686] hover:bg-[#1a1d21] rounded italic" title="Italic">
                  <span className="text-sm font-serif">I</span>
                </button>
                <button type="button" className="p-1.5 text-[#868686] hover:bg-[#1a1d21] rounded" title="Underline">
                  <span className="text-sm underline">U</span>
                </button>
                <button type="button" className="p-1.5 text-[#868686] hover:bg-[#1a1d21] rounded" title="Strikethrough">
                  <span className="text-sm line-through">S</span>
                </button>
                <div className="w-px h-5 bg-[#3b2d3e] mx-1"></div>
                <button type="button" className="p-1.5 text-[#868686] hover:bg-[#1a1d21] rounded" title="Link">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </button>
                <button type="button" className="p-1.5 text-[#868686] hover:bg-[#1a1d21] rounded" title="Ordered List">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6h9M12 12h9M12 18h9M3 6h.01M3 12h.01M3 18h.01" />
                  </svg>
                </button>
                <button type="button" className="p-1.5 text-[#868686] hover:bg-[#1a1d21] rounded" title="Bullet List">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="4" cy="6" r="2" />
                    <circle cx="4" cy="12" r="2" />
                    <circle cx="4" cy="18" r="2" />
                    <path d="M9 6h12M9 12h12M9 18h12" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                  </svg>
                </button>
                <button type="button" className="p-1.5 text-[#868686] hover:bg-[#1a1d21] rounded" title="Indent">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button type="button" className="p-1.5 text-[#868686] hover:bg-[#1a1d21] rounded" title="Code">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </button>
                <button type="button" className="p-1.5 text-[#868686] hover:bg-[#1a1d21] rounded" title="Code Block">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              {/* Text Area */}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Remind me to..."
                rows={4}
                className="w-full px-4 py-3 bg-[#1a1d21] text-white text-[15px] placeholder-[#868686] focus:outline-none resize-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-white bg-transparent border border-[#3b2d3e] rounded font-medium hover:bg-[#211125] transition-colors text-[15px]"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#007a5a] text-white rounded font-medium hover:bg-[#006d4f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReminderModal;
