# Kanarii 🌿
### Inteligencia Colectiva para Comunidades Conscientes

Kanarii es un sistema de gestión comunitaria diseñado para elevar la armonía y la eficiencia en grupos humanos. Combina herramientas operativas (Tareas, Proyectos, Actas) con una capa de inteligencia profunda basada en Human Design y Astrología para optimizar la colaboración.

---

## ✨ Características Principales

### 🧠 Inteligencia Colectiva (IA)
- **Manual Galáctico Personalizado**: Generación de guías de autoconocimiento basadas en la carta natal y el diseño humano del miembro.
- **Análisis de Cruce Estructurado**: Pipeline avanzado de IA que analiza la sinergia entre miembros, detectando canales electromagnéticos, mapas de rango sociocrático y sombras relacionales.
- **Onboarding Guiado**: Proceso fluido de entrada para nuevos miembros con geocodificación automática.

### 🏗️ Gestión Comunitaria
- **Dashboard Kanban**: Gestión visual de tareas e iniciativas (proyectos) con cálculo automático de progreso.
- **Actas Sociocráticas**: Registro de reuniones con flujo integrado para la creación de tareas desde acuerdos.
- **Panel Administrativo**: Control total sobre la base de datos de miembros, roles y manuales generados.

### 🛡️ Arquitectura DRY & Robusta
- **Single Source of Truth**: Acceso centralizado a datos mediante `appService.ts`.
- **Hooks de Acción**: Mutaciones de estado seguras con sistema de *Undo/Redo* y feedback visual inmediato (Toasts).
- **Escalabilidad**: Diseñado para soportar múltiples espacios y comunidades independientes.

---

## 🛠️ Stack Tecnológico

- **Core**: React 18 + TypeScript.
- **Backend**: Firebase (Auth, Firestore).
- **IA**: Google Gemini Pro (1.5 & 2.0 Flash) con fallbacks automáticos.
- **UI/UX**: Tailwind CSS + Lucide Icons + Framer Motion.
- **Arquitectura**: Clean Architecture con separación estricta entre capas de datos y presentación.

---

## 🚀 Instalación y Desarrollo Local

**Requisitos previos:** Node.js (v18+) y una cuenta de Firebase.

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/kanarii.git
   cd kanarii
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configuración de Entorno:**
   Crea un archivo `.env.local` en la raíz con las siguientes claves:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

---

## 🗺️ Roadmap de Desarrollo

Puedes consultar el estado actual del proyecto y las próximas funcionalidades en [roadmap.md](./roadmap.md).

---

## 🤝 Contribución

Este es un proyecto enfocado en comunidades. Si quieres colaborar, por favor revisa nuestras reglas de arquitectura en `AGENT_ONBOARDING.md` para mantener la consistencia del código.

---

<div align="center">
  <p>Desarrollado con ❤️ para comunidades en evolución.</p>
</div>
