import { usePreferences, useUpdatePreferences } from '../PreferencesContext';

export function SlackAISection() {
  const preferences = usePreferences();
  const updatePreferences = useUpdatePreferences();

  const handleToggle = () => {
    updatePreferences({
      slackAI: {
        ...preferences.slackAI,
        streamSummaries: !preferences.slackAI.streamSummaries,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Slack AI</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-3">Streaming</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.slackAI.streamSummaries}
              onChange={handleToggle}
              className="w-4 h-4 rounded text-purple-600"
            />
            <div>
              <div className="text-gray-200">Stream summary results</div>
              <div className="text-gray-400 text-xs">
                Channel and thread summaries will appear in real time as they're generated.
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}

