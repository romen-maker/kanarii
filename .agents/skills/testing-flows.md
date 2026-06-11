---
description: Guía para escribir tests de flujos críticos en Kanarii.
Cubre tests de reglas Firestore con el emulador y tests de hooks/servicios
con Vitest. Activar cuando una tarea incluya escribir o modificar tests.
---

# Skill: testing-flows

## Stack de tests de Kanarii

| Capa | Herramienta | Archivo de configuración |
|---|---|---|
| Reglas Firestore | Firebase Emulator + `@firebase/rules-unit-testing` | `firebase.json` |
| Hooks y servicios | Vitest + mocks de Firestore | `vitest.config.ts` |
| Flujos E2E (futuro) | Playwright | pendiente de configurar |

---

## Capa 1 — Tests de reglas Firestore

### Arrancar el emulador

```bash
firebase emulators:start --only firestore
```

O en modo test (sin UI, para CI):
```bash
firebase emulators:exec --only firestore "npx vitest run tests/firestore-rules.test.ts"
```

### Estructura base de un test de reglas

```typescript
// tests/firestore-rules.test.ts
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'kanarii-test',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
      host: '127.0.0.1',
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

afterEach(async () => {
  await testEnv.clearFirestore();
});
```

### Patrón para testear un flujo de permisos

```typescript
describe('F-003 — Admin global opera en cualquier comunidad', () => {
  it('admin global puede leer solicitudes sin membresía local', async () => {
    // Setup: crear usuario admin global en /users
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await ctx.firestore()
        .doc('users/admin-uid')
        .set({ role: 'admin' });
      await ctx.firestore()
        .doc('comunidades/arteara/solicitudes/sol-001')
        .set({ estado: 'pendiente', userId: 'otro-uid' });
    });

    // Test: admin global SÍ puede leer
    const adminCtx = testEnv.authenticatedContext('admin-uid');
    await assertSucceeds(
      adminCtx.firestore()
        .doc('comunidades/arteara/solicitudes/sol-001')
        .get()
    );
  });

  it('visitante NO puede leer solicitudes', async () => {
    const visitorCtx = testEnv.authenticatedContext('visitor-uid');
    await assertFails(
      visitorCtx.firestore()
        .doc('comunidades/arteara/solicitudes/sol-001')
        .get()
    );
  });
});
```

### Convenciones de naming para tests de reglas

- Archivo: `tests/flows/F-00N-nombre-flujo.test.ts`
- Describe: `F-00N — [nombre del flujo tal como aparece en critical-flows.md]`
- It: `[rol] [puede/NO puede] [acción] [en qué colección] [condición si aplica]`

---

## Capa 2 — Tests de hooks con Vitest

### Mock de Firestore para hooks

```typescript
// tests/mocks/firebase.ts
import { vi } from 'vitest';

export const mockGetDoc = vi.fn();
export const mockOnSnapshot = vi.fn();

vi.mock('firebase/firestore', () => ({
  getDoc: mockGetDoc,
  onSnapshot: mockOnSnapshot,
  doc: vi.fn((db, ...path) => ({ path: path.join('/') })),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
}));
```

### Patrón para testear getMemberName (F-002)

```typescript
// tests/flows/F-002-marketplace-nombre.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCommunityMembers } from '@/hooks/useCommunityMembers';
import { mockGetDoc } from '../mocks/firebase';

describe('F-002 — getMemberName con fallback a /profiles', () => {
  it('devuelve nombre del campo nombre si existe en community_members', () => {
    // setup members con nombre
    const { result } = renderHook(() => useCommunityMembers('arteara'));
    expect(result.current.getMemberName('uid-con-nombre')).toBe('Abián');
  });

  it('cae a /profiles si community_members no tiene nombre', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ datosPersona: { nombre: 'Nombre desde perfil' } }),
    });

    const { result } = renderHook(() => useCommunityMembers('arteara'));
    
    // Primera llamada → 'Miembro' (cargando en background)
    expect(result.current.getMemberName('uid-sin-nombre')).toBe('Miembro');
    
    // Después de resolver la promesa → nombre actualizado reactivamente
    await act(async () => { await new Promise(r => setTimeout(r, 0)); });
    expect(result.current.getMemberName('uid-sin-nombre')).toBe('Nombre desde perfil');
  });
});
```

---

## Cuándo activar esta skill

Activar en la Fase 3 de session-start cuando la tarea contenga:
- "añadir test", "escribir test", "cobertura F-00N"
- Modificación de `firestore.rules`
- Modificación de hooks que aparezcan in `critical-flows.md`
