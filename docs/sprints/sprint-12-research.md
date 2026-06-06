# Research Sprint 12
> Fuente: Perplexity — 2026-06-05
> Tarea principal: PWA migración + Pasaporte Comunitario completo

## Hallazgos clave

### PWA — vite-plugin-pwa

- **`registerType: 'prompt'`** en vez de `autoUpdate`. Razón: autoUpdate recarga sin avisar, destructivo si el usuario está escribiendo una propuesta.
- **`navigateFallback: '/index.html'`** alineado con rewrite `**` de `firebase.json`.
- **`navigateFallbackDenylist`**: excluir `/api/`, `/__/`, `/firestore/` (rutas internas Firebase).
- **Headers en `firebase.json`**: `Cache-Control: no-cache` para `sw.js` y `workbox-*.js`.
- **iOS gotcha**: `skipWaiting` + `clientsClaim` (que `autoUpdate` activa) puede causar pantalla en blanco en Safari. Con `prompt` se evita.
- El SW generado va a `dist/sw.js`. Firebase Hosting lo sirve como archivo estático sin conflicto con rewrites (el catch-all `**` solo aplica a rutas sin archivo existente).
- Los `manualChunks` actuales de `vite.config.ts` son compatibles — los chunks `vendor-*` se precachean automáticamente.

### OG tags — Pasaporte Comunitario

- `react-helmet-async` **no funciona** para crawlers de WhatsApp/Telegram/Facebook. Los bots no ejecutan JavaScript — leen HTML crudo.
- **Solución MVP**: Cloud Function `ogPassaporte` como bot-detector. Firebase Hosting detecta User-Agent bot y redirige a la función, que devuelve HTML mínimo con OG tags. Usuarios normales reciben la SPA.
- `react-helmet-async` sigue útil para `<title>` dinámico en el historial del navegador.
- **Dependencia nueva**: Firebase Functions (primera vez en el stack). Documentar en ADR.

## Decisiones tomadas
- **PWA**: Usar `vite-plugin-pwa` con `registerType: 'prompt'` + toast "Nueva versión disponible"
- **Por qué prompt**: No interrumpir al usuario durante operaciones de gobernanza
- **OG tags**: Cloud Function bot-detector (`ogPassaporte`) + `react-helmet-async` para client-side
- **Por qué CF**: Única opción que funciona con crawlers sin migrar a SSR
- **Constraint clave**: Primera Cloud Function del proyecto, requiere ADR

## Descartado
- `autoUpdate` — destructivo en app de gobernanza con formularios largos
- `react-helmet-async` solo — bots no ejecutan JS, preview en blanco en WhatsApp
- Prerender estático — rutas de pasaporte son dinámicas por uid
- SSR completo (Remix/Next.js) — migración total fuera de scope

## Configuración de referencia

### vite.config.ts (plugin PWA)
```ts
import { VitePWA } from 'vite-plugin-pwa';

VitePWA({
  registerType: 'prompt',
  injectRegister: 'auto',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    navigateFallback: '/index.html',
    navigateFallbackDenylist: [/^\/api\//, /^\/__\//, /^\/firestore\//],
    cleanupOutdatedCaches: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'firestore-cache',
          expiration: { maxEntries: 50, maxAgeSeconds: 300 },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
    ],
  },
  manifest: {
    name: 'Kanarii',
    short_name: 'Kanarii',
    description: 'Plataforma para comunidades intencionadas',
    theme_color: '#1a1a2e',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/',
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  },
})
```

### firebase.json — headers para SW
```json
"headers": [
  {
    "source": "/sw.js",
    "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
  },
  {
    "source": "/workbox-*.js",
    "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
  }
]
```

