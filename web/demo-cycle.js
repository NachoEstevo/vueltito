(function exposeDemoCycle(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.VueltitoDemoCycle = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createDemoCycleApi() {
  const FUND_STATUS = Object.freeze({
    NOT_REGISTERED: 'not_registered',
    REGISTERED: 'registered',
    PENDING_REMITTANCE: 'pending_remittance',
    REMITTED: 'remitted_by_merchant',
    CONFIRMED: 'confirmed_by_ngo'
  });

  const EVENT_TIMES = Object.freeze({
    donation_opted_in: '2026-07-12T14:30:00.000Z',
    order_registered: '2026-07-12T14:32:00.000Z',
    remittance_due: '2026-07-12T14:32:00.000Z',
    remittance_submitted: '2026-07-15T16:10:00.000Z',
    ngo_confirmed: '2026-07-16T11:20:00.000Z'
  });

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createDemoState() {
    return {
      version: 2,
      isDemo: true,
      generatedAt: '2026-07-12T14:30:00.000Z',
      merchant: {
        id: 'merchant_demo_casa_fina',
        name: 'Casa Fina',
        platform: 'WooCommerce',
        primaryCause: {
          id: 'ngo_demo_banco_alimentos',
          name: 'Banco de Alimentos',
          changeableAtCheckout: false
        }
      },
      order: {
        id: 'CF-2847',
        purchaseAmountCents: 5725000,
        donationAmountCents: 0,
        currency: 'ARS',
        registeredAt: null
      },
      contribution: {
        optedIn: false,
        leaderboardOptIn: false,
        publicAlias: null,
        impactUpdatesOptIn: false,
        impactUpdatesEmail: null,
        fundStatus: FUND_STATUS.NOT_REGISTERED,
        dueAt: '2026-08-11T23:59:59.000Z',
        remittance: null,
        confirmation: null
      },
      timeline: [],
      exceptions: [
        { id: 'demo-overdue-01', type: 'overdue_remittance', label: 'Remesa vencida', status: 'open' },
        { id: 'demo-refund-01', type: 'refund', label: 'Refund aplicado', status: 'reversed' },
        { id: 'demo-webhook-01', type: 'failed_webhook', label: 'Webhook fallido', status: 'retrying' },
        { id: 'demo-entity-01', type: 'incomplete_entity', label: 'Entidad incompleta', status: 'open' }
      ]
    };
  }

  function appendEvent(state, type, details) {
    const next = clone(state);
    next.timeline.push({
      id: `event_demo_${next.timeline.length + 1}`,
      type,
      occurredAt: EVENT_TIMES[type],
      details: details || null
    });
    return next;
  }

  function activateDonation(state, amountCents, options) {
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      throw new Error('positive_amount_required');
    }
    if (state.contribution.fundStatus !== FUND_STATUS.NOT_REGISTERED) {
      throw new Error('unregistered_order_required');
    }

    const next = appendEvent(state, 'donation_opted_in', { amountCents });
    next.contribution.optedIn = true;
    next.contribution.leaderboardOptIn = Boolean(options && options.leaderboardOptIn);
    next.contribution.publicAlias = next.contribution.leaderboardOptIn
      ? String(options.publicAlias || 'Alias')
      : null;
    next.contribution.impactUpdatesEmail = String(options && options.impactUpdatesEmail || '').trim() || null;
    next.contribution.impactUpdatesOptIn = Boolean(next.contribution.impactUpdatesEmail);
    next.order.donationAmountCents = amountCents;
    return next;
  }

  function registerOrder(state) {
    if (!state.contribution.optedIn) throw new Error('opt_in_required');
    if (state.contribution.fundStatus !== FUND_STATUS.NOT_REGISTERED) {
      throw new Error('unregistered_order_required');
    }

    const next = appendEvent(state, 'order_registered', { orderId: state.order.id });
    next.order.registeredAt = EVENT_TIMES.order_registered;
    next.contribution.fundStatus = FUND_STATUS.REGISTERED;
    return next;
  }

  function markPendingRemittance(state) {
    if (state.contribution.fundStatus !== FUND_STATUS.REGISTERED) {
      throw new Error('registered_order_required');
    }

    const next = appendEvent(state, 'remittance_due', { dueAt: state.contribution.dueAt });
    next.contribution.fundStatus = FUND_STATUS.PENDING_REMITTANCE;
    return next;
  }

  function submitRemittance(state, evidence) {
    if (state.contribution.fundStatus !== FUND_STATUS.PENDING_REMITTANCE) {
      throw new Error('pending_remittance_required');
    }
    if (!evidence || !evidence.fileName) {
      throw new Error('receipt_evidence_required');
    }

    const next = appendEvent(state, 'remittance_submitted', {
      fileName: evidence.fileName
    });
    next.contribution.fundStatus = FUND_STATUS.REMITTED;
    next.contribution.remittance = {
      fileName: String(evidence.fileName),
      submittedAt: EVENT_TIMES.remittance_submitted
    };
    return next;
  }

  function confirmReceipt(state, confirmation) {
    if (state.contribution.fundStatus !== FUND_STATUS.REMITTED) {
      throw new Error('remitted_funds_required');
    }
    if (!confirmation || !confirmation.confirmedBy) {
      throw new Error('ngo_confirmation_required');
    }

    const next = appendEvent(state, 'ngo_confirmed', {
      confirmedBy: confirmation.confirmedBy
    });
    next.contribution.fundStatus = FUND_STATUS.CONFIRMED;
    next.contribution.confirmation = {
      confirmedBy: String(confirmation.confirmedBy),
      confirmedAt: EVENT_TIMES.ngo_confirmed
    };
    return next;
  }

  function impactPackText(state) {
    if (state.contribution.fundStatus !== FUND_STATUS.CONFIRMED) {
      throw new Error('confirmed_funds_required');
    }

    const amount = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: state.order.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(state.order.donationAmountCents / 100);
    const confirmedAt = new Intl.DateTimeFormat('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC'
    }).format(new Date(state.contribution.confirmation.confirmedAt));

    return [
      'VUELTITO · RESUMEN DE IMPACTO CONFIRMADO',
      `Comercio: ${state.merchant.name}`,
      `ONG: ${state.merchant.primaryCause.name}`,
      `Orden: ${state.order.id}`,
      `Impacto confirmado: ${amount}`,
      `Confirmado por ONG: ${confirmedAt}`
    ].join('\n');
  }

  function dashboardMetrics(state) {
    const status = state.contribution.fundStatus;
    const amount = state.order.donationAmountCents;
    const isRegistered = status !== FUND_STATUS.NOT_REGISTERED;
    const isRemitted = status === FUND_STATUS.REMITTED || status === FUND_STATUS.CONFIRMED;
    const isConfirmed = status === FUND_STATUS.CONFIRMED;

    return {
      registeredAmountCents: isRegistered ? amount : 0,
      pendingRemittanceCents: status === FUND_STATUS.PENDING_REMITTANCE ? amount : 0,
      expectedByNgoCents: isRegistered && !isConfirmed ? amount : 0,
      remittedAmountCents: isRemitted ? amount : 0,
      confirmedImpactCents: isConfirmed ? amount : 0,
      impactPackAvailable: isConfirmed,
      badgesAvailable: isConfirmed,
      adminExceptions: {
        overdueRemittances: state.exceptions.filter((item) => item.type === 'overdue_remittance').length,
        refunds: state.exceptions.filter((item) => item.type === 'refund').length,
        failedWebhooks: state.exceptions.filter((item) => item.type === 'failed_webhook').length,
        incompleteEntities: state.exceptions.filter((item) => item.type === 'incomplete_entity').length
      }
    };
  }

  return Object.freeze({
    FUND_STATUS,
    activateDonation,
    confirmReceipt,
    createDemoState,
    dashboardMetrics,
    impactPackText,
    markPendingRemittance,
    registerOrder,
    submitRemittance
  });
});
