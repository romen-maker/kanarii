# Flujos Principales — Kanarii

> Descripción detallada de los flujos críticos del sistema.

---

## Flujo 1: Registro de Comunidad

**Actor:** Usuario autenticado (cualquier rol)
**Página:** `/nueva-comunidad` (`RegistroComunidadView.tsx`)
**Propósito:** Crear una nueva comunidad en la plataforma.

### Pasos Secuenciales

#### Paso 1: Identidad
- **Campos requeridos:**
  - `nombre`: Nombre de la comunidad
  - `slug`: Identificador URL-safe (auto-generado desde nombre, verificable manualmente)
  - `descripcion`: Máximo 160 caracteres
  - `manifiesto`: Opcional, Markdown con preview en tiempo real

- **Validaciones:**
  - Slug único (debounce 500ms → consulta a `getComunidad(slug)`)
  - Estado del slug: `idle` → `checking` → `available` / `taken`
  - Nombre y descripción no vacíos

#### Paso 2: Lugar
- **Campos requeridos:**
  - `municipio`, `region`, `pais`: Texto libre
  - `lat`, `lng`: Coordenadas (autocompletadas vía `LocationAutocomplete`)
  - `tipo`: Selector entre `finca`, `ecoaldea`, `cohousing`, `urbano`, `nomada`, `otro`
  - `capacidad`: Opcional, número entero

- **Validaciones:**
  - Municipio, región y país obligatorios
  - Coordenadas opcionales pero recomendadas

#### Paso 3: Cultura y Acceso
- **Campos:**
  - `esPublica`: Toggle (si es pública o privada)
  - `requiereAprobacion`: Toggle (solo si es pública)
  - `tags`: Chips seleccionables de sugerencias + input libre (máx 10)

- **Reglas:**
  - Si `esPublica = false`, `requiereAprobacion` se fuerza a `true`

#### Paso 4: Confirmación
- **Resumen:** Muestra todos los datos ingresados
- **Acción:** Botón "Crear comunidad"

### Escritura en Firestore

```typescript
await registrarNuevaComunidad({
  nombre, slug, descripcion, manifiesto,
  esPublica, requiereAprobacion, tags,
  ubicacion: { municipio, region, pais, lat, lng },
  tipo, capacidad,
  adminUids: [appUser.uid] // El creador es admin
}, {
  successMessage: '🎉 ¡Tu comunidad ha sido creada!',
  onSuccess: () => {
    setCommunityId(slug); // Cambia contexto actual
    navigate(`/admin?tab=comunidad&nueva=true...`);
  }
});
```

**Documento creado en `comunidades/{slug}`:**
```json
{
  "nombre": "...",
  "slug": "...",
  "descripcion": "...",
  "manifiesto": "...",
  "esPublica": true,
  "requiereAprobacion": true,
  "tags": ["tag1", "tag2"],
  "ubicacion": { "municipio": "...", "region": "...", "pais": "...", "lat": 28.123, "lng": -15.456 },
  "tipo": "finca",
  "capacidad": 15,
  "adminUids": ["user_abc123"],
  "creadoEn": Timestamp,
  "plan": "free"
}
```

### Errores Posibles

| Error | Causa | Manejo |
|-------|-------|--------|
| `SLUG_ALREADY_EXISTS` | El slug ya existe (race condition) | Volver al paso 1, mostrar error inline |
| Error de red | Fallo en escritura Firestore | Toast genérico, retry manual |
| Sin autenticación | Usuario no logueado | Redirigir a login (protegido por ruta) |

---

## Flujo 2: Onboarding de Miembro

**Actor:** Nuevo usuario (no autenticado o sin ficha)
**Página:** `/onboarding` (`OnboardingChat.tsx`)
**Propósito:** Recoger datos personales para generar ficha comunitaria.

### Pasos del Chat

#### Paso 0: Rol/Tipo de vínculo
- **Pregunta:** "¿Cómo llegas a la comunidad?"
- **Opciones:**
  - `propietario`: Núcleo/propietario
  - `miembro`: Miembro regular
  - `voluntario`: Workaway/HelpX

- **Rama condicional:** Si `voluntario`, inserta pasos extra:
  - `fechaLlegada`: Fecha aproximada de llegada
  - `fechaSalida`: Fecha aproximada de salida
  - `habilidades_voluntario`: Habilidades a compartir

#### Paso 1: Nombre
- **Input:** Texto libre
- **Validación:** No vacío

#### Paso 2: Fecha de nacimiento
- **Input:** Tipo `date` (YYYY-MM-DD)
- **Formato:**ej: `1990-05-14`

#### Paso 3: Hora de nacimiento
- **Input:** Tipo `time` (HH:MM)
- **Nota:** Permite `00:00` si desconocida

#### Paso 4: Lugar de nacimiento
- **Input:** `LocationAutocomplete` con geocodificación
- **Datos guardados:**
  - `lugar`: String normalizado
  - `latitud`, `longitud`: Coordenadas
  - `timezone`: Timezone IANA

