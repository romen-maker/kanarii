# Auditoría y Diagnóstico: Warning CSP `unsafe-eval`

> **Sprint 22** | T-096 — Informe de Auditoría y Causa Raíz | Kanarii

---

## 1. Contexto y Síntoma

Durante el desarrollo local con Vite (`npm run dev`), puede observarse la siguiente advertencia en la consola del navegador:
```
[CSP] Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source of script...
```

---

## 2. Diagnóstico de Causa Raíz

Tras realizar una auditoría completa del código fuente y de la configuración del proyecto, se determinó lo siguiente:

1. **Diferenciación de Entornos (Dev vs Producción):**
   - **Entorno de Desarrollo (`npm run dev`):**  
     Vite y el plugin `@vitejs/plugin-react` utilizan sintaxis de evaluación dinámica (`eval` y `new Function`) para implementar Fast Refresh (HMR) y generar Source Maps dinámicos en tiempo de ejecución.
   - **Entorno de Producción (`npm run build` / Firebase Hosting):**  
     El empaquetador (Rollup) produce artefactos ES Modules estáticos (`dist/assets/*.js`) libres de llamadas a `eval`.

2. **Verificación de Ficheros de Configuración:**
   - `index.html`: No incluye meta-tags CSP raras o restrictivas.
   - `firebase.json`: No impone cabeceras `Content-Security-Policy` que fuercen la inclusión de `unsafe-eval`.
   - `vite.config.ts`: Mantiene la configuración estándar de Vite sin inyectar evaluaciones inseguras a producción.

---

## 3. Conclusión y Decisión Arquitectónica

- **Causa Raíz:** Tooling de desarrollo (Vite HMR & React Fast Refresh).
- **Impacto en Producción:** **Cero.** La build de producción genera paquetes estáticos seguros.
- **Acción Tomada:**  
  Seguir el principio de **Causalidad Cautelosa**:  
  **NO** se altera `index.html` ni se añade `'unsafe-eval'` a las cabeceras de `firebase.json` en producción, preservando una política de seguridad estricta y evitando relajar la protección en producción para silenciar un warning exclusivo de dev.

---

*Última actualización: Julio 2026 — Sprint 22*
