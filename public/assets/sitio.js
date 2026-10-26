// Movimiento y formularios de la v2. Sin dependencias.
// La regla del sitio: lo que se mira cambia. La tipografía gana peso cuando entra en pantalla.
(function () {
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Aparición y peso al entrar en pantalla
  var vistos = document.querySelectorAll('[data-aparece],[data-pesa],.cifra');
  if (quieto || !('IntersectionObserver' in window)) {
    vistos.forEach(function (el) { el.classList.add('visto'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('visto');
        io.unobserve(e.target);
      });
    }, { threshold: 0.35 });
    vistos.forEach(function (el) { io.observe(el); });
  }

  // 1b. Regla de progreso: la página también se mide
  var barra = document.querySelector('.progreso');
  if (barra && !quieto) {
    var pintar = function () {
      var h = document.documentElement.scrollHeight - innerHeight;
      barra.style.setProperty('--p', h > 0 ? (scrollY / h).toFixed(4) : 0);
    };
    addEventListener('scroll', pintar, { passive: true });
    pintar();
  }

  // 1c. Títulos que se revelan por máscara: observan su sección
  document.querySelectorAll('.revela').forEach(function (r) {
    var cont = r.closest('[data-aparece],h1,h2') || r;
    if (quieto || !('IntersectionObserver' in window)) return r.classList.add('visto');
    var o = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { r.classList.add('visto'); o.disconnect(); }
    }, { threshold: 0.2 });
    o.observe(cont);
  });

  // 2. Medidor de la portada: una regla recorre la palabra y cada letra medida gana peso
  document.querySelectorAll('[data-medidor]').forEach(function (el) {
    var texto = el.textContent;
    el.textContent = '';
    el.classList.add('medido');
    var letras = Array.prototype.map.call(texto, function (c) {
      var s = document.createElement('span');
      s.className = 'l';
      s.textContent = c;
      el.appendChild(s);
      return s;
    });
    var regla = document.createElement('span');
    regla.className = 'regla';
    regla.setAttribute('aria-hidden', 'true');
    el.appendChild(regla);
    el.setAttribute('aria-label', texto);

    if (quieto) { letras.forEach(function (s) { s.classList.add('pesa'); }); return; }

    function medir() {
      el.classList.add('midiendo');
      letras.forEach(function (s) { s.classList.remove('pesa'); });
      var ancho = el.getBoundingClientRect().width, t0 = null, dur = 2200;
      function paso(t) {
        if (!t0) t0 = t;
        var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        var x = e * ancho;
        el.style.setProperty('--x', x + 'px');
        regla.setAttribute('data-v', Math.round(e * 100) + '%');
        letras.forEach(function (s) { if (s.offsetLeft + s.offsetWidth / 2 <= x) s.classList.add('pesa'); });
        if (k < 1) requestAnimationFrame(paso);
        else setTimeout(function () { el.classList.remove('midiendo'); }, 600);
      }
      requestAnimationFrame(paso);
    }
    setTimeout(medir, 500);
    el.addEventListener('mouseenter', function () { if (!el.classList.contains('midiendo')) medir(); });
  });

  // 3. Respaldo del video: un tablero que cambia cuando el cursor o el scroll lo "miran"
  document.querySelectorAll('[data-tablero]').forEach(function (t) {
    var filas = t.querySelectorAll('.fila');
    if (quieto || !filas.length) return;
    var i = 0;
    setInterval(function () {
      filas.forEach(function (f) { f.classList.remove('mirada'); });
      var f = filas[i % filas.length];
      f.classList.add('mirada');
      var v = 30 + Math.round(Math.random() * 65);
      f.style.setProperty('--v', (v / 100).toFixed(2));
      f.querySelector('.n').textContent = v;
      i++;
    }, 1600);
  });

  // 4. Espacios de video (Higgsfield): se carga el clip solo si existe y si la persona acepta movimiento
  document.querySelectorAll('[data-video]').forEach(function (fig) {
    if (quieto) return;
    var src = fig.getAttribute('data-video');
    var cargar = function () {
      fetch(src, { method: 'HEAD' }).then(function (r) {
        if (!r.ok) return;
        var v = document.createElement('video');
        // data-una-vez: el clip se reproduce una vez y queda en su último cuadro (la gota ya cayó)
        v.muted = true; v.loop = !fig.hasAttribute('data-una-vez'); v.autoplay = true; v.playsInline = true;
        v.setAttribute('aria-hidden', 'true');
        if (fig.getAttribute('data-poster')) v.poster = fig.getAttribute('data-poster');
        [[src, 'video/webm'], [src.replace(/\.webm$/, '.mp4'), 'video/mp4']].forEach(function (f) {
          var s = document.createElement('source'); s.src = f[0]; s.type = f[1]; v.appendChild(s);
        });
        fig.insertBefore(v, fig.firstChild);
        v.addEventListener('playing', function () { fig.classList.add('con-video'); });
        v.play().catch(function () {});
      }).catch(function () {});
    };
    if (!('IntersectionObserver' in window)) return cargar();
    var o = new IntersectionObserver(function (es) {
      if (es[0].isIntersecting) { o.disconnect(); cargar(); }
    }, { rootMargin: '200px' });
    o.observe(fig);
  });

  // 5. Formularios en línea: newsletter y lista de espera usan /api/suscribir
  document.querySelectorAll('form.en-linea').forEach(function (f) {
    var resp = f.nextElementSibling;
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var b = f.querySelector('button');
      b.disabled = true;
      fetch('/api/suscribir', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: f.correo.value, web: f.web.value })
      }).then(function (r) { return r.json(); }).then(function (d) {
        resp.textContent = d.ok ? (f.getAttribute('data-gracias') || d.mensaje) : d.mensaje;
        if (d.ok) {
          f.reset();
          // Medición: suscripción (GA4 + TikTok)
          try {
            if (window.gtag) gtag('event', 'sign_up', { method: 'newsletter' });
            if (window.ttq) ttq.track('Subscribe');
          } catch (e) {}
        }
      }).catch(function () {
        resp.textContent = 'Sin conexión. Intenta de nuevo.';
      }).then(function () { b.disabled = false; });
    });
  });
})();
