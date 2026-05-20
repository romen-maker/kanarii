# Animaciones Educativas y Onboarding Visual
Este documento especifica las animaciones interactivas que deben desarrollarse para reducir la curva de aprendizaje de los conceptos de Sociocracia 3.0 y los flujos únicos de Kanarii. No son decorativas: son pedagógicas.
## Principio de diseño
Cada animación enseña exactamente un concepto que rompe la expectativa del usuario nuevo. Tonos cálidos, maderas, colores tierra. Acentos: verde esmeralda (éxito/consentimiento), ámbar (preocupación), rojo suave (objeción). Stack: React + Tailwind CSS + Framer Motion.
---
## Prioridad 1 — Conceptos que rompen expectativas (usuarios sin contexto S3)
### A1 · `GovernanceFlowAnimation` ✦ ESPECIFICADO
- **Pantalla**: `PropuestasView.tsx`
- **Concepto**: El consentimiento no es votación. Las objeciones son regalos.
- **Flujo en 4 pasos**:
  1. **Tensión y Propuesta** (Borrador → Abierta): Un avatar tiene una idea (bombilla). Crea un documento y lo lanza al centro de un círculo de avatares.
  2. **Dudas y Preocupaciones** (no bloquean): Avatares leen. Uno levanta duda ❓ (azul), otro levanta preocupación ⚠️ (ámbar). La propuesta sigue avanzando.
  3. **La Objeción** (En Objeciones → Integrando): Un avatar levanta ⛔ rojo. El flujo se detiene. El autor y el objetor se juntan. El documento pasa de V1 → V2 y vuelve al centro.
  4. **Consentimiento Alcanzado** (Acordada 🎉): El deadline llega, todos tienen ✅ o ⚠️, ningún ⛔. La tarjeta celebra con animación cálida.
- **UX**: Stepper interactivo con botón "Siguiente" y botón "Reiniciar animación". El flujo es circular y asíncrono.
- **Textos exactos**: Ver prompt original en historial de conversación con Perplexity (20 May 2026).
- **Estado**: Prompt entregado a AI Studio. Pendiente de integración como componente React.
### A2 · `WhatIsCruceAnimation`
- **Pantalla**: `CruceView.tsx`
- **Concepto**: El Cruce como mercado de intercambio no monetario (tiempo, especie, habilidades). No es un marketplace convencional.
- **Animación sugerida**: Dos avatares con "necesidad" y "oferta" complementarias que se conectan. El símbolo monetario (€) se transforma en un reloj de tiempo. Aparece la frase: *"Aquí el valor lo decide la comunidad, no el mercado."*
- **Estado**: Especificado. Pendiente de diseño y desarrollo.
### A3 · `FichaRolesAnimation`
- **Pantalla**: `FichaView.tsx`
- **Concepto**: La ficha no es un currículum. Es un pasaporte comunitario que muestra quién eres, no qué has logrado.
- **Animación sugerida**: Un documento estilo CV clásico (títulos, empresa, años) que se "disuelve" y se reconstruye como una ficha Kanarii (valores, habilidades, necesidades, ofrendas). Transición fluida.
- **Estado**: Especificado. Pendiente de diseño y desarrollo.
---
## Prioridad 2 — Momentos de primera acción (contextual, aparece la primera vez)
### A4 · `FirstProposalCoach`
- **Pantalla**: `CreateProposalWizard.tsx`, Paso 1
- **Concepto**: Una Tensión es la brecha entre lo que es y lo que podría ser.
- **UX**: Tooltip animado que aparece solo en la primera visita del usuario al wizard. Desaparece tras leer o hacer clic. No vuelve a aparecer (registrar en perfil de usuario: `hasSeenProposalCoach: true`).
- **Texto sugerido**: *"Una tensión no es un problema. Es la distancia entre cómo están las cosas ahora y cómo podrían estar. Eso es suficiente para proponer."*
- **Estado**: Especificado. Requiere campo `hasSeenProposalCoach` en Firestore (`/users/{uid}`).
### A5 · `ContraofertaExplainer`
- **Pantalla**: `ContraofertaModal.tsx`
- **Concepto**: Diferencia entre Contraoferta (mejora colaborativa, el acuerdo sigue) y Objeción (bloqueo con propósito, el proceso se detiene).
- **UX**: Dos caminos animados. Uno verde que se bifurca (contraoferta) y uno rojo que se detiene (objeción). Breve, inline, no modal.
- **Estado**: Especificado. Pendiente de diseño.
### A6 · `TareaAutoseleccionAnimation`
- **Pantalla**: `TareasPanel.tsx`
- **Concepto**: Las tareas no se asignan desde arriba. Se autoseleccionan por consentimiento.
- **Animación sugerida**: Un avatar "lanza" una tarea al centro. Varios avatares la leen. Uno levanta la mano voluntariamente. Ningún avatar "señala" a otro.
- **Estado**: Especificado. Pendiente de diseño.
---
## Prioridad 3 — Welcome.tsx rediseño (landing interna enriquecida)
### A7 · `WelcomeHeroSections`
- **Pantalla**: `Welcome.tsx`
- **Concepto**: La página de inicio post-login debe comportarse como un dashboard vivo que recontextualiza al usuario en cada visita.
- **Estructura de 5 secciones**:
  1. **Hero personalizado**: Saludo con nombre + estado real de la comunidad en tiempo real ("Tu comunidad tiene 2 propuestas esperando tu voz 🌱").
  2. **Acciones rápidas** con micro-animaciones: Nueva Propuesta / Ver Actas / Ir al Cruce.
  3. **Feed de actividad reciente** (estilo Linear): últimos eventos, propuestas, acuerdos.
  4. **Widget de salud comunitaria** (animado): propuestas activas / tareas abiertas / próximo evento.
  5. **Aprende S3** (mini-cards que abren animaciones A1–A3): *"¿Cómo tomamos decisiones aquí?"* / *"¿Qué es el Cruce?"* / *"¿Qué es una Ficha?"*
