// Hero en movimiento: una sola regla verde cruza la portada. Lo que mide gana peso y se ordena.
// El título revela su versión pesada a su paso; un campo de tinta se condensa en barras. Luego se suelta y vuelve.
(function () {
  var hero = document.querySelector('[data-hero]');
  if (!hero) return;
  var lienzo = hero.querySelector('canvas');
  var ctx = lienzo.getContext('2d');
  var titulo = hero.querySelector('[data-pesado]');
  var ligero = hero.querySelector('[data-ligero]');
  var regla = hero.querySelector('.hero-regla');
  var lectura = hero.querySelector('[data-lectura]');
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var TINTA = '#141414', NIEBLA = 'rgba(20,20,20,.22)', VERDE = '#0A7A3E';
  var VALORES = [0.38, 0.62, 0.21, 0.47, 0.84, 0.55, 0.3, 0.71, 0.44];
  var ACENTO = 4; // la única barra verde
  var CICLO = 10.5, BARRIDO = [1.0, 4.4], SUELTA = 8.2; // segundos

  var W, H, dpr, particulas = [], zona, raton = { x: -1e4, y: -1e4 };

  // La capa pesada se estrecha (eje wdth de Archivo) hasta medir lo mismo que la ligera: la regla no mueve nada.
  function igualarAncho() {
    var meta = ligero.getBoundingClientRect().width, lo = 62, hi = 125;
    for (var i = 0; i < 14; i++) {
      var m = (lo + hi) / 2;
      titulo.style.fontStretch = m + '%';
      if (titulo.getBoundingClientRect().width > meta) hi = m; else lo = m;
    }
    titulo.style.fontStretch = lo + '%';
  }

  function preparar() {
    igualarAncho();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var r = hero.getBoundingClientRect();
    W = r.width; H = r.height;
    lienzo.width = W * dpr; lienzo.height = H * dpr;
    lienzo.style.width = W + 'px'; lienzo.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Zona del gráfico: mitad derecha en escritorio, franja inferior en móvil
    var ancho = W > 900;
    zona = ancho
      ? { x: W * 0.54, y: H * 0.2, w: W * 0.4, h: H * 0.62 }
      : { x: W * 0.06, y: H * 0.62, w: W * 0.88, h: H * 0.3 };

    var paso = ancho ? 5 : 4, lado = ancho ? 2.2 : 1.8;
    var nb = VALORES.length, hueco = zona.w / nb, anchoBarra = hueco * 0.62;
    var celdas = [];
    VALORES.forEach(function (v, i) {
      var x0 = zona.x + i * hueco + (hueco - anchoBarra) / 2;
      var alto = v * zona.h, base = zona.y + zona.h;
      for (var y = base - paso; y >= base - alto; y -= paso)
        for (var x = x0; x < x0 + anchoBarra; x += paso)
          celdas.push({ x: x, y: y, barra: i });
    });
    var extra = Math.round(celdas.length * (ancho ? 0.9 : 0.6));
    particulas = [];
    for (var k = 0; k < celdas.length + extra; k++) {
      var c = celdas[k];
      particulas.push({
        hx: Math.random() * W, hy: Math.random() * H,
        fase: Math.random() * Math.PI * 2, vel: 0.3 + Math.random() * 0.7,
        tx: c ? c.x : null, ty: c ? c.y : null, barra: c ? c.barra : -1,
        lado: lado, k: 0, x: 0, y: 0
      });
    }
  }

  function suave(t) { return t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3); }

  function cuadro(seg) {
    var t = seg % CICLO;
    var avance = suave((t - BARRIDO[0]) / (BARRIDO[1] - BARRIDO[0]));
    var soltando = t > SUELTA;
    var xRegla = -20 + avance * (W + 40);
    if (soltando) xRegla = W + 40;

    // Regla y lectura
    var visible = t > BARRIDO[0] - 0.2 && t < BARRIDO[1] + 0.4;
    regla.style.transform = 'translateX(' + xRegla + 'px)';
    regla.style.opacity = visible ? 1 : 0;
    lectura.textContent = String(Math.round((soltando ? 0 : avance) * 100)).padStart(3, ' ') + '%';

    // Título: la versión pesada se revela hasta la regla, y se apaga al soltar
    var tr = titulo.getBoundingClientRect(), hr = hero.getBoundingClientRect();
    var corte = Math.max(0, Math.min(tr.width, xRegla - (tr.left - hr.left)));
    var apagado = soltando ? suave((t - SUELTA) / 1.6) : 0;
    titulo.style.clipPath = 'inset(-10% ' + (tr.width - corte) + 'px -10% 0)';
    ligero.style.clipPath = 'inset(-10% 0 -10% ' + (apagado < 1 ? corte * (1 - apagado) : 0) + 'px)';
    titulo.style.opacity = 1 - apagado;

    // Partículas
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < particulas.length; i++) {
      var p = particulas[i];
      var nx = p.hx + Math.sin(seg * 0.35 * p.vel + p.fase) * 14;
      var ny = p.hy + Math.cos(seg * 0.3 * p.vel + p.fase) * 10;
      var dx = nx - raton.x, dy = ny - raton.y, d2 = dx * dx + dy * dy;
      if (d2 < 9000) { var f = (9000 - d2) / 9000 * 18; nx += dx / Math.sqrt(d2 + 1) * f; ny += dy / Math.sqrt(d2 + 1) * f; }

      if (p.tx !== null) {
        var objetivo = soltando ? 0 : (xRegla > p.tx ? 1 : 0);
        p.k += (objetivo - p.k) * (soltando ? 0.035 : 0.07);
      }
      var e = p.k;
      p.x = nx + (p.tx === null ? 0 : (p.tx - nx) * e);
      p.y = ny + (p.ty === null ? 0 : (p.ty - ny) * e);
      ctx.fillStyle = e > 0.5 ? (p.barra === ACENTO ? VERDE : TINTA) : NIEBLA;
      ctx.fillRect(p.x, p.y, p.lado, p.lado);
    }
  }

  function estatico() {
    // Sin movimiento: el estado medido, quieto
    particulas.forEach(function (p) { p.k = p.tx === null ? 0 : 1; });
    titulo.style.clipPath = 'none';
    ligero.style.visibility = 'hidden';
    regla.style.opacity = 0;
    lectura.textContent = '100%';
    ctx.clearRect(0, 0, W, H);
    particulas.forEach(function (p) {
      var x = p.tx === null ? p.hx : p.tx, y = p.ty === null ? p.hy : p.ty;
      ctx.fillStyle = p.tx === null ? NIEBLA : (p.barra === ACENTO ? VERDE : TINTA);
      ctx.fillRect(x, y, p.lado, p.lado);
    });
  }

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(iniciar);
  function iniciar() {
  preparar();
  if (quieto) { estatico(); addEventListener('resize', function () { preparar(); estatico(); }); return; }

  var t0 = performance.now(), activo = true, raf;
  function bucle(ahora) { cuadro((ahora - t0) / 1000); raf = requestAnimationFrame(bucle); }
  raf = requestAnimationFrame(bucle);

  // Pausa fuera de pantalla o con la pestaña oculta
  new IntersectionObserver(function (es) {
    var v = es[0].isIntersecting;
    if (v && !activo) { activo = true; raf = requestAnimationFrame(bucle); }
    if (!v && activo) { activo = false; cancelAnimationFrame(raf); }
  }).observe(hero);

  hero.addEventListener('pointermove', function (e) {
    var r = hero.getBoundingClientRect();
    raton.x = e.clientX - r.left; raton.y = e.clientY - r.top;
  });
  hero.addEventListener('pointerleave', function () { raton.x = raton.y = -1e4; });
  var espera;
  addEventListener('resize', function () { clearTimeout(espera); espera = setTimeout(preparar, 150); });
  }
})();
