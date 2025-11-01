import { useEffect, useState } from 'react';
import { useProfile } from './ProfileContext';

export function EditProfileModal() {
  const { isEditModalOpen, closeEditModal } = useProfile();
  const [fullName, setFullName] = useState('aban hasan');
  const [displayName, setDisplayName] = useState('');
  const [title, setTitle] = useState('');
  const [namePronunciation, setNamePronunciation] = useState('');
  const [timeZone, setTimeZone] = useState('(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditModalOpen) {
        closeEditModal();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isEditModalOpen, closeEditModal]);

  const handleSave = () => {
    // TODO: Save profile changes
    closeEditModal();
  };

  const handleCancel = () => {
    closeEditModal();
  };

  if (!isEditModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={closeEditModal}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#1a1d21] rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1d21] border-b border-gray-700 p-6 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-white">Edit your profile</h2>
          <button
            onClick={closeEditModal}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close edit profile modal"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex gap-8">
            {/* Left Column - Form Fields */}
            <div className="flex-1 space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0d1117] border-2 border-blue-500 rounded text-white focus:outline-none focus:border-blue-400"
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Display name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Display name"
                  className="w-full px-4 py-2 bg-[#0d1117] border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  This could be your first name, or a nickname — however you'd like people to refer to you in Slack.
                </p>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full px-4 py-2 bg-[#0d1117] border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Let people know what you do at HTTP Test Environment.
                </p>
              </div>

              {/* Name Recording */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Name recording
                </label>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0d1117] border border-gray-600 rounded text-white hover:bg-gray-800 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">Record Audio Clip</span>
                </button>
              </div>

              {/* Name Pronunciation */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Name pronunciation
                </label>
                <input
                  type="text"
                  value={namePronunciation}
                  onChange={(e) => setNamePronunciation(e.target.value)}
                  placeholder="Zoe (pronounced 'zo-ee')"
                  className="w-full px-4 py-2 bg-[#0d1117] border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  This could be a phonetic pronunciation, or an example of something your name sounds like.
                </p>
              </div>

              {/* Time Zone */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Time zone
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => setTimeZone(e.target.value)}
                  className="w-full px-4 py-2 bg-[#0d1117] border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi">
                    (UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi
                  </option>
                  <option value="(UTC-08:00) Pacific Time (US & Canada)">
                    (UTC-08:00) Pacific Time (US & Canada)
                  </option>
                  <option value="(UTC-05:00) Eastern Time (US & Canada)">
                    (UTC-05:00) Eastern Time (US & Canada)
                  </option>
                  <option value="(UTC+00:00) London">
                    (UTC+00:00) London
                  </option>
                  <option value="(UTC+01:00) Paris, Berlin">
                    (UTC+01:00) Paris, Berlin
                  </option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Your current time zone. Used to send summary and notification emails, for times in your activity feeds, and for reminders.
                </p>
              </div>
            </div>

            {/* Right Column - Profile Photo */}
            <div className="w-64">
              <label className="block text-sm font-semibold text-white mb-2">
                Profile photo
              </label>
              <div
                className="w-full aspect-square rounded bg-gradient-to-br from-orange-600 to-orange-800 flex items-center justify-center text-white text-8xl font-semibold mb-4"
                aria-label="Profile photo placeholder"
              >
                a
              </div>
              <button className="w-full px-4 py-2 bg-white hover:bg-gray-100 text-gray-900 rounded font-medium mb-2 transition-colors">
                Upload Photo
              </button>
              <button className="w-full px-4 py-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                Remove Photo
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#1a1d21] border-t border-gray-700 p-6 flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-transparent border border-gray-600 text-white rounded hover:bg-gray-800 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors font-medium"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

