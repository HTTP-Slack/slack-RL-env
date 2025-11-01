const ProfileStep4 = () => {
  const workspaceName = 'New Workspace'

  const handleStartWithPro = () => {
    console.log('Start with Pro clicked')
    // Navigate to main workspace or handle subscription
  }

  const handleStartFree = () => {
    console.log('Start with free version clicked')
    // Navigate to main workspace
  }

  // Generate initial from workspace name
  const getWorkspaceInitial = (name: string) => {
    return name.trim()[0]?.toUpperCase() || 'W'
  }

  return (
    <div className="min-h-screen flex bg-[#531260] relative">
      {/* Left Sidebar */}
      <aside className="w-[5rem] bg-[#531260] flex flex-col items-center pt-4 relative z-10">
        {/* Workspace Icon at Top */}
        <div className="mb-4">
          <div className="w-12 h-12 rounded-lg bg-[#8b7894] flex items-center justify-center text-white text-lg font-semibold">
            {getWorkspaceInitial(workspaceName)}
          </div>
        </div>

        {/* Home Button */}
        <button className="w-12 h-12 rounded-lg bg-[#4a1d5a] hover:bg-[#4a1d5a] flex flex-col items-center justify-center mb-4 transition-colors border-2 border-[#5c3f5e]">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </button>
        <p className="text-white text-xs opacity-80 mb-8">Home</p>

        {/* More Button */}
        <button className="w-12 h-12 rounded-lg border-2 border-[#5c3f5e] hover:border-[#7d5f7f] flex flex-col items-center justify-center transition-colors">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
        <p className="text-white text-xs opacity-80">More</p>

        {/* User Avatar at Bottom */}
        <div className="mt-auto mb-4">
          <div className="w-9 h-9 rounded-lg bg-[#8b7894] flex items-center justify-center text-white text-sm font-semibold">
            A
          </div>
        </div>
      </aside>

      {/* Middle Section with Low Opacity Purple */}
      <div className="w-[20rem] bg-[#3a1042] mt-16 border-l border-r border-t border-b border-[#5c3f5e] rounded-tl-md rounded-bl-md flex flex-col pt-6 px-4">
        {/* Workspace Name */}
        <h2 className="text-white text-xl font-bold mb-6">{workspaceName}</h2>
        
        {/* Channels */}
        <div className="mb-4">
          <p className="text-gray-300 text-sm font-semibold mb-2">Channels</p>
        </div>

        {/* Direct messages */}
        <div>
          <p className="text-gray-300 text-sm font-semibold">Direct messages</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 bg-[#232529] flex items-start justify-center px-12 pt-20 relative">
        {/* Top Purple Bar */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-[#531260]"></div>
        
        <div className="max-w-5xl w-full relative z-10 flex gap-8">
          {/* Left Content */}
          <div className="flex-1">
            {/* Success Message */}
            <p className="text-gray-400 text-sm mb-2 flex items-center gap-2">
              Your workspace is ready to go! <span className="text-yellow-400">✨</span>
            </p>

            {/* Heading */}
            <h1 className="text-white text-5xl font-bold mb-8 leading-tight">
              Start with Slack Pro
            </h1>

            {/* Features List */}
            <div className="space-y-6 mb-6">
              {/* Feature 1 - Expanded */}
              <div className="border-l-2 border-green-500 pl-4">
                <div className="flex items-start gap-3 mb-2">
                  <svg className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h3 className="text-white font-semibold mb-1">Unlimited message history</h3>
                    <p className="text-gray-400 text-sm">
                      Search and view all of your team's public messages and files, which are stored indefinitely on a paid subscription.
                    </p>
                  </div>
                </div>
              </div>

              {/* Feature 2 - Collapsed */}
              <div className="flex items-center gap-3 text-gray-300 cursor-pointer hover:text-white">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>Group meetings with AI notes</span>
              </div>

              {/* Feature 3 - Collapsed */}
              <div className="flex items-center gap-3 text-gray-300 cursor-pointer hover:text-white">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span>Work with people at other organisations</span>
              </div>

              {/* Feature 4 - Collapsed */}
              <div className="flex items-center gap-3 text-gray-300 cursor-pointer hover:text-white">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="text-purple-400">AI conversation summaries</span>
              </div>
            </div>

            {/* Compare Link */}
            <button className="text-[#1a9fd9] hover:underline text-sm flex items-center gap-1 mb-8">
              <span>+</span>
              <span>Compare subscriptions</span>
            </button>

            {/* Pricing Card */}
            <div className="bg-gradient-to-br from-[#5b3a5e] to-[#4a2d5a] rounded-lg p-6 mb-4">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">🎁</div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-white text-2xl font-bold">55% off*</span>
                  </div>
                  <p className="text-gray-300 text-sm line-through">₹294.75 per person/month</p>
                </div>
              </div>
              
              <button
                onClick={handleStartWithPro}
                className="w-full bg-[#007a5a] hover:bg-[#006644] text-white font-semibold py-3 rounded text-base transition-colors mb-3"
              >
                Start with Pro
              </button>
              
              <p className="text-gray-400 text-xs text-center">
                *Limited-time offer subject to change at Slack's discretion.
              </p>
            </div>

            {/* Free Version Button */}
            <button
              onClick={handleStartFree}
              className="w-full border border-gray-500 hover:bg-gray-800 text-white font-semibold py-3 rounded text-base transition-colors"
            >
              Start with the limited free version
            </button>
          </div>

          {/* Vertical Divider Line */}
          <div className="w-px bg-gray-600 self-stretch"></div>

          {/* Right GIF Placeholder */}
          <div className="w-80 h-[500px] bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
            <div className="text-center">
              <div className="text-gray-400 text-sm mb-2">GIF Placeholder</div>
              <div className="text-gray-500 text-xs">320 x 500</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfileStep4
