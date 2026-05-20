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
  - [x] Flujo de Rechazo Estructurado: Modal con motivos obligatorios, detalle libre y visualización simétrica para admin y solicitante (Completado ✅).
  - [ ] **[PRÓXIMO SPRINT] feat(onboarding): flujo de registro de nueva comunidad** (es bloqueante para el crecimiento de la plataforma):
    - **Flujo en 4 pasos** (sin recargar página):
      - **PASO 1 — Identidad**: Nombre, slug único (auto-generado, editable), descripción corta, manifiesto/visión (opcional).
      - **PASO 2 — Lugar físico**: Municipio, isla/región, país, coordenadas o selector de mapa, tipo (finca / ecoaldea / cohousing / espacio urbano / nómada / otro), superficie aproximada (opcional), capacidad estimada de miembros (opcional).
      - **PASO 3 — Cultura y acceso**: ¿Pública o privada?, ¿requiere aprobación para unirse?, tags de valores (ej: permacultura, S3, soberanía alimentaria...), logo e imagen de portada (opcional).
      - **PASO 4 — Confirmación**: Resumen visual del perfil creado, asignación automática del fundador como admin de la comunidad, botón "Crear comunidad".
    - **Post-creación**: Redirige a `/admin?tab=comunidad` de la nueva comunidad con mensaje de bienvenida, se crea el documento en `/comunidades/{slug}` con `adminUids: [uid_fundador]`.
    - **Vista pública de comunidad (`/c/{slug}`)**: Nombre, logo, descripción, ubicación en mapa, tipo de espacio y capacidad, miembros visibles (si la comunidad es pública), servicios activos en el Marketplace, botón "Solicitar unirme" (si requiere aprobación) o "Unirme" (si es pública).
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

## 🎨 Sesión de Coherencia Visual & UI Transversal (Próxima Sesión de Diseño 🎯)
- [ ] **Estandarizar validación de formularios (`<FieldError />`)**
  - Crear componente atómico `<FieldError message={error} />` con estilo unificado.
  - Eliminar el uso de toasts para errores de validación de inputs.
  - Implementar validación inline consistente en todos los formularios (Proyectos, Tareas, Catálogo, Propuestas).
- [ ] **Estandarizar cabeceras de página (`<PageHeader />`)**
  - Crear componente reutilizable `<PageHeader title="..." subtitle="..." action={...} />`.
  - Aplicar en Gobernanza, Tareas, Proyectos, Actas y Catálogo para unificar estilo visual y subtítulos de contexto.
- [ ] **Unificar contenedores de página (`<PageContainer />`)** (Propuesta de Antigravity 💡)
  - Crear un contenedor de layout común que unifique el espaciado global (`padding`, `max-w-5xl`), comportamiento responsive y el tono cálido de fondo de Kanarii (`#FDFBF7`), evitando "saltos" de pantalla en navegación.
- [ ] **Estandarizar el disparador de apertura en tarjetas (Triggers Consistent)**
  - Resolver inconsistencias: En Gobernanza, hacer clic en cualquier parte de la tarjeta la abre directamente. En Tareas, exige hacer clic en el icono de editar (lápiz). Unificar a un patrón reactivo consistente.
- [ ] **Homogeneizar ventanas emergentes (Modales vs Paneles Laterales / Drawers)**
  - Resolver inconsistencias: En Actas se utiliza un panel lateral deslizante (Drawer), mientras que en el resto de la aplicación se usan modales de pantalla central. Definir cuándo se usa Drawer (ej: lectura profunda/actas) y cuándo Modal (ej: acciones rápidas/formularios) y aplicarlo coherentemente.
- [ ] **[DISEÑADO] feat(ux): animaciones educativas y onboarding visual** → Ver especificación completa en [`docs/animated-onboarding.md`](./docs/animated-onboarding.md). 8 animaciones priorizadas por impacto pedagógico. Alta prioridad: `WelcomeHeroSections` (A7) y `GovernanceFlowAnimation` (A1, prompt listo para integración).

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

## 🚨 Bugs Críticos & Deuda Operativa (Prioridad Alta)
- [/] **Corregir reactividad en el inicio de sesión con Google**
  - *Problema:* A veces, tras iniciar sesión con Google, la aplicación no transiciona ni redirige de forma automática, requiriendo una recarga manual (`F5`) por parte del usuario para que el estado de sesión se refleje en la UI.
  - *Causa probable:* Falta de propagación reactiva o desincronización entre el observer `onAuthStateChanged` en `AuthContext.tsx` y el enrutador de React Router durante el flujo de autenticación popup/redirect de Firebase.
