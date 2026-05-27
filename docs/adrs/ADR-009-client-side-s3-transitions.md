# ADR 009: Client-side vs Cloud Functions para transiciones S3

**Estado:** Accepted  
**Fecha:** 2026-05-27  
**Contexto:** Kanarii  

## Contexto
En Sociocracia 3.0 (S3), el proceso de consentimiento requiere transiciones de estado formales para las propuestas (ej. `abierta -> en_objeciones -> acordada`). Para implementar estas transiciones de manera robusta tras la votación o respuesta de un miembro de la comunidad, se evaluaron dos alternativas arquitectónicas:
1. **Cloud Functions (Server-side):** Ejecutar las transiciones mediante triggers en la base de datos de Firestore tras cada escritura de una respuesta.
2. **Client-side en `registerPropuestaResponse`:** Realizar los cálculos y el cambio de estado en el cliente utilizando lotes atómicos (`writeBatch`) que garantizan la consistencia.

## Decisión
Se decide implementar la lógica de transiciones de estado de las propuestas **en el lado del cliente (Client-side)** dentro de la función `registerPropuestaResponse` en `propuestas.ts`. 

La transición de estado se calcula en memoria del cliente basándose en las respuestas recibidas y se ejecuta en un lote atómico (`writeBatch`) junto con la inserción de la respuesta propiamente dicha.

### Razones de la decisión:
* **Consistencia garantizada por Firestore:** La atomicidad del `writeBatch` asegura que si la transacción falla, no se escribe la respuesta ni se modifica el estado de la propuesta, evitando estados inconsistentes.
* **Offline-first & Resiliencia:** Facilita la sincronización local offline nativa de Firestore sin depender de conectividad intermedia con Cloud Functions.
* **Costes de infraestructura:** Cero coste adicional de computación (Firebase Blaze plan) en la etapa de MVP.
* **Complejidad reducida:** Evita el over-engineering asociado al despliegue, mantenimiento y versionado de Cloud Functions para lógica de negocio síncrona simple.

### Cuándo revisitar esta decisión:
Esta decisión deberá ser reevaluada si en el futuro se implementan:
1. Notificaciones push que deban dispararse de forma asíncrona ante cambios de estado.
2. Lógica que deba ejecutarse de manera desatendida (ej. caducidad automática de propuestas por tiempo mediante un cron o triggers de fecha).

## Consecuencias

### Positivas (Pros)
* Menor latencia percibida por el usuario (UI fluida e inmediata sin esperar a la invocación del backend).
* Mayor facilidad de testeo local (no requiere emuladores de functions o despliegues).
* Reducción a cero del consumo de recursos serverless.

### Negativas (Cons)
* El código del cliente asume mayor responsabilidad de las reglas de gobernanza del negocio.

### Riesgos y Mitigaciones
* Que clientes maliciosos o con código desactualizado corrompan las transiciones de estado de forma inconsistente.
  * *Mitigación:* En fases posteriores al MVP, se pueden añadir reglas de seguridad de Firestore (`firestore.rules`) más estrictas que validen las transiciones de estados permitidas en las propuestas.

## Referencias
* Discusión y diseño en [sprint-05-research.md](file:///home/romen/Proyectos/kanarii/docs/sprints/sprint-05-research.md)
* Archivo de cambios: [propuestas.ts](file:///home/romen/Proyectos/kanarii/src/lib/services/propuestas.ts)
