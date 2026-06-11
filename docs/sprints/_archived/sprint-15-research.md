# Research Sprint 15
> Fuente: Perplexity + Decisiones de Arquitectura — 08/06/2026
> Tarea principal: Unificación de superficies de perfil y manual (ADR-020) y rediseño de pasaporte (T-063)

## Notas Críticas de Arquitectura (Prevalecen sobre la investigación)
1. **Cache de manual en cliente**: En `<ManualSeccionesViewer>`, sustituir `getManualCache`/`saveSeccionCache` por `sessionStorage`. Las narrativas NO persisten en Firestore. La clave de cache es: `manual_${uid}_${seccionId}`.
2. **Sincronización de Pasaportes**: Para la colección `/pasaportes/`, la sincronización se hace desde el CLIENTE con `sincronizarPasaporte()` en este sprint. Registrar en ADR-020 (o ADR-021) que en producción esto se migrará a una Cloud Function para enforcement server-side. No implementar la Cloud Function ahora.
3. **Resto**: El normalizador, schema de privacidad y UX del selector de privacidad se implementan tal cual la propuesta técnica.

## Hallazgos clave e Investigación

### 1. Componente `<ManualSeccionesViewer>` y Normalizador
Normalización en la capa de datos. El componente recibe el mismo shape de pestañas, procesado por `normalizarSecciones` que unifica el modo modular y el legacy:

```typescript
export type SeccionId =
  | 'adn_astral'
  | 'anatomia_poder'
  | 'espejo_tribu'
  | 'sintonia_cnv'
  | 'mantenimiento_crisis';

export interface Seccion {
  id: SeccionId;
  label: string;
  icono: string;
  contenido: string | null;
}
```

### 2. Schema de privacidad y Firestore Rules
- **Campos en Ficha**:
  ```typescript
  export interface ConfigPrivacidad {
    disenoHumano:      boolean; // default: false
    arquetipo:         boolean; // default: true
    kinMaya:           boolean; // default: true
    manualCompleto:    boolean; // default: false
    datosAstrologicos: boolean; // default: false
  }
  ```
- **Valores por defecto**: `PRIVACIDAD_DEFAULT`.
- **Enforcement en Firestore Rules**:
  - `/pasaportes/{uid}`: lectura pública, escritura restringida al propio usuario o admin.
  - `/fichas/{fichaId}`: lectura completa restringida al propio miembro o admin de la comunidad.

### 3. Sincronización del Pasaporte
Función `sincronizarPasaporte(ficha: Ficha)` en el cliente que filtra campos según `ficha.privacidad` y los escribe en `/pasaportes/{uid}`.
