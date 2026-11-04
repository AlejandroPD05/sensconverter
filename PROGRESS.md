# PROGRESS — SensConverter

Actualizado: 04/11/2026.

## Fases de la especificación

- [x] **Fase 1 — Base.** Next.js 16 + TypeScript estricto + Tailwind 4; navegación de escritorio y móvil; registro de juegos con tipos y capacidades. (Los tokens originales "Liquid Glass" se sustituyeron en la Fase 9.)
- [x] **Fase 2 — Motor.** Fórmulas cm/360, inversa, eDPI, sens→sens, FOV aware y distancia de monitor; validación; disponibilidad por método; 22 pruebas unitarias.
- [x] **Fase 3 — Calculadora anónima.** Selectores con búsqueda y teclado; sensibilidad, DPI compartido o distinto; FOV avanzado; swap, reset, copiar y compartir; resultado en vivo; herramienta global con persistencia local transparente.
- [x] **Fase 4 — Biblioteca y acabado.** Búsqueda, filtros por estado, estados vacíos, enlaces a la calculadora o a los límites; responsive; reduced motion; foco visible.
- [x] **Fase 5 — Cuentas.** Supabase SSR; registro, login, logout, recuperación; perfiles CRUD, duplicado, favoritos y preferido por juego; preferencia global; migraciones con RLS.
- [x] **Fase 6 — Calidad.** Lint, typecheck, unitarias, build y E2E anónimas, autenticadas y de RLS verificadas contra un proyecto Supabase real.
- [x] **Fase 7 — Entrega.** README con instalación, Supabase, despliegue, comandos, juegos y límites; `.env.example`; migraciones; este archivo.
- [x] **Fase 8 — Producción.** Desplegado en Vercel (`https://sensicore-zeta.vercel.app`) con las variables públicas de Supabase y el Site URL/Redirect URLs del proyecto real apuntando al dominio.
- [x] **Fase 9 — Rediseño visual.** Sustituida la estética "Liquid Glass" (anti-referencia) por el sistema "hoja de retransmisión": papel hueso, tinta, un único amarillo de señal, Archivo + Martian Mono, radios 0–2 px, hairlines, franja EN DIRECTO alimentada por la calculadora y escala cm/360. `DESIGN.md` documentaba el sistema (sustituido en la Fase 10).
- [x] **Fase 10 — Interfaz clara SaaS.** Sustituida la "hoja de retransmisión" por un estilo claro moderno: fondo blanco, grises zinc, acento índigo, Geist + Geist Mono, tarjetas redondeadas con borde fino y selectores segmentados. Se quitó la franja EN DIRECTO (y `lib/live-readout.ts`). `DESIGN.md` describe el sistema nuevo; las capturas de `.impeccable/review/` están regeneradas y `.impeccable/design.json` (sistema anterior) se eliminó.
- [x] **Fase 11 — Pendientes de la spec.** Cuenta con configuraciones recientes, juegos favoritos (derivados de los perfiles favoritos) y borrado de cuenta seguro mediante `delete_own_account()` (migración 0003). Rango de R6 Siege corregido a 1–100 enteros. E2E nuevas: aislamiento RLS entre usuarios y la app sin credenciales de Supabase.
- [x] **Fase 12 — Sistema de FOV y miras.** Convención de FOV por juego (horizontal 4:3, horizontal 16:9, vertical) con fuente y estado; relación de aspecto del monitor; distancia de monitor horizontal o vertical con porcentaje (0% = focal length); tabla de miras con `zoom_sensitivity_ratio` para TF2 (Source SDK 2013, verificado) y la AWP de CS2 (experimental). Viewspeed visible pero desactivado: no hay fórmula pública verificable. Fortnite sin FOV documentado. Rangos corregidos: Apex 70–110, TF2 75–90, Quake Champions 100–140, Destiny 2 55–105, R6 60–90 vertical.
- [x] **Fase 12b — FOV y resolución a la vista.** Cada lado de la calculadora muestra resolución (ancho × alto) y FOV del juego junto al DPI, con el FOV real resultante; origen y destino pueden tener resoluciones distintas. La distancia de monitor (eje y porcentaje) aparece solo al elegir ese método.
- [x] **Donaciones.** Enlace a Ko-fi (`https://ko-fi.com/alejandroprietodiez`) en el pie y en la cabecera de escritorio, configurado en `donation.url` de `src/lib/brand.ts` (null lo oculta).
- [x] **Fase 13 — Lavado de cara 2026.** Hero oscuro con aurora índigo y visor de mira que rota conversiones reales del motor (se oculta en móvil); cabeceras oscuras compartidas (`PageHero`) en biblioteca, global y metodología; resultado con cifras que ruedan; selectores segmentados con indicador deslizante; transiciones entre páginas con `ViewTransition`; el hero se aleja al hacer scroll (`animation-timeline: view()`). Sin eyebrows sobre los titulares. Todo respeta `prefers-reduced-motion` y los bucles se pausan fuera de pantalla.
- [x] **Revisión de seguridad** (`SECURITY.md`): CSP y cabeceras de seguridad, sin `X-Powered-By`, funciones de BD con `search_path` fijo y límite de 200 perfiles por cuenta (migración 0004).
- [x] Migración `0004_hardening.sql` aplicada en el proyecto real (04/11/2026); las cuatro funciones de `public` tienen `search_path` vacío.
- [ ] Supabase Auth: contraseña mínima de 8+ y protección contra contraseñas filtradas (lo decide el propietario).

