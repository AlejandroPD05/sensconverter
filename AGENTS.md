# AGENTS.md — SensConverter (SensiCore)

## Estado del repo

- Implementado: calculadora anónima, motor de conversión, biblioteca, herramienta global, auth opcional con Supabase, perfiles guardados, migraciones y pruebas.
- `SensConverter.md` sigue siendo la fuente de verdad funcional. `README.md` documenta instalación, Supabase, despliegue, juegos soportados y límites conocidos.
- El `AGENTS.md` de la raíz del workspace describe otro proyecto (`atlas`); al trabajar aquí, prevalece este archivo.
- No hay repositorio Git inicializado. No hay nada commiteado.
- `.env.local` (ignorado por Git) tiene el proyecto Supabase real y un usuario de prueba. `npm run test:e2e` lo carga y ejecuta también las pruebas autenticadas y de RLS. Sin ese archivo o sin `TEST_USER_*`, esas pruebas se omiten y las omitidas no cuentan como aprobadas.
- La secret key de Supabase no se guarda en el repo ni en `.env.local`; solo se usa la clave pública.

## Stack real

- Next.js 16.4.3 (App Router, Turbopack) + React 19.3 + TypeScript estricto + Tailwind CSS 4.
- Supabase Auth + Postgres con RLS (`@supabase/ssr`), Zod para validación.
- Vitest (unitarias) y Playwright (E2E: Chromium de escritorio y Pixel 7).
- npm como gestor de paquetes. Entorno Windows/PowerShell.
- La estética es "hoja de retransmisión": papel hueso, tinta, un único amarillo de señal, radios 0–2 px y hairlines de 1 px. `DESIGN.md` es el documento normativo del sistema; `src/app/globals.css` es la implementación. El antiguo "Liquid Glass" oscuro es anti-referencia: nada de cristal, blur, glow, sombras difusas ni degradados de color.

## Reglas que un agente suele romper

- El calculador debe funcionar al 100% sin cuenta y sin credenciales de Supabase. Nunca bloquearlo con login ni con un modal.
- No inventar yaw constants, fórmulas ni compatibilidades. Si no está verificado, la conversión se marca como no soportada/experimental.
- No simular auth ni guardado: nada de "guardado en la nube" sobre `localStorage`. Sin backend configurado, se dice explícitamente.
- Motor de conversión aislado de UI, auth y base de datos (`lib/conversion`, `lib/games`).
- Registro de juegos data-driven con capacidades declaradas; la UI no debe tener condicionales por juego.
- Fórmula base solo para modelos yaw: `cm360 = (360 × 2.54) / (DPI × sensitivity × yaw)`; inversa para obtener sensibilidad. Valida entradas y evita `NaN`/`Infinity`.
- RLS activado en tablas de usuario; nunca confiar en un user ID enviado por el cliente.
- Los inputs de DPI usan `step={1}`. No vuelvas a `step={50}` con `min={1}`: hace que 800 o 1600 sean valores HTML inválidos y bloquea el envío de los formularios.
- El nombre "SensiCore" es provisional: mantén marca, logo y colores centralizados/fáciles de cambiar.

## Convenciones de la spec

- La spec tiene rutas sin barras (`componentscalculator`, `libconversion`): interprétalas como `components/calculator`, `lib/conversion`, etc.
- Redondea según la precisión aceptada por cada juego y explica que el valor puede requerir redondeo; no muestres precisión falsa.
- `prefers-reduced-motion`, foco visible, labels y anuncios de resultados son requisitos, no extras.
- Actualiza el checklist de tareas al avanzar; no marcar algo como hecho solo por haber creado archivos.

## Comandos

Verificados en este repo:

```powershell
npm install
npm run dev          # http://localhost:3000
npm run lint
npm run typecheck
npm test             # Vitest: 22 pruebas
npm run test:e2e     # Playwright: 22 pruebas, escritorio + móvil
npm run build        # incluye TypeScript; no hace falta tsc aparte
npm start            # sirve el build de producción
```

Una sola prueba:

```powershell
npx vitest run src/lib/conversion/engine.test.ts
npx vitest run src/lib/conversion/engine.test.ts -t "cm/360"
npx playwright test tests/e2e/calculator.spec.ts --project=chromium
```

- `next.config.ts` incluye `allowedDevOrigins: ["127.0.0.1"]`. Sin eso, Playwright carga la página desde `127.0.0.1` pero Next bloquea los recursos de desarrollo y la app no hidrata; los inputs parecen ignorar los cambios.
- `NEXT_PUBLIC_SUPABASE_*` se incrusta en build. Si faltan al compilar, las páginas de cuenta quedan estáticas con el aviso de configuración.
- Las pruebas autenticadas necesitan Supabase migrado y `TEST_USER_EMAIL` / `TEST_USER_PASSWORD`; `playwright.config.ts` carga `.env.local` y usa un solo worker cuando hay usuario de prueba.
- Las clases de componente de `globals.css` viven en `@layer components` para que las utilidades de Tailwind (`md:hidden`, `min-w-0`, `pr-14`…) puedan sobrescribirlas. No las devuelvas al CSS sin capa.
- Playwright inyecta `caret-color: transparent` al hacer capturas. Si la captura ocurre antes de hidratar, React avisa de un `style` distinto; es un artefacto del test, no de la app.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