### PwaUpdatePrompt.tsx
```tsx
import { useRegisterSW } from 'virtual:pwa-register/react';

export function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50
                    bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg
                    flex items-center gap-3 text-sm">
      <span>🔄 Nueva versión disponible</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="bg-white text-gray-900 px-3 py-1 rounded-lg font-medium"
      >
        Actualizar
      </button>
      <button onClick={() => setNeedRefresh(false)} className="opacity-60">✕</button>
    </div>
  );
}
```

### Cloud Function ogPassaporte (referencia)
```ts
import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

const BOT_AGENTS = /facebookexternalhit|WhatsApp|TelegramBot|Twitterbot|LinkedInBot|Slackbot/i;

export const ogPassaporte = onRequest(async (req, res) => {
  const uid = req.path.split('/').pop();
  const isBot = BOT_AGENTS.test(req.headers['user-agent'] || '');

  if (!isBot) {
    res.redirect(302, `/pasaporte/${uid}`);
    return;
  }

  const db = getFirestore();
  // NOTA: verificar ruta real de la ficha en appService.ts antes de implementar
  const fichaSnap = await db.collection('fichas').doc(uid!).get();
  const ficha = fichaSnap.data();

  if (!ficha) {
    res.status(404).send('Not found');
    return;
  }

  const nombre = ficha.nombre || 'Miembro de Kanarii';
  const comunidad = ficha.comunidadNombre || 'Comunidad Kanarii';
  const kin = ficha.kinMaya?.nombre || '';
  const foto = ficha.fotoUrl || 'https://kanarii.app/og-default.png';
  const url = `https://kanarii.app/pasaporte/${uid}`;

  res.set('Cache-Control', 'public, max-age=3600');
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta property="og:title" content="${nombre} · ${comunidad}" />
  <meta property="og:description" content="Kin Maya: ${kin} · Pasaporte Comunitario Kanarii" />
  <meta property="og:image" content="${foto}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="profile" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${nombre} · ${comunidad}" />
  <meta name="twitter:image" content="${foto}" />
  <title>${nombre} · Kanarii</title>
</head>
<body></body>
</html>`);
});
```

## Verificaciones completadas (pre-implementación)

### ✅ Verificación 1: Ruta exacta del Pasaporte
- **Ruta react-router**: `/c/:slug/miembro/:userId` (App.tsx L97)
- **Parámetros**: `slug` = comunidad, `userId` = uid del miembro
- **Implicación para Cloud Function**: el rewrite de firebase.json debe interceptar `/c/:slug/miembro/:userId` (no `/pasaporte/:uid` como asumía el research de Perplexity)
- **firebase.json actual**: solo tiene rewrite `**` → `/index.html`, sin headers de cache

### ✅ Verificación 2: Estructura Firestore del perfil
- **PasaporteComunitarioView** usa DOS fuentes en paralelo:
  1. `getUserFicha(userId)` → lee `/profiles/{userId}` (fichas.ts L42-54)
  2. `getMemberInfo(userId, slug)` → lee `/community_members/{slug}_{userId}` (members.ts L26-58)
- **Campos usados en el pasaporte**:
  - `nombre`: `memberInfo.nombre || memberInfo.displayName || ficha.datosOnboarding.nombre`
  - `avatar`: `memberInfo.photoURL || ficha.datosOnboarding.plataformaOrigen`
  - `roles`: `memberInfo.rol_comunidad || memberInfo.rolComunitario || ficha.datosOnboarding.rol_comunidad`
  - `triada`: extraída con `getTriadaFromFicha(ficha)` → `ficha.triada.{ofrendas,saberes,necesidades}`
- **Cloud Function ogPassaporte debe leer**:
  - Colección: `/profiles/{userId}` (fuente primaria, tiene todos los campos)
  - Fallback: `/community_members/{slug}_{userId}` (tiene nombre, photoURL, rol)
  - Para Kin Maya: `ficha.datosOnboarding?.fechaNacimiento` + calcular con `kinMaya.ts`
- **El research de Perplexity asumía `/fichas/{uid}`** → incorrecto, la fuente primaria es `/profiles/{userId}`
