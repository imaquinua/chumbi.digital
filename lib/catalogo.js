// Catálogo único de la tienda. Precios en soles (PEN). Cambiar aquí, correr `node scripts/fichas.mjs` y redesplegar.
// La organización (la bóveda) es gratis: cada modelo tiene su ficha abierta en /modelos/. Aquí solo va lo que se cobra.
// linea: 'modelos' (kits de descarga) o 'service-design' (en preparación, lista de espera).
// estado: 'venta' (se puede pagar) o 'pronto' (solo lista de espera; checkout lo rechaza).
// Los archivos descargables (PDF o ZIP) viven en Vercel Blob privado, en la ruta indicada en `archivo`.

// Referencia para mostrar el equivalente en dólares. El cobro siempre es en soles.
export const SOLES_POR_DOLAR = 3.75;

export const LINEAS = {
  'modelos': {
    nombre: 'Modelos estratégicos',
    bajada: 'Los modelos con los que decido, convertidos en kits para trabajar con tu equipo. La ficha de cada uno es gratis en La organización.',
  },
  'service-design': {
    nombre: 'Service design aplicado',
    bajada: 'Diseño de servicios para tres terrenos donde la medición decide todo: la IA, el software y el marketing.',
  },
};

export const CATALOGO = [
  {
    id: 'modelo-kit-e3',
    slug: 'kit-e3',
    linea: 'modelos',
    tipo: 'modelo',
    estado: 'venta',
    nombre: 'Kit E³ · Canvas, diagrama y rombo',
    bajada: 'Las necesidades de Maslow cruzadas con See-Think-Do-Care para mapear el recorrido completo del cliente. Incluye guía de taller.',
    precio: 149,
    archivo: 'productos/modelos/kit-e3.zip',
    ficha: '/modelos/canvas-e3/',
    problema: 'Tu marca publica en todas las etapas a la vez y no sabe en cuál está vacía. El presupuesto se va a Do porque es lo que se mide, y See y Care se quedan sin nadie.',
    paraQuien: 'Equipos de marketing y marca que necesitan ordenar el recorrido del cliente antes de pedir más presupuesto.',
    incluye: ['Canvas imprimible en A3', 'Plantilla editable', 'Guía de taller paso a paso', 'Ejemplo resuelto'],
    resultado: 'Sales del taller con el mapa de tu escalera y tres movimientos priorizados.',
  },
  {
    id: 'modelo-cancha-estrategica',
    slug: 'cancha-estrategica',
    linea: 'modelos',
    tipo: 'modelo',
    estado: 'venta',
    nombre: 'Cancha Estratégica',
    bajada: 'Tu marketing como un equipo en la cancha: once posiciones para tus canales, herramientas y personas, y el tercio donde te meten goles.',
    precio: 69,
    archivo: 'productos/modelos/cancha-estrategica.zip',
    ficha: '/modelos/cancha-estrategica/',
    problema: 'Tienes canales, herramientas y personas, pero nadie sabe qué posición juega cada uno. Lo que no tiene posición ocupa presupuesto igual.',
    paraQuien: 'Gerentes y equipos que quieren ver su marketing completo en una sola pared y elegir la jugada de la semana.',
    incluye: ['Plano de la cancha imprimible en A3', 'Plantilla editable para armar tu once y la banca', 'Guía para facilitar la sesión de 90 minutos', 'Ejemplo resuelto de un negocio real'],
    resultado: 'En 90 minutos ves en qué tercio te meten goles y qué va a la banca.',
  },
  {
    id: 'modelo-lector-indicadores',
    slug: 'lector-de-indicadores',
    linea: 'modelos',
    tipo: 'modelo',
    estado: 'venta',
    nombre: 'Lector de Indicadores · kit de lectura',
    bajada: 'Lee un tablero con criterio: qué es señal y qué es ruido. Plantilla semanal y ejemplo resuelto.',
    precio: 69,
    archivo: 'productos/modelos/lector-de-indicadores.zip',
    ficha: '/modelos/lector-de-indicadores/',
    problema: 'El comité reacciona a cada subida y bajada del tablero. Nadie distingue una señal de una semana normal, y se toman decisiones sobre ruido.',
    paraQuien: 'Quien presenta números a un comité o a un directorio cada semana.',
    incluye: ['Guía para preparar el export de tus métricas', 'Plantilla de lectura semanal para el comité', 'Ejemplo resuelto, de los datos crudos a la decisión'],
    resultado: 'Tu tablero en cinco líneas: qué cambió, por qué importa y qué harías.',
  },
  {
    id: 'modelo-metodo-claro',
    slug: 'metodo-claro',
    linea: 'modelos',
    tipo: 'modelo',
    estado: 'venta',
    nombre: 'Método CLARO · manual de prompting',
    bajada: 'Contexto, labor, anatomía, referencias y objetivo: cinco partes para cada prompt. Manual, plantillas y hoja de chequeo.',
    precio: 49,
    archivo: 'productos/modelos/metodo-claro.zip',
    ficha: '/modelos/metodo-claro/',
    problema: 'El equipo usa IA todos los días, pero cada uno pide distinto y los resultados no se pueden repetir.',
    paraQuien: 'Equipos de marketing que ya usan IA y quieren que el resultado dependa del método, no de la suerte.',
    incluye: ['Manual en PDF', '10 plantillas de prompts por tarea de marketing', 'Hoja de chequeo imprimible'],
    resultado: 'Un mismo idioma para pedirle a la IA, en todo el equipo.',
  },
  {
    id: 'modelo-pack-completo',
    slug: 'pack-completo',
    linea: 'modelos',
    tipo: 'modelo',
    estado: 'venta',
    nombre: 'Pack completo · modelos estratégicos de Chumbi',
    bajada: 'Los cuatro kits en una sola descarga: E³, Cancha Estratégica, Lector de Indicadores y Método CLARO.',
    precio: 249,
    archivo: 'productos/modelos/pack-completo.zip',
    ficha: '/organizacion/',
    problema: 'Cada kit resuelve una parte. Juntos son un sistema: dónde está tu cliente, quién juega, qué número leer y cómo pedirle a la IA.',
    paraQuien: 'Equipos que quieren instalar el método completo, no una pieza suelta.',
    incluye: ['Kit E³', 'Cancha Estratégica', 'Lector de Indicadores', 'Método CLARO'],
    resultado: 'El sistema completo por menos de lo que cuestan tres kits por separado.',
  },

  // Service design aplicado: en preparación. Sin precio ni archivo hasta que existan.
  {
    id: 'sd-ia',
    slug: 'service-design-ia',
    linea: 'service-design',
    tipo: 'modelo',
    estado: 'pronto',
    nombre: 'Service design para IA',
    bajada: 'Diseñar el servicio antes que el agente: dónde entra la IA, qué decide sola y qué se mide para saber si sirve.',
  },
  {
    id: 'sd-software',
    slug: 'service-design-software',
    linea: 'service-design',
    tipo: 'modelo',
    estado: 'pronto',
    nombre: 'Service design para software',
    bajada: 'Del blueprint del servicio al backlog: que el producto resuelva el recorrido completo, no solo la pantalla.',
  },
  {
    id: 'sd-marketing',
    slug: 'service-design-marketing',
    linea: 'service-design',
    tipo: 'modelo',
    estado: 'pronto',
    nombre: 'Service design para marketing',
    bajada: 'El marketing como un servicio que el cliente recorre: puntos de contacto, momentos de verdad y el indicador de cada uno.',
  },
];

export function buscar(id) {
  return CATALOGO.find(p => p.id === id) || null;
}

export function aDolares(soles) {
  return Math.round(soles / SOLES_POR_DOLAR);
}

// Lo que ve el navegador: sin rutas internas.
export function publico() {
  return CATALOGO.map(({ archivo, ...p }) => p);
}
