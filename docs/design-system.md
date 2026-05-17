# Kanarii — Sistema de Diseño Visual

> **Para agentes de IA:** Lee este documento completo antes de crear
> o modificar cualquier componente visual. No improvises decisiones
> de diseño.

---

## Identidad y Tono

Kanarii es una herramienta para comunidades intencionales en entornos
rurales. El diseño debe transmitir:
- **Calidez orgánica** — no tecnología fría
- **Comunidad y tierra** — no startup ni SaaS
- **Claridad tranquila** — no urgencia ni gamificación

**Una prueba rápida:** Si el componente parece sacado de un dashboard
de métricas o de una app de productividad tech, está mal. Si parece
hecho con cariño para una comunidad real, está bien.

---

## Paleta de Colores

### Superficies

| Token | Hex | Uso |
|---|---|---|
| `bg-[#FDFBF7]` | `#FDFBF7` | Fondo de página principal |
| `bg-white` | `#FFFFFF` | Fondo de modales y tarjetas |
| `bg-[#F9F7F1]` | `#F9F7F1` | Superficie secundaria, hover suave |
| `bg-[#F9F7F1]/50` | `#F9F7F1` al 50% | Secciones internas de tarjetas |

### Bordes

| Token | Hex | Uso |
|---|---|---|
| `border-[#EAE2D6]` | `#EAE2D6` | Borde estándar de tarjetas |
| `border-[#EAE2D6]/40` | `#EAE2D6` al 40% | Borde suave, secciones internas |
| `border-stone-100` | Tailwind | Inputs y campos de formulario |
| `border-stone-200` | Tailwind | Dividers |

### Texto

| Token | Hex | Uso |
|---|---|---|
| `text-stone-800` | Tailwind | Títulos principales |
| `text-[#4A4E4D]` | `#4A4E4D` | Cuerpo de texto, prose |
| `text-[#8A817C]` | `#8A817C` | Texto secundario, labels |
| `text-stone-500` | Tailwind | Texto terciario, placeholders |
| `text-[#2D302F]` | `#2D302F` | Texto fuerte, strong |

### Acento Principal

| Token | Hex | Uso |
|---|---|---|
| `bg-[#A5A58D]` | `#A5A58D` | Botón primario (estado normal) |
| `bg-[#6B705C]` | `#6B705C` | Botón primario (hover) |
| `text-[#CB997E]` | `#CB997E` | Acento cálido, frases destacadas, focus rings |
| `text-[#6B705C]` | `#6B705C` | Acento oscuro, enlaces activos |

### Estados semánticos

| Estado | Clases | Uso |
|---|---|---|
| Éxito / activo | `bg-green-50 text-green-700 border-green-200` | Badges positivos |
| Error / rechazo | `bg-red-50/50 border border-red-100/50 text-red-500` | Bloques de rechazo |
| Advertencia | `bg-amber-50 text-amber-700` | Avisos no críticos |
| Neutro / pendiente | `bg-stone-100 text-stone-600` | Estados intermedios |

---

## Tipografía

### Fuentes cargadas (ya en `index.css`)

```css
family=Besley:ital,wght@0,400..900;1,400..900  /* Serif — títulos */
family=Outfit:wght@300;400;500;600             /* Sans — cuerpo */
```

### Reglas de uso

| Elemento | Fuente | Clase Tailwind |
|---|---|---|
| Títulos de página `h1` | Besley (serif) | `font-serif text-4xl md:text-5xl` |
| Subtítulos de sección | Besley o Outfit bold | `font-serif text-xl` |
| Cuerpo de texto | Outfit (sans) | predeterminado |
| Labels pequeños | Outfit bold | `text-xs font-bold uppercase tracking-widest` |
| Frases inspiradoras | Besley italic | `font-serif text-xl italic` |

### Nunca
- Tamaños inferiores a `text-xs` (10px)
- Más de 3 tamaños distintos en la misma vista
- Fuentes del sistema como primarias

---

## Componentes — Patrones Estándar

### Modal (referencia: `AdminSolicitudesView.tsx`)

```tsx
<motion.div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
  {/* Icono encabezado */}
  <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
    <AlertTriangle className="w-8 h-8" />
  </div>
  <h3 className="text-xl font-bold text-stone-800">Título del modal</h3>
  <p className="text-sm text-stone-500 leading-relaxed">Descripción...</p>
  <button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-2xl font-bold transition-all shadow-md">
    Confirmar acción
  </button>
  <button className="w-full py-2 text-[#8A817C] font-bold hover:bg-[#F9F7F1] rounded-xl transition-colors">
    Cancelar
  </button>
</motion.div>
```

