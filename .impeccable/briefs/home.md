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

**Herramienta SaaS clara** (Fase 10, sustituye a la «hoja de retransmisión»): fondo blanco, grises zinc, un único acento índigo, Geist + Geist Mono para números, tarjetas redondeadas con borde fino. El momento memorable: el resultado en Geist Mono sobre índigo suave con el cm/360 marcado en la escala. Reglas en `DESIGN.md`; capturas actuales en `.impeccable/review/`.

## Decisiones abiertas

- Ninguna bloqueante. Si el nombre «SensiCore» cambia, los tokens y el logo están centralizados.

## Direction contract (histórico)

El contrato original describía la «hoja de retransmisión» y ya no aplica. La dirección vigente está en `DESIGN.md`.
