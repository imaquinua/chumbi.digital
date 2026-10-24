// Notificaciones de Mercado Pago. Valida la firma, consulta el estado real en la API y entrega una sola vez.
import { firmaValida, verPago, verSuscripcion } from '../lib/mp.js';
import { leer, guardar } from '../lib/pedidos.js';
import { buscar } from '../lib/catalogo.js';
import { entregar } from '../lib/entrega.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).end(); }
  const dataId = req.query['data.id'] || (req.body && req.body.data && req.body.data.id);
  const tipo = req.query.type || (req.body && req.body.type);
  if (!firmaValida({ firma: req.headers['x-signature'], requestId: req.headers['x-request-id'], dataId: req.query['data.id'] })) {
    return res.status(401).end();
  }
  if (!dataId || !['payment', 'subscription_preapproval'].includes(tipo)) return res.status(200).end();

  try {
    let referencia, aprobado, estadoMp;
    if (tipo === 'payment') {
      const p = await verPago(dataId);
      referencia = p.external_reference; estadoMp = p.status; aprobado = p.status === 'approved';
    } else {
      const s = await verSuscripcion(dataId);
      referencia = s.external_reference; estadoMp = s.status; aprobado = s.status === 'authorized';
    }
    const pedido = await leer(referencia);
    if (!pedido) return res.status(200).end();
    pedido.estado_mp = estadoMp;
    if (aprobado && pedido.estado !== 'entregado') {
      const base = process.env.SITIO_URL || 'https://chumbi.digital';
      pedido.estado = 'pagado';
      await guardar(pedido);
      await entregar({ pedido, producto: buscar(pedido.producto), base });
      pedido.estado = 'entregado';
    }
    await guardar(pedido);
    return res.status(200).end();
  } catch (e) {
    console.error('webhook:', e && e.message);
    return res.status(500).end(); // Mercado Pago reintenta
  }
}
