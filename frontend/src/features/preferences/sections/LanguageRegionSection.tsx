import { usePreferences, useUpdatePreferences } from '../PreferencesContext';

export function LanguageRegionSection() {
  const preferences = usePreferences();
  const updatePreferences = useUpdatePreferences();

  const handleLanguageChange = (language: string) => {
    updatePreferences({
      languageRegion: {
        ...preferences.languageRegion,
        language,
      },
    });
  };

  const handleTimezoneChange = (timezone: string) => {
    updatePreferences({
      languageRegion: {
        ...preferences.languageRegion,
        timezone,
      },
    });
  };

  const handleAutoTimezoneToggle = () => {
    updatePreferences({
      languageRegion: {
        ...preferences.languageRegion,
        autoTimezone: !preferences.languageRegion.autoTimezone,
      },
    });
  };

  const handleSpellcheckToggle = () => {
    updatePreferences({
      languageRegion: {
        ...preferences.languageRegion,
        spellcheck: !preferences.languageRegion.spellcheck,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Language & region</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-3">Language</h3>
          <select
            value={preferences.languageRegion.language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full max-w-md px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-purple-500"
          >
            <option>English (US)</option>
            <option>English (UK)</option>
            <option>Español</option>
            <option>Français</option>
            <option>Deutsch</option>
          </select>
          <p className="text-gray-400 text-sm mt-2">
            Choose the language you'd like to use with Slack.
          </p>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Time zone</h3>
          <label className="flex items-center gap-3 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={preferences.languageRegion.autoTimezone}
              onChange={handleAutoTimezoneToggle}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Set time zone automatically</span>
          </label>
          <select
            value={preferences.languageRegion.timezone}
            onChange={(e) => handleTimezoneChange(e.target.value)}
            disabled={preferences.languageRegion.autoTimezone}
            className="w-full max-w-md px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-purple-500 disabled:opacity-50"
          >
            <option>(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
            <option>(UTC-08:00) Pacific Time (US & Canada)</option>
            <option>(UTC-05:00) Eastern Time (US & Canada)</option>
            <option>(UTC+00:00) London, Dublin</option>
            <option>(UTC+01:00) Paris, Berlin, Rome</option>
          </select>
          <p className="text-gray-400 text-sm mt-2">
            Slack uses your time zone to send summary and notification emails, for times in your activity feeds, and for reminders.
          </p>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Keyboard layout</h3>
          <select
            value={preferences.languageRegion.keyboardLayout}
            onChange={(e) => updatePreferences({
              languageRegion: { ...preferences.languageRegion, keyboardLayout: e.target.value }
            })}
            className="w-full max-w-md px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-purple-500"
          >
            <option>English (US)</option>
            <option>English (UK)</option>
            <option>QWERTZ</option>
            <option>AZERTY</option>
          </select>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Spellcheck</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.languageRegion.spellcheck}
              onChange={handleSpellcheckToggle}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Enable spellcheck on your messages and canvases</span>
          </label>
        </div>
      </div>
    </div>
  );
}

