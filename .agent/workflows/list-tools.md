---
description: List available tools and how to propose new ones
---

# Workflow: /list-tools

**Ejecutar cuando:** Necesitas saber qué herramientas tiene el proyecto o proponer una nueva

## 📚 Paso 1: Leer Contexto del Stack

Antes de proponer herramientas, lee estos archivos para conocer el stack actual:

### `.agent/context/infrastructure.md`
- Infraestructura desplegada (OCI, Coolify, PostgreSQL, MinIO, etc.)
- Herramientas internas (N8N MCP, Prompt Lab, SEO Generator)
- Integraciones disponibles (Google APIs)
- Reglas de oro (DB, redes Docker, DNS)

### `.agent/context/services.md`
- Servicios externos y APIs (OpenRouter, Sentry, Cloudflare R2)
- Credenciales y configuración
- Variables de entorno requeridas

---

## 🆕 Paso 2: Proponer Nueva Herramienta

Si ninguna herramienta del stack cubre la necesidad:

### A. Leer Política

**Archivo:** `.agent/context/tools-policy.md`

**Aplicar criterios:**
-  **Tier 1 (Preferido):** OSS, self-hosted, licencia permisiva
- **Tier 2 (Aceptable):** SaaS con tier gratuito suficiente
- **Tier 3 (Evitar):** Vendor lock-in, solo premium

### B. Verificar Herramientas Premium del Usuario

**Leer:** `.agent/context/user_premium_tools.md`

Si el usuario ya tiene la herramienta:
- Úsala directamente
- Documenta en `user_premium_tools.md` (si no está)
- Pide credenciales necesarias

### C. Proponer 3 Opciones

```
Para [OBJETIVO], propongo:

**Opción 1: [HERRAMIENTA_OSS]** (Tier 1)
- Licencia: MIT/Apache 2.0
- Self-hosted, control total
- Requiere: [recursos]
- Setup: ~X min

**Opción 2: [SERVICIO_GRATUITO]** (Tier 2)
- Tier gratuito cubre necesidades
- Migración a OSS posible
- Setup: ~Y min

**Opción 3: ¿Tienes [PREMIUM_TOOL]?** (Tier 3)
- Si usuario ya tiene → podemos usar
- Si no → evaluar Opción 1 o 2

¿Cuál prefieres?
```

### D. Si Usuario Aprueba

Ejecutar workflow `/update-tools` para documentar la herramienta.

---

## 📋 Archivos de Referencia

| Archivo | Propósito |
|---------|-----------|
| `.agent/context/infrastructure.md` | Infraestructura + herramientas internas |
| `.agent/context/services.md` | APIs y servicios externos |
| `.agent/context/tools-policy.md` | Política para nuevas herramientas |
| `.agent/context/user_premium_tools.md` | Tools premium del usuario |

---

## ✅ Checklist

- [ ] Leíste `infrastructure.md` y `services.md`
- [ ] Verificaste que ninguna herramienta del stack cubre la necesidad
- [ ] Si propones nueva: aplicaste `.agent/context/tools-policy.md`
- [ ] Si aprobaron: ejecutas `/update-tools`
