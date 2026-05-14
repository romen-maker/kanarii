import React, { useState } from 'react';
import { usePosts } from '../hooks/usePosts';
import { useCommunityMembers } from '../hooks/useCommunityMembers';
import { useAuth } from '../contexts/AuthContext';
import { useEntityActions } from '../hooks/useEntityActions';
import { createPost, Post } from '../lib/appService';
import { CreatePostModal } from '../components/CreatePostModal';
import { PostDetailModal } from '../components/PostDetailModal';
import { MessageSquare, Plus, Filter, Search } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const CATEGORIAS = [
  { id: 'habilidad', label: 'Habilidad' },
  { id: 'recurso', label: 'Recurso' },
  { id: 'espacio', label: 'Espacio' },
  { id: 'apoyo_emocional', label: 'Apoyo' },
  { id: 'otro', label: 'Otro' }
];

const ESTADOS = [
  { id: 'activo', label: 'Activo' },
  { id: 'en_proceso', label: 'En proceso' },
  { id: 'resuelto', label: 'Resuelto' }
];

export default function Tablon() {
  const { appUser } = useAuth();
  const { posts, loading } = usePosts(appUser?.communityId || 'arteara');
  const { members } = useCommunityMembers();
  const { perform, isSubmitting } = useEntityActions();

  const [activeTab, setActiveTab] = useState<'necesidad' | 'oferta'>('necesidad');
  const [filterCategoria, setFilterCategoria] = useState<string | null>(null);
  const [filterEstado, setFilterEstado] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const filteredPosts = posts.filter(post => {
    if (post.tipo !== activeTab) return false;
    if (filterCategoria && post.categoria !== filterCategoria) return false;
    if (filterEstado && post.estado !== filterEstado) return false;
    return true;
  });

  const handleCreatePost = async (data: any) => {
    const payload = {
      ...data,
      autor_uid: appUser?.uid,
      communityId: appUser?.communityId || 'arteara',
      estado: 'activo'
    };

    await perform(createPost(payload), {
      successMessage: "Publicación creada ✨",
      onSuccess: () => setIsCreateModalOpen(false)
    });
  };

  const getMemberName = (uid: string) => {
    return members.find(m => m.userId === uid)?.nombre || 'Miembro';
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#4A4E4D]">Tablón Comunitario</h1>
          <p className="text-stone-500 mt-1">Colaboración asíncrona y apoyo mutuo</p>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#A5A58D] hover:bg-[#6B705C] text-white px-6 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <Plus size={20} />
          <span className="font-bold">Publicar algo</span>
        </button>
      </div>

      {/* Main Tabs */}
      <div className="flex p-1.5 bg-stone-200/50 backdrop-blur-sm rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('necesidad')}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'necesidad' 
              ? 'bg-[#CB997E] text-white shadow-md' 
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Necesidades
        </button>
        <button
          onClick={() => setActiveTab('oferta')}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'oferta' 
              ? 'bg-[#A5A58D] text-white shadow-md' 
              : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Ofertas
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-6 p-4 bg-white rounded-2xl border border-[#EAE2D6] shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-stone-400" />
          <button
            onClick={() => setFilterCategoria(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${!filterCategoria ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
          >
            Todas
          </button>
          {CATEGORIAS.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategoria(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${filterCategoria === cat.id ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className="h-4 w-[1px] bg-stone-200 hidden md:block" />

        <div className="flex items-center gap-2">
          {ESTADOS.map(est => (
            <button
              key={est.id}
              onClick={() => setFilterEstado(filterEstado === est.id ? null : est.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                filterEstado === est.id 
                  ? 'border-stone-800 bg-stone-800 text-white' 
                  : 'border-stone-200 text-stone-400 hover:border-stone-300'
              }`}
            >
              {est.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A5A58D]"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-dashed border-[#EAE2D6]">
          <div className="w-16 h-16 bg-[#FDFBF7] rounded-full flex items-center justify-center mb-4 text-stone-300">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-serif text-stone-600">No hay {activeTab}s que coincidan</h3>
          <p className="text-stone-400 mt-2">Prueba a cambiar los filtros o sé el primero en publicar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map(post => (
            <div 
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="group bg-white rounded-3xl border border-[#EAE2D6] p-6 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col h-full active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    post.tipo === 'necesidad' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
                  }`}>
                    {post.tipo}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-stone-100 text-stone-500">
                    {post.categoria.replace('_', ' ')}
                  </span>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  post.estado === 'activo' ? 'bg-[#A5A58D]/10 text-[#A5A58D]' : 
                  post.estado === 'en_proceso' ? 'bg-amber-50 text-amber-600' : 
                  'bg-stone-50 text-stone-400'
                }`}>
                  {post.estado.replace('_', ' ')}
                </span>
              </div>

              <h3 className="text-xl font-serif text-[#4A4E4D] mb-2 group-hover:text-[#CB997E] transition-colors leading-tight">
                {post.titulo}
              </h3>
              
              <p className="text-stone-500 text-sm line-clamp-2 mb-6 flex-1">
                {post.descripcion}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-[#FDFBF7]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#EAE2D6] flex items-center justify-center text-[10px] font-bold text-stone-600">
                    {getMemberName(post.autor_uid).charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-stone-700">{getMemberName(post.autor_uid)}</span>
                    <span className="text-[10px] text-stone-400">
                      {formatDistanceToNow(post.creadoEn?.toDate ? post.creadoEn.toDate() : new Date(post.creadoEn), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-[#A5A58D] bg-[#A5A58D]/5 px-3 py-1.5 rounded-xl">
                  <MessageSquare size={14} />
                  <span className="text-xs font-bold">{post.respuestas_count || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <CreatePostModal
          isSubmitting={isSubmitting}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {selectedPost && (() => {
        const livePost = posts.find(p => p.id === selectedPost.id);
        if (!livePost) return null;
        return (
          <PostDetailModal
            post={livePost}
            members={members}
            onClose={() => setSelectedPost(null)}
          />
        );
      })()}
    </div>
  );
}
