import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWorkspace } from '../services/workspaceApi';

const CreateWorkspace: React.FC = () => {
  const [workspaceName, setWorkspaceName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!workspaceName.trim()) {
      setError('Workspace name is required');
      return;
    }

    setLoading(true);

    try {
      const response = await createWorkspace({ name: workspaceName.trim() });
      
      if (response.success && response.data) {
        // Navigate to the workspace or home page
        navigate('/home');
      } else {
        setError(response.message || 'Failed to create workspace');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
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
      <main className="flex-1 flex items-start justify-center px-8 pt-8 pb-20">
        <div className="w-full max-w-xl">
          <h1 className="text-[2.75rem] leading-tight font-bold text-black text-center mb-2">
            Create a new workspace
          </h1>
          <p className="text-center text-gray-600 text-base mb-8">
            Workspaces are where your team communicates. They're best when organized around a specific topic — like a company or project.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Create Workspace Form */}
          <form onSubmit={handleSubmit} className="mb-4 mx-auto w-3/4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Workspace name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="Ex: Acme Marketing or Acme Co"
              className="w-full px-4 py-3 border border-gray-300 rounded-md mb-4 text-base focus:outline-none focus:border-gray-400 focus:ring-0"
              required
              disabled={loading}
              maxLength={80}
            />
            <p className="text-sm text-gray-500 mb-6">
              This is the name of your company, team or organization.
            </p>
            
            <button
              type="submit"
              disabled={loading || !workspaceName.trim()}
              className="w-full bg-[#611f69] hover:bg-[#4a154b] text-white font-semibold py-3 rounded-md text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Workspace'}
            </button>
          </form>

          {/* Cancel Link */}
          <div className="text-center">
            <button
              onClick={() => navigate('/home')}
              className="text-blue-600 hover:underline text-sm"
              disabled={loading}
            >
              Cancel and go back
            </button>
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
  );
};

export default CreateWorkspace;
