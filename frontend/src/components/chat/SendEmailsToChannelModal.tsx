import React, { useState } from 'react';

interface SendEmailsToChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelName: string;
}

const SendEmailsToChannelModal: React.FC<SendEmailsToChannelModalProps> = ({
  isOpen,
  onClose,
  channelName,
}) => {
  const [loading, setLoading] = useState(false);
  const [emailAddress, setEmailAddress] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGetEmailAddress = async () => {
    setLoading(true);
    try {
      // TODO: Implement API call to get email address for channel
      // const response = await getChannelEmailAddress(channelId);
      // setEmailAddress(response.email);
      
      // For now, simulate getting an email address
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEmailAddress(`${channelName.toLowerCase().replace(/[^a-z0-9]/g, '')}@slack.example.com`);
    } catch (error) {
      console.error('Failed to get email address:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[rgb(26,29,33)] rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(121,124,129,0.3)]">
          <div className="flex items-center gap-2">
            <h2 className="text-[22px] font-bold text-white">
              Send emails to #{channelName}
            </h2>
            <span className="px-2 py-0.5 bg-[rgb(97,31,105)] text-white text-[11px] font-bold rounded uppercase">
              PRO
            </span>
          </div>
          <button
            onClick={onClose}
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
        <div className="px-6 py-4">
          {emailAddress ? (
            <div>
              <p className="text-[15px] text-[rgb(209,210,211)] mb-4">
                Emails sent to this email address will be posted in the #{channelName} channel.
              </p>
              <div className="bg-[rgb(49,48,44)] border border-[rgba(121,124,129,0.3)] rounded px-3 py-2 mb-4">
                <p className="text-[15px] font-mono text-white break-all">
                  {emailAddress}
                </p>
              </div>
              <a
                href="#"
                className="text-[rgb(97,192,250)] hover:underline text-[15px]"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Show help modal or navigate to help page
                }}
              >
                How to use this address.
              </a>
            </div>
          ) : (
            <>
              <p className="text-[15px] text-[rgb(209,210,211)] mb-4">
                Emails sent to this email address will be posted in the #{channelName} channel.
              </p>
              <a
                href="#"
                className="text-[rgb(97,192,250)] hover:underline text-[15px] block mb-6"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Show help modal or navigate to help page
                }}
              >
                How to use this address.
              </a>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[rgba(121,124,129,0.3)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-[6px] bg-[rgb(26,29,33)] border border-[rgba(121,124,129,0.3)] text-[15px] font-medium text-white hover:bg-[rgb(49,48,44)] transition-colors"
          >
            Close
          </button>
          {!emailAddress && (
            <button
              type="button"
              onClick={handleGetEmailAddress}
              className="px-4 py-2 rounded-[6px] bg-[#007a5a] hover:bg-[#006644] text-[15px] font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Getting...' : 'Get Email Address'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendEmailsToChannelModal;

