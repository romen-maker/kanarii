# ADR 005: Política de Visibilidad de Comunidades por Lectura Autenticada

**Estado:** Accepted
**Fecha:** 2026-05-22
**Contexto:** Kanarii - Privacidad y Acceso a Datos

## Contexto
El modelo inicial de Kanarii consideraba las comunidades como entidades públicas cuyas propiedades y metadatos generales podían leerse de manera abierta y anónima en internet. Sin embargo, el documento de la comunidad contiene campos como `adminUids` que exponen los identificadores únicos (UIDs) de los usuarios administradores de forma abierta. Permitir lecturas no autenticadas en la colección `/comunidades` representa una vulnerabilidad de exposición de metadatos de usuario.

### Alternativas Consideradas
*   **Alternativa A: Lectura totalmente abierta (Pública)**: Permitir consultas anónimas en `/comunidades/{id}`.
    *   *Desventajas*: Riesgo de raspado (scraping) de UIDs de usuarios asociados a comunidades específicas.
*   **Alternativa B: Lectura autenticada obligatoria (Seleccionada)**: Restringir el acceso de lectura en las reglas de seguridad únicamente a usuarios que posean una sesión activa de Firebase Auth.

## Decisión
Se restringe el acceso de lectura en la colección `/comunidades` a peticiones autenticadas:
```javascript
match /comunidades/{communityId} {
  allow read: if request.auth != null;
}
```
Esto elimina la posibilidad de que consultas anónimas recuperen datos de comunidades y UIDs de administradores de la plataforma.

## Consecuencias

### Positivas (Pros)
*   **Seguridad**: Protege la identidad y relación de los administradores locales contra rastreadores automatizados y actores maliciosos no registrados.
*   **Cumplimiento**: Cumple con las directrices de privacidad de datos al requerir un registro previo.

### Negativas (Cons)
*   **UX de Landing Page**: Las páginas iniciales de landing o de exploración pública de comunidades deberán pre-renderizarse en servidor o cargarse desde APIs públicas acotadas que no expongan los UIDs directamente.

### Riesgos y Mitigaciones
*   *Riesgo*: Error de carga de la landing page si intenta leer de Firestore de manera anónima. -> *Mitigación*: Implementar carga de fallback o redirigir al flujo de login para explorar la plataforma.

## Criterio de Revisión
Este ADR será revisado si se decide implementar un Marketplace de comunidades totalmente público en el Sprint 4, en cuyo caso se deberán segmentar los campos sensibles (como `adminUids`) a una subcolección protegida.
