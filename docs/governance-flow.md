# Flujo de Gobernanza S3 — Máquina de Estados

## Estados válidos de una propuesta
| Status | Descripción |
|--------|-------------|
| `borrador` | Solo visible para el autor |
| `abierta` | Publicada, ronda de consentimiento activa |
| `en_objeciones` | Una o más objeciones activas bloquean el avance |
| `integrando` | El autor está editando para integrar objeciones |
| `acordada` | Consentimiento alcanzado |
| `caducada` | Plazo expirado sin alcanzar quórum mínimo |
| `descartada` | Retirada por el autor en cualquier momento |

## Reglas de transición automática (Motor de reglas)

### De `abierta` → `acordada`
Condición: todos los miembros requeridos han respondido 
Y ninguno con `objecion` activa.
- Consentimiento ✅ y Preocupación ⚠️ cuentan como avance
- Duda ❓ NO bloquea ni avanza — requiere resolución en hilo
- Denominador: totalMembers - 1 (el autor no vota)
- Trigger: al registrar cualquier respuesta

### De `abierta` → `en_objeciones`
Condición: cualquier miembro registra tipo `objecion`
- Una sola objeción es suficiente para bloquear
- La mayoría no aplasta a la minoría (principio S3)
- Trigger: inmediato al guardar la objeción

### De `en_objeciones` → `abierta`
Condición: todas las objeciones retiradas (activeObjectionsCount === 0)
Y no se han alcanzado aún todos los consentimientos
- Trigger: al retirar una objeción

### De `en_objeciones` → `integrando`
Condición: el autor pulsa "INTEGRAR OBJECIONES ACTIVAS"
- El autor edita el contenido de la propuesta
- version++ al guardar

### De `integrando` → `abierta`
Condición: el autor publica la versión integrada
- Todas las respuestas anteriores se resetean (archivo)
- Los miembros deben re-votar sobre la nueva versión
- Trigger: al ejecutar integratePropuestaObjeciones()

### De `integrando` → `acordada`
Condición: tras el reset, todos vuelven a consentir
- Misma regla que `abierta` → `acordada`

### Cualquier estado → `descartada`
Condición: solo el autor puede ejecutarla, en cualquier momento

### Cualquier estado activo → `caducada`
Condición: deadline expirado Y nextTotalResponses < quorumMínimo (50%)
Trigger: al registrar cualquier respuesta tras el deadline, o mediante un job programado.
caducadaReason: 'falta_quorum'
El autor puede reabrir la propuesta (status → 'borrador') para ampliar el plazo y republicar.

## Reglas críticas de negocio

1. **Regla de la objeción**: Una sola objeción bloquea. 
   No existe "mayoría" en S3.

2. **Regla del versionado**: Al integrar, version++. 
   Las respuestas de la versión anterior quedan archivadas, 
   no borradas. Los usuarios deben re-votar.

3. **Regla de duda/preocupación**: No afectan la transición 
   de estado. Solo la objeción bloquea.

4. **Regla de retirada**: El autor es el único que puede 
   descartar una propuesta, en cualquier punto del flujo.

5. **Denominador del acuerdo**: totalMembers - 1.
   El autor ya expresó su posición al proponer.

## Estructura de datos Firestore

### Documento principal (/propuestas/{id})
```
{
  title: string,
  description: string,
  driverStatement: string,
  status: 'borrador'|'abierta'|'en_objeciones'|'integrando'|'acordada'|'caducada'|'descartada',
  version: number,           // empieza en 1, ++ al integrar
  authorId: string,
  communityId: string,
  activeObjectionsCount: number,
  totalResponsesCount: number,
  userPositions: { [memberId]: 'consentimiento'|'preocupacion'|'duda'|'objecion' },
  integrationNote: string,   // nota del autor al integrar
  reviewDate: timestamp,     // fecha de reevaluación
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Subcolección (/propuestas/{id}/respuestas/{memberId})
```
{
  memberId: string,
  type: 'consentimiento'|'preocupacion'|'duda'|'objecion',
  justification: string,     // obligatorio para objecion
  version: number,           // versión de propuesta a la que responde
  status: 'activa'|'retirada'|'archivada',
  createdAt: timestamp
}
```

## Pendiente (backlog)
- [ ] ResponseFeed: mostrar dudas y preocupaciones al autor
- [ ] Hilos de aclaración por respuesta
- [ ] Notificaciones push al cambiar de estado
- [ ] Vista de celebración al llegar a 'acordada'
- [ ] reviewDate y fase de reevaluación
- [ ] Estado `descartada` con UI de retirada
