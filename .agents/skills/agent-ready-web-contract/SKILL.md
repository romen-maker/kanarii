---
name: agent-ready-web-contract
description: Guía de diseño y estándares de desarrollo para crear interfaces de usuario en Kanarii que sean semánticamente claras, predecibles y fáciles de operar por agentes de IA.
---

# Contrato de Interfaz para Agentes (Agent-Ready Web Contract)

Esta habilidad define las directrices que los desarrolladores y agentes deben seguir al diseñar, modificar o auditar componentes React en Kanarii. El objetivo es estructurar las vistas para que un agente autónomo pueda interactuar con ellas sin ambigüedad y de forma 100% predecible.

## Principios del Contrato de Interfaz

Un componente React es "Agent-Ready" si cumple con tres pilares fundamentales:
1. **Identificabilidad determinista**: Las herramientas de búsqueda del agente (selectores CSS, XPath, árbol de accesibilidad) pueden localizar el elemento sin importar su estilo visual.
2. **Acciones explícitas y predecibles**: Cada botón, formulario o enlace tiene una función y estado claros.
3. **Contrato de estado**: La interacción (ej: enviar un formulario) tiene un resultado predecible y observable inmediatamente en el DOM.

---

## 1. Atributos data-* e Identificabilidad

Para evitar que los agentes se rompan debido a cambios cosméticos en las clases de CSS o variaciones en los textos (especialmente bajo traducciones dinámicas), **DEBES** incluir atributos de datos específicos en los elementos interactivos clave.

- **`data-testid`**: Identificador único de pruebas y automatización.
  - *Sintaxis*: `[nombre-componente]__[accion-o-elemento]` (ej: `propuesta-card__boton-votar`).
- **`data-action`**: Define el propósito exacto de un botón o elemento interactivo.
  - *Sintaxis*: `crear-comunidad`, `votar-propuesta`, `completar-onboarding`.
- **`data-state`**: Refleja el estado interno de un componente en el DOM (ej: `idle`, `loading`, `success`, `error`).

```tsx
// ✅ CORRECTO: Fácil de identificar y testear por un agente
<button 
  data-testid="onboarding-flow__submit-btn"
  data-action="submit-member-onboarding"
  data-state={isLoading ? 'loading' : 'idle'}
  className="btn btn-primary px-4 py-2 hover:bg-blue-600" // Las clases pueden cambiar
>
  {isLoading ? 'Registrando...' : 'Confirmar Membresía'}
</button>

// ❌ INCORRECTO: Obliga al agente a buscar por el texto dinámico o por selectores CSS frágiles
<button className="btn btn-primary px-4 py-2 hover:bg-blue-600">
  Confirmar Membresía
</button>
```

---

## 2. Semántica HTML y ARIA (Árbol de Accesibilidad)

El árbol de accesibilidad (`a11y tree`) es la primera fuente de información del agente (ver regla [snapshot-over-screenshot](../../rules/snapshot-over-screenshot.md)). Una UI accesible para humanos con lectores de pantalla es, por defecto, una UI óptima para un agente IA.

- **Usa etiquetas semánticas**:
  - `<button>` para acciones de cambio de estado.
  - `<a>` para navegación pura (con `href` real).
  - `<nav>`, `<main>`, `<header>`, `<footer>`, `<aside>` para delimitar secciones principales de la página.
- **Roles y Estados ARIA**:
  - `aria-label` para botones que solo contienen iconos (ej: un botón para cerrar con una "X").
  - `aria-expanded` para componentes colapsables (menús, paneles).
  - `aria-live="polite"` o `aria-live="assertive"` en zonas de notificaciones dinámicas o alertas para que el agente reciba el evento en su instantánea de texto.

---

## 3. Contrato por Acción

Cada flujo crítico debe respetar un contrato de tres fases visibles en el árbol DOM:

