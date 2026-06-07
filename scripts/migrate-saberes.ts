/**
 * scripts/migrate-saberes.ts
 * 
 * QUÉ: Script de migración de datos para convertir el campo 'saberes' de la Tríada Comunitaria
 *      de string a un array de strings (string[]).
 * POR QUÉ: Para estandarizar el formato estructurado de la tríada de saberes en Firestore,
 *          evitando la necesidad de hacer parsing en caliente (on-read) constantemente.
 * TRADE-OFF: Se implementa en TypeScript con la API de Firestore Web SDK (compatible con el proyecto)
 *            para reutilizar la inicialización mediante config local, requiriendo usar npx tsx.
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

// Cargar la configuración de Firebase
const configPath = path.resolve(process.cwd(), "firebase-applet-config.json");
if (!fs.existsSync(configPath)) {
  console.error(`❌ ERROR: No se encontró el archivo de configuración en ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

// Función de conversión requerida por las especificaciones de T-055
function convertSaberes(val: any): { target: string[], modified: boolean } {
  // 1. null / undefined / "" → []
  if (val === null || val === undefined || val === "") {
    return { target: [], modified: true };
  }
  
  // 2. ya es string[] → no tocar (idempotente)
  if (Array.isArray(val)) {
    return { target: val, modified: false };
  }
  
  if (typeof val === 'string') {
    // 3. string con comas → split(",").map(s => s.trim()).filter(Boolean)
    if (val.includes(',')) {
      const parsed = val.split(',').map(s => s.trim()).filter(Boolean);
      return { target: parsed, modified: true };
    } else {
      // 4. string sin comas → [string.trim()] si no está vacío
      const trimmed = val.trim();
      return { target: trimmed ? [trimmed] : [], modified: true };
    }
  }
  
  // Tipo inesperado (p. ej. objeto u otro) -> fallback seguro a array vacío
  return { target: [], modified: true };
}

async function main() {
  const isApply = process.argv.includes('--apply');
  const hasForce = process.argv.includes('--force');
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

  console.log("🚀 Iniciando migración de saberes a arrays...");
  if (!isApply) {
    console.log("⚠️  MODO DRY-RUN (por defecto): Solo se analizarán y loguearán los cambios. No se escribirá en Firestore.");
    console.log("👉 Para aplicar los cambios reales, ejecuta el comando con el flag --apply.");
  } else {
    console.log("🔥 MODO ESCRITURA ACTIVA: Los cambios se aplicarán en Firestore.");
  }

  // Guard de seguridad: abortar si no hay emulador y no se pasa --force
  if (!emulatorHost && !hasForce) {
    console.error("\n❌ ERROR DE SEGURIDAD:");
    console.error("No se ha detectado la variable de entorno FIRESTORE_EMULATOR_HOST.");
    console.error("Para evitar daños accidentales, este script aborta por defecto fuera del emulador.");
    console.error("Si deseas ejecutarlo en la base de datos de producción (nube), añade el flag --force:");
    console.error("  npx tsx scripts/migrate-saberes.ts --apply --force");
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

  // Definición del orden de colecciones a migrar
  const collections = ['fichas', 'profiles', 'community_members'];

  for (const colName of collections) {
    console.log(`\n📦 Procesando colección: '${colName}'...`);
    const colRef = collection(db, colName);
    
    let snapshot;
    try {
      snapshot = await getDocs(colRef);
    } catch (err) {
      console.error(`❌ Error al obtener documentos de la colección '${colName}':`, err);
      continue;
    }

    let docsAnalyzed = 0;
    let docsNeedMigration = 0;
    let docsAlreadyArray = 0;
    let docsEmptySaberes = 0;
    const examples: Array<{ id: string, before: any, after: string[] }> = [];

    let batch = writeBatch(db);
    let batchCount = 0;

    for (const docSnap of snapshot.docs) {
      docsAnalyzed++;
      const data = docSnap.data();
      let shouldMigrate = false;
      let originalValue: any = null;
      let targetValue: string[] = [];

      if (colName === 'community_members') {
        /**
         * ANÁLISIS DE DESNORMALIZACIÓN EN 'community_members':
         * 
         * Al verificar en el código (src/lib/services/members.ts y src/lib/services/fichas.ts), 
         * constatamos que la colección 'community_members' se alimenta de la desnormalización de datos 
         * de la ficha de perfil ('profiles') que ocurre en `_writeFichaRaw` cuando un miembro guarda cambios. 
         * Sin embargo, 'community_members' NO se regenera automáticamente en caliente (on-read) al consultar 
         * la información de los miembros de una comunidad. 
         * Por ende, si no migramos los registros corruptos en esta colección, los listados de la comunidad 
         * que asuman la tríada como array mostrarán errores visuales para los miembros inactivos que no 
         * vuelvan a editar su ficha.
         * 
         * Decisión: SÍ migramos esta colección, pero limitándonos estrictamente a la especificación del usuario: 
         * solo actualizar si el documento posee 'triada.saberes' definido y su tipo actual es 'string'.
         */
        if (data.triada && typeof data.triada.saberes === 'string') {
          originalValue = data.triada.saberes;
          const conversion = convertSaberes(originalValue);
          targetValue = conversion.target;
          shouldMigrate = conversion.modified;
        } else if (data.triada && Array.isArray(data.triada.saberes)) {
          docsAlreadyArray++;
          if (data.triada.saberes.length === 0) {
            docsEmptySaberes++;
          }
        }
      } else {
        // Colecciones 'fichas' y 'profiles'
        const currentSaberes = data.triada?.saberes;
        
        if (currentSaberes === undefined || currentSaberes === null) {
          // Si no tiene triada.saberes, buscamos en los campos legacy para estructurarlo
          originalValue = data.datosOnboarding?.saberes || data.datosPersona?.saberes || data.saberes || null;
          const conversion = convertSaberes(originalValue);
          targetValue = conversion.target;
          shouldMigrate = true; // Se migra para estructurar la triada
        } else if (typeof currentSaberes === 'string') {
          originalValue = currentSaberes;
          const conversion = convertSaberes(originalValue);
          targetValue = conversion.target;
          shouldMigrate = conversion.modified;
        } else if (Array.isArray(currentSaberes)) {
          docsAlreadyArray++;
          if (currentSaberes.length === 0) {
            docsEmptySaberes++;
          }
        }
      }

      if (shouldMigrate) {
        docsNeedMigration++;
        
        if (targetValue.length === 0) {
          docsEmptySaberes++;
        }

        // Registrar ejemplo de transformación (máximo 5)
        if (examples.length < 5) {
          examples.push({
            id: docSnap.id,
            before: originalValue,
            after: targetValue
          });
        }

        if (isApply) {
          const docRef = doc(db, colName, docSnap.id);
          
          if (colName === 'community_members') {
            batch.update(docRef, {
              'triada.saberes': targetValue,
              updatedAt: serverTimestamp()
            });
          } else {
            // Reestructurar triada completa asegurando que ofrendas y necesidades no se pierdan
            const updatedTriada = {
              ofrendas: data.triada?.ofrendas || [],
              saberes: targetValue,
              necesidades: data.triada?.necesidades || []
            };
            
            batch.update(docRef, {
              triada: updatedTriada,
              updatedAt: serverTimestamp()
            });
          }
          
          batchCount++;

          // Commit de lotes (límite de Firestore batch es 500, usamos 400 por seguridad)
          if (batchCount >= 400) {
            console.log(`💾 Guardando lote de ${batchCount} escrituras para '${colName}'...`);
            await batch.commit();
            batch = writeBatch(db);
            batchCount = 0;
          }
        }
      }
    }

    // Guardar lote restante de la colección
    if (isApply && batchCount > 0) {
      console.log(`💾 Guardando lote final de ${batchCount} escrituras para '${colName}'...`);
      await batch.commit();
    }

    // Reporte de salida de la colección
    console.log(`📊 Reporte colección '${colName}':`);
    console.log(`   - Total documentos analizados: ${docsAnalyzed}`);
    console.log(`   - Necesitan migración: ${docsNeedMigration}`);
    console.log(`   - Ya son arrays (sin cambios): ${docsAlreadyArray}`);
    console.log(`   - Saberes vacíos (resultan en []): ${docsEmptySaberes}`);
    
    if (examples.length > 0) {
      console.log(`   - Muestra de transformaciones (máx 5):`);
      examples.forEach(ex => {
        console.log(`     🔹 ID: ${ex.id}`);
        console.log(`        Antes:  ${JSON.stringify(ex.before)}`);
        console.log(`        Después: ${JSON.stringify(ex.after)}`);
      });
    } else {
      console.log(`   - No se requieren transformaciones.`);
    }
  }

  console.log("\n🏁 Proceso de migración terminado.");
}

main().catch(err => {
  console.error("\n❌ Error grave durante la ejecución del script:", err);
  process.exit(1);
});
