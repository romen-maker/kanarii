# Investigación Sprint 10: Bug Tríada, Indicador Offline y PageHeader

## Bug de la Tríada: diagnóstico exacto

El problema está en `_writeFichaRaw` línea ~165. Cuando propaga a `community_members`, construye el objeto `base` así:

```typescript
const base = fichaFull.datosPersona || fichaFull.datosOnboarding || {};
```

Y ese `batch.set` para `community_members` **no incluye `triada`** en ningún campo. Pero el bug de pérdida de ofrendas/necesidades en la ficha principal viene de otro sitio: en `saveFicha`, si `skipGemini = true` (como cuando FichaView llama con el quinto parámetro), el campo `triada` se asigna correctamente como `triada: triada || null` en el documento. 

**El bug real es que `FichaView` probablemente llama `saveFicha` con `skipGemini = true` pero sin pasar `triada`** — o `triada` llega como `undefined` porque el estado local no se inicializa correctamente desde `getTriadaFromFicha`. El `|| null` convierte `undefined` en `null` y sobreescribe la tríada existente en Firestore con `merge: false` implícito en `setDoc` cuando no hay merge.

**La corrección quirúrgica** en `_writeFichaRaw`:

```typescript
// Antes (línea ~165 en _writeFichaRaw):
await setDoc(profileRef, finalData, { merge: true }); // ✅ usa merge

// PERO el problema es que fichaFull.triada llega como null
// y { merge: true } con triada: null SÍ sobreescribe el campo existente.
// Solución: limpiar el null antes del setDoc
const finalData = {
  ...fichaFull,
  updatedAt: serverTimestamp(),
  ...(isUpdate ? {} : { createdAt: serverTimestamp() })
};

// Eliminar campos null explícitos que sobreescriben datos existentes en updates
if (isUpdate && finalData.triada === null) {
  delete finalData.triada;
}
```

Y en `FichaView.tsx`, asegúrate de que el estado se inicializa desde la fuente correcta:

```typescript
// Estado inicial — DEBE usar getTriadaFromFicha para el fallback on-read
const [triada, setTriada] = useState<TriadaComunitaria>(() =>
  getTriadaFromFicha(ficha) // lazy initializer: solo se ejecuta una vez
);

// Y al guardar, siempre pasar triada aunque esté vacía:
await saveFicha(userId, datosOnboarding, fichaId, true, triada);
// nunca: saveFicha(userId, datos, fichaId, true) — sin triada
```

***

## 1. Indicador offline con Firestore

### Comparativa de APIs disponibles

| API | Qué detecta | Latencia | Writes pendientes | Complejidad |
|---|---|---|---|---|
| `navigator.onLine` | Red del SO | Inmediata | ❌ No | Mínima |
| `onSnapshotsInSync` | Sincronización de lecturas | ~500ms lag | ❌ Solo lecturas | Media |
| `enableNetwork/disableNetwork` | Control manual de red | N/A | ❌ No expone count | Alta |
| `waitForPendingWrites` | Escribe pendientes | Por promesa | ⚠️ Binario | Media |
| `onSnapshotsInSync` + `navigator.onLine` | Combinado | ~500ms | ❌ Count no expuesto | Media |

**Conclusión: Firestore no expone un contador de writes pendientes mediante API pública.** `waitForPendingWrites()` solo te dice "hay algo pendiente" (promesa que resuelve cuando se vacía la cola), no cuántos. Para el indicador visual de Kanarii, el patrón correcto es combinar dos fuentes:

```typescript
// src/hooks/useFirestoreSync.ts
import { useEffect, useState, useRef } from 'react';
import { db } from '../lib/services/_core';
import { onSnapshotsInSync, waitForPendingWrites, enableNetwork, disableNetwork } from 'firebase/firestore';

type SyncStatus = 'online' | 'syncing' | 'offline' | 'pending_writes';

export function useFirestoreSync() {
  const [status, setStatus] = useState<SyncStatus>('online');
  const [pendingCount, setPendingCount] = useState(0); // contador manual
  const pendingRef = useRef(0);
  const isSyncedRef = useRef(true);

  useEffect(() => {
    // 1. Listener de sincronización de snapshots (lecturas)
    const unsubSync = onSnapshotsInSync(db, () => {
      isSyncedRef.current = true;
      if (navigator.onLine) {
        setStatus('online');
      }
    });

    // 2. Detectar estado de red del navegador
    const handleOnline = async () => {
      await enableNetwork(db);
      setStatus(pendingRef.current > 0 ? 'pending_writes' : 'online');
    };
    const handleOffline = () => {
      disableNetwork(db);
      setStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Estado inicial
    if (!navigator.onLine) setStatus('offline');

    return () => {
      unsubSync();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 3. Función para registrar writes — llamar desde saveFicha, etc.
  const trackWrite = async <T>(writePromise: Promise<T>): Promise<T> => {
    pendingRef.current += 1;
    setPendingCount(c => c + 1);
    setStatus('syncing');
    try {
      const result = await writePromise;
      return result;
    } finally {
      pendingRef.current -= 1;
      setPendingCount(c => c - 1);
      if (pendingRef.current === 0) {
        // waitForPendingWrites confirma que Firestore recibió todo
        await waitForPendingWrites(db);
        setStatus(navigator.onLine ? 'online' : 'offline');
      }
    }
  };

  return { status, pendingCount, trackWrite };
}
```

