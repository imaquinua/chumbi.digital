// Home y páginas de la plataforma: peso tipográfico, bóveda de skills y agente de diagnóstico.
(function () {
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Parte un texto en letras con peso propio (conserva el span .m del logo)
  function partir(el) {
    var letras = [];
    Array.prototype.slice.call(el.childNodes).forEach(function (n) {
      var texto = n.textContent, destino = n.nodeType === 3 ? null : n;
      var frag = document.createDocumentFragment();
      // Palabras sin corte interno; los espacios quedan como texto para que la línea pueda partirse
      texto.split(/(\s+)/).forEach(function (trozo) {
        if (!trozo) return;
        if (/^\s+$/.test(trozo)) return frag.appendChild(document.createTextNode(' '));
        var palabra = document.createElement('span'); palabra.style.whiteSpace = 'nowrap';
        Array.prototype.forEach.call(trozo, function (c) {
          var s = document.createElement('span'); s.className = 'pl'; s.textContent = c;
          palabra.appendChild(s); letras.push(s);
        });
        frag.appendChild(palabra);
      });
      if (destino) { destino.textContent = ''; destino.appendChild(frag); } else el.replaceChild(frag, n);
    });
    return letras;
  }

  // Ola de peso: las letras pasan a 900 una tras otra y vuelven a su peso base
  function ola(letras, base, alto, ida) {
    letras.forEach(function (s, i) {
      setTimeout(function () {
        s.style.setProperty('--w', alto); s.style.setProperty('--s', '112%');
        if (ida !== false) setTimeout(function () { s.style.setProperty('--w', base); s.style.removeProperty('--s'); }, 420);
      }, i * 70);
    });
  }

  // Logo: al pasar el cursor, una ola de peso; el logo grande del pie gana peso según el scroll
  var logo = document.querySelector('[data-logo]');
  var lLogo = partir(logo);
  if (!quieto) {
    logo.addEventListener('mouseenter', function () { ola(lLogo, 900, 100); });
    var grande = document.querySelector('[data-logo-grande]'), lGrande = grande ? partir(grande) : [];
    var pesarPie = function () {
      if (!grande) return;
      var r = grande.getBoundingClientRect(), k = 1 - Math.min(1, Math.max(0, (r.top - innerHeight * 0.35) / (innerHeight * 0.6)));
      lGrande.forEach(function (s, i) {
        var t = Math.min(1, Math.max(0, k * 1.6 - i * 0.12));
        s.style.setProperty('--w', Math.round(100 + t * 800));
      });
    };
    addEventListener('scroll', pesarPie, { passive: true }); pesarPie();
  }

  // Hero de cine: el scroll elige el cuadro del recorrido; sin cuadros o sin movimiento queda la imagen fija
  var cine = document.querySelector('[data-cine]');
  if (cine && !quieto) {
    var lienzo = cine.querySelector('canvas'), ctx = lienzo.getContext('2d');
    var texto = cine.querySelector('[data-cine-texto]');
    var n = Number(cine.getAttribute('data-n')) || 0, base = cine.getAttribute('data-cuadros');
    var cuadros = [], movil = matchMedia('(max-width:760px)');
    var tCine = 1;
    var cover = function (img) {
      // Encaja el cuadro como object-fit:cover. Mientras hay texto, la imagen le deja espacio;
      // cuando el texto se va (tCine → 0), la imagen se expande a toda la pantalla.
      var W = lienzo.width, H = lienzo.height, iw = img.naturalWidth, ih = img.naturalHeight;
      var Hr = movil.matches ? H * (0.46 + 0.54 * (1 - tCine)) : H;
      var k = Math.max(W / iw, Hr / ih), w = iw * k, h = ih * k, x = (W - w) * 0.7;
      if (!movil.matches) x += Math.max(0, W * 0.48 - w * 0.3 - x) * tCine;
      ctx.fillStyle = '#FAFAF8'; ctx.fillRect(0, 0, W, H);
      ctx.drawImage(img, x, (Hr - h) * 0.5, w, h);
    };
    var dibujar = function (i) {
      for (var j = i; j >= 0; j--) if (cuadros[j] && cuadros[j].complete && cuadros[j].naturalWidth) { cover(cuadros[j]); return true; }
      return false;
    };
    var medir = function () {
      var dpr = Math.min(devicePixelRatio || 1, 2);
      lienzo.width = lienzo.clientWidth * dpr; lienzo.height = lienzo.clientHeight * dpr;
      pintarCine();
    };
    var pintarCine = function () {
      var r = cine.getBoundingClientRect(), recorrido = cine.offsetHeight - innerHeight;
      var p = Math.min(1, Math.max(0, -r.top / Math.max(recorrido, 1)));
      // El texto se va antes de que la cámara entre a la oficina; el velo de papel se va con él
      var t = 1 - Math.min(1, Math.max(0, (p - 0.12) / 0.16));
      tCine = t;
      texto.style.setProperty('--t', t.toFixed(3));
      cine.querySelector('.cine-escena').style.setProperty('--velo', t.toFixed(3));
      var f = Math.min(1, Math.max(0, (p - 0.86) / 0.1));
      cine.style.setProperty('--f', f.toFixed(3));
      cine.classList.toggle('final', f > 0.5);
      if (!n) return;
      dibujar(Math.round(p * (n - 1)));
    };
    if (n) {
      // Primero el cuadro inicial; después el resto en orden, sin bloquear
      for (var c = 0; c < n; c++) {
        var img = new Image();
        img.decoding = 'async';
        img.src = base + 'c' + String(c + 1).padStart(3, '0') + '.webp';
        if (c === 0) img.onload = function () { cine.classList.add('con-cuadros'); medir(); };
        else img.onload = pintarCine;
        cuadros.push(img);
      }
    }
    addEventListener('scroll', pintarCine, { passive: true });
    addEventListener('resize', medir);
    medir();
  }

  // Medición (GA4 + TikTok): sin datos personales, solo qué se usó
  function medir(ga, gaParams, tt, ttParams) {
    try {
      if (window.gtag) gtag('event', ga, gaParams || {});
      if (window.ttq && tt) ttq.track(tt, ttParams || {});
    } catch (e) {}
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.boveda a.fuente');
    if (!a) return;
    var skill = a.closest('li').querySelector('.skill');
    medir('select_content', { content_type: 'skill', item_id: skill ? skill.textContent : '' }, 'ClickButton', { content_name: skill ? skill.textContent : '' });
  });

  // Bóveda: búsqueda y filtros (solo en la página de skills)
  var bov = document.querySelector('[data-boveda]');
  if (bov) {
    var items = bov.querySelectorAll('li'), filtro = 'todo', q = '';
    var filtrar = function () {
      items.forEach(function (li) {
        var okT = filtro === 'todo' || li.getAttribute('data-t') === filtro;
        var okQ = !q || li.textContent.toLowerCase().indexOf(q) >= 0;
        li.hidden = !(okT && okQ);
      });
    };
    var buscar = document.querySelector('[data-buscar]');
    if (buscar) buscar.addEventListener('input', function (e) { q = e.target.value.trim().toLowerCase(); filtrar(); });
    document.querySelectorAll('[data-filtros] button').forEach(function (b, _, todos) {
      b.addEventListener('click', function () {
        todos.forEach(function (x) { x.setAttribute('aria-pressed', x === b); });
        filtro = b.getAttribute('data-f'); filtrar();
      });
    });
  }

  // Agente de diagnóstico
  var NOMBRES = {
    'lector-de-indicadores': ['Lector de Indicadores', '/modelos/lector-de-indicadores/'],
    'canvas-e3': ['Estratega E³', '/modelos/canvas-e3/'],
    'cancha-estrategica': ['Cancha Estratégica', '/modelos/cancha-estrategica/'],
    'metodo-claro': ['Método CLARO', '/modelos/metodo-claro/'],
    'auditor-de-tablero': ['Analytics', '#agentes']
  };
  // Respuestas de muestra: se usan cuando el agente está en modo demostración (sin clave de API)
  var MUESTRAS = {
    seguidores: { que_hara_tu_equipo: 'Va a publicar lo que da seguidores rápido: sorteos, tendencias y colaboraciones con cualquiera.', la_trampa: 'Crece una audiencia que no te compra. El número sube y las ventas no se mueven.', mira_en_su_lugar: 'Conversaciones que terminan en cotización', por_que: 'Mide interés real de compra, no curiosidad.', pregunta_del_lunes: '¿Cuántas personas nos escribieron esta semana para comprar, no para comentar?', agente: 'auditor-de-tablero' },
    clics: { que_hara_tu_equipo: 'Va a comprar tráfico barato y a escribir títulos que prometen más de lo que da la página.', la_trampa: 'Te llenas de visitas que rebotan en segundos y el costo por venta se dispara.', mira_en_su_lugar: 'Costo por cliente que vuelve', por_que: 'Une lo que gastas con lo que de verdad te deja dinero.', pregunta_del_lunes: '¿Cuánto nos costó cada cliente que volvió a comprar este mes?', agente: 'lector-de-indicadores' },
    leads: { que_hara_tu_equipo: 'Va a bajar la barrera del formulario hasta que cualquiera califique como lead.', la_trampa: 'Ventas recibe una lista larga de contactos que nunca iban a comprar y deja de confiar en marketing.', mira_en_su_lugar: 'Leads que ventas acepta y cierra', por_que: 'Obliga a marketing y ventas a mirar el mismo resultado.', pregunta_del_lunes: '¿Qué porcentaje de los leads de este mes terminó en una venta?', agente: 'canvas-e3' },
    alcance: { que_hara_tu_equipo: 'Va a pautar en los formatos y horarios más baratos, aunque nadie los recuerde.', la_trampa: 'Pagas por personas que vieron algo sin verlo. Mucho alcance, cero recuerdo de marca.', mira_en_su_lugar: 'Recordación de marca en tu público', por_que: 'Te dice si el mensaje quedó, no solo si pasó por la pantalla.', pregunta_del_lunes: '¿Cuántos de nuestros clientes nuevos dicen que nos conocieron por la campaña?', agente: 'cancha-estrategica' },
    ventas: { que_hara_tu_equipo: 'Va a empujar descuentos a fin de mes y adelantar ventas del mes siguiente.', la_trampa: 'El mes se ve bien, pero erosionas el margen y acostumbras al cliente a esperar la oferta.', mira_en_su_lugar: 'Margen por cliente a seis meses', por_que: 'Premia vender bien, no solo vender ahora.', pregunta_del_lunes: '¿Cuánto margen nos dejó cada cliente nuevo después de su segunda compra?', agente: 'metodo-claro' }
  };
  function muestra(texto) {
    var t = texto.toLowerCase();
    if (/seguid|follow|fan/.test(t)) return MUESTRAS.seguidores;
    if (/clic|click|ctr|tr[aá]fico|visita/.test(t)) return MUESTRAS.clics;
    if (/lead|prospect|registro|formulario/.test(t)) return MUESTRAS.leads;
    if (/alcance|impresion|reach|vistas|views/.test(t)) return MUESTRAS.alcance;
    return MUESTRAS.ventas;
  }

  var form = document.querySelector('[data-agente]');
  if (!form) return;
  var input = form.numero;
  var estado = form.querySelector('[data-estado]'), caja = form.querySelector('[data-respuesta]');
  var boton = form.querySelector('button[type=submit]');

  form.querySelectorAll('.fichas-rapidas button').forEach(function (b) {
    b.addEventListener('click', function () { input.value = b.textContent; form.requestSubmit(); });
  });

  function pintar(d, demo) {
    Object.keys(d).forEach(function (k) {
      var el = caja.querySelector('[data-r="' + k + '"]');
      if (el) el.textContent = d[k];
    });
    var ag = NOMBRES[d.agente] || NOMBRES['auditor-de-tablero'];
    var link = caja.querySelector('[data-r-agente]');
    link.textContent = 'Abrir ' + ag[0] + ' →'; link.href = ag[1];
    caja.hidden = false;
    estado.textContent = demo ? 'Ejemplo. El agente en vivo llega pronto.' : '';
    // La métrica recomendada gana peso letra por letra: lo que eliges medir, pesa
    var mejor = caja.querySelector('[data-r="mira_en_su_lugar"]');
    var letras = partir(mejor);
    letras.forEach(function (s) { s.style.setProperty('--w', 100); });
    if (quieto) letras.forEach(function (s) { s.style.setProperty('--w', 900); });
    else requestAnimationFrame(function () { ola(letras, 900, 900, false); });
    if (innerWidth < 960) caja.scrollIntoView({ behavior: quieto ? 'auto' : 'smooth', block: 'start' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var texto = input.value.trim();
    if (!texto) { estado.textContent = 'Escribe el número que miras.'; input.focus(); return; }
    // El texto no se envía a la medición (puede traer datos del negocio); solo si vino de una ficha o escrito
    medir('agente_consulta', { origen: e.submitter && e.submitter.type === 'submit' ? 'texto' : 'ficha' }, 'Search');
    boton.disabled = true; form.classList.add('pensando');
    estado.textContent = 'El agente está pensando…';
    fetch('/api/agente', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ numero: texto }) })
      .then(function (r) { return r.json().catch(function () { return { ok: false, demo: true }; }); })
      .then(function (d) {
        if (d.ok) pintar(d, false);
        else if (d.demo) pintar(muestra(texto), true);
        else estado.textContent = d.mensaje || 'El agente no respondió. Intenta otra vez.';
      })
      .catch(function () { pintar(muestra(texto), true); })
      .then(function () { boton.disabled = false; form.classList.remove('pensando'); });
  });
})();
