import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/SignIn';
import Register from './pages/Register';
import WorkspaceSelection from './pages/WorkspaceSelection';
import ProfileStep1 from './pages/ProfileStep1';
import ProfileStep2 from './pages/ProfileStep2';
import ProfileStep3 from './pages/ProfileStep3';
import ProfileStep4 from './pages/ProfileStep4';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/signin" replace />} />
          <Route path="/signin" element={<SignIn />} />
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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
