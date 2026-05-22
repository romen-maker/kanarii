# ADR 003: Separación de Rol Global y Rol Comunitario

**Estado:** Accepted
**Fecha:** 2026-05-22
**Contexto:** Kanarii - Sistema de Gobernanza y Roles

## Contexto
En el modelo original de Kanarii, no existía una distinción formal entre los privilegios que un usuario posee en la infraestructura global de la plataforma (ej: configurar planes de pago globales, suspender comunidades) y los privilegios específicos que ejerce dentro de una comunidad concreta (ej: moderar foros, gestionar propuestas S3 locales). Esto causaba vulnerabilidades, ya que se confundían los accesos globales con los locales, abriendo la puerta a bypass de seguridad o escalada de privilegios indeseados.

### Alternativas Consideradas
*   **Alternativa A: Rol único jerárquico**: Tratar todos los roles como un único campo (ej: `superadmin`, `admin_comunidad`, `miembro_comunidad`).
    *   *Desventajas*: No escala si un usuario es miembro en dos comunidades y tiene un rol diferente en cada una.
*   **Alternativa B: Roles desacoplados por contextos (Seleccionada)**: Separar los roles en dos colecciones físicas distintas en la base de datos Firestore, permitiendo una lógica independiente en las reglas de seguridad.

## Decisión
Se implementará una arquitectura de roles estrictamente separada en dos capas:
1.  **Rol Global de Plataforma**: Se almacena en la colección de usuarios `/users/{uid}` bajo el campo `role` (`admin | user`). Determina los permisos del usuario para toda la infraestructura.
2.  **Rol Comunitario (Local)**: Se almacena en la colección de membresías `/community_members/{communityId}_{userId}` bajo el campo `rol` (`admin | miembro | visitante`). Determina los permisos del usuario exclusivamente en la comunidad especificada.

Las reglas de seguridad (`firestore.rules`) evaluarán estas propiedades de forma independiente sin cruzar contextos.

## Consecuencias

### Positivas (Pros)
*   **Seguridad y Aislamiento**: Un administrador de una comunidad no hereda privilegios globales y viceversa.
*   **Escalabilidad**: Soporta membresía multi-comunidad de forma nativa con diferentes roles locales por usuario.

### Negativas (Cons)
*   **Complejidad en Consultas**: El frontend debe realizar dos lecturas distintas para determinar el estado de autorización completo del usuario (AuthContext para rol global, ComunidadContext/Membresía para rol local).

### Riesgos y Mitigaciones
*   *Riesgo*: Modificar accidentalmente el rol global en el frontend asumiendo que es local. -> *Mitigación*: Tipado estricto diferenciado para `AppUser` (global) y `CommunityMember` (local).

## Criterio de Revisión
Este ADR será revisado si se añade soporte para roles por invitación y federación en el Sprint 3, o si se requiere un modelo de roles basado en políticas dinámicas.
