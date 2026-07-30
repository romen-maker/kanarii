import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Send, Globe, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useComunidad } from '../../contexts/ComunidadContext';

export function UserAvatarMenu() {
  const navigate = useNavigate();
  const { user, appUser, logout } = useAuth();
  const { comunidad } = useComunidad();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAdmin = appUser?.role === 'admin';
  const isCommunityAdmin = !!(isAdmin || (comunidad?.adminUids && Array.isArray(comunidad.adminUids) && comunidad.adminUids.includes(appUser?.uid || '')));

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const avatarUrl = appUser?.photoURL || user?.photoURL;
  const displayName = appUser?.displayName || user?.displayName || 'Miembro Kanarii';
  const email = appUser?.email || user?.email || '';
  const roleLabel = isAdmin ? 'Super Admin' : isCommunityAdmin ? 'Admin Comunidad' : 'Miembro';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Avatar Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[#EAE2D6]/40 transition-colors focus:outline-none focus:ring-2 focus:ring-[#CB997E]/50"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Menú de Usuario"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-9 h-9 rounded-full border-2 border-white shadow-sm object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#EAE2D6] border-2 border-white shadow-sm flex items-center justify-center text-[#6B705C]">
            <User className="w-4 h-4" />
          </div>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#FDFBF7] border border-[#EAE2D6] shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Cabecera del Perfil */}
          <div className="p-4 bg-[#F9F7F1] border-b border-[#EAE2D6]">
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-10 h-10 rounded-full border border-[#EAE2D6] object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#EAE2D6] flex items-center justify-center text-[#6B705C]">
                  <User className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[#4A4E4D] truncate">{displayName}</p>
                {email && <p className="text-xs text-stone-400 truncate">{email}</p>}
                <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#6B705C] bg-[#EAE2D6] rounded-full">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Opciones del Menú */}
          <div className="p-1.5 space-y-0.5">
            <button
              onClick={() => handleNavigate('/perfil')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#4A4E4D] hover:bg-[#EAE2D6]/60 transition-colors"
            >
              <User className="w-4 h-4 text-[#6B705C]" />
              <span>Mi Perfil</span>
            </button>

            {appUser?.uid && (
              <button
                onClick={() => handleNavigate(`/p/${appUser.uid}`)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#4A4E4D] hover:bg-[#EAE2D6]/60 transition-colors"
              >
                <Globe className="w-4 h-4 text-[#6B705C]" />
                <span>Pasaporte Universal</span>
              </button>
            )}

            <button
              onClick={() => handleNavigate('/perfil')}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#CB997E] hover:bg-[#CB997E]/10 transition-colors"
            >
              <Send className="w-4 h-4 text-[#CB997E]" />
              <span>Vincular Telegram</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => handleNavigate('/admin')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#4A4E4D] hover:bg-[#EAE2D6]/60 transition-colors"
              >
                <Settings className="w-4 h-4 text-[#6B705C]" />
                <span>Panel de Administración</span>
              </button>
            )}
          </div>

          {/* Logout Footer */}
          <div className="p-1.5 border-t border-[#EAE2D6]/80 bg-stone-50/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
