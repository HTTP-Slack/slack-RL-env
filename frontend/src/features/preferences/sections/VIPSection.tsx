import { usePreferences, useUpdatePreferences } from '../PreferencesContext';

export function VIPSection() {
  const preferences = usePreferences();
  const updatePreferences = useUpdatePreferences();

  const handleToggle = () => {
    updatePreferences({
      vip: {
        ...preferences.vip,
        allowFromVIPs: !preferences.vip.allowFromVIPs,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">VIP</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-3">VIP Notifications</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.vip.allowFromVIPs}
              onChange={handleToggle}
              className="w-4 h-4 rounded text-purple-600"
            />
            <span className="text-gray-200">Always allow notifications from VIPs</span>
          </label>
          <p className="text-gray-400 text-sm mt-2">
            Still get message notifications from your VIPs, even when general notifications are paused
          </p>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">VIP List</h3>
          <p className="text-gray-400 text-sm mb-3">
            Decide who or what you want prioritized at the top of your Home, DMs and Activity.
          </p>
          <div className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded">
            <input
              type="text"
              placeholder="Search to add people, apps and workflows"
              className="w-full bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none"
            />
          </div>
          <div className="mt-4">
            <h4 className="text-gray-300 font-medium mb-2">Added to your VIP list</h4>
            {preferences.vip.vipList.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No VIPs added yet</p>
            ) : (
              <div className="space-y-2">
                {preferences.vip.vipList.map((vip) => (
                  <div key={vip} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <span className="text-gray-200">{vip}</span>
                    <button className="text-gray-400 hover:text-white">Remove</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