### Tarjeta principal

```tsx
<div className="bg-white border border-[#EAE2D6] rounded-3xl p-6 shadow-sm space-y-4">
  {/* contenido */}
</div>
```

### Sección interna de tarjeta

```tsx
<div className="bg-[#F9F7F1]/50 border border-[#EAE2D6]/40 rounded-2xl p-4 space-y-3">
  {/* sección interna */}
</div>
```

### Input / Select / Textarea

```tsx
<input className="w-full bg-[#F9F7F1] border-2 border-stone-100 rounded-2xl px-4 py-3 text-sm text-stone-700 focus:border-[#CB997E] focus:ring-0 transition-all outline-none" />
```

### Botón primario

```tsx
<button className="bg-[#A5A58D] hover:bg-[#6B705C] text-white transition-colors py-3 px-6 rounded-xl font-medium">
  Acción principal
</button>
```

### Label de sección

```tsx
<div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">
  Nombre de sección
</div>
```

### Badge de estado

```tsx
{/* Activo */}
<span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">Activo</span>

{/* Pendiente */}
<span className="text-xs font-bold bg-stone-100 text-stone-600 px-2 py-1 rounded-full">Pendiente</span>
```

---

## Radios de borde

| Elemento | Radio |
|---|---|
| Modales | `rounded-3xl` |
| Tarjetas principales | `rounded-3xl` |
| Secciones internas | `rounded-2xl` |
| Inputs, selects, textareas | `rounded-2xl` |
| Botones | `rounded-xl` |
| Badges y chips | `rounded-full` |
| Avatares | `rounded-full` |

**Regla:** El radio disminuye con la jerarquía.

---

## Sombras

| Uso | Clase |
|---|---|
| Modales | `shadow-2xl` |
| Tarjetas | `shadow-sm` |
| Tarjetas en hover | `shadow-md` |
| Botones primarios | `shadow-md` |
| Elementos flotantes | `shadow-lg` |

Siempre cálidas — nunca sombras de color.

---

## Animaciones (Framer Motion)

```tsx
// Modal estándar
initial={{ scale: 0.9, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
exit={{ scale: 0.9, opacity: 0 }}

// Elemento de lista
initial={{ opacity: 0, y: 10 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.2 }}
```

- Duración: 150–250ms
- Siempre `AnimatePresence` para entradas/salidas
- Discretas, nunca llamativas

---

## Lo que NUNCA hacemos

- ❌ **Glassmorphism** — `backdrop-filter: blur`, fondos translúcidos
- ❌ **Gradientes en botones** — `bg-gradient-to-r from-... to-...`
- ❌ **Bordes laterales de color en tarjetas** — `border-l-4 border-blue-500`
- ❌ **Colores neón o eléctricos** — azules brillantes, verdes fluorescentes
- ❌ **Sombras de color** — `shadow-blue-200`, `shadow-purple-300`
- ❌ **Gradientes de fondo decorativos** — blobs, orbes, meshes
- ❌ **Texto centrado por defecto** — solo heroes y modales de confirmación
- ❌ **Íconos en círculos de color** — patrón SaaS genérico
- ❌ **Más de 2 colores de acento por viewport**
- ❌ **Emojis como íconos de UI** — usar Lucide React

### Frases de alerta roja
Si alguien propone algo descrito como *"premium glassmorphism"*,
*"colores HSL balanceados"*, *"micro-animaciones espectaculares"*
o *"experiencia inmersiva"* → rechazar y consultar este documento.

---

## Iconografía

- **Librería:** Lucide React (instalada)
- **Tamaño UI:** `w-5 h-5` | **Tamaño modal:** `w-8 h-8`
- **Color:** `currentColor` o `text-stone-500`
- **Nunca:** SVGs decorativos custom, emojis como íconos

---

## Checklist antes de crear un componente

- [ ] ¿Fondo es `#FDFBF7` (página) o `white` (modal/tarjeta)?
- [ ] ¿Bordes usan `#EAE2D6` o `stone-*`?
- [ ] ¿Radio sigue jerarquía `rounded-3xl → rounded-2xl → rounded-xl`?
- [ ] ¿Inputs tienen `focus:border-[#CB997E]`?
- [ ] ¿Botón primario es `bg-[#A5A58D] hover:bg-[#6B705C]`?
- [ ] ¿Hay glassmorphism, gradiente o borde lateral de color? → Eliminar
- [ ] ¿Tipografía usa Besley (títulos) y Outfit (cuerpo)?
- [ ] ¿Animaciones son discretas (150–250ms)?
