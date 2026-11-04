# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Jugadores competitivos de shooters en primera persona (CS2, VALORANT, Apex Legends, Overwatch 2) que ya tienen una sensibilidad establecida en un juego y quieren trasladarla a otro sin perder la memoria muscular. Suelen estar en el escritorio, entre partidas o ajustando su configuración, y quieren un número concreto en menos de un minuto.

Audiencia secundaria: jugadores que vuelven tras un parón y necesitan reconstruir su cm/360 desde cero.

## Product Purpose

Convierte la sensibilidad del ratón entre juegos usando el cm/360 como referencia física común. Existe para sustituir las tablas copiadas de foros y las reglas de tres dudosas por una conversión trazable, con la constante de cada juego declarada y su estado de verificación visible. El éxito es que alguien obtenga un número defendible y entienda qué conserva y qué no.

## Positioning

Cada juego declara su constante de yaw y su fuente; lo que no está verificado se marca como experimental o no devuelve número. La calculadora funciona entera sin cuenta, sin backend y sin resultados inventados. La cuenta solo añade guardado.

## Operating Context

- Uso principal: escritorio o móvil, sesiones cortas y repetidas, a menudo con el juego abierto en otra ventana.
- El valor de referencia es el cm/360: la distancia física que recorre el ratón para girar 360°.
- El DPI del ratón y el FOV del juego forman parte de la conversión; el jugador los conoce o los consulta.
- La sensación de apuntado depende además de FOV, zoom, aceleración y respuesta del juego; el producto lo dice en vez de prometer equivalencia perfecta.
- Idioma de la interfaz: español.

## Capabilities and Constraints

- Tres métodos: distancia 360° (base), FOV aware y distancia de monitor. El método específico del juego permanece desactivado hasta tener una fórmula verificada.
- Fórmula base solo para modelos yaw: `cm360 = (360 × 2.54) / (DPI × sensitivity × yaw)`; inversa para obtener sensibilidad.
- Biblioteca de juegos con búsqueda, filtros por estado de verificación y enlaces a la calculadora.
- Herramienta global de cm/360 con equivalencias por juego y persistencia local transparente.
- Cuentas opcionales con Supabase Auth; perfiles guardados en Postgres con RLS, favoritos y un perfil preferido por juego.
- La calculadora nunca se bloquea con login ni con un modal.
- No se inventan constantes, fórmulas, compatibilidades ni precisión. El redondeo se explica y se ajusta a los decimales que acepta cada juego.
- Entradas validadas; nunca se muestra `NaN` ni `Infinity`.
- Requisitos: `prefers-reduced-motion`, foco visible, etiquetas accesibles y anuncio de resultados.
- Nombre: SensConverter (antes SensiCore), centralizado en `src/lib/brand.ts`.

## Brand Commitments

- Tono: directo, técnico y sin hype. Nada de promesas de «precisión perfecta» ni de gamificación.
- La marca es provisional; logo, nombre y color deben poder cambiarse sin tocar la UI.
- El contenido factual (constantes, fuentes, estados, límites) es parte del producto y no se sustituye por copy aspiracional.

## Evidence on Hand

- Registro real de juegos con yaw, fuente y estado de verificación en `src/lib/games/registry.ts`.
- Motor de conversión con pruebas en `src/lib/conversion/`.
- `SensConverter.md` como especificación funcional.
- No hay testimonios, clientes, métricas de uso ni precios. No deben fabricarse.

## Product Principles

1. El número primero: la conversión se ve y se puede copiar sin leer nada más.
2. La trazabilidad es la característica: constante, fuente y estado acompañan siempre al resultado.
3. Sin cuenta no falta nada; con cuenta solo se añade memoria.
4. Lo no verificado se declara, no se disimula.
5. La interfaz no promete una sensación que las matemáticas no pueden garantizar.

## Accessibility & Inclusion

- WCAG AA en texto y controles; foco visible; navegación completa por teclado.
- Respeto de `prefers-reduced-motion`.
- Resultados anunciados con `aria-live` sin interrumpir la escritura.
