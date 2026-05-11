# REGLA: Flujo de Trabajo Estricto (Protocolo Anti-Regresión)

> [!IMPORTANT]
> Esta regla es de cumplimiento OBLIGATORIO para cualquier agente que trabaje en el repositorio Kanarii. El incumplimiento de este flujo se considera un fallo crítico de seguridad operativa.

## 1. Fase de Investigación (Research First)
- **Análisis Profundo:** Antes de proponer CUALQUIER cambio, el agente debe leer y comprender los archivos afectados y sus dependencias.
- **Evidencia Basada en Datos:** No se aceptan suposiciones. El agente debe aportar pruebas:
  - Logs de error específicos.
  - Comportamiento observado en el browser/render.
  - Trazas de red o de Firebase.

## 2. Fase de Planificación (No-Code Plan)
- El agente debe elaborar un plan de implementación detallado (`implementation_plan.md`).
- El plan debe incluir:
  - ¿Qué archivos se van a tocar?
  - ¿Por qué esta solución y no otra? (Trade-offs).
  - **Impacto en código existente:** Identificar qué funciones que "ya funcionan" podrían verse afectadas.

## 3. Fase de Aprobación (STOP & WAIT)
- **PROHIBIDO ejecutar cambios en el código sin aprobación explícita del usuario.**
- El agente presentará el plan y esperará a que el usuario diga "procede", "adelante" o "aprobado".
- Esta restricción es especialmente estricta en código que ya está operativo (Producción/Staging).

## 4. Fase de Ejecución y Verificación
- Solo tras la aprobación, se procederá a editar los archivos.
- Cada cambio debe ser verificado inmediatamente en el render/preview para asegurar que no hay efectos secundarios no deseados.

---
*Si un agente empieza a escribir código sin haber presentado un plan basado en evidencias previas, el usuario tiene derecho a revertir los cambios y exigir el cumplimiento de este protocolo.*
