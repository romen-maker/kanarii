# Auditoría de Textos e Internacionalización ES/EN (Campaña Fundraising)

> **Sprint**: Sprint 26 — T-116  
> **Objetivo**: Mapeo completo de superficies públicas para i18n con `react-i18next`.

---

## 1. Superficies Públicas Auditadas

| Ruta | Componentes clave | Dominio / Namespace |
|---|---|---|
| `/`, `/orientacion`, `/welcome` | `Welcome.tsx`, `Header.tsx`, `Sidebar.tsx`, `BottomNav.tsx` | `welcome`, `common` |
| `/contexto` | `ContextConsent.tsx` | `welcome`, `common` |
| `/tour` | `KanariiTourPage.tsx` | `welcome`, `common` |
| Auth Modal / Callback | `AuthModal.tsx`, `AuthCallbackPage.tsx` | `auth`, `common` |
| `/c/:slug` | `FichaComunidadView.tsx` | `communities`, `common` |
| `/p/:uid` | `PasaporteUniversalView.tsx`, `PasaporteVisual.tsx` | `passport`, `common` |

---

## 2. Definición de Namespaces

### A. `common` (`src/locales/{es,en}/common.json`)
- Botones universales: Guardar, Cancelar, Entrar, Registrarse, Cerrar sesión, Volver.
- Navegación principal: Orientación, Comunidades, Soberanía, Pasaporte, Ayuda.
- Selector de idioma: Español, English.
- Mensajes de estado, feedback y toast genéricos.

### B. `welcome` (`src/locales/{es,en}/welcome.json`)
- Banner de bienvenida e introducción a Kanarii.
- Secciones del Panel de Orientación ("Quién soy", "Quién está", "Nodos existentes").
- Copys explicativos del Tour y Consentimiento de contexto.
- Propuesta de valor de Kanarii en inglés claro y humano (sin jerga técnica incomprensible).

### C. `auth` (`src/locales/{es,en}/auth.json`)
- Modal de acceso (Magic Link, Google Auth).
- Formulario de inicio de sesión y registro exprés.
- Mensajes de confirmación, errores de autenticación y callback.

### D. `communities` (`src/locales/{es,en}/communities.json`)
- Tarjetas de comunidades/nodos públicos.
- Etiquetas de Tipo, Ubicación, Propósito, Cuidadores y Necesidades del espacio.
- CTAs para solicitar acceso o unirse.

### E. `passport` (`src/locales/{es,en}/passport.json`)
- Etiquetas del Pasaporte Comunitario y Universal.
- Secciones de la Tríada Comunitaria: Ofrendas / Saberes / Necesidades.
- Redes sociales, contacto rápido y badges sociales.

---

## 3. Principio de No Traducción Automática
- Los nombres propios de comunidades, bios redactadas por miembros, títulos de proyectos/propuestas y mensajes de usuario **no se traducen automáticamente**. Permanecen en su idioma original.