- [ ] **Auditar flujo de validación de códigos de invitación (Toast "Código inválido")**
  - *Problema:* El toast de "Código inválido" se dispara a veces de manera confusa. Es muy probable que esto ocurra porque el usuario ya es miembro de la comunidad (por lo que el código de invitación ya no se puede redimir/no aplica), y no por un fallo en el refactor del código.
  - *Acción:* Revisar la lógica de validación para diferenciar entre un código verdaderamente inválido y el caso en que el usuario ya pertenezca a la comunidad, mostrando un feedback preciso en este último escenario.
- [ ] **Resolver conflicto de mayúsculas/minúsculas en input de código de invitación (Bug de UX)**
  - *Problema:* El input del formulario de invitación aplica visualmente `text-transform: uppercase` en CSS (o llama a `.toUpperCase()` en el handler), pero el backend guarda y compara los códigos estrictamente en minúsculas. Esto genera incompatibilidad y fallos en la validación.
  - *Acción:* Estandarizar el flujo normalizando el input a minúsculas (`.toLowerCase()`) de manera transparente en la validación antes de comparar con la base de datos, o asegurar la consistencia del almacenamiento en la colección de invitaciones.
- [/] **Auditar e implementar la interacción detallada en el Marketplace (Catálogo de Servicios)**
  - *Problema:* Al intentar interactuar o hacer clic sobre una tarjeta de servicio de otro miembro en la vista de Catálogo / Marketplace, la aplicación no realiza ninguna acción (no se abre ningún detalle, modal de contacto, ni panel lateral).
  - *Acción:* Auditar y completar el flujo de interacción del Marketplace para que al hacer clic se despliegue información detallada del servicio o se facilite el contacto/intercambio con el oferente.



## 🛠️ BACKLOG / FUTURAS MEJORAS
- [ ] Búsqueda global (Command+K) para proyectos, tareas y actas.
- [ ] Exportación de actas a PDF.
- [ ] **[DISEÑO PENDIENTE] feat(rag): memoria colectiva de la comunidad con chat consultivo (backlog post-MVP)**:
  - **Propósito**: permitir consultar en lenguaje natural toda la información de la comunidad (actas, acuerdos, fichas, cruces, propuestas S3).
  - **Decisiones de diseño pendientes (a investigar)**:
    - Qué colecciones indexar y con qué nivel de privacidad.
    - Quién puede consultar qué (solo admin vs todos los miembros).
    - Qué tipos de preguntas priorizar (operativas, históricas, relacionales, estratégicas).
  - **Stack técnico propuesto (fase 1 - Google)**:
    - Firebase Genkit + `text-embedding-004`
    - Firestore Vector Search
    - Cloud Functions como orquestador
    - Gemini como LLM
  - **Stack técnico propuesto (fase 2 - soberano)**:
    - Ollama (Llama 3 / Mistral) para LLM y embeddings
    - pgvector sobre PostgreSQL
    - LangChain/LlamaIndex como orquestador
- [ ] Notificaciones push para nuevas tareas asignadas.
- [ ] **Tablón**: Añadir botón para editar post directamente desde la lista o vista principal.
- [ ] **Tablón**: Añadir botón para eliminar post.
- [ ] **Gobernanza**: Añadir botón para eliminar acta.
- [ ] **Administración**: Añadir funcionalidad para eliminar/desvincular a un miembro de la comunidad (funcionalidad no existente actualmente).
- [ ] **Propuestas**: Arreglar validación de descripción (hacerla obligatoria u opcional, revisar bug "error al procesar solicitud").
- [ ] **Alternativa a Passwordless**: Evaluar implementación de un sistema opcional de Contraseñas / Email tradicional si la adopción de Magic Link genera fricción a largo plazo.
- [ ] **Evolución Propuestas (Post-2.4)**:
  - [ ] Notificaciones push cuando hay propuesta nueva.
  - [ ] Propuestas entre comunidades.
  - [ ] IA para sugerir si una objeción es válida S3.
  - [ ] Plantillas de propuestas predefinidas.
