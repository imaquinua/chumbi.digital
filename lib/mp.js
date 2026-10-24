// Mercado Pago por REST (sin SDK). Requiere MP_ACCESS_TOKEN y MP_WEBHOOK_SECRET.
import crypto from 'node:crypto';

const API = 'https://api.mercadopago.com';

async function mp(metodo, ruta, cuerpo, idempotencia) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) throw new Error('Falta MP_ACCESS_TOKEN');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  if (idempotencia) headers['X-Idempotency-Key'] = idempotencia;
  const r = await fetch(API + ruta, { method: metodo, headers, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`MP ${metodo} ${ruta} ${r.status}: ${datos.message || ''}`);
  return datos;
}

// Pago único con Checkout Pro.
export function crearPreferencia({ pedido, producto, correo, base }) {
  return mp('POST', '/checkout/preferences', {
    items: [{ id: producto.id, title: producto.nombre, quantity: 1, unit_price: producto.precio, currency_id: 'PEN' }],
    payer: { email: correo },
    external_reference: pedido,
    back_urls: {
      success: `${base}/gracias/?pedido=${pedido}`,
      pending: `${base}/gracias/?pedido=${pedido}`,
      failure: `${base}/tienda/?error=pago`,
    },
    auto_return: 'approved',
    notification_url: `${base}/api/webhook`,
    statement_descriptor: 'CHUMBI.DIGITAL',
  }, pedido);
}

// Suscripción mensual sin plan, con pago pendiente: devuelve init_point para que el cliente pague.
export function crearSuscripcion({ pedido, producto, correo, base }) {
  return mp('POST', '/preapproval', {
    reason: producto.nombre,
    external_reference: pedido,
    payer_email: correo,
    auto_recurring: { frequency: 1, frequency_type: 'months', transaction_amount: producto.precio, currency_id: 'PEN' },
    back_url: `${base}/gracias/?pedido=${pedido}`,
    status: 'pending',
  }, pedido);
}

export const verPago = id => mp('GET', `/v1/payments/${encodeURIComponent(id)}`);
export const verSuscripcion = id => mp('GET', `/preapproval/${encodeURIComponent(id)}`);

// Valida x-signature: manifest "id:<data.id>;request-id:<x-request-id>;ts:<ts>;" con HMAC-SHA256.
export function firmaValida({ firma, requestId, dataId }) {
  const secreto = process.env.MP_WEBHOOK_SECRET;
  if (!secreto || !firma) return false;
  const partes = Object.fromEntries(String(firma).split(',').map(p => p.split('=').map(s => s.trim())));
  if (!partes.ts || !partes.v1) return false;
  let manifest = '';
  if (dataId) manifest += `id:${String(dataId).toLowerCase()};`;
  if (requestId) manifest += `request-id:${requestId};`;
  manifest += `ts:${partes.ts};`;
  const esperado = crypto.createHmac('sha256', secreto).update(manifest).digest('hex');
  const a = Buffer.from(esperado), b = Buffer.from(partes.v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
