import { db } from '../src/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

async function auditDatabase() {
  console.log("🔍 Auditando colecciones de miembros...");

  const collections = ['profiles', 'community_members', 'fichas'];
  
  for (const colName of collections) {
    const snap = await getDocs(collection(db, colName));
    const total = snap.size;
    const seeds = snap.docs.filter(d => d.data().isSeedData || d.id.startsWith('seed-')).length;
    const real = total - seeds;
    
    console.log(`\n📂 Colección: ${colName}`);
    console.log(`   - Total docs: ${total}`);
    console.log(`   - Miembros Semilla (Seed): ${seeds}`);
    console.log(`   - Miembros Reales: ${real}`);
    
    if (real > 0) {
      console.log(`   - Nombres reales detectados: ${snap.docs.filter(d => !d.data().isSeedData && !d.id.startsWith('seed-')).map(d => d.data().nombre || d.data().datosPersona?.nombre || 'S/N').join(', ')}`);
    }
  }
}

auditDatabase().catch(console.error);
