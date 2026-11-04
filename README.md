# SensConverter

Conversor de sensibilidad de ratón entre juegos, con el **cm/360** como referencia física. La calculadora funciona al 100 % sin cuenta y sin Supabase. Las cuentas son opcionales y solo añaden guardado y sincronización.

**En producción:** https://sensicore-zeta.vercel.app

> El nombre (antes «SensiCore») está centralizado en `src/lib/brand.ts`. La URL de Vercel conserva el nombre antiguo.

## Qué incluye

- Conversión en vivo entre juegos con modelo yaw lineal.
- Tres métodos: distancia 360°, FOV aware y distancia de monitor. El método específico del juego permanece desactivado hasta tener una fórmula verificada.
- Herramienta global de cm/360 con equivalencias por juego.
- Biblioteca de juegos con búsqueda, filtros y estado de verificación real.
- Calculadora anónima sin login, sin base de datos y sin resultados inventados.
- Cuentas opcionales con Supabase Auth: registro, acceso, recuperación de contraseña, sesión persistente y cierre de sesión.
- Perfiles guardados en Postgres: crear, editar, renombrar, duplicar, borrar, favoritos y un perfil preferido por juego.
- Preferencia global (cm/360 y DPI) guardada por usuario.
- RLS activado: cada usuario solo puede leer y modificar sus propios registros.
- Diseño claro estilo SaaS (blanco, grises neutros, un acento índigo, Geist), documentado en `DESIGN.md`; responsive, con foco visible, `prefers-reduced-motion` y anuncios de resultados.

## Stack

- Next.js 16.4 (App Router, Turbopack) + React 19.3
- TypeScript estricto + Tailwind CSS 4 con tokens CSS propios
- Supabase Auth + Postgres (`@supabase/ssr`)
- Zod para validación en servidor
- Vitest para unitarias y Playwright para E2E
- npm

## Requisitos

- Node.js 20.9 o superior (recomendado 22 LTS).
- npm 10 o superior.
- Para las cuentas: un proyecto de Supabase. Sin él, la calculadora sigue funcionando.

## Puesta en marcha

```powershell
npm install
npm run dev
```

Abre `http://localhost:3000`.

La calculadora y la biblioteca funcionan sin crear `.env.local`. Las páginas de cuenta muestran un aviso explicando qué falta; no simulan un login ni un guardado.

## Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en `http://localhost:3000` |
| `npm run build` | Build de producción (incluye TypeScript) |
| `npm start` | Sirve el build de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest, 33 pruebas unitarias |
| `npm run test:watch` | Vitest en modo watch |
| `npm run test:e2e` | Playwright: escritorio, móvil y un servidor sin Supabase |

Una sola prueba unitaria:

```powershell
npx vitest run src/lib/conversion/engine.test.ts
npx vitest run src/lib/conversion/engine.test.ts -t "cm/360"
```

Una sola prueba E2E:

```powershell
npx playwright install chromium
npx playwright test tests/e2e/calculator.spec.ts --project=chromium
```

El servidor de Playwright arranca en el puerto `3100` para no chocar con el desarrollo normal.

## Configurar Supabase (opcional)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Copia `.env.example` a `.env.local` y rellena los valores de **Project Settings → API**:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```

3. Aplica las migraciones en orden desde el SQL Editor de Supabase (o con la CLI):

   - `supabase/migrations/0001_init.sql`: tablas, índices, triggers, RLS y grants.
   - `supabase/migrations/0002_preferred_profile.sql`: perfil preferido por juego. Es idempotente; una instalación nueva ya incluye la columna en `0001`.
   - `supabase/migrations/0003_delete_own_account.sql`: función `delete_own_account()` (security definer) para que cada usuario borre su propia cuenta sin exponer la service-role key. Sin ella, el botón «Eliminar mi cuenta» avisa de que falta la migración.

4. En **Authentication → URL Configuration**:

   - Site URL: `http://localhost:3000` en desarrollo; tu dominio en producción.
   - Redirect URLs: `http://localhost:3000/auth/callback` y `https://tu-dominio/auth/callback`.

5. Reinicia `npm run dev`.

Notas importantes:

