import React, { useEffect } from 'react';
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
import CalendarioView from './pages/CalendarioView';
import Tablon from './pages/Tablon';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { CruceView } from './pages/CruceView';
import { Activity, ArrowRight } from 'lucide-react';
import { ToastProvider, useToast } from './components/Toaster';

function AppContent() {
  const { appUser } = useAuth();
  const { success } = useToast();
  const location = useLocation();
  
  useEffect(() => {
    success("¡Sistema de feedback activo! ✨");
  }, []);

  const hideNavRoutes = ['/', '/contexto', '/onboarding'];
  const showNav = appUser !== null && !hideNavRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen bg-[#F9F7F1]">
      {showNav && <Sidebar />}
      
      <main className="flex-1 min-w-0">
        <Routes>
          <Route path="/" element={
            <>
              {appUser && !appUser.hasFicha && (
                <div className="bg-[#F9F7F1] border-b border-[#EAE2D6] px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-3 text-[#6B705C]">
                    <div className="p-2 bg-[#EAE2D6] rounded-full">
                      <Activity className="w-5 h-5 text-[#4A4E4D]" />
                    </div>
                    <p className="text-sm font-medium text-stone-700">
                      Completa tu ficha para poder colaborar en proyectos
                    </p>
                  </div>
                  <button 
                    onClick={() => window.location.href = '/onboarding'}
                    className="whitespace-nowrap px-6 py-2 bg-[#CB997E] hover:bg-[#B58368] text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 group"
                  >
                    Completar Ficha
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
              <Welcome />
            </>
          } />
          <Route path="/contexto" element={<ContextConsent />} />
          <Route path="/onboarding" element={<OnboardingChat />} />
          <Route path="/ficha-preview" element={<FichaPreview />} />
          <Route path="/ficha" element={<ProtectedRoute><FichaView /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPanel /></ProtectedRoute>} />
          <Route path="/cruce" element={<ProtectedRoute requireAdmin><CruceView /></ProtectedRoute>} />
          <Route path="/tareas" element={<ProtectedRoute><TareasPanel /></ProtectedRoute>} />
          <Route path="/actas" element={<ProtectedRoute><ActasPanel /></ProtectedRoute>} />
          <Route path="/proyectos" element={<ProtectedRoute><ProyectosView /></ProtectedRoute>} />
          <Route path="/calendario" element={<ProtectedRoute><CalendarioView /></ProtectedRoute>} />
          <Route path="/tablon" element={<ProtectedRoute><Tablon /></ProtectedRoute>} />
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
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
