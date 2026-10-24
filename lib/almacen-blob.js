// Almacén para Vercel (serverless, sin disco): el mismo .txt, pero en Vercel Blob PRIVADO.
// Requiere crear un Blob store privado y la variable BLOB_READ_WRITE_TOKEN en el proyecto.
import { put, get } from '@vercel/blob';

const RUTA = 'newsletter/suscriptores.txt';

export function almacenBlob() {
  return {
    async agregar(correo, fecha) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('Falta BLOB_READ_WRITE_TOKEN');
      let actual = '';
      try {
        const r = await get(RUTA, { access: 'private' });
        if (r && r.stream) actual = await new Response(r.stream).text();
      } catch {}
      if (actual.split('\n').some(l => l.split('\t')[1] === correo)) return false;
      await put(RUTA, actual + `${fecha}\t${correo}\n`, {
        access: 'private', allowOverwrite: true, addRandomSuffix: false, contentType: 'text/plain; charset=utf-8',
      });
      return true;
    },
  };
}
