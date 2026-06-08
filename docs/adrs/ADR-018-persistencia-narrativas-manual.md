# ADR-018: Persistencia de narrativas del Manual Galáctico (Capa 2)

## Estado
🟡 Decisión aplazada — revisar cuando Firestore supere el 60% del plan gratuito

## Contexto
Las narrativas de sección (Capa 2) del Manual Galáctico se generan con Gemini
y actualmente se persisten en Firestore bajo
`fichas/{uid}.resumenManual.secciones.{key}.narrativa`.

Esto mejora la UX (no se regenera al recargar) pero tiene un coste de
almacenamiento que crece linealmente con el número de miembros activos.

Estimación: ~3.000 caracteres × 5 secciones × N fichas ≈ 15 KB por miembro.
Con 1 GiB gratuito → margen para ~70.000 fichas completas antes de saturar.

## Decisión actual
Mantener la persistencia en Firestore mientras el plan gratuito sea sostenible.
La experiencia de usuario tiene prioridad sobre la optimización prematura de costes.

## Alternativa a evaluar cuando se alcance masa crítica
Mover las narrativas fuera de Firestore:
- **sessionStorage**: caché temporal de sesión, coste cero, UX degradada
  (se regenera al volver a entrar).
- **Firebase Storage**: almacenamiento externo de blobs, coste ~$0.026/GB/mes.
- **PDF descargable (T-061)**: el usuario asume la persistencia en local.

## Trigger para revisitar
- Firestore supera el 60% del plan gratuito (monitorizar en Firebase Console), O
- Se incorporan más de 500 miembros activos con fichas completas.

## Referencias
- T-060: refactor generarManual en capas lazy
- T-061: PDF descargable del manual
