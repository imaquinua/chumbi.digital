// Descarga de un archivo comprado (resumen o modelo), con enlace firmado y vencible.
import { get } from '@vercel/blob';
import { leerEnlace } from '../lib/entrega.js';
import { leer } from '../lib/pedidos.js';
import { buscar } from '../lib/catalogo.js';

const TIPOS = { pdf: 'application/pdf', zip: 'application/zip' };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  const id = leerEnlace(req.query.t);
  const pedido = id && await leer(id);
  const producto = pedido && pedido.estado === 'entregado' && buscar(pedido.producto);
  if (!producto || !producto.archivo) return res.status(404).send('Este enlace no es válido o ya venció. Escríbeme a chumbi@imaquinua.com.');
  try {
    const r = await get(producto.archivo, { access: 'private' });
    const buf = Buffer.from(await new Response(r.stream).arrayBuffer());
    res.setHeader('Content-Type', TIPOS[producto.archivo.split('.').pop()] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${producto.archivo.split('/').pop()}"`);
    return res.status(200).send(buf);
  } catch (e) {
    console.error('descarga:', e && e.message);
    return res.status(503).send('No pude preparar la descarga. Intenta en un rato.');
  }
}
