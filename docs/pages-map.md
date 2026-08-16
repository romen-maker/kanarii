# Mapa de Páginas — Kanarii

> Inventario completo de vistas, rutas y propósitos.

## Tabla de Páginas

| Página | Ruta | Propósito | Datos que consume | Rol requerido | Tamaño aprox. |
|--------|------|-----------|-------------------|---------------|---------------|
| **Welcome** | `/` | Landing tras login, dashboard mínimo | None (solo verifica auth) | Ninguno (pública para no auth) | ~5KB |
| **ContextConsent** | `/contexto` | Aceptación de términos y consentimiento de datos | Ninguno | Usuario autenticado sin consentir | ~3KB |
| **OnboardingChat** | `/onboarding` | Chat guiado para crear ficha personal | Ninguno (guarda en localStorage) | Ninguno (permite no auth) | ~16KB |
| **FichaPreview** | `/ficha-preview` | Revisión y generación de ficha con IA | `pendingFicha` de localStorage | Usuario autenticado | ~24KB |
| **FichaView** | `/ficha` | Visualización y edición de ficha personal | `fichas/{userId}` | Autenticado con ficha | ~36KB |
| **AdminPanel** | `/admin` | Panel de administración comunitaria | Múltiples colecciones (ver abajo) | Admin o community admin | ~84KB ⚠️ |
| **CruceView** | `/cruce` | Análisis de compatibilidad entre miembros | `fichas`, cruces cacheados | Admin (requiere `requireAdmin`) | ~24KB |
| **TareasPanel** | `/tareas` | Gestión de tareas (kanban/lista) | `tareas` filtered by communityId | Miembro de comunidad | ~9KB |
| **ActasPanel** | `/actas` | Listado y creación de actas | `actas` filtered by communityId | Miembro de comunidad | ~8KB |
| **ProyectosView** | `/proyectos` | Listado de proyectos comunitarios | `proyectos` filtered by communityId | Miembro de comunidad | ~8KB |
| **CalendarioView** | `/calendario` | Calendario de eventos | `eventos` filtered by communityId | Miembro de comunidad | ~8KB |
| **Tablon** | `/tablon` | Tablón de ofertas/necesidades | `posts` filtered by communityId | Miembro de comunidad | ~10KB |
| **ComunidadesView** | `/comunidades` | Listado de comunidades del usuario | `comunidades` (filtradas por `communityIds`) | Autenticado | ~20KB |
| **RegistroComunidadView** | `/nueva-comunidad` | Wizard de creación de comunidad | Validación de slug único | Autenticado | ~24KB |
| **AdminSolicitudesView** | `/admin/solicitudes` | Gestión de solicitudes de acceso | `solicitudes_acceso` | Admin de comunidad | ~29KB |
| **MarketplaceView** | `/soberania` | Marketplace de servicios internos | `servicios`, `acuerdos` | Miembro de comunidad | ~23KB |
| **PropuestasView** | `/gobernanza` | Gobernanza sociocrática (kanban de propuestas) | `propuestas`, `community_members` | Miembro de comunidad | ~5KB |
| **FichaComunidadView** | `/c/:slug` | Ficha pública de comunidad (vista externa) | `comunidades/{slug}`, `community_members` | Público (lectura) | ~21KB |
| **AuthCallbackPage** | `/auth/callback` | Callback de Magic Link login | Ninguno (procesa link) | Ninguno (flujo auth) | ~6KB |

---

## Páginas Grandes (+20KB): Subsecciones

### AdminPanel (`/admin`, ~84KB)

**Tabs internos:**

| Tab ID | Label | Componente interno | Datos específicos |
|--------|-------|-------------------|-------------------|
| `dashboard` | Dashboard | Métricas resumidas | Contadores de tareas, proyectos, acuerdos |
| `comunidad` | Comunidad | Listado de miembros, búsqueda, filtros | `community_members`, `fichas` |
| `tareas-proyectos` | Tareas & Proyectos | Kanban de tareas + lista de proyectos | `tareas`, `proyectos` |
| `marketplace-acuerdos` | Marketplace & Acuerdos | Servicios + acuerdos activos | `servicios`, `acuerdos` |
| `gobernanza` | Gobernanza | Propuestas activas + estadísticas | `propuestas` |

**⚠️ DEUDA TÉCNICA:** Este archivo excede ampliamente el límite recomendado de 20KB. Debería dividirse en:
- `AdminDashboard.tsx`
- `AdminComunidad.tsx`
- `AdminTareasProyectos.tsx`
- `AdminMarketplaceAcuerdos.tsx`
- `AdminGobernanza.tsx`
- `AdminPanel.tsx` como orquestador con routing por tabs

