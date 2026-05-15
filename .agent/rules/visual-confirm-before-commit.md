---
trigger: always_on
---

# Confirmación Visual Obligatoria Antes de Commit

> Ningún cambio que afecte la UI se commitea sin que el usuario haya visto el resultado visual en el preview/render.

## Reglas

1.  **Pausa Obligatoria**: Antes de ejecutar cualquier `git commit` que incluya cambios en archivos del directorio `src/`, el agente debe pausar y mostrar un resumen de los archivos modificados.
2.  **Verificación Visual**: El agente debe pedir confirmación explícita con el siguiente mensaje:
    > "He realizado los cambios indicados. ¿Los has revisado visualmente en el preview? Confirma con 'sí, commitea' para proceder."
3.  **Bloqueo de Commit**: Solo se puede proceder al commit tras recibir una confirmación afirmativa del usuario.
4.  **Cambios sin Impacto Visual**: Si los cambios son exclusivamente en directorios de configuración o documentación (`.agent/`, `docs/`, `scripts/`, etc.), la confirmación puede ser simplificada pero **nunca eliminada**.

## Ejemplos

### ✅ Correcto
- El agente modifica un componente React en `src/components/`.
- Muestra el diff de los cambios realizados.
- Indica que los cambios están listos para ser revisados especificando qué debe hacer para revisarlos.
- Espera a que el usuario confirme visualmente.
- Ejecuta el commit tras la aprobación.

### ❌ Incorrecto
- El agente modifica un archivo en `src/` y ejecuta el commit en el mismo turno o sin pedir la confirmación visual específica.

## Relación con otros flujos
Esta regla complementa a `strict-workflow` y se aplica específicamente al momento del commit, asegurando que la calidad visual sea validada por el humano antes de persistir los cambios en el historial.

---

*Última actualización: 15 May 2026*