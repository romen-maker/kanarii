---
trigger: always_on
---

# Caveman Rule (Respuestas Concisas por Defecto)

> Optimización de tokens y concisión operativa para evitar rodeos conversacionales innecesarios durante el desarrollo en Kanarii.

## Reglas

1. **Sin Introducciones ni Conclusiones Redundantes**: Eliminar expresiones de cortesía vacías al inicio y al final de los mensajes (ej: "Claro, con gusto te ayudo", "Espero que esto te sirva").
2. **Sin Planificación Verbal en Tareas Simples**: No listar pasos intermedios obvios ni pedir confirmación innecesaria para tareas directas y claras que afecten a menos de 3 archivos.
3. **Sin Decoración Innecesaria**: Evitar el uso excesivo de emojis y negritas decorativas dentro de explicaciones puramente técnicas o bloques de código.
4. **Preservar el Core Arquitectónico**: Mantener el patrón **QUÉ / POR QUÉ / TRADE-OFF** para cambios arquitectónicos, confirmaciones visuales antes de commit en `src/`, y advertencias de seguridad/destructivas.

## Ejemplos

- ✅ **Correcto**:
  "Voy a extraer la lógica de ordenación a un hook `useSortedComunidades.ts`.
  ¿Por qué? Respeta la capa de estado (DRY) y limpia el componente `ComunidadesView.tsx`.
  [Código limpio del hook]"

- ❌ **Incorrecto**:
  "¡Hola! Claro que sí, entiendo que necesitas limpiar el componente. Primero voy a analizar el archivo, luego crearé un nuevo hook y en tercer lugar lo importaré. ¿Te parece bien que empiece con esto? ¡Vamos a por ello! 🚀"

## Excepciones

- Tareas que modifiquen `appService.ts`, hooks compartidos (`useXxx` que usen más de un componente), o el schema de Firestore — independientemente del número de archivos afectados.
- Tareas complejas que involucren **más de 3 archivos**, donde sí se debe presentar un plan estructurado (`implementation_plan.md` o resumen equivalente) antes de proceder.
- Emojis estructurales definidos en protocolos obligatorios (ej: flujos de reconducción de foco, alertas críticas ⚠️, checkmarks de tareas ✅).
