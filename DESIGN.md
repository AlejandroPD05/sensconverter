---
name: SensConverter
description: Herramienta web clara y limpia para convertir sensibilidad entre juegos.
colors:
  bg: "#ffffff"
  bg-subtle: "#fafafa"
  surface: "#ffffff"
  surface-muted: "#f4f4f5"
  fg: "#09090b"
  fg-soft: "#27272a"
  muted: "#52525b"
  faint: "#71717a"
  accent: "#4f46e5"
  accent-hover: "#4338ca"
  accent-soft: "#eef2ff"
  accent-line: "#c7d2fe"
  accent-fg: "#3730a3"
  success: "#15803d"
  warning: "#b45309"
  danger: "#dc2626"
  line: "#e4e4e7"
  line-strong: "#d4d4d8"
  success-line: "#bbf7d0"
  warning-line: "#fde68a"
  danger-line: "#fecaca"
  hero-bg: "#07070c"
  hero-fg: "#f4f4f5"
  hero-muted: "#a1a1aa"
  hero-accent: "#a5b4fc"
  hero-accent-soft: "#c7d2fe"
typography:
  sans: Geist
  mono: Geist Mono
radii:
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  pill: 999px
---

# Design System: SensConverter

## Overview

Herramienta SaaS moderna en dos planos: una cabecera de página oscura (casi
negro con aurora índigo y un visor de mira) y, encima, la aplicación clara con
fondo blanco, grises zinc, un único acento índigo y tarjetas de borde fino. La
calculadora sube por encima del hero oscuro y sigue siendo la protagonista.

`src/app/globals.css` es la implementación. Este archivo describe las reglas.
Sustituye al sistema anterior "hoja de retransmisión" (papel hueso y amarillo
de señal) y al "Liquid Glass" oscuro original; ninguno de los dos se debe
reintroducir.

## Temas

- Oscuro por defecto (`<html data-theme="dark">`); el claro es el `:root`
  original. El botón sol/luna de la cabecera alterna y guarda la elección en
  `localStorage` (`sensconverter.theme.v1`); un script en `<head>` la aplica
  antes del primer pintado para que no parpadee.
- En oscuro el índigo de acción pasa a `#818cf8` con texto `--on-accent`
  oscuro, porque el blanco sobre ese tono no llega a 4.5:1.
- Todos los colores de estado, bordes, cabecera, barra inferior y
  scrollbar son tokens: no uses literales en componentes.
- El hero se funde con el fondo en oscuro; en claro corta en seco contra el
  blanco a propósito.

## Favicon

- `src/app/icon.svg` (mira blanca sobre índigo) y `apple-icon.png` de 180 px
  generado desde el SVG.

## Hero oscuro

- `.hero-dark` es el único plano oscuro: home (con el visor) y `PageHero` en
  biblioteca, global y metodología. Redefine `--fg`, `--muted` y `--faint`
  para que el texto de dentro herede los tonos claros.
- Aurora: dos degradados radiales índigo/violeta que derivan despacio. Solo se
  animan mientras el visor de la home está en pantalla; en las páginas
  interiores quedan quietos.
- Retícula de 56 px enmascarada alrededor del visor: es el campo de tiro del
  visor, no un fondo de página. No se usa fuera del hero.
- Visor (`HeroScope`): dial con marcas, retícula que se desplaza hacia el
  puntero y conversiones reales del motor que rotan cada 3,6 s. Se oculta en
  móviles para que la calculadora quede cerca.
- La última línea del titular va en `--hero-accent`; nada de texto con degradado.

## Motion

- Momento principal: entrada del visor (escala, giro y desenfoque) y las cifras
  que ruedan al cambiar de ejemplo; el dial gira 45° por conversión.
- Continuidad: el resultado de la calculadora rueda dígito a dígito
  (`RollingNumber`, con el valor real en texto accesible), los selectores
  segmentados deslizan su indicador y las páginas cambian con
  `<ViewTransition default="page">` (salida 160 ms, entrada 380 ms) con la
  cabecera y la navegación inferior ancladas.
