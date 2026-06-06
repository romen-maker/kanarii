# Idea: Auditoría y Refactor de Service Worker / PWA & Fix de CreateTareaModal

- **Idea:** Implementar la configuración adecuada de PWA usando `vite-plugin-pwa` para solucionar el problema de actualización de caché y service worker en Firebase Hosting, y resolver el bloqueo del botón "Cancelar" offline en `CreateTareaModal`.
- **Impacto estimado:** Mucho
- **Contexto:** Solicitud directa de auditoría de Service Worker y PWA tras el fix de Kin Maya.
- **Capturado:** 2026-06-04 23:28

---

## Detalles del Diagnóstico Técnico

### 1. Problema de Service Worker y Actualización de PWA
El síntoma de que la PWA no actualiza en dispositivos móviles se debe a la ausencia de un plugin de PWA y al uso de un SW manual rudimentario.

#### A) vite.config.ts
* **Estado actual:** No está instalado ni configurado `vite-plugin-pwa` en `package.json` o `vite.config.ts`.
* **Causa:** El navegador móvil mantiene activa la caché de la versión anterior del Service Worker indefinidamente porque no se controla el ciclo de vida ni se invalidan los chunks del build.
* **Propuesta de solución:**
  1. Instalar el plugin: `npm install -D vite-plugin-pwa`
  2. Configurar el plugin en `vite.config.ts` usando la estrategia `generateSW` con `registerType: 'autoUpdate'`:
     ```typescript
     import { VitePWA } from 'vite-plugin-pwa';
     // ...
     plugins: [
       react(), 
       tailwindcss(),
       VitePWA({
         registerType: 'autoUpdate',
         workbox: {
           globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
           skipWaiting: true,
           clientsClaim: true,
         }
       })
     ]
     ```

#### B) public/sw.js
* **Estado actual:** Service Worker estático y manual.
* **Causa:** 
  - La caché es rígida (`'kanarii-v1'`) y solo incluye `/` y `/index.html`. No precachea los chunks compilados (`dist/assets/*.js|css`), lo que causa pantallas en blanco offline.
  - Al no invocar `self.skipWaiting()` ni `self.clients.claim()`, el navegador retiene la versión anterior en espera ("waiting") de por vida en la app instalada en móvil.
* **Propuesta de solución:** Eliminar el archivo `public/sw.js` y permitir que `vite-plugin-pwa` genere dinámicamente un Service Worker robusto durante la compilación.

#### C) src/main.tsx
* **Estado actual:** Registro manual del Service Worker sin lógica de refresco o Skip Waiting.
* **Propuesta de solución:** Delegar el registro del Service Worker en `vite-plugin-pwa` (`injectRegister: 'auto'`) o integrarlo a través del registro oficial del plugin.

---

### 2. Bloqueo en CreateTareaModal (Botón "Cancelar")

* **Archivo:** `src/components/CreateTareaModal.tsx` (Líneas 146-153)
* **Causa:** El botón "Cancelar" tiene `disabled={isSubmitting}`. En condiciones offline, al intentar guardar una tarea, la promesa de guardado de Firestore permanece pendiente (la base de datos espera conexión). El estado `isSubmitting` se congela en `true`, inhabilitando el botón "Cancelar". La X del header (`✕`) no está deshabilitada y funciona porque carece de esta propiedad.
* **Propuesta de solución:** Eliminar `disabled={isSubmitting}` del botón "Cancelar" para permitir que se pueda presionar en cualquier circunstancia.
  ```diff
  <button
    type="button"
    onClick={onClose}
    className="px-4 py-2 text-stone-500 hover:bg-[#FDFBF7] rounded-xl font-medium transition-colors"
-   disabled={isSubmitting}
  >
    Cancelar
  </button>
  ```
