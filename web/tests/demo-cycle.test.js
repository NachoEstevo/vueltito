const test = require('node:test');
const assert = require('node:assert/strict');

const {
  FUND_STATUS,
  activateDonation,
  confirmReceipt,
  createDemoState,
  dashboardMetrics,
  impactPackText,
  markPendingRemittance,
  registerOrder,
  submitRemittance
} = require('../demo-cycle');

test('starts as an explicit opt-in with one fixed cause', () => {
  const state = createDemoState();

  assert.equal(state.isDemo, true);
  assert.equal(state.contribution.optedIn, false);
  assert.equal(state.contribution.fundStatus, FUND_STATUS.NOT_REGISTERED);
  assert.equal(state.merchant.primaryCause.name, 'Banco de Alimentos');
  assert.equal(state.merchant.primaryCause.changeableAtCheckout, false);
  assert.equal(state.contribution.dueAt, '2026-08-11T23:59:59.000Z');
});

test('registers the order only after the buyer opts in', () => {
  const initial = createDemoState();

  assert.throws(() => registerOrder(initial), /opt_in_required/);

  const registered = registerOrder(activateDonation(initial, 20000));
  assert.equal(registered.contribution.fundStatus, FUND_STATUS.REGISTERED);
  assert.equal(registered.order.donationAmountCents, 20000);
  assert.deepEqual(
    registered.timeline.map((event) => event.type),
    ['donation_opted_in', 'order_registered']
  );
});
test('enables impact updates only when an optional email is provided', () => {
  const active = activateDonation(createDemoState(), 20000, {
    leaderboardOptIn: false,
    impactUpdatesEmail: ' comprador@ejemplo.com '
  });
  assert.equal(active.contribution.publicAlias, null);
  assert.equal(active.contribution.impactUpdatesOptIn, true);
  assert.equal(active.contribution.impactUpdatesEmail, 'comprador@ejemplo.com');
  const withoutEmail = activateDonation(createDemoState(), 20000);
  assert.equal(withoutEmail.contribution.impactUpdatesOptIn, false);
  assert.equal(withoutEmail.contribution.impactUpdatesEmail, null);
});

test('enforces the canonical fund-state sequence', () => {
  const registered = registerOrder(activateDonation(createDemoState(), 20000));

  assert.throws(
    () => submitRemittance(registered, { fileName: 'comprobante.pdf' }),
    /pending_remittance_required/
  );

  const pending = markPendingRemittance(registered);
  assert.equal(pending.contribution.fundStatus, FUND_STATUS.PENDING_REMITTANCE);

  const remitted = submitRemittance(pending, { fileName: 'comprobante.pdf' });
  assert.equal(remitted.contribution.fundStatus, FUND_STATUS.REMITTED);

  const confirmed = confirmReceipt(remitted, { confirmedBy: 'Equipo ONG' });
  assert.equal(confirmed.contribution.fundStatus, FUND_STATUS.CONFIRMED);
  assert.deepEqual(
    confirmed.timeline.map((event) => event.type),
    ['donation_opted_in', 'order_registered', 'remittance_due', 'remittance_submitted', 'ngo_confirmed']
  );
});

test('requires receipt evidence before marking funds as remitted', () => {
  const pending = markPendingRemittance(
    registerOrder(activateDonation(createDemoState(), 20000))
  );

  assert.throws(() => submitRemittance(pending, {}), /receipt_evidence_required/);
});

test('withholds impact and badges until the NGO confirms receipt', () => {
  const registered = registerOrder(activateDonation(createDemoState(), 20000));
  const beforeConfirmation = dashboardMetrics(registered);

  assert.equal(beforeConfirmation.registeredAmountCents, 20000);
  assert.equal(beforeConfirmation.confirmedImpactCents, 0);
  assert.equal(beforeConfirmation.impactPackAvailable, false);
  assert.equal(beforeConfirmation.badgesAvailable, false);

  const confirmed = confirmReceipt(
    submitRemittance(markPendingRemittance(registered), { fileName: 'comprobante.pdf' }),
    { confirmedBy: 'Equipo ONG' }
  );
  const afterConfirmation = dashboardMetrics(confirmed);

  assert.equal(afterConfirmation.confirmedImpactCents, 20000);
  assert.equal(afterConfirmation.impactPackAvailable, true);
  assert.equal(afterConfirmation.badgesAvailable, true);
});

test('derives admin exception counts from explicit synthetic records', () => {
  const metrics = dashboardMetrics(createDemoState());

  assert.deepEqual(metrics.adminExceptions, {
    overdueRemittances: 1,
    refunds: 1,
    failedWebhooks: 1,
    incompleteEntities: 1
  });
});

test('generates an impact summary only for confirmed funds', () => {
  assert.throws(() => impactPackText(createDemoState()), /confirmed_funds_required/);

  const registered = registerOrder(activateDonation(createDemoState(), 20000));
  const confirmed = confirmReceipt(
    submitRemittance(markPendingRemittance(registered), { fileName: 'comprobante.pdf' }),
    { confirmedBy: 'Equipo ONG' }
  );
  const text = impactPackText(confirmed);

  assert.match(text, /^VUELTITO · RESUMEN DE IMPACTO CONFIRMADO/);
  assert.match(text, /Orden: CF-2847/);
  assert.match(text, /Impacto confirmado:.*200,00/);
});
