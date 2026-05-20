# Arquitectura Técnica de Kanarii

> Documento de referencia para desarrolladores y agentes IA que se incorporan al proyecto.

## Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTACIÓN (UI)                        │
│  src/pages/*, src/components/*, src/components/ui/*        │
│  • Componentes React puros                                  │
│  • Sin lógica de negocio directa                            │
│  • Consumo de hooks y contextos                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   LÓGICA DE ESTADO                          │
│  src/hooks/*, src/contexts/*                               │
│  • use[Entidad]: estado + suscripción real-time             │
│  • useEntityActions: patrón try/catch → service → toast     │
│  • AuthContext, ComunidadProvider: estado global            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                 ACCESO A DATOS (Service Layer)              │
│  src/lib/appService.ts                                      │
│  • Única puerta a Firestore                                 │
│  • Interfaces TypeScript del modelo de datos                │
│  • Queries estándar y funciones CRUD                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    INFRAESTRUCTURA                          │
│  src/lib/firebase.ts, firebase.json, firestore.rules        │
│  • Configuración de Firebase                                │
│  • Reglas de seguridad                                      │
│  • Índices compuestos                                       │
└─────────────────────────────────────────────────────────────┘
```

## Stack Tecnológico

| Categoría | Paquete | Versión | Propósito |
|-----------|---------|---------|-----------|
| **Core** | react | ^19.0.1 | Framework UI |
| | react-dom | ^19.0.1 | Renderizado DOM |
| | react-router-dom | ^7.15.0 | Enrutamiento |
| **Firebase** | firebase | ^12.13.0 | Backend como servicio |
| | firebase-tools | ^15.17.0 | CLI y deployment |
| **Estilado** | tailwindcss | ^4.1.14 | Utility-first CSS |
| | @tailwindcss/vite | ^4.1.14 | Plugin Vite |
| | lucide-react | ^0.546.0 | Iconografía |
| | motion | ^12.38.0 | Animaciones |
| **Formularios** | react-hook-form | ^7.75.0 | Gestión de formularios |
| | zod | ^4.4.3 | Validación de esquemas |
| | @hookform/resolvers | ^5.2.2 | Integración Zod + RHF |
| **Utilidades** | date-fns | ^4.1.0 | Manipulación de fechas |
| | clsx | ^2.1.1 | Clases condicionales |
| | tailwind-merge | ^3.5.0 | Merge de clases Tailwind |
| | react-markdown | ^10.1.0 | Renderizado Markdown |
| **IA** | @google/genai | ^1.29.0 | Gemini API |
| **Build** | vite | ^6.2.3 | Bundler y dev server |
| | typescript | ~5.8.2 | Tipado estático |

## Flujo de Datos

### Usuario → Página → Hook → Firestore → Respuesta

```
1. USUARIO interactúa con componente UI (ej: botón "Crear propuesta")
   ↓
2. COMPONENTE llama a hook de acción (usePropuestaActions.createPropuesta)
   ↓
3. HOOK encapsula try/catch → llama a appService.createPropuesta()
   ↓
4. APPSERVICE ejecuta operación Firestore (addDoc, updateDoc, etc.)
   ↓
5. FIRESTORE persiste dato y dispara snapshot listeners
   ↓
6. HOOK DE ENTIDAD (usePropuestas) recibe actualización vía onSnapshot
   ↓
7. COMPONENTE se re-renderiza con datos actualizados
```

**Principio clave:** Ningún componente importa directamente `firebase/firestore`. Todo pasa por `appService.ts`.

## Decisiones Arquitectónicas Clave

### 1. Contextos en vez de Redux

**Decisión:** Usar React Context + hooks personalizados en lugar de Redux/Zustand.

**Por qué:**
- La app es de escala media (~20 páginas, ~30 hooks)
- El estado global es mínimo: autenticación + comunidad actual
- Los datos de Firestore se gestionan vía suscripciones en hooks, no en estado global
- Menos boilerplate, más simple para nuevos desarrolladores

**Estado en contextos:**
- `AuthContext`: usuario Firebase + perfil AppUser (role, hasFicha, communityIds)
- `ComunidadContext`: comunidad actual + lista de comunidades + selector

### 2. Capa de Servicio Única (`appService.ts`)

**Decisión:** Centralizar todo acceso a Firestore en un único archivo.

**Por qué:**
- Cumple regla DRY: ninguna page importa `firebase/firestore` directamente
- Facilita auditoría de seguridad y migraciones
- Punto único para manejo de errores (vía `handleFirestoreError`)
- Interfaces TypeScript reflejan exactamente el modelo de Firestore

### 3. Firma Consistente de Hooks de Entidad

**Decisión:** Todos los hooks de lectura siguen patrón `{ items, loading, reload }`.

**Por qué:**
- Predictibilidad: cualquier desarrollador sabe qué esperar
- Facilita refactorización y consolidación de hooks
- Permite hooks genéricos como `useEntityActions`

### 4. Convención de Nombres en Inglés (Modelo de Datos)

**Decisión:** Campos Firestore e interfaces en inglés camelCase.

**Por qué:**
- Estándar de la industria para interoperabilidad
- Evita mezclar español/inglés (`titulo` vs `authorId`)
- Ver sección `.agents/rules/naming-convention.md`

### 5. Magic Link + Ficha Pendiente

**Decisión:** Onboarding sin registro previo, guarda ficha en localStorage y migra tras login.

**Por qué:**
- Reduce fricción inicial (no requiere cuenta Google obligatoria)
- Permite completar ficha antes de autenticación
- Migración automática tras Magic Link

## Lo que NO es Kanarii (Scope Delimitado)

### Kanarii SÍ es:
- Módulo de gestión comunitaria dentro del ecosistema KanAIrOS
- Creación/gestión de comunidades
- Propuestas y votaciones con quórum (Sociocracia S3)
- Incorporación y roles de miembros
- Onboarding comunitario (ficha personal)
- Cruce de perfiles (análisis de compatibilidad)
- Marketplace de servicios internos
- Tareas, proyectos, actas, eventos, tablón de anuncios

### Kanarii NO es:
- El ecosistema completo KanAIrOS (es solo un nodo)
- Sistema de gestión de recursos físicos (inventario, stock)
- Plataforma de comunicación asíncrona (chat, foros complejos)
- Herramienta de contabilidad o gestión económica avanzada
- Sistema de reservas de espacios/compartición de recursos
- Módulo de formación o documentación comunitaria

**Nota:** Estos módulos existen o existirán como nodos separados en KanAIrOS.

## Estructura de Directorios

```
src/
├── App.tsx                 # Definición de rutas
├── main.tsx                # Punto de entrada, providers raíz
├── config/                 # Configuración estática (nav, reglas)
├── contexts/               # Estado global (Auth, Comunidad)
├── hooks/                  # Hooks personalizados por entidad/acción
├── lib/                    # Capa de servicio y utilidades
│   ├── appService.ts       # ÚNICA puerta a Firestore
│   ├── firebase.ts         # Inicialización Firebase
│   ├── gemini.ts           # Integración IA
│   ├── geocoding.ts        # Geocodificación de ubicaciones
│   └── utils.ts            # Helpers generales
├── pages/                  # Vistas por ruta
└── components/             # Componentes reutilizables
    ├── ui/                 # Primitivos visuales (sin lógica de negocio)
    └── *.tsx               # Componentes compuestos
```

## Seguridad y Reglas de Acceso

Las reglas de seguridad están en `firestore.rules`. Actualmente configuradas en modo desarrollo (acceso total hasta junio 2026).

**⚠️ DEUDA TÉCNICA:** Las reglas deben evolucionar a un modelo basado en roles (`admin`, `member`, `user`) y pertenencia a comunidad antes de producción.

---

*Documento vivo. Última actualización: mayo 2026.*