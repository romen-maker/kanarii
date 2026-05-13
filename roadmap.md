# Roadmap Kanarii

Este documento describe las fases de desarrollo de Kanarii, marcando el progreso actual y los siguientes pasos a implementar.

## ✅ Ya hecho
- [x] Autenticación con cuentas de Google.
- [x] Creación y visualización de Fichas Comunitarias.
- [x] Asistente Onboarding estilo chat.
- [x] Generación del Manual Galáctico (IA) dividido por pestañas (Sol, Luna, Ascendente, Diseño Humano).
- [x] Panel de Administración con búsqueda, filtro y gestión de manuales.
- [x] Geocodificación integrada en the onboarding.

## 🏗️ Fase 0 — Refactorización de Arquitectura (Sprints Actuales)
- [ ] **Fase 1: Fundaciones (Completado)**
  - [x] Crear `appService.ts` (Single Source of Truth para Firestore).
  - [x] Implementar Hooks de Entidad: `useProyectos`, `useTareas`, `useActas`.
  - [x] Crear `useEntityActions` (Abstracción de mutaciones con toasts).
  - [x] Establecer reglas persistentes (`dry-architecture.md`, `react-page-boundaries.md`).
- [ ] **Fase 2: Migración de Vistas (Foco Actual)**
  - [ ] Refactorizar `ProyectosView.tsx` (Migración a `useProyectos` y `useEntityActions`).
  - [ ] Refactorizar `TareasPanel.tsx` y `ActasPanel.tsx` (Eliminar bypass de `appService`).
  - [ ] Limpiar `CruceView.tsx` y `AdminPanel.tsx` (Eliminar imports directos de Firestore).
  - [ ] Reemplazar `alert()` nativos por `useToast`.
  - [x] Extraer modales inline a componentes independientes. (`CreateActaModal`, `CreateProjectModal`)
- [ ] Aplicar EntityCard en todas las listas (Proyectos, Tareas, Actas).
- [ ] Refactorizar `AuthContext.tsx` (Eliminar Firestore, usar `appService`).

## 🔴 Fase 1 — App operativa mínima (Prioridad Actual)
- [ ] **1.1 Gestión de tareas comunitarias**
  - [x] **CRUD Tareas**: Crear, editar, borrar y cambiar estados (Pendiente/Proceso/Hecho).
  - [x] **Vínculo Proyectos**: Asociación de tareas a proyectos con cálculo de progreso automático.
  - [x] **Feedback UI**: Sistema de Toasts para todas las acciones de tareas.
  - [ ] **Admin Dashboard**: Vista global para administradores con filtros por miembro y estado.
- [ ] **1.2 Actas de reuniones**
  - [x] **Estructura Base**: Modelado de actas (título, fecha, facilitador, participantes).
  - [x] **Generación de Tareas**: Flujo para crear tareas directamente desde los acuerdos del acta.
  - [ ] **UI Refinement**: Migrar de `alerts` a Toasts y pulir animaciones de pasos.
  - [ ] **Navegación e Histórico**: Integrar en el menú principal y añadir buscador por texto.
- [ ] **1.3 Calendario comunitario**
  - Eventos, reuniones, turnos. Vista mensual simple. Cada evento con responsable.
- [ ] **1.4 Tablón de necesidades/ofertas**
  - "Necesito ayuda con X" / "Ofrezco Y". Posts con respuesta asíncrona.
- [ ] **1.5 Gestión de Proyectos (Iniciativas)**
  - [ ] **Dashboard Kanban**: Vista visual de proyectos por estado (Buscando, En Marcha, Pausado, Completado).
  - [ ] **Controles de Dueño**: Botones de Editar y Borrar (con Deshacer) para líderes de proyecto.
  - [ ] **Sistema de Colaboración**: Mejorar la UI para aceptar/rechazar colaboradores desde el detalle del proyecto.

## 🟡 Fase 2 — Inteligencia comunitaria
- [x] **2.1 Cruce de perfiles**
  - IA analiza Fichas de miembros y genera compatibilidades de trabajo, posibles fricciones, y sugerencias de roles.
- [ ] **2.2 Dashboard sociocrático**
  - Vista general: tensiones activas, roles cubiertos/vacíos, decisiones pendientes.
- [ ] **2.3 Propuestas y consentimiento**
  - Flujo: Crear propuesta → ronda de objeciones → estado (borrador / en proceso / acordada / descartada).
- [ ] **2.4 Cruce astral/DH vs habilidades reales**
  - Comparativa IA entre información astral y aportes reales de la ficha.

## 🟢 Fase 3 — Espacios y escala
- [ ] **3.1 Múltiples espacios/tribus**
  - Soporte para albergar múltiples comunidades independientes.
- [ ] **3.2 Gestión de visitas / recién llegados**
  - Ficha simplificada para período de prueba y transición a miembro.
- [ ] **3.3 Registro de contribuciones**
  - Horas de trabajo comunal por persona con balance visible. Transparente, sin gamificación forzada.
- [ ] **3.4 Mapa interactivo**
  - Localización de puntos de interés, zonas y recursos. Editable colectivamente.

## 🔵 Fase 4 — Infraestructura offline
- [ ] **4.1 Persistencia offline**
  - Activación de IndexedDB en Firestore. Lectura y escritura sin red con sync automático.
- [ ] **4.2 Cola de acciones**
  - Indicador de "cambios pendientes de subir". Sincronización transparente/manual.
- [ ] **4.3 Operaciones IA en diferido**
  - Encolado de "Generar manual" si no hay conexión, se ejecuta al reconectar.
- [ ] **4.4 PWA instalable**
  - Soporte `manifest.json` y Service Workers para uso como App Nativa.

## 📋 BACKLOG / FUTURAS MEJORAS (Sprint Post-MVP)
- [ ] **Kanban de Proyectos**: Vista visual del estado de las iniciativas comunitarias.
- [ ] **Gestión Proyectos**: Botones de Editar y Eliminar para dueños de proyectos.
- [ ] **Panel de Carga**: Resumen de tareas por miembro (Admin).
