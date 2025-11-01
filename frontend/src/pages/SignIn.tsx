import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signin } from '../services/authApi'
import { useAuth } from '../context/AuthContext'

const SignIn = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await signin({ email, password })
      
      if (response.success && response.data) {
        setUser(response.data)
        navigate('/home')
      } else {
        setError(response.message || 'Sign in failed')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    console.log('Sign in with Google')
  }

  const handleAppleSignIn = () => {
    console.log('Sign in with Apple')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header - Centered Logo with Right-aligned Create Account */}
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
        <div className="absolute right-8 text-sm text-gray-600 flex flex-col items-end">
          <span>New to Slack?</span>
          <Link to="/register" className="text-blue-600 hover:underline">
            Create an account
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-start justify-center px-8 pt-0 pb-20">
        <div className="w-full max-w-xl">
          <h1 className="text-[2.75rem] leading-tight font-bold text-black text-center mb-2">
            Sign in to your account
          </h1>
          <p className="text-center text-gray-600 text-base mb-6">
            Enter your email and password to sign in.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Email & Password Form */}
          <form onSubmit={handleEmailSubmit} className="mb-4 mx-auto w-3/4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@work-email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-md mb-3 text-base focus:outline-none focus:border-gray-400 focus:ring-0"
              required
              disabled={loading}
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-md mb-3 text-base focus:outline-none focus:border-gray-400 focus:ring-0"
              required
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#611f69] hover:bg-[#4a154b] text-white font-semibold py-3 rounded-md text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In With Email'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-4 mx-auto w-3/4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-700 uppercase text-xs tracking-wide font-semibold">
                Or sign in with
              </span>
            </div>
          </div>

          {/* Social Sign In Buttons */}
          <div className="flex gap-3 mb-4 mx-auto w-3/4">
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span className="text-gray-900 font-normal">Google</span>
            </button>
            <button
              onClick={handleAppleSignIn}
              type="button"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              <span className="text-gray-900 font-normal">Apple</span>
            </button>
          </div>

          {/* Footer Link */}
          <p className="text-center text-gray-700 text-sm">
            Having trouble?{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Try entering a workspace URL
            </a>
          </p>
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
        <button className="flex items-center gap-1 hover:underline">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
          </svg>
          Change region
        </button>
      </footer>
    </div>
  )
}

export default SignIn
