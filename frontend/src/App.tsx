import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Pass from './pages/Pass';
import WorkspaceSelection from './pages/WorkspaceSelection';
import ProfileStep1 from './pages/ProfileStep1';
import ProfileStep2 from './pages/ProfileStep2';
import ProfileStep3 from './pages/ProfileStep3';
import ProfileStep4 from './pages/ProfileStep4';
import { PreferencesProvider } from './features/preferences/PreferencesContext';
import { PreferencesModal } from './features/preferences/PreferencesModal';
import { ProfileProvider } from './features/profile/ProfileContext';
import { ProfilePanel } from './features/profile/ProfilePanel';
import { EditProfileModal } from './features/profile/EditProfileModal';
import { UserMenu } from './components/UserMenu';

const App = () => {
  return (
    <PreferencesProvider>
      <ProfileProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/signin" replace />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signin/pass" element={<Pass />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signup/pass" element={<Pass />} />
            <Route path="/home" element={<WorkspaceSelection />} />
            <Route path="/profile-step1" element={<ProfileStep1 />} />
            <Route path="/profile-step2" element={<ProfileStep2 />} />
            <Route path="/profile-step3" element={<ProfileStep3 />} />
            <Route path="/profile-step4" element={<ProfileStep4 />} />
          </Routes>
          <UserMenu />
          <PreferencesModal />
          <ProfilePanel />
          <EditProfileModal />
        </BrowserRouter>
      </ProfileProvider>
    </PreferencesProvider>
  );
};

export default App;
