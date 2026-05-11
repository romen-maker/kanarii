---
description: Review current sprint and redirect to focus
---

# Workflow: /roadmap - Check Sprint Status

**Ejecutar cuando:** Usuario quiere ver estado del proyecto

## Acciones

1. **Leer roadmap.md completo**

2. **Identificar:**
   - Sprint actual (buscar "🔄 Sprint X" o "Fase Actual")
   - Tareas completadas (con ✅ o [x])
   - Tareas pendientes (con ⬜ o [ ])
   - Próxima tarea prioritaria

3. **Calcular progreso:**
   ```
   Completadas / Total de tareas del sprint
   ```

4. **Mostrar resumen:**
   ```
   📊 Sprint X: [Nombre]
   
   ✅ Completado: [X/Y tareas]
   
   Tareas finalizadas:
   - [Lista de tareas con ✅]
   
   Próxima prioridad: [Primera tarea sin ✅]
   
   ¿Continuamos con [próxima prioridad]?
   ```

5. **Si usuario pregunta por tarea específica:**
   - Buscar en roadmap
   - Indicar en qué sprint está
   - Decir si es MVP o backlog

## Ejemplo de Uso

```
User: /roadmap

Agent:
📊 Sprint 2: Content Generator

✅ Completado: 11/15 tareas

Tareas finalizadas:
- Crear ContentGenerator agent
- Implementar brief generation
- Implementar outline generation
- Integración con LLM Router
- FastAPI endpoint /seo/generate-article

Próxima prioridad: Arreglar workflow n8n (Dispatcher/Receiver comunicación)

¿Continuamos con el workflow n8n?
```

## Variaciones

### Ver Backlog
```
User: ¿Qué hay en el backlog?

Agent: (leer sección "Ideas Backlog" en roadmap.md)
```

### Ver Sprint Específico
```
User: ¿Qué había en Sprint 1?

Agent: (buscar "Sprint 1" en roadmap.md y resumir)
```

## Archivos a Leer

- `docs/roadmap.md` (completo)
