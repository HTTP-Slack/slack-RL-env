import { usePreferences, useUpdatePreferences } from '../PreferencesContext';

export function AccessibilitySection() {
  const preferences = usePreferences();
  const updatePreferences = useUpdatePreferences();

  const handleToggle = (field: keyof typeof preferences.accessibility) => {
    updatePreferences({
      accessibility: {
        ...preferences.accessibility,
        [field]: !preferences.accessibility[field],
      },
    });
  };

  const handleMessageFormatChange = (format: 'sender_message_date' | 'sender_date_message') => {
    updatePreferences({
      accessibility: {
        ...preferences.accessibility,
        messageFormat: format,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Accessibility</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-3">Simplified layout mode</h3>
          <p className="text-gray-400 text-sm mb-3">
            Use this mode to simplify layouts and minimize distractions. Single-taskers and assistive technology users may find this especially useful.
          </p>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded">
            Turn On
          </button>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Links</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.accessibility.underlineLinks}
              onChange={() => handleToggle('underlineLinks')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Underline links to websites</span>
          </label>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Tab previews</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.accessibility.tabPreviews}
              onChange={() => handleToggle('tabPreviews')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Enable previews when using a mouse to hover over items in the tab bar</span>
          </label>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Animation</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.accessibility.autoPlayAnimations}
              onChange={() => handleToggle('autoPlayAnimations')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <div>
              <div className="text-gray-200">Automatically play animations in Slack</div>
              <div className="text-gray-400 text-xs">Including animated GIFs, emojis, and in-product animation.</div>
            </div>
          </label>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Screen reader</h3>
          <p className="text-gray-400 text-sm mb-3">Customize your screen reader experience</p>
          <div className="space-y-3">
            <div>
              <h4 className="text-gray-200 mb-2">Message format</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="message-format"
                    checked={preferences.accessibility.messageFormat === 'sender_message_date'}
                    onChange={() => handleMessageFormatChange('sender_message_date')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-gray-200">Sender, message, and then date and time</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="message-format"
                    checked={preferences.accessibility.messageFormat === 'sender_date_message'}
                    onChange={() => handleMessageFormatChange('sender_date_message')}
                    className="w-4 h-4 text-purple-600"
                  />
                  <span className="text-gray-200">Sender, date and time, and then message</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Huddles announcements</h3>
          <p className="text-gray-400 text-sm mb-3">
            Choose what announcements you'd like to receive while using a screen reader inside of a huddle
          </p>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.accessibility.readEmojiReactions}
                onChange={() => handleToggle('readEmojiReactions')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Read emoji reactions out loud</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.accessibility.playEmojiSound}
                onChange={() => handleToggle('playEmojiSound')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Play a sound when an emoji is sent or received</span>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Conversation message announcements</h3>
          <p className="text-gray-400 text-sm mb-3">
            Choose which announcements you'd like to receive while using a screen reader inside a conversation's message.
          </p>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.accessibility.announceIncomingMessages}
              onChange={() => handleToggle('announceIncomingMessages')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Announce incoming messages from the conversation</span>
          </label>
        </div>
      </div>
    </div>
  );
}

