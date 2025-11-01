import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkspaceCreation } from '../context/WorkspaceCreationContext'

const ProfileStep1 = () => {
  const { userName, setUserName, userPhoto, setUserPhoto } = useWorkspaceCreation()
  const [name, setName] = useState(userName || '')
  const [photo, setPhoto] = useState<string | null>(userPhoto || null)
  const [step] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (userName) {
      setName(userName)
    }
    if (userPhoto) {
      setPhoto(userPhoto)
    }
  }, [userName, userPhoto])

  const handleNext = () => {
    setUserName(name)
    setUserPhoto(photo)
    navigate('/profile-step2')
  }

  const handleEditPhoto = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      // Read file and convert to base64
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemovePhoto = () => {
    setPhoto(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Generate initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen flex bg-[#531260]">
      {/* Left Sidebar */}
      <aside className="w-[5rem] bg-[#531260] flex flex-col items-center pt-4 relative z-10">
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
          <p className="text-white text-sm mb-6">Step {step} of 4</p>

          {/* Heading */}
          <h1 className="text-white text-5xl font-bold mb-4">
            What's your name?
          </h1>

          {/* Subtitle */}
          <p className="text-gray-300 text-base mb-8 leading-relaxed">
            Adding your name and profile photo helps your teammates to recognise and connect with you more easily.
          </p>

          {/* Name Input */}
          <div className="mb-8">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-gray-500 rounded text-white text-lg focus:outline-none focus:border-gray-400 placeholder-gray-500"
              placeholder="Enter your name"
            />
          </div>

          {/* Profile Photo Section */}
          <div className="mb-8">
            <label className="text-white text-base mb-2 block">
              Your profile photo{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <p className="text-gray-400 text-sm mb-4">
              Help your teammates to know that they're talking to the right person.
            </p>

            {/* Avatar Display */}
            <div className="flex items-center gap-4 mb-4">
              {photo ? (
                <img
                  src={photo}
                  alt="Profile"
                  className="w-24 h-24 rounded object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded bg-[#8b7894] flex items-center justify-center text-white text-4xl font-semibold">
                  {getInitials(name)}
                </div>
              )}
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Photo Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleEditPhoto}
                className="px-6 py-2.5 border border-white text-white rounded hover:bg-white hover:text-gray-900 transition-colors text-sm font-medium"
              >
                {photo ? 'Change photo' : 'Upload photo'}
              </button>
              {photo && (
                <button
                  onClick={handleRemovePhoto}
                  className="px-6 py-2.5 border border-gray-500 text-gray-400 rounded hover:border-red-500 hover:text-red-400 transition-colors text-sm font-medium"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!name.trim()}
            className="px-8 py-2.5 bg-[#611f69] hover:bg-[#4a154b] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded font-semibold text-base transition-colors"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  )
}

export default ProfileStep1