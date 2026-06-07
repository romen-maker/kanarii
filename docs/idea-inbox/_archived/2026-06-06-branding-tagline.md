# Idea: Definir tagline oficial de Kanarii y actualizar copy de bienvenida

- **Idea:** Elegir un tagline corto que acompañe la marca "Kanarii" en la interfaz de bienvenida, el `<title>` del `index.html` y posiblemente el manifest. El nombre limpio ya está establecido como "Kanarii". El subtítulo amazigh "Tawāzawazt" ha quedado descartado.
- **Impacto estimado:** Bajo (1-2 archivos, copy solamente)
- **Contexto:** Durante el sprint-12 se decidió simplificar el nombre a "Kanarii" en el manifest. Quedan dos candidatos evaluados:
  - **"Tu microsistema vital"** — tono aspiracional/personal, conecta con el lenguaje de Proceso y soberanía individual que ya usa la comunidad de Arteara.
  - **"Ecosistemas de soberanía"** — tono descriptivo/técnico, explica mejor qué es la plataforma a nuevos visitantes.
- **Archivos afectados:**
  - `index.html` → `<title>Kanarii — [tagline]</title>`
  - `src/pages/WelcomeHeroSection.tsx` (o equivalente) → copy de bienvenida
  - Opcionalmente: `public/manifest.json` generado por vite-plugin-pwa (campo `description`)
- **Capturado:** 2026-06-06
- **Nota para sprint planning:** Tarea S, puramente de copy. No requiere research. Resolver antes de cualquier campaña de difusión externa o cuando el Pasaporte Comunitario (T-052) esté listo, ya que ese es el primer punto de contacto externo real.
