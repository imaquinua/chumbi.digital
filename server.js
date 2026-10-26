// Servidor local / VPS propio: sirve public/ y escribe data/newsletter/suscriptores.txt (fuera de public).
import http from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { procesar } from './lib/suscribir.js';
import { almacenArchivo } from './lib/almacen-archivo.js';
import { diagnosticar } from './lib/agente.js';
import { responder } from './lib/pregunta.js';

const RAIZ = path.dirname(fileURLToPath(import.meta.url));
const PUB = path.join(RAIZ, 'public');
const TXT = process.env.SUSCRIPTORES_TXT || path.join(RAIZ, 'data', 'newsletter', 'suscriptores.txt');
const PUERTO = Number(process.env.PORT || 3000);
const almacen = almacenArchivo(TXT);
const TIPOS = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.webm': 'video/webm', '.mp4': 'video/mp4', '.txt': 'text/plain; charset=utf-8', '.woff2': 'font/woff2', '.webp': 'image/webp', '.json': 'application/json' };

function json(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname === '/api/suscribir') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, mensaje: 'Método no permitido.' });
    let datos = '';
    for await (const c of req) { datos += c; if (datos.length > 4096) return json(res, 413, { ok: false, mensaje: 'Demasiado grande.' }); }
    let body; try { body = JSON.parse(datos); } catch { return json(res, 400, { ok: false, mensaje: 'Solicitud inválida.' }); }
    const r = await procesar(body, almacen);
    return json(res, r.status, r);
  }
  if (url.pathname === '/api/pregunta') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, mensaje: 'Método no permitido.' });
    let datos = '';
    for await (const c of req) { datos += c; if (datos.length > 4096) return json(res, 413, { ok: false, mensaje: 'Demasiado grande.' }); }
    let body; try { body = JSON.parse(datos); } catch { return json(res, 400, { ok: false, mensaje: 'Solicitud inválida.' }); }
    const r = await responder(body, req.socket.remoteAddress);
    return json(res, r.status, r);
  }
  if (url.pathname === '/api/agente') {
    if (req.method !== 'POST') return json(res, 405, { ok: false, mensaje: 'Método no permitido.' });
    let datos = '';
    for await (const c of req) { datos += c; if (datos.length > 4096) return json(res, 413, { ok: false, mensaje: 'Demasiado grande.' }); }
    let body; try { body = JSON.parse(datos); } catch { return json(res, 400, { ok: false, mensaje: 'Solicitud inválida.' }); }
    const r = await diagnosticar(body, req.socket.remoteAddress);
    return json(res, r.status, r);
  }
  let p = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(PUB, p);
  if (!f.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  try {
    const buf = await fs.readFile(f);
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(f)] || 'application/octet-stream' });
    res.end(buf);
  } catch { res.writeHead(404, { 'Content-Type': 'text/plain' }); res.end('No encontrado'); }
}).listen(PUERTO, () => console.log(`http://localhost:${PUERTO}  ->  ${TXT}`));
