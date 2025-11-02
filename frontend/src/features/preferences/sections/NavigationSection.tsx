import { usePreferences, useUpdatePreferences } from '../PreferencesContext';
import { NavigationTabAppearance } from '../types';

export function NavigationSection() {
  const preferences = usePreferences();
  const updatePreferences = useUpdatePreferences();

  const handleToggle = (field: keyof typeof preferences.navigation) => {
    updatePreferences({
      navigation: {
        ...preferences.navigation,
        [field]: !preferences.navigation[field],
      },
    });
  };

  const handleAppearanceChange = (appearance: NavigationTabAppearance) => {
    updatePreferences({
      navigation: {
        ...preferences.navigation,
        tabAppearance: appearance,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Navigation</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-3">Show these tabs in the navigation bar:</h3>
          <p className="text-gray-400 text-xs mb-3">
            At smaller window sizes, not all selected tabs may appear.
          </p>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.navigation.showHome}
                onChange={() => handleToggle('showHome')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Home
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.navigation.showDMs}
                onChange={() => handleToggle('showDMs')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                  <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                </svg>
                DMs
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.navigation.showActivity}
                onChange={() => handleToggle('showActivity')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
                Activity
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.navigation.showFiles}
                onChange={() => handleToggle('showFiles')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
                Files
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.navigation.showTools}
                onChange={() => handleToggle('showTools')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Tools
              </span>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Navigation Tab Appearance</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="tab-appearance"
                checked={preferences.navigation.tabAppearance === NavigationTabAppearance.ICONS_AND_TEXT}
                onChange={() => handleAppearanceChange(NavigationTabAppearance.ICONS_AND_TEXT)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">Icons & text</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="tab-appearance"
                checked={preferences.navigation.tabAppearance === NavigationTabAppearance.ICONS_ONLY}
                onChange={() => handleAppearanceChange(NavigationTabAppearance.ICONS_ONLY)}
                className="w-4 h-4 text-purple-600"
              />
              <div>
                <div className="text-gray-200">Icons only</div>
                <div className="text-gray-400 text-xs">Makes navigation tabs smaller, and automatically turns off numerical badges.</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