El componente visual es minimalista — siguiendo el estilo de Kanarii:

```tsx
// src/components/ui/SyncIndicator.tsx
import { useFirestoreSync } from '../../hooks/useFirestoreSync';
import { Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export function SyncIndicator() {
  const { status, pendingCount } = useFirestoreSync();

  const config = {
    online:        { icon: CheckCircle2, label: 'Sincronizado',   color: 'text-emerald-600', bg: 'bg-emerald-50' },
    syncing:       { icon: RefreshCw,    label: `Subiendo...`,     color: 'text-amber-600',   bg: 'bg-amber-50',  spin: true },
    pending_writes:{ icon: RefreshCw,    label: `${pendingCount} pendiente${pendingCount > 1 ? 's' : ''}`, color: 'text-amber-600', bg: 'bg-amber-50' },
    offline:       { icon: WifiOff,      label: 'Sin conexión',    color: 'text-rose-600',    bg: 'bg-rose-50' },
  }[status];

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${config.bg} ${config.color} transition-all duration-500`}>
      <Icon className={`w-3 h-3 ${'spin' in config && config.spin ? 'animate-spin' : ''}`} />
      {config.label}
    </div>
  );
}
```

**Dónde colocarlo**: en el `Sidebar.tsx` existente, debajo del selector de comunidad — mismo patrón visual que los badges de notificación actuales. 

**Trade-off importante**: `onSnapshotsInSync` dispara cuando *todos* los listeners activos han recibido su snapshot más reciente. Si tienes muchos listeners activos simultáneos (PropuestasView + Sidebar + FichaView abiertos a la vez), puede disparar con cierta latencia. No es un contador de writes — para eso necesitas el `trackWrite` manual.

***

## 2. PageHeader / PageContainer sin prop drilling

**Recomendación: composición simple con props explícitas**, no compound components ni Context. En una app con 10+ páginas ya construidas, el refactor de compound components es demasiado invasivo. La composición simple con `children` + props opcionales cubre el 95% de los casos con cero magia.

```tsx
// src/components/ui/PageContainer.tsx
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const maxWidthMap = {
  sm: 'max-w-2xl', md: 'max-w-4xl', lg: 'max-w-5xl',
  xl: 'max-w-7xl', full: 'max-w-full'
};

export function PageContainer({ children, className = '', maxWidth = 'lg' }: PageContainerProps) {
  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 ${className}`}>
      <div className={`${maxWidthMap[maxWidth]} mx-auto space-y-6`}>
        {children}
      </div>
    </div>
  );
}
```

```tsx
// src/components/ui/PageHeader.tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  actions?: React.ReactNode;   // botones, badges, toggles — composición libre
  breadcrumb?: { label: string; href?: string }[];
}

export function PageHeader({ title, subtitle, icon: Icon, actions, breadcrumb }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-1 mb-6">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1 text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
          {breadcrumb.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              <span className={crumb.href ? 'hover:text-stone-600 cursor-pointer' : ''}>
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-6 h-6 text-[#6B705C]" />}
          <div>
            <h1 className="font-serif text-2xl text-[#4A4E4D]">{title}</h1>
            {subtitle && <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
```

Uso en cualquier vista existente con refactor mínimo — solo envuelves el contenido actual:

```tsx
// PropuestasView.tsx — antes tenía su propio header inline
import { PageContainer, PageHeader } from '../components/ui';
import { Scale } from 'lucide-react';

export function PropuestasView() {
  return (
    <PageContainer>
      <PageHeader
        title="Propuestas"
        subtitle="Proceso de consentimiento S3"
        icon={Scale}
        breadcrumb={[{ label: 'Comunidad' }, { label: 'Propuestas' }]}
        actions={
          <>
            <SyncIndicator />
            <button onClick={handleCreate} className="...">Nueva propuesta</button>
          </>
        }
      />
      {/* resto del contenido sin cambios */}
    </PageContainer>
  );
}
```

**Por qué no compound components aquí**: los compound components (`<PageHeader.Title>`, `<PageHeader.Actions>`) añaden indirección y un Context interno que solo aporta valor cuando la jerarquía del componente es profunda y variable — como en `<Select>` o `<Tabs>`. Un `PageHeader` es un componente de presentación plano; las props explícitas son más legibles y el TypeScript las valida sin magia.

## Advertencia de rango

`disableNetwork(db)` en el `handleOffline` del hook es un arma de doble filo: desactiva activamente Firestore aunque el dispositivo recupere conexión intermitentemente. Si la red del usuario es inestable (lo habitual en una finca rural en Canarias), puede crear más problemas de los que resuelve. Una alternativa más conservadora es **omitir el `disableNetwork`** y dejar que Firestore gestione la reconexión solo — el SDK ya tiene lógica de retry exponencial integrada. Solo llama a `disableNetwork` si el usuario pulsa explícitamente un botón "trabajar offline".
