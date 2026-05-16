# Roadmap Kanarii 🌿

Este documento describe las fases de desarrollo de Kanarii, marcando el progreso actual y los siguientes pasos a implementar.

## ✅ Ya hecho
- [x] Autenticación con cuentas de Google.
- [x] Creación y visualización de Fichas Comunitarias.
- [x] Asistente Onboarding estilo chat.
- [x] Generación del Manual Galáctico (IA) dividido por pestañas (Sol, Luna, Ascendente, Diseño Humano).
- [x] Panel de Administración con búsqueda, filtro y gestión de manuales.
- [x] Geocodificación integrada en the onboarding.

## 🏗️ Fase 0 — Refactorización de Arquitectura (Completado ✅)
- [x] **Fase 1: Fundaciones**
  - [x] Crear `appService.ts` (Single Source of Truth para Firestore).
  - [x] Implementar Hooks de Entidad: `useProyectos`, `useTareas`, `useActas`.
  - [x] Crear `useEntityActions` (Abstracción de mutaciones con toasts).
  - [x] Establecer reglas persistentes (`dry-architecture.md`, `react-page-boundaries.md`).
- [x] **Fase 2: Migración de Vistas**
  - [x] Refactorizar `ProyectosView.tsx` (Migración a `useProyectos` y `useEntityActions`).
  - [x] Refactorizar `TareasPanel.tsx` y `ActasPanel.tsx` (Eliminar bypass de `appService`).
  - [x] Limpiar `CruceView.tsx` y `AdminPanel.tsx` (Eliminar imports directos de Firestore).
  - [x] Reemplazar `alert()` nativos por `useToast`.
  - [x] Extraer modales inline a componentes independientes. (`CreateActaModal`, `CreateProjectModal`)
- [x] Aplicar **EntityCard** en todas las listas (Proyectos, Tareas, Actas).
- [x] **Refactorización Core Final ✅**:
  - [x] Refactorizar `AuthContext.tsx` (Eliminar Firestore, usar `appService`).

## 🟢 Fase 1 — App operativa mínima (Completado / En Refinamiento 🔄)
- [x] **1.1 Gestión de tareas comunitarias**
  - [x] **CRUD Tareas**: Crear, editar, borrar y cambiar estados (Pendiente/Proceso/Hecho).
  - [x] **Vínculo Proyectos**: Asociación de tareas a proyectos con cálculo de progreso automático.
  - [x] **Feedback UI**: Sistema de Toasts para todas las acciones de tareas.
  - [x] **Visualización Kanban**: Implementado en la vista de tareas y proyectos.
  - [ ] **Admin Dashboard**: Refinar vista global para administradores con filtros por miembro y estado.
- [x] **1.2 Actas de reuniones**
  - [x] **Estructura Base**: Modelado de actas (título, fecha, facilitador, participantes).
  - [x] **Generación de Tareas**: Flujo para crear tareas directamente desde los acuerdos del acta.
  - [x] **UI Refinement**: Migración completa de `alerts` a Toasts y componentes `EntityCard`.
  - [x] **Navegación e Histórico**: Integrado en el menú principal.
- [x] **1.3 Gestión de Proyectos (Iniciativas)**
  - [x] **Dashboard Kanban**: Vista visual de proyectos por estado.
  - [x] **Controles de Dueño**: Borrado con sistema de Deshacer (`useUndoableDelete`).
  - [ ] **Sistema de Colaboración**: Mejorar la UI para aceptar/rechazar colaboradores desde el detalle del proyecto.

## 🚀 Fase 2 — Inteligencia Colectiva y Social (Foco Actual 🎯)
- [x] **2.1 Pipeline de Análisis Estructurado (NEW ✨)**
  - [x] Refactorizar Gemini para devolver JSON tipado + Markdown.
  - [x] Renderizado dinámico de Canales Enriquecidos, Mapa de Rangos y Sombras Relacionales.
  - [x] Desacoplamiento de Comunidad (Parámetro dinámico listo para multi-comunidad).
  - [x] Sistema de Caché inteligente basado en hashes de integridad (v2).
- [x] **2.2 Calendario Comunitario**
  - [x] Integración `react-big-calendar` + `date-fns`.
  - [x] Colección `/eventos` en Firestore (CRUD completo).
  - [x] Hook `useEventos` con suscripción real-time.
  - [x] Vista mensual/agenda responsiva y modal de creación.
- [x] **2.3 Tablón de necesidades/ofertas**
    - [x] Sistema de Posts (Necesidad/Oferta) con subcolección de respuestas.
    - [x] Batch atómico para incremento de contador de respuestas.
    - [x] UI responsiva con filtros por categoría y estado.
    - [x] Gestión de estados y borrado con Deshacer.
- [ ] **2.4 Gestión de Propuestas y Consentimiento (S3) (Próximo Foco 🎯)**
  - [ ] **Modelo de Datos S3**: Colección `/propuestas` con subcolecciones `/respuestas` y `/hilos` (plana con `relatedResponseId`).
  - [ ] **Campos Críticos**: `activeObjectionsCount` para estados automáticos y `responsibleIds[]` para co-responsabilidad.
  - [ ] **Creación Sociocrática (Wizard)**: Formulario en pasos (Tensión/Driver → Propuesta → Ejecución y Revisión).
  - [ ] **Directorio de Decisiones**: Pantalla de lista con filtros por estado y badge de "Requiere tu atención".
  - [ ] **Sala de Deliberación**: Detalle de propuesta con Timeline S3 y visualización de participantes.
  - [ ] **Opciones de Respuesta S3**: Modal inline con 4 opciones explicadas (Consentimiento ✅, Preocupación 💭, Duda ❓, Objeción ⛔).
  - [ ] **Gestión de Dudas y Objeciones**: Hilos de aclaración para Dudas y obligación de argumentar daño en Objeciones.
  - [ ] **Estados Automáticos**: Transición asíncrona (borrador → abierta → en_objeciones → integrando → acordada / descartada).
  - [ ] **Acuerdo Cálido**: Estado de éxito visual que mantiene visibles las preocupaciones para futuras revisiones (`reviewDate`).
