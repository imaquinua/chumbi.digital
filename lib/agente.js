// Agente de la portada: recibe el número que alguien mira cada lunes y devuelve
// qué va a provocar medirlo, la trampa, qué mirar en su lugar y qué agente ayuda.
import Anthropic from '@anthropic-ai/sdk';

const MODELO = 'claude-haiku-5-5';
const MAX_TEXTO = 120;
const LIMITE_HORA = 6;           // consultas por IP por hora (mejor esfuerzo: memoria de la instancia)
const AGENTES = ['lector-de-indicadores', 'canvas-e3', 'cancha-estrategica', 'metodo-claro', 'auditor-de-tablero'];

const SISTEMA = `Eres el agente de diagnóstico de chumbi.digital, la plataforma de marketing con IA de Jorge Luis Chumbiauca (Chumbi).
Tesis: medir es intervenir. El número que un equipo (o un agente de IA) mira cada semana termina gobernando lo que hace (ley de Goodhart).

La persona escribe el indicador que mira cada lunes. Responde en español neutro latinoamericano, tuteando, frases cortas y concretas, sin jerga ni humo, sin emojis.
- que_hara_tu_equipo: qué van a empezar a hacer las personas o los agentes para mover ese número (1 o 2 frases).
- la_trampa: el efecto no deseado concreto que eso provoca (1 o 2 frases).
- mira_en_su_lugar: un indicador mejor, con nombre corto (máx. 8 palabras).
- por_que: por qué ese indicador está más cerca del negocio (1 frase).
- pregunta_del_lunes: una pregunta que la persona puede hacer en su próxima reunión (1 frase, entre signos de interrogación).
- agente: el agente de la plataforma que más ayuda. lector-de-indicadores (leer un tablero y elegir qué mirar), canvas-e3 (estrategia y objetivos), cancha-estrategica (posicionamiento frente a la competencia), metodo-claro (ordenar un problema y decidir), auditor-de-tablero (revisar si las métricas actuales engañan).
Si lo que escriben no es un indicador de negocio o marketing, interprétalo como el indicador más cercano y razonable. No pidas más datos.`;

const ESQUEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['que_hara_tu_equipo', 'la_trampa', 'mira_en_su_lugar', 'por_que', 'pregunta_del_lunes', 'agente'],
  properties: {
    que_hara_tu_equipo: { type: 'string' },
    la_trampa: { type: 'string' },
    mira_en_su_lugar: { type: 'string' },
    por_que: { type: 'string' },
    pregunta_del_lunes: { type: 'string' },
    agente: { type: 'string', enum: AGENTES },
  },
};

const consultas = new Map();

// Límite por IP y por agente (clave), en la memoria de la instancia
export function permitido(ip, clave = 'veredicto', limite = LIMITE_HORA) {
  const ahora = Date.now(), hora = 3600e3, id = clave + ':' + ip;
  const lista = (consultas.get(id) || []).filter((t) => ahora - t < hora);
  if (lista.length >= limite) { consultas.set(id, lista); return false; }
  lista.push(ahora); consultas.set(id, lista);
  return true;
}

let cliente = null;

export async function diagnosticar(body, ip) {
  const numero = String(body?.numero ?? '').replace(/\s+/g, ' ').trim();
  if (!numero) return { status: 400, ok: false, mensaje: 'Escribe el número que miras.' };
  if (numero.length > MAX_TEXTO) return { status: 400, ok: false, mensaje: 'Más corto, por favor (una métrica).' };
  if (!process.env.ANTHROPIC_API_KEY) return { status: 503, ok: false, demo: true, mensaje: 'El agente está en modo demostración.' };
  if (!permitido(ip || 'anon')) return { status: 429, ok: false, mensaje: 'Llegaste al límite de consultas por hora. Vuelve en un rato.' };

  cliente ??= new Anthropic();
  try {
    const r = await cliente.messages.create({
      model: MODELO,
      max_tokens: 1024,
      output_config: { effort: 'low', format: { type: 'json_schema', schema: ESQUEMA } },
      system: SISTEMA,
      messages: [{ role: 'user', content: `El número que miro cada lunes: ${numero}` }],
    });
    if (r.stop_reason === 'refusal') return { status: 422, ok: false, mensaje: 'No puedo responder eso. Prueba con una métrica de marketing.' };
    const texto = r.content.find((b) => b.type === 'text')?.text;
    return { status: 200, ok: true, numero, ...JSON.parse(texto) };
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return { status: 429, ok: false, mensaje: 'El agente está ocupado. Intenta en un minuto.' };
    console.error('agente:', e?.status, e?.message);
    return { status: 502, ok: false, mensaje: 'El agente no respondió. Intenta otra vez.' };
  }
}
