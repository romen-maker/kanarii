# Guía de Contribución 🌿

¡Hola! Qué alegría que quieras colaborar con Kanarii. Este es un proyecto de código abierto nacido para facilitar la vida en comunidades intencionales mediante la inteligencia colectiva y la gobernanza horizontal.

Al ser un proyecto comunitario, cuidamos mucho no solo el código, sino la forma en la que colaboramos.

---

## 🧭 Nuestra Filosofía en 3 Líneas

1. **Software Libre**: Usamos AGPL-3.0 para asegurar que las mejoras de Kanarii siempre pertenezcan al procomún.
2. **Horizontalidad**: No buscamos jerarquías; nos organizamos por roles, tareas y consentimiento.
3. **Cuidado**: Priorizamos la claridad y la sostenibilidad del código para que sea fácil de mantener por cualquiera.

---

## 🛠️ Configuración Local

Para empezar a desarrollar, sigue los pasos de instalación que encontrarás en el [README.md](./README.md). Asegúrate de tener tu entorno de Firebase listo para pruebas.

---

## 🌿 Flujo de Trabajo (Git Workflow)

Para mantener el repositorio ordenado, seguimos estas convenciones:

### 1. Ramas (Branches)
Nunca trabajes directamente sobre `main`. Crea una rama descriptiva usando estos prefijos:
- `feature/nombre-de-la-mejora` (Nuevas funcionalidades)
- `fix/nombre-del-error` (Corrección de bugs)
- `docs/tema-de-documentacion` (Cambios en archivos MD o comentarios)
- `chore/tarea-mantenimiento` (Actualización de dependencias, config, etc.)

### 2. Mensajes de Commit
Usamos **Conventional Commits** para que el historial sea automático y legible:
- `feat: ...` para nuevas funcionalidades.
- `fix: ...` para corrección de errores.
- `docs: ...` para cambios en documentación.
- `refactor: ...` para cambios de código que ni fijan un bug ni añaden una feature.

*Ejemplo: `feat: añadir selector de comunidad en el sidebar`*

### 3. Pull Requests (PR)
1. Sube tu rama a GitHub.
2. Abre una Pull Request hacia `main`.
3. Describe brevemente **qué** has hecho y **por qué**.
4. Una vez revisada y aprobada (por consentimiento), se fusionará al código base.

---

## 🤖 Desarrollo Aumentado por IA

En Kanarii no solo colaboramos humanos. Usamos agentes de IA para acelerar el desarrollo y mantener la calidad.

1. **La Carpeta `.agent/`**: Si usas un asistente (Gemini, Cursor, Copilot), pídele que lea el contenido de `.agent/`. Ahí residen nuestras reglas de arquitectura, estilo y nomenclatura.
2. **Revisión Visual Sagrada**: Antes de realizar cualquier commit que afecte a la interfaz de usuario (archivos en `src/`), **DEBES** verificar los cambios visualmente en tu entorno local (`npm run dev`). No aceptamos contribuciones que no hayan sido validadas en el navegador.
3. **Mantenimiento de Reglas**: Si descubres que las instrucciones para la IA en `.agent/` fallan o son contradictorias, edítalas y envía una mejora. ¡La IA también necesita aprender de nosotros!

---

## 🗣️ Comunicación y Propuestas

Si tienes una idea o has encontrado un error:
- **Abre un Issue**: Es la mejor forma de debatir una propuesta antes de escribir código.
- **Tono**: Hablamos de forma clara, constructiva y cercana. Evitamos el lenguaje corporativo frío; estamos entre vecinos y vecinas de código.

---

¡Gracias por ayudar a que Kanarii crezca! 🚀
