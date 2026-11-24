const { saveWaitlistLead } = require('../_db');
const { notifyWaitlistLead } = require('../_notify');
const {
  createNgoWaitlistLead,
  sendJson
} = require('../_waitlist');

const MAX_BODY_BYTES = 16 * 1024;

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.WAITLIST_ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function readJsonBody(req) {
  const declaredBytes = Number(req.headers['content-length']);
  if (declaredBytes > MAX_BODY_BYTES) throw new RangeError('request_too_large');
  if (req.body !== undefined) {
    if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
      const raw = req.body.toString();
      if (Buffer.byteLength(raw) > MAX_BODY_BYTES) throw new RangeError('request_too_large');
      return JSON.parse(raw);
    }
    if (Buffer.byteLength(JSON.stringify(req.body)) > MAX_BODY_BYTES) {
      throw new RangeError('request_too_large');
    }
    return req.body;
  }

  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    size += bytes.length;
    if (size > MAX_BODY_BYTES) throw new RangeError('request_too_large');
    chunks.push(bytes);
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

async function forwardNgoApplication(application) {
  const platformBaseUrl = process.env.VUELTITO_PLATFORM_API_BASE_URL;
  if (!platformBaseUrl) return;

  const timeoutMs = Number(process.env.VUELTITO_PLATFORM_FORWARD_TIMEOUT_MS || 2500);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) ? timeoutMs : 2500);
  const headers = { 'Content-Type': 'application/json' };
  if (process.env.VUELTITO_PLATFORM_API_TOKEN) {
    headers.Authorization = `Bearer ${process.env.VUELTITO_PLATFORM_API_TOKEN}`;
  }

  let response;
  try {
    response = await fetch(new URL('/v1/public/ngo-applications', platformBaseUrl), {
      method: 'POST',
      headers,
      body: JSON.stringify(application),
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const error = new Error(`platform application forward failed with ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }
}

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    return;
  }

  const contentType = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  if (contentType !== 'application/json') {
    sendJson(res, 415, { ok: false, error: 'unsupported_media_type' });
    return;
  }

  let payload;
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    if (error instanceof RangeError) {
      sendJson(res, 413, { ok: false, error: 'request_too_large' });
    } else {
      sendJson(res, 400, { ok: false, error: 'invalid_json' });
    }
    return;
  }

  try {
    const result = await createNgoWaitlistLead(
      payload,
      {
        saveLead: saveWaitlistLead,
        notifyLead: notifyWaitlistLead,
        forwardLead: forwardNgoApplication,
        forwardTimeoutMs: Number(process.env.VUELTITO_PLATFORM_FORWARD_TIMEOUT_MS || 2500),
        onNotifyError: () => console.error('waitlist notification failed'),
        onForwardError: (error, lead) => console.error(
          'waitlist platform forward failed',
          {
            statusCode: error.statusCode,
            leadId: lead.id
          }
        )
      }
    );

    sendJson(res, result.status, result.body);
  } catch (error) {
    if (error.code === 'missing_database_url') {
      sendJson(res, 503, { ok: false, error: 'waitlist_not_configured' });
      return;
    }

    console.error('waitlist request failed');
    sendJson(res, 500, { ok: false, error: 'waitlist_unavailable' });
  }
};
