# ADR 007: Modularización de appService por dominio

**Estado:** Accepted  
**Fecha:** 2026-05-26  
**Contexto:** Kanarii Frontend - Acceso a Datos  

## Contexto
El archivo `src/lib/appService.ts` funcionaba como un monolito que centralizaba todas las operaciones CRUD y suscripciones en tiempo real a Firestore, superando las 2000 líneas. Esto generaba problemas:
* **Mantenibilidad:** Dificultad para localizar lógica y revisar diffs de código.
* **Sobrecarga de agentes:** Alto consumo de tokens para leer y escribir en un solo archivo gigante durante tareas concurrentes.
* **Riesgo de regresiones:** Conflictos de Git frecuentes debido a ediciones en paralelo por distintas tareas que tocan el mismo archivo core.

## Decisión
Descomponer el archivo `src/lib/appService.ts` en submódulos especializados dentro del directorio `src/lib/services/`.

### Componentes Clave
1. **Directorio `src/lib/services/`**: Carpeta contenedora de todos los submódulos.
2. **Submódulo `_core.ts`**: Centraliza el cliente de Firebase (`db`), referencias a colecciones (`colRef`), queries comunes y helpers de Firestore (`arrayUnion`, `onSnapshot`). Evita duplicación de inicializaciones de base de datos.
3. **Submódulo `_types.ts`**: Centraliza todas las interfaces y tipos de entidades del backend de Kanarii.
4. **Submódulos de Dominio (`users.ts`, `comunidades.ts`, `members.ts`, etc.)**: Contienen las funciones CRUD puras ordenadas según la prioridad de dependencias de negocio para minimizar dependencias cruzadas.
5. **Barrel `index.ts`**: Re-exporta todos los submódulos de dominio.
6. **Barrel compatible `src/lib/appService.ts`**: Reemplazado por un export completo (`export * from './services';`) garantizando compatibilidad total hacia atrás con el resto de la app React sin alterar sus imports.

## Consecuencias

### Positivas (Pros)
* **Alta Cohesión y Bajo Acoplamiento:** Cada dominio (tareas, usuarios, comunidades, etc.) tiene su propio ciclo de vida y archivo de servicio específico.
* **Optimización de Contexto de IA:** Permite a los agentes IA leer/modificar archivos pequeños (< 300 líneas) consumiendo menos tokens y reduciendo errores drásticamente.
* **Menor fricción en Git:** Paralelización real en ramas sin colisiones en el core de datos.

### Negativas (Cons)
* **Gestión de Dependencias Circulares:** Al estar fragmentado, un import incorrecto puede causar dependencias cíclicas. Se debe mitigar importando siempre tipos de `_types.ts` y métodos core de `_core.ts`.
* **Mayor dispersión de archivos:** Aumenta la cantidad de archivos físicos en el editor.

### Riesgos y Mitigaciones
* **Dependencias circulares**: *Severidad Media* -> Mitigado forzando que los submódulos importen únicamente de `_core.ts`, `_types.ts` y `error-handler.ts`, y nunca directamente entre sí (excepto si hay casos excepcionales no eludibles).

## Referencias
* Refactor de appService en Sprint 04 (Tarea T-016)
