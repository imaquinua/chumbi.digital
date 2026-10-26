import { diagnosticar } from '../lib/agente.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, mensaje: 'Método no permitido.' }); }
  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress;
  const r = await diagnosticar(req.body, ip);
  res.status(r.status).json(r);
}