- El contenido del hero se aleja con `animation-timeline: view()` mientras la
  calculadora sube; sin soporte, no pasa nada.
- Curva `--ease` (cubic-bezier(0.16, 1, 0.3, 1)); sin rebotes.
- `prefers-reduced-motion`: sin bucles, sin desplazamientos, sin rotación del
  visor; las páginas solo funden y los números cambian sin rodar.

## Colors

- **Acento índigo (`--accent`)**: acciones primarias, foco, selección y el
  resultado principal (sobre `--accent-soft`). Es el único color de marca.
- **Neutros**: `--fg` para texto principal, `--muted` para texto secundario,
  `--faint` para pistas y metadatos. `--faint` (#71717a) es el gris más claro
  permitido para texto: cumple 4.5:1 sobre blanco.
- **Estados**: verde, ámbar y rojo solo para verificación, avisos y errores, en
  versión suave (fondo `*-soft` + borde claro + texto del color). Nunca como
  decoración.
- El estado nunca depende solo del color: los badges llevan texto y los errores
  un icono y mensaje.

## Typography

- Geist para todo el texto de interfaz; Geist Mono solo para números (resultados,
  métricas, constantes, fórmulas), con `tabular-nums`.
- Titulares en `font-semibold` con tracking negativo (`.display`). Nada de
  mayúsculas forzadas ni etiquetas mono en versalitas.
- Etiquetas (`.label`, `.field-label`): 0.75–0.8rem, peso 500, en caso normal.

## Layout

- Contenedor de 1200 px (`.site-container`). Escritorio: navegación superior.
  Móvil: cabecera compacta + navegación inferior (`.mobile-nav`).
- La home empieza con un hero breve y la calculadora justo debajo; los datos del
  registro solo se muestran en el hero a partir de `lg`.

## Elevation & Shapes

- Tarjetas: borde `--line` 1 px + `--shadow-sm`; la calculadora y el acceso usan
  `--shadow-md` y `rounded-2xl`.
- Radios: 6 px (código, chips pequeños), 8 px (botones, inputs), 12 px
  (tarjetas), 16 px (paneles principales), pill (badges, eyebrow).
- Sin degradados de color fuera del hero oscuro. El desenfoque solo se usa en
  la cabecera fija, la navegación inferior, la entrada del visor y la
  transición de página.

## Components

- **Botones**: `.btn-primary` (índigo), `.btn-secondary` (blanco con borde),
  `.btn-ghost`, `.btn-danger`. Una sola acción primaria por bloque.
- **Badges**: pill con punto de color; las capacidades de juego van sin punto
  (`before:hidden`) para no confundirse con un estado.
- **Selectores segmentados**: pista `--surface-muted` con la opción activa en
  blanco y sombra (`DPI de destino`, filtros de la biblioteca).
- **Métodos de conversión**: tarjetas seleccionables; la activa con borde
  índigo y fondo `--accent-soft`; las no disponibles atenuadas con su motivo.
- **Resultado**: `.result-surface` (índigo suave) con el número en Geist Mono y
  la escala cm/360 (`.cm-scale`) debajo.
- **Inputs**: borde `--line-strong`, foco con borde índigo y anillo de 3 px.

## Do's and Don'ts

Do:
- Mantener foco visible, labels, anuncios `aria-live` de resultados y
  `prefers-reduced-motion`.
- Usar los tokens de `globals.css` (`var(--…)`), no colores sueltos.

Don't:
- Añadir un segundo color de marca o usar el índigo como relleno decorativo.
- Volver a mayúsculas mono, esquinas a 0 px o al amarillo de señal.
- Usar cristal, glow o sombras grandes.
- Poner etiquetas o «eyebrows» encima de los titulares: el titular habla solo.
- Repetir una misma animación de entrada en cada sección.
