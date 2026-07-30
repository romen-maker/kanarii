# Task-100: Investigar y resolver mensaje 'no available server/service' en móvil

## Objetivo
Diagnosticar la causa raíz del mensaje de error de conexión/servicio ("no available server/service") reportado en navegadores móviles y aplicar una mitigación o manejo de error resiliente.

## Contexto técnico
- El aviso/error aparece en dispositivos móviles durante la navegación o carga de datos.
- Puede estar relacionado con fallos intermitentes de red, inicialización de Firebase/WebSockets o la gestión de llamadas a servicios en entornos móviles restringidos.

## Caja de archivos
Archivos autorizados para modificación:
- `src/lib/firebase.ts`
- `src/App.tsx`
- `src/components/ui/SyncIndicator.tsx`

## Criterios de done
- [ ] Diagnóstico claro documentado sobre el origen del mensaje en móvil
- [ ] Implementar mitigación de manejo de errores o reconexión resiliente
- [ ] npx tsc --noEmit sin errores y tests unitarios pasando

## Estado de aprobación
> Este bloque lo rellena el agente durante /session-start.
> No modificar manualmente.

- [x] Plan presentado al usuario (Fase 3.5)
- [x] APROBADO recibido — fecha/hora: 2026-07-30T21:54:00Z
- [x] Rama creada: feat/t100-diagnose-mobile-service-error
- [x] Lock activo: .agent-session.lock
- [x] Sesión cerrada correctamente
