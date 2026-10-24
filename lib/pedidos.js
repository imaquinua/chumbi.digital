// Pedidos en Vercel Blob PRIVADO: un JSON por pedido en pedidos/<id>.json.
import { put, get } from '@vercel/blob';
import crypto from 'node:crypto';

const ruta = id => `pedidos/${id}.json`;

export function nuevoId() {
  return 'p_' + crypto.randomBytes(9).toString('base64url');
}

export async function leer(id) {
  if (!/^p_[A-Za-z0-9_-]{12}$/.test(String(id || ''))) return null;
  try {
    const r = await get(ruta(id), { access: 'private' });
    return r && r.stream ? JSON.parse(await new Response(r.stream).text()) : null;
  } catch { return null; }
}

export async function guardar(pedido) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('Falta BLOB_READ_WRITE_TOKEN');
  pedido.actualizado = new Date().toISOString();
  await put(ruta(pedido.id), JSON.stringify(pedido, null, 2), {
    access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'application/json',
  });
  return pedido;
}