- **Referencia de industria**: Notion (dashboard de workspace), Linear (feed de actividad), Loom (onboarding contextual en home).
- **Advertencia de rango**: El bloque "Aprende S3" debe titularse *"Explora cómo funciona Kanarii"*, nunca *"Tutorial"* o *"Básico"*, para no crear jerarquía entre quienes ya saben y quienes aprenden.
- **Estado**: Especificado. Pendiente de diseño y desarrollo. Alta prioridad de impacto.
### A8 · `ComunidadesCirculosAnimation`
- **Pantalla**: `ComunidadesView.tsx`
- **Concepto**: Una comunidad S3 no es una pirámide. Es círculos anidados con autoridad distribuida.
- **Animación sugerida**: Una estructura de organigrama clásica (cajas con jerarquía vertical) que se deconstruye y se reorganiza como círculos concéntricos interconectados, cada uno con su propio color y nombre.
- **Estado**: Especificado. Pendiente de diseño.
---
## Notas de implementación transversal
- **Trigger de primera visita**: Usar campo booleano en `/users/{uid}` para cada animación que solo debe mostrarse una vez (e.g., `hasSeenGovernanceAnimation`, `hasSeenProposalCoach`).
- **Respeto a `prefers-reduced-motion`**: Todas las animaciones deben degradar elegantemente a versiones estáticas cuando el sistema operativo del usuario tenga reducción de movimiento activada.
- **Componentes independientes**: Cada animación es un componente React autocontenido, importable desde cualquier página. No deben acoplar lógica de negocio.
- **Accesibilidad**: Todas las animaciones deben poder pausarse y reiniciarse. Textos de apoyo visibles sin necesidad de que la animación haya corrido.
---
*Especificado: 20 May 2026 — Fuente: análisis sistemático del código + estándares de industria (Notion, Linear, Loom)*