### FichaView (`/ficha`, ~36KB)

**Secciones internas:**
1. **Visualización de ficha:** Datos personales, manual generado
2. **Edición:** Formulario con validación Zod
3. **Geocodificación:** Verificación de ubicación
4. **Modal de abandono:** Wizard de 3 pasos para dejar comunidad

### FichaPreview (`/ficha-preview`, ~24KB)

**Secciones:**
1. **Resumen de datos:** Todos los campos del onboarding
2. **Generación de manual:** Llamada a Gemini para generar manual personalizado
3. **Confirmación:** Botón para guardar en Firestore

### RegistroComunidadView (`/nueva-comunidad`, ~24KB)

**Pasos del wizard:**
1. Identidad (nombre, slug, descripción, manifiesto)
2. Lugar (ubicación, tipo, capacidad)
3. Cultura y acceso (pública/privada, aprobación, tags)
4. Confirmación

### AdminSolicitudesView (`/admin/solicitudes`, ~29KB)

**Secciones:**
1. Lista de solicitudes pendientes
2. Modal de aprobación/rechazo
3. Historial de solicitudes resueltas

### CruceView (`/cruce`, ~24KB)

**Secciones:**
1. Selectores de perfiles
2. Resultados deterministas (scores, listas)
3. Resultados IA (narrativa Gemini)
4. Historial de cruces cacheados

### MarketplaceView (`/soberania`, ~23KB)

**Tabs internos:**
- **Servicios:** Listado de servicios activos
- **Mis acuerdos:** Acuerdos donde el usuario es provider o solicitante
- **Nuevo servicio:** Formulario de creación

### FichaComunidadView (`/c/:slug`, ~21KB)

**Secciones:**
1. Header con logo y descripción
2. Manifiesto (Markdown)
3. Ubicación (mapa estático)
4. Miembros destacados
5. Tags y metadata

---

## Páginas que Comparten Lógica o Estado

### Grupo 1: Hooks de Entidad Comunes

| Páginas | Hook compartido | Propósito |
|---------|-----------------|-----------|
| `AdminPanel`, `PropuestasView`, `CruceView` | `useCommunityMembers` | Obtener lista de miembros |
| `AdminPanel`, `TareasPanel`, `ProyectosView` | `useTareas`, `useProyectos` | Tareas y proyectos |
| `AdminPanel`, `MarketplaceView` | `useAllServicios`, `useAcuerdos` | Servicios y acuerdos |
| `AdminPanel`, `ActasPanel` | `useActas` | Actas de reuniones |
| `AdminPanel`, `CalendarioView` | `useEventos` | Eventos |
| `AdminPanel`, `FichaView`, `CruceView` | `useFichas` | Fichas personales |

### Grupo 2: Contextos Globales

**Todas las páginas (excepto Welcome, ContextConsent, AuthCallback):**
- `AuthContext`: `appUser`, `loading`, `logout`
- `ComunidadContext`: `currentCommunityId`, `comunidad`, `setCommunityId`

### Grupo 3: Lógica de Navegación Condicional

| Páginas | Patrón compartido |
|---------|-------------------|
| `FichaView`, `OnboardingChat` | Redirigir si ya tiene ficha / no tiene ficha |
| `AdminPanel`, `CruceView` | Requieren rol admin (`requireAdmin` en ruta) |
| Todas las páginas protegidas | Redirect a `/` si `!appUser` |

---

## Páginas WIP o Incompletas

### 1. PropuestasView (`/gobernanza`)

**Estado:** Funcional pero incompleto

**Lo que falta:**
- [ ] Modal de respuesta a propuesta (actualmente solo log en consola)
- [ ] Implementar `ResponseModal` mencionado en comentarios
- [ ] Carga optimizada de respuestas (actualmente `respuestas={[]}` en card)
- [ ] Integración real del botón "Nueva Propuesta" (wizard existe pero no se conecta completamente)

**⚠️ Nota:** El motor de quórum está implementado en backend (`appService.ts`), pero la UI no refleja todas las transiciones de estado.

### 2. FichaComunidadView (`/c/:slug`)

**Estado:** Vista pública básica funcional

**Lo que falta:**
- [ ] SEO meta tags dinámicos (título, descripción, Open Graph)
- [ ] Mapa interactivo (actualmente placeholder)
- [ ] Enlace a unirse/solicitar acceso (si es privada)
- [ ] Lista completa de miembros (actualmente solo destacados)

### 3. MarketplaceView (`/soberania`)

**Estado:** Funcional con lagunas

