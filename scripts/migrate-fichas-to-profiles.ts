/**
 * scripts/migrate-fichas-to-profiles.ts
 * 
 * QUÉ: Script de migración idempotente para traspasar manuales galácticos, perfiles visuales,
 *      dimensiones y datos brutos desde la colección '/fichas' a la colección '/profiles'.
 * POR QUÉ: Centralizamos las fichas de los usuarios en '/profiles' debido a restricciones de seguridad en las reglas
 *          de Firestore que impiden búsquedas por colección en '/fichas'.
 * TRADE-OFF: Se realiza mediante el SDK cliente para aprovechar la configuración local 'firebase-applet-config.json'
 *            existente en el proyecto, garantizando portabilidad y facilidad de ejecución tanto local como en nube.
 */

import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp
} from "firebase/firestore";
import * as fs from "fs";
import * as path from "path";

// Cargar la configuración de Firebase
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

  console.log("🚀 Iniciando migración de Fichas a Profiles...");
  if (isDryRun) {
    console.log("⚠️  MODO DRY RUN: Simulación activa. No se realizarán escrituras.");
  }

  // Guard de seguridad contra ejecución accidental en producción
  if (!emulatorHost && !hasForce) {
    console.error("\n❌ ERROR DE SEGURIDAD:");
    console.error("No se ha detectado la variable de entorno FIRESTORE_EMULATOR_HOST (emulador).");
    console.error("Para evitar daños en producción, el script aborta.");
    console.error("Si deseas ejecutarlo sobre la base de datos real en la nube, añade --force:");
    console.error("  npx tsx scripts/migrate-fichas-to-profiles.ts --force");
    process.exit(1);
  }

  // Inicializar Firebase
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

  // Obtener documentos de la colección fichas
  console.log("\n📦 Cargando documentos de '/fichas'...");
  const fichasRef = collection(db, "fichas");
  let fichasSnapshot;
  try {
    fichasSnapshot = await getDocs(fichasRef);
  } catch (err) {
    console.error("❌ Error al leer la colección 'fichas':", err);
    process.exit(1);
  }

  const docs = fichasSnapshot.docs;
  console.log(`🔍 Encontrados ${docs.length} documentos en '/fichas'.`);

  let totalProcessed = 0;
  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalCreatedProfiles = 0;

  let batch = writeBatch(db);
  let batchCount = 0;

  for (const fichaDoc of docs) {
    totalProcessed++;
    const fichaData = fichaDoc.data();
    const fichaId = fichaDoc.id;
    const targetUserId = fichaData.userId || fichaId;

    console.log(`\n• [${totalProcessed}/${docs.length}] Procesando Ficha ID: '${fichaId}' (Usuario destino: '${targetUserId}')...`);

    // Leer el profile correspondiente
    const profileRef = doc(db, "profiles", targetUserId);
    let profileSnap;
    try {
      profileSnap = await getDoc(profileRef);
    } catch (err) {
      console.error(`  ❌ Error al leer profile para '${targetUserId}':`, err);
      continue;
    }

    const hasManualInFicha = fichaData.manualGenerado || fichaData.manualMarkdown;
    if (!hasManualInFicha) {
      console.log("  ⚠️ La ficha no contiene manual generado. Saltando.");
      totalSkipped++;
      continue;
    }

    // Campos a copiar
    const updateData: any = {};
    if (fichaData.manualGenerado !== undefined) updateData.manualGenerado = fichaData.manualGenerado;
    if (fichaData.manualMarkdown !== undefined) updateData.manualMarkdown = fichaData.manualMarkdown;
    if (fichaData.perfilVisual !== undefined) updateData.perfilVisual = fichaData.perfilVisual;
    if (fichaData.dimensiones !== undefined) updateData.dimensiones = fichaData.dimensiones;
    if (fichaData.datosBrutos !== undefined) updateData.datosBrutos = fichaData.datosBrutos;

    if (!profileSnap.exists()) {
      console.log(`  ➕ El perfil de usuario '${targetUserId}' no existe en '/profiles'. Se creará nuevo.`);
      
      const newProfile = {
        ...fichaData,
        ...updateData,
        createdAt: fichaData.creadoEn || fichaData.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      totalCreatedProfiles++;
      totalMigrated++;

      if (!isDryRun) {
        batch.set(profileRef, newProfile);
        batchCount++;
      } else {
        console.log(`  [DRY RUN] Se habría creado el perfil '${targetUserId}' con manual.`);
      }
    } else {
      const profileData = profileSnap.data();
      const hasManualInProfile = profileData.manualGenerado || profileData.manualMarkdown;

      if (hasManualInProfile) {
        console.log(`  ✓ El perfil '${targetUserId}' ya cuenta con un manual generado. Saltando para asegurar idempotencia.`);
        totalSkipped++;
        continue;
      }

      // Si el profile tiene estado no completo, pero la ficha sí era completa, actualizamos a completo
      if (fichaData.estado === "completo" && profileData.estado !== "completo") {
        updateData.estado = "completo";
        console.log("  📈 Actualizando estado del perfil a 'completo'.");
      }

      updateData.updatedAt = serverTimestamp();

      totalMigrated++;
      console.log(`  ✨ Migrando manual y metadatos al perfil de '${targetUserId}'.`);

      if (!isDryRun) {
        batch.update(profileRef, updateData);
        batchCount++;
      } else {
        console.log(`  [DRY RUN] Se habría actualizado el perfil '${targetUserId}' con manual.`);
      }
    }

    // Guardar lote si alcanza el límite de 400
    if (!isDryRun && batchCount >= 400) {
      console.log(`💾 Guardando lote de ${batchCount} escrituras en base de datos...`);
      await batch.commit();
      batch = writeBatch(db);
      batchCount = 0;
    }
  }

  // Guardar escrituras restantes
  if (!isDryRun && batchCount > 0) {
    console.log(`💾 Guardando lote final de ${batchCount} escrituras...`);
    await batch.commit();
  }

  console.log(`\n📊 ESTADÍSTICAS DE MIGRACIÓN:`);
  console.log(`   - Fichas analizadas: ${totalProcessed}`);
  console.log(`   - Perfiles creados de cero: ${totalCreatedProfiles}`);
  console.log(`   - Perfiles actualizados: ${totalMigrated - totalCreatedProfiles}`);
  console.log(`   - Total registros migrados exitosamente: ${totalMigrated}`);
  console.log(`   - Registros saltados (ya migrados o sin manual): ${totalSkipped}`);
  console.log(`🎉 Proceso finalizado.`);
}

main().catch(err => {
  console.error("\n❌ Error fatal durante la ejecución del script:", err);
  process.exit(1);
});
