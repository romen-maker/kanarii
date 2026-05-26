import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, process.env.VITE_FIREBASE_DATABASE_ID);

async function auditDatabase() {
  console.log("🔍 Auditando colecciones de miembros y perfiles...");

  const collections = ['profiles', 'community_members', 'fichas'];
  
  for (const colName of collections) {
    const snap = await getDocs(collection(db, colName));
    const total = snap.size;
    const docs = snap.docs.filter(d => !d.data().isSeedData && !d.id.startsWith('seed-'));
    const seeds = total - docs.length;
    
    console.log(`\n📂 Colección: ${colName}`);
    console.log(`   - Total docs: ${total}`);
    console.log(`   - Seed data: ${seeds}`);
    console.log(`   - Docs Reales: ${docs.length}`);
    
    if (docs.length > 0) {
      let displayNameVacio = 0;
      let displayNameValido = 0;
      let nombreVacio = 0;
      let nombreValido = 0;

      for (const d of docs) {
        const data = d.data();
        
        // Determinar displayName
        const displayName = data.displayName;
        if (displayName === undefined || displayName === null || displayName.trim() === '') {
          displayNameVacio++;
        } else {
          displayNameValido++;
        }

        // Determinar nombre
        const nombre = data.nombre || data.datosPersona?.nombre || data.datosOnboarding?.nombre;
        if (nombre === undefined || nombre === null || nombre.trim() === '') {
          nombreVacio++;
        } else {
          nombreValido++;
        }
      }

      console.log(`   - displayName Válido: ${displayNameValido}`);
      console.log(`   - displayName Vacío ("" o nulo): ${displayNameVacio}`);
      console.log(`   - nombre/Nombre Válido: ${nombreValido}`);
      console.log(`   - nombre/Nombre Vacío ("" o nulo): ${nombreVacio}`);
      
      // Mostrar algunos ejemplos si hay vacíos
      if (displayNameVacio > 0) {
        const ejemplosVacios = docs
          .filter(d => {
            const dn = d.data().displayName;
            return dn === undefined || dn === null || dn.trim() === '';
          })
          .slice(0, 5)
          .map(d => `${d.id} (email: ${d.data().email || 'sin email'})`);
        console.log(`   - Ejemplos de IDs con displayName vacío: ${ejemplosVacios.join(', ')}`);
      }
    }
  }
}

auditDatabase().catch(console.error);
