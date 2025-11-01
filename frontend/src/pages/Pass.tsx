import React, { useState, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import type { KeyboardEvent } from 'react'

const Pass = () => {
  const location = useLocation()
  const email = location.state?.email || 'user@example.com'
  
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1)
    }

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('')
    const newCode = [...code]
    
    pastedData.forEach((char, index) => {
      if (index < 6 && /^\d$/.test(char)) {
        newCode[index] = char
      }
    })
    
    setCode(newCode)
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex(val => !val)
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex
    inputRefs.current[focusIndex]?.focus()
  }

  const handleOpenGmail = () => {
    window.open('https://mail.google.com', '_blank')
  }

  const handleOpenOutlook = () => {
    window.open('https://outlook.com', '_blank')
  }

  const handleRequestNewCode = () => {
    console.log('Request new code')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header - Centered Logo */}
      <header className="w-full px-8 pt-12 pb-10 flex justify-center items-center">
        <div className="flex items-center gap-2">
          <svg className="w-7 h-7" viewBox="0 0 124 124" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Cyan shapes */}
            <path d="M26.3996 78.2003C26.3996 84.8003 20.9996 90.2003 14.3996 90.2003C7.79961 90.2003 2.39961 84.8003 2.39961 78.2003C2.39961 71.6003 7.79961 66.2003 14.3996 66.2003H26.3996V78.2003Z" fill="#36C5F0"/>
            <path d="M32.3996 78.2003C32.3996 71.6003 37.7996 66.2003 44.3996 66.2003C50.9996 66.2003 56.3996 71.6003 56.3996 78.2003V109.6C56.3996 116.2 50.9996 121.6 44.3996 121.6C37.7996 121.6 32.3996 116.2 32.3996 109.6V78.2003Z" fill="#36C5F0"/>
            {/* Green shapes */}
            <path d="M44.3996 26.3999C37.7996 26.3999 32.3996 20.9999 32.3996 14.3999C32.3996 7.7999 37.7996 2.3999 44.3996 2.3999C50.9996 2.3999 56.3996 7.7999 56.3996 14.3999V26.3999H44.3996Z" fill="#2EB67D"/>
            <path d="M44.4004 32.3999C51.0004 32.3999 56.4004 37.7999 56.4004 44.3999C56.4004 50.9999 51.0004 56.3999 44.4004 56.3999H13.0004C6.40039 56.3999 1.00039 50.9999 1.00039 44.3999C1.00039 37.7999 6.40039 32.3999 13.0004 32.3999H44.4004Z" fill="#2EB67D"/>
            {/* Yellow shapes */}
            <path d="M97.5996 44.3999C97.5996 37.7999 102.9996 32.3999 109.5996 32.3999C116.1996 32.3999 121.5996 37.7999 121.5996 44.3999C121.5996 50.9999 116.1996 56.3999 109.5996 56.3999H97.5996V44.3999Z" fill="#ECB22E"/>
            <path d="M91.5996 44.4004C91.5996 51.0004 86.1996 56.4004 79.5996 56.4004C72.9996 56.4004 67.5996 51.0004 67.5996 44.4004V13.0004C67.5996 6.40039 72.9996 1.00039 79.5996 1.00039C86.1996 1.00039 91.5996 6.40039 91.5996 13.0004V44.4004Z" fill="#ECB22E"/>
            {/* Pink shapes */}
            <path d="M79.5996 97.5996C86.1996 97.5996 91.5996 102.9996 91.5996 109.5996C91.5996 116.1996 86.1996 121.5996 79.5996 121.5996C72.9996 121.5996 67.5996 116.1996 67.5996 109.5996V97.5996H79.5996Z" fill="#E01E5A"/>
            <path d="M79.5996 91.5996C72.9996 91.5996 67.5996 86.1996 67.5996 79.5996C67.5996 72.9996 72.9996 67.5996 79.5996 67.5996H110.9996C117.5996 67.5996 122.9996 72.9996 122.9996 79.5996C122.9996 86.1996 117.5996 91.5996 110.9996 91.5996H79.5996Z" fill="#E01E5A"/>
          </svg>
          <span className="text-3xl font-bold text-gray-900">slack</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center px-4 sm:px-8 pt-0 pb-20">
        <div className="w-full max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-[3rem] leading-tight font-bold text-black text-center mb-3 sm:mb-4">
            We emailed you a code
          </h1>
          
          <p className="text-center text-gray-700 text-sm sm:text-base mb-1 leading-relaxed px-2">
            We sent an email to <strong>{email}</strong>. Enter the code here or tap the button in the email to continue.
          </p>

          <p className="text-center text-gray-600 text-xs sm:text-sm mb-8 sm:mb-10 px-2">
            If you don't see the email, check your spam or junk folder.
          </p>

          {/* Code Input */}
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            {/* First group of 3 */}
            <div className="flex gap-2 sm:gap-3">
              {[0, 1, 2].map((index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-medium border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              ))}
            </div>

            {/* Dash separator */}
            <div className="flex items-center">
              <span className="text-2xl sm:text-3xl text-gray-400 font-light">–</span>
            </div>

            {/* Second group of 3 */}
            <div className="flex gap-2 sm:gap-3">
              {[3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code[index]}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 sm:w-16 sm:h-20 text-center text-2xl sm:text-3xl font-medium border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              ))}
            </div>
          </div>

          {/* Email Client Buttons */}
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-6 sm:mb-8">
            <button
              onClick={handleOpenGmail}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.28 24 3.434 24 5.457z"
                />
              </svg>
              <span className="text-xs sm:text-sm font-normal">Open Gmail</span>
            </button>

            <button
              onClick={handleOpenOutlook}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                <path
                  fill="#0078D4"
                  d="M24 7.387v9.226a1.387 1.387 0 0 1-1.387 1.387h-9.226a1.387 1.387 0 0 1-1.387-1.387V7.387A1.387 1.387 0 0 1 13.387 6h9.226A1.387 1.387 0 0 1 24 7.387zM12 12a6 6 0 1 1-6-6 6 6 0 0 1 6 6zm-3.6 0c0-1.325-.743-2.4-1.8-2.4S4.8 10.675 4.8 12s.743 2.4 1.8 2.4 1.8-1.075 1.8-2.4z"
                />
              </svg>
              <span className="text-xs sm:text-sm font-normal">Open Outlook</span>
            </button>
          </div>

          {/* Links */}
          <div className="text-center space-y-1 px-2">
            <p className="text-gray-700 text-xs sm:text-sm">
              Can't find your code?{' '}
              <button onClick={handleRequestNewCode} className="text-blue-600 hover:underline">
                Request a new code.
              </button>
            </p>
            <p className="text-gray-700 text-xs sm:text-sm">
              Having trouble?{' '}
              <a href="#" className="text-blue-600 hover:underline">
                Try entering a workspace URL
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-8 py-5 border-t border-gray-200 flex justify-center gap-6 text-sm text-gray-600">
        <a href="#" className="hover:underline">
          Privacy & Terms
        </a>
        <a href="#" className="hover:underline">
          Contact Us
        </a>
      </footer>
    </div>
  )
}

export default Pass