- [ ] **Evolución de Marketplace y Acuerdos**:
  - [/] **feat(acuerdos): badge nav para solicitante**: El listener actual solo cuenta acuerdos donde eres `providerId`. Necesita incluir también acuerdos donde eres `solicitanteId` con status recién cambiado. (Implementando versión simplificada).
  - [ ] **feat(acuerdos): sistema de notificaciones leído/no leído**:
    - Añadir campo `vistoPorSolicitante: boolean` en interfaz `Acuerdo`.
    - Cuando proveedor acepta/cancela, marcar `false`.
    - Cuando solicitante entra a pestaña Mis Acuerdos, batch update a `true`.
    - Badge desaparece solo cuando realmente ha visto el cambio, no solo por navegar a `/soberania`.
    - Necesario para multi-dispositivo y UX precisa.
    - Prioridad: post-MVP, antes de escalar usuarios.
  - [ ] **[DISEÑADO] feat(notifications): sistema de badges reactivos para Gobernanza**:
    - Mismo patrón que `listenAcuerdosActivosAsSolicitante` aplicado a:
      - Propuestas pendientes de voto del usuario
      - Tensiones asignadas al usuario sin resolver  
      - Actas pendientes de ratificación
    - Considerar extraer un hook genérico `usePendingActionsCount(communityId, userId, query)` que centralice la lógica de badge para cualquier sección — evita duplicar listeners en Sidebar y BottomNav.
  - [ ] **[DISEÑADO] feat(acuerdos): flujo de negociación/contrapropuesta**:
    - **Nuevos estados en tipo Acuerdo**:
      - `status: 'pendiente' | 'contraoferta' | 'en_curso' | 'completada' | 'cancelada'`
    - **Nuevo campo**:
      - `historial: Array<{ fecha: Timestamp, autorId: string, tipo: 'propuesta' | 'contraoferta' | 'aceptacion' | 'cancelacion', terminos: { horas, exchangeType, descripcion } }>`
    - **Flujo UI**:
      - El proveedor ve un acuerdo pendiente → botón "Contraofertar" abre modal con campos editables.
      - El solicitante recibe badge + ve contraoferta → puede Aceptar, Declinar o volver a Contraofertar.
      - Al cancelar → toast con deshacer usando el mismo patrón de `useUndoableDelete` existente.
  - [ ] **[DISEÑADO] feat(marketplace): marketplace global inter-comunidad con selector** (backlog post-MVP):
    - **Propósito**: El Marketplace pasa de ser por comunidad a ser global.
    - **Cambios implicados**:
      - Vista pública de servicios/recursos de TODAS las comunidades, filtrables por:
        - Comunidad
        - Tipo (servicio / recurso)
        - Tipo de intercambio (tiempo, dinero, especie)
        - Categoría
      - Al picar en una comunidad desde el marketplace o desde el directorio, se abre su ficha pública: nombre, descripción, ubicación, miembros visibles, métricas públicas y servicios activos.
      - Los acuerdos siguen siendo entre miembros de cualquier comunidad (inter-comunidad posible).
      - Requiere refactor de queries: eliminar filtro `communityId` en `getServiciosQuery` para la vista global, mantenerlo para las vistas de cada comunidad.
  - [ ] **[DISEÑADO] feat(admin): sistema de roles y estructura de panel multi-nivel**:
    - **Roles**:
      - `superadmin` (1 usuario, Romén): ve todas las comunidades, métricas globales de uso de la app.
      - `admin de comunidad`: múltiples por comunidad, gestionado como "círculo de coordinación" al estilo Sociocracia 3.0.
        - Cualquier miembro puede ser elevado a admin por consentimiento del círculo.
        - Mínimo 1 admin por comunidad (el fundador).
        - Sin jerarquía entre admins de la misma comunidad.
    - **Estructura Panel Admin (por comunidad)**:
      - *Tab 1: Dashboard* — métricas de salud de la comunidad (miembros activos este mes, acuerdos completados vs cancelados, ratio de participación en gobernanza, tareas abiertas vs cerradas, top colaboradores).
      - *Tab 2: Comunidad* — ya existe (miembros, roles, bajas).
      - *Tab 3: Tareas & Proyectos* — ya existe.
      - *Tab 4: Marketplace & Acuerdos* — próximo sprint.
      - *Tab 5: Gobernanza* — futuro.
    - **Panel Superadmin (separado, ruta `/superadmin`)**:
      - Lista de todas las comunidades.
      - Métricas de uso: DAU/MAU, acuerdos totales, comunidades activas.
      - Gestión de admins de comunidad.
    - **fix(miembros): migración de community_member docs 
      existentes para rellenar displayName/email/photoURL 
      desde /users/{uid}. Los docs creados antes del fix 
      no tienen estos campos y muestran el email en lugar 
      del nombre en la ficha pública.
      Solución: script de migración one-shot o Cloud Function
      triggered on community_member read si displayName vacío.

