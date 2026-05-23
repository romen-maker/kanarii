import { 
  initializeTestEnvironment, 
  assertFails, 
  assertSucceeds 
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
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

  console.log("\n--- Escenario 5: Permisos de Actas (/actas) ---");
  // Sembrar acta
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "actas/acta_1"), {
      titulo: "Acta de Reunión",
      communityId: "arteara",
      creadaPor: "alice"
    });
  });

  // Alice (admin en arteara) puede leer, crear, actualizar y borrar actas
  await assertSucceeds(getDoc(doc(aliceContext.firestore(), "actas/acta_1")));
  console.log("✅ Admin de comunidad puede leer actas.");

  await assertSucceeds(setDoc(doc(aliceContext.firestore(), "actas/acta_2"), {
    titulo: "Nueva Acta",
    communityId: "arteara",
    creadaPor: "alice"
  }));
  console.log("✅ Admin de comunidad puede crear actas.");

  await assertSucceeds(setDoc(doc(aliceContext.firestore(), "actas/acta_1"), {
    titulo: "Acta de Reunión Modificada",
    communityId: "arteara",
    creadaPor: "alice"
  }));
  console.log("✅ Admin de comunidad puede actualizar actas.");

  await assertSucceeds(deleteDoc(doc(aliceContext.firestore(), "actas/acta_1")));
  console.log("✅ Admin de comunidad puede borrar actas.");

  // Bob (miembro/visitante) puede leer actas de su comunidad, pero NO crearlas/actualizarlas/borrarlas
  // Sembrar otra acta para probar lectura de Bob
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "actas/acta_3"), {
      titulo: "Acta de Prueba para Bob",
      communityId: "arteara",
      creadaPor: "alice"
    });
  });
  await assertSucceeds(getDoc(doc(bobContext.firestore(), "actas/acta_3")));
  console.log("✅ Miembro común de la comunidad puede leer actas.");

  await assertFails(setDoc(doc(bobContext.firestore(), "actas/acta_4"), {
    titulo: "Acta Creada por Bob",
    communityId: "arteara",
    creadaPor: "bob"
  }));
  console.log("✅ Miembro común NO puede crear actas.");

  await assertFails(setDoc(doc(bobContext.firestore(), "actas/acta_3"), {
    titulo: "Acta Modificada por Bob",
    communityId: "arteara",
    creadaPor: "alice"
  }));
  console.log("✅ Miembro común NO puede actualizar actas.");

  await assertFails(deleteDoc(doc(bobContext.firestore(), "actas/acta_3")));
  console.log("✅ Miembro común NO puede borrar actas.");

  // Charles (sin rol en la comunidad) no puede leer ni escribir actas
  await assertFails(getDoc(doc(charlesContext.firestore(), "actas/acta_3")));
  console.log("✅ Usuario ajeno a la comunidad tiene denegada la lectura de actas.");

  await assertFails(setDoc(doc(charlesContext.firestore(), "actas/acta_3"), {
    titulo: "Acta Manipulada por Charles",
    communityId: "arteara",
    creadaPor: "alice"
  }));
  console.log("✅ Usuario ajeno a la comunidad tiene denegada la modificación de actas.");


  console.log("\n--- Escenario 6: Permisos de Fichas (/fichas) ---");
  // Sembrar ficha de Alice
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "fichas/alice"), {
      nombre: "Alice",
      communityId: "arteara",
      userId: "alice"
    });
  });

  // Alice (propietaria de la ficha) puede leer y actualizar su propia ficha
  await assertSucceeds(getDoc(doc(aliceContext.firestore(), "fichas/alice")));
  console.log("✅ Propietario de la ficha puede leer su propia ficha.");

  await assertSucceeds(setDoc(doc(aliceContext.firestore(), "fichas/alice"), {
    nombre: "Alice Modificada",
    communityId: "arteara",
    userId: "alice"
  }));
  console.log("✅ Propietario de la ficha puede actualizar su propia ficha.");

  // Bob (miembro de la comunidad) puede leer la ficha de Alice, pero NO actualizarla
  await assertSucceeds(getDoc(doc(bobContext.firestore(), "fichas/alice")));
  console.log("✅ Miembro de la comunidad puede leer fichas ajenas.");

  await assertFails(setDoc(doc(bobContext.firestore(), "fichas/alice"), {
    nombre: "Alice Cambiada por Bob",
    communityId: "arteara",
    userId: "alice"
  }));
  console.log("✅ Miembro común NO puede actualizar fichas ajenas.");

  // Alice (admin de la comunidad) puede actualizar la ficha de Bob
  // Sembrar ficha de Bob
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "fichas/bob"), {
      nombre: "Bob",
      communityId: "arteara",
      userId: "bob"
    });
  });

  await assertSucceeds(setDoc(doc(aliceContext.firestore(), "fichas/bob"), {
    nombre: "Bob Modificado por Admin",
    communityId: "arteara",
    userId: "bob"
  }));
  console.log("✅ Admin de la comunidad puede actualizar fichas ajenas.");

  // Charles (usuario ajeno) no puede leer ni actualizar fichas en arteara
  await assertFails(getDoc(doc(charlesContext.firestore(), "fichas/alice")));
  console.log("✅ Usuario ajeno a la comunidad tiene denegada la lectura de fichas.");

  await assertFails(setDoc(doc(charlesContext.firestore(), "fichas/alice"), {
    nombre: "Alice Cambiada por Charles",
    communityId: "arteara",
    userId: "alice"
  }));
  console.log("✅ Usuario ajeno a la comunidad tiene denegada la escritura de fichas.");

  await testEnv.cleanup();
  console.log("\n🎉 ¡TODAS LAS PRUEBAS DE SEGURIDAD PASARON EXITOSAMENTE! 🎉");
}

runTests().catch(err => {
  console.error("❌ Fallo en las pruebas:", err);
  process.exit(1);
});
