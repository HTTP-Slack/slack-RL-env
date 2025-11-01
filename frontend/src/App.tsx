import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import WorkspaceSelection from './pages/WorkspaceSelection';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<WorkspaceSelection />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
