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
      <div className="bg-[rgb(26,29,33)] rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(121,124,129,0.3)]">
          <div>
            <h2 className="text-[22px] font-bold text-white">
              Add people to #{channelName}
            </h2>
            <p className="text-[15px] text-[rgb(209,210,211)] mt-1">
              #{channelName}
            </p>
          </div>
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
            <div className="relative">
              <input
                id="emails"
                type="text"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="ex. Nathalie, or james@acme.com"
                className="w-full px-3 py-2 pr-20 bg-[rgb(26,29,33)] border-2 border-[rgb(97,192,250)] rounded text-white placeholder-[rgb(134,134,134)] focus:outline-none focus:border-[rgb(97,192,250)]"
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-[rgb(49,48,44)] hover:bg-[rgb(61,60,56)] border border-[rgba(121,124,129,0.3)] rounded text-[15px] font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !emails.trim()}
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>

            {error && (
              <div className="mt-3 px-3 py-2 bg-red-900 bg-opacity-20 border border-red-700 rounded">
                <p className="text-[13px] text-red-400">{error}</p>
              </div>
            )}
          </div>
        </form>

        {/* Slack Connect PRO Section */}
        <div className="px-6 py-4 border-t border-[rgba(121,124,129,0.3)] bg-[rgb(26,29,33)]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[15px] text-[rgb(209,210,211)]">Try Slack Connect</span>
            <span className="px-2 py-0.5 bg-[rgb(97,31,105)] text-white text-[11px] font-bold rounded uppercase">
              PRO
            </span>
          </div>
          <p className="text-[13px] text-[rgb(209,210,211)]">
            Working with external people? Simply type their email above.{' '}
            <a
              href="#"
              className="text-[rgb(97,192,250)] hover:underline"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Navigate to help page or show info
              }}
            >
              Learn more
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AddMembersToChannelModal;
