# 📋 Definition of Done - Feature Branch Checklist

## ✅ Antes de Merge a `main`

### 1. Código
- [ ] **Tests pasan:** `pytest tests/ -v` (o equivalente)
- [ ] **Syntax OK:** `python3 -m py_compile <archivos_modificados>`
- [ ] **Sin TODOs obsoletos:** Revisar comentarios `# TODO` - eliminar o mover a ROADMAP
- [ ] **Sin archivos duplicados:** Verificar que no hay código repetido

### 2. Documentación

#### 2.1 ROADMAP.md
- [ ] **Items completados marcados:** ¿Esta rama cierra alguna tarea? → `[x]`
- [ ] **Nuevas ideas al Backlog:** ¿Surgió algo que no entra ahora? → Añadir con etiqueta `P2` o `Futuro`
- [ ] **Fecha actualizada:** Modificar `*Última actualización:*`

#### 2.2 Decisiones Técnicas
- [ ] **ADRs creados:** Si hay decisiones arquitectónicas importantes → `docs/decisions/ADR-XXXX-title.md`
- [ ] **Archivos de diseño actualizados:** Si cambió arquitectura → Actualizar `docs/arquitectura_kanairos_seo.md`

#### 2.3 Infraestructura
- [ ] **Cambios de infra documentados:** Si se tocó deploy/Coolify/SSH → Actualizar `.agent/context/infrastructure.md`
- [ ] **Nuevos servicios/URLs:** → Actualizar `.agent/context/services.md`

#### 2.4 Workflows
- [ ] **Cambios en n8n documentados:** → Actualizar `docs/workflows/<workflow>.md` o crear si no existe
- [ ] **Exportar JSON actualizado:** Si modificaste workflow → Re-exportar a `workflows/seo-writer/<name>.json`

### 3. Estructura del Proyecto

- [ ] **Archivos en ubicación correcta:** Verificar según `docs/PROJECT_STRUCTURE.md`
  - Servicios backend → `services/{nombre}/`
  - Agentes reutilizables → `agents/{nombre}/`
  - Workflows n8n → `workflows/n8n/{categoría}/`
  - Scripts → `scripts/` o `infra/{tipo}/scripts/`
  - Docs → `docs/{categoría}/`
- [ ] **Sin archivos en ubicaciones legacy:** (ej: templates/ en raíz, api/ en raíz)
- [ ] **Separación correcta:** Global vs específico de proyecto

### 4. Limpieza de Docs

- [ ] **Docs obsoletos eliminados:** ¿Hay archivos que ya no aplican?
- [ ] **Docs fusionados:** ¿Varios docs pequeños pueden ser uno?
- [ ] **Links rotos verificados:** Si moviste archivos, actualizar referencias

### 4. Git & Deploy

- [ ] **Commits descriptivos:** `feat:`, `fix:`, `docs:`, etc.
- [ ] **No trabajaste en `main`:** La rama es `feat/` o `fix/`
- [ ] **Branch pusheado:** `git push -u origin <branch>`

---

## 🔍 Post-Merge Verification

Después de merge a `main`:

- [ ] **Coolify deploy OK:** Verificar en https://coolify.romensuarez.com
- [ ] **Health check:** `curl https://api.romensuarez.com/health`
- [ ] **Sentry sin errores nuevos:** Revisar https://sentry.io
- [ ] **Branch eliminada:** `git branch -d <branch>` + `git push origin --delete <branch>`

---

## 📚 Quick Links

| Documento | Cuándo Actualizar |
|-----------|-------------------|
| `ROADMAP.md` | **Siempre** (marcar completados + añadir backlog) |
| `docs/decisions/` | Decisiones técnicas importantes |
| `.agent/context/infrastructure.md` | Cambios de infra/credenciales |
| `.agent/context/services.md` | Nuevos servicios/APIs/tokens |
| `docs/workflows/` | Cambios en workflows n8n |
| `INFRAESTRUCTURA_Y_REGLAS.md` | Nuevas reglas de oro |

---

*Este checklist es OBLIGATORIO. Un agente no puede cerrar una rama sin completarlo.*
