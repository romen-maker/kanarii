import React, { useState, useEffect } from 'react';
import { Post, Respuesta, getRespuestas, createRespuesta, updatePost, deletePost } from '../lib/appService';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { MessageSquare, Trash2, CheckCircle, Clock, Send, ShieldAlert, Pencil, Save, XCircle } from 'lucide-react';
import { useEntityActions } from '../hooks/useEntityActions';
import { useUndoableDelete } from '../hooks/useUndoableDelete';

interface PostDetailModalProps {
  post: Post;
  members: any[];
  onClose: () => void;
}

const CATEGORIAS = [
  { id: 'habilidad', label: 'Habilidad' },
  { id: 'recurso', label: 'Recurso' },
  { id: 'espacio', label: 'Espacio' },
  { id: 'apoyo_emocional', label: 'Apoyo' },
  { id: 'otro', label: 'Otro' }
];

export function PostDetailModal({ post, members, onClose }: PostDetailModalProps) {
  const { appUser } = useAuth();
  const { perform, isSubmitting: isActionSubmitting } = useEntityActions();
  const { startDelete } = useUndoableDelete();
  
  const [respuestas, setRespuestas] = useState<Respuesta[]>([]);
  const [loadingRes, setLoadingRes] = useState(true);
  const [nuevaRespuesta, setNuevaRespuesta] = useState('');
  const [isSubmittingRes, setIsSubmittingRes] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    titulo: post.titulo,
    descripcion: post.descripcion,
    categoria: post.categoria
  });

  // Actualizar editData si post cambia por fuera (live prop)
  useEffect(() => {
    if (!isEditing) {
      setEditData({
        titulo: post.titulo,
        descripcion: post.descripcion,
        categoria: post.categoria
      });
    }
  }, [post, isEditing]);

  useEffect(() => {
    loadRespuestas();
  }, [post.id]);

  const loadRespuestas = async () => {
    if (!post.id) return;
    try {
      const data = await getRespuestas(post.id);
      setRespuestas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRes(false);
    }
  };

  const handleAddRespuesta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaRespuesta.trim() || !post.id || !appUser) return;

    setIsSubmittingRes(true);
    try {
      await createRespuesta(post.id, {
        texto: nuevaRespuesta.trim(),
        autor_uid: appUser.uid
      });
      setNuevaRespuesta('');
      await loadRespuestas();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingRes(false);
    }
  };

  const handleUpdateEstado = async (nuevoEstado: Post['estado']) => {
    if (!post.id) return;
    await perform(updatePost(post.id, { estado: nuevoEstado }), {
      successMessage: `Estado actualizado a ${nuevoEstado.replace('_', ' ')}`
    });
  };

  const handleSaveEdit = async () => {
    if (!post.id) return;
    await perform(updatePost(post.id, editData), {
      successMessage: "Publicación actualizada correctamente",
      onSuccess: () => setIsEditing(false)
    });
  };

  const handleDelete = () => {
    if (!post.id) return;
    startDelete(post.id, {
      onDelete: (id) => perform(deletePost(id)),
      successMessage: "Publicación eliminada",
      onSuccess: onClose
    });
  };

  const getMemberName = (uid: string) => {
    return members.find(m => m.userId === uid)?.nombre || 'Miembro';
  };

  const isOwner = appUser?.uid === post.autor_uid;
  const isAdmin = appUser?.role === 'admin';

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#EAE2D6] flex justify-between items-start bg-[#FDFBF7]">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                post.tipo === 'necesidad' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
              }`}>
                {post.tipo}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500">
                {post.categoria.replace('_', ' ')}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                post.estado === 'activo' ? 'bg-[#A5A58D] text-white' : 
                post.estado === 'en_proceso' ? 'bg-amber-100 text-amber-700' : 
                'bg-stone-200 text-stone-500'
              }`}>
                {post.estado.replace('_', ' ')}
              </span>
            </div>
            {isEditing ? (
              <div className="space-y-3 mt-4">
                <input
                  type="text"
                  value={editData.titulo}
                  onChange={e => setEditData({ ...editData, titulo: e.target.value })}
                  className="w-full text-xl font-serif border-[#EAE2D6] rounded-xl focus:ring-[#CB997E] focus:border-[#CB997E]"
                  placeholder="Título de la publicación"
                />
                <select
                  value={editData.categoria}
                  onChange={e => setEditData({ ...editData, categoria: e.target.value as any })}
                  className="w-full text-xs font-bold border-[#EAE2D6] rounded-xl focus:ring-[#CB997E] focus:border-[#CB997E]"
                >
                  {CATEGORIAS.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-serif text-[#4A4E4D] leading-tight">{post.titulo}</h2>
                <div className="flex items-center gap-2 mt-2 text-xs text-stone-400">
                  <div className="w-5 h-5 rounded-full bg-[#EAE2D6] flex items-center justify-center text-[10px] font-bold text-stone-600">
                    {getMemberName(post.autor_uid).charAt(0)}
                  </div>
                  <span>Por {getMemberName(post.autor_uid)}</span>
                  <span>•</span>
                  <span>{formatDistanceToNow(post.creadoEn?.toDate ? post.creadoEn.toDate() : new Date(post.creadoEn), { addSuffix: true, locale: es })}</span>
                </div>
              </>
            )}
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 transition-colors p-1"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {isEditing ? (
            <textarea
              value={editData.descripcion}
              onChange={e => setEditData({ ...editData, descripcion: e.target.value })}
              rows={6}
              className="w-full text-sm text-stone-700 border-[#EAE2D6] rounded-2xl focus:ring-[#CB997E] focus:border-[#CB997E] bg-stone-50"
              placeholder="Describe lo que necesitas u ofreces..."
            />
          ) : (
            <div className="text-stone-700 leading-relaxed whitespace-pre-wrap">
              {post.descripcion}
            </div>
          )}

          {/* Acciones del Propietario/Admin */}
          {(isOwner || isAdmin) && (
            <div className="p-4 bg-[#FDFBF7] rounded-2xl border border-[#EAE2D6] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={isActionSubmitting}
                      className="flex items-center gap-2 bg-[#A5A58D] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#6B705C] transition-all"
                    >
                      <Save size={16} />
                      Guardar
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 bg-white border border-[#EAE2D6] text-stone-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-stone-50 transition-all"
                    >
                      <XCircle size={16} />
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">Gestionar:</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleUpdateEstado('activo')}
                          className={`p-2 rounded-lg transition-all ${post.estado === 'activo' ? 'bg-[#A5A58D] text-white shadow-sm' : 'hover:bg-white text-stone-400'}`}
                          title="Marcar como Activo"
                        >
                          <Clock size={18} />
                        </button>
                        <button
                          onClick={() => handleUpdateEstado('en_proceso')}
                          className={`p-2 rounded-lg transition-all ${post.estado === 'en_proceso' ? 'bg-amber-500 text-white shadow-sm' : 'hover:bg-white text-stone-400'}`}
                          title="Marcar En Proceso"
                        >
                          <ShieldAlert size={18} />
                        </button>
                        <button
                          onClick={() => handleUpdateEstado('resuelto')}
                          className={`p-2 rounded-lg transition-all ${post.estado === 'resuelto' ? 'bg-stone-500 text-white shadow-sm' : 'hover:bg-white text-stone-400'}`}
                          title="Marcar como Resuelto"
                        >
                          <CheckCircle size={18} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 rounded-lg text-[#A5A58D] hover:bg-white transition-all"
                      title="Editar contenido"
                    >
                      <Pencil size={18} />
                    </button>
                  </>
                )}
              </div>
              
              {!isEditing && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-600 transition-colors px-3 py-2 rounded-xl hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              )}
            </div>
          )}

          {/* Respuestas */}
          <div className="space-y-4">
            <h3 className="text-lg font-serif text-[#4A4E4D] flex items-center gap-2">
              <MessageSquare size={20} className="text-[#A5A58D]" />
              Respuestas ({post.respuestas_count || 0})
            </h3>
            
            <div className="space-y-4">
              {loadingRes ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#A5A58D]"></div>
                </div>
              ) : respuestas.length === 0 ? (
                <p className="text-stone-400 text-sm italic text-center py-4">Sin respuestas aún. ¡Sé el primero en participar!</p>
              ) : (
                respuestas.map(res => (
                  <div key={res.id} className="flex gap-3 bg-[#FDFBF7]/50 p-4 rounded-2xl border border-transparent hover:border-[#EAE2D6] transition-all">
                    <div className="w-8 h-8 rounded-full bg-[#EAE2D6] flex-shrink-0 flex items-center justify-center text-xs font-bold text-stone-600">
                      {getMemberName(res.autor_uid).charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-bold text-stone-700">{getMemberName(res.autor_uid)}</span>
                        <span className="text-[10px] text-stone-400">
                          {formatDistanceToNow(res.creadoEn?.toDate ? res.creadoEn.toDate() : new Date(res.creadoEn), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 whitespace-pre-wrap">{res.texto}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer: Input Respuesta */}
        {appUser && (
          <div className="p-4 border-t border-[#EAE2D6] bg-white">
            <form onSubmit={handleAddRespuesta} className="flex gap-2">
              <input
                type="text"
                value={nuevaRespuesta}
                onChange={e => setNuevaRespuesta(e.target.value)}
                placeholder="Escribe una respuesta..."
                className="flex-1 rounded-xl border-[#EAE2D6] focus:border-[#CB997E] focus:ring-[#CB997E] text-sm"
                disabled={isSubmittingRes}
              />
              <button
                type="submit"
                disabled={isSubmittingRes || !nuevaRespuesta.trim()}
                className="bg-[#A5A58D] hover:bg-[#6B705C] text-white p-2 rounded-xl transition-all disabled:opacity-50 shadow-sm"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
