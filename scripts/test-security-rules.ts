import { 
  initializeTestEnvironment, 
  assertFails, 
  assertSucceeds 
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import * as fs from "fs";

async function runTests() {
  console.log("Iniciando pruebas de reglas de seguridad...");
  const testEnv = await initializeTestEnvironment({
    projectId: "ai-studio-fb5ef2e1-c472-43e5-bb6a-51f1141b0793",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: fs.readFileSync("firestore.rules", "utf8"),
    },
  });

  // Limpiar base de datos
  await testEnv.clearFirestore();

  console.log("\n--- Escenario 1: Lectura de comunidades (autenticados vs anónimos) ---");
  const authUser = testEnv.authenticatedContext("alice");
  const anonUser = testEnv.unauthenticatedContext();

  // Sembrar comunidad
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "comunidades/arteara"), {
      nombre: "Arteara",
      createdBy: "founder_uid"
    });
  });

  // Alice (autenticada) puede leer comunidades
  await assertSucceeds(getDoc(doc(authUser.firestore(), "comunidades/arteara")));
  console.log("✅ Usuario autenticado puede leer comunidades.");

  // Anon (no autenticado) no puede leer comunidades
  await assertFails(getDoc(doc(anonUser.firestore(), "comunidades/arteara")));
  console.log("✅ Usuario anónimo tiene denegada la lectura de comunidades.");

  console.log("\n--- Escenario 2: Escritura en comunidades (admin local vs miembro común) ---");
  // Sembrar membresías
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "community_members/arteara_alice"), {
      userId: "alice",
      communityId: "arteara",
      rol: "admin"
    });
    await setDoc(doc(context.firestore(), "community_members/arteara_bob"), {
      userId: "bob",
      communityId: "arteara",
      rol: "miembro"
    });
  });

  const aliceContext = testEnv.authenticatedContext("alice");
  const bobContext = testEnv.authenticatedContext("bob");

  // Alice (admin) puede actualizar la comunidad
  await assertSucceeds(setDoc(doc(aliceContext.firestore(), "comunidades/arteara"), {
    nombre: "Arteara Editada por Alice",
    createdBy: "founder_uid"
  }));
  console.log("✅ Admin de comunidad puede actualizarla.");

  // Bob (miembro normal) no puede actualizar la comunidad
  await assertFails(setDoc(doc(bobContext.firestore(), "comunidades/arteara"), {
    nombre: "Arteara Editada por Bob",
    createdBy: "founder_uid"
  }));
  console.log("✅ Miembro común tiene denegada la actualización de la comunidad.");

  console.log("\n--- Escenario 3: Lectura de membresías (/community_members) ---");
  // Alice puede leer su propia membresía
  await assertSucceeds(getDoc(doc(aliceContext.firestore(), "community_members/arteara_alice")));
  console.log("✅ Usuario puede leer su propia membresía.");

  // Bob puede leer la membresía de Alice porque Bob es miembro de la comunidad
  await assertSucceeds(getDoc(doc(bobContext.firestore(), "community_members/arteara_alice")));
  console.log("✅ Miembro puede leer membresía de otro miembro de su comunidad.");

  // Un usuario sin membresía (Charles) no puede leer la membresía de Alice
  const charlesContext = testEnv.authenticatedContext("charles");
  await assertFails(getDoc(doc(charlesContext.firestore(), "community_members/arteara_alice")));
  console.log("✅ Usuario ajeno tiene denegado el acceso a membresías de la comunidad.");

  console.log("\n--- Escenario 4: Validación defensiva (campos nulos o inexistentes) ---");
  // Charles intenta escribir en la comunidad, debería denegarse limpiamente
  await assertFails(setDoc(doc(charlesContext.firestore(), "comunidades/arteara"), {
    nombre: "Arteara Editada por Charles"
  }));
  console.log("✅ Intento de escritura sin membresía denegado limpiamente (sin error fatal en helpers).");

  await testEnv.cleanup();
  console.log("\n🎉 ¡TODAS LAS PRUEBAS DE SEGURIDAD PASARON EXITOSAMENTE! 🎉");
}

runTests().catch(err => {
  console.error("❌ Fallo en las pruebas:", err);
  process.exit(1);
});
