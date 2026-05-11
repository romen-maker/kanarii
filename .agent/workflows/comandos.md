---
description: Quick access to inline commands for project tools
---

# Workflow: /comandos

**Ejecutar cuando:** Necesitas ejecutar un comando rápido para accionar una herramienta

## Uso

### Buscar y Ejecutar
```
User: "busca /comando para listar workflows n8n"
User: "/comandos listar workflows"
```

### Añadir Nuevo Comando
```
User: "apunta este /comando para..."
User: "/comandos add"
```

---

## Proceso

El agente determina la acción según el contexto:

### 1. Buscar y Ejecutar (keywords: "busca", "lista", "ejecuta", "cómo")

**Cuando usuario pide:**
- "busca /comando para X"
- "cómo hago X"
- "/comandos [herramienta] [acción]"

**Agente:**
1. Lee `.agent/context/comandos-inline.md`
2. Busca comando relevante
3. **EJECUTA el comando directamente** (con confirmación si destructivo)
4. Muestra resultado

**Ejemplo:**
```
User: "busca /comando para listar workflows n8n"

Agent:
"✅ Ejecutando comando de N8N - Listar Workflows...

📋 Workflows disponibles (19 total):
- KanAIrOS - Dispatcher (activo)
- KanAIrOS - Publisher (activo)
...

Comando usado: `.agent/context/comandos-inline.md` → N8N → Listar Workflows"
```

---

### 2. Añadir Comando (keywords: "apunta", "guarda", "añade", "add")

**Cuando usuario dice:**
- "apunta este /comando"
- "guarda este comando"
- "/comandos add"

**Inputs requeridos:**
- Herramienta: [nombre]
- Acción: [descripción]
- Código: [comando]

**Proceso:**
1. Leer `.agent/context/comandos-inline.md`
2. Determinar sección (crear si no existe)
3. Añadir comando con formato consistente
4. Actualizar fecha
5. Commit

**Ejemplo:**
```
User: "apunta este comando para escribir en Google Sheets"
[paste código]

Agent:
"✅ Comando añadido a `.agent/context/comandos-inline.md`

Sección: Google Sheets
Acción: Escribir Fila
Código documentado.

¿Hago commit?"
```

---

## Validaciones

### Al Ejecutar
- [ ] Comando existe en `comandos-inline.md`
- [ ] Si es destructivo (delete, drop, etc.), pedir confirmación
- [ ] Mostrar output del comando

### Al Añadir
- [ ] Código es copy-paste ready
- [ ] Formato consistente con comandos existentes
- [ ] Sección de herramienta existe o se crea

---

## Archivos

**Read/Write:** `.agent/context/comandos-inline.md`

---

## Keywords para Detección

**Ejecutar:**
- busca, lista, ejecuta, cómo, muestra, dame

**Añadir:**
- apunta, guarda, añade, documenta, add

Si ambiguo → preguntar al usuario qué quiere hacer.
