// Lógica común: validar, deduplicar y registrar. El almacén es intercambiable.
const RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[A-Za-z]{2,}$/;

export function limpiar(correo) {
  return String(correo || '').trim().toLowerCase();
}

export async function procesar(body, almacen) {
  const b = body && typeof body === 'object' ? body : {};
  // Honeypot: un humano nunca llena "web". Respondemos "ok" para no dar pistas.
  if (b.web) return { status: 200, ok: true, mensaje: 'Anotado. Te toco la puerta.' };
  const correo = limpiar(b.correo);
  if (!correo || correo.length > 254 || !RE.test(correo)) {
    return { status: 400, ok: false, mensaje: 'Ese correo no parece válido. Revísalo.' };
  }
  try {
    const nuevo = await almacen.agregar(correo, new Date().toISOString());
    return nuevo
      ? { status: 200, ok: true, mensaje: 'Anotado. Te toco la puerta el día que abra.' }
      : { status: 409, ok: false, duplicado: true, mensaje: 'Ese correo ya está adentro. Nada más que hacer.' };
  } catch (e) {
    console.error('almacen:', e && e.message);
    return { status: 503, ok: false, mensaje: 'No pude guardarlo ahora. Intenta de nuevo en un rato.' };
  }
}
