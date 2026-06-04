# T-043 — Fix calendario vacío tras PageContainer + widget Kin Maya en cabecera

## Estado
✅ Hecho

## Descripción
El calendario (CalendarioView.tsx) quedó roto al introducir PageContainer
en T-041: el grid de días se colapsa y solo se ven los headers.
Además, aprovechamos para añadir el widget de Kin Maya del día
en el subtítulo del PageHeader del calendario.

## Archivos a modificar
- `src/pages/CalendarioView.tsx`

## Plan de implementación

### FIX 1 — Altura explícita en el contenedor del calendario

Busca:
  <div className="flex-1 min-h-[500px]">
Reemplaza por:
  <div style={{ height: '520px' }}>

El problema: react-big-calendar con height:'100%' necesita un
padre con altura fija o calculada. flex-1 dentro de PageContainer
no resuelve la altura y el grid colapsa a cero.

### FIX 2 — Quitar flex-col del wrapper padre

Busca:
  <div className="flex-1 bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-6 overflow-hidden flex flex-col">
Reemplaza por:
  <div className="bg-white rounded-3xl shadow-sm border border-[#EAE2D6] p-6 overflow-hidden">

### MEJORA — Kin del día en el subtítulo del PageHeader

Añade el import junto al resto:
  import { kinDeHoy } from '../lib/kinMaya';

Modifica el prop subtitle del PageHeader:
  ANTES:
    subtitle="Sincroniza el latido de la comunidad"
  DESPUÉS:
    subtitle={`Sincroniza el latido de la comunidad · ${kinDeHoy().emoji} Kin ${kinDeHoy().numero} — ${kinDeHoy().nombreSello} ${kinDeHoy().tono}`}

## Criterios de done que revisaré yo en la ui web y app
- [x] Grid del calendario visible completo en vista Mes y Agenda
- [x] Kin del día visible en el subtítulo del header
- [x] Sin errores TypeScript (kinDeHoy() ya existe y está tipada en kinMaya.ts)
- [x] Verificado en móvil (si 520px se ve mal, cambiar a min-h-[400px]
      y wrapper con altura calculada via CSS)

## Estado de aprobación
- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-06-04 13:02:02+01:00
- [x] Rama creada: feat/T-043-fix-calendario-kin
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
