# Investigación del Sprint 08 — Tríada Comunitaria y Gobernanza S3

## 1. Esquema de tipos TypeScript propuesto

Para evitar romper retrocompatibilidad con fichas existentes en Firestore que contienen `saberes: string` plano en `DatosOnboarding`, añadimos la tríada como campos opcionales a nivel de `Ficha` directamente, paralelos a `datosOnboarding`. Esto evita migración forzosa y permite compatibilidad hacia atrás.

```typescript
/** Tríada Comunitaria — campos de perfil público */
export interface TriadaComunitaria {
  ofrendas: string[];    // Lo que doy a la comunidad
  saberes: string[];     // Conocimientos y habilidades (migrado desde saberes: string)
  necesidades: string[]; // Lo que necesito de la comunidad
}

/** Ficha actualizada — añadir triada como campo opcional de primer nivel */
export interface Ficha {
  // ... campos existentes ...
  triada?: TriadaComunitaria;
}
```

Para asegurar robustez on-read, creamos un helper que migre los datos antiguos a la nueva estructura en caso de que no exista `triada` en Firestore:

```typescript
export function getTriadaFromFicha(ficha: Ficha): TriadaComunitaria {
  if (ficha.triada) {
    return {
      ofrendas: ficha.triada.ofrendas || [],
      saberes: ficha.triada.saberes || [],
      necesidades: ficha.triada.necesidades || []
    };
  }

  // Fallback / Migración on-read para datos legacy
  const saberesLegacy = ficha.datosOnboarding?.saberes 
    ? ficha.datosOnboarding.saberes.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  return {
    ofrendas: [],
    saberes: saberesLegacy,
    necesidades: []
  };
}
```

## 2. Script de migración en Firebase

Ubicación propuesta: `scripts/migrate-triada-comunitaria.ts`.
El script realiza un batch write de Firestore para migrar todas las fichas activas que tengan `datosOnboarding.saberes` y carezcan de `triada`.

- **Tamaño del batch**: Máximo 400 escrituras por lote para evitar límites de Firestore.
- **Idempotencia**: Si `triada` ya existe, no se toca.
- **Backup**: No destruimos `datosOnboarding.saberes` para preservar compatibilidad con código anterior durante la fase de transición.

## 3. Arquitectura UI y Componente TagArrayEditor

Para manejar los arrays de strings (tags) de forma uniforme en el formulario de onboarding y en la edición de ficha, implementamos:

- **Hook**: `useTagArray.ts` para manejar estados internos de edición.
- **Componente**: `TagArrayEditor.tsx` en `src/components/ui/` para que renderice y gestione la adición/eliminación de tags en la UI, con soporte para colores diferenciados según el tipo de campo (ej. verde para ofrendas, azul para saberes, naranja para necesidades).

## 4. Gobernanza y Reglas de Seguridad

Las "necesidades" pueden contener datos sensibles o de vulnerabilidad.
En `firestore.rules`, debemos considerar la visibilidad restringida si es necesario, o mantener visibilidad a nivel de comunidad autenticada.
