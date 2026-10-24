import { procesar } from '../lib/suscribir.js';
import { almacenBlob } from '../lib/almacen-blob.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, mensaje: 'Método no permitido.' }); }
  const r = await procesar(req.body, almacenBlob());
  res.status(r.status).json(r);
}
