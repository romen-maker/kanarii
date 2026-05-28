import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  db, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  serverTimestamp, 
  query, 
  subscribeToCollection,
  PresenciaParticipante 
} from '../lib/appService';

export function usePresenciaEnSala(propuestaId: string) {
  const { user, appUser } = useAuth();
  const [participantes, setParticipantes] = useState<PresenciaParticipante[]>([]);

  useEffect(() => {
    if (!propuestaId || !user?.uid) return;

    const userId = user.uid;
    const presenciaDocRef = doc(db, 'propuestas', propuestaId, 'presencia', userId);

    // Registrar presencia al montar
    const writePresencia = async () => {
      try {
        await setDoc(presenciaDocRef, {
          nombre: appUser?.displayName || user.displayName || 'Miembro',
          photoURL: appUser?.photoURL || user.photoURL || null,
          entradaEn: serverTimestamp()
        });
      } catch (error) {
        console.error('Error al registrar presencia:', error);
      }
    };

    writePresencia();

    // Suscribirse a la presencia de la sala en tiempo real
    const q = query(collection(db, 'propuestas', propuestaId, 'presencia'));
    const unsubscribe = subscribeToCollection(
      q,
      (data) => {
        const list = data.map(item => ({
          uid: item.id,
          nombre: item.nombre,
          photoURL: item.photoURL,
          entradaEn: item.entradaEn
        })) as PresenciaParticipante[];
        setParticipantes(list);
      },
      'presencia_sala'
    );

    // Borrar presencia y cancelar suscripción al desmontar
    return () => {
      unsubscribe();
      
      const removePresencia = async () => {
        try {
          await deleteDoc(presenciaDocRef);
        } catch (error) {
          console.error('Error al borrar presencia:', error);
        }
      };
      
      removePresencia();
    };
  }, [propuestaId, user?.uid, appUser?.displayName, appUser?.photoURL, user?.displayName, user?.photoURL]);

  return { participantes };
}
