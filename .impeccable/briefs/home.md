# Surface brief — calculadora (ruta `/`)

## Scope

- Ruta: `/` (`src/app/page.tsx`, `src/components/calculator/calculator.tsx`) y el armazón compartido (`layout`, `site-header`, `site-footer`).
- Modo: **Operate**. El visitante llega con una tarea: pasar su sensibilidad de un juego a otro y salir. La marca vive en el detalle, no en la expresividad.
- Fuera de alcance: motor de conversión, registro de juegos, auth, RLS, textos legales y precios (no hay).

## Audiencia, trabajo y acción

- Jugador de shooters (CS2, VALORANT, Apex) que ya tiene una sensibilidad y quiere la equivalente en otro juego, o que quiere fijar un cm/360 como referencia.
- Trabajo: leer el resultado, comprobarlo con el cm/360 y decidir si lo aplica. Frecuencia baja-media, en escritorio al lado del juego, y en móvil de pie.
- Prueba/contenido real: constantes de yaw con fuente, estado de verificación, fórmula base, límites. Nada de datos inventados.
- Restricciones: la calculadora funciona sin cuenta y sin Supabase; los `data-testid` y textos de los E2E no cambian; nada de prometer equivalencia de sensación.

## Dirección elegida

**Hoja de estadísticas de retransmisión**: la página se lee como el gráfico de datos de un partido, no como una landing. Papel hueso, tinta, un único campo amarillo de señal, hairlines de 1 px, números en mono tabular y una franja «en directo» que la propia calculadora alimenta. El momento memorable: el resultado amarillo con el cm/360 marcado sobre una escala de medición.

## Decisiones abiertas

- Ninguna bloqueante. Si el nombre «SensiCore» cambia, los tokens y el logo están centralizados.

## Direction contract

THESIS: la calculadora se presenta como la hoja de datos de un partido en directo, y rechaza el hero de tarjetas con degradado y cristal de las webs de conversores. La estructura es la de una tabla de estadísticas: cabecera, franja de directo, cuerpo de datos, pie de metodología.

OWN-WORLD: papel hueso #e9e7de con lavado de tinta al 5 %, tinta #12140f, un único amarillo de señal #f2e23e que solo aparece en la franja en directo, el resultado y el método activo; verde/ámbar/rojo oscurecidos para estados. Radios 0–2 px, hairlines de 1 px, sin sombras, sin degradados de color, sin cristal. Archivo en pesos 600–700 para titulares con tracking negativo; Martian Mono en mayúsculas espaciadas para etiquetas, cifras y la franja en directo. Componentes: banda negra de cabecera, celdas de tabla con regla inferior, badges con punto cuadrado, botones de bloque sin radio.

STORY: el visitante entiende en el primer vistazo que esto es una herramienta de medición entre juegos; ve su conversión en el mismo sitio donde está la evidencia (yaw, estado, fórmula) y se va sabiendo qué ha cambiado y qué no.

FIRST VIEWPORT: a 1440 px, banda negra de 56 px con marca a la izquierda y navegación mono centrada; franja amarilla de 36 px que ya muestra la conversión viva. Debajo, a la izquierda, titular de dos líneas a 67 px y párrafo de 3 líneas con dos botones; a la derecha, lista de hechos con cifras mono alineadas a la derecha. Cierra el viewport la cabecera de la calculadora con su borde superior negro y el campo de origen. La acción primaria (convertir) está dentro del viewport; la secundaria, ver juegos, a su lado.

FORM: hoja de estadísticas de retransmisión, séptima de siete en la lista ordenada (las seis restantes fueron los challengers del catálogo); el catálogo aportó a esta dirección la densidad de tabla y el valor de señal de un solo campo de color. seed:4d843d7aa5e21fc2

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
