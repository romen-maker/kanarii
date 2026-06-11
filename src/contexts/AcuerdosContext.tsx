import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { useComunidad } from './ComunidadContext';
import { Acuerdo } from '../lib/services/_types';

interface AcuerdosContextProps {
  acuerdosSolicitante: Acuerdo[];
  acuerdosProvider: Acuerdo[];
  acuerdosNoVistosSolicitante: number;
  acuerdosPendientesProvider: number;
  loading: boolean;
}

export const AcuerdosContext = createContext<AcuerdosContextProps | null>(null);

export function toDateHelper(val: any): Date {
  if (!val) return new Date(0);
  if (val.toDate) return val.toDate();
  if (val instanceof Date) return val;
  return new Date(val);
}

export function acuerdoTieneBadge(acuerdo: Acuerdo, uid: string): boolean {
  if (acuerdo.solicitanteId !== uid) return false;
  if (!acuerdo.solicitanteLastSeenAt) return true;
  const actualizadoTime = toDateHelper(acuerdo.actualizadoEn);
  const lastSeenTime = toDateHelper(acuerdo.solicitanteLastSeenAt);
  return actualizadoTime > lastSeenTime;
}

export function AcuerdosProvider({ children }: { children: ReactNode }) {
  const { appUser } = useAuth();
  const { comunidad } = useComunidad();
  
  const [acuerdosSolicitante, setAcuerdosSolicitante] = useState<Acuerdo[]>([]);
  const [acuerdosProvider, setAcuerdosProvider] = useState<Acuerdo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!appUser?.uid || !comunidad?.id) {
      setAcuerdosSolicitante([]);
      setAcuerdosProvider([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Query Solicitante
    const qSolicitante = query(
      collection(db, 'acuerdos'),
      where('communityId', '==', comunidad.id),
      where('solicitanteId', '==', appUser.uid),
      where('status', 'in', ['en_curso', 'cancelada', 'contraoferta'])
    );

    // 2. Query Provider
    const qProvider = query(
      collection(db, 'acuerdos'),
      where('communityId', '==', comunidad.id),
      where('providerId', '==', appUser.uid),
      where('status', 'in', ['pendiente', 'en_curso', 'contraoferta'])
    );

    const unsubSolicitante = onSnapshot(qSolicitante, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Acuerdo));
      setAcuerdosSolicitante(list);
    }, (err) => {
      console.error('Error en AcuerdosProvider (Solicitante):', err);
    });

    const unsubProvider = onSnapshot(qProvider, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Acuerdo));
      setAcuerdosProvider(list);
      setLoading(false);
    }, (err) => {
      console.error('Error en AcuerdosProvider (Provider):', err);
      setLoading(false);
    });

    return () => {
      unsubSolicitante();
      unsubProvider();
    };
  }, [appUser?.uid, comunidad?.id]);

  // Cálculo de count de no vistos del solicitante
  const acuerdosNoVistosSolicitante = acuerdosSolicitante.filter(a => 
    acuerdoTieneBadge(a, appUser?.uid ?? '')
  ).length;

  // Cálculo de count de pendientes del proveedor (replicando listenAcuerdosPendientesAsProvider)
  const now = new Date();
  const acuerdosPendientesProvider = acuerdosProvider.filter(a => {
    if (a.status === 'pendiente') return true;
    if (a.status === 'contraoferta') return true;
    if (a.status === 'en_curso') {
      const fecha = toDateHelper(a.fechaPropuesta);
      return fecha && fecha < now;
    }
    return false;
  }).length;

  return (
    <AcuerdosContext.Provider value={{
      acuerdosSolicitante,
      acuerdosProvider,
      acuerdosNoVistosSolicitante,
      acuerdosPendientesProvider,
      loading
    }}>
      {children}
    </AcuerdosContext.Provider>
  );
}

export function useAcuerdosCtx() {
  const ctx = useContext(AcuerdosContext);
  if (!ctx) {
    throw new Error('useAcuerdosCtx debe usarse dentro de un AcuerdosProvider');
  }
  return ctx;
}
