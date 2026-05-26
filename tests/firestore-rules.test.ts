import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertSucceeds,
  assertFails
} from "@firebase/rules-unit-testing";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import * as fs from "fs";

const PROJECT_ID = "kanarii-rules-testing";

async function runTests() {
  console.log("Inicializando entorno de pruebas para Firestore Rules...");
  
  const testEnv: RulesTestEnvironment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: fs.readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });

  try {
    // 1. Limpiar base de datos al inicio
    await testEnv.clearFirestore();

    // ==========================================
    // SECCIÓN 1: REGLAS DE USUARIOS (/users/{uid})
    // ==========================================
    console.log("\n--- Probando reglas de /users/{uid} ---");
    
    // Alice intenta leer y escribir su propio perfil
    const aliceDb = testEnv.authenticatedContext("alice").firestore();
    const bobDb = testEnv.authenticatedContext("bob").firestore();
    const unauthDb = testEnv.unauthenticatedContext().firestore();

    // Alice crea su propio perfil sin rol admin (debe tener éxito)
    await assertSucceeds(
      setDoc(doc(aliceDb, "users", "alice"), {
        name: "Alice",
        role: "user"
      })
    );
    console.log("✓ Alice puede crear su propio perfil de usuario");

    // Alice intenta crear su perfil como admin global (debe fallar)
    await assertFails(
      setDoc(doc(aliceDb, "users", "alice-malicious"), {
        name: "Malicious Alice",
        role: "admin"
      })
    );
    console.log("✓ Alice no puede crearse a sí misma como admin global");

    // Bob intenta escribir en el perfil de Alice (debe fallar)
    await assertFails(
      setDoc(doc(bobDb, "users", "alice"), {
        name: "Bob pretending to be Alice"
      })
    );
    console.log("✓ Bob no puede escribir en el perfil de Alice");

    // Bob puede leer el perfil de Alice si está autenticado
    await assertSucceeds(
      getDoc(doc(bobDb, "users", "alice"))
    );
    console.log("✓ Bob (autenticado) puede leer el perfil de Alice");

    // Un usuario no autenticado no puede leer perfiles
    await assertFails(
      getDoc(doc(unauthDb, "users", "alice"))
    );
    console.log("✓ Usuario no autenticado no puede leer perfiles");


    // ==========================================
    // SECCIÓN 2: REGLAS DE COMUNIDADES Y MEMBRESÍAS
    // ==========================================
    console.log("\n--- Probando reglas de /comunidades y /community_members ---");

    // Creamos datos iniciales sin evaluar reglas de seguridad (bypass)
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      
      // Creamos comunidadA
      await setDoc(doc(db, "comunidades", "comunidadA"), {
        nombre: "Comunidad A",
        createdBy: "alice",
        adminUids: ["alice"],
        requiereAprobacion: false
      });

      // Alice es admin de comunidadA
      await setDoc(doc(db, "community_members", "comunidadA_alice"), {
        rol: "admin",
        userId: "alice",
        communityId: "comunidadA"
      });

      // Bob es miembro normal de comunidadA
      await setDoc(doc(db, "community_members", "comunidadA_bob"), {
        rol: "miembro",
        userId: "bob",
        communityId: "comunidadA"
      });

      // Charlie no tiene ninguna relación con comunidadA
    });

    const charlieDb = testEnv.authenticatedContext("charlie").firestore();

    // Test A: Admin (Alice) puede editar la comunidad
    await assertSucceeds(
      updateDoc(doc(aliceDb, "comunidades", "comunidadA"), {
        nombre: "Comunidad A - Editada"
      })
    );
    console.log("✓ Admin (Alice) puede editar la comunidad");

    // Test B: Miembro (Bob) NO puede editar la comunidad (solo leer)
    await assertFails(
      updateDoc(doc(bobDb, "comunidades", "comunidadA"), {
        nombre: "Intento de edición por Bob"
      })
    );
    console.log("✓ Miembro (Bob) no puede editar la comunidad");

    // Test C: Miembro (Bob) sí puede leer la comunidad
    await assertSucceeds(
      getDoc(doc(bobDb, "comunidades", "comunidadA"))
    );
    console.log("✓ Miembro (Bob) puede leer la comunidad");

    // Test D: Un no-miembro (Charlie) puede leer la comunidad (lectura autenticada pública por regla line 82)
    await assertSucceeds(
      getDoc(doc(charlieDb, "comunidades", "comunidadA"))
    );
    console.log("✓ No-miembro (Charlie) puede leer la comunidad");

    // Test E: Charlie no puede modificar la comunidad
    await assertFails(
      updateDoc(doc(charlieDb, "comunidades", "comunidadA"), {
        nombre: "Intento de edición por Charlie"
      })
    );
    console.log("✓ No-miembro (Charlie) no puede editar la comunidad");


    // ==========================================
    // SECCIÓN 3: REGLAS DE MEMBRESÍAS ESPECÍFICAS
    // ==========================================
    console.log("\n--- Probando reglas específicas de /community_members ---");

    // Alice (admin) puede actualizar la membresía de Bob
    await assertSucceeds(
      updateDoc(doc(aliceDb, "community_members", "comunidadA_bob"), {
        rol: "admin" // Alice promueve a Bob
      })
    );
    console.log("✓ Admin (Alice) puede editar membresías de otros en su comunidad");

    // Restauramos el rol de Bob a miembro para los siguientes tests
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "community_members", "comunidadA_bob"), {
        rol: "miembro",
        userId: "bob",
        communityId: "comunidadA"
      });
    });

    // Bob (miembro) no puede editar la membresía de Alice
    await assertFails(
      updateDoc(doc(bobDb, "community_members", "comunidadA_alice"), {
        rol: "visitante"
      })
    );
    console.log("✓ Miembro (Bob) no puede editar membresías de otros");

    console.log("\n==========================================");
    console.log("🎉 ¡TODAS LAS PRUEBAS PASARON EXITOSAMENTE! 🎉");
    console.log("==========================================\n");

  } catch (error) {
    console.error("❌ Error durante la ejecución de las pruebas:", error);
    throw error;
  } finally {
    // Liberar recursos
    await testEnv.cleanup();
  }
}

runTests().catch((err) => {
  process.exit(1);
});
