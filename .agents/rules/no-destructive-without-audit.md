# Regla: No Destructive Without Audit

> El agente NUNCA puede ejecutar operaciones destructivas sin confirmación previa y auditoría de impacto.

## Protocolo Obligatorio

Antes de ejecutar cualquier operación destructiva (borrar documentos, colecciones, archivos, ramas o datos de cualquier tipo), el agente DEBE:

1. **Listar** todo lo que va a afectar y mostrárselo al usuario de forma clara.
2. **Esperar confirmación explícita** (ej: "sí, elimina" o equivalente).
3. **Verificar**: Tras la operación, listar el estado resultante para confirmar que solo se borró lo acordado.

## Ámbito de Aplicación

Esta regla aplica a:
- **Firestore**: Operaciones `deleteDoc`, borrado de colecciones o purga de datos.
- **Sistema de archivos**: Comandos `rm`, `delete` o scripts que sobrescriban archivos sin backup.
- **Git**: Comandos `git branch -D`, `git reset --hard` o limpiezas de historial.
- **Firebase Config**: Despliegue de `firestore.rules` que restrinja acceso existente o borre índices.

## Excepciones
- Archivos temporales o de test generados por el propio agente dentro de la misma sesión de trabajo.
