import { useEffect, useState } from 'react';
import { Ficha, ensureSeedData, getUserFicha, Acuerdo, Servicio } from '../lib/appService';
import { Leaf, Users, X, Activity, FolderKanban, Handshake, Scale, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useToast } from '../hooks/useToast';
import { useComunidadActions } from '../hooks/useComunidadActions';
import { useTareas } from '../hooks/useTareas';
import { useAcuerdos } from '../hooks/useAcuerdos';
import { useAllServicios } from '../hooks/useAllServicios';
import { useServicioActions } from '../hooks/useServicioActions';
import { useProyectos } from '../hooks/useProyectos';
import { useEventos } from '../hooks/useEventos';
import { useFichas } from '../hooks/useFichas';
import { useDashboardStats } from '../components/AdminPanel/hooks/useDashboardStats';
import AdminPanelModals from '../components/AdminPanel/AdminPanelModals';
import MarketplaceTab from '../components/AdminPanel/tabs/MarketplaceTab';
import ComunidadTab from '../components/AdminPanel/tabs/ComunidadTab';
import DashboardTab from '../components/AdminPanel/tabs/DashboardTab';
import TareasProyectosTab from '../components/AdminPanel/tabs/TareasProyectosTab';
import GobernanzaTab from '../components/AdminPanel/tabs/GobernanzaTab';

import { useTopBar } from '../contexts/TopBarContext';

