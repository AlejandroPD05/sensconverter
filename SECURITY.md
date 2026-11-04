# Seguridad — SensConverter

## Revisión del 04/11/2026

Prueba manual de caja blanca y gris: revisión del código (server actions,
callback de autenticación, redirecciones, migraciones y políticas RLS),
`npm audit` y sondeos contra producción (`https://sensicore-zeta.vercel.app`).
No se usaron herramientas automáticas de explotación ni cuentas de terceros.

### Hallazgos y estado

| # | Hallazgo | Riesgo | Estado |
| --- | --- | --- | --- |
| 1 | Sin `Content-Security-Policy`: cualquier script inyectado podría cargar código de otro origen o enviar datos fuera. | Medio | Corregido en `next.config.ts`: `default-src 'self'`, `connect-src` limitado a Supabase, `object-src 'none'`, `base-uri` y `form-action 'self'`. |
| 2 | La web se podía incrustar en un `iframe` (clickjacking sobre login, borrado de cuenta, etc.). | Medio | Corregido: `frame-ancestors 'none'` y `X-Frame-Options: DENY`. |
| 3 | Faltaban `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y `Cross-Origin-Opener-Policy`. | Bajo | Corregido. |
| 4 | `X-Powered-By: Next.js` revelaba el framework. | Informativo | Corregido (`poweredByHeader: false`). |
| 5 | `set_updated_at()` sin `search_path` fijo y `handle_new_user()` (security definer) con `search_path = public`. | Bajo | Corregido en `supabase/migrations/0004_hardening.sql` (`search_path = ''`, nombres cualificados, sin `EXECUTE` para roles de la API). |
| 6 | Sin límite de filas: un usuario autenticado podía insertar perfiles sin fin directamente contra la API de Supabase. | Bajo | Corregido en `0004_hardening.sql`: trigger que limita a 200 perfiles por cuenta; la app muestra un mensaje claro. |

### Comprobado sin hallazgos

- **Redirección abierta:** `safeNext` rechaza URLs absolutas, `//`, barras invertidas y caracteres de control; `/auth/callback?next=//evil…` vuelve siempre a `/login` del propio dominio. Cubierto por pruebas unitarias y E2E.
- **Control de acceso (IDOR):** las server actions comprueban la sesión con `auth.getUser()` y filtran por `user_id`; RLS impide leer, crear o traspasar filas de otro usuario (pruebas E2E `aislamiento entre usuarios`).
- **Borrado de cuenta:** `delete_own_account()` solo borra `auth.uid()` y la clave anónima no puede ejecutarla.
- **Rutas privadas:** `/account` y `/my-sensitivities` redirigen a `/login` sin sesión.
- **XSS:** React escapa todo el contenido; no hay `dangerouslySetInnerHTML`, `eval` ni `innerHTML`.
- **CSRF:** las server actions de Next validan el origen de la petición.
- **Secretos:** solo la clave pública de Supabase llega al cliente; el historial de Git no contiene claves.
- **Dependencias:** `npm audit --omit=dev` sin vulnerabilidades.
- **HTTPS:** Vercel envía `Strict-Transport-Security` con `preload`.

### Riesgo residual y recomendaciones

- La CSP mantiene `'unsafe-inline'` en `script-src` y `style-src`: Next inyecta scripts de arranque en línea y la interfaz usa variables CSS en `style`. Eliminarlo exige nonces (todas las páginas pasarían a renderizado dinámico) o el modo SRI experimental de Next.
- **Supabase Auth** (panel del proyecto, lo cambia el propietario): subir la longitud mínima de contraseña a 8 o más, activar la protección contra contraseñas filtradas si el plan lo permite y revisar los límites de envío de correo.
- **Rotar la secret key** que se compartió por chat.

### Cómo reproducir

```bash
npm audit --omit=dev
npx vitest run src/lib/auth.test.ts
npx playwright test tests/e2e/layout.spec.ts --project=chromium
curl -sI https://sensicore-zeta.vercel.app/
```
