import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Welcome } from './pages/Welcome';
import { ContextConsent } from './pages/ContextConsent';
import { OnboardingChat } from './pages/OnboardingChat';
import { FichaView } from './pages/FichaView';
import { FichaPreview } from './pages/FichaPreview';
import { AdminPanel } from './pages/AdminPanel';
import { TareasPanel } from './pages/TareasPanel';
import { ActasPanel } from './pages/ActasPanel';
import { ProyectosView } from './pages/ProyectosView';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { CruceView } from './pages/CruceView';

function AppContent() {
  const { appUser } = useAuth();
  const location = useLocation();
  const hideNavRoutes = ['/', '/contexto', '/onboarding'];
  const showNav = appUser !== null && !hideNavRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen bg-[#F9F7F1]">
      {showNav && <Sidebar />}
      
      <main className="flex-1 min-w-0">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/contexto" element={<ContextConsent />} />
          <Route path="/onboarding" element={<OnboardingChat />} />
          <Route path="/ficha-preview" element={<FichaPreview />} />
          <Route path="/ficha" element={<ProtectedRoute><FichaView /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPanel /></ProtectedRoute>} />
          <Route path="/cruce" element={<ProtectedRoute requireAdmin><CruceView /></ProtectedRoute>} />
          <Route path="/tareas" element={<ProtectedRoute><TareasPanel /></ProtectedRoute>} />
          <Route path="/actas" element={<ProtectedRoute><ActasPanel /></ProtectedRoute>} />
          <Route path="/proyectos" element={<ProtectedRoute><ProyectosView /></ProtectedRoute>} />
        </Routes>
        
        {showNav && <BottomNav />}
      </main>
    </div>
  );
}

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { appUser, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div></div>;
  if (!appUser) return <Navigate to="/" />;
  if (requireAdmin && appUser.role !== 'admin') return <Navigate to="/ficha" />;
  
  if (!requireAdmin) {
    if (appUser.hasFicha) {
      // Deja pasar (ej. a /ficha), no redirige a /contexto
    } else if (appUser.hasConsented && !appUser.hasFicha) {
      return <Navigate to="/onboarding" />;
    } else if (!appUser.hasConsented) {
      return <Navigate to="/contexto" />;
    }
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
