---
name: feature-ux-kanarii
description: Traduce una necesidad de vida comunitaria a flujo de pantallas, estados y componentes React concretos. Úsala cuando el usuario quiera diseñar o planificar cómo implementar una feature nueva de Kanarii antes de tocar código.
---

# Feature UX Kanarii (Diseño de Producto)

Esta habilidad permite traducir una necesidad humana o comunitaria en una propuesta técnica y de diseño concreta para Kanarii. Su objetivo es asegurar que cada funcionalidad resuelva un problema real antes de empezar a escribir código, manteniendo la coherencia con el stack y la arquitectura del proyecto.

## Instrucciones

### 1. Entendimiento Humano
Antes de diseñar, define el contexto:
- **Necesidad**: ¿Qué problema real tiene la persona usuaria?
- **Momento**: ¿En qué situación se encuentra cuando necesita esta función?
- **Propósito**: ¿Cuál es el éxito para el usuario al terminar de usarla?

### 2. Mapeo de Actores
Identifica los roles involucrados:
- **Creador**: ¿Quién genera la información o la acción?
- **Consumidor**: ¿Quién recibe o visualiza el resultado?
- **Aprobador**: ¿Existe algún proceso de validación o permiso necesario?

### 3. Flujo de Pantallas y Estados
Define el MVP (Máximo 3 pantallas):
- **Secuencia**: Paso a paso de lo que ve el usuario.
- **Acciones**: Botones y gestos disponibles en cada paso.
- **Estados**: Define cómo se ve la pantalla cuando está:
    - Vacía (Empty state).
    - Cargando (Loading).
    - Con datos (Full).
    - Con error.

### 4. Componentes y Reutilización
Consulta `src/components/` para identificar qué piezas ya existen que puedan servir para esta feature.
- Lista los componentes a reutilizar.
- Describe los componentes nuevos que sean estrictamente necesarios.

### 5. Modelo de Datos (Firestore)
Define la estructura necesaria:
- **Colección**: ¿Dónde se guardan los datos?
- **Campos**: Lista de campos necesarios justificando su uso.
- **Relaciones**: ¿Cómo se vincula con usuarios o comunidades existentes?

### 6. Entrega (Artefacto)
Genera siempre un documento con:
- **Flujo de Pantallas**: Descripción del recorrido.
- **Componentes**: Estrategia de construcción (reutilizar vs crear).
- **Firestore**: Cambios en el modelo de datos.
- **Criterios de Aceptación**: Cómo sabemos que la feature funciona.
- **Fuera de MVP**: Lo que es buena idea pero se queda para después.

## Restricciones
- **No escribir código**: Esta skill es para diseño y planificación.
- **Máximo 3 pantallas**: Mantén el enfoque en el MVP.
- **Roles y Permisos**: Si la funcionalidad requiere niveles de acceso, señálalo explícitamente al inicio.
- **Justificación Firestore**: No propongas añadir campos "por si acaso"; cada campo debe tener un uso en el flujo diseñado.

---

*Última actualización: 15 May 2026*
