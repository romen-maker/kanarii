import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
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

const TARGET_DOCS = [
  'arteara_CAF2NiDiLpWDwN4AbOwI2OpvoAf2',
  'arteara_rXDlDiXHMKQBdOArSqXCOOkfrm42',
  'la-alpispa_rXDlDiXHMKQBdOArSqXCOOkfrm42'
];

async function runBackfill() {
  const isDryRun = !process.argv.includes('--write');
  console.log(`🚀 Iniciando backfill de displayName en community_members [Modo: ${isDryRun ? 'DRY RUN (Sin escrituras)' : 'ESCRITURA REAL'}]`);

  for (const docId of TARGET_DOCS) {
    const docRef = doc(db, 'community_members', docId);
    const snap = await getDoc(docRef);
    
    if (!snap.exists()) {
      console.log(`❌ Documento no encontrado: ${docId}`);
      continue;
    }
    
    const data = snap.data();
    const nombre = data.nombre || '';
    const currentDisplayName = data.displayName || '';
    
    console.log(`\n📄 Analizando miembro: ${docId}`);
    console.log(`   - Nombre actual: "${nombre}"`);
    console.log(`   - displayName actual: "${currentDisplayName}"`);
    
    if (!nombre) {
      console.log(`   ⚠️  Saltando: el campo 'nombre' está vacío, no se puede hacer backfill.`);
      continue;
    }
    
    if (currentDisplayName === nombre) {
      console.log(`   ⏭️  Saltando: displayName ya es idéntico a nombre.`);
      continue;
    }

    console.log(`   ✏️  Propuesta: cambiar displayName a "${nombre}"`);

    if (!isDryRun) {
      await updateDoc(docRef, {
        displayName: nombre,
        updatedAt: serverTimestamp()
      });
      console.log(`   ✅ Documento actualizado con éxito.`);
    }
  }

  if (isDryRun) {
    console.log(`\n💡 Para aplicar estos cambios en la base de datos, ejecuta:\n   npx tsx scripts/backfill-displayname.ts --write`);
  } else {
    console.log(`\n✨ Backfill finalizado con éxito.`);
  }
}

runBackfill().catch(console.error);
