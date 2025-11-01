import { usePreferences, useUpdatePreferences, useResetPreferences } from '../PreferencesContext';
import { PreferencesStorage } from '../storage';
import { SearchSortDefault } from '../types';
import { useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';

export function AdvancedSection() {
  const preferences = usePreferences();
  const updatePreferences = useUpdatePreferences();
  const resetPreferences = useResetPreferences();
  const [importError, setImportError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleToggle = (field: keyof typeof preferences.advanced) => {
    updatePreferences({
      advanced: {
        ...preferences.advanced,
        [field]: !preferences.advanced[field],
      },
    });
  };

  const handleEnterBehaviorChange = (behavior: 'send' | 'newline') => {
    updatePreferences({
      advanced: {
        ...preferences.advanced,
        enterBehavior: behavior,
      },
    });
  };

  const handleSearchShortcutChange = (shortcut: 'cmd_f' | 'cmd_k') => {
    updatePreferences({
      advanced: {
        ...preferences.advanced,
        searchShortcut: shortcut,
      },
    });
  };

  const handleSortDefaultChange = (sort: SearchSortDefault) => {
    updatePreferences({
      advanced: {
        ...preferences.advanced,
        searchSortDefault: sort,
      },
    });
  };

  const handleExport = () => {
    const json = PreferencesStorage.export();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'slack-preferences.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const imported = PreferencesStorage.import(text);
          if (imported) {
            setImportError(null);
            // Force reload to apply imported preferences
            window.location.reload();
          } else {
            setImportError('Invalid preferences file format');
          }
        } catch (error) {
          setImportError('Failed to import preferences');
        }
      }
    };
    input.click();
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    resetPreferences();
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Advanced</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-3">Input options</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.advanced.whenTypingCodeEnterShouldNotSend}
                onChange={() => handleToggle('whenTypingCodeEnterShouldNotSend')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <div>
                <div className="text-gray-200">
                  When typing code with ```, <span className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Enter</span> should not send the message.
                </div>
                <div className="text-gray-400 text-xs">
                  With this checked use <span className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Shift</span>{' '}
                  <span className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Enter</span> to send.
                </div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.advanced.formatMessagesWithMarkup}
                onChange={() => handleToggle('formatMessagesWithMarkup')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <div>
                <div className="text-gray-200">Format messages with markup</div>
                <div className="text-gray-400 text-xs">The text formatting toolbar won't show in the composer.</div>
              </div>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">When writing a message, press <span className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Enter</span> to...</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="enter-behavior"
                checked={preferences.advanced.enterBehavior === 'send'}
                onChange={() => handleEnterBehaviorChange('send')}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">Send the message</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="enter-behavior"
                checked={preferences.advanced.enterBehavior === 'newline'}
                onChange={() => handleEnterBehaviorChange('newline')}
                className="w-4 h-4 text-purple-600"
              />
              <div>
                <div className="text-gray-200">
                  Start a new line (use <span className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">⌘</span>{' '}
                  <span className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Enter</span> to send)
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Search options</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="search-shortcut"
                checked={preferences.advanced.searchShortcut === 'cmd_f'}
                onChange={() => handleSearchShortcutChange('cmd_f')}
                className="w-4 h-4 text-purple-600"
              />
              <div>
                <div>
                  <span className="px-1 py-0.5 bg-gray-700 rounded text-gray-300 mr-1">Cmd</span>
                  <span className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">F</span>
                  <span className="text-gray-200 ml-2">starts a Slack search</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">Overrides normal browser search behavior</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="search-shortcut"
                checked={preferences.advanced.searchShortcut === 'cmd_k'}
                onChange={() => handleSearchShortcutChange('cmd_k')}
                className="w-4 h-4 text-purple-600"
              />
              <div>
                <div>
                  <span className="px-1 py-0.5 bg-gray-700 rounded text-gray-300 mr-1">Cmd</span>
                  <span className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">K</span>
                  <span className="text-gray-200 ml-2">starts the Quick Switcher</span>
                </div>
                <p className="text-gray-400 text-xs mt-1">Overrides normal behavior in some browsers</p>
              </div>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Exclude these channels from search results:</h3>
          <input
            type="text"
            placeholder="Type a channel name..."
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Sort option default:</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="sort-default"
                checked={preferences.advanced.searchSortDefault === SearchSortDefault.MOST_RELEVANT}
                onChange={() => handleSortDefaultChange(SearchSortDefault.MOST_RELEVANT)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">Most relevant</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="sort-default"
                checked={preferences.advanced.searchSortDefault === SearchSortDefault.LAST_USED}
                onChange={() => handleSortDefaultChange(SearchSortDefault.LAST_USED)}
                className="w-4 h-4 text-purple-600"
              />
              <div>
                <div className="text-gray-200">Last used:</div>
                <div className="text-gray-400 text-xs">Each new search defaults you to the option you last used</div>
              </div>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Confirmations and warnings</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.advanced.confirmUnsend}
                onChange={() => handleToggle('confirmUnsend')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <div>
                <div className="text-gray-200">
                  Show me a confirmation when I use <span className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">⌘</span>{' '}
                  <span className="px-1 py-0.5 bg-gray-700 rounded text-gray-300">Z</span> to unsend a message I just sent
                </div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.advanced.confirmAwayToggle}
                onChange={() => handleToggle('confirmAwayToggle')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Ask if I want to toggle my away status when I log in after having set myself away</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.advanced.warnMaliciousLinks}
                onChange={() => handleToggle('warnMaliciousLinks')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Warn me about potentially malicious links</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.advanced.warnExternalFiles}
                onChange={() => handleToggle('warnExternalFiles')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Warn me when sharing files with external organizations</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.advanced.warnExternalCanvases}
                onChange={() => handleToggle('warnExternalCanvases')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Warn me when sharing canvases with external organizations</span>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Other options</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.advanced.channelSuggestions}
                onChange={() => handleToggle('channelSuggestions')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Send me occasional channel suggestions via Slackbot</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.advanced.surveys}
                onChange={() => handleToggle('surveys')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <div>
                <div className="text-gray-200">Send me occasional surveys via Slackbot</div>
                <div className="text-gray-400 text-xs">We're always working to make Slack better, and we'd love your thoughts.</div>
              </div>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Manage Preferences</h3>
          {importError && (
            <div className="mb-3 px-3 py-2 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
              {importError}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium"
            >
              Export Preferences
            </button>
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-medium"
            >
              Import Preferences
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded font-medium"
            >
              Reset to Defaults
            </button>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            Export your preferences to a JSON file, or import a previously saved preferences file.
          </p>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Reset all preferences?"
        message="Are you sure you want to reset all preferences to defaults? This action cannot be undone."
        confirmLabel="Reset to Defaults"
        cancelLabel="Cancel"
        onConfirm={confirmReset}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}

