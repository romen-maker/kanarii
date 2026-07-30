import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { useComunidad } from '../contexts/ComunidadContext';
import { useEventos } from '../hooks/useEventos';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useAuth } from '../contexts/AuthContext';
import { useEventoActions } from '../hooks/useEventoActions';
import { Evento } from '../lib/appService';
import { CreateEventoModal } from '../components/CreateEventoModal';
import { Plus, Calendar as CalendarIcon, List } from 'lucide-react';
import { useUndoableDelete } from '../hooks/useUndoableDelete';
import { PageHeader } from '../components/ui/PageHeader';
import { PageContainer } from '../components/ui/PageContainer';
import { useTopBarActions } from '../hooks/useTopBarActions';
import { kinDeHoy } from '../lib/kinMaya';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const EVENT_COLORS: Record<string, string> = {
  reunion: '#A5A58D',      // Sage
  tarea_comunal: '#CB997E', // Terracotta
  visita: '#DDBEA9',       // Sand
  celebracion: '#B7B7A4',   // Moss
  otro: '#6B705C',         // Dark Olive
};

const sanitize = <T extends Record<string, any>>(obj: T): T =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as unknown as T;

export default function CalendarioView() {
  const { appUser } = useAuth();
  const { currentCommunityId, comunidad } = useComunidad();
  const { eventos, loading } = useEventos(currentCommunityId || appUser?.communityId || 'arteara');
  const { members } = useCommunityMembers(currentCommunityId || 'arteara');
  const { startDelete, pendingId } = useUndoableDelete();
  const { addEvento, editEvento, removeEvento, isExecuting: isSubmitting } = useEventoActions();
  
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [initialDates, setInitialDates] = useState<{ start: Date; end: Date } | undefined>();

  const isAdmin = comunidad?.adminUids?.includes(appUser?.uid || '') || false;
  const isCreator = selectedEvento ? appUser?.uid === selectedEvento.creadoPor : true;
  const canEdit = !selectedEvento || isCreator || isAdmin;

  const filteredEventos = eventos.filter(e => e.id !== pendingId);

  const openAddEvento = useCallback(() => {
    setSelectedEvento(null);
    setInitialDates(undefined);
    setIsModalOpen(true);
  }, []);

  const topBarActionBtn = useMemo(() => (
    <button
      onClick={openAddEvento}
      className="bg-[#2C4C3B] hover:bg-[#1E3529] text-white px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
      title="Añadir evento"
    >
      <Plus className="w-4 h-4 text-emerald-300" />
      <span className="hidden sm:inline">Añadir evento</span>
      <span className="sm:hidden">Añadir</span>
    </button>
  ), [openAddEvento]);

  useTopBarActions(topBarActionBtn, [topBarActionBtn]);

  const getEventoToEdit = () => {
    if (!selectedEvento) return null;
    const { creadoPor, ...resto } = selectedEvento;
    return resto;
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setInitialDates({ start, end });
    setSelectedEvento(null);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (evento: Evento) => {
    setSelectedEvento(evento);
    setIsModalOpen(true);
  };

  const handleSaveEvento = async (data: any) => {
    if (selectedEvento?.id) {
      // Hacemos spread del evento original omitiendo id y creadoEn para no enviarlos,
      // preservando el creadoPor y el communityId original si existían.
      const { id, creadoEn, ...eventoOriginal } = selectedEvento;
      const payload = sanitize({
        ...eventoOriginal,
        ...data,
        communityId: selectedEvento.communityId || currentCommunityId || appUser?.communityId || 'arteara',
      });

      await editEvento(selectedEvento.id, payload, {
        successMessage: "Evento actualizado correctamente",
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      const payload = sanitize({
        ...data,
        communityId: currentCommunityId || appUser?.communityId || 'arteara',
        creadoPor: appUser?.uid
      });

      await addEvento(payload, {
        successMessage: "Evento creado en el calendario ✨",
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  const handleDeleteEvento = (id: string) => {
    startDelete(id, {
      onDelete: (eid) => removeEvento(eid),
      successMessage: "Evento eliminado correctamente"
    });
    setIsModalOpen(false);
  };

  const eventPropGetter = (event: any) => {
    const backgroundColor = EVENT_COLORS[event.tipo as string] || EVENT_COLORS.otro;
    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block'
      }
    };
  };

  return (
    <PageContainer>
      <PageHeader
        title="Calendario Comunitario"
        subtitle={`Sincroniza el latido de la comunidad · ${kinDeHoy().emoji} Kin ${kinDeHoy().kin} — ${kinDeHoy().sello} ${kinDeHoy().nombreTono}`}
        icon={CalendarIcon}
        hideRightActions={true}
      />

      <div className="p-6 space-y-6">

      <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-6 overflow-hidden">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setView(Views.MONTH)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view === Views.MONTH ? 'bg-[#FDFBF7] text-[#A5A58D] border border-[#A5A58D]' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            Mes
          </button>
          <button
            onClick={() => setView(Views.AGENDA)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${view === Views.AGENDA ? 'bg-[#FDFBF7] text-[#A5A58D] border border-[#A5A58D]' : 'text-stone-500 hover:bg-stone-50'}`}
          >
            Agenda
          </button>
        </div>

        <div style={{ height: '520px' }}>
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A5A58D]"></div>
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={filteredEventos}
              startAccessor="inicio"
              endAccessor="fin"
              titleAccessor="titulo"
              allDayAccessor="todoElDia"
              style={{ height: '100%' }}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable
              view={view}
              onView={(v) => setView(v)}
              date={date}
              onNavigate={(d) => setDate(d)}
              culture="es"
              messages={{
                next: "Sig.",
                previous: "Ant.",
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
                agenda: "Agenda",
                date: "Fecha",
                time: "Hora",
                event: "Evento",
                noEventsInRange: "No hay eventos en este rango.",
              }}
              eventPropGetter={eventPropGetter}
              className="font-sans text-stone-700"
            />
          )}
        </div>
      </div>

      {isModalOpen && (
        <CreateEventoModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSaveEvento}
          eventoToEdit={getEventoToEdit()}
          members={members}
          isSubmitting={isSubmitting}
          initialDates={initialDates}
          canEdit={canEdit}
          onDelete={handleDeleteEvento}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 12px 0;
          font-weight: 600;
          color: #6B705C;
          border-bottom: 2px solid #FDFBF7 !important;
        }
        .rbc-off-range-bg {
          background: #FDFBF7;
        }
        .rbc-today {
          background-color: #FDFBF7 !important;
        }
        .rbc-event {
          padding: 4px 8px;
          font-size: 0.85rem;
        }
        .rbc-toolbar button {
          border-radius: 12px;
          color: #6B705C;
          border: 1px solid #EAE2D6;
          padding: 6px 12px;
          transition: all 0.2s;
        }
        .rbc-toolbar button:hover {
          background-color: #FDFBF7;
          border-color: #A5A58D;
          color: #A5A58D;
        }
        .rbc-toolbar button.rbc-active {
          background-color: #A5A58D;
          color: white;
          border-color: #A5A58D;
          box-shadow: none;
        }
        .rbc-month-view, .rbc-time-view, .rbc-agenda-view {
          border-radius: 16px;
          border: 1px solid #EAE2D6;
        }
        .rbc-agenda-view table.rbc-agenda-table {
          border: none;
        }
        .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
          border-bottom: 2px solid #FDFBF7;
          color: #6B705C;
        }
      `}} />
      </div>
    </PageContainer>
  );
}
