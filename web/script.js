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
    var TOTAL = 27980;          // subtotal + envío, before donation
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
    function pop(el) {
      if (!el) return;
      el.classList.remove('value-pop');
      void el.offsetWidth; // reflow to restart animation
      el.classList.add('value-pop');
    }

    function render(animate) {
      var aporte = !state.enabled ? 0 : (state.mode === 'fijo' ? FIJO : Math.round(TOTAL * PCT));
      var totalCobrado = TOTAL + aporte;

      elAporte.textContent = money(aporte);
      elVendedor.textContent = money(totalCobrado);
      elVueltito.textContent = money(aporte);

      if (state.enabled) {
        elNote.textContent = 'El comercio cobra el total · remesa pendiente a ONG';
        elVnote2.textContent = 'Podés quitarlo antes de pagar.';
      } else {
        elNote.textContent = 'Sin donación · se cobra solo la compra';
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
    var obError = modal.querySelector('[data-ob-error]');
    var obSubmit = obForm.querySelector('.ob-submit');
    var lastFocus = null;

    function openModal() {
      lastFocus = document.activeElement;
      obForm.hidden = false;
      obSuccess.hidden = true;
      if (obError) obError.hidden = true;
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
      b.addEventListener('click', function (e) {
        if (e.cancelable) e.preventDefault();
        openModal();
      });
    });
    modal.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', closeModal);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    function setObBusy(isBusy) {
      if (!obSubmit) return;
      obSubmit.disabled = isBusy;
      obSubmit.textContent = isBusy ? 'Enviando...' : 'Enviar solicitud';
    }

    function showObError() {
      if (!obError) return;
      obError.hidden = false;
    }

    obForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (obError) obError.hidden = true;

      var ong = obForm.ong, contactName = obForm.contactName, email = obForm.email;
      var ok = true;
      [ong, contactName, email].forEach(function (f) {
        var valid = f.value.trim() && (f.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
        f.classList.toggle('invalid', !valid);
        if (!valid) ok = false;
      });
      if (!ok) {
        (ong.classList.contains('invalid') ? ong : contactName.classList.contains('invalid') ? contactName : email).focus();
        return;
      }

      var data = {
        ong: ong.value.trim(),
        contactName: contactName.value.trim(),
        email: email.value.trim(),
        area: obForm.area.value,
        msg: obForm.msg.value.trim(),
        website: obForm.website ? obForm.website.value : '',
        source: 'landing_ong',
        pagePath: window.location.pathname,
        ts: new Date().toISOString()
      };

      setObBusy(true);
      try {
        var response = await fetch('/api/waitlist/ongs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        var payload = await response.json().catch(function () { return {}; });
        if (!response.ok || !payload.ok) throw new Error(payload.error || 'waitlist_unavailable');
      } catch (err) {
        showObError();
        return;
      } finally {
        setObBusy(false);
      }

      modal.querySelector('#ob-name').textContent = data.ong || 'tu ONG';
      modal.querySelector('#ob-mail').textContent = data.email;
      obForm.reset();
      obForm.hidden = true;
      obSuccess.hidden = false;
    });
  }

  // ---- ONG picker overlay ----
  var picker = document.getElementById('ong-picker');
  if (picker) {
    var pkLastFocus = null;
    var openPicker = function () {
      pkLastFocus = document.activeElement;
      picker.classList.add('is-open');
      picker.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-lock');
    };
    var closePicker = function () {
      picker.classList.remove('is-open');
      picker.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-lock');
      if (pkLastFocus && pkLastFocus.focus) pkLastFocus.focus();
    };

    document.querySelectorAll('[data-ong-picker]').forEach(function (b) {
      b.addEventListener('click', openPicker);
    });
    picker.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', closePicker);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && picker.classList.contains('is-open')) closePicker();
    });

    var destName = document.querySelector('.cc-dest-name');
    var destMeta = document.querySelector('.cc-dest-meta');
    var destImg = document.querySelector('.cc-dest-logo img');
    var ongOpts = picker.querySelectorAll('.ong-opt');
    ongOpts.forEach(function (o) {
      o.addEventListener('click', function () {
        ongOpts.forEach(function (x) { x.classList.remove('is-active'); });
        o.classList.add('is-active');
        if (destName) destName.textContent = o.dataset.name;
        if (destMeta) destMeta.textContent = o.dataset.meta;
        if (destImg) { destImg.src = o.dataset.logo; destImg.alt = o.dataset.name; }
        closePicker();
      });
    });
  }

  // ---- merchant pilot modal ----
  var mModal = document.getElementById('merchant');
  if (mModal) {
    var mForm = document.getElementById('m-form');
    var mSuccess = mModal.querySelector('.ob-success');
    var mLastFocus = null;

    var openM = function () {
      mLastFocus = document.activeElement;
      mForm.hidden = false;
      mSuccess.hidden = true;
      mModal.classList.add('is-open');
      mModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-lock');
      setTimeout(function () {
        var f = mModal.querySelector('.ob-form input');
        if (f) f.focus();
      }, 60);
    };
    var closeM = function () {
      mModal.classList.remove('is-open');
      mModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-lock');
      if (mLastFocus && mLastFocus.focus) mLastFocus.focus();
    };

    document.querySelectorAll('[data-merchant]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        if (e.cancelable) e.preventDefault();
        openM();
      });
    });
    mModal.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', closeM);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mModal.classList.contains('is-open')) closeM();
    });

    mForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var comercio = mForm.comercio, email = mForm.email;
      var ok = true;
      [comercio, email].forEach(function (f) {
        var valid = f.value.trim() && (f.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
        f.classList.toggle('invalid', !valid);
        if (!valid) ok = false;
      });
      if (!ok) { (comercio.classList.contains('invalid') ? comercio : email).focus(); return; }

      var data = {
        comercio: comercio.value.trim(),
        email: email.value.trim(),
        plataforma: mForm.plataforma.value,
        msg: mForm.msg.value.trim(),
        ts: new Date().toISOString()
      };
      // Persist locally. To capture server-side, POST `data` to a form
      // endpoint (Formspree, Sheets, etc.) here.
      try {
        var key = 'vueltito_merchant_requests';
        var arr = JSON.parse(localStorage.getItem(key) || '[]');
        arr.push(data);
        localStorage.setItem(key, JSON.stringify(arr));
      } catch (err) {}

      mModal.querySelector('#m-name-out').textContent = data.comercio || 'tu comercio';
      mModal.querySelector('#m-mail-out').textContent = data.email;
      mForm.reset();
      mForm.hidden = true;
      mSuccess.hidden = false;
    });
  }

  // ---- live leaderboard preview on the home page ----
  (function hydrateLeaderboardPreview() {
    var preview = document.getElementById('home-leaderboard-preview');
    if (!preview || !window.fetch) return;

    function money(cents, currency) {
      try {
        return new Intl.NumberFormat('es-AR', {
          style: 'currency',
          currency: currency || 'ARS',
          maximumFractionDigits: 0
        }).format((Number(cents) || 0) / 100);
      } catch (error) {
        return '$' + Math.round((Number(cents) || 0) / 100).toLocaleString('es-AR');
      }
    }

    function badgeFor(row, index) {
      if (index === 0) return ['Transparente', 'chip-green'];
      if ((row.donations || 0) >= 6) return ['Constante', 'chip-blue'];
      if ((row.donations || 0) <= 2) return ['Nuevo', 'chip-amber'];
      return ['Impacto', 'chip-violet'];
    }

    function appendText(parent, value) {
      parent.appendChild(document.createTextNode(String(value)));
    }

    function render(rows) {
      var head = preview.querySelector('.lb-thead');
      preview.innerHTML = '';
      if (head) preview.appendChild(head);

      rows.slice(0, 5).forEach(function (row, index) {
        var badge = badgeFor(row, index);
        var item = document.createElement('div');
        item.className = 'lb-row';

        var rank = document.createElement('span');
        rank.className = 'lb-rank';
        appendText(rank, index + 1);

        var alias = document.createElement('span');
        alias.className = 'lb-alias';
        var avatar = document.createElement('i');
        avatar.className = 'av av-' + ((index % 5) + 1);
        alias.appendChild(avatar);
        appendText(alias, row.publicAlias || 'Donante');

        var amount = document.createElement('span');
        appendText(amount, money(row.amountCents, row.currency));

        var donations = document.createElement('span');
        appendText(donations, Number(row.donations) === 1 ? '1 aporte' : (Number(row.donations) || 0) + ' aportes');

        var chip = document.createElement('span');
        chip.className = 'chip ' + badge[1];
        appendText(chip, badge[0]);

        item.appendChild(rank);
        item.appendChild(alias);
        item.appendChild(amount);
        item.appendChild(donations);
        item.appendChild(chip);
        preview.appendChild(item);
      });
    }

    window.fetch('https://vueltito-api-production.up.railway.app/v1/public/leaderboard?limit=5', { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) throw new Error('leaderboard_unavailable');
        return response.json();
      })
      .then(function (payload) {
        var rows = payload && Array.isArray(payload.rows) ? payload.rows : [];
        if (rows.length) render(rows);
      })
      .catch(function () {});
  })();

  // ---- smooth FAQ (animated <details>) ----
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.faq-item').forEach(function (item) {
    var summary = item.querySelector('summary');
    if (!summary) return;

    // Wrap everything after <summary> so its height can be animated.
    var body = document.createElement('div');
    body.className = 'faq-body';
    var inner = document.createElement('div');
    inner.className = 'faq-body-inner';
    var node = summary.nextSibling;
    while (node) {
      var next = node.nextSibling;
      inner.appendChild(node);
      node = next;
    }
    body.appendChild(inner);
    item.appendChild(body);
    if (item.open) item.classList.add('is-open');

    var animating = false;

    summary.addEventListener('click', function (e) {
      e.preventDefault();

      // No animation requested by the user agent: toggle instantly.
      if (reduceMotion) {
        item.open = !item.open;
        item.classList.toggle('is-open', item.open);
        return;
      }
      if (animating) return;

      if (item.open) {
        // ---- close: animate to 0, then collapse <details> ----
        animating = true;
        item.classList.remove('is-open');
        var done = false;
        var finish = function () {
          if (done) return;
          done = true;
          body.removeEventListener('transitionend', onEnd);
          item.open = false;
          animating = false;
        };
        var onEnd = function (ev) {
          if (ev.target === body && ev.propertyName === 'grid-template-rows') finish();
        };
        body.addEventListener('transitionend', onEnd);
        setTimeout(finish, 500); // fallback if transitionend never fires
      } else {
        // ---- open: render content, then animate to full height ----
        item.open = true;
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            item.classList.add('is-open');
          });
        });
      }
    });
  });
})();
