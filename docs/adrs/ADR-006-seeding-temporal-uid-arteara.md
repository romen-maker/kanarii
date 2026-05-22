# ADR 006: Uso Temporal del UID Fijo de Arteara como Workaround de Seeding

**Estado:** Proposed
**Fecha:** 2026-05-22
**Contexto:** Kanarii - Inicialización de Datos (Seeding)

## Contexto
El flujo de inicialización del sistema en `appService.ts` ejecuta `seedArteara(adminUid)` para asegurar la existencia de la comunidad fundadora "Arteara". Para identificar a qué usuario asociar la administración de dicha comunidad, el código realizaba búsquedas dinámicas no indexadas usando emails hardcodeados. Este mecanismo no era determinista, dependía del correo de un usuario particular y provocaba errores en entornos de staging/producción.

Para mitigar esto, se ha identificado el UID del administrador real en la base de datos actual: `Ma5KgZgD7RYWl9jDjzBeGnFzeno2`.

### Alternativas Consideradas
*   **Alternativa A: Búsqueda dinámica basada en claims personalizados**: Consultar dinámicamente qué usuario tiene un claim de superadministrador.
    *   *Desventajas*: Firebase Auth Client SDK no permite consultar claims de otros usuarios directamente sin un backend administrativo (Cloud Functions).
*   **Alternativa B: UID constante temporal (Seleccionada)**: Hardcodear de forma temporal y documentada el UID del administrador fundador para el entorno actual de base de datos.

## Decisión
Se decide utilizar de forma constante el UID `Ma5KgZgD7RYWl9jDjzBeGnFzeno2` únicamente como fallback temporal de seeding de Arteara. Este UID se marcará explícitamente en el código con un comentario de advertencia (`// TODO / TEMP WORKAROUND`) para indicar que es una solución transitoria ligada al entorno de datos actual y no constituye un diseño permanente de la arquitectura del sistema.

## Consecuencias

### Positivas (Pros)
*   **Determinismo**: La comunidad Arteara se creará siempre vinculada al usuario administrador correcto en el entorno actual.
*   **Simplicidad**: Se evita la complejidad de configurar Cloud Functions o middleware administrativo únicamente para el seeding inicial.

### Negativas (Cons)
*   **Acoplamiento de Datos**: El código queda atado a un UID de un entorno físico específico, lo que impedirá levantar el proyecto en un proyecto Firebase limpio sin crear previamente ese usuario.

### Riesgos y Mitigaciones
*   *Riesgo*: Error de seeding si el UID no existe en una base de datos nueva. -> *Mitigación*: Envolver el seeding en un bloque try/catch para que falle silenciosamente sin bloquear la inicialización general de la app.

## Criterio de Revisión
Este ADR se considerará obsoleto e invalidado en el Sprint 3 cuando se implemente un script de inicialización administrativo externo (CLI) para la creación y seeding de comunidades de forma desacoplada de la app cliente.
