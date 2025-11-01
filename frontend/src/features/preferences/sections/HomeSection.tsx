import { usePreferences, useUpdatePreferences } from '../PreferencesContext';
import { HomeShowOption, SortOption } from '../types';

export function HomeSection() {
  const preferences = usePreferences();
  const updatePreferences = useUpdatePreferences();

  const handleToggle = (field: keyof typeof preferences.home) => {
    updatePreferences({
      home: {
        ...preferences.home,
        [field]: !preferences.home[field],
      },
    });
  };

  const handleShowChange = (show: HomeShowOption) => {
    updatePreferences({
      home: {
        ...preferences.home,
        show,
      },
    });
  };

  const handleSortChange = (sort: SortOption) => {
    updatePreferences({
      home: {
        ...preferences.home,
        sort,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Home</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-3">Show channel organization options</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.home.showChannelOrganization}
              onChange={() => handleToggle('showChannelOrganization')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Show options to personally organize a channel when joining</span>
          </label>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Show activity</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.home.showActivityDot}
              onChange={() => handleToggle('showActivityDot')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Show a dot on the Home icon when there is unread activity
            </span>
          </label>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Always show in the sidebar:</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.home.alwaysShowUnreads}
                onChange={() => handleToggle('alwaysShowUnreads')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Unreads</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.home.alwaysShowHuddles}
                onChange={() => handleToggle('alwaysShowHuddles')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Huddles</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.home.alwaysShowThreads}
                onChange={() => handleToggle('alwaysShowThreads')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Threads</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.home.alwaysShowDraftsSent}
                onChange={() => handleToggle('alwaysShowDraftsSent')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Drafts & sent</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.home.alwaysShowDirectories}
                onChange={() => handleToggle('alwaysShowDirectories')}
                className="w-4 h-4 rounded text-purple-600"
              />
              <span className="text-gray-200">Directories</span>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Show...</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="show-option"
                checked={preferences.home.show === HomeShowOption.ALL_CONVERSATIONS}
                onChange={() => handleShowChange(HomeShowOption.ALL_CONVERSATIONS)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">All your conversations</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="show-option"
                checked={preferences.home.show === HomeShowOption.UNREADS_ONLY}
                onChange={() => handleShowChange(HomeShowOption.UNREADS_ONLY)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">Unreads only</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="show-option"
                checked={preferences.home.show === HomeShowOption.MENTIONS_ONLY}
                onChange={() => handleShowChange(HomeShowOption.MENTIONS_ONLY)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">Mentions only</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="show-option"
                checked={preferences.home.show === HomeShowOption.CUSTOM}
                onChange={() => handleShowChange(HomeShowOption.CUSTOM)}
                className="w-4 h-4 text-purple-600"
              />
              <div>
                <div className="text-gray-200">Custom, depending on the section</div>
                <div className="text-gray-400 text-xs">Choose your settings for each section from the sidebar</div>
              </div>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Sort...</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="sort-option"
                checked={preferences.home.sort === SortOption.ALPHABETICALLY}
                onChange={() => handleSortChange(SortOption.ALPHABETICALLY)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">Alphabetically</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="sort-option"
                checked={preferences.home.sort === SortOption.MOST_RECENT}
                onChange={() => handleSortChange(SortOption.MOST_RECENT)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">By most recent</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="sort-option"
                checked={preferences.home.sort === SortOption.PRIORITY}
                onChange={() => handleSortChange(SortOption.PRIORITY)}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-gray-200">By priority</span>
            </label>
          </div>
          <p className="text-gray-400 text-xs mt-2">
            You have a custom sort setting for 1 section in your sidebar.
          </p>
        </div>

        <div className="border-t border-gray-700 pt-4 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.home.showProfilePhotos}
              onChange={() => handleToggle('showProfilePhotos')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Show profile photos next to DMs</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.home.separatePrivateChannels}
              onChange={() => handleToggle('separatePrivateChannels')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Separate private channels from public ones in sidebar</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.home.separateDirectMessages}
              onChange={() => handleToggle('separateDirectMessages')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Separate direct messages and apps from channels in sidebar</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.home.moveUnreadMentions}
              onChange={() => handleToggle('moveUnreadMentions')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200 flex items-center gap-1">
              Move items with unread Mentions
              <span className="inline-flex items-center justify-center w-5 h-5 bg-red-600 rounded text-white text-xs">1</span>
              to top of sections
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.home.organizeExternalConversations}
              onChange={() => handleToggle('organizeExternalConversations')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Organize external conversations into the External Connections section</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.home.displayMutedItems}
              onChange={() => handleToggle('displayMutedItems')}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Display muted items outside of sidebar menus</span>
          </label>
        </div>
      </div>
    </div>
  );
}

