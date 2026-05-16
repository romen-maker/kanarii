
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc, collectionGroup } from "firebase/firestore";
import fs from "fs";

const configPath = "firebase-applet-config.json";
if (!fs.existsSync(configPath)) {
  console.log("❌ No se encontró firebase-applet-config.json");
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function deleteSubcollection(parentDocPath: string, subName: string) {
    const subRef = collection(db, parentDocPath, subName);
    const snap = await getDocs(subRef);
    let deletedCount = 0;
    
    for (const d of snap.docs) {
        await deleteDoc(d.ref);
        deletedCount++;
    }
    return deletedCount;
}

async function run() {
    console.log('🚀 Iniciando reset de propuestas...');
    
    const propuestasRef = collection(db, "propuestas");
    const snap = await getDocs(propuestasRef);
    let totalPropuestas = 0;
    let totalRespuestas = 0;
    let totalHilos = 0;

    for (const p of snap.docs) {
        const pId = p.id;
        const pPath = `propuestas/${pId}`;
        
        console.log(`🧹 Procesando propuesta: ${pId}...`);
        
        // 1. Borrar respuestas
        const rCount = await deleteSubcollection(pPath, "respuestas");
        totalRespuestas += rCount;
        
        // 2. Borrar hilos
        const hCount = await deleteSubcollection(pPath, "hilos");
        totalHilos += hCount;
        
        // 3. Borrar propuesta raíz
        await deleteDoc(p.ref);
        totalPropuestas++;
    }

    console.log('\n✨ Reset completado con éxito:');
    console.log(`   📂 Propuestas eliminadas: ${totalPropuestas}`);
    console.log(`   💬 Respuestas eliminadas: ${totalRespuestas}`);
    console.log(`   🧵 Hilos eliminados: ${totalHilos}`);
}

run().catch(console.error).then(() => process.exit(0));
