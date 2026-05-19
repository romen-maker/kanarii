# Plan de Mitigación de Desajuste de UIDs en Autenticación (Auth UID Mismatch Fix)

> Documento de diseño para resolver la inconsistencia cuando un usuario se autentica con un proveedor diferente (o nuevo registro) usando el mismo correo electrónico pero obteniendo un UID diferente de Firebase Auth.

---

## 🧐 El Problema
Actualmente, las colecciones de Firestore (`users`, `profiles`, `community_members`, `acuerdos`, etc.) están vinculadas al campo `uid` (o `userId`) proporcionado por Firebase Auth. 

Si un usuario con el correo `correo@ejemplo.com` inicia sesión con un método diferente o su usuario en Firebase Auth es eliminado y recreado:
1. Firebase Auth genera un **nuevo UID** (ej: `UID_NUEVO`).
2. El sistema actual en `getAppUser` detecta que `UID_NUEVO` no tiene un documento en `/users/UID_NUEVO` y crea uno nuevo desde cero.
3. El usuario pierde el acceso a sus datos antiguos (ficha, perfil, servicios y acuerdos), ya que todos esos documentos siguen vinculados a `UID_VIEJO`.
4. El sistema empieza a renderizar labels como "Cargando..." o "Miembro" en el resto de la aplicación puesto que los UIDs en la colección `acuerdos` y `community_members` ya no coinciden.

---

## 🎯 Solución Propuesta (Auth Defensivo)
Modificar la función `getAppUser` en `src/lib/appService.ts` para interceptar la creación de un nuevo usuario en Firestore basándonos en el correo electrónico.

### Flujo Técnico en `getAppUser`:
1. El usuario se autentica y obtenemos su `uid` y `email` desde Firebase Auth.
2. Comprobamos si existe `/users/{uid}`.
3. **Si el documento NO existe**:
   - En lugar de crear un documento nuevo inmediatamente, realizamos una consulta en la colección `users` por correo:
     ```typescript
     const q = query(collection(db, 'users'), where('email', '==', email));
     const snap = await getDocs(q);
     ```
   - **Escenario A (Existe un usuario previo con diferente UID)**:
     - Logueamos un warning crítico en consola: `⚠️ UID Mismatch detected for email: {email}. Prev UID: {prevUid}, New UID: {newUid}`.
     - **Estrategia de resolución**:
       - *Opción A (Recomendada)*: Asociar el nuevo UID al usuario existente actualizando el documento actual en Firestore (migrando la clave del documento o manteniendo el UID viejo como ID de referencia interna).
       - *Opción B (Pasiva)*: Retornar los datos del usuario existente e iniciar un flujo de sincronización/revinculación en segundo plano.
   - **Escenario B (No existe ningún usuario previo con ese email)**:
     - Procedemos con la creación estándar del documento `/users/{uid}`.

---

## 📋 Tareas y Consideraciones para el Sprint
- [ ] Implementar la consulta por email en `getAppUser` cuando el `uid` no existe en la colección `/users`.
- [ ] Definir la política de migración en caliente (¿Actualizamos las referencias de Firestore `UID_VIEJO` -> `UID_NUEVO` en `community_members` y `profiles` o enlazamos las cuentas a nivel de Firebase Auth?).
- [ ] Añadir pruebas de integración simulando una colisión de email.