- [ ] **2.5 Sistema de Comunidades v2**
  - [x] Evolución del modelo: Multi-membership (`communityIds[]`), manifiestos y privacidad.
  - [x] Servicios de Invitación: Códigos legibles, validación y uso.
  - [x] Migración de datos: Backfill de `/users` y `/fichas` (Arteara).
  - [x] Página de Descubrimiento (`/comunidades`): Listado público y manifiestos.
  - [x] Acceso por Invitación: Modal para introducir código y unirse.
  - [x] Solicitudes de Acceso: Flujo de aprobación para comunidades privadas.
  - [x] Panel de Administración de Solicitudes: Aprobación/Rechazo en tiempo real con vista previa de ficha (Paso 3 ✅).
  - [x] Paso 4: Generación de códigos de invitación desde el panel admin (Completado ✅).
  - [x] Selector de comunidad en Sidebar para usuarios multi-comunidad.
- [x] **2.6 Onboarding y Seguridad de Autenticación (Completado ✅)**
  - [x] **AuthGateModal Reutilizable**: Sistema de autenticación *just-in-time* escapable con soporte para Google y Magic Link (con detección de errores de proveedor).
  - [x] **Persistencia Cross-Device**: Guardado de fichas en `/fichas_pendientes` (Firestore) antes de la autenticación para evitar pérdida de datos.
  - [x] **Migración Determinista**: Recuperación automática de datos del onboarding tras el login en cualquier dispositivo/navegador.
  - [x] **Membership Guards**: Restricción de acceso a herramientas core (ej: CruceView) para usuarios sin comunidad, con flujo de reconducción.
  - [x] **Aviso de Spam y UX**: Mejorada la comunicación en el flujo de Magic Link con avisos de carpeta de spam y cierres automáticos de modal.
  - [x] **Login Unificado (Magic Link Return)**: Adaptación del modal para permitir que los usuarios recurrentes inicien sesión sin contraseñas, usando el mismo sistema Magic Link.
- [x] **2.7 Marketplace de Soberanía (Apoyo Mutuo) ✅**
  - [x] **Catálogo Persistente**: Colección `/servicios` independiente del Tablón efímero, vinculada al perfil del creador.
  - [x] **Peticiones y Acuerdos**: Colección `/acuerdos` para conectar solicitante y proveedor con estados (`pendiente`, `en_curso`, `completada`, `cancelada`).
  - [x] **Gestión de Catálogo**: Acciones de soberanía para el propietario (editar, pausar/reactivar con icono `Archive`, eliminar con `Deshacer`).
  - [x] **Directorio Global**: Pantalla `/soberania` con navegación por tabs (Catálogo / Mis Acuerdos) y filtros por talento/recurso y categoría.
  - [x] **Cierre y Feedback**: Flujo de estados para acuerdos, permitiendo marcar como completado directamente desde la UI.

## 🌍 Fase 3 — Espacios y escala
- [x] **3.1 Múltiples espacios/tribus (Adelantado a 2.5 ✅)**
- [ ] **3.2 Gestión de visitas / recién llegados**
  - [ ] Ficha simplificada para período de prueba y transición a miembro.
- [ ] **3.3 Registro de contribuciones**
  - [ ] Horas de trabajo comunal por persona con balance visible.
- [ ] **3.4 Mapa interactivo**
  - [ ] Localización de puntos de interés, zonas y recursos. Editable colectivamente.

## 📱 Fase 4 — Infraestructura offline (PWA)
- [ ] **4.1 Persistencia offline**
  - [ ] Activación de IndexedDB en Firestore. Lectura y escritura sin red.
- [ ] **4.2 Cola de acciones**
  - [ ] Indicador de "cambios pendientes de subir".
- [ ] **4.3 Operaciones IA en diferido**
  - [ ] Encolado de "Generar manual" si no hay conexión.
- [ ] **4.4 PWA instalable**
  - [ ] Soporte `manifest.json` y Service Workers para uso como App Nativa.

## 🛠️ BACKLOG / FUTURAS MEJORAS
- [ ] Búsqueda global (Command+K) para proyectos, tareas y actas.
- [ ] Exportación de actas a PDF.
- [ ] RAG (Retrieval Augmented Generation) sobre el histórico de actas.
- [ ] Notificaciones push para nuevas tareas asignadas.
- [ ] **Alternativa a Passwordless**: Evaluar implementación de un sistema opcional de Contraseñas / Email tradicional si la adopción de Magic Link genera fricción a largo plazo.
- [ ] **Evolución Propuestas (Post-2.4)**:
  - [ ] Notificaciones push cuando hay propuesta nueva.
  - [ ] Propuestas entre comunidades.
  - [ ] IA para sugerir si una objeción es válida S3.
  - [ ] Plantillas de propuestas predefinidas.
- [ ] **Deuda Técnica Firestore (Auditoría 2026-05-16)**:
  - [ ] **[Medio]** Estandarizar campo `reason` a `purpose` en `/propuestas` para coherencia con el resto del sistema.
  - [ ] **[Bajo]** Migración de datos: Asegurar `userPositions: {}` y `totalResponsesCount: 0` en documentos antiguos (si existieran fuera de test).
  - [ ] **[Bajo]** Implementar un script de "Sanity Check" periódico para validar contadores desnormalizados (`activeObjectionsCount`, `totalResponsesCount`).