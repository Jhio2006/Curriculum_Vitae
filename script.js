/**
 * script.js — Perfil Personal / Carta de Presentación
 * Mejoras: scroll reveal con stagger, barras de idiomas escalonadas,
 * navegación activa con throttle, menú móvil.
 */

(function () {
  'use strict';

  /* ============================================
     TEMA (modo oscuro / modo claro) — por defecto oscuro
     ============================================ */
  const THEME_KEY = 'theme';
  const root = document.documentElement;

  function getTheme() {
    return localStorage.getItem(THEME_KEY) || 'dark';
  }

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    const btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
      btn.setAttribute('title', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }
  }

  function initTheme() {
    setTheme(getTheme());
  }

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    document.querySelector('.theme-toggle')?.addEventListener('click', () => {
      const next = getTheme() === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  });

  /* Aplicar tema de inmediato para evitar parpadeo */
  setTheme(getTheme());

  /* ============================================
     UTILIDADES
     ============================================ */

  /**
   * Limita la frecuencia de ejecución de una función (ej. en scroll).
   * @param {Function} fn - Función a ejecutar
   * @param {number} wait - Milisegundos entre ejecuciones
   * @returns {Function}
   */
  function throttle(fn, wait) {
    let last = 0;
    let timer = null;
    return function executed() {
      const now = Date.now();
      const elapsed = now - last;
      if (elapsed >= wait) {
        last = now;
        fn.apply(this, arguments);
      } else if (!timer) {
        timer = setTimeout(() => {
          timer = null;
          last = Date.now();
          fn.apply(this, arguments);
        }, wait - elapsed);
      }
    };
  }

  /**
   * Obtiene el retraso en ms para animaciones escalonadas (data-reveal-delay o índice).
   * @param {Element} el - Elemento
   * @param {number} index - Índice del elemento
   * @param {number} baseMs - Base en ms por índice
   * @returns {number}
   */
  function getRevealDelay(el, index, baseMs) {
    const data = el.getAttribute('data-reveal-delay');
    if (data !== null && data !== '') return parseInt(data, 10) || 0;
    return index * (baseMs || 60);
  }

  /* ============================================
     SCROLL REVEAL
     ============================================ */

  const revealEls = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const index = Array.from(revealEls).indexOf(el);
        const delay = getRevealDelay(el, index, 70);
        setTimeout(() => el.classList.add('visible'), delay);
        revealObserver.unobserve(el);
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  /* ============================================
     BARRAS DE IDIOMAS (animación escalonada)
     ============================================ */

  const langSection = document.querySelector('#formacion');
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const bars = entry.target.querySelectorAll('.lang-bar-fill');
        bars.forEach((bar, i) => {
          const delay = i * 180;
          setTimeout(() => {
            const width = bar.getAttribute('data-width') || '0';
            bar.style.width = width + '%';
          }, delay);
        });
        barObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.25 }
  );
  if (langSection) barObserver.observe(langSection);

  /* ============================================
     NAVEGACIÓN: sección activa + estado al hacer scroll
     ============================================ */

  const nav = document.querySelector('nav');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function updateNavState() {
    const scrollY = window.scrollY;
    const navHeight = nav ? nav.offsetHeight : 60;

    // Clase nav--scrolled para sombra y borde
    if (nav) {
      if (scrollY > 30) nav.classList.add('nav--scrolled');
      else nav.classList.remove('nav--scrolled');
    }

    // Sección actual: la que está más cerca del tercio superior de la pantalla
    let currentId = '';
    const trigger = scrollY + navHeight + 120;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (trigger >= top && trigger < top + height) currentId = section.id;
      if (scrollY < 200 && section.id === 'hero') currentId = 'hero';
    });
    if (!currentId && sections.length) currentId = sections[sections.length - 1].id;

    navLinks.forEach((link) => {
      const href = link.getAttribute('href') || '';
      const id = href.replace('#', '');
      if (id === currentId) {
        link.classList.add('nav-link--active');
        link.style.color = '';
      } else {
        link.classList.remove('nav-link--active');
        link.style.color = '';
      }
    });
  }

  window.addEventListener('scroll', throttle(updateNavState, 80), { passive: true });
  window.addEventListener('load', updateNavState);

  /* ============================================
     MENÚ MÓVIL (hamburguesa)
     ============================================ */

  const navToggle = document.querySelector('.nav-toggle');
  const navLinksEl = document.querySelector('.nav-links');

  if (navToggle && navLinksEl) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinksEl.classList.toggle('nav-links--open');
      navToggle.classList.toggle('nav-toggle--open', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen);
      navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    function closeMenu() {
      navLinksEl.classList.remove('nav-links--open');
      navToggle.classList.remove('nav-toggle--open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menú');
      document.body.style.overflow = '';
    }

    navLinksEl.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768) closeMenu();
      }, 150);
    });
  }

  /* ============================================
     PARTÍCULAS INTERACTIVAS
     Partículas flotantes que se conectan entre sí y reaccionan al cursor
     ============================================ */

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.getElementById('particles-canvas');

  if (!prefersReducedMotion && canvas) {

  const ctx = canvas.getContext('2d');
  let width = window.innerWidth;
  let height = window.innerHeight;
  let mouse = { x: null, y: null };
  const mouseRadius = 120;
  const mouseForce = 0.08;

  const particleCount = Math.min(80, Math.floor((width * height) / 15000));
  const particles = [];

  function getParticleColors() {
    // Partículas siempre doradas, en ambos modos
    return { particle: 'rgba(200, 169, 110', lineBase: 0.16, lineMax: 0.4 };
  }

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    initParticles();
  }

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.4 + 1.2,
        opacity: 0.5 + Math.random() * 0.45,
      });
    }
  }

  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    const colors = getParticleColors();

    // Actualizar y dibujar partículas (más notorias: mayor opacidad y radio)
    particles.forEach((p, i) => {
      if (mouse.x != null && mouse.y != null) {
        const d = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (d < mouseRadius) {
          const f = (1 - d / mouseRadius) * mouseForce;
          const ax = (p.x - mouse.x) / d;
          const ay = (p.y - mouse.y) / d;
          p.vx += ax * f;
          p.vy += ay * f;
        }
      }
      p.vx *= 0.98;
      p.vy *= 0.98;
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;
      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${colors.particle}, ${p.opacity})`;
      ctx.fill();
    });

    // Líneas entre partículas cercanas (más visibles)
    const linkDist = 140;
    ctx.lineWidth = 0.8;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const d = dist(particles[i], particles[j]);
        if (d < linkDist) {
          const alpha = colors.lineBase + (1 - d / linkDist) * (colors.lineMax - colors.lineBase);
          ctx.strokeStyle = colors.particle + ', ' + alpha + ')';
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  requestAnimationFrame(animate);
  }
})();
