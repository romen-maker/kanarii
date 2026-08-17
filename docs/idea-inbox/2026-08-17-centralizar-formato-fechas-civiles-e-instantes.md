# Idea: Centralizar el formato de fechas civiles e instantes

- **Fecha de captura**: 2026-08-17
- **Origen**: Derivado del refinamiento de internacionalización de `FichaView` (T-131)
- **Estado**: Capturada / Backlog futuro (Pospuesto explícitamente fuera del Sprint 26)

---

## Contexto
En Kanarii, campos como `fechaNacimiento`, `fechaLlegada` y `fechaSalida` se recogen y persisten como strings en formato `YYYY-MM-DD` procedentes de componentes HTML `<input type="date">`. Estos valores representan **fechas civiles** (un día natural sin hora ni zona horaria asociada). Por otro lado, campos como `updatedAt` o `creadoEn` son **timestamps de Firestore** que representan un instante temporal absoluto.

Actualmente, distintas pantallas y vistas aplican parseos/formateos locales ad-hoc (como `new Date(string)` o `toLocaleDateString()`).

## Riesgo
La evaluación directa de cadenas `YYYY-MM-DD` mediante `new Date('YYYY-MM-DD')` en JavaScript interpreta la cadena en UTC a medianoche. Al ejecutarse en clientes con zonas horarias locales al oeste de UTC (como América o Canarias en ciertas épocas), la conversión a hora local puede desplazar la fecha mostrada un día atrás.

## Propuesta futura
Crear un módulo utilitario centralizado de formateo de fechas con APIs explícitas y diferenciadas por semántica:

1. `formatCivilDate(value: string | undefined, locale: string, options?: Intl.DateTimeFormatOptions)`: Parseador descompuesto por partes numéricas `[year, month, day]` que formatea el día civil exacto sin conversión de zona horaria local.
2. `formatInstantDate(value: Timestamp | Date | number, locale: string, options?: Intl.DateTimeFormatOptions)`: Formateador para timestamps absolutos de Firestore o marcas de tiempo.

## Alcance futuro
- Auditar Onboarding, editor de Ficha, vistas privadas, Pasaporte público y componentes de actas/acuerdos.
- Auditar objetos `Timestamp` de Firestore.
- Definir formatos explícitos por locale (`es-ES` / `en-US`).
- Añadir tests unitarios de timezone para verificar la renderización correcta en distintas zonas horarias.

> ⚠️ **Nota de alcance**: Esta mejora transversal NO debe modificarse durante T-131 ni durante el Sprint 26 para no alterar la lógica existente durante la campaña de internacionalización.
