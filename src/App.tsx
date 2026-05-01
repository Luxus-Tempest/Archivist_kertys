import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { InvitationRegister } from './pages/InvitationRegister';
import { History } from './pages/History';
import { Process } from './pages/Process';
import { HistoryNew } from './pages/HistoryNew';
import { ProcessNew } from './pages/ProcessNew';
import { ExplorerNew } from './pages/ExplorerNew';
import { Members } from './pages/Members';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { useAuth } from './hooks/useAuth';
import './index.css';
import { InstructionPage } from './pages/InstructionPage';

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
    return <Navigate to="/explorer" replace />;
  }
  return <>{children}</>;
}

// Admin Route wrapper component (restricts access to ADMIN role)
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/explorer" replace />;
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
        <Route path="/invitation/register" element={
          <GuestRoute>
            <InvitationRegister />
          </GuestRoute>
        } />
        
        {/* New Dashboard Routes (Refactored Design) */}
        <Route path="/process" element={
          <ProtectedRoute>
            <ProcessNew />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <HistoryNew />
          </ProtectedRoute>
        } />
        <Route path="/explorer" element={
          <ProtectedRoute>
            <ExplorerNew />
          </ProtectedRoute>
        } />
        <Route path="/members" element={
          <AdminRoute>
            <Members />
          </AdminRoute>
        } />
        <Route path="/instructions" element={
          <ProtectedRoute>
            <InstructionPage />
          </ProtectedRoute>
        } />

        {/* Existing Dashboard Routes (Preserved) */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Navigate to="/process-old" replace />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/process-old" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Process />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/history-old" element={
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
