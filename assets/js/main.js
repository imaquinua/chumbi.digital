// Detectar base path para subdirectorios
const getBasePath = () => {
  const path = window.location.pathname;
  const depth = (path.match(/\//g) || []).length - 1;
  return depth > 0 ? '../'.repeat(depth) : '';
};

// Sistema de includes dinamicos
const includeHTML = async () => {
  const basePath = getBasePath();
  const includes = document.querySelectorAll("[data-include]");
  for (const el of includes) {
    const file = `${basePath}includes/_${el.dataset.include}.html`;
    try {
      const response = await fetch(file);
      if (!response.ok) {
        throw new Error(`Could not load ${file}`);
      }
      let text = await response.text();
      // Ajustar paths relativos en el contenido cargado
      if (basePath) {
        text = text.replace(/href="(?!http|#|mailto)([^"]+)"/g, `href="${basePath}$1"`);
        text = text.replace(/src="(?!http)([^"]+)"/g, `src="${basePath}$1"`);
      }
      const temp = document.createElement('div');
      temp.innerHTML = text;
      el.replaceWith(...temp.childNodes);
    } catch (error) {
      console.error(error);
    }
  }
};

// Inicializacion principal
document.addEventListener('DOMContentLoaded', async () => {
  // Cargar includes primero
  await includeHTML();

  // Inicializar AOS (Animate On Scroll)
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 600,
      easing: 'ease-out',
      once: true,
      offset: 50
    });
  }

  // Year dinamico en footer
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Inicializar Swiper donde exista
  const swiperContainers = document.querySelectorAll('.swiper');
  if (typeof Swiper !== 'undefined' && swiperContainers.length > 0) {
    swiperContainers.forEach(container => {
      new Swiper(container, {
        slidesPerView: 1,
        spaceBetween: 16,
        pagination: {
          el: '.swiper-pagination',
          clickable: true
        },
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev'
        },
        breakpoints: {
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 }
        }
      });
    });
  }

  // Detectar dark mode del sistema si no hay preferencia guardada
  if (!localStorage.getItem('darkMode')) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  } else if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
  }
});
