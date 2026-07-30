# Task File: T-096 — Auditoría y Resolución de Warning CSP `unsafe-eval`

> **Sprint 22** | Tarea: `T-096` | Tamaño: **M** | Fecha: 2026-07-30  
> **Objetivo**: Investigar el origen del warning/violación CSP referente a `unsafe-eval` en la consola del navegador, diferenciar si proviene del entorno de desarrollo (HMR / Vite / React DevTools / transpiler) o de producción, y documentar/implementar el fix mínimo seguro.

---

## Estado
- [x] Creado por session-start
- [x] Plan presentado y aprobado con cambios
- [x] Ejecución completada
- [x] Tests pasando
- [x] Sesión cerrada correctamente

---

## Contexto técnico
- Investigar si las cabeceras HTTP o meta tags en `index.html`, `vite.config.ts`, `firebase.json` o servidor exprés incluyen `script-src` restrictivo sin contemplar HMR o evaluadores dinámicos en dev.
- Documentar el hallazgo en `docs/csp-audit-unsafe-eval.md`.
- Aplicar el diagnóstico cauteloso confirmando que en producción la política permanece limpia y estrictamente segura, evitando relajar CSP de producción para silenciar warnings exclusivos de dev HMR.

---

## Caja de archivos (Autorizados para modificación)
- `index.html`
- `vite.config.ts`
- `firebase.json`
- `docs/csp-audit-unsafe-eval.md`

---

## Criterios de Aceptación / Done
- [x] Causa raíz identificada y documentada en `docs/csp-audit-unsafe-eval.md`.
- [x] Confirmada la separación entre entorno de dev (Vite Fast Refresh/HMR) y producción (artefactos ES Modules estáticos libres de eval).
- [x] Pruebas y compilación `npx tsc --noEmit` pasando con 0 errores.
