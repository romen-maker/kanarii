# ADR-025: Estrategia de Portabilidad y Migración a Stack Soberano

- **Estado:** Aceptado (Accepted)
- **Fecha:** 2026-07-31
- **Autor:** Agente Antigravity / Romen Suárez

---

## Contexto

Kanarii utiliza actualmente un stack basado en Firebase (Firestore, Auth, Functions, Hosting) y la API de Google Gemini como implementaciones operativas del MVP. 

Aunque ADR-001 (Anti vendor lock-in para IA) y ADR-002 (Firestore como backend principal) declararon la intención de mantener la soberanía tecnológica y evitar quedar atrapados en proveedores propietarios, no existía un documento único que consolidara el inventario real de acoplamiento, las fronteras de sustitución concretas entre capas y los disparadores (triggers) que activarán la migración futura hacia componentes self-hosted / Open Source (Supabase / Postgres, Keycloak, Ollama, pgvector).

Para evitar que la evolución del código cree acoplamientos invisibles y asegurar que las sustituciones futuras sean viables sin reescribir la aplicación, se requiere formalizar esta estrategia unificada.

---

## Decisión

Adoptar una **estrategia de portabilidad por capas**, manteniendo Firebase y Gemini para la etapa actual pero garantizando que cada capa del sistema tenga un punto de frontera explícito e inventariado.

### 1. Inventario de Acoplamiento y Fronteras de Sustitución

| Capa | Estado Actual | Frontera de Sustitución | Alternativa Soberana Futura |
|---|---|---|---|
| **Inteligencia Artificial** | Gemini API (`@google/genai`) | `src/lib/gemini.ts` (función contenedora única) | Ollama / LLM local / VLLM |
| **Acceso a Datos** | Cloud Firestore | `src/lib/services/` (Barrel & Services Layer) | Supabase (PostgreSQL) / ORM |
| **Autenticación** | Firebase Auth | `src/contexts/AuthContext.tsx` | Supabase Auth / Keycloak / Custom JWT |
| **Meta-tags / SSR** | Firebase Functions (`ogPassaporte`) | Cloud Function desacoplada / Node Server (`src/server.ts`) | Fastify / Edge Functions |
| **Transporte Multicanal** | Telegram / MCP / REST | `src/adapters/` + `ExecutionCtx` (ADR-024) | Invariable (Ya agnóstico) |

---

## Reglas de Frontera Obligatorias

1. **Capa de IA:** Ningún componente React, hook o servicio de negocio puede importar `@google/genai` ni instanciar clientes de Gemini directamente. Toda llamada debe realizarse a través de las funciones exportadas en `src/lib/gemini.ts`.
2. **Capa de Datos:** Ningún componente React, página o hook puede importar de `firebase/firestore`. La interacción con la base de datos debe ejecutarse a través de los servicios de dominio en `src/lib/services/`.
3. **Capa de Autenticación:** Ninguna página o componente (a excepción del gestor del callback de autenticación) debe importar directamente de `firebase/auth`. El estado y métodos de sesión deben consumirse via `useAuth()` desde `AuthContext.tsx`.

---

## Triggers de Migración

La migración de componentes del stack no se ejecutará por motivos estéticos, sino cuando se alcance alguno de los siguientes disparadores objetivos:

- **Trigger 1 (Almacenamiento/Costes):** El uso de Firestore supere el 60% del plan gratuito (según ADR-018), lo que activará la migración de narrativas pesadas y datos fríos a Supabase / PostgreSQL.
- **Trigger 2 (Búsqueda Vectorial / RAG):** La implementación de la Memoria Colectiva requiera embeddings densos y búsqueda por similitud no nativa en Firestore, activando el despliegue de `pgvector` en Supabase/PostgreSQL.
- **Trigger 3 (Soberanía de IA / Offline):** Se requiera ejecución de modelos en entornos locales o sin conectividad a internet, activando el switch del cliente en `src/lib/gemini.ts` hacia una API compatible con Ollama.

---

## Orden Recomendado de Migración Futura

En caso de activar una migración progresiva post-MVP:

1. **Capa de IA (Prioridad 1 - Esfuerzo Bajo):** Sustituir la implementación interna de `src/lib/gemini.ts` por una interfaz agnóstica o conector Ollama.
2. **Capa de Autenticación (Prioridad 2 - Esfuerzo Medio):** Reemplazar `AuthContext.tsx` para consumir el cliente de Supabase Auth / Keycloak.
3. **Capa de Datos (Prioridad 3 - Esfuerzo Alto):** Sustituir progresivamente las llamadas de `src/lib/services/` por consultas SQL/Supabase, migrando el esquema colección a colección.

---

## Consecuencias

### Positivas
- Se garantiza la mantenibilidad y soberanía del código sin añadir complejidad innecesaria en la etapa MVP.
- Se identifican y corrigen de forma preventiva las fugas de acoplamiento en componentes cliente.
- Facilita la incorporación de desarrolladores y agentes al dejar claros los límites de importación permitidos.

### Negativas / Trade-offs
- Requiere disciplina estricta en las revisiones de código y linters para evitar la reintroducción de imports directos de Firebase fuera de la capa de servicios.

---

## Relación con otros ADRs

- **ADR-001 (Anti vendor lock-in para IA):** Complementa y operacionaliza la frontera de IA.
- **ADR-002 (Firestore como backend principal):** Refuerza el carácter temporal del backend operacional de MVP.
- **ADR-007 (Modularización de appService por dominio):** Utiliza la Service Layer estructurada en Sprint 4 como frontera de datos.
- **ADR-018 (Persistencia de narrativas):** Reutiliza el trigger de cuotas para decisiones de almacenamiento.
- **ADR-024 (Adaptadores de transporte multicanal):** Se apoya en la abstracción `ExecutionCtx` para la independencia de transporte.
