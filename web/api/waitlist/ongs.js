const { saveWaitlistLead } = require('../_db');
const { notifyWaitlistLead } = require('../_notify');
const {
  createNgoWaitlistLead,
  requestMetaFromNodeRequest,
  sendJson
} = require('../_waitlist');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.WAITLIST_ALLOWED_ORIGIN || '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
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

  try {
    const payload = await readJsonBody(req);
    const result = await createNgoWaitlistLead(
      payload,
      requestMetaFromNodeRequest(req),
      {
        saveLead: saveWaitlistLead,
        notifyLead: notifyWaitlistLead,
        onNotifyError: (error) => console.error('waitlist notification failed', error)
      }
    );

    sendJson(res, result.status, result.body);
  } catch (error) {
    if (error.code === 'missing_database_url') {
      sendJson(res, 503, { ok: false, error: 'waitlist_not_configured' });
      return;
    }

    console.error('waitlist request failed', error);
    sendJson(res, 500, { ok: false, error: 'waitlist_unavailable' });
  }
};