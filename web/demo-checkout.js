(function hydrateDemoCheckout() {
  var root = document.querySelector('[data-cycle-checkout]');
  var cycle = window.VueltitoDemoCycle;
  if (!root || !cycle) return;

  var STORAGE_KEY = 'vueltito_demo_cycle_v1';
  var subtotalCents = 5725000;
  var viewState = { enabled: false, amountCents: 20000, custom: false };
  var summary = root.querySelector('[data-cycle-summary]');
  var toggle = root.querySelector('[data-demo-toggle]');
  var amountButtons = Array.prototype.slice.call(root.querySelectorAll('[data-demo-amount]'));
  var otherButton = root.querySelector('[data-demo-other]');
  var customForm = root.querySelector('[data-demo-custom]');
  var customInput = root.querySelector('#demo-custom-amount');
  var customError = root.querySelector('[data-demo-error]');
  var donationEls = root.querySelectorAll('[data-demo-donation]');
  var pill = root.querySelector('[data-demo-pill]');
  var total = root.querySelector('[data-demo-total]');
  var line = root.querySelector('[data-demo-donation-line]');
  var note = root.querySelector('[data-demo-note]');
  var pay = root.querySelector('[data-demo-pay]');
  var payStatus = root.querySelector('[data-demo-pay-status]');
  var leaderboard = root.querySelector('[data-demo-leaderboard]');
  var identity = root.querySelector('[data-demo-identity]');
  var alias = root.querySelector('[data-demo-alias]');
  var impactEmail = root.querySelector('[data-impact-email]');

  function money(cents) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(cents / 100);
  }

  function setHidden(element, hidden) {
    if (element) element.hidden = hidden;
  }

  function render() {
    var donationCents = viewState.enabled ? viewState.amountCents : 0;
    summary.classList.toggle('is-off', !viewState.enabled);
    toggle.classList.toggle('is-on', viewState.enabled);
    toggle.setAttribute('aria-pressed', String(viewState.enabled));
    pill.textContent = money(donationCents);
    donationEls.forEach(function (element) { element.textContent = money(donationCents); });
    total.textContent = money(subtotalCents + donationCents);
    setHidden(line, !viewState.enabled);
    note.textContent = viewState.enabled
      ? 'Casa Fina cobra el total. Vueltito registra el aporte y la obligación de remesa.'
      : 'Sin aporte. La compra continúa normalmente.';

    amountButtons.forEach(function (button) {
      button.disabled = !viewState.enabled;
      var amountCents = Number(button.getAttribute('data-demo-amount')) * 100;
      button.classList.toggle(
        'is-active',
        viewState.enabled && !viewState.custom && amountCents === viewState.amountCents
      );
    });
    otherButton.classList.toggle('is-active', viewState.enabled && viewState.custom);
    otherButton.disabled = !viewState.enabled;
    leaderboard.disabled = !viewState.enabled;
    if (!viewState.enabled) {
      leaderboard.checked = false;
      setHidden(identity, true);
    }
    impactEmail.disabled = !viewState.enabled;
  }

  toggle.addEventListener('click', function () {
    viewState.enabled = !viewState.enabled;
    setHidden(payStatus, true);
    render();
  });

  amountButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      viewState.enabled = true;
      viewState.custom = false;
      viewState.amountCents = Number(button.getAttribute('data-demo-amount')) * 100;
      setHidden(customForm, true);
      setHidden(customError, true);
      render();
    });
  });

  otherButton.addEventListener('click', function () {
    viewState.enabled = true;
    viewState.custom = true;
    setHidden(customForm, false);
    setHidden(customError, true);
    render();
    window.setTimeout(function () { customInput.focus(); }, 30);
  });

  customForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var amount = Number(customInput.value.replace(/[^0-9]/g, ''));
    if (!amount || amount <= 0) {
      setHidden(customError, false);
      customInput.focus();
      return;
    }
    viewState.enabled = true;
    viewState.custom = true;
    viewState.amountCents = amount * 100;
    setHidden(customError, true);
    render();
  });

  leaderboard.addEventListener('change', function () {
    setHidden(identity, !leaderboard.checked);
    if (leaderboard.checked) alias.focus();
  });

  pay.addEventListener('click', function () {
    if (!viewState.enabled) {
      payStatus.textContent = 'Compra completada sin aporte.';
      setHidden(payStatus, false);
      return;
    }

    if (impactEmail.value.trim() && !impactEmail.checkValidity()) {
      impactEmail.reportValidity();
      return;
    }

    var state = cycle.activateDonation(cycle.createDemoState(), viewState.amountCents, {
      leaderboardOptIn: leaderboard.checked,
      publicAlias: alias.value.trim(),
      impactUpdatesOptIn: Boolean(impactEmail.value.trim()),
      impactUpdatesEmail: impactEmail.value.trim()
    });
    state = cycle.registerOrder(state);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    pay.textContent = 'Orden registrada';
    pay.disabled = true;
    payStatus.textContent = 'Aporte registrado. Abriendo el panel del comercio…';
    setHidden(payStatus, false);
    window.setTimeout(function () {
      window.location.href = 'demo-operations.html?role=merchant';
    }, 450);
  });

  window.localStorage.removeItem(STORAGE_KEY);
  render();
})();
