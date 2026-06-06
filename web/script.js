// vueltito landing — interactions
(function () {
  'use strict';

  // ---- inject brand mark into every .brand-mark ----
  var markSVG =
    '<svg class="mark" viewBox="0 0 40 40" aria-hidden="true">' +
    '<path d="M32.5 20a12.5 12.5 0 1 0-3.4 8.6" fill="none" stroke="url(#brandGrad)" stroke-width="3.4" stroke-linecap="round"/>' +
    '<path d="M26.4 17.6l2.7 3.6 3.8-2.2" fill="none" stroke="#7AC943" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M20 29v-7.4M20 21.6c0-3.4-2.9-5.8-6.3-5.7.1 3.4 2.9 5.8 6.3 5.7Zm0-.5c0-3.1 2.6-5.2 5.8-5.1.1 3.2-2.6 5.2-5.8 5.1Z" fill="#7AC943"/>' +
    '</svg>';
  document.querySelectorAll('.brand-mark').forEach(function (el) {
    el.innerHTML = markSVG;
  });

  // ---- nav scroll shadow ----
  var nav = document.getElementById('nav');
  var onScroll = function () {
    if (window.scrollY > 12) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- mobile menu ----
  var burger = document.getElementById('burger');
  if (burger) {
    burger.addEventListener('click', function () {
      nav.classList.toggle('menu-open');
    });
    nav.querySelectorAll('.nav-links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('menu-open'); });
    });
  }

  // ---- reveal on scroll ----
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }
})();
