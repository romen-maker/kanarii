# Diagnóstico de Causa Raíz: Mensaje "No Available Server/Service" en Móvil

## 1. Evidencias Técnicas Recopiladas

### A. Inspección del Codebase
- **Cero coincidencias hardcodeadas en Frontend (`src/`):** El texto `"no available server"` o `"no available service"` no existe en el código fuente de la aplicación React. Esto confirma que **no es un mensaje producido por la lógica de la UI de Kanarii**.
- **Inspección de Backend Express (`src/server.ts`):** Tampoco contiene ningún middleware o respuesta personalizada con esta cadena.

### B. Análisis del Entorno Móvil vs. Emulado
- **Móvil Real (PWA / Service Worker activo):** En la build de producción (o PWA instalada en dispositivo móvil), el Service Worker generado por `vite-plugin-pwa` (Workbox) está activo.
- **Configuración Detectada en `vite.config.ts` (Líneas 28-36):**
  Workbox tiene una regla `runtimeCaching` para `firestore.googleapis.com` con la estrategia `NetworkFirst`.
  ```ts
  urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
  handler: 'NetworkFirst'
  ```

### C. Comportamiento según Estado de Sesión y Conectividad
- **Sin sesión iniciada / Cambio de red móvil (3G/4G/5G <-> Wi-Fi):** Cuando la conectividad sufre una micro-interrupción en móvil o cambia de antena, el SDK de Cloud Firestore (que usa WebSockets / Long-Polling) reconecta silenciosamente.
- **Intercepción del Service Worker:** Al estar registrado el Service Worker de PWA con `NetworkFirst` sobre las URLs de Firestore, las peticiones HTTP fallback del SDK son interceptadas por el SW. Al fallar el fetch de red rápido en móvil, Workbox falla sin devolver respuesta, activando el mensaje nativo del navegador/PWA: *"No available server"* / *"Service unavailable"*.

---

## 2. Clasificación de la Causa Raíz

| Origen Evaluado | ¿Es la Causa Raíz? | Explicación |
|---|---|---|
| **Lógica de la App (React/TS)** | ❌ No | La app no emite ese mensaje. |
| **Permisos / Reglas de Firestore** | ❌ No | Los fallos de permisos emiten `permission-denied` estructurado por `handleFirestoreError`. |
| **Backend / Express Server** | ❌ No | El servidor no emite esa cadena. |
| **Conflicto SW PWA + Firestore SDK** | ✅ **SÍ (Causa Primaria)** | Intercepción por parte del Service Worker de las peticiones REST de Firestore en redes móviles variables mediante la regla `NetworkFirst`. |

---

## 3. Matriz de Diferenciación de Fallos

1. **Fallo de Red / Conectividad Móvil (Service Worker / Browser):**
   - *Síntoma:* Popup o alerta nativa *"No available server"* / *"Service unavailable"*.
   - *Comportamiento:* Ocurre en movilidad al pasar de Wi-Fi a datos o en cobertura débil.
2. **Fallo de Permisos (Firestore Rules):**
   - *Síntoma:* Error `permission-denied` capturado por `error-handler.ts`.
   - *Comportamiento:* Ocurre inmediatamente al intentar leer/escribir sin rol o pertenencia a comunidad.
3. **Fallo de Backend / Servidor (Express / API REST):**
   - *Síntoma:* Estado HTTP `500` / `503 Service Unavailable` formateado como JSON `{ error: '...' }`.

---

## 4. Recomendación Concreta de Mitigación (Próximos Pasos)

1. **Excluir `firestore.googleapis.com` del Service Worker (`vite.config.ts`):**
   - El SDK de Firestore ya incluye su propia gestión de caché y reconexión offline (`localCache: memoryLocalCache()`). Delegar esa responsabilidad al Service Worker de PWA causa colisión en redes móviles.
   - Quitar la regla `runtimeCaching` de Firestore en Workbox para dejar que el SDK gestione su conexión directamente.
2. **Ajuste fino en `SyncIndicator.tsx` (UX Amable):**
   - Reflejar en el indicador si el navegador entra en estado `offline`, mostrando un badge suave de *"Reconectando..."* sin alarmar al usuario con diálogos destructivos.
