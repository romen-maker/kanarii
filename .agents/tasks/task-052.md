# Task-052: Pasaporte Comunitario completo: OG tags dinámicos, flujo "Conectar" real y widget Kin Maya

## Objetivo
Finalizar la funcionalidad del Pasaporte Comunitario implementando:
1. OG Tags dinámicos para redes sociales mediante redirección de crawlers (bot-detector) a una Cloud Function (`ogPasaporte`).
2. Persistencia real para el flujo de "Conectar" entre miembros de una comunidad.
3. Integración visual del widget Kin Maya dentro de la ficha/pasaporte calculada en tiempo real.

## Contexto técnico
- El Pasaporte Comunitario es una SPA en `/c/:slug/miembro/:userId`.
- Los crawlers no ejecutan JS y solo leen el HTML inicial (que tiene OG tags fijos de Kanarii).
- Solución: En `firebase.json` detectamos bots (WhatsApp, Facebook, Twitter, Telegram, Discord, Slack) usando rewrites y los redirigimos a la Cloud Function `ogPasaporte`. Los usuarios reales siguen yendo a `/index.html` (SPA).
- La Cloud Function lee `/profiles/{userId}` y genera un HTML simple con los OG tags correctos (`og:title`, `og:image`, `og:description`) y una redirección JS/meta-refresh por si un usuario real entra por ahí.
- El cálculo del Kin Maya está disponible en `src/lib/kinMaya.ts` (`calcularKin(fecha)`).
- La conexión entre miembros no está implementada. Crearemos la colección `connections` en Firestore.

## Caja de archivos
Archivos autorizados para modificación:
- `firebase.json` → rewrites de Hosting
- `src/pages/PasaporteComunitarioView.tsx` → lógica del botón conectar y paso de fechaNacimiento
- `src/components/perfil/PasaporteVisual.tsx` → renderizar widget Kin Maya y conectar
- `src/lib/appService.ts` / `src/lib/services/index.ts` → exportar funciones de conexión
- [NEW] `src/lib/services/connections.ts` → servicio Firestore para crear/gestionar conexiones
- [NEW] `functions/` → inicializar Firebase Functions (package.json, tsconfig.json, src/index.ts)

## Criterios de done
- [ ] Firebase Functions inicializadas en `functions/` (TypeScript).
- [ ] Cloud Function `ogPasaporte` lee de `/profiles/{userId}`, calcula Kin Maya, lee la triada, y sirve HTML con OG tags dinámicos.
- [ ] `firebase.json` tiene la regla de rewrite condicional para bot-detector apuntando a `ogPasaporte`.
- [ ] Widget de Kin Maya integrado en `PasaporteVisual.tsx` (usando `src/lib/kinMaya.ts`).
- [ ] Colección Firestore `/connections` estructurada con `userId1`, `userId2`, `communityId`, `createdAt`.
- [ ] Botón "Conectar" en el pasaporte realiza la conexión real (crea doc en Firestore) y muestra estado visual (Conectado / Conectar).
- [ ] Compilación del frontend y de las Cloud Functions exitosa y sin errores de TypeScript.

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [ ] Plan presentado al usuario (Fase 3.5)
- [ ] APROBADO recibido — fecha/hora: ___
- [ ] Rama creada: ___
- [ ] Lock activo: ___
- [ ] Sesión cerrada correctamente
