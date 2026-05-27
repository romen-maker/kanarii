# ADR 010: Modelo de resolución de objeciones — "Objetor retira"

**Estado:** Accepted  
**Fecha:** 2026-05-27  
**Contexto:** Kanarii  

## Contexto
En el flujo de toma de decisiones por consentimiento de Sociocracia 3.0 (S3), las propuestas pasan al estado `en_objeciones` cuando se recibe una objeción válida de al menos un miembro. A la hora de resolver estas objeciones y permitir que la propuesta pueda volver a avanzar hacia su aprobación (`acordada`), existen dos filosofías de diseño:
1. **"Autor/Facilitador resuelve":** El creador de la propuesta o el facilitador del espacio marca unilateralmente la objeción como "resuelta" en la interfaz.
2. **"Objetor retira":** La objeción solo se considera resuelta cuando el propio miembro que objetó decide retirar la objeción o cambiar su voto (por ejemplo, después de una ronda de integración de objeciones).

## Decisión
Se decide adoptar el modelo **"Objetor retira"**. Una objeción solo desaparece de la propuesta cuando el propio usuario que la emitió edita o cambia su voto a favor/neutral.

No existirá ningún mecanismo ni botón para que el autor de la propuesta o un facilitador marquen una objeción de otro miembro como "resuelta" unilateralmente.

### Razones de la decisión:
* **Prevención de "Poder-Sobre":** Evitar que roles jerárquicos o de facilitación puedan ignorar objeciones válidas de la comunidad marcándolas como resueltas sin un consenso o integración real de la voz disidente.
* **Consentimiento Real:** Asegura que quien objeta mantiene la soberanía de su argumento hasta que se sienta integrado por la propuesta modificada.

### Advertencia de Rango y Configuración de Quórum:
* El cálculo para la transición automática a `acordada` (cierre de votación) utiliza actualmente un umbral de participación del 50% (quórum).
* **Importante:** Este porcentaje debe validarse y consensuarse con la comunidad piloto de Kanarii antes de activar de forma definitiva el cierre automático en el entorno de producción.

## Consecuencias

### Positivas (Pros)
* Alineación total con los principios sociocráticos y la equivalencia de voz en el consentimiento.
* Mayor confianza y seguridad psicológica para los miembros que expresan disenso.

### Negativas (Cons)
* Puede provocar bloqueo de propuestas si un usuario que objetó no vuelve a entrar a la aplicación para retirar su objeción, incluso si la propuesta ha sido modificada para integrar su punto de vista.

### Riesgos y Mitigaciones
* *Bloqueo de propuestas por inactividad del objetor.*
  * *Mitigación:* Se debe diseñar un flujo claro de comunicación o notificaciones fuera de la app (o hilo de aclaración) para avisar al objetor de que su objeción ha sido abordada mediante una edición de la propuesta, invitándole a cambiar su voto.

## Referencias
* Discusión y diseño en [sprint-05-research.md](file:///home/romen/Proyectos/kanarii/docs/sprints/sprint-05-research.md)
* Archivo de cambios: [propuestas.ts](file:///home/romen/Proyectos/kanarii/src/lib/services/propuestas.ts)
