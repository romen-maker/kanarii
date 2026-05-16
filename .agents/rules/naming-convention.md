# Nomenclatura y Convenciones de Datos

> Estándar obligatorio para nombres de campos, variables e interfaces en Kanarii para garantizar la consistencia y la interoperabilidad Open Source.

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

## 2. Interfaces TypeScript (`appService.ts`)

Las interfaces deben ser un reflejo exacto del modelo de Firestore:

- **Idioma**: Siempre Inglés.
- **Consistencia**: Si una interfaz similar ya usa un nombre para un concepto (ej: `authorId` para el creador), las nuevas interfaces **deben** usar el mismo nombre.
- **Prohibido**: Mezclar términos en español (`titulo`, `autor_uid`, `fecha_creacion`).

## 3. Código Frontend (Componentes y Hooks)

- **Variables locales**: Se permite el uso de términos descriptivos en inglés (preferido) o español si ayuda a la legibilidad del flujo de negocio, pero los datos que provienen del modelo deben mantener su nombre original.
- **Mapeos**: Evitar mapear campos de Firestore a otros nombres en el frontend a menos que sea estrictamente necesario para compatibilidad con librerías externas. Es mejor adaptar el modelo que crear capas de traducción constantes.

## 4. Proceso de Verificación

Antes de añadir un campo nuevo:
1. Abrir `src/lib/appService.ts`.
2. Buscar campos equivalentes en otras entidades.
3. Si el concepto existe, copiar el nombre.
4. Si es nuevo, usar inglés + camelCase.

---

*Última actualización: 16 May 2026*
