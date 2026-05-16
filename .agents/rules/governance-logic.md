# Lógica de Gobernanza — Estado "Duda" ❓

> Este documento es una REGLA de arquitectura lógica. No debe modificarse sin consenso del equipo de diseño.

## El papel de la Duda en S3 Asíncrono

En el flujo de gobernanza de Kanarii, el tipo de respuesta `duda` es **intencionadamente excluido** del contador de quórum (`totalResponsesCount`) y del cálculo de cierre automático.

### Razón del Diseño
1. **Protección del Consentimiento**: Una duda significa que al miembro le falta información crítica. Si sumáramos las dudas al quórum, una propuesta podría alcanzar el 50% y cerrarse como `acordada` mientras un miembro sigue esperando una aclaración.
2. **Pausa Activa**: La duda detiene el "reloj" personal del votante. El quórum solo debe avanzar con votos que representen una posición final (Consentimiento, Preocupación u Objeción).
3. **Flujo de Resolución**: El usuario debe esperar la respuesta del autor en el hilo y, una vez aclarada, cambiar su estado manualmente.

### Implicación en Código (`appService.ts`)
La función `registerPropuestaResponse` mantiene el filtro:
```typescript
const isPositiveType = (t: string) => t === 'consentimiento' || t === 'preocupacion';
```
**NUNCA** añadas `duda` a este filtro. Hacerlo rompería la seguridad del proceso de toma de decisiones.
