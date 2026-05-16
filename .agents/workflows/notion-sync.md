---
description: Sincroniza roadmap.md con Notion (crear/cerrar tareas de sprint)
---

## 📋 Requisitos

- `NOTION_API_KEY` en `.env`
- `config/notion_config.yaml` configurado

## 🚀 Comandos

### Ver estado actual
```bash
python scripts/notion_sync.py status
```

### Sincronizar sprint específico

Al **empezar** un sprint (tareas pendientes):
```bash
python scripts/notion_sync.py open --sprint 9
```

Al **finalizar** un sprint (tareas completadas):
```bash
python scripts/notion_sync.py close --sprint 8
```

### Sincronización masiva
Ideal para primera configuración o re-sincronizar historial completo:
```bash
python scripts/notion_sync.py sync-all
```

### Mover tareas entre proyectos
Útil para corregir asignaciones erróneas:
```bash
python scripts/notion_sync.py move-tasks --from-id OLD_ID --to-id NEW_ID
```

## 📅 Lógica de Fechas

- Cada tarea recibe un **Vencimiento** calculado como el **domingo** de la semana del sprint.
- Basado en `sprint.current_sprint` del YAML: Sprint N+1 vence en +7 días desde hoy.

## ⚙️ Configuración

Ver `config/notion_config.yaml` para:
- IDs de bases de datos Notion
- Proyecto activo por defecto (`selected_project`)
- Sprint actual (`sprint.current_sprint`)

## 🔗 Integración con /feature-complete

Al finalizar un merge, el workflow `/feature-complete` pregunta:
> "¿Sincronizar sprint con Notion?"

Si aceptas, ejecuta automáticamente `/notion-sync close --sprint N`.

## 📖 Decisiones de Arquitectura

- **ADR-0002:** Solo dos proyectos en Notion (KanAIrOS → Agencia IA).
- Áreas internas (SEO Factory, Prompt Lab) se manejan con tags.
- Clientes se manejan con selectores en Notion.

## 🛠️ Servicios Utilizados

- **Notion API directa:** Para crear/actualizar páginas.
- **Config YAML:** Para gestión de IDs sin tocar código.
