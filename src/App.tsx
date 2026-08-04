import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Welcome } from './pages/Welcome';
import { ContextConsent } from './pages/ContextConsent';
import { OnboardingChat } from './pages/OnboardingChat';
const FichaView = React.lazy(() => import('./pages/FichaView').then(m => ({ default: m.FichaView })));
const FichaPreview = React.lazy(() => import('./pages/FichaPreview').then(m => ({ default: m.FichaPreview })));
const AdminPanel = React.lazy(() => import('./pages/AdminPanel').then(m => ({ default: m.AdminPanel })));
const TareasPanel = React.lazy(() => import('./pages/TareasPanel').then(m => ({ default: m.TareasPanel })));
const ActasPanel = React.lazy(() => import('./pages/ActasPanel').then(m => ({ default: m.ActasPanel })));
const ProyectosView = React.lazy(() => import('./pages/ProyectosView').then(m => ({ default: m.ProyectosView })));
const CalendarioView = React.lazy(() => import('./pages/CalendarioView'));
const Tablon = React.lazy(() => import('./pages/Tablon'));
const PropuestasView = React.lazy(() => import('./pages/PropuestasView').then(m => ({ default: m.PropuestasView })));
const CruceView = React.lazy(() => import('./pages/CruceView').then(m => ({ default: m.CruceView })));
const ComunidadesView = React.lazy(() => import('./pages/ComunidadesView').then(m => ({ default: m.ComunidadesView })));
const AdminSolicitudesView = React.lazy(() => import('./pages/AdminSolicitudesView').then(m => ({ default: m.AdminSolicitudesView })));
const MarketplaceView = React.lazy(() => import('./pages/MarketplaceView'));
const RegistroComunidadView = React.lazy(() => import('./pages/RegistroComunidadView').then(m => ({ default: m.RegistroComunidadView })));
const FichaComunidadView = React.lazy(() => import('./pages/FichaComunidadView').then(m => ({ default: m.FichaComunidadView })));
const PasaporteComunitarioView = React.lazy(() => import('./pages/PasaporteComunitarioView').then(m => ({ default: m.PasaporteComunitarioView })));
const PasaporteUniversalView = React.lazy(() => import('./pages/PasaporteUniversalView').then(m => ({ default: m.PasaporteUniversalView })));
const KanariiTourPage = React.lazy(() => import('./pages/KanariiTourPage'));
const AuthCallbackPage = React.lazy(() => import('./pages/AuthCallbackPage').then(m => ({ default: m.AuthCallbackPage })));
import { Activity, ArrowRight } from 'lucide-react';
import { ToastProvider, useToast } from './components/Toaster';
import { BottomNav } from './components/BottomNav';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/layout/Header';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800" />
  </div>
);

function NotFoundRedirect() {
  const { info } = useToast();

  useEffect(() => {
    info("La ruta que buscabas no existe. Te hemos orientado al inicio de la tribu 🍃");
  }, [info]);

  return <Navigate to="/orientacion" replace />;
}

function AppContent() {
  const { appUser } = useAuth();
  const { success } = useToast();
  const location = useLocation();
  
  useEffect(() => {
    success("¡Sistema de feedback activo! ✨");
  }, []);

  const hideNavRoutes = ['/', '/contexto', '/onboarding', '/tour'];
  const showNav = appUser !== null && !hideNavRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen bg-[#F9F7F1]">
      {showNav && <Sidebar />}
      
      <main className="flex-1 min-w-0 flex flex-col">
        {showNav && <TopBar />}
        <React.Suspense fallback={<LoadingSpinner />}>
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
          <Route path="/orientacion" element={<Welcome />} />
          <Route path="/onboarding" element={<OnboardingChat />} />
          <Route path="/ficha-preview" element={<FichaPreview />} />
          <Route path="/ficha" element={<ProtectedRoute><FichaView /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><FichaView /></ProtectedRoute>} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPanel /></ProtectedRoute>} />
          <Route path="/cruce" element={<ProtectedRoute requireAdmin><CruceView /></ProtectedRoute>} />
          <Route path="/tareas" element={<ProtectedRoute><TareasPanel /></ProtectedRoute>} />
          <Route path="/actas" element={<ProtectedRoute><ActasPanel /></ProtectedRoute>} />
          <Route path="/proyectos" element={<ProtectedRoute><ProyectosView /></ProtectedRoute>} />
          <Route path="/calendario" element={<ProtectedRoute><CalendarioView /></ProtectedRoute>} />
          <Route path="/tablon" element={<ProtectedRoute><Tablon /></ProtectedRoute>} />
          <Route path="/comunidades" element={<ProtectedRoute><ComunidadesView /></ProtectedRoute>} />
          <Route path="/nueva-comunidad" element={<ProtectedRoute><RegistroComunidadView /></ProtectedRoute>} />
          <Route path="/admin/solicitudes" element={<ProtectedRoute><AdminSolicitudesView /></ProtectedRoute>} />
          <Route path="/soberania" element={<ProtectedRoute><MarketplaceView /></ProtectedRoute>} />
          <Route path="/gobernanza" element={<ProtectedRoute><PropuestasView /></ProtectedRoute>} />
          <Route path="/c/:slug" element={<FichaComunidadView />} />
          <Route path="/c/:slug/miembro/:userId" element={<PasaporteComunitarioView />} />
          <Route path="/p/:uid" element={<PasaporteUniversalView />} />
          <Route path="/tour" element={<KanariiTourPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </React.Suspense>
        
        {showNav && <BottomNav />}
      </main>
    </div>
  );
}

function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: { 
  children: React.ReactNode; 
  requireAdmin?: boolean;
}) {
  const { appUser, status } = useAuth();
  
  // Estado indeterminado: mostrar loading, no redirigir todavía
  if (status === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800" />
      </div>
    );
  }
  
  // Estado definitivo: ahora sí redirigir o renderizar
  if (status === 'unauthenticated' || !appUser) {
    return <Navigate to="/" replace />;
  }
  
  if (requireAdmin && appUser.role !== 'admin') {
    return <Navigate to="/ficha" replace />;
  }
  
  return <>{children}</>;
}

import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';
import { AcuerdosProvider } from './contexts/AcuerdosContext';
import { TopBarProvider } from './contexts/TopBarContext';
import { TopBar } from './components/layout/TopBar';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <AcuerdosProvider>
            <TopBarProvider>
              <AppContent />
              <PwaUpdatePrompt />
            </TopBarProvider>
          </AcuerdosProvider>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
