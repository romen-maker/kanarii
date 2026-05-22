---
name: inbox-integrator
description: Integra código externo (de AI Studio, Gemini CLI u otras fuentes) al codebase de Kanarii. El código externo llega por dos vías: pegado directamente en el chat, o depositado en el directorio external-inbox/ del repo.
---

# Inbox Integrator

## Propósito
Protocolo para integrar código generado fuera de Antigravity al codebase de Kanarii,
asegurando que pasa por revisión antes de tocar archivos de producción.

> ⚠️ `external-inbox/` ≠ `docs/idea-inbox/`
> - `external-inbox/` → código externo (AI Studio, Gemini CLI, prototipos).
> - `docs/idea-inbox/` → ideas capturadas en vuelo durante sesiones (gestionado por `idea-capture` en `caveman.md`).
> Nunca uses uno en lugar del otro.

## Cómo llega el código externo

### Vía A: Pegado en el chat
El usuario pega el código directamente en el mensaje. En este caso:
1. El agente crea automáticamente el archivo `external-inbox/YYYY-MM-DD-[descripcion].md`
   con el código recibido antes de hacer nada más.
2. Continúa con el protocolo de integración desde el Paso 1.

### Vía B: Depositado en `external-inbox/`
El usuario deposita el archivo en `external-inbox/` antes de iniciar la sesión.
Manifiesto requerido: completar `external-inbox/TEMPLATE.manifest.md`.
Si no existe manifiesto rellenado, pedirle al usuario que lo complete antes de continuar.

## Protocolo de integración

### Paso 1: Leer y mapear
- Leer el código de entrada (del chat o del archivo en `external-inbox/`).
- Identificar: ¿qué hace? ¿qué archivos del codebase actual toca o solapa?

### Paso 2: Auditoría previa
- ¿Rompe algún patrón arquitectónico existente (`implementar-feature-dry`)?
- ¿Duplica lógica que ya existe en el codebase?
- ¿Los nombres siguen `.agents/rules/naming-convention.md`?

### Paso 3: Plan de integración
- Lista explícita de archivos a crear o modificar (máx. 10 líneas).
- Si afecta a más de 3 archivos → activar `doe-framework` antes de continuar.

### Paso 4: Integración controlada
- Ejecutar un archivo a la vez.
- Tras cada archivo: verificar que el build no se rompe.

### Paso 5: Cierre
- Si vino por Vía B: mover el archivo a `external-inbox/_done/` tras integrar.
- Commit atómico con mensaje estándar.

## Triggers de activación
- "Tengo código en external-inbox/"
- "Acabo de pegar lo de AI Studio"
- "Trae este código al proyecto"
