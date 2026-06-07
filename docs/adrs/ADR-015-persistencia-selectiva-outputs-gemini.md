# ADR-015: Persistencia Selectiva de Outputs de Gemini en Firestore

**Estado:** Propuesta  
**Fecha:** 2026-06-07  
**Autores:** Investigación colectiva (Perplexity + NotebookLM + revisión manual del código)  
**Relacionado con:** ADR-002 (Firestore), ADR-004 (colección plana), ADR-014 (generación en capas)

---

## Contexto y Problema

La arquitectura de 3 capas definida en ADR-014 requiere decidir explícitamente
qué outputs de Gemini se persisten, dónde, y cuándo se consideran obsoletos.

NotebookLM mencionó una función `getFichaHash()` en `CruceView.tsx` y `fichas.ts`.
**Verificación en el repositorio (2026-06-07): esta función no existe en el código.**
Hay que crearla. `src/lib/appService.ts` pesa 28 bytes — está vacío.

El problema central es la **invalidación**: los datos astronómicos (fecha de nacimiento,
carta natal) nunca cambian, pero `rol`, `tension_actual` y `antiguedad_anos` sí.
Si cambian esos campos, el resumen de Capa 1 queda obsoleto y da información errónea.

---

## Decisión

### 1. Qué se persiste y dónde

**En `/fichas/{uid}` (campos planos, sin subcolección nueva):**
```
resumenManual: {
  identidad: string,   // 2 frases
  poder: string,
  sombra: string,
  comunicacion: string,
  mantenimiento: string
}
resumenManualHash: string   // hash de los campos invalidantes
manualPdfUrl: string | null // link externo gestionado por el usuario
```

**En `/cruces/{id}` (campo plano en el documento existente):**
```
insights: {
  arquetipo_relacional: string,
  clima_grupal_alerta: string,
  mapa_rangos: { ... },
  canales_enriquecidos: [ ... ],
  cnv_ganchos: [ ... ],
  sombras_resumen: [ ... ]
}
insightsHash: string
```

**Nunca en Firestore:**
- Narrativas largas de Capa 2 (Manual por pestaña, narrativa del cruce)
- Textos generados bajo demanda (efímeros por diseño)

### 2. Función `getFichaHash()` — hay que crearla

No existe actualmente en el repo. Debe crearse en `src/lib/utils.ts`
(o en el servicio de fichas cuando se modularice según ADR-007).

Lógica propuesta — hash ligero, no criptográfico, browser-compatible:

```typescript
// src/lib/utils.ts
export function getFichaHash(datosBrutos: any, datosPersona: any): string {
  const camposInvalidantes = {
    rol: datosPersona?.rol,
    comunidadId: datosPersona?.comunidadId,
    // fechaNacimiento NO cambia nunca, pero sí determina el contenido
    // → incluirlo garantiza que un error de fecha corregido regenere el resumen
    fechaNacimiento: datosPersona?.fechaNacimiento,
    // datosBrutos cambia si se re-importa la carta
    brutos_checksum: JSON.stringify(datosBrutos).length
  };
  return btoa(JSON.stringify(camposInvalidantes)).slice(0, 24);
}
```

### 3. Lógica de invalidación en el componente

```typescript
// Pseudocódigo en ManualViewer o en el hook que lo alimenta
const hashActual = getFichaHash(ficha.datosBrutos, ficha.datosPersona);
const hashGuardado = ficha.resumenManualHash;

if (!ficha.resumenManual || hashActual !== hashGuardado) {
  // Capa 1 obsoleta o inexistente → llamar a Gemini
  const resumen = await generarResumenManual(...);
  await updateDoc(fichaRef, {
    resumenManual: resumen,
    resumenManualHash: hashActual
  });
} else {
  // Servir desde Firestore sin llamar a Gemini
  setResumen(ficha.resumenManual);
}
```

### 4. Caché de Capa 2 en sesión (estado React)

Las narrativas largas no van a Firestore pero sí deben sobrevivir la navegación
entre pestañas durante la sesión activa:

```typescript
// En ManualViewer.tsx
const [seccionesGeneradas, setSeccionesGeneradas] =
  useState<Map<string, string>>(new Map());

const cargarSeccion = async (tab: string) => {
  if (seccionesGeneradas.has(tab)) return; // hit de caché
  const narrativa = await generarSeccionManual(tab, resumen);
  setSeccionesGeneradas(prev => new Map(prev).set(tab, narrativa));
};
```

Si el usuario cierra la app y vuelve → la Capa 0 y Capa 1 están disponibles
instantáneamente desde Firestore. La Capa 2 se regenera bajo demanda.

---

## Alternativas Consideradas

| Alternativa | Razón de descarte |
|---|---|
| Subcolección `/fichas/{uid}/resumen/{tab}` | Lectura extra por tab; ADR-004 favorece documentos planos |
| `sessionStorage` del navegador para Capa 1 | Se pierde entre pestañas del navegador; Firestore más fiable |
| `localStorage` para Capa 2 | Bloqueado en iframes del sandbox; inconsistente entre dispositivos |
| Hash criptográfico (SHA-256) | Overkill para invalidación semántica; `btoa` slice es suficiente |
| Regenerar siempre sin hash | Coste innecesario de tokens en cada carga |

---

## Consecuencias

**Positivas:**
- Una sola lectura de Firestore trae Capa 0 + Capa 1 + link PDF.
- La invalidación es explícita y auditable: el hash está visible en el documento.
- `appService.ts` deja de estar vacío con una función de utilidad real.

**A gestionar:**
- El hash basado en `JSON.stringify(datosBrutos).length` es aproximado.
  Si dos cartas distintas tienen el mismo número de caracteres, no se detecta.
  Aceptable para este caso de uso (probabilidad muy baja; el coste de un falso
  negativo es solo no regenerar — no es un error de seguridad).
- El campo `manualPdfUrl` es editable por el propio usuario sin validación.
  La app no verifica que el link sea accesible ni que sea un PDF.
  Es un campo de conveniencia, no de integridad.

---

## Advertencia de Rango

`getFichaHash()` determina cuándo se regenera el resumen de una persona.
Si un admin puede editar los campos de `datosPersona` (rol, comunidadId),
indirectamente puede forzar una regeneración del perfil de otro miembro.
Se recomienda que la escritura de `resumenManual` en Firestore esté protegida
por reglas de seguridad que solo permitan al propio usuario o a una
Cloud Function actualizar ese campo.