## Verificación real

| Comprobación | Resultado |
| --- | --- |
| `npm run lint` | Sin errores |
| `npm run typecheck` | Sin errores |
| `npm test` | 46/46 |
| `npm run build` | Correcto |
| `npm run test:e2e` | 45/45 (incluye cabeceras de seguridad y redirección del callback; incluye miras de TF2 y Viewspeed desactivado; incluye cuenta, RLS entre usuarios, aviso de enlace fallido y servidor sin Supabase; escritorio y móvil) |
| Revisión visual 390 / 768 / 1440 | Sin desbordamiento horizontal de página; navegación inferior solo en móvil |

La revisión visual corrigió tres defectos reales: la navegación inferior se mostraba también en escritorio, la cabecera duplicaba el acceso a cuenta en móvil y las tarjetas de la biblioteca y el aviso de configuración desbordaban en pantallas estrechas. Las clases de componente se movieron a `@layer components` para que las utilidades de Tailwind puedan ocultarlas o limitarlas.

El aviso de hidratación sobre `caret-color: transparent` no procede de la app: Playwright inyecta ese estilo al capturar y React lo detecta si la captura ocurre antes de hidratar. Sin captura, no aparece.

## Pendiente / bloqueado

- [x] `.env.local` configurado con la URL y la clave pública del proyecto Supabase.
- [x] Migraciones `0001_init.sql` y `0002_preferred_profile.sql` aplicadas en el proyecto real. El esquema expone `profiles` y `sensitivity_profiles` con `is_preferred`.
- [x] Pruebas autenticadas y de aislamiento RLS ejecutadas contra Supabase real, en escritorio y móvil.
- [ ] **Rotar o revocar la secret key que se compartió por chat.** La app no la usa y no está guardada en el repositorio ni en `.env.local`.
- [x] Flujo de correo verificado en todo lo que controla la app: la petición de recuperación envía `code_challenge` S256, `/auth/callback` canjea el código, `/reset-password` acepta la sesión, cambia la contraseña y permite iniciar sesión con la nueva.
- [x] Envío real de correo: Custom SMTP con Gmail (smtp.gmail.com:587, contraseña de aplicación) configurado el 04/11/2026; el usuario confirmó que llega el correo de registro.
- [x] Site URL `https://sensicore-zeta.vercel.app` y Redirect URLs (incluido `/auth/callback` de producción) comprobados el 04/11/2026.
- [x] Inicializar Git y hacer el primer commit.
- [x] Desplegar en Vercel y configurar Site URL y Redirect URLs del proyecto Supabase real.
- [ ] Añadir juegos pendientes solo cuando exista una constante documentada y contrastada.
- [x] Relación de aspecto y miras con fuente (TF2, AWP de CS2).
- [ ] Miras del resto de juegos: solo cuando haya un modelo de zoom público y contrastado (hoy no lo hay para VALORANT, Apex, Overwatch 2, CoD, R6, Destiny 2, Quake Champions ni Fortnite).
- [x] Borrado de cuenta seguro implementado sin service-role key (función `security definer` que solo borra `auth.uid()`).
- [x] Migración `0003_delete_own_account.sql` aplicada en el proyecto real (SQL Editor, 04/11/2026); la clave anónima no puede ejecutar la función. No se probó el borrado real de extremo a extremo para no eliminar el usuario de prueba.
- [x] Redesplegado en Vercel con las fases 10 y 11.

## Notas de la última pasada

- R6 Siege limitaba la sensibilidad a 1–20 con dos decimales, pero el slider admite enteros de 1 a 100 (por defecto 50, con `MouseSensitivityMultiplierUnit` = 0.02). El valor por defecto del juego se rechazaba como fuera de rango. Fuente: guía comunitaria de clip.dor.gg con la fórmula 914.4 / (DPI × sens × 0.00572957795); sigue como experimental.
- El aislamiento entre usuarios se prueba con un solo usuario de prueba: solo lee filas propias y escribir o traspasar a otro id devuelve 42501. No hay segundo usuario con datos reales en el proyecto.
- La biblioteca mostraba badges "ADS" y "Zoom" en 8 juegos aunque el motor solo convierte cadera. Se quitaron `scoped`/`ads` de las capacidades del registro y una prueba unitaria impide volver a declararlas hasta que exista la conversión.

- La prueba autenticada detectó un defecto real: los campos de DPI usaban `min=1` con `step=50`, así que 800 no era un valor HTML válido y el formulario de edición no se enviaba. Ahora usan `step=1`.
- El usuario de prueba de Playwright vive en `.env.local` y no se versiona. Playwright carga ese archivo y usa un solo worker cuando hay `TEST_USER_EMAIL`.
- Las tablas existen y la clave anónima recibe `401` al intentar leer perfiles, como exige el aislamiento RLS.
- La verificación del correo detectó dos defectos de UX: `/login?error=auth_callback` se ignoraba y el usuario veía un formulario normal tras fallar un enlace; y los mensajes de Supabase se comparaban con mayúscula inicial, así que `email rate limit exceeded` llegaba en inglés. Ahora hay aviso explícito y traducción insensible a mayúsculas.
