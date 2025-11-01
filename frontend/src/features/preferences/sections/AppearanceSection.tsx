import { usePreferences, useUpdatePreferences } from '../PreferencesContext';
import { ColorMode, Theme, EmojiSkinTone } from '../types';

export function AppearanceSection() {
  const preferences = usePreferences();
  const updatePreferences = useUpdatePreferences();

  const handleToggle = (field: keyof typeof preferences.appearance) => {
    updatePreferences({
      appearance: {
        ...preferences.appearance,
        [field]: !preferences.appearance[field],
      },
    });
  };

  const handleColorModeChange = (mode: ColorMode) => {
    updatePreferences({
      appearance: {
        ...preferences.appearance,
        colorMode: mode,
      },
    });
  };

  const handleThemeChange = (theme: Theme) => {
    updatePreferences({
      appearance: {
        ...preferences.appearance,
        theme,
      },
    });
  };

  const handleSkinToneChange = (tone: EmojiSkinTone) => {
    updatePreferences({
      appearance: {
        ...preferences.appearance,
        emojiSkinTone: tone,
      },
    });
  };

  const themes = [
    { value: Theme.AUBERGINE, label: 'Aubergine', color: 'bg-purple-900' },
    { value: Theme.CLEMENTINE, label: 'Clementine', color: 'bg-orange-700' },
    { value: Theme.BANANA, label: 'Banana', color: 'bg-yellow-600' },
    { value: Theme.JADE, label: 'Jade', color: 'bg-green-700' },
    { value: Theme.LAGOON, label: 'Lagoon', color: 'bg-blue-700' },
    { value: Theme.BARBRA, label: 'Barbra', color: 'bg-red-800' },
    { value: Theme.GRAY, label: 'Gray', color: 'bg-gray-800' },
    { value: Theme.MOOD_INDIGO, label: 'Mood Indigo', color: 'bg-indigo-900' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Appearance</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-3">Font</h3>
          <select
            value={preferences.appearance.font}
            onChange={(e) => updatePreferences({
              appearance: { ...preferences.appearance, font: e.target.value }
            })}
            className="w-full max-w-md px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-purple-500"
          >
            <option>Lato (Default)</option>
            <option>Arial</option>
            <option>Helvetica</option>
            <option>Times New Roman</option>
          </select>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Color Mode</h3>
          <p className="text-gray-400 text-sm mb-3">
            Choose if Slack's appearance should be light or dark, or follow your computer's settings.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => handleColorModeChange(ColorMode.LIGHT)}
              className={`flex-1 px-4 py-3 rounded border-2 transition-colors ${
                preferences.appearance.colorMode === ColorMode.LIGHT
                  ? 'border-blue-500 bg-blue-900/30'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <svg className="w-6 h-6 mx-auto mb-1 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-200 text-sm">Light</span>
            </button>
            <button
              onClick={() => handleColorModeChange(ColorMode.DARK)}
              className={`flex-1 px-4 py-3 rounded border-2 transition-colors ${
                preferences.appearance.colorMode === ColorMode.DARK
                  ? 'border-blue-500 bg-blue-900/30'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <svg className="w-6 h-6 mx-auto mb-1 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
              <span className="text-gray-200 text-sm">Dark</span>
            </button>
            <button
              onClick={() => handleColorModeChange(ColorMode.SYSTEM)}
              className={`flex-1 px-4 py-3 rounded border-2 transition-colors ${
                preferences.appearance.colorMode === ColorMode.SYSTEM
                  ? 'border-blue-500 bg-blue-900/30'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
            >
              <svg className="w-6 h-6 mx-auto mb-1 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-200 text-sm">System</span>
            </button>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Slack themes</h3>
          <h4 className="text-gray-200 text-sm mb-3">Single color</h4>
          <div className="grid grid-cols-3 gap-3">
            {themes.map((theme) => (
              <button
                key={theme.value}
                onClick={() => handleThemeChange(theme.value)}
                className={`flex items-center gap-3 p-3 rounded border-2 transition-colors ${
                  preferences.appearance.theme === theme.value
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${theme.color}`}></div>
                <span className="text-gray-200 text-sm">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4 space-y-3">
          <h3 className="text-white font-medium mb-3">Additional options</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.appearance.displayTypingIndicator}
              onChange={() => handleToggle('displayTypingIndicator')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Display information about who is currently typing a message</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.appearance.displayColorSwatches}
              onChange={() => handleToggle('displayColorSwatches')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Display color swatches next to hexadecimal values</span>
          </label>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Emoji</h3>
          <h4 className="text-gray-200 text-sm mb-2">Default Skin Tone</h4>
          <p className="text-gray-400 text-xs mb-3">
            Choose the default skin tone that will be used whenever you use certain emojis in reactions and messages.
          </p>
          <div className="flex gap-2 mb-4">
            {[
              { value: EmojiSkinTone.DEFAULT, emoji: '👋' },
              { value: EmojiSkinTone.LIGHT, emoji: '👋🏻' },
              { value: EmojiSkinTone.MEDIUM_LIGHT, emoji: '👋🏼' },
              { value: EmojiSkinTone.MEDIUM, emoji: '👋🏽' },
              { value: EmojiSkinTone.MEDIUM_DARK, emoji: '👋🏾' },
              { value: EmojiSkinTone.DARK, emoji: '👋🏿' },
            ].map((tone) => (
              <button
                key={tone.value}
                onClick={() => handleSkinToneChange(tone.value)}
                className={`w-12 h-12 rounded border-2 text-2xl transition-colors ${
                  preferences.appearance.emojiSkinTone === tone.value
                    ? 'border-blue-500 bg-blue-900/30'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
              >
                {tone.emoji}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.appearance.displayEmojiAsText}
                onChange={() => handleToggle('displayEmojiAsText')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Display emoji as plain text</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.appearance.showJumbomoji}
                onChange={() => handleToggle('showJumbomoji')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <div>
                <div className="text-gray-200">Show JUMBOMOJI</div>
                <div className="text-gray-400 text-xs">Display the jumbo versions of emoji (up to 23 at a time!) in messages without text.</div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.appearance.convertEmoticons}
                onChange={() => handleToggle('convertEmoticons')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200 flex items-center gap-1">
                Convert my typed emoticons to emoji, so :D becomes 😀
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.appearance.showOneClickReactions}
                onChange={() => handleToggle('showOneClickReactions')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Show one-click reactions on messages</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

