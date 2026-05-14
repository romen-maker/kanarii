import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, ChevronDown, MapPin } from 'lucide-react';
import { navigationConfig } from '../config/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, appUser, logout } = useAuth();
  const { comunidad, comunidades, setCommunityId } = useComunidad();

  const isAdmin = appUser?.role === 'admin';
  
  // Dividimos los items en principales y admin
  const mainNavItems = navigationConfig.filter(item => !item.adminOnly);
  const adminNavItem = navigationConfig.find(item => item.adminOnly);

  return (
    <aside className="hidden md:flex flex-col w-[240px] h-screen sticky top-0 bg-[#FDFBF7] border-r border-[#EAE2D6] overflow-y-auto">
      {/* Header / Logo */}
      <div className="p-8 pb-10">
        <div className="flex items-center gap-3">
          <img src="/icono-palmera.svg" alt="Kanarii" style={{ width: '36px', height: '36px', objectFit: 'contain' }} />
          <h1 className="font-serif text-2xl text-[#4A4E4D] tracking-tight">Kanarii</h1>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1">
        {mainNavItems.map((item, idx) => {
          const isActive = location.pathname === item.href;
          return (
            <button
              key={idx}
              onClick={() => navigate(item.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#EAE2D6] text-[#4A4E4D] font-medium shadow-sm' 
                  : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-[#6B705C]' : 'text-stone-400 group-hover:text-stone-600'}`} />
              <span className="text-sm">{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6B705C]" />}
            </button>
          );
        })}

        {isAdmin && adminNavItem && (
          <div className="pt-6 mt-6 border-t border-stone-200/60">
            <h4 className="px-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Administración</h4>
            <button
              onClick={() => navigate(adminNavItem.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                location.pathname === adminNavItem.href
                  ? 'bg-[#EAE2D6] text-[#4A4E4D] font-medium shadow-sm' 
                  : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
              }`}
            >
              <adminNavItem.icon className={`w-5 h-5 ${location.pathname === adminNavItem.href ? 'text-[#6B705C]' : 'text-stone-400 group-hover:text-stone-600'}`} />
              <span className="text-sm">{adminNavItem.label}</span>
            </button>
          </div>
        )}
      </nav>

      {/* Footer / User Info */}
      <div className="p-4 border-t border-stone-200/60 bg-stone-50/50">
        <div className="flex items-center gap-3 px-2 py-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-[#EAE2D6] border-2 border-white shadow-sm flex items-center justify-center text-[#6B705C]">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#4A4E4D] truncate">{user?.displayName || 'Miembro'}</p>
            {comunidades.length > 1 ? (
              <div className="relative group/sel">
                <select
                  value={comunidad?.id || ''}
                  onChange={(e) => setCommunityId(e.target.value)}
                  className="appearance-none bg-transparent border-none p-0 pr-4 text-[10px] text-[#A5A58D] font-bold focus:ring-0 cursor-pointer w-full truncate"
                >
                  {comunidades.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
                <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#A5A58D] pointer-events-none" />
              </div>
            ) : (
              <div className="flex items-center gap-1 text-[10px] text-[#A5A58D] font-bold">
                <MapPin size={10} />
                <span className="truncate">{comunidad?.nombre || 'General'}</span>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
