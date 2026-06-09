# ADR 020: Unificación de Superficies de Perfil y Manual de Usuario Humano

**Estado:** Accepted
**Fecha:** 2026-06-08
**Contexto:** Kanarii

## Contexto
Actualmente conviven dos modelos de almacenamiento y visualización del Manual de Usuario Humano en Kanarii:
1. **Modelo Nuevo (Modular/Lazy)**: Introducido en T-060, guarda la narrativa estructurada de cada sección en `/fichas/{uid}` bajo `resumenManual.secciones.{seccionId}.narrativa`. Se utiliza en "Mi Ficha" (`FichaView.tsx`).
2. **Modelo Legacy (Monolítico)**: Guarda el manual completo como una única cadena Markdown en `manualGenerado` dentro de la ficha. Se utiliza en el "Expediente Comunitario" (`AdminPanelModals.tsx`) visto por los administradores.

Esto introduce dos problemas críticos:
* **Pérdida de visibilidad del administrador**: Los nuevos usuarios que generen su manual en el nuevo sistema no guardan datos en `manualGenerado`. Al abrir su expediente desde el panel de administración, el admin ve "Sin manual generado", rompiendo el flujo de integración comunitaria.
* **Duplicación de lógica y UI**: "Mi Ficha" y el "Expediente Comunitario" implementan componentes de pestañas y estilos visuales separados para mostrar el mismo contenido.

## Decisión
Proponemos unificar la visualización de los perfiles y manuales mediante un componente compartido de visor híbrido.

### Componentes Clave
1. **Componente Compartido `<ManualSeccionesViewer>`**: Un visor de manual unificado en React que reciba las secciones en formato modular (clave-valor de narrativa) y renderice las pestañas e interfaz de navegación.
2. **Estrategia de Fallback Híbrido**: El visor buscará primero el objeto `resumenManual.secciones`. Si está ausente o incompleto pero existe `manualGenerado`, aplicará internamente un parseador basado en expresiones regulares para separar el texto monolítico legacy en las 5 secciones, garantizando total compatibilidad hacia atrás.
3. **Refactorización de Vistas**: Sustituir la lógica de visualización de manuales tanto en `FichaView.tsx` como en `AdminPanelModals.tsx` por el nuevo componente `<ManualSeccionesViewer>`.
4. **Sincronización del Pasaporte Comunitario y Configuración de Privacidad**:
   * Se crea la colección `/pasaportes/{uid}` pública para todos los miembros, que sirve como pasaporte social/landing del perfil.
   * El cliente sincroniza la ficha con el pasaporte público aplicando los filtros de privacidad seleccionados mediante `sincronizarPasaporte()`.
   * **Ruta de migración**: En producción se reemplazará la sincronización en cliente por una Google Cloud Function gatillada en Firestore (`onCreate`/`onUpdate` de `/fichas/{uid}`) para forzar la privacidad en backend de manera determinista e inviolable.

## Consecuencias

### Positivas (Pros)
* **Garantía de visibilidad**: Los administradores podrán ver el manual tanto de los miembros antiguos (legacy) como de los miembros nuevos (modulares) sin interrupción.
* **DRY (Don't Repeat Yourself)**: Eliminación de la duplicidad de estilos de pestañas, iconos y lógica de parseo entre la ficha del miembro y el modal del admin.
* **Consistencia de UX**: El miembro y el administrador verán el manual con el mismo diseño, formato y fuentes tipográficas.

### Negativas (Cons)
* **Deuda de transiciones**: Se mantiene la lógica del parser por expresiones regulares dentro del visor híbrido de forma temporal para soportar datos heredados.

### Riesgos y Mitigaciones
* **Inconsistencias al parsear manuales legacy**: Medio -> El parser actual de `ManualViewer` ya está testeado en producción. Al encapsularlo como fallback en el componente compartido, conservamos exactamente el comportamiento existente.

## Referencias
* Auditoría de Superficies de Perfil en `docs/idea-inbox/2026-06-08.md`.
* Tarea T-060 sobre refactorización del manual.
