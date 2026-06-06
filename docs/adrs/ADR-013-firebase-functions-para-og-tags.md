# ADR 013: Introducción de Firebase Functions para OG Tags Dinámicos

**Estado:** Accepted
**Fecha:** 2026-06-06
**Contexto:** Kanarii Web App

## Contexto
El Pasaporte Comunitario requiere renderizar metadatos Open Graph (OG tags) dinámicos para que plataformas como WhatsApp, Telegram y redes sociales muestren una previsualización enriquecida (nombre, foto, rol, Kin Maya) al compartir el enlace de un miembro.
Como Kanarii es una SPA (Single Page Application) servida por Firebase Hosting, los crawlers de los buscadores y redes sociales (que no ejecutan JavaScript) solo reciben el HTML básico vacío de `index.html`.
Necesitamos servir HTML con metadatos dinámicos únicamente a los crawlers de bots sin comprometer la velocidad ni la arquitectura estática de la app para usuarios normales.

## Decisión
Implementar una Cloud Function `ogPassaporte` en Firebase Functions que actúe como bot-detector.
Configuraremos Firebase Hosting para interceptar las peticiones a la ruta del pasaporte `/c/:slug/miembro/:userId`.
- Si el User-Agent coincide con un crawler bot conocido (WhatsApp, Telegram, etc.), Firebase Hosting redirige la petición a la Cloud Function `ogPassaporte`.
- La Cloud Function lee la información del perfil del miembro en Firestore (`/profiles/{userId}` y `/community_members/{slug}_{userId}`), calcula su Kin Maya usando el helper existente y devuelve un HTML estático mínimo que contiene los OG tags requeridos.
- Si es un usuario normal, Hosting sirve la SPA (`index.html`) de forma estándar y el ruteo se maneja en el cliente.

### Componentes Clave
1. **Configuración de Firebase**: Añadir sección `"functions"` en `firebase.json` e inicializar el entorno de Node/TypeScript en la carpeta `functions/`.
2. **Cloud Function `ogPassaporte`**: Endpoint HTTPS para leer perfiles en Firestore y generar el HTML crudo para crawlers.
3. **Reglas de Hosting**: Rewrites condicionales en `firebase.json` que distingan User-Agents de bots.

## Consecuencias

### Positivas (Pros)
* Permite previsualizaciones enriquecidas en redes sociales de manera dinámica por perfil de miembro.
* Evita la migración completa de la aplicación a un framework de SSR pesado, manteniendo la SPA ágil.
* No añade coste ni latencia para los usuarios reales, quienes siguen descargando la SPA directamente de la CDN.

### Negativas (Cons)
* Introduce Firebase Functions como nueva dependencia en el stack tecnológico, aumentando la complejidad del despliegue y la configuración local.
* Latencia inicial (cold start) de las Cloud Functions al generar la primera previsualización para un crawler.

### Riesgos y Mitigaciones
* [Sobrecarga de lecturas de base de datos]: Media -> Añadir cabecera `Cache-Control: public, max-age=3600` en la respuesta de la Cloud Function para que CDN de Firebase Hosting cachee la respuesta y no consulte a Firestore en cada petición repetida del bot.
