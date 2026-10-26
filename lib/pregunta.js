// Agente de preguntas abiertas: responde corto, con el criterio de Chumbi, y sugiere un siguiente paso del sitio.
import Anthropic from '@anthropic-ai/sdk';
import { permitido } from './agente.js';

const MODELO = 'claude-haiku-5-5';
const MAX_TEXTO = 500;
const SIGUIENTES = ['veredicto', 'diagrama-e3', 'canvas-e3', 'cancha-estrategica', 'lector-de-indicadores', 'metodo-claro', 'skills', 'newsletter'];

const SISTEMA = `Eres el agente de preguntas de chumbi.digital, la plataforma de marketing con agentes de IA de Jorge Luis Chumbiauca (Chumbi).
Tesis: medir es intervenir. Lo que se mide gobierna lo que hace un equipo o un agente de IA.

Responde preguntas de marketing, medición, estrategia, contenido, pauta, SEO, GEO, copy, analytics y uso de IA en marketing.
Estilo: español neutro latinoamericano, tuteo, directo, sin humo ni jerga, sin emojis, sin listas largas. Máximo 110 palabras.
Cuando aplique, termina con qué medir para saber si funcionó.
Si la pregunta no es de marketing, negocios o IA, dilo en una frase y ofrece ayuda con algo de marketing.
No pidas datos personales. No prometas resultados.

En "siguiente" elige el recurso del sitio que más ayuda: veredicto (diagnosticar un indicador), diagrama-e3 (el embudo y sus métricas), canvas-e3 (encontrar la etapa vacía), cancha-estrategica (posicionamiento y equipo), lector-de-indicadores (leer un tablero), metodo-claro (escribir prompts), skills (biblioteca de skills de IA), newsletter (casos cada dos semanas).`;

const ESQUEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['respuesta', 'siguiente'],
  properties: {
    respuesta: { type: 'string' },
    siguiente: { type: 'string', enum: SIGUIENTES },
  },
};

let cliente = null;

export async function responder(body, ip) {
  const pregunta = String(body?.pregunta ?? '').replace(/\s+/g, ' ').trim();
  if (pregunta.length < 6) return { status: 400, ok: false, mensaje: 'Escribe tu pregunta.' };
  if (pregunta.length > MAX_TEXTO) return { status: 400, ok: false, mensaje: 'Más corta, por favor.' };
  if (!process.env.ANTHROPIC_API_KEY) return { status: 503, ok: false, demo: true, mensaje: 'El agente en vivo llega pronto.' };
  if (!permitido(ip || 'anon', 'pregunta', 8)) return { status: 429, ok: false, mensaje: 'Llegaste al límite de preguntas por hora. Vuelve en un rato.' };

  cliente ??= new Anthropic();
  try {
    const r = await cliente.messages.create({
      model: MODELO,
      max_tokens: 1024,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: ESQUEMA } },
      system: SISTEMA,
      messages: [{ role: 'user', content: pregunta }],
    });
    if (r.stop_reason === 'refusal') return { status: 422, ok: false, mensaje: 'No puedo responder eso. Prueba con una pregunta de marketing.' };
    const texto = r.content.find((b) => b.type === 'text')?.text;
    return { status: 200, ok: true, ...JSON.parse(texto) };
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return { status: 429, ok: false, mensaje: 'El agente está ocupado. Intenta en un minuto.' };
    console.error('pregunta:', e?.status, e?.message);
    return { status: 502, ok: false, mensaje: 'El agente no respondió. Intenta otra vez.' };
  }
}
