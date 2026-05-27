@[/session-start]
Perfecto. He revisado el código real del repo. Aquí está el análisis con todo el contexto de lo que ya tienes implementado.

***

## Lo que ya tienes resuelto (y es sólido)

Tu `registerPropuestaResponse` en `propuestas.ts` ya implementa el **motor de transiciones client-side**: detecta objeciones, calcula quórum, hace `batch.commit()` atómico y transiciona entre `abierta → en_objeciones → acordada`. Esto es exactamente el patrón correcto para Kanarii. **No necesitas Cloud Functions para las transiciones de estado.**

## Cloud Function vs Client-side para S3

| | Cloud Function (triggered on write) | Client-side en `registerPropuestaResponse` ✅ ya implementado |
|---|---|---|
| **Consistencia** | Alta — se ejecuta siempre, aunque el cliente se caiga | Media — depende de que el write llegue completo; batch atómico lo mitiga |
| **Coste Firebase** | Invocación por cada respuesta = coste añadido en Blaze plan | Cero coste adicional |

**Veredito**: quédate con client-side. Tu `batch` es atómico: si falla, ni la respuesta ni el cambio de estado se escriben. Para Cloud Functions solo tendría sentido si necesitaras notificaciones push o lógica que deba ejecutarse aunque el usuario cierre la app (ej. caducar propuestas por fecha) — y eso puede esperar al post-MVP.

## Las reglas de transición S3 estándar

En S3 el proceso de consentimiento tiene estas transiciones formales:

- `borrador → abierta`: el autor publica la propuesta para recibir respuestas
- `abierta → en_objeciones`: llega al menos una objeción válida
- `en_objeciones → integrando`: el autor/facilitador decide integrar las objeciones y edita la propuesta (ya tienes `integratePropuestaObjeciones`)
- `integrando → abierta`: nueva ronda de consentimiento (versión incrementada, respuestas limpias — también ya implementado) 
- `abierta → acordada`: quórum alcanzado sin objeciones
- cualquier estado → `descartada`: decisión explícita del autor o facilitador

**Lo que falta** es conectar la UI: `ResponseModal` → `PropuestaDetail`, y la UI de hilos para aclarar objeciones.

## Lo que hay que implementar esta semana

### 1. Conectar ResponseModal en PropuestaDetail

El componente existe y está listo. Solo falta instanciarlo con estado local en `PropuestaDetail.tsx`:

```tsx
// En PropuestaDetail.tsx
const [showResponseModal, setShowResponseModal] = useState(false);

// Botón que abre el modal (donde está el comentario "siguiente fase"):
<button onClick={() => setShowResponseModal(true)}>
  Responder a la propuesta
</button>

{showResponseModal && (
  <ResponseModal
    propuestaId={propuesta.id}
    memberId={appUser.uid}
    memberName={appUser.displayName}
    existingResponse={respuestas.find(r => r.memberId === appUser.uid)}
    totalMembers={totalMembers}
    onClose={() => setShowResponseModal(false)}
    onSubmit={async (respuesta, oldType) => {
      await registerPropuestaResponse(propuesta.id, respuesta, totalMembers, oldType);
      setShowResponseModal(false);
    }}
  />
)}
```

### 2. UI de hilos para aclaración de objeciones

El servicio `listenPropuestaHilos` y `createHiloMessage` ya existen. La UI que falta es mostrar los hilos **solo cuando `propuesta.status === 'en_objeciones'`** y permitir escribir mensajes. Un componente `ObjecionHilosPanel` simple con lista de mensajes + textarea:

```tsx
// Solo visible en estado en_objeciones
{propuesta.status === 'en_objeciones' && (
  <ObjecionHilosPanel
    propuestaId={propuesta.id}
    hilos={hilos}
    currentUser={appUser}
    onSend={(msg) => createHiloMessage(propuesta.id, msg)}
  />
)}
```

### 3. Resolución de objeciones: ¿quién cierra el hilo?

Esta es la decisión de diseño S3 que necesitas tomar antes de implementar:

| Modelo | Cómo funciona | Alineación S3 |
|---|---|---|
| **Objetor retira** | El que objetó cambia su respuesta a `consentimiento` o `preocupacion` | ✅ Más fiel — la objeción se resuelve cuando quien la puso entiende que fue integrada |
| **Autor marca resuelta** | El autor/facilitador marca la objeción como "integrada" manualmente | ⚠️ Riesgo de "poder-sobre" — el autor puede silenciar objeciones |
| **Ambos confirman** | Flujo de dos pasos: autor integra → objetor confirma retiro | ✅ Más robusto pero más fricción para MVP |

**Recomendación para Kanarii**: usa el modelo **"objetor retira"** como mecanismo principal. Es el más fiel a S3 (la objeción desaparece cuando la persona que la levantó consiente) y no requiere lógica extra: el objetor simplemente usa `ResponseModal` para cambiar su voto a `consentimiento`, lo cual ya dispara `countAdjustment = -1` en tu servicio y si `nextCount === 0` transiciona automáticamente de `en_objeciones → abierta`. Ya lo tienes implementado, solo falta mostrarlo claro en la UI.

## Advertencia de rango

La lógica de quórum (`quorumPercentage = 0.5`) y la definición de "respuesta positiva" (solo `consentimiento` y `preocupacion` cuentan para el quórum) son decisiones de gobernanza, no solo técnicas. Antes de activar el cierre automático por quórum en producción, valida con la comunidad de Arteara si ese 50% y esa clasificación son los que ellos esperan — o podrías "acordar" propuestas que la comunidad siente que no fueron realmente consensuadas.