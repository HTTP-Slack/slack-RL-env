import { usePreferences } from '../PreferencesContext';

export function AudioVideoSection() {
  const preferences = usePreferences();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white mb-2">Audio & video</h2>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-white font-medium mb-3">Microphone</h3>
          <select
            value={preferences.audioVideo.microphoneDevice}
            className="w-full max-w-md px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-purple-500"
          >
            <option value="default">Default - System Microphone</option>
          </select>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Speaker</h3>
          <select
            value={preferences.audioVideo.speakerDevice}
            className="w-full max-w-md px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-purple-500"
          >
            <option value="default">Default - System Speaker</option>
          </select>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h3 className="text-white font-medium mb-3">Camera</h3>
          <select
            value={preferences.audioVideo.cameraDevice}
            className="w-full max-w-md px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-200 focus:outline-none focus:border-purple-500"
          >
            <option value="default">Default - System Camera</option>
          </select>
        </div>
      </div>
    </div>
  );
}

