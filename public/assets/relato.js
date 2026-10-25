// Relato con scroll: la misma tinta pasa por cinco formas mientras bajas.
// mancha (la gota cayó) → nube (medir) → barras (intervenir) → campana (adopción) → gota (hacia La organización).
(function () {
  var relato = document.querySelector('[data-relato]');
  if (!relato) return;
  var lienzo = relato.querySelector('canvas');
  var ctx = lienzo.getContext('2d');
  var pasos = relato.querySelectorAll('[data-paso]');
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var TINTA = '#141414', VERDE = '#0A7A3E', GRIS = '#4E4E4A';
  var BARRAS = [0.38, 0.62, 0.21, 0.47, 0.84, 0.55, 0.3, 0.71, 0.44];
  // Difusión de innovaciones (Rogers, 1962): cortes en desviaciones estándar
  var GRUPOS = [
    { nombre: 'Innovadores', pct: '2,5 %', de: -3, a: -2 },
    { nombre: 'Adoptadores tempranos', pct: '13,5 %', de: -2, a: -1 },
    { nombre: 'Mayoría temprana', pct: '34 %', de: -1, a: 0 },
    { nombre: 'Mayoría tardía', pct: '34 %', de: 0, a: 1 },
    { nombre: 'Rezagados', pct: '16 %', de: 1, a: 3 }
  ];
  var elegido = 2;

  var W, H, dpr, zona, P = [], F = [], progreso = 0, objetivo = 0;

  function gauss(x) { return Math.exp(-x * x / 2); }
  function suave(t) { t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); }
  function azar(semilla) { var x = Math.sin(semilla * 9301 + 49297) * 233280; return x - Math.floor(x); }

  function preparar() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = lienzo.clientWidth; H = lienzo.clientHeight;
    lienzo.width = W * dpr; lienzo.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var ancho = W > 900;
    zona = ancho
      ? { x: W * 0.5, y: H * 0.18, w: W * 0.44, h: H * 0.6 }
      : { x: W * 0.06, y: H * 0.1, w: W * 0.88, h: H * 0.3 };
    var paso = ancho ? 5 : 4;

    // Celdas de las barras
    var barras = [], nb = BARRAS.length, hueco = zona.w / nb, ab = hueco * 0.62, base = zona.y + zona.h;
    BARRAS.forEach(function (v, i) {
      var x0 = zona.x + i * hueco + (hueco - ab) / 2;
      for (var y = base - paso; y >= base - v * zona.h; y -= paso)
        for (var x = x0; x < x0 + ab; x += paso) barras.push({ x: x, y: y });
    });
    // Celdas de la campana (área bajo la curva, x en [-3, 3] desviaciones)
    var campana = [];
    for (var cx = zona.x; cx < zona.x + zona.w; cx += paso) {
      var s = (cx - zona.x) / zona.w * 6 - 3, alto = gauss(s) * zona.h * 0.92;
      var g = s < -2 ? 0 : s < -1 ? 1 : s < 0 ? 2 : s < 1 ? 3 : 4;
      for (var y2 = base - paso; y2 >= base - alto; y2 -= paso) campana.push({ x: cx, y: y2, g: g });
    }
    var n = Math.max(barras.length, campana.length);
    var centro = { x: zona.x + zona.w / 2, y: zona.y + zona.h / 2 }, gota = { x: W / 2, y: H - 24 };

    P = [];
    for (var i = 0; i < n; i++) {
      var a = azar(i) * Math.PI * 2, r = Math.sqrt(-2 * Math.log(azar(i + 7) + 1e-6)) * zona.h * 0.09;
      var b = barras[i], c = campana[i];
      P.push({
        // 0 mancha · 1 nube · 2 barras · 3 campana · 4 gota
        f: [
          { x: centro.x + Math.cos(a) * r, y: centro.y + Math.sin(a) * r * 0.8, on: true },
          (function () { // nube orgánica: distribución normal alrededor del centro, sin bordes rectos
            var a2 = azar(i + 3) * Math.PI * 2, r2 = Math.sqrt(-2 * Math.log(azar(i + 5) + 1e-6)) * 0.34;
            return { x: centro.x + Math.cos(a2) * r2 * zona.w * 0.62, y: centro.y + Math.sin(a2) * r2 * zona.h * 0.62, on: true };
          })(),
          b ? { x: b.x, y: b.y, on: true } : { x: azar(i + 11) * W, y: azar(i + 13) * H, on: false },
          c ? { x: c.x, y: c.y, on: true, g: c.g } : { x: azar(i + 17) * W, y: azar(i + 19) * H, on: false },
          { x: gota.x + (azar(i + 23) - 0.5) * 6, y: gota.y + (azar(i + 29) - 0.5) * 6, on: true }
        ],
        fase: azar(i + 31) * 6.28, retraso: azar(i + 37) * 0.35, lado: ancho ? 2.2 : 1.8
      });
    }
  }

  function leerScroll() {
    var r = relato.getBoundingClientRect();
    var total = r.height - innerHeight;
    objetivo = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 0;
  }

  function pintar(seg) {
    progreso += (objetivo - progreso) * (quieto ? 1 : 0.12);
    var tramo = Math.min(3, Math.floor(progreso * 4)), local = progreso * 4 - tramo;
    var t = quieto ? 1 : suave(local / 0.65); // la transición ocupa el primer 65 % de cada tramo; el resto es lectura
    pasos.forEach(function (p, i) { p.classList.toggle('activo', i === tramo); });

    ctx.clearRect(0, 0, W, H);
    var xRegla = tramo === 1 ? zona.x - 10 + t * (zona.w + 20) : null;
    var campanaVisible = (tramo === 2 && t > 0.5) || tramo === 3 && t < 0.4;

    for (var i = 0; i < P.length; i++) {
      var p = P[i], A = p.f[tramo], B = p.f[tramo + 1];
      var k = t;
      if (tramo === 1) k = xRegla !== null && B.x < xRegla ? 1 : 0; // intervenir: solo se ordena lo que la regla ya midió
      else k = suave((t - p.retraso) / (1 - p.retraso));
      if (p.k === undefined) p.k = k;
      p.k += (k - p.k) * (quieto ? 1 : 0.18);
      var x = A.x + (B.x - A.x) * p.k, y = A.y + (B.y - A.y) * p.k;
      var on = p.k > 0.5 ? B.on : A.on;
      if (!quieto) { x += Math.sin(seg * 0.6 + p.fase) * (on ? 0.6 : 6); y += Math.cos(seg * 0.5 + p.fase) * (on ? 0.6 : 4); }
      var verde = tramo >= 2 && B.g === elegido && p.k > 0.5 && tramo !== 3 || tramo === 3 && A.g === elegido && p.k < 0.5;
      if (tramo === 1 && i % 9 === 4 && p.k > 0.5) verde = false;
      ctx.fillStyle = !on ? 'rgba(20,20,20,.12)' : verde ? VERDE : TINTA;
      ctx.fillRect(x, y, p.lado, p.lado);
    }

    if (xRegla !== null && t > 0 && t < 1) {
      ctx.fillStyle = VERDE;
      ctx.fillRect(xRegla, zona.y - 40, 1.5, zona.h + 60);
      ctx.fillRect(xRegla - 4, zona.y - 44, 9, 9);
    }
    if (campanaVisible) dibujarCampana(tramo === 2 ? (t - 0.5) * 2 : 1 - t / 0.4);
    if (tramo === 3 && t > 0.75) { // la tinta reunida vuelve a ser gota y cae hacia La organización
      var gx = W / 2, gy = H - 30 + (t - 0.75) * 4 * 18;
      ctx.globalAlpha = Math.min(1, (t - 0.75) * 4);
      ctx.fillStyle = VERDE;
      ctx.beginPath(); ctx.moveTo(gx, gy - 22); ctx.quadraticCurveTo(gx + 14, gy, gx, gy + 10); ctx.quadraticCurveTo(gx - 14, gy, gx, gy - 22); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function dibujarCampana(alfa) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alfa));
    var base = zona.y + zona.h;
    ctx.strokeStyle = TINTA; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(zona.x, base + 0.5); ctx.lineTo(zona.x + zona.w, base + 0.5); ctx.stroke();
    ctx.font = '600 11px Archivo, system-ui, sans-serif'; ctx.textAlign = 'center';
    GRUPOS.forEach(function (g, i) {
      var x0 = zona.x + (g.de + 3) / 6 * zona.w, x1 = zona.x + (g.a + 3) / 6 * zona.w;
      if (i > 0) { ctx.strokeStyle = 'rgba(20,20,20,.25)'; ctx.beginPath(); ctx.moveTo(x0 + 0.5, base); ctx.lineTo(x0 + 0.5, zona.y); ctx.stroke(); }
      ctx.fillStyle = i === elegido ? VERDE : GRIS;
      ctx.fillText(g.pct, (x0 + x1) / 2, base + 20);
    });
    // La gota: el marcador que la persona arrastra
    var g = GRUPOS[elegido], cx = zona.x + ((g.de + g.a) / 2 + 3) / 6 * zona.w;
    var cy = base - gauss((g.de + g.a) / 2) * zona.h * 0.92 - 22;
    ctx.fillStyle = VERDE;
    ctx.beginPath(); ctx.moveTo(cx, cy - 13); ctx.quadraticCurveTo(cx + 9, cy, cx, cy + 7); ctx.quadraticCurveTo(cx - 9, cy, cx, cy - 13); ctx.fill();
    ctx.restore();
  }

  // Elegir grupo: botones accesibles y arrastre sobre la campana
  var botones = relato.querySelectorAll('[data-grupo]');
  var lectura = relato.querySelector('[data-lectura-grupo]');
  var recomendaciones = relato.querySelectorAll('[data-reco]');
  function elegir(i) {
    elegido = i;
    botones.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
    if (lectura) lectura.textContent = GRUPOS[i].nombre + ' · ' + GRUPOS[i].pct;
    recomendaciones.forEach(function (r) { r.hidden = Number(r.getAttribute('data-reco')) !== i; });
  }
  botones.forEach(function (b) { b.addEventListener('click', function () { elegir(Number(b.getAttribute('data-grupo'))); }); });
  function porPuntero(e) {
    if (Math.floor(progreso * 4) < 2) return;
    var r = lienzo.getBoundingClientRect(), x = e.clientX - r.left;
    if (x < zona.x || x > zona.x + zona.w) return;
    var s = (x - zona.x) / zona.w * 6 - 3;
    elegir(s < -2 ? 0 : s < -1 ? 1 : s < 0 ? 2 : s < 1 ? 3 : 4);
  }
  var arrastrando = false;
  lienzo.addEventListener('pointerdown', function (e) { arrastrando = true; porPuntero(e); });
  addEventListener('pointerup', function () { arrastrando = false; });
  lienzo.addEventListener('pointermove', function (e) { if (arrastrando) porPuntero(e); });
  elegir(elegido);

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(function () {
    preparar(); leerScroll(); progreso = objetivo;
    addEventListener('scroll', leerScroll, { passive: true });
    var espera;
    addEventListener('resize', function () { clearTimeout(espera); espera = setTimeout(function () { preparar(); leerScroll(); }, 150); });
    var t0 = performance.now(), activo = false, raf;
    function bucle(ahora) { pintar((ahora - t0) / 1000); raf = requestAnimationFrame(bucle); }
    new IntersectionObserver(function (es) {
      var v = es[0].isIntersecting;
      if (v && !activo) { activo = true; raf = requestAnimationFrame(bucle); }
      if (!v && activo) { activo = false; cancelAnimationFrame(raf); }
    }).observe(relato);
  });
})();
