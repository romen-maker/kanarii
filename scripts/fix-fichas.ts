import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import fs from "fs";

const configPath = "firebase-applet-config.json";
if (!fs.existsSync(configPath)) {
  console.log("No config found");
  process.exit(0);
}
const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  const q = collection(db, "fichas");
  const snap = await getDocs(q);
  for (const item of snap.docs) {
    const data = item.data();
    if (data.isSeedData && !data.userId.startsWith('seed_')) {
      console.log('updating', item.id);
      await updateDoc(doc(db, "fichas", item.id), { userId: `seed_${item.id.replace('seed_', '')}` });
    }
  }
}
run().then(() => process.exit(0));
