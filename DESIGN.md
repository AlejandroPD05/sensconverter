---
name: SensiCore
description: Hoja de datos de sensibilidad entre juegos, impresa como el gráfico de un partido en directo.
colors:
  paper: "#e9e7de"
  paper-raise: "#f3f1e8"
  paper-sunk: "#dedbd0"
  ink: "#12140f"
  ink-soft: "#33362c"
  muted: "#54574d"
  faint: "#666a5e"
  signal-yellow: "#f2e23e"
  signal-yellow-soft: "#f8f0a2"
  on-field: "#12140f"
  verified-green: "#0b6a3c"
  pending-amber: "#8a5a00"
  error-red: "#a51f18"
  band-ink: "#e9e7de"
  band-muted: "#a9ac9f"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 5vw, 3.6rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.82rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.58rem"
    fontWeight: 500
    letterSpacing: "0.08em"
rounded:
  none: "0"
  sm: "2px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
  button-signal:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.on-field}"
    rounded: "{rounded.sm}"
    padding: "8px 14px"
  field-input:
    backgroundColor: "{colors.paper-raise}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 11px"
  result-surface:
    backgroundColor: "{colors.signal-yellow}"
    textColor: "{colors.on-field}"
    rounded: "{rounded.none}"
    padding: "20px"
---

# Design System: SensiCore

## Overview

**Creative North Star: "La hoja de retransmisión"**

SensiCore se lee como la hoja de estadísticas que un equipo de retransmisión imprime antes de un partido: papel hueso, reglas finas, cifras alineadas y un único campo de amarillo de señal reservado para lo que está pasando en directo. No hay cristal, no hay degradados de color, no hay sombras difusas: la jerarquía la construyen la escala tipográfica, las hairlines de 1 px y el contraste entre papel y tinta.

La densidad es deliberada. La página principal muestra la calculadora en el primer viewport junto a la evidencia que la sostiene (constantes, estado de verificación, fórmula). El visitante no tiene que creer un número: puede ver de dónde sale. Esa honestidad es también una decisión visual — el sistema prefiere una tabla a una tarjeta de marketing.

El amarillo es escaso por diseño. Aparece en la franja «EN DIRECTO» de la cabecera, en el resultado de la conversión y en el elemento activo de una lista; en ningún otro sitio. Su rareza es lo que lo convierte en señal.

**Key Characteristics:**
- Papel hueso y tinta; un solo campo de señal amarillo.
- Radios de 0–2 px, hairlines de 1 px, cero sombras.
- Archivo para la voz; Martian Mono para datos, etiquetas y cifras.
- Estructura de tabla: cabecera de banda negra, cuerpo de datos, pie de metodología.
- Movimiento mínimo, de una sola pasada, con `prefers-reduced-motion` respetado.

## Colors

Paleta de impresión deportiva: un neutral cálido dominante, tinta casi negra y un amarillo de alta visibilidad que solo marca lo vivo.

### Primary
- **Señal amarilla** (`#f2e23e`): la franja en directo, el panel de resultado, el perfil preferido y el método seleccionado. Nunca como fondo de página ni como color de texto sobre papel.
- **Señal suave** (`#f8f0a2`): relleno de apoyo cuando el amarillo puro resulta demasiado agresivo en áreas grandes (estado activo de fila, marcas de selección).

### Neutral
- **Papel hueso** (`#e9e7de`): fondo de página.
- **Papel elevado** (`#f3f1e8`): paneles, tarjetas y campos.
- **Papel hundido** (`#dedbd0`): bloques de fórmula y zonas de lectura secundaria.
- **Tinta** (`#12140f`): texto principal, bordes de énfasis, botón primario, banda de cabecera.
- **Tinta suave** (`#33362c`): texto de cuerpo en superficies claras y texto secundario sobre oscuro.
- **Apagado** (`#54574d`): párrafos de apoyo, descripciones, notas.
- **Tenue** (`#666a5e`): metadatos, fechas, microcopy; nunca por debajo de 4.5:1.
- **Tinta de banda** (`#e9e7de`) y **banda apagada** (`#a9ac9f`): texto sobre la cabecera y los pies negros.

