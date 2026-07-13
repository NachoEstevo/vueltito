(function hydrateOperationsDemo() {
  var root = document.querySelector('[data-cycle-operations]');
  var cycle = window.VueltitoDemoCycle;
  if (!root || !cycle) return;

  var STORAGE_KEY = 'vueltito_demo_cycle_v1';
  var STATUS = cycle.FUND_STATUS;
  var statusOrder = [STATUS.REGISTERED, STATUS.PENDING_REMITTANCE, STATUS.REMITTED, STATUS.CONFIRMED];
  var statusCopy = {};
  statusCopy[STATUS.NOT_REGISTERED] = 'Sin aporte';
  statusCopy[STATUS.REGISTERED] = 'Registrado';
  statusCopy[STATUS.PENDING_REMITTANCE] = 'Pendiente de remesa';
  statusCopy[STATUS.REMITTED] = 'Remitido por comercio';
  statusCopy[STATUS.CONFIRMED] = 'Confirmado por ONG';

  var role = new URLSearchParams(window.location.search).get('role');
  if (!['merchant', 'ngo', 'admin'].includes(role)) role = 'merchant';
  var state = loadState();

  function seedRegisteredState() {
    return cycle.registerOrder(cycle.activateDonation(cycle.createDemoState(), 20000));
  }

  function loadState() {
    try {
      var saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      return saved && saved.version === 2 ? saved : seedRegisteredState();
    } catch (_error) {
      return seedRegisteredState();
    }
  }

  function saveState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function money(cents) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', minimumFractionDigits: 2, maximumFractionDigits: 2
    }).format(cents / 100);
  }
  function date(value) {
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'
    }).format(new Date(value)).replace('.', '');
  }

  function metric(label, value, detail) {
    var item = document.createElement('div');
    item.className = 'cycle-metric';
    var labelEl = document.createElement('span');
    var valueEl = document.createElement('strong');
    var detailEl = document.createElement('small');
    labelEl.textContent = label;
    valueEl.textContent = value;
    detailEl.textContent = detail;
    item.append(labelEl, valueEl, detailEl);
    return item;
  }

  function metricsForRole(metrics) {
    if (role === 'ngo') return [
      ['Esperado', money(metrics.expectedByNgoCents), 'Aún no confirmado'],
      ['Remitido', money(metrics.remittedAmountCents), 'Con comprobante'],
      ['Confirmado', money(metrics.confirmedImpactCents), 'Impacto publicable'],
      ['Datos institucionales', 'Completos', 'Cuenta validada']
    ];
    if (role === 'admin') return [
      ['Remesas vencidas', String(metrics.adminExceptions.overdueRemittances), 'Requiere seguimiento'],
      ['Refunds', String(metrics.adminExceptions.refunds), 'Reversa registrada'],
      ['Webhooks fallidos', String(metrics.adminExceptions.failedWebhooks), 'En reintento'],
      ['Entidades incompletas', String(metrics.adminExceptions.incompleteEntities), 'Requiere revisión']
    ];
    return [
      ['Aportes registrados', money(metrics.registeredAmountCents), 'No es impacto confirmado'],
      ['Pendiente de remesa', money(metrics.pendingRemittanceCents), 'Vence ' + date(state.contribution.dueAt)],
      ['Remitido', money(metrics.remittedAmountCents), 'Comprobante asociado'],
      ['Impacto confirmado', money(metrics.confirmedImpactCents), 'Confirmado por ONG']
    ];
  }

  function appendDataRow(list, label, value, detail) {
    var row = document.createElement('div');
    row.className = 'cycle-data-row';
    var term = document.createElement('dt');
    var description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value;
    if (detail) {
      var small = document.createElement('small');
      small.textContent = detail;
      description.appendChild(small);
    }
    row.append(term, description);
    list.appendChild(row);
  }

  function renderRoleContent(metrics) {
    var kicker = root.querySelector('[data-role-kicker]');
    var title = root.querySelector('[data-role-title]');
    var content = root.querySelector('[data-role-content]');
    content.replaceChildren();

    if (role === 'admin') {
      kicker.textContent = 'Admin';
      title.textContent = 'Excepciones operativas';
      var exceptions = document.createElement('div');
      exceptions.className = 'cycle-exceptions';
      state.exceptions.forEach(function (exception) {
        var item = document.createElement('div');
        item.className = 'cycle-exception';
        var label = document.createElement('span');
        var status = document.createElement('b');
        label.textContent = exception.label;
        var exceptionStatus = { open: 'Revisar', reversed: 'Revertido', retrying: 'Reintentando' };
        status.textContent = exceptionStatus[exception.status] || exception.status;
        item.append(label, status);
        exceptions.appendChild(item);
      });
      content.appendChild(exceptions);
      return;
    }

    var list = document.createElement('dl');
    list.className = 'cycle-data-list';
    if (role === 'ngo') {
      kicker.textContent = 'ONG';
      title.textContent = 'Esperado por comercio';
      appendDataRow(list, state.merchant.name, money(metrics.expectedByNgoCents), 'Orden ' + state.order.id + ' · vence ' + date(state.contribution.dueAt));
      appendDataRow(list, 'Estado', statusCopy[state.contribution.fundStatus], state.merchant.platform);
      appendDataRow(list, 'Comprobante', state.contribution.remittance ? state.contribution.remittance.fileName : 'Todavía no recibido', state.contribution.remittance ? 'Adjuntado por ' + state.merchant.name : 'Lo adjunta el comercio al informar la remesa');
      appendDataRow(list, 'Datos institucionales', 'Completos', 'Sin promesa de recibo fiscal');
    } else {
      kicker.textContent = 'Comercio';
      title.textContent = 'Obligación de remesa';
      appendDataRow(list, 'Causa principal', state.merchant.primaryCause.name, 'Fija para este piloto');
      appendDataRow(list, 'Orden', state.order.id, 'Aporte opt-in visible');
      appendDataRow(list, 'Vencimiento', date(state.contribution.dueAt), '30 días corridos para remitir el 100% a la ONG');
      appendDataRow(list, 'Comprobante', state.contribution.remittance ? state.contribution.remittance.fileName : 'Pendiente');
    }
    content.appendChild(list);

    var lock = document.createElement('div');
    lock.className = 'cycle-lock' + (metrics.impactPackAvailable ? ' is-open' : '');
    lock.textContent = metrics.impactPackAvailable
      ? 'Resumen de impacto disponible: reúne comercio, ONG, orden, monto y fecha confirmados para comunicar el resultado.'
      : 'El resumen de impacto se habilita cuando la ONG confirma la recepción.';
    content.appendChild(lock);
  }

  function setAction(title, description, html) {
    root.querySelector('[data-action-title]').textContent = title;
    root.querySelector('[data-action-description]').textContent = description;
    root.querySelector('[data-action-control]').innerHTML = html;
  }

  function renderAction(metrics) {
    var status = state.contribution.fundStatus;
    if (status === STATUS.REGISTERED) {
      if (role === 'merchant') setAction('Crear obligación', 'Al activarla comienza el plazo de 30 días corridos.', '<button class="cycle-primary" data-action="mark-pending">Marcar pendiente de remesa</button>');
      else setAction('Esperando al comercio', 'El comercio debe abrir la obligación de remesa.', '<button class="cycle-secondary" data-switch-role="merchant">Ver como comercio</button>');
    } else if (status === STATUS.PENDING_REMITTANCE) {
      if (role === 'merchant') setAction('Informar remesa', 'Adjuntá el comprobante antes del ' + date(state.contribution.dueAt) + '.', '<form class="cycle-form" data-remittance-form><label class="cycle-upload-zone" for="remittance-file" data-upload-zone><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4"/></svg><strong>Arrastrá el comprobante acá</strong><span>o hacé clic para elegirlo</span><small>PDF, PNG o JPG</small><input id="remittance-file" type="file" accept="application/pdf,image/png,image/jpeg" required /></label><p class="cycle-upload-name" data-upload-name>Ningún archivo seleccionado</p><button class="cycle-primary" type="submit">Registrar remesa</button></form>');
      else setAction('Remesa pendiente', 'El comercio todavía no informó una transferencia.', '<button class="cycle-secondary" data-switch-role="merchant">Ver como comercio</button>');
    } else if (status === STATUS.REMITTED) {
      if (role === 'ngo') setAction('Confirmar recepción', 'Verificá el monto y el comprobante antes de confirmar.', '<button class="cycle-primary" data-action="confirm">Confirmar recepción</button>');
      else setAction('Esperando a la ONG', 'El monto fue remitido; falta la confirmación independiente.', '<button class="cycle-secondary" data-switch-role="ngo">Ver como ONG</button>');
    } else {
      setAction('Ciclo completo', 'La ONG confirmó la recepción. El resumen usa únicamente datos confirmados.', '<button class="cycle-primary" data-action="download-impact"' + (metrics.impactPackAvailable ? '' : ' disabled') + '>Descargar resumen de impacto</button>');
    }
  }

  function renderTimeline() {
    var timeline = root.querySelector('[data-fund-timeline]');
    var currentIndex = statusOrder.indexOf(state.contribution.fundStatus);
    var steps = [
      ['Registrado', 'Orden y consentimiento guardados'],
      ['Pendiente de remesa', 'Obligación activa para el comercio'],
      ['Remitido', 'Comprobante informado'],
      ['Confirmado por ONG', 'Impacto publicable']
    ];
    timeline.replaceChildren();
    steps.forEach(function (step, index) {
      var item = document.createElement('li');
      item.className = 'cycle-step' + (index < currentIndex ? ' is-done' : index === currentIndex ? ' is-current' : '');
      var title = document.createElement('strong');
      var detail = document.createElement('span');
      title.textContent = step[0]; detail.textContent = step[1];
      item.append(title, detail); timeline.appendChild(item);
    });
  }

  function render() {
    var metrics = cycle.dashboardMetrics(state);
    root.querySelector('[data-current-status]').textContent = statusCopy[state.contribution.fundStatus];
    root.querySelector('[data-order-amount]').textContent = money(state.order.donationAmountCents);
    document.querySelectorAll('[data-role-tab]').forEach(function (tab) {
      var selected = tab.getAttribute('data-role-tab') === role;
      tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = 0;
    });
    var metricsRoot = root.querySelector('[data-role-metrics]');
    metricsRoot.replaceChildren();
    metricsForRole(metrics).forEach(function (item) { metricsRoot.appendChild(metric(item[0], item[1], item[2])); });
    renderRoleContent(metrics); renderAction(metrics); renderTimeline(); bindActions();
  }

  function switchRole(nextRole) {
    role = nextRole;
    window.history.replaceState(null, '', 'demo-operations.html?role=' + role);
    render();
  }

  function showFeedback(message) {
    var feedback = root.querySelector('[data-action-feedback]');
    feedback.textContent = message; feedback.hidden = false;
  }

  function bindActions() {
    root.querySelectorAll('[data-switch-role]').forEach(function (button) { button.addEventListener('click', function () { switchRole(button.getAttribute('data-switch-role')); }); });
    var pending = root.querySelector('[data-action="mark-pending"]');
    if (pending) pending.addEventListener('click', function () { state = cycle.markPendingRemittance(state); saveState(); render(); showFeedback('Obligación pendiente creada.'); });
    var form = root.querySelector('[data-remittance-form]');
    if (form) form.addEventListener('submit', function (event) {
      event.preventDefault();
      var file = form._selectedFile || form.querySelector('#remittance-file').files[0];
      if (!file) return;
      state = cycle.submitRemittance(state, { fileName: file.name });
      saveState(); render(); showFeedback('Remesa y comprobante registrados.');
    });
    if (form) {
      var input = form.querySelector('#remittance-file');
      var zone = form.querySelector('[data-upload-zone]');
      var fileName = form.querySelector('[data-upload-name]');
      function selectFile(file) {
        if (!file) return;
        form._selectedFile = file;
        fileName.textContent = file.name;
        zone.classList.add('has-file');
      }
      input.addEventListener('change', function () { selectFile(input.files[0]); });
      zone.addEventListener('dragover', function (event) { event.preventDefault(); zone.classList.add('is-dragging'); });
      zone.addEventListener('dragleave', function () { zone.classList.remove('is-dragging'); });
      zone.addEventListener('drop', function (event) { event.preventDefault(); zone.classList.remove('is-dragging'); selectFile(event.dataTransfer.files[0]); });
    }
    var confirm = root.querySelector('[data-action="confirm"]');
    if (confirm) confirm.addEventListener('click', function () { state = cycle.confirmReceipt(state, { confirmedBy: 'Equipo ONG' }); saveState(); render(); showFeedback('Recepción confirmada por la ONG.'); });
    var download = root.querySelector('[data-action="download-impact"]');
    if (download) download.addEventListener('click', downloadImpactPack);
  }

  function downloadImpactPack() {
    var content = cycle.impactPackText(state);
    var url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }));
    var link = document.createElement('a'); link.href = url; link.download = 'resumen-impacto-casa-fina.txt'; link.click(); URL.revokeObjectURL(url);
    showFeedback('Resumen de impacto generado.');
  }

  document.querySelectorAll('[data-role-tab]').forEach(function (tab) { tab.addEventListener('click', function () { switchRole(tab.getAttribute('data-role-tab')); }); });
  saveState(); render();
})();
