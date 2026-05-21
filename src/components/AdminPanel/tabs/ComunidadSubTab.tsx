import { useState, useEffect } from 'react';
import { Search, Filter, RefreshCw, UserMinus, Clock } from 'lucide-react';
import { CommunityMember, FeedbackSalida, listenBajasRecientes } from '../../../lib/appService';

interface ComunidadSubTabProps {
  members: CommunityMember[];
  loadingMembers: boolean;
  onSelectFicha: (userId: string) => void;
  onExpelMember: (member: CommunityMember) => void;
  currentCommunityId: string;
  appUserId?: string;
}

type RolComunitario = 'propietario' | 'miembro' | 'voluntario';

export default function ComunidadSubTab({
  members,
  loadingMembers,
  onSelectFicha,
  onExpelMember,
  currentCommunityId,
  appUserId,
}: ComunidadSubTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'todos' | RolComunitario>('todos');
  const [bajas, setBajas] = useState<FeedbackSalida[]>([]);

  useEffect(() => {
    if (!currentCommunityId) return;
    const unsubscribe = listenBajasRecientes(currentCommunityId, (lista) => {
      setBajas(lista);
    });
    return () => unsubscribe();
  }, [currentCommunityId]);

  const filteredMembers = members.filter(m => {
    // En Firebase el campo es rolComunitario. Fallback a rol para legacy.
    const level = m.rolComunitario || m.rol;
    if (roleFilter !== 'todos' && level !== roleFilter) return false;
    return (
      (m.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (m.rol_comunidad?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] overflow-hidden">
        <div className="p-6 border-b border-[#F9F7F1] flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nombre o rol..."
              className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-[#EAE2D6] outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Filter className="w-4 h-4 text-stone-400 shrink-0" />
            {(['todos', 'propietario', 'miembro', 'voluntario'] as const).map(role => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all whitespace-nowrap ${
                  roleFilter === role
                    ? 'bg-[#4A4E4D] text-white border-[#4A4E4D]'
                    : 'bg-white text-stone-500 border-stone-200 hover:border-stone-300'
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-stone-400 text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Nombre / Rol en Comunidad</th>
                <th className="px-6 py-4">Estado / Rol Comunitario</th>
                <th className="px-6 py-4">Antigüedad</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loadingMembers ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" /> Cargando comunidad...
                  </td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-stone-400 italic">
                    No se encontraron miembros
                  </td>
                </tr>
              ) : (
                filteredMembers.map(member => {
                  const level = member.rolComunitario || member.rol;
                  return (
                    <tr key={member.userId} className="hover:bg-[#FDFBF7] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-medium text-stone-800">{member.nombre}</div>
                        <div className="text-xs text-stone-400">{member.rol_comunidad || 'Sin rol definido'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${member.estado === 'completo' ? 'bg-teal-500' : 'bg-amber-500'}`} />
                          <span className="text-xs font-medium text-stone-600 capitalize">{level || 'Miembro'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-500">{member.antiguedad_anos || 0} años</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => onSelectFicha(member.userId)}
                            className="p-2 hover:bg-[#EAE2D6]/30 text-stone-400 hover:text-[#4A4E4D] rounded-lg transition-all"
                            title="Ver Ficha"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                          {member.userId !== appUserId && (
                            <button
                              onClick={() => onExpelMember(member)}
                              className="p-2 hover:bg-red-50 text-stone-400 hover:text-red-600 rounded-lg transition-all"
                              title="Expulsar Miembro"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sección de Bajas Recientes */}
      {bajas.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] overflow-hidden p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-red-500" />
            <h2 className="font-serif text-xl text-[#4A4E4D]">Bajas Recientes</h2>
          </div>
          <div className="space-y-4">
            {bajas.map((baja) => (
              <div key={baja.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-800">{baja.nombreUsuario || 'Miembro'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider">
                      {baja.motivo}
                    </span>
                  </div>
                  {baja.comentario && (
                    <p className="text-sm text-stone-600 italic mt-1.5">
                      "{baja.comentario}"
                    </p>
                  )}
                </div>
                <div className="text-xs text-stone-400 font-medium">
                  {baja.fecha?.toDate
                    ? baja.fecha.toDate().toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : new Date(baja.fecha).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
