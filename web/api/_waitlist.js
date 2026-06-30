const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeText(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function validateNgoWaitlistPayload(payload) {
  const data = payload && typeof payload === 'object' ? payload : {};
  const honeypot = normalizeText(data.website, 200);

  if (honeypot) {
    return { ok: false, status: 202, bot: true };
  }

  const organizationName = normalizeText(data.ong || data.organizationName, 120);
  const contactName = normalizeText(data.contactName || data.name || data.responsibleName, 120);
  const email = normalizeText(data.email, 160).toLowerCase();
  const area = normalizeText(data.area, 80);
  const message = normalizeText(data.msg || data.message, 1000);
  const source = normalizeText(data.source, 80) || 'landing_ong';
  const pagePath = normalizeText(data.pagePath, 240);
  const fields = {};

  if (!organizationName) fields.ong = 'required';
  if (!contactName) fields.contactName = 'required';
  if (!email) fields.email = 'required';
  else if (!EMAIL_PATTERN.test(email)) fields.email = 'invalid';

  if (Object.keys(fields).length > 0) {
    return {
      ok: false,
      status: 400,
      error: 'invalid_waitlist_request',
      fields
    };
  }

  return {
    ok: true,
    value: {
      type: 'ngo',
      organizationName,
      contactName,
      email,
      area: area || null,
      message: message || null,
      source,
      pagePath: pagePath || null
    }
  };
}

async function createNgoWaitlistLead(payload, requestMeta, deps) {
  const validation = validateNgoWaitlistPayload(payload);

  if (!validation.ok) {
    if (validation.bot) return { status: 202, body: { ok: true } };
    return {
      status: validation.status,
      body: {
        ok: false,
        error: validation.error,
        fields: validation.fields
      }
    };
  }

  if (!deps || typeof deps.saveLead !== 'function') {
    throw new Error('saveLead dependency is required');
  }

  const meta = requestMeta || {};
  const lead = {
    ...validation.value,
    ipAddress: normalizeText(meta.ipAddress, 80) || null,
    userAgent: normalizeText(meta.userAgent, 500) || null,
    referrer: normalizeText(meta.referrer, 500) || null
  };

  const saved = await deps.saveLead(lead);

  if (typeof deps.notifyLead === 'function') {
    try {
      await deps.notifyLead(saved);
    } catch (error) {
      if (typeof deps.onNotifyError === 'function') deps.onNotifyError(error);
    }
  }

  if (typeof deps.forwardLead === 'function') {
    try {
      await deps.forwardLead(toPlatformNgoApplication(saved));
    } catch (error) {
      if (typeof deps.onForwardError === 'function') deps.onForwardError(error, saved);
    }
  }

  return {
    status: 201,
    body: {
      ok: true,
      lead: {
        id: saved.id,
        createdAt: saved.createdAt
      }
    }
  };
}

function toPlatformNgoApplication(lead) {
  const application = {
    publicName: lead.organizationName,
    contactName: lead.contactName || lead.organizationName,
    contactEmail: lead.email,
    source: 'landing-waitlist'
  };

  if (lead.area) application.cause = lead.area;
  if (lead.message) application.message = lead.message;

  return application;
}

function requestMetaFromNodeRequest(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const ipAddress = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : String(forwardedFor || req.socket?.remoteAddress || '').split(',')[0];

  return {
    ipAddress,
    userAgent: req.headers['user-agent'] || '',
    referrer: req.headers.referer || req.headers.referrer || ''
  };
}

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

module.exports = {
  createNgoWaitlistLead,
  requestMetaFromNodeRequest,
  sendJson,
  toPlatformNgoApplication,
  validateNgoWaitlistPayload
};
