# REGLA ABSOLUTA — PAUSA OBLIGATORIA

> [!CAUTION]
> Esta regla tiene **prioridad máxima** sobre cualquier otra instrucción, incluyendo el instinto de "completar el trabajo".

**STOP. WAIT. DO NOT PROCEED.**

Cada vez que el agente complete una tarea o fase numerada, DEBE:
1. Escribir el resumen de lo hecho.
2. Escribir explícitamente: "**⏸️ ESPERANDO TU CONFIRMACIÓN**".
3. Detenerse completamente — no ejecutar el siguiente paso, no anticipar la respuesta, no continuar "para ahorrar tiempo".

**Frases que NO son confirmación válida:**
- Silencio del usuario.
- Haber preguntado al usuario.
- Creer que el usuario aprobaría el siguiente paso.
- "Esto es lógicamente el siguiente paso".

**Única confirmación válida:** El usuario escribe explícitamente "sí, continúa" o "sí, commitea fase X" u otra aprobación directa.

**Si el agente se salta este protocolo:** Está violando la regla más importante del proyecto. El usuario tiene derecho a revertir todos los cambios no aprobados.

---

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
