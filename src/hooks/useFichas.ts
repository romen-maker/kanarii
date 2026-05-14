import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Ficha } from '../lib/appService';

export function useFichas(communityId?: string) {
  const [fichas, setFichas] = useState<Ficha[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = query(collection(db, 'fichas'));
    
    if (communityId) {
      q = query(collection(db, 'fichas'), where('communityId', '==', communityId));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Ficha[];
      
      setFichas(data);
      setLoading(false);
    }, (error) => {
      console.error("Error loading fichas:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [communityId]);

  return { fichas, loading };
}
