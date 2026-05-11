# Kanarii Agent Onboarding 🌴

¡Bienvenido al desarrollo de **Kanarii**! Esta es una aplicación móvil/web centrada en el Diseño Humano y la Astrología, actuando como el cliente principal del ecosistema Agencia_IA.

## 📁 Contexto del Proyecto
- **Propósito:** App para gestión de perfiles, análisis de cartas astrales y compatibilidad (Diseño Humano).
- **GitHub:** Repositorio bajo la cuenta `romen-maker`.
- **Identidad Git:** El entorno local está configurado para usar `user.name: romen-maker`. **NO** usar la cuenta principal `romensuarezr` para commits en este directorio.

## 🛠️ Stack Tecnológico
- **Frontend:** Vite + React/Vue/Svelte (TypeScript).
- **Backend/DB:** Firebase (Firestore para perfiles, Auth para usuarios).
- **Estilos:** Vanilla CSS / Tailwind (según configuración de componentes).

## 🧠 Integración con el Cerebro (Backend)
**IMPORTANTE:** No implementes cálculos astrológicos ni de Diseño Humano en el frontend.
- **Servicio:** Human Design API v2.0.
- **Endpoint:** `https://hd-api.romensuarez.com/bodygraph`
- **Autenticación:** Requiere header `X-API-Key`. La clave debe estar en `.env` como `VITE_HD_API_KEY`.
- **Datos:** El API devuelve el objeto `diseño_humano` (con `puertas_activas` para cálculos de conexión) y `carta_astral_completa`.

## 📏 Reglas de Oro (Leer .agent/GEMINI.md)
1. **Protocolo de Seguridad:** OBLIGATORIO seguir el flujo de `.agent/rules/strict-workflow.md` (Analiza -> Prueba -> Planifica -> Aprueba). **NUNCA** toques código que funciona sin un plan aprobado.
2. **MVP First:** No construyas arquitecturas complejas si una solución simple valida la idea.
2. **Tech Scout:** Antes de crear un componente complejo (gráficos, calendarios), usa la skill `tech-scout` para buscar librerías OSS.
3. **What & Why:** Explica siempre qué haces y por qué (trade-offs).

## 🔀 Workflow de Git
1. Trabaja siempre en ramas `feat/` o `fix/`.
2. Sigue el flujo definido en `.agent/workflows/git-branching.md`.
3. Nunca hagas push directo a `main` sin que el usuario lo apruebe.

---
*Este documento es la única fuente de verdad para el comportamiento del agente en este repositorio.*
