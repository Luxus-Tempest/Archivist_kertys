import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { History } from './pages/History';
import { Process } from './pages/Process';
import { HistoryNew } from './pages/HistoryNew';
import { ProcessNew } from './pages/ProcessNew';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { useAuth } from './hooks/useAuth';
import './index.css';

// Protected Route wrapper component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Guest Route wrapper component (prevents logged in users from seeing login/signup)
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/process-new" replace />;
  }
  return <>{children}</>;
}

function App() {
  const { token, user, getProfile } = useAuth();

  // Rehydration du profil utilisateur au montage
  useEffect(() => {
    if (token && !user) {
      getProfile().catch(() => {
        // Optionnel: logger l'erreur ou forcer la déconnexion si le token est expiré
      });
    }
  }, [token, user, getProfile]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        } />
        <Route path="/signup" element={
          <GuestRoute>
            <Signup />
          </GuestRoute>
        } />
        
        {/* New Dashboard Routes (Refactored Design) */}
        <Route path="/process-new" element={
          <ProtectedRoute>
            <ProcessNew />
          </ProtectedRoute>
        } />
        <Route path="/history-new" element={
          <ProtectedRoute>
            <HistoryNew />
          </ProtectedRoute>
        } />

        {/* Existing Dashboard Routes (Preserved) */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Navigate to="/process" replace />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/process" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Process />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <DashboardLayout>
              <History />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Fallbacks */}
        <Route path="*" element={<Navigate to="/process-new" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
