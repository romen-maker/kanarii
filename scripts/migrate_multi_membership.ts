import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc, writeBatch } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function migrate() {
  console.log("🚀 Iniciando migración a multi-membership (/users)...");

  const usersRef = collection(db, 'users');
  const snap = await getDocs(usersRef);
  
  let updated = 0;
  let skipped = 0;

  const batch = writeBatch(db);

  for (const d of snap.docs) {
    const data = d.data();
    const updates: any = {};

    // Si tiene communityId (string) y no tiene communityIds (array)
    if (data.communityId && !data.communityIds) {
      updates.communityIds = [data.communityId];
    } 
    // Si no tiene ninguno de los dos, inicializar array vacío
    else if (!data.communityId && !data.communityIds) {
      updates.communityIds = [];
    }

    if (Object.keys(updates).length > 0) {
      batch.update(doc(db, 'users', d.id), updates);
      updated++;
    } else {
      skipped++;
    }
  }

  if (updated > 0) {
    await batch.commit();
  }

  console.log(`\n✅ Usuarios actualizados: ${updated}`);
  console.log(`⏭️  Usuarios saltados: ${skipped}`);
  console.log("\n✨ Migración completada.");
}

migrate().then(() => process.exit(0)).catch(e => {
  console.error("\n❌ Error durante la migración:", e);
  process.exit(1);
});
