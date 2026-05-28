/**
 * scripts/migrate-triada-comunitaria.ts
 * 
 * QUÉ: Script de migración idempotente para la Tríada Comunitaria (ofrendas, saberes, necesidades).
 * POR QUÉ: Convierte el campo legacy 'saberes' (string) en perfiles y fichas a la estructura de
 *          la Tríada Comunitaria manteniendo compatibilidad hacia atrás.
 * TRADE-OFF: Se realiza por API REST/SDK directo en lugar de un script bash para aprovechar el tipado
 *            y lógica de parsing exactos de TypeScript, aunque requiere inicializar Firebase localmente.
 */

import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  collection, 
  getDocs, 
  doc, 
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

// Cargar la configuración de Firebase desde el archivo local
const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
if (!fs.existsSync(configPath)) {
  console.error(`❌ ERROR: No se encontró el archivo de configuración en ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const hasForce = process.argv.includes('--force');
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

  console.log("🚀 Iniciando migración de Tríada Comunitaria...");
  if (isDryRun) {
    console.log("⚠️  MODO DRY RUN: No se escribirán cambios en la base de datos.");
  }

  // 1. Guard de seguridad: abortar si no hay emulador y no se pasa --force
  if (!emulatorHost && !hasForce) {
    console.error("\n❌ ERROR DE SEGURIDAD:");
    console.error("No se ha detectado la variable de entorno FIRESTORE_EMULATOR_HOST.");
    console.error("Para evitar daños accidentales, este script aborta por defecto fuera del emulador.");
    console.error("Si deseas ejecutarlo en la base de datos de producción (nube), añade el flag --force:");
    console.error("  npx tsx scripts/migrate-triada-comunitaria.ts --force");
    process.exit(1);
  }

  // 2. Inicializar Firebase App y Firestore
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  if (emulatorHost) {
    const [host, portStr] = emulatorHost.split(':');
    const port = parseInt(portStr || '8080', 10);
    connectFirestoreEmulator(db, host, port);
    console.log(`🔌 Conectado al emulador de Firestore en ${host}:${port}`);
  } else {
    console.log(`🌐 Conectado a Firestore en la nube (Proyecto: ${config.projectId})`);
  }

  const collectionsToMigrate = ['profiles', 'fichas'];
  let totalRead = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;

  let batch = writeBatch(db);
  let batchCount = 0;

  for (const colName of collectionsToMigrate) {
    console.log(`\n📦 Procesando colección: '${colName}'...`);
    const colRef = collection(db, colName);
    
    let snapshot;
    try {
      snapshot = await getDocs(colRef);
    } catch (err) {
      console.error(`❌ Error al obtener documentos de la colección '${colName}':`, err);
      continue;
    }

    console.log(`🔍 Encontrados ${snapshot.docs.length} documentos.`);

    for (const docSnap of snapshot.docs) {
      totalRead++;
      const data = docSnap.data();

      // Comprobar si ya tiene una tríada estructurada con información
      const hasTriada = data.triada && 
                        Array.isArray(data.triada.ofrendas) &&
                        Array.isArray(data.triada.saberes) &&
                        Array.isArray(data.triada.necesidades) &&
                        (data.triada.ofrendas.length > 0 || data.triada.saberes.length > 0 || data.triada.necesidades.length > 0);

      if (hasTriada) {
        totalSkipped++;
        continue;
      }

      // Obtener el campo legacy 'saberes'
      const saberesLegacy = data.datosOnboarding?.saberes || data.datosPersona?.saberes || '';
      
      // Parsear saberes legacy por coma o salto de línea
      const saberesArray = typeof saberesLegacy === 'string'
        ? saberesLegacy.split(/[,\n]+/).map((s: string) => s.trim()).filter(Boolean)
        : [];

      // Estructurar la nueva tríada comunitaria
      const triada = {
        ofrendas: data.triada?.ofrendas || [],
        saberes: saberesArray.length > 0 ? saberesArray : (data.triada?.saberes || []),
        necesidades: data.triada?.necesidades || []
      };

      // Comprobar si el valor final es exactamente igual a la triada actual para evitar escrituras redundantes
      const currentTriada = data.triada;
      const isSame = currentTriada &&
                     Array.isArray(currentTriada.ofrendas) &&
                     Array.isArray(currentTriada.saberes) &&
                     Array.isArray(currentTriada.necesidades) &&
                     JSON.stringify(currentTriada.ofrendas) === JSON.stringify(triada.ofrendas) &&
                     JSON.stringify(currentTriada.saberes) === JSON.stringify(triada.saberes) &&
                     JSON.stringify(currentTriada.necesidades) === JSON.stringify(triada.necesidades);

      if (isSame) {
        totalSkipped++;
        continue;
      }

      totalUpdated++;
      console.log(`✨ [${colName}] Migrando documento '${docSnap.id}':`);
      console.log(`   - Saberes legacy: "${saberesLegacy}"`);
      console.log(`   - Triada generada:`, JSON.stringify(triada));

      if (!isDryRun) {
        const docRef = doc(db, colName, docSnap.id);
        // Actualizamos triada y updatedAt
        batch.update(docRef, { 
          triada,
          updatedAt: serverTimestamp()
        });
        batchCount++;

        // Controlar tamaño de lote máximo a 400
        if (batchCount >= 400) {
          console.log(`💾 Guardando lote de ${batchCount} escrituras...`);
          await batch.commit();
          batch = writeBatch(db);
          batchCount = 0;
        }
      }
    }
  }

  // Guardar cualquier escritura pendiente del último lote
  if (!isDryRun && batchCount > 0) {
    console.log(`💾 Guardando lote final de ${batchCount} escrituras...`);
    await batch.commit();
  }

  console.log(`\n📊 MIGRACIÓN COMPLETADA:`);
  console.log(`   - Documentos totales leídos: ${totalRead}`);
  console.log(`   - Documentos migrados: ${totalUpdated}`);
  console.log(`   - Documentos saltados (ya migrados o sin cambios): ${totalSkipped}`);
}

main().catch(err => {
  console.error("\n❌ Error grave durante la ejecución del script:", err);
  process.exit(1);
});
