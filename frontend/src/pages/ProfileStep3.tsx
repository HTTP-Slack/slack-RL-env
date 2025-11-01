import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const ProfileStep3 = () => {
  const [emails, setEmails] = useState('')
  const [step] = useState(3)
  const location = useLocation()
  const workspaceName = location.state?.workspaceName || 'New Workspace'
  const navigate = useNavigate()

  // Validate emails using regex
  const isValidEmail = (email: string) => {
    // Simple RFC 5322-compliant regex for email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  const hasValidEmail = () => {
    // Split emails by comma, trim, and check if at least one is valid
    return emails
      .split(',')
      .map(e => e.trim())
      .filter(e => e.length > 0)
      .some(isValidEmail);
  }

  const handleNext = () => {
    if (hasValidEmail()) {
      console.log('Emails submitted:', emails)
      navigate('/profile-step4', { state: { workspaceName } })
    }
  }

  const handleCopyLink = () => {
    console.log('Copy invitation link')
  }

  const handleSkip = () => {
    console.log('Skip this step')
    navigate('/profile-step4', { state: { workspaceName } })
  }

  const handleAddFromGoogle = () => {
    console.log('Add from Google Contacts')
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
      <main className="flex-1 bg-[#232529] flex items-center justify-center px-12 relative">
        {/* Top Purple Bar */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-[#531260]"></div>
        
        <div className="max-w-xl w-full relative z-10">
          {/* Step Indicator */}
          <p className="text-gray-400 text-sm mb-6">Step {step} of 4</p>

          {/* Heading */}
          <h1 className="text-white text-5xl font-bold mb-4 leading-tight">
            Who else is on the {workspaceName} team?
          </h1>

          {/* Add colleagues section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-white text-base font-semibold">
                Add colleagues by email
              </label>
              <button
                onClick={handleAddFromGoogle}
                className="flex items-center gap-2 text-[#1a73e8] hover:underline text-sm"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Add from Google Contacts</span>
              </button>
            </div>

            {/* Email Textarea */}
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Example ellis@gmail.com, maria@gmail.com"
              className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded text-white text-base focus:outline-none focus:border-gray-400 placeholder-gray-500 resize-none h-32"
            />
          </div>

          {/* Info Text */}
          <p className="text-gray-400 text-sm mb-8">
            Keep in mind that invitations expire in 30 days. You can always extend that deadline.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleNext}
              disabled={!hasValidEmail()}
              className="px-8 py-2.5 bg-[#4a5568] hover:bg-[#3a4555] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-semibold text-base transition-colors"
            >
              Next
            </button>
            <button
              onClick={handleCopyLink}
              className="px-6 py-2.5 border border-white text-white rounded hover:bg-white hover:text-gray-900 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
              </svg>
              Copy invitation link
            </button>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-white transition-colors text-sm"
            >
              Skip this step
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProfileStep3
