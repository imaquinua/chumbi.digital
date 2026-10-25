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

## Pieza 1 · Hero: la gota (`public/media/hero.webm` + `hero.mp4`)

Hoy el hero usa el fotograma `public/media/hero.jpg` (Higgsfield, gpt_image_2_5, 25-10). El video debe partir de ese fotograma como imagen inicial, para que conserve la misma estética.

- **Formato:** 16:9 (1920×1080), de 6 a 8 s, loop y sin audio.
- **Modelo sugerido:** FLUX 3 Video con `start_image` = el fotograma de la gota. La cotización del 25-10 fue de 96 créditos por 12 s en 1080p; la de 6 a 8 s se confirma antes de generar.
- **Prompt:**
  > Same scene and framing as the start image. A single drop of black ink falls slowly along the thin green measuring line, touches the paper and blooms into a crisp radial ink splash; the splash breathes subtly and then calms, ready to loop. Extremely slow, elegant, macro, soft top light, shallow depth of field, off-white paper, monochrome with the single green hairline. No text, no people, no camera shake.

El resto del recorrido (nube, regla, barras, campana de Gauss y gota final) es motion en código: `public/assets/relato.js`.

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
