import { usePreferences, useUpdatePreferences } from '../PreferencesContext';
import { MarkAsReadBehavior } from '../types';

export function MarkAsReadSection() {
  const preferences = usePreferences();
  const updatePreferences = useUpdatePreferences();

  const handleBehaviorChange = (behavior: MarkAsReadBehavior) => {
    updatePreferences({
      markAsRead: {
        ...preferences.markAsRead,
        behavior,
      },
    });
  };

  const handleToggle = () => {
    updatePreferences({
      markAsRead: {
        ...preferences.markAsRead,
        promptOnMarkAll: !preferences.markAsRead.promptOnMarkAll,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Mark as read</h2>
        <p className="text-gray-400 text-sm">
          Slack marks a channel read as soon as you view it. You can change this if you'd like.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-3">When I view a channel:</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="mark-behavior"
                checked={preferences.markAsRead.behavior === MarkAsReadBehavior.START_WHERE_LEFT}
                onChange={() => handleBehaviorChange(MarkAsReadBehavior.START_WHERE_LEFT)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">Start me where I left off, and mark the channel read</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="mark-behavior"
                checked={preferences.markAsRead.behavior === MarkAsReadBehavior.START_NEWEST_MARK}
                onChange={() => handleBehaviorChange(MarkAsReadBehavior.START_NEWEST_MARK)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">Start me at the newest message, and mark the channel read</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="mark-behavior"
                checked={preferences.markAsRead.behavior === MarkAsReadBehavior.START_NEWEST_LEAVE}
                onChange={() => handleBehaviorChange(MarkAsReadBehavior.START_NEWEST_LEAVE)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">Start me at the newest message, but leave unseen messages unread</span>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">When I mark everything as read:</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.markAsRead.promptOnMarkAll}
              onChange={handleToggle}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Prompt to confirm</span>
          </label>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Keyboard shortcuts</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-200">Mark all messages in current channel as read</span>
              <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">Esc</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-200">Mark all messages as read</span>
              <div className="flex gap-1">
                <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">Shift</span>
                <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">Esc</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-200">Mark a message as unread</span>
              <div className="flex gap-1">
                <span className="px-2 py-1 bg-gray-700 rounded text-gray-300">Option</span>
                <span className="text-gray-400">and click message</span>
              </div>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-3">
            And that's just the beginning. To view the full list of keyboard shortcuts, just press{' '}
            <span className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">⌘</span> +{' '}
            <span className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">/</span>
          </p>
        </div>
      </div>
    </div>
  );
}

