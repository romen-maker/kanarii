import { db } from '../src/lib/firebase';
import { registerPropuestaResponse, getFichaById } from '../src/lib/appService';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

/**
 * SCRIPT: Stress Test de Gobernanza (Race Conditions & Quorum)
 * 
 * Uso: npx tsx scripts/test_governance_stress.ts <propuestaId> <numVotos>
 */

async function stressTest(propuestaId: string, numVotos: number) {
  console.log(`🚀 Iniciando Stress Test para Propuesta: ${propuestaId}`);
  console.log(`📊 Objetivo: Simular ${numVotos} votos concurrentes.`);

  // 1. Obtener la propuesta para ver el estado inicial
  const propRef = doc(db, 'propuestas', propuestaId);
  const propSnap = await getDoc(propRef);
  if (!propSnap.exists()) {
    console.error("❌ Error: La propuesta no existe.");
    process.exit(1);
  }
  const propData = propSnap.data();
  console.log(`📍 Estado inicial: ${propData.status} | Objeciones: ${propData.activeObjectionsCount} | Votos: ${propData.totalResponsesCount}`);

  // 2. Obtener miembros de la comunidad para simular votos reales
  // (Usamos IDs de 'community_members' para que el sistema los reconozca)
  const membersSnap = await getDocs(collection(db, 'community_members'));
  const allMemberIds = membersSnap.docs.map(d => d.id);
  const totalMembers = allMemberIds.length;
  
  console.log(`👥 Miembros totales en la comunidad: ${totalMembers}`);

  // 3. Preparar los votos concurrentes
  // Usaremos IDs ficticios si no hay suficientes miembros reales para el test
  const testVoters = [];
  for (let i = 0; i < numVotos; i++) {
    testVoters.push(allMemberIds[i] || `test-voter-${i}`);
  }

  console.log("⏱️ Enviando votos en paralelo...");
  const start = Date.now();

  const promises = testVoters.map((uid, index) => {
    // Simulamos una mezcla de consentimientos y una objeción aleatoria para probar el contador
    const type = (index === 0) ? 'objecion' : 'consentimiento'; 
    return registerPropuestaResponse(propuestaId, {
      memberId: uid,
      type: type,
      content: type === 'objecion' ? "Objeción de test para stress" : "Consentimiento de test",
      createdAt: new Date(),
      updatedAt: new Date()
    }, totalMembers);
  });

  try {
    await Promise.all(promises);
    const duration = Date.now() - start;
    console.log(`✅ ¡Votos enviados! Duración: ${duration}ms`);

    // 4. Verificar resultado final tras un pequeño delay para que Firestore propague
    setTimeout(async () => {
      const finalSnap = await getDoc(propRef);
      const finalData = finalSnap.data();
      console.log("\n--- RESULTADOS FINALES ---");
      console.log(`Estado: ${finalData?.status}`);
      console.log(`Votos Positivos (Quórum): ${finalData?.totalResponsesCount}`);
      console.log(`Objeciones Activas: ${finalData?.activeObjectionsCount}`);
      
      if (finalData?.activeObjectionsCount === 1) {
        console.log("💎 Race Condition Check: El contador de objeciones es correcto (1).");
      } else {
        console.warn(`⚠️ Warning: Se esperaba 1 objeción, se encontraron ${finalData?.activeObjectionsCount}`);
      }
      
      process.exit(0);
    }, 2000);

  } catch (err) {
    console.error("❌ Error durante el stress test:", err);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
if (args.length < 1) {
  console.log("Uso: npx tsx scripts/test_governance_stress.ts <propuestaId> [numVotos]");
  process.exit(1);
}

stressTest(args[0], parseInt(args[1] || "3"));
