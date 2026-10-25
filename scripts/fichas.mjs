// Genera el HTML estático que depende del catálogo: las filas de productos en la portada y la tienda,
// y una ficha larga por producto en venta (/tienda/<slug>/). Correr después de editar lib/catalogo.js:
//   node scripts/fichas.mjs
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CATALOGO, LINEAS, aDolares } from '../lib/catalogo.js';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUB = path.join(RAIZ, 'public');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const soles = n => 'S/ ' + n.toLocaleString('es-PE');

function precio(p) {
  if (p.estado !== 'venta') return '<div class="precio-linea"><span class="estado">Pronto</span></div>';
  return `<div class="precio-linea"><b>${soles(p.precio)}</b><small>≈ US$ ${aDolares(p.precio)}</small></div>`;
}

// conBoton: en la tienda el botón abre el pago; en la portada lleva a la ficha larga.
function fila(p, i, conBoton) {
  const destacado = p.slug === 'pack-completo' ? ' class="destacado"' : '';
  const titulo = p.estado === 'venta' ? `<a href="/tienda/${p.slug}/">${esc(p.nombre)}</a>` : esc(p.nombre);
  let accion = '';
  if (p.estado === 'venta') {
    accion = conBoton
      ? `<button class="boton" type="button" data-comprar="${p.id}" data-nombre="${esc(p.nombre)}" data-precio="${p.precio}">Comprar</button>`
      : `<a class="boton sec" href="/tienda/${p.slug}/">Ver kit</a>`;
  }
  return `        <li${destacado} data-aparece style="--d:${(i * 0.06).toFixed(2)}s"><div><h3>${titulo}</h3><p>${esc(p.bajada)}</p></div>${precio(p)}${accion}</li>`;
}

function lista(linea, conBoton) {
  const items = CATALOGO.filter(p => p.linea === linea);
  return `\n      <ul class="productos">\n${items.map((p, i) => fila(p, i, conBoton)).join('\n')}\n      </ul>\n`;
}

async function rellenar(archivo, conBoton) {
  const f = path.join(PUB, archivo);
  let html = await fs.readFile(f, 'utf8');
  for (const linea of Object.keys(LINEAS)) {
    const re = new RegExp(`(<!--catalogo:${linea}-->)[\\s\\S]*?(<!--/catalogo:${linea}-->)`);
    html = html.replace(re, `$1${lista(linea, conBoton)}$2`);
  }
  await fs.writeFile(f, html);
}

function ficha(p) {
  const linea = LINEAS[p.linea];
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(p.nombre)} · Chumbi</title>
<meta name="description" content="${esc(p.bajada)}">
<link rel="canonical" href="https://chumbi.digital/tienda/${p.slug}/">
<meta property="og:title" content="${esc(p.nombre)} · Chumbi">
<meta property="og:description" content="${esc(p.bajada)}">
<meta property="og:image" content="https://chumbi.digital/og.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,100..900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/modelos/modelos.css">
<link rel="stylesheet" href="/assets/sitio.css">
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Product', name: p.nombre, description: p.bajada,
    brand: { '@type': 'Person', name: 'Jorge Luis Chumbiauca' },
    offers: { '@type': 'Offer', price: p.precio, priceCurrency: 'PEN', availability: 'https://schema.org/InStock', url: `https://chumbi.digital/tienda/${p.slug}/` },
  })}</script>
</head>
<body>
<div class="progreso" aria-hidden="true"></div>
<header class="barra">
  <div class="wrap">
    <a class="marca" href="/" aria-label="Chumbi, inicio">chu<span class="m">m</span>bi</a>
    <nav aria-label="Principal"><ul><li><a href="/organizacion/">La organización</a></li><li><a href="/tienda/">Tienda</a></li><li><a class="cta-nav" href="/organizacion/">Entrar gratis</a></li></ul></nav>
  </div>
</header>
<main>
  <section class="portada">
    <div class="wrap">
      <p class="kicker"><a class="enlace" href="/tienda/">Tienda</a> · ${esc(linea.nombre)}</p>
      <h1><span class="revela"><span>${esc(p.nombre)}</span></span></h1>
      <p class="lead" data-aparece style="--d:.2s">${esc(p.resultado)}</p>
    </div>
  </section>
  <section class="bloque">
    <div class="wrap">
      <figure class="pieza ancha" data-video="/media/${p.slug}.webm" data-aparece>
        <div class="respaldo"><p class="cifra visto" aria-hidden="true">${soles(p.precio)}</p></div>
        <figcaption>${esc(p.nombre)}</figcaption>
      </figure>
    </div>
  </section>
  <section class="bloque">
    <div class="wrap ficha-larga">
      <dl>
        <dt>El problema</dt><dd>${esc(p.problema)}</dd>
        <dt>Para quién</dt><dd>${esc(p.paraQuien)}</dd>
        <dt>Qué incluye</dt><dd><ul>${p.incluye.map(i => `<li>${esc(i)}</li>`).join('')}</ul></dd>
        <dt>Antes de comprar</dt><dd>La ficha del modelo es gratis. <a class="enlace" href="${p.ficha}">Pruébala primero</a>.</dd>
      </dl>
      <aside class="caja-compra">
        <p class="precio-grande">${soles(p.precio)} <small>pago único</small></p>
        <p class="nota">≈ US$ ${aDolares(p.precio)} · descarga inmediata · Mercado Pago (tarjeta, Yape, PagoEfectivo)</p>
        <a class="boton" href="/tienda/?comprar=${p.id}">Comprar el kit <span aria-hidden="true">→</span></a>
      </aside>
    </div>
  </section>
</main>
<footer><div class="wrap"><span>chumbi.digital · 2026</span><span><a href="/tienda/">Volver a la tienda</a></span></div></footer>
<script src="/assets/sitio.js" defer></script>
</body>
</html>
`;
}

await rellenar('index.html', false);
await rellenar('tienda/index.html', true);
for (const p of CATALOGO.filter(p => p.estado === 'venta')) {
  const dir = path.join(PUB, 'tienda', p.slug);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, 'index.html'), ficha(p));
}
console.log('Fichas generadas:', CATALOGO.filter(p => p.estado === 'venta').map(p => p.slug).join(', '));