**Lo que falta:**
- [ ] Filtros avanzados por categoría/tipo
- [ ] Búsqueda full-text en servicios
- [ ] Notificaciones push cuando alguien solicita tu servicio
- [ ] Sistema de valoración post-servicio

### 4. OnboardingChat

**Estado:** Funcional pero con deuda técnica

**Lo que falta:**
- [ ] Migrar de localStorage a IndexedDB o persistencia backend
- [ ] Guardado incremental (si usuario abandona a mitad, puede retomar)
- [ ] Soporte para editar respuestas previas sin reiniciar

---

## Rutas No Implementadas (Posibles Extensiones)

| Ruta potencial | Propósito | Prioridad |
|----------------|-----------|-----------|
| `/perfil` | Perfil público de usuario (separado de ficha) | Baja |
| `/notificaciones` | Centro de notificaciones unificado | Media |
| `/documentos` | Repositorio de documentos comunitarios | Baja |
| `/finanzas` | Gestión económica básica | Baja (fuera de scope actual) |
| `/inventario` | Gestión de recursos físicos | Baja (otro nodo KanAIrOS) |

---

## Arquitectura de Internacionalización (i18n ES/EN)

> Implementada en el Sprint 26 para soportar la campaña internacional de fundraising.

### 1. Selector de Idioma (`LanguageSelector.tsx`)
- **Ubicación y comportamiento:** Componente accesible montado en la barra superior / cabecera principal (`TopBar.tsx` / `Header`).
- **Visibilidad:** Disponible globalmente tanto en vistas públicas (Welcome, `/c/:slug`, `/p/:uid`) como en rutas autenticadas.
- **Persistencia y HTML:** Persiste la preferencia en `localStorage` (`kanarii.language`) y sincroniza dinámicamente `<html lang="es">` / `<html lang="en">` y el evento `languageChanged`.

### 2. Regla de Fallback y Resiliencia (`i18n/index.ts`)
- **Estrategia:** `fallbackLng: 'es'`.
- **Modo Debug:** Habilitado solo en desarrollo (`debug: import.meta.env.DEV`).
- **Manejador de Claves Faltantes:** `parseMissingKeyHandler` intercepta cualquier clave ausente o en desarrollo y la humaniza limpiamente (ej: `"presentation"` -> `"Presentation"`) impidiendo la exposición de IDs técnicos en la UI (`namespace.key`).

### 3. Namespaces Críticos para Fundraising y Presentación
- **`passport`**: Ficha de miembro pública (`/p/:uid`), firma galáctica determinista y roles comunitarios.
- **`welcome`**: Landing / Hero, orientación de entrada, CTAs de fundraising y tarjetas de miembros destacados.
- **`communities`**: Vistas públicas de espacios comunitarios (`/c/:slug`).
- **`auth`**: Modales de login/registro y estados de acceso.
- **`common`**: Navegación (Sidebar, BottomNav), botones compartidos y estados globales.
- **`astrology`**: Capa de presentación para signos, planetas, elementos, modalidades, casas y relaciones kímicas (exclusivo para UI; no altera algoritmos ni Firestore).

### 4. Frontera Estricta: UI Fija vs. Contenido Dinámico de Usuario
- **UI Fija Traducible:** Botones, pestañas, cabeceras de widgets, firmas galácticas deterministas (`Kin {{kin}} · {{tone}} {{seal}} {{color}}`), términos astronómicos/HD y estados de acceso se traducen vía `useTranslation()`.
- **Contenido Dinámico de Miembros NO Traducido:** Se preserva intacto en el idioma de registro del usuario:
  - Títulos de propuestas, actas, tareas y proyectos.
  - Bios y presentaciones escritas por los miembros.
  - Saberes, necesidades y ofrendas.
  - Interpretaciones y arquetipos generados por Gemini (cuya regeneración multi-idioma se difiere a la tarea de backlog `T-124`).

---

## Flujo de Navegación Principal

```
/ (Welcome)
├── Si !appUser → Botón login/onboarding
├── Si appUser && !hasFicha → Banner hacia /onboarding
└── Si appUser && hasFicha → Acceder a menú principal

/onboarding → /ficha-preview → /ficha

/comunidades
├── /nueva-comunidad (crear)
├── /c/:slug (ver ficha pública)
└── /p/:uid (ver pasaporte comunitario público)

Menú principal (Sidebar/BottomNav):
├── /tareas
├── /proyectos
├── /calendario
├── /tablon
├── /soberania (Marketplace)
├── /gobernanza (Propuestas)
└── /admin (solo admins)
    ├── /admin/solicitudes
    └── /cruce
```

---

*Documento vivo. Última actualización: 2026-08-16.*