- Usa solo la **anon key**. Nunca añadas la service-role key al cliente ni a este repositorio.
- `NEXT_PUBLIC_*` se incrusta en el bundle en tiempo de build. Debes compilar con las variables presentes, también en Docker/CI.
- Si la confirmación de correo está activa en Supabase, el registro pide confirmar el email antes de iniciar sesión. Si está desactivada, la sesión se crea inmediatamente.
- No hay borrado de cuenta implementado. El borrado seguro requiere una operación de servidor con privilegios; se deja fuera a propósito para no exponer una service-role key.

### Correo en producción

Los enlaces de confirmación y de recuperación pasan por `/auth/callback`, que canjea el código PKCE y crea la sesión. Para que funcionen fuera de `localhost`:

- Añade el origen exacto del despliegue a **Redirect URLs**, incluido el esquema y sin barra final: `https://tu-dominio/auth/callback`. Si falta, Supabase redirige al Site URL y la app acaba en `/login?error=auth_callback`.
- Configura **Custom SMTP** en Authentication → Emails. El servicio compartido de Supabase impone un límite muy bajo (unos pocos correos por hora) y suele caer en spam; no sirve para producción.
- No cambies las plantillas por enlaces con tokens propios: deben seguir usando `{{ .ConfirmationURL }}` y el enlace de recuperación estándar.
- Supabase rechaza dominios de ejemplo (`example.com`, `test.com`…) al enviar correo. Para probar el flujo hace falta un buzón real.
- Un enlace de recuperación solo funciona en el mismo navegador que lo solicitó, porque el verificador PKCE vive en una cookie. Es el comportamiento correcto: si se abre en otro dispositivo, la app muestra el aviso de enlace caducado y ofrece pedir otro.

## Pruebas E2E autenticadas

Las pruebas de cuenta y de aislamiento RLS se omiten si faltan variables. Playwright carga `.env.local` si existe, así que puedes dejar allí `TEST_USER_EMAIL` y `TEST_USER_PASSWORD` junto a las claves públicas y ejecutar:

```powershell
npm run test:e2e
```

También puedes pasarlas por entorno:

```powershell
$env:TEST_USER_EMAIL="tu-usuario-de-prueba@example.com"
$env:TEST_USER_PASSWORD="tu-contraseña"
$env:NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="tu-anon-key"
npm run test:e2e
```

Crea el usuario de prueba en Supabase y aplica las migraciones antes. Las pruebas autenticadas crean, editan y eliminan un perfil real; no uses una cuenta con datos que quieras conservar. Cuando hay usuario de prueba, Playwright usa un solo worker para que escritorio y móvil no compitan por el mismo perfil.

## Fórmulas y criterio

Para juegos con modelo yaw lineal:

```text
cm/360     = (360 × 2.54) / (DPI × sensibilidad × yaw)
sensibilidad = (360 × 2.54) / (DPI × cm/360 × yaw)
```

- El resultado se calcula con precisión completa y se redondea solo al mostrarlo o copiarlo, según los decimales que acepta el juego de destino.
- FOV aware conserva el ángulo en el centro de la mira: `tan(FOV_destino/2) / tan(FOV_origen/2)`.
- Distancia de monitor conserva una fracción del ancho de pantalla: `atan(p × tan(FOV_destino/2)) / atan(p × tan(FOV_origen/2))`.
- Un mismo cm/360 no garantiza la misma sensación: FOV, zoom, ADS, recoil, aceleración y suavizado también influyen.

No se inventan constantes. Si un juego no tiene una fórmula documentada, permanece como **pendiente** y no devuelve un número.

## Juegos soportados

Verificados (9):

| Juego | Yaw (°/count) |
| --- | ---: |
| Counter-Strike 2 | 0.022 |
| VALORANT | 0.07 |
| Apex Legends | 0.022 |
| Overwatch 2 | 0.0066 |
| Fortnite | 0.005555 |
| Call of Duty: Warzone / MW2019+ | 0.0066 |
| Team Fortress 2 | 0.022 |
| Quake Champions | 0.022 |
| Destiny 2 | 0.0066 |

Experimental (1):

| Juego | Yaw (°/count) | Motivo |
| --- | ---: | --- |
| Rainbow Six Siege | 0.00572958 | Conversión disponible con advertencia explícita; la constante no tiene la misma solidez que las verificadas. |

