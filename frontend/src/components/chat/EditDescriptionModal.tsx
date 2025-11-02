import React, { useState, useEffect } from 'react';
import type { IChannel } from '../../types/channel';
import { updateChannelDescription } from '../../services/channelApi';

interface EditDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: IChannel;
  onDescriptionUpdated?: () => void;
}

const EditDescriptionModal: React.FC<EditDescriptionModalProps> = ({
  isOpen,
  onClose,
  channel,
  onDescriptionUpdated,
}) => {
  const [description, setDescription] = useState(channel.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDescription(channel.description || '');
      setError('');
    }
  }, [isOpen, channel.description]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateChannelDescription(channel._id, description);
      onDescriptionUpdated?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update description');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDescription(channel.description || '');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[rgb(26,29,33)] rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(121,124,129,0.3)]">
          <h2 className="text-[22px] font-bold text-white">
            Edit description
          </h2>
          <button
            onClick={handleClose}
            className="text-[rgb(209,210,211)] hover:text-white transition-colors w-6 h-6 flex items-center justify-center"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description"
              className="w-full px-3 py-2 bg-[rgb(26,29,33)] border-2 border-[rgb(97,192,250)] rounded text-white placeholder-[rgb(134,134,134)] focus:outline-none focus:border-[rgb(97,192,250)] resize-none min-h-[100px]"
              rows={4}
              disabled={loading}
              autoFocus
            />
            <p className="mt-2 text-[13px] text-[rgb(209,210,211)]">
              Let people know what this channel is for.
            </p>

            {error && (
              <div className="mt-3 px-3 py-2 bg-red-900 bg-opacity-20 border border-red-700 rounded">
                <p className="text-[13px] text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgba(121,124,129,0.3)]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-[6px] bg-[rgb(26,29,33)] border border-[rgba(121,124,129,0.3)] text-[15px] font-medium text-white hover:bg-[rgb(49,48,44)] transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-[6px] bg-[#007a5a] hover:bg-[#006644] text-[15px] font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDescriptionModal;

