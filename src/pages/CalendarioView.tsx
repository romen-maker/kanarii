import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import es from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { useComunidad } from '../contexts/ComunidadContext';
import { useEventos } from '../hooks/useEventos';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useAuth } from '../contexts/AuthContext';
import { useEntityActions } from '../hooks/useEntityActions';
import { createEvento, updateEvento, deleteEvento, Evento } from '../lib/appService';
import { CreateEventoModal } from '../components/CreateEventoModal';
import { Plus, Calendar as CalendarIcon, List } from 'lucide-react';

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

export default function CalendarioView() {
  const { appUser } = useAuth();
  const { currentCommunityId } = useComunidad();
  const { eventos, loading } = useEventos(currentCommunityId || appUser?.communityId || 'arteara');
  const { members } = useCommunityMembers(currentCommunityId || 'arteara');
  const { perform, isSubmitting } = useEntityActions();
  
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [initialDates, setInitialDates] = useState<{ start: Date; end: Date } | undefined>();

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
    const payload = {
      ...data,
      communityId: currentCommunityId || appUser?.communityId || 'arteara',
      creadoPor: appUser?.uid
    };

    if (selectedEvento?.id) {
      await perform(updateEvento(selectedEvento.id, payload), {
        successMessage: "Evento actualizado correctamente",
        onSuccess: () => setIsModalOpen(false)
      });
    } else {
      await perform(createEvento(payload), {
        successMessage: "Evento creado en el calendario ✨",
        onSuccess: () => setIsModalOpen(false)
      });
    }
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
    <div className="h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif text-[#4A4E4D]">Calendario Comunitario</h1>
          <p className="text-stone-500 mt-1">Sincroniza el latido de la comunidad</p>
        </div>
        <button
          onClick={() => {
            setSelectedEvento(null);
            setInitialDates(undefined);
            setIsModalOpen(true);
          }}
          className="bg-[#A5A58D] hover:bg-[#6B705C] text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus size={20} />
          <span>Nuevo Evento</span>
        </button>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-6 overflow-hidden flex flex-col">
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

        <div className="flex-1 min-h-[500px]">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A5A58D]"></div>
            </div>
          ) : (
            <Calendar
              localizer={localizer}
              events={eventos}
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
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSaveEvento}
          eventoToEdit={selectedEvento}
          members={members}
          isSubmitting={isSubmitting}
          initialDates={initialDates}
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
  );
}
