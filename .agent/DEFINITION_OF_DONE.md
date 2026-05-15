# 📋 Definition of Done - Checklist de Finalización de Funcionalidades

Este documento define las condiciones obligatorias que cualquier feature o fix debe cumplir antes de darse por finalizado y fusionarse a la rama `main` en Kanarii.

---

## ✅ Antes de Preparar el Commit

### 1. Calidad del Código y Arquitectura (DRY)
- [ ] **Arquitectura de 3 Capas**: Verificado que las páginas (`src/pages`) solo orquestan y no importan `appService` ni `firestore` directamente.
- [ ] **Hooks Tipados**: Todos los nuevos hooks mantienen la convención `{ items, loading, reload }`.
- [ ] **Mutaciones Seguras**: Cualquier escritura a BD pasa por `useEntityActions` con manejo de errores y Toasts.
- [ ] **TypeScript Estricto**: No hay advertencias de tipo `any` injustificadas ni errores en consola. `tsc --noEmit` pasa sin errores.
- [ ] **Componentes Limpios**: No hay lógica de negocio compleja anidada en la UI. Componentes mayores de 80-100 líneas han sido evaluados para extracción.

### 2. Documentación y Seguimiento
- [ ] **ROADMAP.md**: 
    - Marcada la tarea actual con `[x]`.
    - Añadidas ideas secundarias descubiertas al Backlog.
    - Fecha de `*Última actualización:*` modificada.
- [ ] **CHANGELOG.md**: Actualizado con el resumen de la nueva funcionalidad si aplica.
- [ ] **Comentarios Inline**: Código no evidente explicado con "porqués" en español.

### 3. Seguridad y Accesibilidad
- [ ] **Accesibilidad Revisada**: Contraste, labels y soporte básico evaluado (idealmente pasando por la skill `accesibilidad-comunitaria`).
- [ ] **Permisos / Rules**: Si hay colecciones nuevas, las reglas de Firestore (Firestore Security Rules) contemplan la seguridad y membresía necesaria.

---

## 🛑 Proceso de Commit y Merge

### 4. Confirmación Visual (Obligatoria)
- [ ] **Pausa del Agente**: El agente debe detenerse y mostrar el resumen de los archivos `src/` tocados.
- [ ] **Aprobación Humana**: El usuario ha respondido *"sí, commitea"* tras verificar en su localhost que la UI se renderiza como se espera.

### 5. Git Flow
- [ ] **Commits Convencionales**: El mensaje sigue la regla (ej: `feat: añade gestión de calendario`, `fix: corrige desbordamiento en sidebar`).
- [ ] **Ramas**: El trabajo se hizo en una rama descriptiva (`feat/x`, `fix/y`) o se pide permiso explícito para ir a `main`.

---

## 🔍 Verificación Post-Merge

Tras subir los cambios a producción (origin/main):
- [ ] **Tests E2E**: Si existen flujos Playwright para esta parte de la app, ejecutarlos y verificar que pasen en CI/CD o local.
- [ ] **Despliegue**: Comprobar que el build de Vite no arroja advertencias de tamaño excesivo de bundle.
- [ ] **Limpieza**: Borrar la rama de feature local y remotamente.

---

*Este checklist es OBLIGATORIO para el estándar de calidad de Kanarii. Ningún agente debe dar por completada una sesión técnica sin validar estos puntos.*

*Última actualización: 15 May 2026*
