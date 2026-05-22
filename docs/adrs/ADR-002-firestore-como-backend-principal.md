# ADR 002: Firestore como backend principal en MVP multi-comunidad

**Estado:** Accepted  
**Fecha:** 2026-05-22  
**Contexto:** Kanarii

## Contexto
Kanarii necesita avanzar rápido en funcionalidades comunitarias: onboarding, comunidades, propuestas, acuerdos, servicios, actas y tareas. El equipo es pequeño y el sistema ya usa Firebase Authentication y Firestore en gran parte de su superficie funcional.

## Decisión
Se mantiene Firestore como backend principal del MVP y de la etapa actual multi-comunidad. La prioridad es consolidar seguridad, reglas, estructura de datos y DX antes de plantear una migración de backend.

### Componentes Clave
1. Firestore como base de datos operacional principal.
2. Firestore Rules como capa crítica de autorización.
3. Servicios y hooks como frontera para minimizar acoplamiento directo.
4. Documentar límites que faciliten futuras migraciones parciales.

## Consecuencias

### Positivas (Pros)
* Permite iterar muy rápido sobre producto y permisos.
* Reutiliza infraestructura y conocimiento ya presentes en el proyecto.
* Reduce dispersión técnica en una etapa todavía exploratoria.

### Negativas (Cons)
* Mantiene dependencia fuerte de Firebase en datos y seguridad.
* Algunas consultas complejas, offline avanzado y RAG soberano pueden requerir piezas complementarias en el futuro.

### Riesgos y Mitigaciones
* Riesgo: reglas inseguras o incompletas. -> Mitigación: priorizar auditoría y endurecimiento de Firestore Rules.
* Riesgo: crecimiento desordenado del esquema. -> Mitigación: usar ADRs, task files y servicios tipados.

## Referencias
* firestore.rules
* appService.ts y hooks de entidad
* roadmap.md
