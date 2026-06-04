# Research Sprint 11: Despliegue de Kanarii en Firebase Hosting

## Stack final (sin Coolify para el frontend)

```
GitHub (main) → GitHub Actions → npm run build → Firebase Hosting CDN
                                                         ↓
                                              kanarii.romensuarez.com
                                              (Cloudflare DNS → Firebase)
```

---

## Paso 1: Inicializar Firebase Hosting en el repo

`firebase-tools` ya está en devDependencies. Solo necesitas hacer login y configurar el proyecto:

```bash
# En la máquina local, desde la raíz del repo
npx firebase login

# Asociar con el proyecto Firebase existente
npx firebase use --add
# → Selecciona el proyecto kanarii-XXXX
# → Alias: production
```

Luego inicializa Hosting **sin sobreescribir nada existente**:

```bash
npx firebase init hosting
```

Respuestas al wizard:
- `What do you want to use as your public directory?` → **`dist`**
- `Configure as a single-page app (rewrite all urls to /index.html)?` → **Yes**
- `Set up automatic builds and deploys with GitHub?` → **No** (lo configuramos a mano en el siguiente paso para tener control total)
- `File dist/index.html already exists. Overwrite?` → **No**

Esto genera `firebase.json` y `.firebaserc`. Añade ambos al commit.

### `firebase.json` — configuración completa

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|woff2|woff|ttf)",
        "headers": [{
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }]
      },
      {
        "source": "index.html",
        "headers": [{
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }]
      }
    ]
  }
}
```

> El `rewrite **→index.html` es crítico para React Router v7. Sin él, cualquier ruta como `/propuestas/123` da 404 al recargar.

---

## Paso 2: Variables de entorno VITE_* — build time

Las variables `VITE_*` se incrustan en el bundle durante `npm run build` — no existen en runtime. Tienes dos formas de gestionarlas:

### Opción A: `.env.production` local (para deploy manual)

Crea `.env.production` en la raíz (ya está en `.gitignore` si usas `.env.*`):

```bash
# .env.production  — NO commitear
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=kanarii-XXXX.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=kanarii-XXXX
VITE_FIREBASE_STORAGE_BUCKET=kanarii-XXXX.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234...
VITE_HD_API_URL=https://hd-api.romensuarez.com
VITE_HD_API_KEY=sk-...
```

Deploy manual:
```bash
npm run build && npx firebase deploy --only hosting
```

### Opción B: GitHub Actions + GitHub Secrets (recomendada — auto-deploy)

En GitHub → Settings → Secrets and variables → Actions → New repository secret, añade cada `VITE_*` como secret.

Crea `.github/workflows/deploy.yml`:

```yaml
name: Deploy Kanarii to Firebase Hosting

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_HD_API_URL: ${{ secrets.VITE_HD_API_URL }}
          VITE_HD_API_KEY: ${{ secrets.VITE_HD_API_KEY }}

      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: kanarii-XXXX  # ← cambia por tu project ID real
```

Para el `FIREBASE_SERVICE_ACCOUNT`: en Firebase Console → Project Settings → Service accounts → Generate new private key. Copia el JSON completo y pégalo como secret en GitHub con el nombre `FIREBASE_SERVICE_ACCOUNT`.

---

## Paso 3: Dominio personalizado en Firebase Hosting

En Firebase Console → Hosting → Add custom domain:

1. Escribe `kanarii.romensuarez.com`
2. Firebase te muestra dos registros TXT para verificación de dominio y dos registros A para apuntar el tráfico. Algo así:

```
Verificación (TXT):
  kanarii.romensuarez.com  TXT  "firebase=kanarii-XXXX"

Apuntamiento (A records):
  kanarii.romensuarez.com  A  151.101.1.195
  kanarii.romensuarez.com  A  151.101.65.195
```

---

## Paso 4: DNS en Cloudflare — configuración crítica

En Cloudflare → DNS → Records para `romensuarez.com`:

**Añade los dos A records que Firebase te dio:**

```
Tipo: A  |  Nombre: kanarii  |  Contenido: 151.101.X.X  |  Proxy: ☁️ GRIS (desactivado)
Tipo: A  |  Nombre: kanarii  |  Contenido: 151.101.X.X  |  Proxy: ☁️ GRIS (desactivado)
```

**Añade el registro TXT de verificación:**
```
Tipo: TXT  |  Nombre: kanarii  |  Contenido: firebase=kanarii-XXXX
```

> ⚠️ **El proxy de Cloudflare (nube naranja) debe estar DESACTIVADO** para el subdominio `kanarii`. Firebase Hosting gestiona su propio SSL (certificado Google-managed, gratis, autorenovado) y necesita ver el tráfico directamente. Con proxy naranja activado, Firebase no puede emitir el certificado y el dominio queda en estado "Needs attention" indefinidamente.

---

## Paso 5: Añadir dominio autorizado en Firebase Auth

**Obligatorio antes del primer login en producción.** Sin esto, Firebase Auth rechaza todos los intentos de login desde el dominio personalizado:

Firebase Console → Authentication → Settings → Authorized domains → **Add domain** → `kanarii.romensuarez.com`

---

## Verificación post-deploy

```bash
# Verificar que el build funciona localmente antes del primer deploy
npm run build && npx firebase serve --only hosting

# Deploy manual de prueba
npx firebase deploy --only hosting --debug

# Ver estado del dominio personalizado
npx firebase hosting:channel:list
```