1. **Estado Inicial**: El componente muestra claramente su disponibilidad (ej: `data-state="idle"`).
2. **Acción**: El agente ejecuta la interacción (ej: clic). El componente entra inmediatamente en estado transicional (ej: `data-state="loading"`, botón deshabilitado `disabled`).
3. **Estado Final**: Se muestra de forma explícita el resultado mediante texto semántico en pantalla (ej: un encabezado de éxito) o un cambio observable del DOM.

---

## 4. Contextos Críticos de Kanarii (Quick Wins)

Al diseñar o refactorizar vistas en Kanarii, aplica estos identificadores de inmediato:

### A. Vista de Comunidades
- Contenedor de lista: `data-testid="comunidades-grid"`
- Tarjeta de comunidad: `data-testid="comunidad-card"` y `data-entity-id={comunidad.id}`
- Acción para unirse: `data-action="join-community"`

### B. Propuestas y Votaciones
- Sección de votación: `data-testid="propuesta-voto-panel"`
- Botones de voto:
    - Favor: `data-action="vote-approve"`
    - Contra: `data-action="vote-reject"`
    - Abstención: `data-action="vote-abstain"`
- Indicador de quórum: `data-testid="quorum-progress-indicator"`

### C. Onboarding de Miembros
- Cada paso del formulario de onboarding: `data-step="[numero-de-paso]"` (ej: `data-step="1"`)
- Formulario de perfil: `<form data-testid="onboarding-profile-form">`

### D. Gestión de Miembros
- Lista de miembros: `data-testid="miembros-list"`
- Fila del miembro: `data-testid="miembro-row"` y `data-entity-id={miembro.id}`
- Acción cambiar rol: `data-action="change-member-role"`
- Acción expulsar: `data-action="remove-member"`

---

## Relación con otras Directivas del Proyecto

Esta skill se integra con el ecosistema de pruebas y diseño del repositorio:
- Para el desarrollo estético y uso de Tailwind o tokens visuales: [visual-identity](../visual-identity/SKILL.md).
- Para la creación y automatización de pruebas end-to-end con Playwright: [test-e2e-kanarii](../test-e2e-kanarii/SKILL.md).
- Para asegurar que las interfaces sean legibles y respeten la accesibilidad comunitaria general: [accesibilidad-comunitaria](../accesibilidad-comunitaria/SKILL.md).

---

## 5. Preparación para WebMCP (Estándar Emergente)

WebMCP es un estándar en preview (Chrome 146 Canary) que permite a las webs
exponer herramientas estructuradas directamente a agentes in-browser, en vez de
depender de que el agente navegue el DOM.

### API Declarativa (sin JavaScript)
Anota formularios existentes con tres atributos HTML:

```html
<form 
  toolname="submit-propuesta"
  tooldescription="Envía una nueva propuesta a la comunidad activa"
  toolautosubmit="false"
>
```

### API Imperativa (JavaScript)
```js
navigator.modelContext?.registerTool({
  name: 'votar-propuesta',
  description: 'Emite un voto en una propuesta activa',
  inputSchema: {
    type: 'object',
    properties: {
      propuesta_id: { type: 'string' },
      voto: { type: 'string', enum: ['approve', 'reject', 'abstain'] }
    },
    required: ['propuesta_id', 'voto']
  },
  execute: async ({ propuesta_id, voto }) => { /* lógica de voto */ }
});
```

### Cuándo usarlo en Kanarii
- Acciones críticas con esquema conocido: votar, crear comunidad, completar onboarding
- **Hoy**: implementa los `data-*` y ARIA (secciones 1-4 de esta skill) como base
- **Cuando WebMCP llegue a Chrome estable**: migra esas acciones a tools registradas
- Los `data-testid` que defines hoy serán válidos como fallback indefinidamente

> [!NOTE]
> WebMCP requiere Chrome con flag habilitado (no headless por ahora).
> No reemplaza los contratos `data-*` — los complementa cuando el agente
> soporta el estándar.

