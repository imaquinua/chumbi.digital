const includeHTML = async () => {
  const includes = document.querySelectorAll("[data-include]");
  for (const el of includes) {
    const file = `includes/_${el.dataset.include}.html`;
    try {
      const response = await fetch(file);
      if (!response.ok) {
        throw new Error(`Could not load ${file}`);
      }
      const text = await response.text();
      // Create a temporary element to hold the new content
      const temp = document.createElement('div');
      temp.innerHTML = text;
      // Replace the placeholder with the new content
      el.replaceWith(...temp.childNodes);
    } catch (error) {
      console.error(error);
      el.textContent = `Error loading ${el.dataset.include}`;
    }
  }
};

const ready = (fn) => {
  if (document.readyState !== "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
};

ready(async () => {
  await includeHTML();

  const revealItems = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const currentPath = window.location.pathname.replace(/\/$/, "/index.html");
  document.querySelectorAll(".site-nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href.startsWith("#")) {
      return;
    }

    let linkPath = href;
    try {
      const linkUrl = new URL(href, window.location.href);
      linkPath = linkUrl.pathname.replace(/\/$/, "/index.html");
    } catch (error) {
      // Keep fallback path if URL parsing fails.
    }

    if (linkPath === currentPath) {
      link.setAttribute("aria-current", "page");
    }
  });

  const year = document.querySelector("[data-year]");
  if (year) {
    year.textContent = new Date().getFullYear();
  }
});
