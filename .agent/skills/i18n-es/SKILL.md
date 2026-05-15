---
name: i18n-es
description: Gestiona la internacionalización de Kanarii para español como idioma principal, con soporte futuro para otros idiomas. Úsala cuando haya textos hardcodeados en componentes o cuando se quiera añadir soporte multiidioma.
---

# i18n Español (Internacionalización)

Esta habilidad permite organizar y gestionar los textos de Kanarii de forma profesional, asegurando que el español sea el idioma base pero permitiendo el crecimiento multiidioma del proyecto. Se enfoca en eliminar textos "hardcoded" de los componentes React para moverlos a archivos de traducción estructurados.

## Instrucciones

### 1. Detección de Textos
- Analiza los archivos en `src/` (especialmente componentes y páginas) buscando cadenas de texto literales en el JSX que deban ser traducidas.

### 2. Infraestructura i18n
- Verifica si ya existe una configuración de `i18next` o similar en el proyecto.
- Si no hay ninguna: Propón el uso de `react-i18next` por su excelente compatibilidad con React, Vite y TypeScript, y espera la aprobación antes de instalar.

### 3. Convención de Claves
Sigue estrictamente este patrón jerárquico para las claves de traducción:
- **Formato**: `modulo.elemento.variante`
- **Ejemplos**:
    - `auth.input.email_placeholder`
    - `tareas.boton.crear_nueva`
    - `errores.firebase.permiso_denegado`

### 4. Gestión del Idioma Base (Español)
- El español (`es`) es la referencia absoluta.
- **Contexto Canario**: Kanarii tiene sus raíces en Canarias. Ante la duda, prefiere términos cercanos y coloquiales (ej. "Gofio" en lugar de "Cereal" si aplica al contexto, o simplemente un tono más cercano y menos formal) sobre tecnicismos rígidos.
- Estructura los archivos JSON de forma que añadir un nuevo idioma (ej. `en.json`) sea solo cuestión de traducir los valores de las claves existentes.

### 5. Términos Protegidos
- **NO** traduzcas nombres propios del proyecto, nombres de comunidades específicas o términos de marca sin confirmación explícita del usuario.

## Output de la Skill
- Lista de archivos modificados.
- Resumen de nuevas claves añadidas al diccionario de español.
- Guía rápida de uso de la nueva clave en el componente (ej: `t('auth.titulo')`).

## Restricciones
- **Foco por Sesión**: No intentes internacionalizar toda la app de golpe. Limítate a un módulo o flujo por sesión para mantener los cambios controlados.
- **Primero el Español**: No añadas idiomas secundarios hasta que el español esté totalmente externalizado en el módulo en el que trabajas.
- **Tipado**: Asegúrate de que las claves tengan soporte de tipos en TypeScript si la configuración lo permite.

---

*Última actualización: 15 May 2026*
