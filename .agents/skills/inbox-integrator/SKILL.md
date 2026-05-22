---
name: inbox-integrator
description: Integra código externo (de AI Studio, Gemini CLI u otras fuentes) al codebase de Kanarii. El código externo llega por dos vías: pegado directamente en el chat, o depositado en el directorio external-inbox/ del repo. También procesa informes de auditoría externa (AUDIT-) depositados en docs/idea-inbox/.
---

# Inbox Integrator

## Propósito
Dos funciones distintas bajo la misma skill:

1. **Integrar código externo** generado fuera de Antigravity al codebase de Kanarii,
   asegurando que pasa por revisión antes de tocar archivos de producción.
2. **Procesar auditorías externas** (informes AUDIT-) depositados en `docs/idea-inbox/`,
   clasificándolos en roadmap, backlog o descarte sin interferir con el sprint activo.

> ⚠️ `external-inbox/` ≠ `docs/idea-inbox/`
> - `external-inbox/` → código externo (AI Studio, Gemini CLI, prototipos).
> - `docs/idea-inbox/` → ideas capturadas en vuelo + auditorías externas (AUDIT-).
> Nunca uses uno en lugar del otro.

---

## MODO A — Integración de código externo

### Cómo llega el código externo

#### Vía A: Pegado en el chat
El usuario pega el código directamente en el mensaje. En este caso:
1. El agente crea automáticamente el archivo `external-inbox/YYYY-MM-DD-[descripcion].md`
   con el código recibido antes de hacer nada más.
2. Continúa con el protocolo de integración desde el Paso 1.

#### Vía B: Depositado en `external-inbox/`
El usuario deposita el archivo en `external-inbox/` antes de iniciar la sesión.
Manifiesto requerido: completar `external-inbox/TEMPLATE.manifest.md`.
Si no existe manifiesto rellenado, pedirle al usuario que lo complete antes de continuar.

### Protocolo de integración de código

#### Paso 1: Leer y mapear
- Leer el código de entrada (del chat o del archivo en `external-inbox/`).
- Identificar: ¿qué hace? ¿qué archivos del codebase actual toca o solapa?

#### Paso 2: Auditoría previa
- ¿Rompe algún patrón arquitectónico existente (`implementar-feature-dry`)?
- ¿Duplica lógica que ya existe en el codebase?
- ¿Los nombres siguen `.agents/rules/naming-convention.md`?

#### Paso 3: Plan de integración
- Lista explícita de archivos a crear o modificar (máx. 10 líneas).
- Si afecta a más de 3 archivos → activar `doe-framework` antes de continuar.

#### Paso 4: Integración controlada
- Ejecutar un archivo a la vez.
- Tras cada archivo: verificar que el build no se rompe.

#### Paso 5: Cierre
- Si vino por Vía B: mover el archivo a `external-inbox/_done/` tras integrar.
- Commit atómico con mensaje estándar.

---

## MODO B — Procesamiento de auditorías externas (AUDIT-)

> Se activa cuando `docs/idea-inbox/` contiene entradas con prefijo `AUDIT-`.
> Normalmente se ejecuta durante `/sprint-planning` (paso 3, lunes).

### ¿Qué es una auditoría externa?

Un informe técnico con hallazgos, riesgos y recomendaciones generado por un agente externo
(QwenCoder, Gemini, revisión de PR, Perplexity). Puede llegar como:
- Texto pegado en el chat durante o fuera de sesión.
- Archivo depositado en `docs/idea-inbox/` directamente.

Una auditoría **nunca entra directamente al sprint activo**. Siempre pasa por este procesamiento.

### Formato de entrada esperado

Cada hallazgo en el inbox tiene esta estructura:

```markdown
## AUDIT-NN — [Título del hallazgo]
- **Idea:** [Acción concreta en una línea]
- **Impacto estimado:** Poco / Mucho
- **Contexto:** [Fuente + verificación propia si existe]
- **Skill sugerida:** [skill de .agents/skills/]
- **Archivos afectados:** [lista, máx. 5]
- **Capturado:** YYYY-MM-DD HH:MM
```

Si el informe llega en formato libre (sin estructura AUDIT-), el agente debe **reformatearlo**
antes de procesarlo, extrayendo hallazgos individuales y asignando `AUDIT-NN` secuencial.

### Protocolo de procesamiento

#### Paso 1: Inventariar
Leer todos los `AUDIT-NN` del inbox. Listarlos con título e impacto estimado.
Presentar al usuario el inventario antes de continuar.

#### Paso 2: Verificar contra el codebase
Para cada hallazgo **antes de clasificarlo**:
- ¿El hallazgo ya está en `roadmap.md`? → marcar como `duplicado` (no añadir).
- ¿El hallazgo es un falso positivo verificado en código? → marcar como `descartar` + razón.
- ¿El hallazgo es nuevo y válido? → continuar a clasificación.

#### Paso 3: Clasificar por destino

| Impacto + tipo | Destino en roadmap | Sección |
|---|---|---|
| Seguridad crítica (datos, auth, reglas) | `[CRÍTICO]` | 🚨 Seguridad y confianza |
| Arquitectura / flujos bloqueantes | `[ALTO]` | Sección temática correspondiente |
| Calidad, DRY, mantenibilidad | `[MEDIO]` | 🧹 Calidad interna y DRY |
| Documentación, limpieza, scripts | `[BAJO]` | Final de sección o backlog |
| No urgente, largo plazo | `[POST-MVP]` | 🗄️ Backlog post-MVP |

#### Paso 4: Proponer cambios en roadmap
Generar la lista de líneas a añadir/modificar en `roadmap.md`.
**Mostrar la propuesta al usuario y esperar confirmación antes de escribir.**

Formato de línea para roadmap:
```markdown
- [ ] [CRÍTICO] [AUDIT] Título del hallazgo. Skill: `nombre-skill`. Archivos: `archivo.ts`.
```
El tag `[AUDIT]` identifica el origen para trazabilidad futura.

#### Paso 5: Escribir en roadmap y limpiar inbox
Tras confirmación:
1. Añadir las líneas aprobadas en `roadmap.md` en la sección correcta.
2. Marcar los `AUDIT-NN` procesados en el inbox con `✅ procesado → [destino]`.
3. **No borrar** el inbox — se archiva al final del sprint planning completo.

### Skills que se activan por tipo de hallazgo

| Tipo de hallazgo | Skill para ejecutar |
|---|---|
| Reglas Firestore | `firebase-security-rules-auditor` |
| Arquitectura / refactor | `structure-guardian` → luego `implementar-feature-dry` |
| Decisión de diseño con trade-offs | `adr-decision-recorder` |
| Documentación desactualizada | `doc-maintainer` |
| Scripts o automatización | `doe-framework` |

---

## Triggers de activación

**Modo A (código externo):**
- "Tengo código en external-inbox/"
- "Acabo de pegar lo de AI Studio"
- "Trae este código al proyecto"

**Modo B (auditoría):**
- "Hay entradas AUDIT- en el inbox"
- "Acabo de recibir una auditoría de [agente externo]"
- "Procesa los hallazgos de QwenCoder / Gemini / Perplexity"
- Durante `/sprint-planning` paso 3 si hay archivos `AUDIT-` en idea-inbox/
