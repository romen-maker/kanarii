# ADR-021 — Contrato de Completitud de Tareas

## Estado
Activo

## Contexto
Las tareas que añaden nuevas colecciones, modifican el modelo de
datos o cambian roles y permisos han generado deuda técnica
recurrente: colecciones sin reglas en firestore.rules, datos
existentes no migrados y deploys pendientes. Este ADR establece
el checklist mínimo que DEBE completarse antes de marcar
cualquier tarea como ✅ cerrada.

## Decisión

### Checklist obligatorio por tipo de cambio

**Cuando se crea una nueva colección de Firestore:**
- [ ] Añadir match block en firestore.rules con reglas explícitas
      de read, write, create, update, delete
- [ ] Ejecutar: firebase deploy --only firestore:rules
- [ ] Documentar la colección en docs/firebase/

**Cuando se modifica el modelo de datos de una colección:**
- [ ] Identificar documentos existentes en producción que no
      cumplen el nuevo esquema
- [ ] Crear script de migración en scripts/migrate_{nombre}.ts
      o documentar los cambios manuales necesarios en Firebase Console
- [ ] Verificar que los datos de usuarios reales (Romén, Abián)
      son consistentes antes de cerrar la tarea

**Cuando se cambian roles o permisos:**
- [ ] Verificar que las reglas de Firestore reflejan el nuevo modelo
- [ ] Comprobar que community_members y users.communityIds
      están sincronizados para todos los usuarios existentes
- [ ] firebase deploy --only firestore:rules

**Cuando se añade escritura en múltiples colecciones:**
- [ ] Usar writeBatch o transaction de Firestore — nunca dos
      updateDoc/setDoc separados para datos que deben ser atómicos

### Regla de oro
Antes de hacer commit de cualquier tarea que toque Firestore,
ejecutar mentalmente: "¿Qué pasa con los datos que ya existen
en producción con este cambio?"

## Consecuencias
- Ninguna tarea que toque Firestore puede cerrarse sin pasar
  este checklist
- Los bugs de permisos y desincronización son síntoma de omitir
  este contrato, no de bugs de lógica
