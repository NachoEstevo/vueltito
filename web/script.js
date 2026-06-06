// vueltito landing — interactions
(function () {
  'use strict';

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

  // ---- interactive hero checkout card ----
  var vcard = document.getElementById('vcard');
  if (vcard) {
    var TOTAL = 27980;          // subtotal + envío
    var FIJO = 10;              // aporte fijo
    var PCT = 0.005;            // 0,5%

    var elToggle   = document.getElementById('cc-toggle');
    var elAporte   = document.getElementById('cc-aporte');
    var elVendedor = document.getElementById('cc-vendedor');
    var elVueltito = document.getElementById('cc-vueltito');
    var elNote     = document.getElementById('cc-splitnote');
    var elVnote2   = document.getElementById('cc-vnote2');
    var opts       = vcard.querySelectorAll('.cc-opt');

    var state = { enabled: true, mode: 'porcentaje' };

    function money(n) {
      return '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    function pct(val) {
      var p = Math.round((val / TOTAL) * 10000) / 100; // 2 decimals
      return p.toString().replace('.', ',');
    }
    function pop(el) {
      if (!el) return;
      el.classList.remove('value-pop');
      void el.offsetWidth; // reflow to restart animation
      el.classList.add('value-pop');
    }

    function render(animate) {
      var aporte = !state.enabled ? 0 : (state.mode === 'fijo' ? FIJO : Math.round(TOTAL * PCT));
      var vendedor = TOTAL - aporte;

      elAporte.textContent = money(aporte);
      elVendedor.textContent = money(vendedor);
      elVueltito.textContent = money(aporte);

      if (state.enabled) {
        elNote.textContent = 'Split automático ' + pct(vendedor) + '% / ' + pct(aporte) + '%';
        elVnote2.textContent = 'Podés quitarlo antes de pagar.';
      } else {
        elNote.textContent = 'Sin aporte · 100% al comercio';
        elVnote2.textContent = 'Activalo cuando quieras sumar tu aporte.';
      }

      vcard.classList.toggle('is-off', !state.enabled);
      if (elToggle) elToggle.setAttribute('aria-pressed', String(state.enabled));

      opts.forEach(function (o) {
        o.classList.toggle('is-active', state.enabled && o.dataset.mode === state.mode);
      });

      if (animate) { pop(elAporte); pop(elVueltito); pop(elVendedor); }
    }

    if (elToggle) {
      elToggle.addEventListener('click', function () {
        state.enabled = !state.enabled;
        render(true);
      });
    }
    opts.forEach(function (o) {
      o.addEventListener('click', function () {
        state.enabled = true;          // selecting an option turns it on
        state.mode = o.dataset.mode;
        render(true);
      });
    });

    render(false);
  }
})();
