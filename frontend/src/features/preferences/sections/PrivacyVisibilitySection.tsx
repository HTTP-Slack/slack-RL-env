import { usePreferences, useUpdatePreferences } from '../PreferencesContext';

export function PrivacyVisibilitySection() {
  const preferences = usePreferences();
  const updatePreferences = useUpdatePreferences();

  const handleToggle = () => {
    updatePreferences({
      privacyVisibility: {
        ...preferences.privacyVisibility,
        slackConnectDiscoverable: !preferences.privacyVisibility.slackConnectDiscoverable,
      },
    });
  };

  const handleContactSharingChange = (sharing: 'all' | 'workspace_only' | 'none') => {
    updatePreferences({
      privacyVisibility: {
        ...preferences.privacyVisibility,
        contactSharing: sharing,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Privacy & visibility</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-3">Slack Connect discoverability</h3>
          <p className="text-gray-400 text-sm mb-3">
            Choose who can find you via Slack search. They'll only be able to see that you're on Slack - no personal or workspace details will be shared.
          </p>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="discoverable"
                checked={preferences.privacyVisibility.slackConnectDiscoverable}
                onChange={handleToggle}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">Anyone with your email address (abanpersonal@gmail.com)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="discoverable"
                checked={!preferences.privacyVisibility.slackConnectDiscoverable}
                onChange={handleToggle}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">No one</span>
            </label>
          </div>
          <div className="mt-3 p-3 bg-blue-900/30 border border-blue-700 rounded">
            <p className="text-blue-200 text-sm">
              <strong>Preferences only apply to this workspace</strong>
              <br />
              To make sure no one can search for you, you'll need to change this preference across all your workspaces.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Contact sharing</h3>
          <p className="text-gray-400 text-sm mb-3">
            Choose who's allowed to share your contact info — so they can introduce you to people outside HTTP Test Environment.
          </p>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="contact-sharing"
                checked={preferences.privacyVisibility.contactSharing === 'all'}
                onChange={() => handleContactSharingChange('all')}
                className="w-4 h-4 text-purple-600"
              />
              <div>
                <div className="text-gray-200">All your contacts</div>
                <div className="text-gray-400 text-xs">
                  Includes people from HTTP Test Environment and any external people you're using Slack Connect to work with.
                </div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="contact-sharing"
                checked={preferences.privacyVisibility.contactSharing === 'workspace_only'}
                onChange={() => handleContactSharingChange('workspace_only')}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">Only people at HTTP Test Environment</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="contact-sharing"
                checked={preferences.privacyVisibility.contactSharing === 'none'}
                onChange={() => handleContactSharingChange('none')}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">No one</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

