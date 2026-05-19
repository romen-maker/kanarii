import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, ChevronDown, MapPin, Compass, ShieldCheck, Scale } from 'lucide-react';
import { navigationConfig } from '../config/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';
import { listenSolicitudes, listenAcuerdosPendientesAsProvider, listenAcuerdosActivosAsSolicitante, Acuerdo } from '../lib/appService';
import { useState, useEffect } from 'react';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, appUser, logout } = useAuth();
  const { comunidad, comunidades, setCommunityId } = useComunidad();
  const [pendingCount, setPendingCount] = useState(0);
  const [acuerdosPendingCount, setAcuerdosPendingCount] = useState(0);
  const [acuerdosSolicitante, setAcuerdosSolicitante] = useState<Acuerdo[]>([]);

  const isAdmin = appUser?.role === 'admin';
  const isCommunityAdmin = !!(isAdmin || (comunidad?.adminUids && Array.isArray(comunidad.adminUids) && comunidad.adminUids.includes(appUser?.uid || '')));

  useEffect(() => {
    // Si no hay comunidad, no somos admin de comunidad, o no hay usuario, limpiar y salir
    if (!comunidad?.id || !isCommunityAdmin || !appUser?.uid) {
      setPendingCount(0);
      return;
    }

    try {
      const unsubscribe = listenSolicitudes(comunidad.id, (list) => {
        const count = list.filter(s => s.estado === 'pendiente').length;
        setPendingCount(count);
      });
      return () => unsubscribe();
    } catch (error) {
      console.error("Error suscribiéndose a solicitudes:", error);
      setPendingCount(0);
    }
  }, [comunidad?.id, isCommunityAdmin, appUser?.uid]);

  useEffect(() => {
    if (!comunidad?.id || !appUser?.uid) {
      setAcuerdosPendingCount(0);
      return;
    }

    try {
      const unsubscribe = listenAcuerdosPendientesAsProvider(
        comunidad.id,
        appUser.uid,
        (count) => {
          setAcuerdosPendingCount(count);
        }
      );
      return () => unsubscribe();
    } catch (error) {
      console.error("Error suscribiéndose a acuerdos pendientes:", error);
      setAcuerdosPendingCount(0);
    }
  }, [comunidad?.id, appUser?.uid]);

  useEffect(() => {
    if (!comunidad?.id || !appUser?.uid) {
      setAcuerdosSolicitante([]);
      return;
    }

    try {
      const unsubscribe = listenAcuerdosActivosAsSolicitante(
        comunidad.id,
        appUser.uid,
        (acuerdos) => {
          setAcuerdosSolicitante(acuerdos);
        }
      );
      return () => unsubscribe();
    } catch (error) {
      console.error("Error suscribiéndose a acuerdos activos del solicitante:", error);
      setAcuerdosSolicitante([]);
    }
  }, [comunidad?.id, appUser?.uid]);

  useEffect(() => {
    if (location.pathname === '/soberania' && appUser?.uid) {
      localStorage.setItem(`kanarii_last_soberania_visit_${appUser.uid}`, new Date().toISOString());
    }
  }, [location.pathname, appUser?.uid]);

  const lastVisitKey = appUser?.uid ? `kanarii_last_soberania_visit_${appUser.uid}` : null;
  const lastVisitStr = lastVisitKey ? localStorage.getItem(lastVisitKey) : null;
  const lastVisit = lastVisitStr ? new Date(lastVisitStr) : new Date(0);

  const acuerdosSolicitanteCount = acuerdosSolicitante.filter(a => {
    const updatedTime = a.actualizadoEn?.toDate?.() ?? 
      (a.actualizadoEn instanceof Date ? a.actualizadoEn : 
      (a.actualizadoEn ? new Date(a.actualizadoEn) : new Date(0)));
    return updatedTime > lastVisit;
  }).length;
  
  // Dividimos los items en principales y admin
  const hasCommunities = (appUser?.communityIds && appUser.communityIds.length > 0) || isAdmin || !!comunidad?.id;

  // Filtrar comunidades para el selector
  const userComunidades = comunidades.filter(c => {
    if (isAdmin) return true;
    return (appUser?.communityIds || []).includes(c.id) || (comunidad?.id === c.id);
  });

  const mainNavItems = navigationConfig.filter(item => {
    if (item.adminOnly) return false;
    // Si el usuario no tiene comunidades, solo permitimos Inicio y Ficha
    if (!hasCommunities) {
      return ['Inicio', 'Mi Ficha'].includes(item.label);
    }
    return true;
  });
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
          const isActive = item.href === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.href);
          return (
            <button
              key={idx}
              onClick={() => {
                if (item.label === 'Marketplace') {
                  navigate(item.href, { 
                    state: (acuerdosPendingCount > 0 || acuerdosSolicitanteCount > 0)
                      ? { initialTab: 'mis_acuerdos' } 
                      : undefined 
                  });
                } else {
                  navigate(item.href);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#EAE2D6] text-[#4A4E4D] font-medium shadow-sm' 
                  : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-[#6B705C]' : 'text-stone-400 group-hover:text-stone-600'}`} />
              <span className="text-sm">{item.label}</span>
              {item.label === 'Marketplace' && (acuerdosPendingCount + acuerdosSolicitanteCount) > 0 && !isActive && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                  {acuerdosPendingCount + acuerdosSolicitanteCount}
                </span>
              )}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6B705C]" />}
            </button>
          );
        })}


        {/* Explorar comunidades (Solo si ya es miembro) */}
        {appUser?.communityIds && appUser.communityIds.length > 0 && (
          <button
            onClick={() => navigate('/comunidades')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              location.pathname === '/comunidades'
                ? 'bg-[#EAE2D6] text-[#4A4E4D] font-medium shadow-sm' 
                : 'text-[#CB997E] hover:bg-[#CB997E]/10'
            }`}
          >
            <Compass className={`w-5 h-5 ${location.pathname === '/comunidades' ? 'text-[#CB997E]' : 'text-[#CB997E] group-hover:text-[#B58368]'}`} />
            <span className="text-sm font-medium">Explorar comunidades</span>
          </button>
        )}
        {/* Solicitudes de acceso (Solo admins de la comunidad) */}
        {isCommunityAdmin && (
          <button
            onClick={() => navigate('/admin/solicitudes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              location.pathname === '/admin/solicitudes'
                ? 'bg-[#EAE2D6] text-[#4A4E4D] font-medium shadow-sm' 
                : 'text-stone-500 hover:bg-stone-100 hover:text-stone-700'
            }`}
          >
            <ShieldCheck className={`w-5 h-5 ${location.pathname === '/admin/solicitudes' ? 'text-[#6B705C]' : 'text-stone-400 group-hover:text-stone-600'}`} />
            <span className="text-sm">Solicitudes</span>
            {pendingCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
        )}

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
            {userComunidades.length > 1 ? (
              <div className="relative group/sel">
                <select
                  value={comunidad?.id || ''}
                  onChange={(e) => setCommunityId(e.target.value)}
                  className="appearance-none bg-transparent border-none p-0 pr-4 text-[10px] text-[#A5A58D] font-bold focus:ring-0 cursor-pointer w-full truncate"
                >
                  {userComunidades.map(c => (
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
