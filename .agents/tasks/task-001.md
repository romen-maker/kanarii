# Task-001: Implementar Firestore Rules reales y corregir reactividad de sesión

## Objetivo
Implementar reglas de seguridad en Firestore multi-comunidad basadas en roles jerárquicos y corregir las condiciones de carrera en el estado de autenticación (`AuthContext.tsx` y `ProtectedRoute` en `App.tsx`).

## Contexto técnico
> Fuente: Aportado por el usuario en sesión start (2026-05-22)

- **Decisión:** Usar el patrón de lectura única `members/{uid}` dentro de `/communities/{communityId}` en `firestore.rules` con funciones helper cacheadas (`getMembership`, `hasRole`, `hasMinRole`).
- **Decisión:** Implementar en `AuthContext.tsx` un estado explícito de 3 fases (`status: 'checking' | 'authenticated' | 'unauthenticated'`) para eliminar el parpadeo y condiciones de carrera de React 18, controlando el orden de los setters sin recurrir a `finally` ambiguo.
- **Decisión:** Modificar `ProtectedRoute` en `App.tsx` para bloquear el renderizado/redirección hasta que el estado deje de ser `'checking'`.
- **Constraint clave:** Mantener compatibilidad con la propiedad `loading` actual en el resto de la app (se define como alias de `status === 'checking'`).
- **Referencia:** Soluciones provistas en el prompt de inicio de sesión.

## Caja de archivos
Archivos autorizados:
- `firestore.rules`
- `src/contexts/AuthContext.tsx`
- `src/App.tsx`

## Criterios de done
- [ ] Reglas de seguridad implementadas en `firestore.rules` según la especificación provista.
- [ ] `AuthContext.tsx` actualizado con el enum `AuthStatus` y libre de condiciones de carrera.
- [ ] `ProtectedRoute` en `App.tsx` adaptado para leer `status` y evitar parpadeos/redirecciones prematuras.
- [ ] Verificar que la aplicación compila correctamente sin errores de TypeScript.
- [ ] Validar localmente que la aplicación inicia y autentica de forma reactiva y consistente.
