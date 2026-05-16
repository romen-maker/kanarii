---
name: test-e2e-kanarii
description: Diseña y genera tests end-to-end para flujos críticos de Kanarii usando Playwright. Úsala cuando un flujo esté estable y el usuario quiera protegerlo contra regresiones.
---

# Test E2E Kanarii (Playwright)

Esta habilidad permite proteger la integridad de Kanarii mediante la creación de tests automatizados de extremo a extremo (E2E). Se enfoca en asegurar que los flujos más valiosos para la comunidad funcionen correctamente desde la perspectiva del usuario real.

## Instrucciones

### 1. Definición del Escenario
- **Flujo Crítico**: Identifica qué está intentando lograr el usuario (ej: "Un miembro nuevo se registra y entra en su comunidad").
- **Pasos en Lenguaje Humano**: Antes de programar, lista los pasos lógicos:
    1. Abrir la web.
    2. Click en botón X.
    3. Rellenar formulario Y.
    4. Verificar que aparece Z.

### 2. Verificación de Entorno
- Comprueba si `@playwright/test` está en el `package.json`.
- Si no está: Propón su instalación (`npm install -D @playwright/test`) y espera la aprobación del usuario antes de continuar.

### 3. Generación del Test (TypeScript)
Escribe el código siguiendo estos estándares de calidad:
- **Aislamiento de Datos**: Genera datos de prueba únicos (ej: emails con timestamp) para evitar colisiones. Nunca uses datos de producción.
- **Limpieza (Cleanup)**: Si el test escribe en Firestore, el test debe encargarse de borrar esos datos al terminar para mantener el entorno limpio.
- **Sin Esperas Arbitrarias**: Prohibido usar `page.waitForTimeout()`. Usa `waitForSelector`, `toBeVisible`, o esperas basadas en red/estado.
- **Comentarios**: Explica el "por qué" de pasos complejos, no el "qué" (que debería ser obvio por el código de Playwright).

### 4. Ejecución y Entrega
- Indica al usuario el comando exacto para ejecutar el test de forma local.
- Si existe un pipeline de CI (GitHub Actions, etc.), indica cómo integrar el nuevo test.

## Flujos Prioritarios en Kanarii
1. **Acceso**: Registro e inicio de sesión.
2. **Tareas**: Creación, edición y visualización de tareas comunitarias.
3. **Acuerdos**: Flujo completo de una propuesta desde su creación hasta su resolución.

## Restricciones
- **Estabilidad**: No crees tests para funcionalidades que aún están en fase de experimentación o diseño (MVP inacabado).
- **Consistencia**: Los tests deben pasar en local antes de ser propuestos para commit.
- **Semántica**: Usa selectores basados en accesibilidad (roles, labels, placeholders) antes que clases CSS o IDs de test.

---

*Última actualización: 15 May 2026*
