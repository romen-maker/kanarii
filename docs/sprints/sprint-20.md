# Sprint 20 — 30/07/2026 → 03/08/2026: Backend Node en Docker & Despliegue en Coolify

## Estado
🟡 En curso

## Objetivo del Sprint
Construir un servidor ejecutable unificado en Node.js/Express (`src/server.ts`), empaquetarlo en una imagen de contenedor Docker multi-etapa de producción y configurar la orquestación para Coolify (VPS), permitiendo servir el frontend SPA estático, la API REST multicanal, la integración del bot de Telegram y la verificación mediante `/health` bajo una URL temporal y lista para un dominio propio.

## Principios del Sprint
1. **Monolito Adaptativo Unificado**: Servir SPA frontend, API backend y adaptadores en un único proceso Node en la misma instancia de contenedor Docker.
2. **Optimización de Imagen Docker**: Utilizar un `Dockerfile` multi-stage (builder Node -> runner Alpine liviano de producción) minimizando el consumo de RAM a <200MB.
3. **Despliegue Cero-Fricción en Coolify**: Configuración transparente mediante `docker-compose.yml` y variables de entorno estándar de producción.

## Tareas
| ID | Descripción | Tamaño | Estado | Task file |
|---|---|---|---|---|
| T-084 | Servidor Unificado Node.js (`src/server.ts`) | M | ✅ Completada | [task-084.md](file:///home/romen/Proyectos/kanarii/.agents/tasks/task-084.md) |
| T-085 | Dockerización de Producción Multi-etapa (`Dockerfile` + `.dockerignore`) | M | ⬜ Pendiente | — |
| T-086 | Configuración para Coolify (`docker-compose.yml` + `.env.example.coolify`) | S | ⬜ Pendiente | — |
| T-087 | Verificación de Despliegue y Hardening (SPA Fallback & Healthcheck) | S | ⬜ Pendiente | — |

## Lo que se deja Fuera Explícitamente
- ❌ Refactors en capas de UI o componentes de React.
- ❌ Creación de bases de datos adicionales fuera de Cloud Firestore.
- ❌ Cambios en la lógica de negocio o firma de adaptadores existentes.

## Criterio de Éxito Medible
- Imagen Docker compilada sin errores y ejecutándose en puerto `PORT` respondiendo `200 OK` en `GET /health` y sirviendo rutas cliente SPA sin dar 404 (`npx tsc --noEmit` con 0 errores).
