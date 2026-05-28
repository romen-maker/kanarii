# Research Sprint 02
> Fuente: Perplexity — 2026-05-23
> Tarea principal: Corregir permisos de subcolecciones hilos/respuestas en Firestore Rules (hallazgo P0 auditoría QwenCoder)

---

## Decisiones tomadas

- **Decisión:** Opción B — leer el documento padre con `get()` para derivar `communityId`, no confiar en el campo enviado por el cliente en el subdocumento
- **Por qué:** Es la única forma de que un cliente no pueda falsificar el `communityId` en el payload y escribir en la comunidad de otro. El padre es la fuente de verdad del tenant.
- **Constraint clave:** Cada `get()`/`exists()` en reglas cuenta como lectura adicional facturable, aunque llamadas repetidas al mismo documento se cachean dentro de la misma evaluación. Límite: 10 access calls para requests de documento único, 20 para multi-doc/transacciones.
- **Referencia:** https://github.com/psvensson/firestore-security-rules

---

## Hallazgos clave

### Patrón aprobado para Kanarii

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function memberDoc(communityId) {
      return /databases/$(database)/documents/comunidades/$(communityId)/members/$(request.auth.uid);
    }

    function hasMinRole(communityId, role) {
      return signedIn()
        && exists(memberDoc(communityId))
        && get(memberDoc(communityId)).data.rol in ['admin', 'miembro'];
    }

    function proposalCommunityId(propuestaId) {
      return get(/databases/$(database)/documents/propuestas/$(propuestaId)).data.communityId;
    }

    match /propuestas/{propuestaId}/hilos/{hiloId} {
      allow read: if signedIn() && hasMinRole(proposalCommunityId(propuestaId), 'visitante');
      allow create, update, delete: if signedIn() && hasMinRole(proposalCommunityId(propuestaId), 'miembro');
    }

    match /propuestas/{propuestaId}/hilos/{hiloId}/respuestas/{respuestaId} {
      allow read: if signedIn() && hasMinRole(proposalCommunityId(propuestaId), 'visitante');
      allow create, update, delete: if signedIn() && hasMinRole(proposalCommunityId(propuestaId), 'miembro');
    }
  }
}
```

### Si se guarda `communityId` como campo desnormalizado en subdocs

No usarlo como base de autorización, sino como redundancia validada:
- En `create`: exigir `request.resource.data.communityId == proposalCommunityId(propuestaId)`
- En `update`: exigir también `request.resource.data.communityId == resource.data.communityId` para que el campo no pueda mutarse

### Coste real a escala Kanarii (50–500 docs/comunidad)

- 1–2 `get()` extra por escritura → impacto económico manejable
- Riesgo real: acercarse al límite de access calls en **batched writes** desde cliente, no en operaciones normales
- Evitar writes masivos desde cliente sobre subcolecciones si cada op dispara lectura del padre y del member doc

---

## Comparativa de opciones evaluadas

| Opción | Cómo valida | Ventajas | Riesgos |
|---|---|---|---|
| **A. Desnormalizar communityId en subdoc** | `request.resource.data.communityId` + `hasMinRole()` | Reglas directas | Cliente puede mentir; hay que fijar el campo y verificar consistencia con el padre igualmente |
| **B. Leer padre con `get()` ← ELEGIDA** | `get(/propuestas/{id}).data.communityId` + `hasMinRole()` | Fuente de verdad única; difícil de romper | Lecturas facturables adicionales (~manejable) |
| **C. Rutas tenant-first `/comunidades/{id}/propuestas/...`** | communityId en la ruta → simplifica reglas | Más limpio a largo plazo, menos ambigüedad multi-tenant | Requiere migración del modelo de datos y queries |

---

## Descartado

- **Opción A como base de autorización:** descartada porque `request.resource.data` viene del cliente y no es confiable sin validación adicional igual de costosa que el `get()`.
- **Migración a Opción C (rutas tenant-first):** descartada para este sprint por impacto en modelo de datos. Registrada como evolución futura en roadmap.

---

## ADR recomendada (advertencia de rango)

Si solo una persona entiende las reglas con `get()` encadenados, aparece una jerarquía invisible de mantenimiento. Acompañar este cambio con:
1. Tests de reglas en el repo (`firebase emulator:exec`)
2. ADR corta en `docs/adrs/` explicando por qué el tenant se deriva del padre y no del cliente
