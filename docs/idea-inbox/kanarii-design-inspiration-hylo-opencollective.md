# Kanarii — Documento de InspiraciÃ³n de DiseÃ±o

> PropÃ³sito: capturar quÃ© coger de Hylo y Open Collective para Kanarii sin copiar, y cÃ³mo mapearlo a mÃ³dulos existentes.

---

## 1. Hylo: gobernanza participativa y transparencia

### QuÃ© es
Plataforma de organizaciÃ³n comunitaria con foco en gobernanza participativa, privacidad y transparencia. Su filosofÃ¬a estÃ¡ alineada con soberanÃ¬a tecnolÃ³gica y participaciÃ³n. [cite:267]

### Principios Ãtiles para Kanarii

- **Gobernanza participativa**: la comunidad tiene voz formal en decisiones de plataforma. [cite:267]
- **Transparencia de operaciones**: mostrar cÃ³mo se toman decisiones y cÃ³mo fluye la informaciÃ³n.
- **Interoperabilidad**: no vender datos, usar estÃ¡ndares abiertos.

### CÃ³mo mapearlo a Kanarii

| Idea de Hylo | MÃ³dulo Kanarii | ImplementaciÃ³n sugerida |
|---|---|---|
| Gobernanza participativa | CÃ¬rculos, roles, acuerdos | Hacer visible en UI quiÃ©n tiene quÃ© rol y cÃ³mo se toman decisiones |
| Transparencia de operaciones | AuditorÃ¬a, logs | Mostrar trazas de auditorÃ¬a en vistas de admin y comunidad |
| Interoperabilidad | Multicanal (web, Telegram, MCP) | DiseÃ±ar APIs abiertas para que otras herramientas se conecten |

---

## 2. Open Collective: finanzas transparentes y gastos

### QuÃ© es
Plataforma de financiaciÃ³n transparente para proyectos y comunidades. Sirve para recibir donaciones, gestionar gastos, pagar contribuidores y mostrar finanzas pÃºblicas. [cite:261][cite:273]

### Principios Ãtiles para Kanarii

- **Finanzas pÃºblicas**: cada ingreso y gasto visible. [cite:273][cite:280]
- **Flujo de gastos â aprobaciÃ³n â pago**: trazabilidad completa. [cite:273]
- **Fiscal hosting**: interfaz legal/financiera para proyectos sin entidad propia. [cite:278][cite:284]

### CÃ³mo mapearlo a Kanarii

| Idea de Open Collective | MÃ³dulo Kanarii | ImplementaciÃ³n sugerida |
|---|---|---|
| Finanzas pÃºblicas | Excedentes, fondos comunes | Mostrar balances y flujos en vistas de comunidad |
| Gastos â aprobaciÃ³n â pago | Acuerdos, marketplace | AÃ±adir estado de gasto y aprobaciÃ³n en acuerdos |
| Fiscal hosting | Kanarii como infraestructura | Permitir que comunidades usen Kanarii como host fiscal si es necesario |

---

## 3. QuÃ© no estamos replicando

- No somos âotro Hyloâ��: Kanarii es mÃ¡s sistema operativo comunitario (gobernanza + mercado + multicanal).
- No somos âotro Open Collectiveâ��: Kanarii integra finanzas en un contexto mÃ¡s amplio de gobernanza y mutualidad.

---

## 4. Siguientes pasos

1. **DiseÃ±ar mÃ³dulo de finanzas** inspirado en Open Collective.
2. **Refinar gobernanza** inspirado en Hylo.
3. **Mantener stack propio** porque la combinaciÃ³n es Ãnica.

---

## 5. Referencias

- [Hylo](https://hylo.com)
- [Open Collective](https://opencollective.com)
- [Hylo GitHub](https://github.com/hylo-so)
- [Open Collective GitHub](https://github.com/opencollective)