# Nomenclatura y Convenciones de Datos

> Estándar obligatorio para nombres de campos, variables, componentes e interfaces en Kanarii para garantizar la consistencia y la interoperabilidad Open Source.

## 1. Modelo de Datos (Firestore)

Todos los nombres de campos en documentos de Firestore deben seguir estas reglas:

- **Idioma**: Siempre Inglés.
- **Formato**: `camelCase`.
- **IDs**: Usar el sufijo `Id` para referencias (ej: `authorId`, `communityId`, `projectId`). No usar `Uid` ni `UID`.
- **Fechas**: Usar el sufijo `At` para timestamps (ej: `createdAt`, `updatedAt`, `resolvedAt`).
- **Booleanos**: Usar prefijos como `is`, `has`, `should` (ej: `isActive`, `hasAcceptedTerms`).

### Ejemplo de Documento Correcto:
```json
{
  "title": "Reparación de valla",
  "description": "Necesitamos ayuda para...",
  "authorId": "user_123",
  "communityId": "tribu_456",
  "status": "active",
  "createdAt": "Timestamp(...)"
}
```

## 2. Interfaces TypeScript (`_types.ts`)

Las interfaces deben ser un reflejo exacto del modelo de Firestore:

- **Idioma**: Siempre Inglés.
- **Consistencia**: Si una interfaz similar ya usa un nombre para un concepto (ej: `authorId` para el creador), las nuevas interfaces **deben** usar el mismo nombre.
- **Prohibido**: Mezclar términos en español (`titulo`, `autor_uid`, `fecha_creacion`).

## 3. Código Frontend (Componentes y Hooks)

- **Nombres de componentes React**: Siempre en **inglés** y `PascalCase`.
  - ✅ Correcto: `ClarificationThread`, `ResponseModal`, `ConsentGrid`, `CommunityPassport`
  - ❌ Incorrecto: `ObjecionHilosPanel`, `FichaVista`, `PasaporteComunitario`
- **Nombres de hooks**: Siempre en **inglés** y `camelCase` con prefijo `use`.
  - ✅ Correcto: `usePropuestaDetail`, `useCommunityMembers`, `useInvitacion`
  - ❌ Incorrecto: `useMiembros`, `useDetallesPropuesta`
- **Variables locales**: Inglés preferido. Se permite español si mejora la legibilidad del flujo de negocio, pero los campos que provienen del modelo deben mantener su nombre original (sin remapear).
- **Prohibido**: Crear capas de traducción de campos Firestore a nombres distintos en el frontend salvo compatibilidad con librerías externas.

## 4. Textos de Interfaz de Usuario (UI)

- **Idioma**: Siempre **español** en textos visibles al usuario (labels, botones, mensajes, placeholders, títulos de sección).
- **Preparación i18n**: Evitar hardcodear cadenas largas directamente en JSX cuando sea posible agruparlas. La arquitectura debe permitir migrar a un sistema i18n sin tocar lógica de componentes.
- **Prohibido**: Mezclar inglés y español en la misma vista (ej: botón "Submit" junto a "Cancelar").

## 5. Resumen rápido

| Elemento | Idioma | Formato |
|---|---|---|
| Campos Firestore | Inglés | `camelCase` |
| Interfaces TypeScript | Inglés | `PascalCase` |
| Componentes React | Inglés | `PascalCase` |
| Hooks | Inglés | `camelCase` (prefijo `use`) |
| Variables locales | Inglés (preferido) | `camelCase` |
| Textos de UI | Español | — |

## 6. Proceso de Verificación

Antes de añadir un campo, componente o hook nuevo:
1. Buscar equivalentes en `src/components/`, `src/hooks/` o `src/lib/services/_types.ts`.
2. Si el concepto existe, copiar el nombre.
3. Si es nuevo, aplicar la tabla del punto 5.
4. Para componentes: verificar que el nombre en inglés no colisione con componentes de librerías externas (React, Lucide, etc.).

---

*Última actualización: 27 May 2026*
