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

  // ---- onboarding ONG modal ----
  var modal = document.getElementById('onboarding');
  if (modal) {
    var obForm = document.getElementById('ob-form');
    var obSuccess = modal.querySelector('.ob-success');
    var lastFocus = null;

    function openModal() {
      lastFocus = document.activeElement;
      obForm.hidden = false;
      obSuccess.hidden = true;
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-lock');
      setTimeout(function () {
        var first = modal.querySelector('.ob-form input');
        if (first) first.focus();
      }, 60);
    }
    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-lock');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.querySelectorAll('[data-onboarding]').forEach(function (b) {
      b.addEventListener('click', openModal);
    });
    modal.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    obForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var ong = obForm.ong, email = obForm.email;
      var ok = true;
      [ong, email].forEach(function (f) {
        var valid = f.value.trim() && (f.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
        f.classList.toggle('invalid', !valid);
        if (!valid) ok = false;
      });
      if (!ok) { (ong.classList.contains('invalid') ? ong : email).focus(); return; }

      var data = {
        ong: ong.value.trim(),
        email: email.value.trim(),
        area: obForm.area.value,
        msg: obForm.msg.value.trim(),
        ts: new Date().toISOString()
      };
      // Persist the request locally. To capture server-side, POST `data`
      // to a form endpoint (Formspree, Sheets, etc.) here.
      try {
        var key = 'vueltito_ong_requests';
        var arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.push(data);
        localStorage.setItem(key, JSON.stringify(arr));
      } catch (err) {}

      modal.querySelector('#ob-name').textContent = data.ong || 'tu ONG';
      modal.querySelector('#ob-mail').textContent = data.email;
      obForm.reset();
      obForm.hidden = true;
      obSuccess.hidden = false;
    });
  }
})();
