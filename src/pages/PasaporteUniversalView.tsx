import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useComunidad } from '../contexts/ComunidadContext';
import { useToast } from '../hooks/useToast';
import { getUserFicha, getTriadaFromFicha, Ficha, getAppUserDoc } from '../lib/appService';
import PasaporteVisual from '../components/perfil/PasaporteVisual';
import { calcularKin } from '../lib/kinMaya';
import { useTranslation } from 'react-i18next';

export function PasaporteUniversalView() {
  const { t } = useTranslation('passport');
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { appUser: currentUser } = useAuth();
  const { setCommunityId } = useComunidad();
  const toast = useToast();

  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [userDoc, setUserDoc] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!uid) {
        setError('ID de usuario no proporcionado.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [fichaData, userData] = await Promise.all([
          getUserFicha(uid),
          getAppUserDoc(uid)
        ]);

        setFicha(fichaData);
        setUserDoc(userData);

        if (!fichaData && !userData) {
          setError('El pasaporte solicitado no está disponible.');
        }
      } catch (err) {
        console.error('Error al cargar pasaporte universal:', err);
        setError('Ocurrió un error al consultar la información.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [uid]);

  // Construir mappedUser
  const triada = ficha ? getTriadaFromFicha(ficha) : { ofrendas: [], saberes: [], necesidades: [] };
  
  let rolesArray: string[] = [];
  if (ficha?.datosOnboarding?.rol_comunidad) {
    rolesArray.push(ficha.datosOnboarding.rol_comunidad);
  }

  const birthDate = ficha?.datosPersona?.fechaNacimiento || ficha?.datosOnboarding?.fechaNacimiento || userDoc?.fechaNacimiento;
  const kinMaya = birthDate ? calcularKin(birthDate) : undefined;

  const mappedUser = {
    name: userDoc?.nombre || userDoc?.displayName || ficha?.datosOnboarding?.nombre || 'Miembro',
    avatarUrl: userDoc?.photoURL || ficha?.datosOnboarding?.plataformaOrigen || undefined,
    roles: rolesArray,
    offerings: triada.ofrendas || [],
    knowledges: triada.saberes || [],
    needs: triada.necesidades || [],
    kinMaya,
    arquetipo: ficha?.perfilVisual?.arquetipo,
    descripcionArquetipo: ficha?.perfilVisual?.descripcion_arquetipo,
    communityIds: userDoc?.communityIds || [],
  };

  // Dinámica de Metatags OG
  useEffect(() => {
    if (!mappedUser.name || loading || error) return;

    const setMetaTag = (property: string, content: string) => {
      let element = document.querySelector(`meta[property="${property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    const prevTitle = document.title;
    document.title = `${mappedUser.name} | Kanarii`;

    setMetaTag('og:title', `${mappedUser.name} en Kanarii`);
    setMetaTag('og:description', `Perfil de ${mappedUser.name}, miembro de comunidades en Kanarii.`);
    setMetaTag('og:url', window.location.href);
    setMetaTag('og:type', 'profile');
    if (mappedUser.avatarUrl) {
      setMetaTag('og:image', mappedUser.avatarUrl);
    }

    return () => {
      document.title = prevTitle;
      ['og:title', 'og:description', 'og:url', 'og:type', 'og:image'].forEach(prop => {
        const element = document.querySelector(`meta[property="${prop}"]`);
        if (element) {
          element.remove();
        }
      });
    };
  }, [mappedUser.name, mappedUser.avatarUrl, loading, error]);

  const isSelf = currentUser?.uid === uid;
  const connectionStatus = isSelf ? 'self' : 'none';

  const handleConnect = () => {
    if (!currentUser) {
      toast.info('Inicia sesión para conectar con este miembro.');
      navigate('/');
      return;
    }

    // Buscar una comunidad común
    const viewerCommunityIds = currentUser.communityIds || [];
    const memberCommunityIds = mappedUser.communityIds || [];
    const commonCommunityId = viewerCommunityIds.find((id: string) => memberCommunityIds.includes(id));

    if (commonCommunityId) {
      setCommunityId(commonCommunityId);
      navigate('/tablon', {
        state: { openNewPostWithMention: mappedUser.name }
      });
    } else {
      toast.info(`Para conectar con ${mappedUser.name}, debes compartir alguna comunidad.`);
      navigate('/comunidades');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF7] text-[#8A817C] p-4">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#A5A58D]" />
        <p className="font-medium font-serif">{t('universalTitle')}</p>
      </div>
    );
  }

  if (error || (!ficha && !userDoc)) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-stone-800">
        <div className="max-w-md w-full text-center space-y-6 bg-white border border-[#D2B48C]/15 rounded-[2.5rem] p-8 shadow-sm">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 border border-rose-100 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#3E2723]">{t('notFoundTitle')}</h1>
          <p className="text-stone-600 text-sm">
            {error || t('notFoundDesc')}
          </p>
          <div className="pt-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 bg-[#5A5A40] hover:bg-[#4A4A35] text-white py-3.5 px-8 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('backToHome')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const shareUrl = `${window.location.origin}/p/${uid}`;
  const shareText = `Conoce a ${mappedUser.name} en Kanarii: ${shareUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Conoce a ${mappedUser.name} en Kanarii`)}`;

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 md:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mb-6 flex justify-between items-center px-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B705C] hover:text-[#5A5A40] transition-colors"
        >
          <ArrowLeft size={14} />
          {t('backToMembers')}
        </button>
        <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#A5A58D]">
          <Sparkles size={12} />
          {t('universalTitle')}
        </div>
      </div>

      <PasaporteVisual 
        user={mappedUser} 
        privacidad={ficha?.privacidad}
        onConnect={handleConnect} 
        connectionStatus={connectionStatus}
      />

      {/* Compartir Pasaporte Section */}
      <div className="w-full max-w-xl mt-6 bg-white border border-[#D2B48C]/15 rounded-[24px] p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <h4 className="text-sm font-serif font-bold text-[#3E2723]">Compartir Pasaporte</h4>
          <p className="text-xs text-[#5D4037]/60 mt-1">Invita a otros a conocer el perfil comunitario</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white py-2.5 px-5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.835-4.82c1.654.982 3.51 1.5 5.409 1.5 5.829 0 10.573-4.742 10.577-10.574.002-2.827-1.098-5.486-3.1-7.488-2.003-2.002-4.665-3.1-7.49-3.102-5.839 0-10.582 4.743-10.586 10.577-.001 1.953.51 3.86 1.48 5.57L2.082 22.18l4.81-1.26zM17.5 14.8c-.28-.14-1.65-.81-1.91-.9-.26-.1-.45-.14-.64.14-.19.28-.73.9-.9.1-.17.18-.32.09-.6-.14-.28-.15-1.22-.45-2.22-1.34-1-1.28-1.79-2.08-2.24-2.48-.4-.36-.08-.55.12-.73.18-.17.4-.46.6-.7.18-.22.25-.38.37-.64.12-.25.06-.47-.03-.66-.09-.18-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49-.16-.01-.36-.01-.56-.01-.2 0-.53.07-.8.36-.28.3-1.05 1.02-1.05 2.5s1.07 2.9 1.22 3.1c.15.19 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.72.22 1.37.19 1.88.11.57-.08 1.65-.67 1.88-1.32.23-.64.23-1.2.16-1.32-.07-.12-.26-.19-.54-.33z"/>
            </svg>
            WhatsApp
          </a>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white py-2.5 px-5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.869 4.326-2.96-.924c-.643-.203-.658-.643.136-.953l11.57-4.46c.537-.193 1.006.12.823.985z"/>
            </svg>
            Telegram
          </a>
        </div>
      </div>
    </div>
  );
}
