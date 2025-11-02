import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { joinWorkspaceByLink } from '../services/workspaceApi';

const JoinWorkspace = () => {
  const { joinLink } = useParams<{ joinLink: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');

  useEffect(() => {
    const joinWorkspace = async () => {
      if (!joinLink) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      if (!isAuthenticated) {
        // Store the join link and redirect to signin
        localStorage.setItem('pendingJoinLink', joinLink);
        navigate(`/signin?redirect=/join/${joinLink}`);
        return;
      }

      try {
        const result = await joinWorkspaceByLink(joinLink);
        
        if (result.success && result.data) {
          setWorkspaceName(result.data.name);
          setLoading(false);
          
          // Redirect to home after 2 seconds
          setTimeout(() => {
            navigate('/home');
          }, 2000);
        } else {
          setError(result.message || 'Failed to join workspace. The invitation may have expired.');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error joining workspace:', err);
        setError('Failed to join workspace. The invitation may have expired.');
        setLoading(false);
      }
    };

    joinWorkspace();
  }, [joinLink, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(74,21,75)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Joining workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(74,21,75)]">
        <div className="max-w-md text-center bg-white rounded-lg p-8 shadow-lg">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Join</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-[rgb(97,31,105)] text-white rounded hover:bg-[rgb(75,21,85)] transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[rgb(74,21,75)]">
      <div className="max-w-md text-center bg-white rounded-lg p-8 shadow-lg">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome!</h1>
        <p className="text-gray-600 mb-6">
          You've successfully joined <strong>{workspaceName}</strong>
        </p>
        <p className="text-sm text-gray-500">Redirecting you to your workspaces...</p>
      </div>
    </div>
  );
};

export default JoinWorkspace;
