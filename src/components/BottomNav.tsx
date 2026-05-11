import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, CheckSquare, FileText, Briefcase, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { appUser, logout } = useAuth();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Hidden on non-authenticated or onboarding screens. Conditionally rendered in App.tsx
  // But we also control paths there according to the prompt.

  const navItems = [
    { label: 'Mi Ficha', icon: User, path: '/ficha' },
    { label: 'Tareas', icon: CheckSquare, path: '/tareas' },
    { label: 'Actas', icon: FileText, path: '/actas' },
    { label: 'Proyectos', icon: Briefcase, path: '/proyectos' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
  };

  return (
    <>
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF7] border-t border-[#EAE2D6] flex items-center justify-around"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', minHeight: '56px' }}
      >
        {navItems.map((item, idx) => {
          const isReallyActive = location.pathname === item.path;
          
          return (
            <button
              key={idx}
              onClick={() => handleNav(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[56px] space-y-1 relative transition-colors ${
                isReallyActive ? 'text-[#6B705C]' : 'text-stone-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-wide">{item.label}</span>
              {isReallyActive && <div className="w-1 h-1 rounded-full bg-[#6B705C] absolute bottom-1" />}
            </button>
          );
        })}
        
        <button
          onClick={() => setIsMoreMenuOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[56px] space-y-1 transition-colors ${
            isMoreMenuOpen ? 'text-[#6B705C]' : 'text-stone-400'
          }`}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-wide">Más</span>
        </button>
      </div>

      {isMoreMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <div 
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setIsMoreMenuOpen(false)}
          />
          <div className="relative bg-[#FDFBF7] rounded-t-3xl pt-2 pb-6 px-4 shadow-xl z-10" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
            <div className="w-8 h-1 bg-stone-300 rounded-full mx-auto mb-6" />
            <div className="flex flex-col space-y-2">
              {appUser?.role === 'admin' && (
                <button
                  onClick={() => { setIsMoreMenuOpen(false); navigate('/admin'); }}
                  className="w-full text-left px-5 py-4 rounded-2xl font-medium text-[#4A4E4D] hover:bg-[#EAE2D6] transition-colors"
                >
                  Panel Admin
                </button>
              )}
              <button
                onClick={() => { setIsMoreMenuOpen(false); logout(); }}
                className="w-full text-left px-5 py-4 rounded-2xl font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Cerrar sesión
              </button>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="w-full text-center mt-2 px-5 py-4 rounded-2xl font-medium text-stone-500 hover:bg-stone-100 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
