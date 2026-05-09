import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Welcome } from './pages/Welcome';
import { ContextConsent } from './pages/ContextConsent';
import { OnboardingChat } from './pages/OnboardingChat';
import { FichaView } from './pages/FichaView';
import { AdminPanel } from './pages/AdminPanel';

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { appUser, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div></div>;
  if (!appUser) return <Navigate to="/" />;
  if (requireAdmin && appUser.role !== 'admin') return <Navigate to="/ficha" />;
  if (!appUser.hasConsented && !requireAdmin) return <Navigate to="/contexto" />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/contexto" element={<ProtectedRoute><ContextConsent /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingChat /></ProtectedRoute>} />
          <Route path="/ficha" element={<ProtectedRoute><FichaView /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPanel /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
