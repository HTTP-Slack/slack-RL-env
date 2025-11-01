import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/SignIn';
import WorkspaceSelection from './pages/WorkspaceSelection';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/home" element={<WorkspaceSelection />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