Pendientes, sin conversión (6): PUBG: Battlegrounds, Escape from Tarkov, THE FINALS, Battlefield 2042, Unreal Tournament y Halo Infinite.

Las fuentes de cada constante están enlazadas en `/methodology`. Una actualización del juego puede invalidar una constante: comprueba siempre en el rango de práctica.

## Estructura

```text
src/
  app/                 Rutas, server actions, callback de auth
  components/          Calculadora, biblioteca, cuenta, perfiles, UI
  lib/
    conversion/        Motor puro + pruebas unitarias
    games/             Registro data-driven de juegos
    supabase/          Clientes SSR/browser y configuración
    db/                Consultas y tipos de la base de datos
  app/globals.css      Tokens, superficies y componentes del sistema visual
DESIGN.md              Sistema visual normativo (tokens, reglas, componentes)
supabase/migrations/   Esquema, RLS, triggers e índices
tests/e2e/             Flujos anónimos, de cuenta y de aislamiento
```

El motor de conversión (`src/lib/conversion`) no importa React, Supabase ni componentes. La UI no tiene condicionales por juego: lee capacidades y estado del registro.

## Despliegue

### Vercel

Desplegado en **https://sensicore-zeta.vercel.app** (proyecto `sensicore`). Configuración aplicada:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` definidas en Production y Preview. No se sube `.env.local`: `.vercelignore` lo excluye.
- Site URL de Supabase: el dominio de producción. Redirect URLs: el callback de producción, el patrón de previews, `localhost:3000` y `127.0.0.1:3100` (Playwright).
- Migraciones aplicadas en el proyecto Supabase real.

Para volver a desplegar desde este directorio:

```powershell
npx vercel deploy --prod
```

Si cambias el dominio o creas otro proyecto, actualiza el Site URL y las Redirect URLs de Supabase o los enlaces de correo acabarán en `/login?error=auth_callback`.

### Node / VPS

```powershell
npm ci
npm run build
npm start
```

Sirve el proceso detrás de HTTPS (por ejemplo, con un reverse proxy) y define las variables públicas antes del build. No uses `next dev` en producción.

## Limitaciones conocidas

- El FOV de cada juego se convierte a su valor real según la relación de aspecto del monitor (horizontal 4:3, horizontal 16:9 o vertical, todos Hor+). Fortnite no tiene FOV documentado y no ofrece métodos con FOV.
- Miras: solo TF2 (modelo de Source SDK, verificado) y la AWP de CS2 (experimental). El resto de juegos no tiene un modelo de zoom público y la app no da valores de mira. Viewspeed no está disponible por falta de una fórmula verificable; el método específico del juego está desactivado.
- No se modelan recoil, aceleración del ratón, suavizado ni la respuesta interna del motor.
- Los juegos pendientes no se pueden elegir en la calculadora; la biblioteca explica por qué.
- El slider de cada juego puede redondear o limitar el valor calculado. Ajusta el valor exacto en el juego si no coincide.
- Sin cuenta, la preferencia global se guarda en `localStorage` (`sensicore.global.v1`) y se dice explícitamente. No es almacenamiento en la nube ni se presenta como tal.
- El estado de la calculadora no se persiste entre visitas.
- El borrado de cuenta requiere aplicar `0003_delete_own_account.sql`. No hay cambio de email desde la app; la recuperación de contraseña sí está disponible.
- Las pruebas autenticadas y el aislamiento RLS requieren un proyecto Supabase configurado y un usuario de prueba. Con un solo usuario, el aislamiento se prueba desde su lado: solo lee filas propias y escribir a nombre de otro id devuelve la violación de política 42501.
- La verificación de constantes es una revisión documental, no una medición física continua.

## Estado de verificación

Comprobado en este repositorio:

- `npm run lint`: sin errores.
- `npm run typecheck`: sin errores.
- `npm test`: 33 pruebas superadas.
- `npm run build`: build de producción correcto.
- `npm run test:e2e`: 37 superadas. Incluye cuenta, RLS entre usuarios, Chromium de escritorio, Pixel 7 y la app sin credenciales de Supabase.

Las pruebas autenticadas se omiten si no hay proyecto Supabase o usuario de prueba; las omitidas no cuentan como aprobadas.