export function AdminPanel() {
  const { appUser, logout } = useAuth();
  const { currentCommunityId, comunidad } = useComunidad();
  const { setTopBarState, clearTopBarState } = useTopBar();
  const navigate = useNavigate();

  useEffect(() => {
    setTopBarState({
      title: 'Panel Admin',
      actions: (
        <button
          onClick={() => navigate('/cruce')}
          className="px-3.5 py-1.5 bg-white border border-[#CB997E] hover:bg-[#F9F7F1] text-[#CB997E] rounded-xl text-xs font-semibold transition-colors shadow-xs"
        >
          Cruce de Perfiles
        </button>
      )
    });

    return () => clearTopBarState();
  }, [navigate, setTopBarState, clearTopBarState]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab por defecto 'comunidad'. Respetamos ?tab= si ya existe en la URL.
  const currentTab = searchParams.get('tab') || 'comunidad';
  
  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const isAdmin = appUser?.role === 'admin';
  const isCommunityAdmin = !!(isAdmin || (comunidad?.adminUids && Array.isArray(comunidad.adminUids) && comunidad.adminUids.includes(appUser?.uid || '')));

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'comunidad', label: 'Comunidad', icon: Users },
    { id: 'tareas-proyectos', label: 'Tareas & Proyectos', icon: FolderKanban },
    { id: 'marketplace-acuerdos', label: 'Marketplace & Acuerdos', icon: Handshake },
    { id: 'gobernanza', label: 'Gobernanza', icon: Scale },
  ];

  const { members, loading: loadingMembers, getMemberName } = useCommunityMembers(currentCommunityId);
  const { items: tareas, loading: loadingTareas, reload: fetchTareas } = useTareas(currentCommunityId);
  const [selectedFicha, setSelectedFicha] = useState<Ficha | null>(null);

  const toast = useToast();
  
  const { expulsarMiembro } = useComunidadActions();
  const [memberToExpel, setMemberToExpel] = useState<any | null>(null);

  // Marketplace & Acuerdos state & hooks
  const { acuerdos, loading: loadingAcuerdos } = useAcuerdos(currentCommunityId || '');
  const { servicios: allServicios, loading: loadingServicios } = useAllServicios(currentCommunityId || '');
  const { items: proyectos, loading: loadingProyectos } = useProyectos(currentCommunityId);
  const { eventos, loading: loadingEventos } = useEventos(currentCommunityId || '');
  const { fichas, loading: loadingFichas } = useFichas(currentCommunityId);
  const { editServicio } = useServicioActions();

  const [selectedAcuerdo, setSelectedAcuerdo] = useState<Acuerdo | null>(null);
  const [servicioToDeactivate, setServicioToDeactivate] = useState<Servicio | null>(null);

  const handleConfirmExpulsar = async () => {
    if (!memberToExpel || !currentCommunityId) return;
    const target = memberToExpel;
    setMemberToExpel(null);
    await expulsarMiembro(target.userId, currentCommunityId);
  };

  useEffect(() => {
    if (appUser) {
      ensureSeedData(appUser.uid);
    }
  }, [appUser]);

  const dashboardStats = useDashboardStats({ members, fichas, tareas, proyectos, eventos, allServicios, acuerdos });

  const handleSelectMember = async (userId: string) => {
    try {
      const fullProfile = await getUserFicha(userId);
      setSelectedFicha(fullProfile);
    } catch (err) {
      toast.error('No se pudo cargar el perfil completo');
    }
  };
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 p-6 flex flex-col items-center pb-20 md:pb-6">
      <div className="w-full max-w-5xl">

        {/* Banner de bienvenida si la comunidad se acaba de crear */}
        {searchParams.get('nueva') === 'true' && (
          <div className="mb-8 p-6 bg-[#F4F1DE]/80 border border-[#E07A5F]/30 rounded-2xl flex items-start gap-4 shadow-sm relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#E07A5F]" />
            <div className="p-3 bg-[#E07A5F]/10 text-[#E07A5F] rounded-xl shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#E07A5F]">¡Comunidad creada con éxito!</h3>
              <p className="text-stone-600 text-sm leading-relaxed font-sans">
                Te damos la bienvenida a <strong>{searchParams.get('nombre') || comunidad?.nombre || 'tu nueva comunidad'}</strong>. Ya eres el/la fundador/a de este espacio. Puedes empezar a invitar a miembros, configurar proyectos, gestionar el tablón y la economía local.
              </p>
              <div className="pt-2 flex gap-4">
                <a
                  href={`/c/${searchParams.get('slug') || comunidad?.slug || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-[#E07A5F] hover:text-[#C55A3F] flex items-center gap-1 transition-colors"
                >
                  Ver ficha pública <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
            <button
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('nueva');
                newParams.delete('nombre');
                newParams.delete('slug');
                setSearchParams(newParams);
              }}
              className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition-all shrink-0 font-sans"
              aria-label="Cerrar banner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#EAE2D6] overflow-x-auto whitespace-nowrap scrollbar-none gap-2 md:gap-6 mb-8 scroll-smooth">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'border-[#CB997E] text-[#CB997E]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {currentTab === 'dashboard' && (
          <DashboardTab
            dashboardStats={dashboardStats}
            loading={loadingMembers || loadingTareas || loadingAcuerdos || loadingServicios || loadingProyectos || loadingEventos || loadingFichas}
            allServicios={allServicios}
            getMemberName={getMemberName}
          />
        )}

        {currentTab === 'comunidad' && (
          <ComunidadTab
            members={members}
            loadingMembers={loadingMembers}
            tareas={tareas}
            loadingTareas={loadingTareas}
            getMemberName={getMemberName}
            onSelectFicha={handleSelectMember}
            onExpelMember={setMemberToExpel}
            onReloadTareas={fetchTareas}
            currentCommunityId={currentCommunityId || ''}
            appUserId={appUser?.uid}
          />
        )}

        {currentTab === 'tareas-proyectos' && <TareasProyectosTab />}

        {currentTab === 'marketplace-acuerdos' && (
          <MarketplaceTab
            acuerdos={acuerdos}
            allServicios={allServicios}
            loadingAcuerdos={loadingAcuerdos}
            loadingServicios={loadingServicios}
            getMemberName={getMemberName}
            onSelectAcuerdo={setSelectedAcuerdo}
            onDeactivateServicio={setServicioToDeactivate}
          />
        )}

        {currentTab === 'gobernanza' && <GobernanzaTab />}
      </div>

      <AdminPanelModals
        selectedFicha={selectedFicha}
        onCloseFicha={() => setSelectedFicha(null)}
        memberToExpel={memberToExpel}
        onCloseExpel={() => setMemberToExpel(null)}
        onConfirmExpel={handleConfirmExpulsar}
        selectedAcuerdo={selectedAcuerdo}
        onCloseAcuerdo={() => setSelectedAcuerdo(null)}
        servicioToDeactivate={servicioToDeactivate}
        onCloseDeactivate={() => setServicioToDeactivate(null)}
        onConfirmDeactivate={async (target) => {
          setServicioToDeactivate(null);
          try {
            await editServicio(target.id, { isActive: false });
            toast.success('Servicio desactivado correctamente');
          } catch (err) {
            toast.error('No se pudo desactivar el servicio');
          }
        }}
        members={members}
        getMemberName={getMemberName}
        allServicios={allServicios}
        toast={toast}
      />
    </div>
  );
}
