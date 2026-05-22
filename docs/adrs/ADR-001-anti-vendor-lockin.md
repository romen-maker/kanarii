# ADR 001: Anti vendor lock-in para IA y memoria colectiva

**Estado:** Accepted  
**Fecha:** 2026-05-22  
**Contexto:** Kanarii

## Contexto
Kanarii integra funciones de IA, memoria colectiva y análisis relacional. Estas capacidades pueden crecer rápido y quedar acopladas a proveedores concretos si no se decide una estrategia desde temprano. El proyecto necesita mantener soberanía tecnológica suficiente para migrar componentes sensibles sin reescribir toda la aplicación.

## Decisión
Se adopta una estrategia explícita anti vendor lock-in para las capas de IA, embeddings y memoria colectiva. El MVP puede usar servicios gestionados de Google/Firebase por velocidad, pero toda integración nueva debe diseñarse con fronteras de sustitución claras.

### Componentes Clave
1. Encapsular llamadas a IA en servicios propios.
2. Separar el modelo de dominio del proveedor de embeddings o LLM.
3. Evitar que la lógica de negocio dependa de SDKs específicos.
4. Documentar decisiones irreversibles mediante ADRs.

## Consecuencias

### Positivas (Pros)
* Reduce el coste futuro de migrar a una pila más soberana.
* Protege el aprendizaje del proyecto frente a cambios de precio o política del proveedor.
* Obliga a mantener límites de arquitectura más sanos.

### Negativas (Cons)
* Introduce algo más de complejidad y disciplina desde el principio.
* Puede ralentizar decisiones rápidas si se intenta abstraer demasiado pronto.

### Riesgos y Mitigaciones
* Riesgo: sobre-ingeniería prematura. -> Mitigación: abstraer solo puntos con probabilidad real de cambio.
* Riesgo: falsa sensación de portabilidad. -> Mitigación: revisar periódicamente qué capas siguen acopladas.

## Referencias
* roadmap.md histórico
* discusión de diseño interno sobre soberanía tecnológica
