import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { InvitationRegister } from './pages/InvitationRegister';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { HistoryNew } from './pages/HistoryNew';
import { ProcessNew } from './pages/ProcessNew';
import { ExplorerNew } from './pages/ExplorerNew';
import { Members } from './pages/Members';
import { useAuth } from './hooks/useAuth';
import './index.css';
import { InstructionPage } from './pages/InstructionPage';
import { ExplorerV2 } from './pages/ExplorerV2';

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
  const { isAuthenticated, user, isLoading, token } = useAuth();
  
  // Si on a un token mais pas encore d'utilisateur, on attend la fin du getProfile()
  const isRehydrating = !!token && !user;

  if (isLoading || isRehydrating) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface-container-lowest">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-outline animate-pulse">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'ADMIN' && user?.role !== 'OWNER') {
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
        <Route path="/forgot-password" element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        } />
        <Route path="/reset-password" element={
          <GuestRoute>
            <ResetPassword />
          </GuestRoute>
        } />
        
        {/* New Dashboard Routes (Refactored Design) */}
        <Route path="/process" element={
          <ProtectedRoute>
            <ProcessNew />
          </ProtectedRoute>
        } />
        <Route path="/explorer-v2" element={
          <ProtectedRoute>
            <ExplorerV2 />
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

        {/* Redirect Root to Process */}
        <Route path="/" element={
          <ProtectedRoute>
            <Navigate to="/process" replace />
          </ProtectedRoute>
        } />

        {/* Fallbacks */}
        <Route path="*" element={<Navigate to="/process" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