#### Paso 5: Género
- **Opciones:** `hombre`, `mujer`, `no_binario`, `prefiero_no_decir`

#### Paso 6: Saberes
- **Input:** Texto libre con ejemplo
- **Propósito:** Habilidades, formación, recorrido vital

#### Paso 7: Rol en la comunidad
- **Input:** Texto libre con ejemplo
- **Propósito:** Aporte actual al proyecto

#### Paso 8: Antigüedad
- **Opciones:** Rango predefinido (`0`, `0.5`, `1`, `3`, `5` años)

#### Paso 9: Tensión/Estado interno
- **Input:** Texto libre con ejemplo
- **Propósito:** Autoevaluación de estado en la convivencia

### Guardado del Progreso

**Durante el chat:**
- Respuestas en memoria (`pendingResponses` state)
- Navegación atrás reconstruye mensajes desde `pendingResponses`

**Al finalizar:**
```typescript
localStorage.setItem('kanarii_pendingFicha', JSON.stringify(formData));
localStorage.setItem('kanarii_pendingResponses', JSON.stringify(pendingResponses));
navigate('/ficha-preview');
```

**⚠️ DEUDA TÉCNICA:** El uso de localStorage es un workaround para sandbox. En producción, considerar IndexedDB o persistencia en backend temporal.

### Estado Final

- Datos en localStorage hasta que usuario complete autenticación
- En `/ficha-preview`, usuario revisa datos y genera ficha con IA
- Tras login con Magic Link, se migra `pendingFicha` a Firestore (`fichas/{userId}`)

### Errores Posibles

| Error | Causa | Manejo |
|-------|-------|--------|
| Geocodificación falla | API externa no responde | Mensaje "No se encontró ubicación", retry manual |
| localStorage bloqueado | Sandbox/iframe restrictivo | Fallback a variable en memoria (se pierde al recargar) |
| Navegación antes de completar | Usuario abandona | Datos persisten en localStorage hasta próxima visita |

---

## Flujo 3: Propuesta → Votación → Resolución de Quórum

**Actor:** Miembro de comunidad (cualquier rol)
**Página:** `/gobernanza` (`PropuestasView.tsx`)
**Propósito:** Crear propuesta, recoger votos por consentimiento, resolver quórum.

### Subflujo 3.1: Creación de Propuesta

**Componente:** `CreateProposalWizard`

1. **Título y descripción:** Campos obligatorios
2. **Razón/motivación:** Por qué es necesaria
3. **Responsables:** Select múltiple de miembros (`responsibleIds`)
4. **Plazos:**
   - `deadline`: Fecha límite para votar
   - `reviewDate`: Fecha de revisión (opcional)
5. **Revisión:** Resumen antes de crear

**Escritura en Firestore:**
```typescript
await createPropuesta({
  title, description, reason,
  responsibleIds, deadline, reviewDate,
  communityId, authorId,
  status: 'borrador' // o 'abierta' si publica inmediatamente
});
```

### Subflujo 3.2: Votación por Consentimiento

**Componente:** `PropuestaDetail`

**Tipos de respuesta:**
- `consentimiento`: "Puedo vivir con esto" (no significa acuerdo total)
- `preocupacion`: Duda o inquietud, pero no bloquea
- `duda`: Pregunta para aclarar
- `objecion`: Razón fundamental por la que la propuesta no debe aprobarse

**Acciones del votante:**
1. Selecciona tipo de respuesta
2. Escribe contenido opcional (obligatorio para objeciones)
3. Envía voto

**Escritura en Firestore:**
```typescript
await addRespuesta(propuestaId, {
  memberId: appUser.uid,
  type: 'consentimiento' | 'preocupacion' | 'duda' | 'objecion',
  content: string
});
```

### Subflujo 3.3: Motor de Quórum (Lógica en `appService.ts`)

**Cálculo de quórum:**
```typescript
const quorumPercentage = 0.5; // 50% de miembros
const totalPossibleVoters = totalMembers;
const requiredResponses = Math.ceil(totalPossibleVoters * quorumPercentage);
```

**Contadores:**
- `activeObjectionsCount`: Objeciones activas (incrementa con `objecion`, decrementa al retirar/integrar)
- `totalResponsesCount`: Respuestas positivas (`consentimiento` + `preocupacion`)

**Transiciones de estado:**

| Condición | Nuevo Estado | Acción |
|-----------|--------------|--------|
| `allVoted && nextCount === 0` | `acordada` | Todos votaron sin objeciones |
| `deadlineExpired && quorumReached && nextCount === 0` | `acordada` | Plazo expirado + quórum + 0 objeciones |
| `deadlineExpired && !quorumReached` | `caducada` | Plazo expirado sin alcanzar quórum |
| `respuesta.type === 'objecion' && status === 'abierta'` | `en_objeciones` | Primera objeción entra |
| `oldType === 'objecion' && newType !== 'objecion' && nextCount === 0` | `abierta` | Última objeción retirada |

