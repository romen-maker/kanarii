# Tarea: T-042 — Despliegue Kanarii en `kanarii.romensuarez.com` con Firebase Hosting

## Estado de aprobación
- [x] Plan aprobado por el usuario
- [x] Caja de archivos declarada
- [x] Sesión cerrada correctamente

## Información de la Tarea
- **ID**: T-042
- **Sprint**: 11
- **Prioridad**: Alta (Bloqueante)
- **Tamaño**: M
- **Estado**: ✅ Hecho

## Contexto técnico
- Se descarta Coolify para el frontend. Se usará **Firebase Hosting** integrado con **GitHub Actions** para el despliegue automático en cada push a `main`.
- Toda la especificación detallada del despliegue, configuración de `firebase.json` y el pipeline de deploy se encuentra documentada en [sprint-11-research.md](file:///home/romen/Proyectos/kanarii/docs/sprints/sprint-11-research.md).
- Cloudflare DNS para `kanarii.romensuarez.com` debe configurarse con proxy desactivado (Nube Gris ☁️) para permitir que Firebase emita el SSL administrado.
- Redirección SPA en `firebase.json` configurando rewrites para dirigir todas las peticiones a `/index.html`.
- Se requiere agregar `kanarii.romensuarez.com` a los dominios autorizados de Firebase Authentication.
- Variables de entorno `VITE_*` necesarias para el build en producción deben inyectarse en el workflow de despliegue mediante GitHub Secrets.

## Caja de archivos
- `firebase.json`
- `.firebaserc`
- `.github/workflows/deploy.yml`
- `vite.config.ts`
- `src/lib/services/fichas.ts`
- `src/App.tsx`

## Pasos de Ejecución
1. [x] Inicializar Firebase en el repositorio creando `firebase.json` y `.firebaserc`.
2. [x] Configurar `.firebaserc` con el ID del proyecto Firebase de producción.
3. [x] Crear `firebase.json` con la configuración de rewrites para React Router SPA y configuración de cabeceras de caché.
4. [x] Crear `.github/workflows/deploy.yml` con la acción de GitHub Actions para desplegar en Firebase Hosting en cada push a `main`.
5. [x] Solicitar al usuario asociar las credenciales (Token de Firebase o Service Account) y configurar el dominio en Cloudflare y Firebase Auth.
6. [x] Validar el despliegue inicial.
7. [x] Configurar `manualChunks` en `vite.config.ts` para separar las dependencias en vendors cacheables.
8. [x] Resolver warning de importación estática/dinámica mixta en `fichas.ts` convirtiendo el import de `gemini.ts` a estático.
9. [x] Validar compilación local, verificar el tamaño de los chunks y desplegar el build optimizado en Firebase Hosting.

## Criterios de Done
- [x] Archivos de configuración de Firebase creados y correctos.
- [x] GitHub Actions configurado para desplegar automáticamente al mergear en `main`.
- [x] SPA redirecciona todas las rutas internas a `index.html` en producción.
- [x] Optimización de bundle size aplicada separando vendors en manualChunks.
- [x] Warnings de Rollup relativos a imports dinámicos y estáticos mixtos de `gemini.ts` solventados.
