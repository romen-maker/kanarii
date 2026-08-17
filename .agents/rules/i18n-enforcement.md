# i18n & Localization Enforcement

> Garantizar la correcta internacionalización (ES/EN) de componentes e interfaces públicas consumiendo react-i18next de forma mantenible y respetando la frontera entre la UI fija y el contenido dinámico de miembros.

## Reglas Principales

### 1. Frontera entre UI Fija y Contenido de Miembros
- **UI Fija**: Títulos de secciones, navegación, botones, acciones rápidas, métricas, indicadores de estado y pantallas de carga → **SE TRADUCEN MEDIANTE EL NAMESPACE I18N APROPIADO**.
- **Contenido Dinámico de Miembros**: Nombres de usuarios, biografías, saberes, necesidades, ofrendas, títulos reales de propuestas/tareas, comentarios, nombres de círculos e interpretaciones/manuales de IA generados históricamente → **CONSERVAN SU IDIOMA ORIGINAL DE CREACIÓN**.
- **Excepciones permitidas en JSX**:
  - Marca `Kanarii`;
  - Símbolos e iconos visuales (ej. `<Wifi size={13} />`, `<Sparkles />`);
  - Valores técnicos no visibles (props de configuración, IDs, tokens de estilo);
  - Contenido dinámico real de usuario;
  - Texto temporal de prototipado que no vaya a integrarse en la aplicación.

### 2. Uso de Namespaces y Claves
- Inyectar el namespace apropiado en el componente: `useTranslation('welcome')` o `useTranslation('common')`.
- Consumir claves relativas al namespace cargado: `t('members.activeMember')`.
- Usar la sintaxis con prefijo sólo al consultar de forma cruzada otro namespace: `t('common:sync.online')`.

### 3. Plantillas Completas con Interpolación Nombrada
- **Prohibido concatenar fragmentos de `t()` o concatenar spans para formar oraciones**:
  - ❌ Incorrecto: `{user} + ' ' + t('activity.created') + ' ' + task`
  - ❌ Incorrecto: `<span>{t('created')}</span> <span>{task}</span>`
- **Obligatorio uso de plantillas completas con interpolación nombrada**:
  - ES: `"createdTask": "{{user}} creó la tarea \"{{task}}\" en {{circle}}"`
  - EN: `"createdTask": "{{user}} created the task \"{{task}}\" in {{circle}}"`
  - Código: `t('activity.createdTask', { user, task, circle })`

### 4. Pluralización y Formato Estándar
- Utilizar las claves de sufijo estándar de `i18next`: `key_one` y `key_other`, consumidas mediante `t('key', { count })`.
- Números, monedas, porcentajes y fechas en UI fija deben formatearse usando `Intl` o los helpers i18n locales existentes; no mediante composición manual de cadenas.

### 5. Coincidencia Simultánea de Claves (ES/EN)
- Al crear o modificar una clave i18n, se DEBE agregar simultáneamente en `src/locales/es/[namespace].json` y `src/locales/en/[namespace].json` respetando la misma estructura de objetos.

## Protocolo de Cierre Obligatorio para Tareas con UI

Antes de dar por concluida una tarea con interfaz o solicitar la aprobación de commit:
1. **Paridad**: Ejecutar `npx tsx scripts/check-i18n-keys.ts` y confirmar 0 errores.
2. **Checks Técnicos**: Superar `npx tsc --noEmit && npm run build && npm run lint`.
3. **Búsqueda Dirigida**: Ejecutar `rg` o `grep` de literales visibles en los componentes modificados y sus subcomponentes directos.
4. **Verificación Runtime**:
   - Probar el cambio de idioma ES ↔ EN desde el selector.
   - Realizar una recarga dura (F5 / Cmd+Shift+R) manteniendo `EN` seleccionado para verificar que el idioma persiste tras la re-hidratación de `kanarii.language` en `localStorage`.
   - Confirmar que no hay IDs técnicos visibles (`namespace.key`), que no hay mezclas de UI fija ES/EN, ni interpolaciones pegadas, y que el contenido de las personas conserva su idioma original.
5. **Revisión Responsive**: Comprobar la disposición visual en anchos estrechos (320 px, 375 px y 390 px) si la modificación afectó a navegación, botones, tarjetas, indicadores o textos de longitud variable.
6. **Seguridad Visual**: Cumplir además `.agents/rules/visual-confirm-before-commit.md`. La verificación i18n complementa, no sustituye, la confirmación visual requerida antes de commitear cambios en `src/`.
