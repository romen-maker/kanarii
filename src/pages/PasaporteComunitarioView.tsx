import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { useComunidad } from '../contexts/ComunidadContext';
import { getUserFicha, getMemberInfo, getTriadaFromFicha, Ficha } from '../lib/appService';
import PasaporteVisual from '../components/perfil/PasaporteVisual';
import { calcularKin } from '../lib/kinMaya';
import { useMemberConnection } from '../hooks/useMemberConnection';
import { useToast } from '../hooks/useToast';

export function PasaporteComunitarioView() {
  const { slug, userId } = useParams<{ slug: string; userId: string }>();
  const navigate = useNavigate();
  const { setCommunityId } = useComunidad();
  const toast = useToast();

  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [memberInfo, setMemberInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { 
    connection, 
    connect, 
    accept, 
    disconnect, 
    isSender, 
    isSelf 
  } = useMemberConnection(userId, slug);

  useEffect(() => {
    async function loadData() {
      if (!userId || !slug) {
        setError('Parámetros de URL inválidos.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Ejecutar las dos llamadas en paralelo para optimizar la velocidad
        const [fichaData, memberData] = await Promise.all([
          getUserFicha(userId),
          getMemberInfo(userId, slug)
        ]);

        setFicha(fichaData);
        setMemberInfo(memberData);

        if (!fichaData && !memberData) {
          setError('No se encontró información del miembro o su ficha en esta comunidad.');
        }
      } catch (err) {
        console.error('Error al cargar datos del pasaporte:', err);
        setError('Ocurrió un error al cargar la información del miembro.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [userId, slug]);

  const handleConnect = async () => {
    if (isSelf) return;

    try {
      if (!connection) {
        await connect();
        toast.success('Solicitud de conexión enviada');
      } else {
        await disconnect();
        if (connection.status === 'connected') {
          toast.info('Conexión eliminada');
        } else {
          toast.info('Solicitud de conexión cancelada');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al procesar la conexión');
    }
  };

  const handleAccept = async () => {
    try {
      await accept();
      toast.success('¡Conexión aceptada! Ahora están conectados.');
    } catch (err) {
      console.error(err);
      toast.error('Error al aceptar la conexión');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FDFBF7] text-[#8A817C] p-4">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-[#A5A58D]" />
        <p className="font-medium font-serif">Cargando pasaporte comunitario...</p>
      </div>
    );
  }

  if (error || (!ficha && !memberInfo)) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-stone-800">
        <div className="max-w-md w-full text-center space-y-6 bg-white border border-[#D2B48C]/15 rounded-[2.5rem] p-8 shadow-sm">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto text-rose-500 border border-rose-100 shadow-inner">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-bold text-[#3E2723]">Pasaporte no disponible</h1>
          <p className="text-stone-600 text-sm">
            {error || 'El pasaporte solicitado no existe o no tienes permisos para visualizarlo en este momento.'}
          </p>
          <div className="pt-4">
            <Link
              to={slug ? `/c/${slug}` : '/'}
              className="inline-flex items-center gap-2 bg-[#5A5A40] hover:bg-[#4A4A35] text-white py-3.5 px-8 rounded-2xl font-bold text-sm transition-all shadow-md active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              {slug ? 'Volver a la comunidad' : 'Ir al inicio'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Mapear los datos de Firestore al formato que requiere el componente PasaporteVisual
  const triada = getTriadaFromFicha(ficha);
  
  // Extraer roles de la información del miembro
  let rolesArray: string[] = [];
  if (memberInfo?.rol_comunidad) {
    rolesArray.push(memberInfo.rol_comunidad);
  } else if (memberInfo?.rolComunitario) {
    rolesArray.push(memberInfo.rolComunitario);
  } else if (ficha?.datosOnboarding?.rol_comunidad) {
    rolesArray.push(ficha.datosOnboarding.rol_comunidad);
  }

  const birthDate = memberInfo?.fechaNacimiento || memberInfo?.datosPersona?.fechaNacimiento || ficha?.datosPersona?.fechaNacimiento || ficha?.datosOnboarding?.fechaNacimiento;
  const kinMaya = birthDate ? calcularKin(birthDate) : undefined;

  const mappedUser = {
    name: memberInfo?.nombre || memberInfo?.displayName || ficha?.datosOnboarding?.nombre || 'Miembro',
    avatarUrl: memberInfo?.photoURL || ficha?.datosOnboarding?.plataformaOrigen || undefined, // fallback por si no tiene avatarUrl
    roles: rolesArray,
    offerings: triada.ofrendas || [],
    knowledges: triada.saberes || [],
    needs: triada.necesidades || [],
    kinMaya,
  };

  let connectionStatus: 'none' | 'pending' | 'connected' | 'self' = 'none';
  if (isSelf) {
    connectionStatus = 'self';
  } else if (connection) {
    if (connection.status === 'connected') {
      connectionStatus = 'connected';
    } else if (connection.status === 'pending') {
      connectionStatus = 'pending';
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 md:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl mb-6 flex justify-between items-center px-2">
        <Link
          to={`/c/${slug}`}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B705C] hover:text-[#5A5A40] transition-colors"
        >
          <ArrowLeft size={14} />
          Volver a la comunidad
        </Link>
        <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#A5A58D]">
          <Sparkles size={12} />
          Vista Pública
        </div>
      </div>

      <PasaporteVisual 
        user={mappedUser} 
        onConnect={handleConnect} 
        onAccept={handleAccept}
        connectionStatus={connectionStatus}
        isSender={isSender}
      />
    </div>
  );
}
