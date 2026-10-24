// Catálogo único de la tienda. Precios en soles (PEN). Cambiar aquí y redesplegar.
// tipo: 'resumen' y 'modelo' (descarga), 'mentoria' (agenda), 'fractional' (suscripción mensual).
// Los archivos descargables (PDF o ZIP) viven en Vercel Blob privado, en la ruta indicada en `archivo`.
export const CATALOGO = [
  {
    id: 'resumen-esto-es-marketing',
    tipo: 'resumen',
    nombre: 'Síntesis · Esto es marketing (Seth Godin)',
    bajada: 'Lo que sirve para decidir el lunes, con mis notas de aula.',
    precio: 29,
    archivo: 'productos/resumenes/esto-es-marketing.pdf',
  },
  {
    id: 'resumen-pensar-rapido',
    tipo: 'resumen',
    nombre: 'Síntesis · Pensar rápido, pensar despacio',
    bajada: 'Los sesgos que más pesan cuando se lee un tablero.',
    precio: 29,
    archivo: 'productos/resumenes/pensar-rapido-pensar-despacio.pdf',
  },
  {
    id: 'resumen-thinking-in-systems',
    tipo: 'resumen',
    nombre: 'Síntesis · Thinking in Systems',
    bajada: 'Bucles, retrasos y puntos de palanca aplicados a marketing.',
    precio: 29,
    archivo: 'productos/resumenes/thinking-in-systems.pdf',
  },
  {
    id: 'resumen-outcomes-over-output',
    tipo: 'resumen',
    nombre: 'Síntesis · Outcomes over Output',
    bajada: 'Cómo pasar de entregar cosas a mover comportamientos.',
    precio: 29,
    archivo: 'productos/resumenes/outcomes-over-output.pdf',
  },
  {
    id: 'modelo-kit-e3',
    tipo: 'modelo',
    nombre: 'Kit E³ · Canvas, diagrama y rombo',
    bajada: 'Las necesidades de Maslow cruzadas con See-Think-Do-Care para mapear el recorrido completo del cliente. Incluye guía de taller.',
    precio: 149,
    archivo: 'productos/modelos/kit-e3.zip',
  },
  {
    id: 'modelo-cancha-estrategica',
    tipo: 'modelo',
    nombre: 'Cancha Estratégica',
    bajada: 'Tu marketing como un equipo en la cancha: once posiciones para tus canales, herramientas y personas, y el tercio donde te meten goles.',
    precio: 69,
    archivo: 'productos/modelos/cancha-estrategica.zip',
  },
  {
    id: 'modelo-lector-indicadores',
    tipo: 'modelo',
    nombre: 'Lector de Indicadores · kit de lectura',
    bajada: 'Lee un tablero con criterio: qué es señal y qué es ruido. Plantilla semanal y ejemplo resuelto.',
    precio: 69,
    archivo: 'productos/modelos/lector-de-indicadores.zip',
  },
  {
    id: 'modelo-metodo-claro',
    tipo: 'modelo',
    nombre: 'Método CLARO · manual de prompting',
    bajada: 'Contexto, labor, anatomía, referencias y objetivo: cinco partes para cada prompt. Manual, plantillas y hoja de chequeo.',
    precio: 49,
    archivo: 'productos/modelos/metodo-claro.zip',
  },
  {
    id: 'modelo-pack-completo',
    tipo: 'modelo',
    nombre: 'Pack completo · modelos estratégicos de Chumbi',
    bajada: 'Los cuatro anteriores en una sola descarga.',
    precio: 249,
    archivo: 'productos/modelos/pack-completo.zip',
  },
  {
    id: 'mentoria-60',
    tipo: 'mentoria',
    nombre: 'Mentoría 1:1 · 60 minutos',
    bajada: 'Una sesión para ordenar una decisión de marketing, medición o IA.',
    precio: 350,
  },
  {
    id: 'fractional-mensual',
    tipo: 'fractional',
    nombre: 'Dirección de marketing fractional · mensual',
    bajada: 'Entro, ordeno y dejo al equipo andando solo. Cobro mensual, se cancela cuando quieras.',
    precio: 5000,
  },
];

export function buscar(id) {
  return CATALOGO.find(p => p.id === id) || null;
}

// Lo que ve el navegador: sin rutas internas.
export function publico() {
  return CATALOGO.map(({ archivo, ...p }) => p);
}