### Tertiary
- **Verde verificado** (`#0b6a3c`): insignia «Verificado», confirmaciones y estados correctos.
- **Ámbar pendiente** (`#8a5a00`): insignia «Experimental», avisos y datos sin verificar.
- **Rojo error** (`#a51f18`): errores de formulario, acciones destructivas y avisos de fallo.

### Named Rules
**La regla del campo único.** El amarillo de señal ocupa menos del 10 % de cualquier pantalla y solo aparece donde hay un valor en vivo, un resultado o una selección activa. Si dudas, no lo uses.

**La regla del contraste oscurecido.** Los colores de estado se oscurecen hasta cumplir AA sobre papel hueso; nunca se aclaran para «verse mejor».

## Typography

**Display Font:** Archivo (con `ui-sans-serif, system-ui, sans-serif`)
**Body Font:** Archivo (misma familia; el peso y el tamaño hacen la jerarquía)
**Label/Mono Font:** Martian Mono (con `ui-monospace, monospace`)

**Character:** Archivo aporta una voz de titular compacta y deportiva, con tracking negativo que la acerca a una cabecera de periódico; Martian Mono aporta la precisión de una hoja de datos. El contraste no es decorativo: separa la prosa de las cifras.

### Hierarchy
- **Display** (700, `clamp(2.2rem, 5vw, 3.6rem)`, 0.98, tracking −0.035em): titulares de página, una o dos líneas, con salto manual.
- **Headline** (700, 1.5rem, 1.1, tracking −0.025em): títulos de sección y de panel.
- **Title** (700, 0.95–1.05rem, 1.2): nombres de juego, de perfil y de método.
- **Body** (400, 0.78–0.92rem, 1.6): párrafos y descripciones; medida máxima ~70ch.
- **Label** (Martian Mono 500, 0.52–0.62rem, tracking 0.06–0.08em, mayúsculas): etiquetas de campo, cabeceras de tabla, metadatos, franja en directo y cifras.

### Named Rules
**La regla de la cifra mono.** Todo número que el usuario vaya a comparar o copiar (sensibilidad, DPI, cm/360, yaw) se compone en Martian Mono con `font-variant-numeric: tabular-nums`. La prosa nunca va en mono.

**La regla del tracking.** El tracking negativo se reserva a los titulares display; las etiquetas en mono siempre llevan tracking positivo.

## Layout

Contenedor único de 1240 px con padding lateral fluido (`clamp(1rem, 4vw, 2rem)`). La retícula base es de una columna en móvil y se abre a dos o tres columnas a partir de 768 px; las cabeceras de página usan `1.6fr / 1fr` con el párrafo alineado al borde derecho.

El ritmo vertical es de 24–40 px entre bloques y 16–20 px dentro de un panel. Las secciones se separan con una regla de 2 px en tinta; dentro de un panel, las divisiones son de 1 px y color `--line`. Las tablas colapsan columnas secundarias en móvil (fuente y eDPI se ocultan) en lugar de provocar scroll horizontal.

La cabecera es una banda negra de altura compacta con la marca a la izquierda, la navegación en mono centrada y la cuenta a la derecha; debajo, una franja amarilla de 36 px muestra la conversión viva. En móvil, la navegación se sustituye por una barra inferior fija con cuatro destinos.

## Elevation & Depth

El sistema es plano. No existe ningún token de sombra difusa ni `backdrop-filter`. La profundidad se expresa con tres recursos: el cambio de tono entre papel, papel elevado y papel hundido; las hairlines de 1 px que separan planos; y el contraste tinta/papel de la banda de cabecera. El único `box-shadow` del sistema es el subrayado interior de 3 px que marca el campo enfocado o inválido: es una regla de estado, no una elevación.

### Named Rules
**La regla del plano.** Si un elemento necesita destacar, cambia de tono o gana un borde; no gana una sombra. Una sombra difusa, un halo o un `backdrop-filter` son errores de sistema, no variantes.

## Shapes

Radios de 0 a 2 px: los botones, campos y paneles son prácticamente rectangulares, con una esquina apenas rebajada para evitar el filo de un `div` sin tratar. Los bordes son de 1 px (`--line`, `--line-strong`) o de 2 px en tinta para las divisiones estructurales.

No hay píldoras, círculos decorativos ni recortes orgánicos. La única geometría circular es la del punto de la franja en directo y el avatar de inicial, ambos cuadrados o de 4 px como máximo. Los iconos son trazos de Lucide a 14–18 px, siempre con `aria-hidden` cuando acompañan texto.

