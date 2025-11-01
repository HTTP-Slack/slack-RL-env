import { usePreferences, useUpdatePreferences } from '../PreferencesContext';
import { NotificationType } from '../types';

export function NotificationsSection() {
  const preferences = usePreferences();
  const updatePreferences = useUpdatePreferences();

  const handleNotificationTypeChange = (type: NotificationType) => {
    updatePreferences({
      notifications: {
        ...preferences.notifications,
        type,
      },
    });
  };

  const handleToggle = (field: keyof typeof preferences.notifications) => {
    updatePreferences({
      notifications: {
        ...preferences.notifications,
        [field]: !preferences.notifications[field],
      },
    });
  };

  const handleKeywordsChange = (keywords: string) => {
    updatePreferences({
      notifications: {
        ...preferences.notifications,
        keywords,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Notifications</h2>
        <p className="text-gray-400 text-sm">
          We strongly recommend enabling notifications so that you'll know when important activity happens in your Slack workspace.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
            </svg>
            Enable Desktop Notifications
          </button>
        </div>

        <div>
          <h3 className="text-white font-medium mb-3">Notify me about...</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="notification-type"
                checked={preferences.notifications.type === NotificationType.ALL_MESSAGES}
                onChange={() => handleNotificationTypeChange(NotificationType.ALL_MESSAGES)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">All new messages</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="notification-type"
                checked={preferences.notifications.type === NotificationType.DIRECT_MENTIONS_KEYWORDS}
                onChange={() => handleNotificationTypeChange(NotificationType.DIRECT_MENTIONS_KEYWORDS)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">Direct messages, mentions & keywords</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="notification-type"
                checked={preferences.notifications.type === NotificationType.NOTHING}
                onChange={() => handleNotificationTypeChange(NotificationType.NOTHING)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">Nothing</span>
            </label>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifications.differentMobileSettings}
              onChange={() => handleToggle('differentMobileSettings')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Use different settings for my mobile devices</span>
          </label>
        </div>

        <div className="border-t border-gray-700 pt-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifications.huddles}
              onChange={() => handleToggle('huddles')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Notify me when a huddle starts in one of my channels</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifications.threadReplies}
              onChange={() => handleToggle('threadReplies')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Notify me about replies to threads I'm following</span>
          </label>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-2">My keywords</h3>
          <p className="text-gray-400 text-sm mb-3">
            Show a badge ( 1 ) in my channel list when someone uses one of my keywords:
          </p>
          <textarea
            value={preferences.notifications.keywords}
            onChange={(e) => handleKeywordsChange(e.target.value)}
            placeholder="Enter keywords separated by commas"
            className="w-full h-24 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
          <p className="text-gray-500 text-xs mt-2">
            Use commas to separate each keyword. Keywords are not case sensitive.
          </p>
        </div>
      </div>
    </div>
  );
}

