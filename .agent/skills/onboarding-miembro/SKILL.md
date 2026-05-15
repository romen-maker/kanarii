---
name: onboarding-miembro
description: Diseña e implementa el flujo de incorporación de una persona nueva a la comunidad a través de Kanarii. Úsala cuando el usuario quiera crear o mejorar cómo una persona nueva entra, se presenta y empieza a participar.
---

# Onboarding Miembro (Bienvenida a la Comunidad)

Esta habilidad permite diseñar flujos de entrada para nuevas personas en Kanarii, asegurando que la experiencia técnica, humana y comunitaria sea coherente con los valores de horizontalidad y calidez del proyecto. No se trata de un registro corporativo, sino de una puerta de entrada a un espacio vivo.

## Instrucciones de Diseño

El agente debe abordar el onboarding desde tres dimensiones:

### 1. Dimensión Técnica
- **Flujo de Sistema**: Define los pasos desde la creación de cuenta hasta el acceso a la primera pantalla.
- **Roles Iniciales**: ¿Qué permisos o etiquetas recibe la persona al entrar por primera vez?
- **Persistencia**: ¿Cómo se guarda el progreso del onboarding en Firestore para que no sea intrusivo?

### 2. Dimensión Humana
- **Orientación**: ¿Qué necesita saber la persona para no sentirse perdida? (quiénes somos, cómo funcionamos).
- **Primeros Pasos**: ¿Qué es lo primero que puede hacer para empezar a participar?
- **Tono**: El lenguaje debe ser cálido, acogedor y cercano, evitando el tono imperativo o burocrático.

### 3. Dimensión Comunitaria
- **Presentación**: ¿Cómo se presenta la persona a la comunidad si así lo desea?
- **Bienvenida Grupal**: ¿Qué mecanismos existen para que los miembros actuales den la bienvenida a la nueva persona?

## Requisitos del Output
Para cada propuesta de onboarding, entrega siempre:
- **Pasos del Flujo**: Lista de pantallas involucradas.
- **Datos Recogidos**: Justificación de qué información se pide y por qué (siempre el mínimo necesario).
- **Mensaje de Bienvenida**: Un ejemplo real del texto que verá el usuario.
- **Estrategia de No-Bloqueo**: Cómo puede la persona seguir usando la app si decide saltarse pasos del onboarding.

## Valores de Kanarii en el Onboarding
- **Horizontalidad**: Nadie es más que nadie; la app guía, no manda.
- **Transparencia**: Explica por qué pedimos cada dato.
- **Libertad**: El onboarding es una invitación, no una obligación para ver el contenido básico.

## Restricciones
- **Límite de Pasos**: Máximo 4 pasos en total. Si necesitas más, algo debe ser eliminado o movido a una fase posterior.
- **Privacidad**: No pidas datos personales sensibles ni más allá de lo necesario para la identidad comunitaria básica.
- **No-Bloqueo**: Guía al usuario pero no le impidas el acceso a la funcionalidad básica de la app por no completar el onboarding.

---

*Última actualización: 15 May 2026*
