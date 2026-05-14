import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import fs from "fs";

const config = JSON.parse(fs.readFileSync("firebase-applet-config.json", "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function backfillFichas() {
  console.log("🚀 Iniciando backfill de /fichas...");
  const colRef = collection(db, 'fichas');
  const snap = await getDocs(colRef);
  
  let updated = 0;
  let skipped = 0;

  for (const d of snap.docs) {
    const data = d.data();
    if (!data.communityId) {
      await updateDoc(doc(db, 'fichas', d.id), { communityId: 'arteara' });
      updated++;
    } else {
      skipped++;
    }
  }
  
  console.log(`\n✅ Fichas actualizadas: ${updated}`);
  console.log(`⏭️ Fichas saltadas: ${skipped}`);
  console.log("✨ Backfill de /fichas completado.");
}

backfillFichas().then(() => process.exit(0)).catch(e => {
  console.error("❌ Error:", e);
  process.exit(1);
});
