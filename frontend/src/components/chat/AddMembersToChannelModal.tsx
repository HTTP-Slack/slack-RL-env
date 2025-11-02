import React, { useState } from 'react';
import { addUsersToChannel } from '../../services/channelApi';

interface AddMembersToChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelId: string;
  channelName: string;
  onMembersAdded?: () => void;
}

const AddMembersToChannelModal: React.FC<AddMembersToChannelModalProps> = ({
  isOpen,
  onClose,
  channelId,
  channelName,
  onMembersAdded,
}) => {
  const [emails, setEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Parse emails - split by comma, newline, or space
    const emailArray = emails
      .split(/[,\n\s]+/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emailArray.length === 0) {
      setError('Please enter at least one email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emailArray.filter((email) => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      setError(`Invalid email(s): ${invalidEmails.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      await addUsersToChannel(channelId, emailArray);
      setEmails('');
      onMembersAdded?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add members');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmails('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1a1d21] rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgb(49,48,44)]">
          <h2 className="text-[22px] font-bold text-white">
            Add people to #{channelName}
          </h2>
          <button
            onClick={handleClose}
            className="text-[rgb(209,210,211)] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <label htmlFor="emails" className="block text-[15px] font-semibold text-white mb-2">
              Email addresses
            </label>
            <textarea
              id="emails"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Enter email addresses (comma or line separated)"
              className="w-full px-3 py-2 bg-[rgb(26,29,33)] border border-[rgb(134,134,134)] rounded text-white placeholder-[rgb(134,134,134)] focus:outline-none focus:border-white resize-none"
              rows={4}
              disabled={loading}
            />
            <p className="mt-2 text-[13px] text-[rgb(134,134,134)]">
              Enter one or more email addresses separated by commas, spaces, or line breaks.
            </p>

            {error && (
              <div className="mt-3 px-3 py-2 bg-red-900 bg-opacity-20 border border-red-700 rounded">
                <p className="text-[13px] text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgb(49,48,44)]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded text-[15px] font-medium text-white hover:bg-[rgb(49,48,44)] transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#007a5a] hover:bg-[#006644] rounded text-[15px] font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Members'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMembersToChannelModal;
