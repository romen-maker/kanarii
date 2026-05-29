import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { AuthGateModal } from '../components/AuthGateModal';
import WelcomeHeroSections from '../components/onboarding/WelcomeHeroSections';
import { useComunidad } from '../contexts/ComunidadContext';
import { usePropuestas } from '../hooks/usePropuestas';
import { useTareas } from '../hooks/useTareas';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useProyectos } from '../hooks/useProyectos';

export function Welcome() {
  const { user, appUser } = useAuth();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Hooks de datos para cuando el usuario está logueado y tiene una comunidad activa
  const { currentCommunityId, loading: loadingCommunity } = useComunidad();
  const { propuestas, loading: loadingPropuestas } = usePropuestas(currentCommunityId || '');
  const { tareas, loading: loadingTareas } = useTareas(currentCommunityId);
  const { members, getMemberName, loading: loadingMembers } = useCommunityMembers(currentCommunityId);
  const { items: proyectos, loading: loadingProyectos } = useProyectos(currentCommunityId);

  useEffect(() => {
    if (appUser) {
      // 0. Si no ha visto el onboarding, forzar recorrido pedagógico
      if (!appUser.hasSeenOnboarding) {
        navigate('/tour');
        return;
      }

      // 1. Prioridad: Ficha pendiente de onboarding
      const pendingFicha = localStorage.getItem('kanarii_pendingFicha');
      if (pendingFicha) {
        navigate('/ficha-preview');
        return;
      }

      // 2. Si no tiene comunidades, forzar descubrimiento
      if (!appUser.communityIds || appUser.communityIds.length === 0) {
        navigate('/comunidades');
        return;
      }

      // 3. Si ya tiene comunidades, mantenemos al usuario en esta raíz que actúa como Dashboard
    }
  }, [appUser, navigate]);

  // Pantalla de carga mientras se sincroniza el estado de la comunidad
  const isLoadingData = loadingCommunity || loadingPropuestas || loadingTareas || loadingMembers || loadingProyectos;
  
  if (appUser && appUser.communityIds && appUser.communityIds.length > 0 && isLoadingData) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#A5A58D] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8A817C] font-serif italic">Sintonizando con el pulso de tu tribu...</p>
        </div>
      </div>
    );
  }

  // Si el usuario está autenticado y tiene comunidades, renderizamos el Dashboard
  if (appUser && appUser.communityIds && appUser.communityIds.length > 0) {
    const totalMiembros = members?.length || 0;
    
    // Conteo de propuestas pendientes de opinión del usuario logueado
    // (status === 'abierta', autor no es el usuario, y el usuario no ha expresado su opinión)
    const propuestasPendientes = propuestas.filter(p => 
      p.status === 'abierta' && 
      p.authorId !== appUser.uid && 
      (!p.userPositions || !p.userPositions[appUser.uid])
    );
    const propuestasPendientesCount = propuestasPendientes.length;

    const communityStatus = propuestasPendientesCount > 0
      ? `Tu comunidad tiene ${propuestasPendientesCount} propuesta${propuestasPendientesCount > 1 ? 's' : ''} esperando tu voz 🌱`
      : 'Tu comunidad está al día. ¡Gracias por participar! ☀️';

    // Propuestas en periodo de objeción
    const propuestasObjecion = propuestas.filter(p => p.status === 'en_objeciones');
    const propuestasObjecionesCount = propuestasObjecion.length;
    let propuestasObjecionesPercent = 0;
    if (propuestasObjecion.length > 0 && totalMiembros > 0) {
      const totalParticipation = propuestasObjecion.reduce((acc, p) => {
        const responses = Object.keys(p.userPositions || {}).length;
        return acc + (responses / totalMiembros);
      }, 0);
      propuestasObjecionesPercent = Math.round((totalParticipation / propuestasObjecion.length) * 100);
    }

    // Propuestas en deliberación (abierta o integrando)
    const propuestasDeliberacion = propuestas.filter(p => p.status === 'abierta' || p.status === 'integrando');
    const propuestasRevisionCount = propuestasDeliberacion.length;
    let propuestasRevisionPercent = 0;
    if (propuestasDeliberacion.length > 0 && totalMiembros > 0) {
      const totalParticipation = propuestasDeliberacion.reduce((acc, p) => {
        const responses = Object.keys(p.userPositions || {}).length;
        return acc + (responses / totalMiembros);
      }, 0);
      propuestasRevisionPercent = Math.round((totalParticipation / propuestasDeliberacion.length) * 100);
    }

    // Tareas activas de círculos
    const tareasActivas = tareas.filter(t => t.estado === 'pendiente' || t.estado === 'en_progreso');
    const tareasActivasCount = tareasActivas.length;
    const tareasAsignadas = tareasActivas.filter(t => Boolean(t.asignadaA));
    const tareasAsignadasCount = tareasAsignadas.length;
    const tareasAsignadasPercent = tareasActivasCount > 0
      ? Math.round((tareasAsignadasCount / tareasActivasCount) * 100)
      : 0;

    // Feed de actividades recientes (propuestas + tareas) ordenado cronológicamente
    const activitiesList: Array<{
      id: string;
      time: string;
      user: string;
      action: string;
      target: string;
      circle: string;
      rawDate: Date;
    }> = [];

    const formatRelativeTime = (timestamp: any): string => {
      if (!timestamp) return 'Recientemente';
      
      let date: Date;
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        date = new Date(timestamp);
      }
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 60) {
        if (diffMins <= 1) return 'Hace un momento';
        return `Hace ${diffMins} min`;
      }
      if (diffHours < 24) {
        if (diffHours === 1) return 'Hace 1 hora';
        return `Hace ${diffHours} horas`;
      }
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 7) return `Hace ${diffDays} días`;
      
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    };

    propuestas.forEach(p => {
      const rawDate = p.updatedAt?.toDate?.() || p.createdAt?.toDate?.() || new Date();
      let actionStr = 'actualizó la propuesta';
      if (p.status === 'borrador') actionStr = 'creó el borrador de';
      else if (p.status === 'abierta') actionStr = 'abrió a opinión';
      else if (p.status === 'en_objeciones') actionStr = 'inició objeciones de';
      else if (p.status === 'integrando') actionStr = 'integra objeciones de';
      else if (p.status === 'acordada') actionStr = 'consensuó';
      else if (p.status === 'descartada') actionStr = 'descartó';

      activitiesList.push({
        id: `p-${p.id}`,
        time: formatRelativeTime(p.updatedAt || p.createdAt),
        user: getMemberName(p.authorId),
        action: actionStr,
        target: p.title,
        circle: 'Círculo General',
        rawDate
      });
    });

    tareas.forEach(t => {
      const rawDate = t.updatedAt?.toDate?.() || t.createdAt?.toDate?.() || new Date();
      let actionStr = 'modificó la tarea';
      if (t.estado === 'pendiente') actionStr = 'creó la tarea';
      else if (t.estado === 'en_progreso') actionStr = 'inició la tarea';
      else if (t.estado === 'completada') actionStr = 'completó la tarea';
      else if (t.estado === 'archivada') actionStr = 'archivó la tarea';

      const proj = proyectos.find(pr => pr.id === t.proyectoId);
      const circleName = proj ? `Círculo ${proj.titulo}` : 'Círculo General';

      activitiesList.push({
        id: `t-${t.id}`,
        time: formatRelativeTime(t.updatedAt || t.createdAt),
        user: getMemberName(t.creadaPor),
        action: actionStr,
        target: t.titulo,
        circle: circleName,
        rawDate
      });
    });

    const recentActivities = activitiesList
      .sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime())
      .slice(0, 5);

    return (
      <div className="min-h-screen bg-[#FDFBF7] text-[#5D4037] p-6 font-sans">
        <div className="max-w-4xl mx-auto flex justify-between items-center pb-6 border-b border-[#EAE2D6] mb-8">
          <div className="flex items-center gap-3">
            <img src="/kanarii-logo.svg" alt="Kanarii" className="w-10 h-10 object-contain" />
            <span className="font-serif text-2xl font-bold text-[#4A4E4D]">Kanarii</span>
          </div>
          <button
            onClick={() => navigate('/ficha')}
            className="flex items-center gap-2 border border-[#EAE2D6] bg-white hover:bg-[#F9F7F1] transition-all px-4 py-2 rounded-2xl shadow-sm text-sm font-medium"
          >
            {appUser.photoURL || user?.photoURL ? (
              <img 
                src={appUser.photoURL || user?.photoURL || ''} 
                alt={appUser.displayName || user?.displayName || 'Avatar'} 
                className="w-6 h-6 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-4 h-4 text-[#6B705C]" />
            )}
            <span>Mi Ficha</span>
          </button>
        </div>
        
        <WelcomeHeroSections
          userName={appUser.displayName || appUser.email?.split('@')[0] || 'Miembro'}
          communityStatus={communityStatus}
          propuestasObjecionesCount={propuestasObjecionesCount}
          propuestasObjecionesPercent={propuestasObjecionesPercent}
          propuestasRevisionCount={propuestasRevisionCount}
          propuestasRevisionPercent={propuestasRevisionPercent}
          tareasActivasCount={tareasActivasCount}
          tareasAsignadasCount={tareasAsignadasCount}
          tareasAsignadasPercent={tareasAsignadasPercent}
          recentActivities={recentActivities}
          onNewProposal={() => navigate('/gobernanza')}
          onViewMinutes={() => navigate('/actas')}
          onGoToBoard={() => navigate('/tablon')}
          onExplorePedagogy={(id) => navigate('/tour')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="flex justify-center mb-4">
          <img src="/kanarii-logo.svg" alt="Kanarii" style={{ width: '140px', height: '140px', objectFit: 'contain' }} />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif text-[#4A4E4D]">Kanarii</h1>
        <h2 className="text-xl md:text-2xl font-light text-[#8A817C] tracking-wide">Tawăzawazt</h2>
        
        <div className="text-lg text-stone-600 leading-relaxed mt-6 space-y-4">
          <p className="font-medium text-[#6B705C]">
            Esto no es un evento, es una forma de vida.
          </p>
          <p>
            Un espacio que congrega a nuestra tribu. Una red que sostiene, cuida
            y hace crecer nuestra revolución interna para expandirla de adentro hacia afuera.
          </p>
        </div>

        <div className="pt-8 space-y-4">
          <button
            onClick={() => navigate('/contexto')}
            className="w-full bg-[#A5A58D] hover:bg-[#6B705C] text-white transition-colors duration-300 py-4 px-6 rounded-2xl text-lg font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-3"
          >
            Unirse a la tribu
          </button>
          
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full py-4 px-6 text-[#A5A58D] hover:text-[#6B705C] transition-colors rounded-2xl text-lg font-medium"
          >
            Ya soy parte (Iniciar sesión)
          </button>

          <button
            onClick={() => navigate('/tour')}
            className="w-full py-3 px-6 text-[#8A817C] hover:text-[#6B705C] transition-colors rounded-2xl text-sm font-medium"
          >
            Conocer la filosofía →
          </button>
          <p className="text-[#CB997E] font-medium font-serif text-xl pt-6">
            Las personas solas pueden llegar a ser poderosas, pero juntas somos invencibles.
          </p>
        </div>
      </div>
      <AuthGateModal
        isOpen={isLoginModalOpen}
        mode="login"
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
