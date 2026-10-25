// Crea el pedido y devuelve la URL de pago de Mercado Pago (Checkout Pro o suscripción).
import { buscar } from '../lib/catalogo.js';
import { limpiar } from '../lib/suscribir.js';
import { crearPreferencia, crearSuscripcion } from '../lib/mp.js';
import { nuevoId, guardar } from '../lib/pedidos.js';

const RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[A-Za-z]{2,}$/;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, mensaje: 'Método no permitido.' }); }
  const b = req.body && typeof req.body === 'object' ? req.body : {};
  if (b.web) return res.status(400).json({ ok: false, mensaje: 'Solicitud inválida.' });
  const producto = buscar(b.producto);
  if (!producto) return res.status(400).json({ ok: false, mensaje: 'Ese producto no existe.' });
  if (producto.estado !== 'venta') return res.status(400).json({ ok: false, mensaje: 'Ese producto todavía no está a la venta.' });
  const correo = limpiar(b.correo);
  if (!correo || correo.length > 254 || !RE.test(correo)) return res.status(400).json({ ok: false, mensaje: 'Ese correo no parece válido. Revísalo.' });

  const base = process.env.SITIO_URL || 'https://chumbi.digital';
  const pedido = { id: nuevoId(), producto: producto.id, correo, monto: producto.precio, estado: 'creado', creado: new Date().toISOString() };
  try {
    await guardar(pedido);
    const r = producto.tipo === 'fractional'
      ? await crearSuscripcion({ pedido: pedido.id, producto, correo, base })
      : await crearPreferencia({ pedido: pedido.id, producto, correo, base });
    pedido.mp = r.id;
    await guardar(pedido);
    return res.status(200).json({ ok: true, url: r.init_point });
  } catch (e) {
    console.error('checkout:', e && e.message);
    return res.status(503).json({ ok: false, mensaje: 'No pude abrir el pago ahora. Intenta de nuevo en un rato.' });
  }
}
