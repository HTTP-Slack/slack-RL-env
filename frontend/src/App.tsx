import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceCreationProvider } from './context/WorkspaceCreationContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { PreferencesProvider } from './features/preferences/PreferencesContext';
import { ProfileProvider } from './features/profile/ProfileContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Pass from './pages/Pass';
import Register from './pages/Register';
import WorkspaceSelection from './pages/WorkspaceSelection';
import CreateWorkspace from './pages/CreateWorkspace';
import ProfileStep1 from './pages/ProfileStep1';
import ProfileStep2 from './pages/ProfileStep2';
import ProfileStep3 from './pages/ProfileStep3';
import ProfileStep4 from './pages/ProfileStep4';
import JoinWorkspace from './pages/JoinWorkspace';
import Dashboard from './pages/Dashboard';
import DMView from './pages/DMView';
import LaterView from './pages/LaterView';
import { SearchResults } from './pages/search/SearchResults';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WorkspaceProvider>
          <PreferencesProvider>
            <ProfileProvider>
              <WorkspaceCreationProvider>
                <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signin/pass" element={<Pass />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signup/pass" element={<Pass />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <WorkspaceSelection />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-workspace" 
            element={
              <ProtectedRoute>
                <CreateWorkspace />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile-step1" 
            element={
              <ProtectedRoute>
                <ProfileStep1 />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile-step2" 
            element={
              <ProtectedRoute>
                <ProfileStep2 />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile-step3" 
            element={
              <ProtectedRoute>
                <ProfileStep3 />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile-step4" 
            element={
              <ProtectedRoute>
                <ProfileStep4 />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dms"
            element={
              <ProtectedRoute>
                <DMView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dms/:conversationId"
            element={
              <ProtectedRoute>
                <DMView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/later"
            element={
              <ProtectedRoute>
                <LaterView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchResults />
              </ProtectedRoute>
            }
          />
          <Route path="/join/:joinLink" element={<JoinWorkspace />} />
        </Routes>
              </WorkspaceCreationProvider>
            </ProfileProvider>
          </PreferencesProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
