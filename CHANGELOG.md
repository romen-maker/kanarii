# Changelog 🌿

Todos los cambios notables en este proyecto serán documentados en este archivo. El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Añadido
- **Sistema de Comunidades v2**: Soporte para multi-membership (`communityIds[]`), manifiestos y privacidad.
- **Onboarding y Seguridad**: Nuevo flujo de registro con Magic Link y AuthGateModal reutilizable.
- **Persistencia Cross-Device**: Guardado de datos del onboarding antes de la autenticación.
- **Infraestructura Open Source**: Adición de AGPL-3.0 LICENSE, CONTRIBUTING.md y CODE_OF_CONDUCT.md.
- **Pipeline de Análisis IA**: Generación de informes estructurados con Gemini (Mapa de Rangos, Sombras Relacionales).
- **Calendario Comunitario**: Integración con Firestore y vista de eventos real-time.
- **Tablón de Necesidades/Ofertas**: Sistema de posts con respuestas y gestión de estados.

### Cambiado
- Refactorización de `appService.ts` para soportar acceso dinámico por comunidad.
- Mejora de la UI de navegación móvil para paridad con escritorio.

---
*Última actualización: 15 May 2026*
