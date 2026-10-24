// Entrega después del pago: correo al cliente (Resend) y aviso a Chumbi.
// Requiere RESEND_API_KEY, CORREO_REMITENTE, AVISO_CORREO, ENLACE_SECRETO y MENTORIA_AGENDA_URL.
import crypto from 'node:crypto';

const DIAS_DESCARGA = 7;

// Enlace de descarga firmado: <pedido>.<vence>.<firma>
export function enlaceDescarga(base, pedido) {
  const vence = Date.now() + DIAS_DESCARGA * 864e5;
  const datos = `${pedido}.${vence}`;
  return `${base}/api/descarga?t=${datos}.${firmar(datos)}`;
}

export function leerEnlace(t) {
  const [pedido, vence, firma] = String(t || '').split('.');
  if (!pedido || !vence || !firma) return null;
  const a = Buffer.from(firmar(`${pedido}.${vence}`)), b = Buffer.from(firma);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  if (Date.now() > Number(vence)) return null;
  return pedido;
}

function firmar(datos) {
  const s = process.env.ENLACE_SECRETO;
  if (!s) throw new Error('Falta ENLACE_SECRETO');
  return crypto.createHmac('sha256', s).update(datos).digest('base64url');
}

async function enviar(para, asunto, texto) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.CORREO_REMITENTE, to: [para], subject: asunto, text: texto, reply_to: process.env.AVISO_CORREO }),
  });
  if (!r.ok) throw new Error(`Resend ${r.status}: ${await r.text()}`);
}

const FIRMA = '\n\nChumbi\nchumbi.digital';

export async function entregar({ pedido, producto, base }) {
  const { correo } = pedido;
  if (producto.archivo) {
    await enviar(correo, `Tu descarga: ${producto.nombre}`,
      `Gracias por tu compra.\n\nDescárgala aquí (el enlace vale ${DIAS_DESCARGA} días):\n${enlaceDescarga(base, pedido.id)}` + FIRMA);
  } else if (producto.tipo === 'mentoria') {
    await enviar(correo, 'Elige el horario de tu mentoría',
      `Gracias. El pago está confirmado.\n\nElige tu horario aquí:\n${process.env.MENTORIA_AGENDA_URL}\n\nAntes de la sesión, respóndeme este correo con la decisión que quieres ordenar.` + FIRMA);
  } else if (producto.tipo === 'fractional') {
    await enviar(correo, 'Bienvenida · dirección de marketing fractional',
      'Gracias. Tu suscripción mensual quedó activa.\n\nEn las próximas 24 horas te escribo para agendar la sesión de arranque. Puedes cancelar cuando quieras desde tu cuenta de Mercado Pago.' + FIRMA);
  }
  await enviar(process.env.AVISO_CORREO, `Venta: ${producto.nombre}`,
    `Pedido ${pedido.id}\nProducto: ${producto.nombre}\nMonto: S/ ${producto.precio}\nCliente: ${correo}\nReferencia MP: ${pedido.mp || '-'}`);
}
