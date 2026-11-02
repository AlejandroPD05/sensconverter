# PROGRESS — SensiCore

Actualizado: 02/11/2026.

## Fases de la especificación

- [x] **Fase 1 — Base.** Next.js 16 + TypeScript estricto + Tailwind 4; tokens Liquid Glass; navegación de escritorio y móvil; registro de juegos con tipos y capacidades.
- [x] **Fase 2 — Motor.** Fórmulas cm/360, inversa, eDPI, sens→sens, FOV aware y distancia de monitor; validación; disponibilidad por método; 22 pruebas unitarias.
- [x] **Fase 3 — Calculadora anónima.** Selectores con búsqueda y teclado; sensibilidad, DPI compartido o distinto; FOV avanzado; swap, reset, copiar y compartir; resultado en vivo; herramienta global con persistencia local transparente.
- [x] **Fase 4 — Biblioteca y acabado.** Búsqueda, filtros por estado, estados vacíos, enlaces a la calculadora o a los límites; responsive; reduced motion; foco visible.
- [x] **Fase 5 — Cuentas.** Supabase SSR; registro, login, logout, recuperación; perfiles CRUD, duplicado, favoritos y preferido por juego; preferencia global; migraciones con RLS.
- [x] **Fase 6 — Calidad.** Lint, typecheck, unitarias, build y E2E anónimas, autenticadas y de RLS verificadas contra un proyecto Supabase real.
- [x] **Fase 7 — Entrega.** README con instalación, Supabase, despliegue, comandos, juegos y límites; `.env.example`; migraciones; este archivo.
- [x] **Fase 8 — Producción.** Desplegado en Vercel (`https://sensicore-zeta.vercel.app`) con las variables públicas de Supabase y el Site URL/Redirect URLs del proyecto real apuntando al dominio.

## Verificación real

| Comprobación | Resultado |
| --- | --- |
| `npm run lint` | Sin errores |
| `npm run typecheck` | Sin errores |
| `npm test` | 22/22 |
| `npm run build` | Correcto |
| `npm run test:e2e` | 22/22 (incluye cuenta, RLS y aviso de enlace fallido; escritorio y móvil) |
| Revisión visual 390 / 768 / 1440 | Sin desbordamiento horizontal de página; navegación inferior solo en móvil |

La revisión visual corrigió tres defectos reales: la navegación inferior se mostraba también en escritorio, la cabecera duplicaba el acceso a cuenta en móvil y las tarjetas de la biblioteca y el aviso de configuración desbordaban en pantallas estrechas. Las clases de componente se movieron a `@layer components` para que las utilidades de Tailwind puedan ocultarlas o limitarlas.

El aviso de hidratación sobre `caret-color: transparent` no procede de la app: Playwright inyecta ese estilo al capturar y React lo detecta si la captura ocurre antes de hidratar. Sin captura, no aparece.

## Pendiente / bloqueado

- [x] `.env.local` configurado con la URL y la clave pública del proyecto Supabase.
- [x] Migraciones `0001_init.sql` y `0002_preferred_profile.sql` aplicadas en el proyecto real. El esquema expone `profiles` y `sensitivity_profiles` con `is_preferred`.
- [x] Pruebas autenticadas y de aislamiento RLS ejecutadas contra Supabase real, en escritorio y móvil.
- [ ] **Rotar o revocar la secret key que se compartió por chat.** La app no la usa y no está guardada en el repositorio ni en `.env.local`.
- [x] Flujo de correo verificado en todo lo que controla la app: la petición de recuperación envía `code_challenge` S256, `/auth/callback` canjea el código, `/reset-password` acepta la sesión, cambia la contraseña y permite iniciar sesión con la nueva.
- [ ] Envío real de correo: depende de configurar Custom SMTP y un buzón real. Con `example.com` GoTrue responde `email_address_invalid`; con el servicio compartido, `over_email_send_rate_limit`.
- [ ] Verificar en el despliegue que el origen exacto está en **Redirect URLs**, si no los enlaces acaban en `/login?error=auth_callback`.
- [x] Inicializar Git y hacer el primer commit.
- [x] Desplegar en Vercel y configurar Site URL y Redirect URLs del proyecto Supabase real.
- [ ] Añadir juegos pendientes solo cuando exista una constante documentada y contrastada.
- [ ] Valorar ADS/scope y aspect ratio cuando haya fórmulas verificadas; hoy se declaran fuera de alcance.
- [ ] Borrado de cuenta seguro (requiere operación de servidor con privilegios; no se expone service-role key).

## Notas de la última pasada

- La prueba autenticada detectó un defecto real: los campos de DPI usaban `min=1` con `step=50`, así que 800 no era un valor HTML válido y el formulario de edición no se enviaba. Ahora usan `step=1`.
- El usuario de prueba de Playwright vive en `.env.local` y no se versiona. Playwright carga ese archivo y usa un solo worker cuando hay `TEST_USER_EMAIL`.
- Las tablas existen y la clave anónima recibe `401` al intentar leer perfiles, como exige el aislamiento RLS.
- La verificación del correo detectó dos defectos de UX: `/login?error=auth_callback` se ignoraba y el usuario veía un formulario normal tras fallar un enlace; y los mensajes de Supabase se comparaban con mayúscula inicial, así que `email rate limit exceeded` llegaba en inglés. Ahora hay aviso explícito y traducción insensible a mayúsculas.
