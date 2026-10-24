// Almacén en .txt: una línea por registro "fechaISO<TAB>correo". Solo servidores con disco escribible.
import { promises as fs } from 'node:fs';
import path from 'node:path';

export function almacenArchivo(ruta) {
  let cola = Promise.resolve(); // serializa escrituras concurrentes
  return {
    agregar(correo, fecha) {
      const tarea = cola.then(async () => {
        await fs.mkdir(path.dirname(ruta), { recursive: true });
        let actual = '';
        try { actual = await fs.readFile(ruta, 'utf8'); } catch {}
        const existe = actual.split('\n').some(l => l.split('\t')[1] === correo);
        if (existe) return false;
        await fs.appendFile(ruta, `${fecha}\t${correo}\n`, { mode: 0o600 });
        return true;
      });
      cola = tarea.catch(() => {});
      return tarea;
    },
  };
}
