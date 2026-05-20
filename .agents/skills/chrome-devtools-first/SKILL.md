---
name: chrome-devtools-first
description: Cubre el uso de Chrome DevTools MCP como herramienta principal de inspección, integrándolo de forma segura con Firebase MCP.
---

# Chrome DevTools First (Inspección y Diagnóstico Web)

Esta habilidad establece a **Chrome DevTools MCP** como el punto de contacto primario para diagnosticar problemas visuales, de red, accesibilidad o interacción dentro de Kanarii, antes de realizar cualquier cambio de código o inferencia a ciegas.

## Instrucciones Operativas

1. **Inspección Previa Obligatoria**:
   - Ante cualquier reporte de error visual, fallo de interacción (un botón que no responde) o comportamiento inesperado en la interfaz, **SIEMPRE** debes interactuar primero con el navegador utilizando las herramientas de Chrome DevTools MCP (`list_pages`, `select_page`, `navigate_page`).
   
2. **Diagnóstico a través de Consola y Red**:
   - Si la aplicación muestra un comportamiento errático, ejecuta `list_console_messages` y `list_network_requests` para identificar peticiones HTTP fallidas o excepciones JS no capturadas.
   - Analiza el flujo de red utilizando `get_network_request` si sospechas que los payloads no coinciden con las especificaciones de datos de Kanarii.

3. **Resolución de Bugs Lógicos en Kanarii**:
   - Si el diagnóstico en consola o red revela fallos específicos en la lógica de negocio del frontend de Kanarii (por ejemplo, discrepancias en el cálculo de quórums, estados de votación incorrectos o fallos en el onboarding de miembros):
     - **DEBES** remitirte inmediatamente a la skill [debug-kanarii](../debug-kanarii/SKILL.md). No intentes improvisar flujos de negocio sin verificar las políticas de depuración específicas del proyecto descritas allí.

## Uso con Firebase MCP

Cuando realices diagnósticos que involucren persistencia de datos o autenticación, recuerda que Kanarii utiliza Firebase en su capa de infraestructura.

- **Auditoría de Operaciones en Caliente**:
   - Antes de modificar reglas de base de datos o estructuras de Firestore inducidas por fallos detectados en el navegador, **DEBES** activar e implementar las guías contenidas en las skills de Firebase:
     - [firebase-basics](../firebase-basics/SKILL.md)
     - [firebase-firestore](../firebase-firestore/SKILL.md)
     - [firebase-auth-basics](../firebase-auth-basics/SKILL.md)
- **Seguridad Operativa y Despliegues**:
   - Está terminantemente prohibido realizar escrituras manuales destructivas o cambios de datos en caliente para solventar un bug temporal sin antes auditar los cambios. Consulta estrictamente las siguientes reglas del proyecto:
     - [no-destructive-without-audit](../../rules/no-destructive-without-audit.md)
     - [deployment-safety](../../rules/deployment-safety.md)

## Qué NO Hacer

- **NO intentes duplicar la lógica de Firebase** (comandos de CLI, inicializaciones de base de datos, o sintaxis de reglas de seguridad) en esta skill. Esas tareas están cubiertas exhaustivamente en sus respectivas habilidades dedicadas. Esta skill actúa únicamente como capa de enlace y diagnóstico visual/red.
