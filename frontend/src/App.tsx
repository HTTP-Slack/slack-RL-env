import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/SignIn';
import WorkspaceSelection from './pages/WorkspaceSelection';
import Dashboard from './pages/Dashboard';
import ProfileStep1 from './pages/ProfileStep1';
import ProfileStep2 from './pages/ProfileStep2';
import ProfileStep3 from './pages/ProfileStep3';
import ProfileStep4 from './pages/ProfileStep4';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/home" element={<WorkspaceSelection />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile-step1" element={<ProfileStep1 />} />
        <Route path="/profile-step2" element={<ProfileStep2 />} />
        <Route path="/profile-step3" element={<ProfileStep3 />} />
        <Route path="/profile-step4" element={<ProfileStep4 />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