**Caducidad:**
- `caducadaReason`: `'falta_quorum'` o `'tiempo_agotado'`

### Subflujo 3.4: Integración de Objeciones

**Actor:** Autor de la propuesta
**Condición:** Propuesta en estado `en_objeciones`

1. Lee objeciones en `PropuestaDetail`
2. Modifica descripción para integrar preocupaciones
3. Añade nota de integración
4. Ejecuta `integratePropuestaObjeciones()`

**Efectos:**
- Actualiza `description` con nueva versión
- Guarda `integrationNote`
- Incrementa `version` (v1 → v2 → ...)
- **Resetea** `userPositions`, `activeObjectionsCount`, `totalResponsesCount`
- Estado vuelve a `abierta` para nuevo ciclo

### Estado Final

- **Éxito:** Propuesta en estado `acordada` → se convierte en acuerdo ejecutable
- **Fallo:** Propuesta `caducada` o `descartada`

### Errores Posibles

| Error | Causa | Manejo |
|-------|-------|--------|
| Miembro vota múltiples veces | Bug o intento de manipulación | Firestore update sobrescribe posición, no duplica |
| Deadline ambiguo | Zona horaria no especificada | Usar UTC en backend, convertir en frontend |
| Quórum mal calculado | `totalMembers` desactualizado | Recalcular en cada votación desde `community_members` |

---

## Flujo 4: Cruce de Perfiles

**Actor:** Admin o miembro con permisos
**Página:** `/cruce` (`CruceView.tsx`)
**Propósito:** Analizar compatibilidad entre dos miembros usando Diseño Humano + IA.

### Qué es el Cruce

El cruce es un análisis de compatibilidad interpersonal basado en:
- **Diseño Humano:** Tipo, autoridad, puertas activas, centros definidos
- **Análisis visual facial:** Rasgos, expresividad (vía IA Gemini)
- **IA generativa:** Interpretación narrativa de compatibilidades y tensiones

### Cómo Funciona

#### Paso 1: Selección de Perfiles
- Dos dropdowns con lista de miembros de la comunidad
- Validación: No permitir mismo perfil dos veces

#### Paso 2: Verificación de Datos
```typescript
if (!f1.datosBrutos || !f2.datosBrutos || !f1.perfilVisual || !f2.perfilVisual) {
  toast.error("Uno de estos miembros aún no tiene ficha completa");
  return;
}
```

**Enriquecimiento automático:**
Si `needsEnrich(ficha)` (faltan `puertas_activas`):
```typescript
await enrichFichaDatosBrutos(ficha); // Llama a API externa de Diseño Humano
```

#### Paso 3: Análisis Determinista
```typescript
const determinista = cruzarMiembros(f1, f2);
```

**Campos de `AnalisisCruce`:**
- `compatibilidad_general`: Score numérico
- `fortalezas`: Array de puntos fuertes
- `desafios`: Array de desafíos potenciales
- `elementos_complementarios`: Elementos que se potencian
- `elementos_conflictivos`: Elementos en tensión

#### Paso 4: Análisis con IA (Gemini)
```typescript
const gemini = await generarAnalisisCruce(f1, f2);
const structured = parseStructuredResponse(gemini);
```

**Salida:** Texto narrativo + estructura JSON parseada

#### Paso 5: Cacheo del Resultado
```typescript
await saveCruce({
  perfil1Id, perfil2Id,
  analisisDeterminista: determinista,
  analisisGemini: gemini,
  generadoEn: new Date()
});
```

**Consulta futura:** Si existe cruce cacheado (< 30 días), ofrece usarlo en vez de regenerar.

### Estado Final

- Resultado mostrado en UI con dos pestañas:
  - **Determinista:** Scores y listas estructuradas
  - **IA:** Narrativa generada por Gemini
- Opción de guardar/imprimir

### Errores Posibles

| Error | Causa | Manejo |
|-------|-------|--------|
| Ficha incompleta | Faltan datos astrológicos | Toast + botón para enriquecer |
| API Diseño Humano caída | Servicio externo no responde | Retry con backoff, mensaje de error |
| Gemini timeout | IA tarda >30s | Mostrar spinner, permitir cancelación |
| Cache corrupto | Documento malformed en Firestore | Ignorar cache, regenerar |

---

## Resumen de Estados por Flujo

| Flujo | Estado Inicial | Acciones Clave | Estado Final |
|-------|----------------|----------------|--------------|
| Registro Comunidad | Usuario en `/comunidades` | Completar 4 pasos, validar slug | Comunidad creada, contexto actualizado |
| Onboarding | Usuario sin ficha | Responder 9-12 preguntas de chat | Datos en localStorage, redirect a preview |
| Propuesta | Miembro en `/gobernanza` | Crear, votar, integrar objeciones | Acordada / Caducada / Descartada |
| Cruce | Admin selecciona 2 perfiles | Verificar datos, llamar APIs, mostrar resultado | Análisis visible, opcionalmente cacheado |

---

*Documento vivo. Última actualización: mayo 2026.*