- [ ] **Deuda Técnica Firestore (Auditoría 2026-05-16)**:
  - [x] **[Alto] Modelado 1:1 de community_members**: La colección `community_members` utiliza `{userId}` directamente como ID de documento. Esto limita a un usuario a pertenecer a una única comunidad activa en el listado. Para escalar a multi-comunidad real en el futuro, se requerirá migrar el ID a `{communityId}_{userId}` o crear una subcolección/relación independiente `memberships`. [MIGRADO Y COMPLETADO EL 2026-05-17]
  - [ ] **[Medio]** Estandarizar campo `reason` a `purpose` en `/propuestas` para coherencia con el resto del sistema.
  - [ ] **[Bajo]** Migración de datos: Asegurar `userPositions: {}` y `totalResponsesCount: 0` en documentos antiguos (si existieran fuera de test).
  - [ ] **[Bajo]** Implementar un script de "Sanity Check" periódico para validar contadores desnormalizados (`activeObjectionsCount`, `totalResponsesCount`).
## 🔁 Comunidades / UX
- [x] [ALTO] feat(comunidades): auto-switch de comunidad activa tras crear nueva comunidad
  - Solucionado: al crear una nueva comunidad, el banner y el selector cambian automáticamente al nuevo espacio en sesión/memoria y redirigen de forma limpia.
- [x] [ALTO] feat(comunidades): CRUD de Configuración de Comunidad (Edición y Eliminación destructiva en ficha pública /c/:slug con confirmación de slug e inline para admin)

## 🚨 Seguridad (auditoría 2026-05-19)
- [ ] [CRÍTICO] Implementar Firestore Rules reales
  con validación de autenticación y communityId.
  Bloqueante antes de cualquier crecimiento de usuarios.
- [ ] [ALTO] Eliminar email hardcoded de admin en
  appService.ts líneas 148, 154, 1887.
  Reemplazar con campo role en Firestore.

## ⚡ Performance Firestore (auditoría 2026-05-19)
- [ ] [ALTO] Añadir `.limit(50)` a todos los hooks
  de listas: usePosts, useServicios, useAcuerdos,
  useEventos, usePropuestas, useActas, useFichas,
  useProyectos, useTareas.
- [ ] [MEDIO] Implementar paginación cursor-based
  (`startAfter`) para listas que necesiten scroll
  infinito real.
- [ ] [BAJO] Crear índices compuestos en Firebase
  Console para: `(communityId + fecha)`,
  `(communityId + updatedAt)`, `(communityId + inicio)`.

## 🧹 DRY & TypeScript (auditoría 2026-05-19)
- [ ] [MEDIO] Crear hook genérico
  `useFirestoreCollection` para eliminar patrón
  loading/error duplicado en 10+ hooks.
- [ ] [MEDIO] Reducir 47 usos de `any` —
  priorizar `datosBrutos`, `perfilVisual` y
  `configuracion` con interfaces específicas.
- [ ] [BAJO] Centralizar formateo de fechas
  en `dateUtils.ts` (7+ sitios duplicados).

## 📐 Decisiones de Arquitectura
- **2026-05-17 — Exclusión de Módulos de HD del Patrón DRY Actions**: Se decide de forma consciente y deliberada mantener el acceso directo a `appService` en los módulos de Fichas (`FichaView.tsx`, `FichaPreview.tsx`), Cruce (`CruceView.tsx`) y Administración General (`AdminPanel.tsx`). Estos componentes manejan flujos altamente acoplados al ciclo de vida del usuario de Firebase, sincronización diferida de estados de onboarding, enriquecimientos astrales y cálculos complejos de Diseño Humano, por lo que requieren control directo y granular y no se benefician de la abstracción genérica de `useEntityActions`.
- **[ARQUITECTURA] chore(infra): estrategia de soberanía tecnológica — anti vendor lock-in (backlog técnico estratégico)**:
  - **Principio**: usar infraestructura de Google mientras es gratuita, pero diseñar para migración soberana.
  - **Acciones inmediatas**:
    1. Abstraer todas las llamadas a Gemini detrás de un módulo `ai-adapter.ts` con interfaz genérica (`generateText`, `generateEmbedding`, `streamText`) para que cambiar de proveedor sea un cambio de configuración, no de código.
    2. Documentar en `/docs/architecture.md` el mapa completo de dependencias y sus alternativas soberanas (Firestore→Supabase, Auth→Keycloak, Gemini→Ollama, Vector→pgvector).
    3. Evitar usar APIs propietarias de Firebase que no tengan equivalente en Supabase/Appwrite sin dejar un comentario `// TODO: migration-risk`.
  - **Alternativas soberanas mapeadas**:
    - DB: Supabase (PostgreSQL) o Appwrite.
    - Auth: Supabase Auth o Keycloak.
    - IA: Ollama + Llama 3 / Mistral.
    - Embeddings: nomic-embed-text (Ollama).
    - Vector store: pgvector.
    - Functions: Docker + VPS propio.

---

*Última actualización: 20 May 2026*