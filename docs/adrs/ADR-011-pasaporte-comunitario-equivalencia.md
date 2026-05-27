# ADR 011: Pasaporte Comunitario — Principio de Equivalencia en UI

**Estado:** Accepted  
**Fecha:** 2026-05-27  
**Contexto:** Kanarii  

## Contexto
El Pasaporte Comunitario es el perfil público de los miembros dentro del ecosistema Kanarii. Al diseñar la visualización de este perfil y la interacción social entre los miembros de una comunidad, surge la necesidad de definir si se deben incluir métricas cuantitativas, canales de comunicación directa y la estructura de los datos del perfil para alinearse con los principios de equidad y no-extracción.

Se evaluaron aspectos de diseño clave para evitar la gamificación y las dinámicas transaccionales o jerárquicas típicas de las redes sociales convencionales.

## Decisión
Se decide establecer las siguientes directrices de diseño para el Pasaporte Comunitario:
1. **Sin contadores numéricos públicos:** Queda prohibido mostrar contadores de reputación, karma, nivel de actividad, número de propuestas creadas, cantidad de comentarios o votos emitidos en el perfil público.
2. **Sin mensajes directos privados (DM):** No se integrará una mensajería privada directa entre usuarios dentro de Kanarii para evitar la fragmentación de la comunicación comunitaria y la creación de silos de información no transparentes.
3. **Tríada Comunitaria como estructura base:** El perfil público se estructurará fundamentalmente en torno a tres pilares descriptivos en formato libre:
   * **Ofrendas:** Qué ofrece el miembro a la comunidad (tiempo, herramientas, espacio, etc.).
   * **Saberes:** Conocimientos, experiencias o áreas en las que puede facilitar o apoyar.
   * **Necesidades:** Qué requiere el miembro del colectivo para sostener su presencia y bienestar.

### Razones de la decisión:
* **Principio de Equivalencia:** Eliminar métricas numéricas evita la comparación competitiva y jerarquías implícitas de "estatus social" o "poder" en la UI.
* **Transparencia Radical:** La ausencia de DMs privados incentiva que las conversaciones ocurran en los espacios designados para ello (hilos de propuestas, círculos de discusión), promoviendo la gobernanza transparente de Sociocracia 3.0.
* **Economía del Cuidado y Reciprocidad:** La Tríada Comunitaria (Ofrendas, Saberes, Necesidades) modela una relación basada en la vulnerabilidad compartida y el apoyo mutuo, en lugar de un catálogo mercantilista de servicios.

## Consecuencias

### Positivas (Pros)
* Fomenta una cultura comunitaria no competitiva y equitativa.
* Reduce el riesgo de dinámicas de exclusión o acoso mediante canales privados.
* Estructura los perfiles hacia la acción cooperativa directa basada en necesidades y ofrendas.

### Negativas (Cons)
* Dificulta que dos usuarios coordinen detalles logísticos muy específicos y personales en privado sin salir de la plataforma.

### Riesgos y Mitigaciones
* *Necesidad de coordinación privada legítima (ej. "te paso mi teléfono").*
  * *Mitigación:* Se permite a los usuarios compartir opcionalmente enlaces de contacto externos en su perfil (ej. email, Telegram, Matrix) para que la coordinación privada ocurra bajo la decisión soberana del miembro, fuera del entorno controlado de Kanarii.

## Referencias
* Discusión y diseño en [sprint-05-research.md](file:///home/romen/Proyectos/kanarii/docs/sprints/sprint-05-research.md)
