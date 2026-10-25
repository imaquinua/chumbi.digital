# Piezas de video para chumbi.digital (Higgsfield)

El sitio ya tiene los espacios reservados. Cada espacio busca su archivo en `public/media/`. Si el archivo no existe, se muestra el respaldo tipográfico y no se ve ningún error. Para publicar una pieza, basta con dejar el archivo con el nombre exacto y redesplegar.

## Reglas para todas las piezas

- **Marca 1a:** monocromo (tinta #141414 sobre papel #FAFAF8). El único acento es el verde #0A7A3E, en un solo elemento por pieza.
- **Idea madre:** *medir es intervenir*. Algo cambia porque se lo mira o se lo mide. El movimiento tiene que significar, no decorar.
- **Sin texto dentro del video.** El texto lo pone la web, en Archivo.
- **Sin caras ni manos con IA,** para evitar el valle inquietante. Usar objetos, instrumentos, materia y luz.
- **Loop limpio** de 6 a 8 s, cámara lenta y sin cortes.
- **Exportar:**
  - `.webm` (VP9) y `.mp4` (H.264) de respaldo, sin audio.
  - Peso máximo: 1,5 MB para el hero y 900 KB para las fichas.
  - Un póster `.jpg` del primer fotograma, de menos de 80 KB.

## Pieza 1 · Hero (opcional)

Desde el 25-10, el hero es motion en código (`public/assets/hero.js`): una regla cruza la portada, el título gana peso y la tinta se ordena en barras. Este prompt queda como alternativa si se quiere reemplazar por video. Para eso habría que volver a poner un espacio `data-video` en el hero.

- **Formato:** 4:5 vertical (1080×1350).
- **Prompt:**
  > Minimal studio macro shot, off-white paper background (#FAFAF8), a thin precision measuring rule made of black anodized metal slowly slides across a field of fine black ink particles suspended in still air; wherever the rule passes, the particles condense and gain mass into solid heavy black bars, behind it they stay light and scattered. One single thin green (#0A7A3E) laser line marks the measuring edge. Soft top light, shallow depth of field, slow continuous camera dolly, seamless 8-second loop, monochrome editorial aesthetic, no text, no people.

## Pieza 2 · Kit E³ (`public/media/kit-e3.webm`)

- **Formato:** 16:7 panorámico (1600×700).
- **Prompt:**
  > Isometric black-and-white paper architecture: a staircase of five stacked translucent white blocks on off-white background, a soft beam of light climbs step by step, each step it touches turns from outline to solid matte black. One step glows faint green (#0A7A3E). Slow orbit camera, seamless loop, minimal, editorial, no text.

## Pieza 3 · Cancha Estratégica (`public/media/cancha-estrategica.webm`)

- **Formato:** 16:7.
- **Prompt:**
  > Top-down view of a minimal football pitch drawn with thin black lines on off-white paper, divided in three thirds; eleven small black matte tokens glide into formation, one token in green (#0A7A3E) moves last and locks into place; the third where the ball sits gently darkens. Slow, precise, seamless loop, monochrome, no text, no players.

## Pieza 4 · Lector de Indicadores (`public/media/lector-de-indicadores.webm`)

- **Formato:** 16:7.
- **Prompt:**
  > Abstract bell curve made of thousands of tiny black dots on off-white background; most dots drift softly as noise inside the curve, a single dot beyond two standard deviations turns green (#0A7A3E) and holds still while the rest keep moving. Slow camera push-in, seamless loop, scientific minimal aesthetic, no text, no numbers.

## Pieza 5 · Método CLARO (`public/media/metodo-claro.webm`)

- **Formato:** 16:7.
- **Prompt:**
  > Five thin black glass plates standing in a row on off-white background, a beam of white light passes through them one by one and exits as a sharp, focused line, the final plate tinted green (#0A7A3E). Slow lateral tracking shot, seamless loop, minimal, precise, no text.

## Pieza 6 · Pack completo (`public/media/pack-completo.webm`)

- **Formato:** 16:7.
- **Prompt:**
  > Four minimal black objects (a staircase, a pitch token, a bell curve, a glass plate) slide together on off-white paper and lock into one compact black block with a single green (#0A7A3E) seam. Slow, satisfying, seamless loop, editorial product shot, no text.

## Orden sugerido

Primero el hero, para validar la dirección. Si funciona, siguen las cinco fichas con la misma luz, el mismo papel y el mismo ritmo.
