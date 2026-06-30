const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createNgoWaitlistLead,
  validateNgoWaitlistPayload
} = require('../_waitlist');

test('validates and normalizes an ONG waitlist request', () => {
  const result = validateNgoWaitlistPayload({
    ong: '  Fundacion Agua Clara  ',
    email: '  HOLA@TUONG.ORG ',
    area: 'Salud',
    msg: '  Acompanamos familias.  '
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.value, {
    type: 'ngo',
    organizationName: 'Fundacion Agua Clara',
    email: 'hola@tuong.org',
    area: 'Salud',
    message: 'Acompanamos familias.',
    source: 'landing_ong',
    pagePath: null
  });
});

test('rejects missing organization name and invalid email', () => {
  const result = validateNgoWaitlistPayload({
    ong: ' ',
    email: 'no-es-email'
  });

  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
  assert.deepEqual(result.fields, {
    ong: 'required',
    email: 'invalid'
  });
});

test('creates a lead with request metadata and notifies after saving', async () => {
  const calls = [];

  const result = await createNgoWaitlistLead(
    {
      ong: 'Comedor Los Pinos',
      email: 'contacto@lospinos.org',
      area: 'Alimentacion',
      msg: 'Merendero barrial.',
      pagePath: '/index.html'
    },
    {
      ipAddress: '203.0.113.10',
      userAgent: 'node-test',
      referrer: 'https://vueltito.org/'
    },
    {
      saveLead: async (lead) => {
        calls.push(['save', lead]);
        return { ...lead, id: 42, createdAt: '2026-06-22T22:00:00.000Z' };
      },
      notifyLead: async (lead) => {
        calls.push(['notify', lead.id]);
      }
    }
  );

  assert.equal(result.status, 201);
  assert.equal(result.body.ok, true);
  assert.deepEqual(result.body.lead, {
    id: 42,
    createdAt: '2026-06-22T22:00:00.000Z'
  });
  assert.equal(calls.length, 2);
  assert.equal(calls[0][0], 'save');
  assert.equal(calls[0][1].organizationName, 'Comedor Los Pinos');
  assert.equal(calls[0][1].ipAddress, '203.0.113.10');
  assert.equal(calls[0][1].userAgent, 'node-test');
  assert.equal(calls[0][1].referrer, 'https://vueltito.org/');
  assert.deepEqual(calls[1], ['notify', 42]);
});

test('silently accepts honeypot submissions without saving', async () => {
  let saved = false;

  const result = await createNgoWaitlistLead(
    {
      ong: 'Fundacion Real',
      email: 'hola@fundacion.org',
      website: 'https://spam.example'
    },
    {},
    {
      saveLead: async () => {
        saved = true;
      }
    }
  );

  assert.equal(result.status, 202);
  assert.deepEqual(result.body, { ok: true });
  assert.equal(saved, false);
});

test('does not fail the saved lead when notification fails', async () => {
  const result = await createNgoWaitlistLead(
    {
      ong: 'Fundacion Guardada',
      email: 'hola@guardada.org'
    },
    {},
    {
      saveLead: async (lead) => ({ ...lead, id: 7, createdAt: '2026-06-22T23:00:00.000Z' }),
      notifyLead: async () => {
        throw new Error('mail_down');
      }
    }
  );

  assert.equal(result.status, 201);
  assert.deepEqual(result.body.lead, {
    id: 7,
    createdAt: '2026-06-22T23:00:00.000Z'
  });
});

test('forwards the saved waitlist lead to platform applications', async () => {
  const forwarded = [];

  const result = await createNgoWaitlistLead(
    {
      ong: 'Fundacion Puente',
      email: 'hola@puente.org',
      area: 'Educacion',
      msg: 'Acompanamos escuelas rurales.'
    },
    {},
    {
      saveLead: async (lead) => ({ ...lead, id: 11, createdAt: '2026-06-30T12:00:00.000Z' }),
      forwardLead: async (lead) => {
        forwarded.push(lead);
      }
    }
  );

  assert.equal(result.status, 201);
  assert.equal(forwarded.length, 1);
  assert.deepEqual(forwarded[0], {
    publicName: 'Fundacion Puente',
    contactName: 'Fundacion Puente',
    contactEmail: 'hola@puente.org',
    cause: 'Educacion',
    message: 'Acompanamos escuelas rurales.',
    source: 'landing-waitlist'
  });
});

test('does not fail the saved lead when platform forwarding fails', async () => {
  let forwardError;

  const result = await createNgoWaitlistLead(
    {
      ong: 'Fundacion Resiliente',
      email: 'hola@resiliente.org'
    },
    {},
    {
      saveLead: async (lead) => ({ ...lead, id: 12, createdAt: '2026-06-30T12:30:00.000Z' }),
      forwardLead: async () => {
        throw new Error('platform_down');
      },
      onForwardError: (error) => {
        forwardError = error;
      }
    }
  );

  assert.equal(result.status, 201);
  assert.deepEqual(result.body.lead, {
    id: 12,
    createdAt: '2026-06-30T12:30:00.000Z'
  });
  assert.equal(forwardError.message, 'platform_down');
});
