import { usePreferences, useUpdatePreferences } from '../PreferencesContext';

export function MessagesMediaSection() {
  const preferences = usePreferences();
  const updatePreferences = useUpdatePreferences();

  const handleToggle = (field: keyof typeof preferences.messagesMedia) => {
    updatePreferences({
      messagesMedia: {
        ...preferences.messagesMedia,
        [field]: !preferences.messagesMedia[field],
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Messages & media</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-3">Inline media & links</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.messagesMedia.showImagesFiles}
                onChange={() => handleToggle('showImagesFiles')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Show images and files uploaded to Slack</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.messagesMedia.showImagesLinked}
                onChange={() => handleToggle('showImagesLinked')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Show images and files from linked websites</span>
            </label>
            {preferences.messagesMedia.showImagesLinked && (
              <label className="flex items-center gap-3 cursor-pointer ml-7">
                <input
                  type="checkbox"
                  checked={preferences.messagesMedia.showImagesLarge}
                  onChange={() => handleToggle('showImagesLarge')}
                  className="w-4 h-4 rounded text-purple-600"
                />
                <span className="text-gray-200">Even if they're larger than 20MB</span>
              </label>
            )}
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.messagesMedia.showTextPreviews}
                onChange={() => handleToggle('showTextPreviews')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Show text previews of linked websites</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

