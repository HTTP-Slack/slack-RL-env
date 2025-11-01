import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspaceCreation } from '../context/WorkspaceCreationContext'
import { createWorkspace } from '../services/workspaceApi'

const ProfileStep2 = () => {
  const { workspaceName: savedWorkspaceName, setWorkspaceName: saveWorkspaceName, setWorkspaceId } = useWorkspaceCreation()
  const [workspaceName, setWorkspaceName] = useState(savedWorkspaceName || 'New Workspace')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [step] = useState(2)
  const navigate = useNavigate()

  useEffect(() => {
    if (savedWorkspaceName) {
      setWorkspaceName(savedWorkspaceName)
    }
  }, [savedWorkspaceName])

  const handleNext = async () => {
    if (!workspaceName.trim()) {
      setError('Workspace name is required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await createWorkspace({ name: workspaceName.trim() })
      
      if (response.success && response.data) {
        // Save workspace name and ID to context
        saveWorkspaceName(workspaceName.trim())
        setWorkspaceId(response.data._id)
        
        // Navigate to step 3
        navigate('/profile-step3')
      } else {
        setError(response.message || 'Failed to create workspace')
      }
    } catch (err) {
      console.error('Failed to create workspace:', err)
      setError('An error occurred while creating the workspace')
    } finally {
      setIsLoading(false)
    }
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
      <div className="w-[20rem] bg-[#3a1042] mt-16 border-l border-r border-t border-b border-[#5c3f5e] rounded-tl-md rounded-bl-md"></div>

      {/* Main Content */}
      <main className="flex-1 bg-[#232529] flex items-center justify-center px-12 relative">
        {/* Top Purple Bar */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-[#531260]"></div>
        
        <div className="max-w-xl w-full relative z-10">
          {/* Step Indicator */}
          <p className="text-gray-400 text-sm mb-6">Step {step} of 4</p>

          {/* Heading */}
          <h1 className="text-white text-5xl font-bold mb-4 leading-tight">
            What do you want to call your Slack workspace?
          </h1>

          {/* Subtitle */}
          <p className="text-gray-300 text-base mb-8 leading-relaxed">
            Choose something that your team will recognise, such as the name of your company or team.
          </p>

          {/* Workspace Name Input */}
          <div className="mb-4">
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded text-white text-lg focus:outline-none focus:border-gray-400 placeholder-gray-500"
              placeholder="Enter workspace name"
              disabled={isLoading}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!workspaceName.trim() || isLoading}
            className="px-8 py-2.5 bg-[#611f69] hover:bg-[#4a154b] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-semibold text-base transition-colors"
          >
            {isLoading ? 'Creating workspace...' : 'Next'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default ProfileStep2
