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

Estilo de herramienta SaaS moderna en claro: fondo blanco, grises neutros
(zinc), un único acento índigo y tarjetas con borde fino y sombra mínima. La
calculadora es la protagonista; todo lo demás acompaña.

`src/app/globals.css` es la implementación. Este archivo describe las reglas.
Sustituye al sistema anterior "hoja de retransmisión" (papel hueso y amarillo
de señal) y al "Liquid Glass" oscuro original; ninguno de los dos se debe
reintroducir. Las capturas de `.impeccable/` corresponden al sistema anterior.

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
- Sin degradados de color salvo el lavado índigo muy tenue detrás del hero
  (`.page-backdrop`). El desenfoque solo se usa en la cabecera fija y la
  navegación inferior.

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
