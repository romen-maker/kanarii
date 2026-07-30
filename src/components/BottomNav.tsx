import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MoreHorizontal, Compass, ShieldCheck, Scale, ChevronDown, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';
import { navigationConfig } from '../config/navigation';
import { SyncIndicator } from './ui/SyncIndicator';
import { useAcuerdosBadge } from '../hooks/useAcuerdosBadge';


export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { appUser, logout } = useAuth();
  const { comunidad, comunidades, setCommunityId } = useComunidad();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const { acuerdosPendingCount, acuerdosSolicitanteCount } = useAcuerdosBadge();

  const isAdmin = appUser?.role === 'admin';
  const isCommunityAdmin = !!(isAdmin || (comunidad?.adminUids && Array.isArray(comunidad.adminUids) && comunidad.adminUids.includes(appUser?.uid || '')));

  // Filtramos por pertenencia a comunidades
  const hasCommunities = (appUser?.communityIds && appUser.communityIds.length > 0) || isAdmin || !!comunidad?.id;

  // Filtrar comunidades para el selector
  const userComunidades = comunidades.filter(c => {
    if (isAdmin) return true;
    return (appUser?.communityIds || []).includes(c.id) || (comunidad?.id === c.id);
  });

  const availableNavItems = navigationConfig.filter(item => {
    if (item.adminOnly) return isAdmin;
    if (!hasCommunities) {
      return ['Inicio', 'Mi Ficha'].includes(item.label);
    }
    return true;
  });

  // Items extra que no están en el config (Explorar y Solicitudes)
  const extraNavItems = [];

  if (hasCommunities) {
    extraNavItems.push({
      label: 'Explorar comunidades',
      href: '/comunidades',
      icon: Compass,
      color: '#CB997E'
    });
  }

  if (isCommunityAdmin) {
    extraNavItems.push({
      label: 'Solicitudes',
      href: '/admin/solicitudes',
      icon: ShieldCheck
    });
  }

  // Seleccionamos los primeros 4 items para la barra principal
  const mainNavItems = availableNavItems.filter(item => !item.adminOnly).slice(0, 4);
  // El resto van al menú "Más"
  const moreNavItems = [
    ...availableNavItems.filter(item => !item.adminOnly).slice(4),
    ...extraNavItems,
    ...availableNavItems.filter(item => item.adminOnly)
  ];

  const handleNav = (item: any) => {
    if (item.label === 'Marketplace') {
      navigate(item.href, { 
        state: (acuerdosPendingCount > 0 || acuerdosSolicitanteCount > 0)
          ? { initialTab: 'mis_acuerdos' } 
          : undefined 
      });
    } else {
      navigate(item.href);
    }
  };

  const isMarketplaceInMore = moreNavItems.some(item => item.label === 'Marketplace');
  const showMoreDot = isMarketplaceInMore && (acuerdosPendingCount + acuerdosSolicitanteCount) > 0 && location.pathname !== '/soberania';

  return (
    <>
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FDFBF7] border-t border-[#EAE2D6] flex items-center justify-around"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', minHeight: '56px' }}
      >
        {mainNavItems.map((item, idx) => {
          const isReallyActive = item.href === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(item.href);
          
          return (
            <button
              key={idx}
              onClick={() => handleNav(item)}
              className={`flex flex-col items-center justify-center flex-1 h-full min-h-[56px] space-y-1 relative transition-colors ${
                isReallyActive ? 'text-[#6B705C]' : 'text-stone-400'
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.label === 'Marketplace' && (acuerdosPendingCount + acuerdosSolicitanteCount) > 0 && !isReallyActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </div>
              <span className="text-[10px] uppercase tracking-wide">{item.label}</span>
              {isReallyActive && <div className="w-1 h-1 rounded-full bg-[#6B705C] absolute bottom-1" />}
            </button>
          );
        })}
        
        <button
          onClick={() => setIsMoreMenuOpen(true)}
          className={`flex flex-col items-center justify-center flex-1 h-full min-h-[56px] space-y-1 relative transition-colors ${
            isMoreMenuOpen ? 'text-[#6B705C]' : 'text-stone-400'
          }`}
        >
          <div className="relative">
            <MoreHorizontal className="w-5 h-5" />
            {showMoreDot && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </div>
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
            
            {/* Selector de Comunidad en Móvil */}
            {hasCommunities && (
              <div className="bg-[#F9F7F1] border border-[#EAE2D6] rounded-2xl p-3 shadow-sm mb-4">
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <MapPin size={10} className="text-[#CB997E]" />
                  Espacio Activo
                </p>
                {userComunidades.length > 1 ? (
                  <div className="relative flex items-center group/sel">
                    <select
                      value={comunidad?.id || ''}
                      onChange={(e) => {
                        setCommunityId(e.target.value);
                        setIsMoreMenuOpen(false);
                      }}
                      className="appearance-none bg-transparent border-none p-0 pr-6 text-xs text-[#4A4E4D] font-bold focus:ring-0 cursor-pointer w-full truncate"
                    >
                      {userComunidades.map(c => (
                        <option key={c.id} value={c.id}>{c.nombre}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#A5A58D] pointer-events-none group-hover/sel:text-[#6B705C] transition-colors" />
                  </div>
                ) : (
                  <div className="text-xs font-bold text-[#4A4E4D] truncate flex items-center">
                    {comunidad?.nombre || 'General'}
                  </div>
                )}
              </div>
            )}

            {/* Indicador de Sincronización en Móvil */}
            <div className="mb-4">
              <SyncIndicator />
            </div>

            <div className="flex flex-col space-y-2">
              {moreNavItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => { 
                    setIsMoreMenuOpen(false); 
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
                  className="w-full text-left px-5 py-4 rounded-2xl font-medium text-[#4A4E4D] hover:bg-[#EAE2D6] transition-colors flex items-center gap-3"
                >
                  <div className="relative">
                    <item.icon className={`w-5 h-5 ${(item as any).color ? '' : 'text-stone-400'}`} style={{ color: (item as any).color }} />
                    {item.label === 'Marketplace' && (acuerdosPendingCount + acuerdosSolicitanteCount) > 0 && location.pathname !== '/soberania' && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                  {item.label}
                </button>
              ))}
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