## Components

### Buttons
- **Shape:** rectángulo de 2 px de radio, sin sombra.
- **Primary:** fondo tinta, texto papel, padding `10px 16px`, peso 600, tamaño 0.78–0.85rem. Es la acción que avanza el flujo (convertir, guardar, abrir calculadora).
- **Secondary:** fondo transparente, borde de 1 px en tinta, texto tinta; mismo padding.
- **Ghost:** sin borde ni fondo hasta el hover, que pinta papel elevado. Se usa en acciones terciarias dentro de tarjetas (editar, duplicar).
- **Signal:** fondo amarillo, texto tinta. Reservado a la acción principal dentro de la franja o del resultado.
- **Hover / Focus:** cambio de tono en 120 ms; el foco es un contorno de 2 px en tinta con offset de 2 px, nunca un halo.
- **Disabled:** opacidad reducida y cursor `not-allowed`; no cambia de forma.

### Chips / Badges
- **Style:** rectángulo de 2 px, borde de 1 px, mono en mayúsculas a 0.52–0.58rem, con un cuadrado de 4 px como marca de estado.
- **State:** verde para verificado, ámbar para experimental, rojo para error, amarillo para «preferido». El color nunca es el único portador: siempre hay texto.

### Cards / Containers
- **Corner Style:** 2 px como máximo.
- **Background:** papel elevado para contenido; papel hundido para fórmulas y lecturas secundarias.
- **Shadow Strategy:** ninguna (ver Elevation).
- **Border:** 1 px `--line-strong` por defecto; 1 px en tinta para el panel que contiene la tarea principal.
- **Internal Padding:** 16–20 px; 12 px en móvil.

### Inputs / Fields
- **Style:** fondo papel elevado, borde de 1 px `--line-strong`, radio 2 px, padding `10px 12px`, texto 0.85rem. Los DPI usan `step={1}`.
- **Focus:** borde en tinta y contorno de 2 px desplazado; sin glow.
- **Error:** borde rojo, mensaje con `role="alert"` y un cuadrado rojo como prefijo.

### Navigation
Banda negra con la marca en Archivo 700 y los enlaces en Martian Mono 0.62rem mayúsculas, tracking 0.06em. El enlace activo se marca con una regla inferior amarilla de 2 px y `aria-current="page"`. En móvil, la misma paleta se invierte: barra inferior sobre papel elevado con borde superior de 1 px y el destino activo en tinta con marca amarilla.

### Signature: franja en directo
Una banda amarilla de 36 px bajo la cabecera que muestra la conversión actual (origen, destino, sensibilidad y cm/360) en Martian Mono. La alimenta un store externo (`src/lib/live-readout.ts`) al que la calculadora publica su estado; en rutas sin calculadora muestra la referencia por defecto. Es el gesto que identifica el producto: la página se comporta como un marcador en vivo.

### Signature: escala cm/360
Bajo el resultado, una escala horizontal de 5 a 65 cm con marcas cada 5 cm y un marcador de 2 px en la posición del valor actual. Sirve para leer el resultado como una medida física, no como un número abstracto.

## Do's and Don'ts

### Do:
- **Do** usar el amarillo solo para lo vivo, lo seleccionado o el resultado.
- **Do** componer cifras en Martian Mono con `tabular-nums`.
- **Do** separar secciones con una regla de 2 px en tinta y paneles con 1 px.
- **Do** mantener el foco visible con contorno de 2 px en tinta y offset de 2 px.
- **Do** respetar `prefers-reduced-motion`: sin desplazamientos ni transiciones largas.
- **Do** dejar que la tabla sea la protagonista cuando hay datos que comparar.

### Don't:
- **Don't** añadir sombras, halos, `backdrop-filter` ni degradados de color.
- **Don't** subir los radios por encima de 2 px ni introducir píldoras.
- **Don't** usar el amarillo como fondo de página, texto largo o color de estado.
- **Don't** poner prosa en mono ni cifras en la fuente de texto.
- **Don't** inventar insignias de compatibilidad, constantes o datos de relleno.
- **Don't** añadir un kicker o antetítulo sobre un titular: el titular se sostiene solo.
