import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, query, where, writeBatch } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

const collections = ['tareas', 'proyectos', 'actas', 'posts', 'eventos', 'cruces'];

async function backfill() {
  console.log("🚀 Iniciando migración de datos (backfill)...");

  for (const colName of collections) {
    console.log(`\n📂 Procesando colección: /${colName}`);
    const colRef = collection(db, colName);
    const snap = await getDocs(colRef);
    
    let updated = 0;
    let skipped = 0;
    let conflicts = 0;

    for (const d of snap.docs) {
      const data = d.data();
      if (!data.communityId) {
        await updateDoc(doc(db, colName, d.id), { communityId: 'arteara' });
        updated++;
      } else if (data.communityId === 'arteara') {
        skipped++;
      } else {
        console.warn(`  ⚠️ Conflicto en ${d.id}: communityId es '${data.communityId}'`);
        conflicts++;
      }
    }
    console.log(`  ✅ Actualizados: ${updated}`);
    console.log(`  ⏭️ Saltados (ya correctos): ${skipped}`);
    if (conflicts > 0) console.log(`  ❌ Conflictos encontrados: ${conflicts}`);
  }

  // Actualizar usuario romenusabo3@gmail.com
  console.log("\n👤 Actualizando perfil de usuario: romenusabo3@gmail.com");
  const usersRef = collection(db, 'users');
  const userQuery = query(usersRef, where('email', '==', 'romenusabo3@gmail.com'));
  const userSnap = await getDocs(userQuery);

  if (!userSnap.empty) {
    const userDoc = userSnap.docs[0];
    if (!userDoc.data().communityId) {
      await updateDoc(doc(db, 'users', userDoc.id), { communityId: 'arteara' });
      console.log(`  ✅ Usuario ${userDoc.id} actualizado con communityId: 'arteara'`);
    } else {
      console.log(`  ⏭️ Usuario ya tiene communityId: '${userDoc.data().communityId}'`);
    }
  } else {
    console.error("  ❌ No se encontró el usuario romenusabo3@gmail.com");
  }

  console.log("\n✨ Migración completada.");
}

backfill().then(() => process.exit(0)).catch(e => {
  console.error("\n❌ Error durante la migración:", e);
  process.exit(1);
});
