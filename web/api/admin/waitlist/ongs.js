const { listWaitlistLeads } = require('../../_db');
const { sendJson } = require('../../_waitlist');

function bearerToken(req) {
  const value = req.headers.authorization || '';
  return value.startsWith('Bearer ') ? value.slice(7).trim() : '';
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization');
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
    return;
  }

  const expectedToken = process.env.ADMIN_WAITLIST_TOKEN;
  if (!expectedToken) {
    sendJson(res, 503, { ok: false, error: 'admin_waitlist_not_configured' });
    return;
  }

  if (bearerToken(req) !== expectedToken) {
    sendJson(res, 401, { ok: false, error: 'unauthorized' });
    return;
  }

  try {
    const rows = await listWaitlistLeads({
      type: 'ngo',
      limit: req.query && req.query.limit
    });

    sendJson(res, 200, { ok: true, rows });
  } catch (error) {
    if (error.code === 'missing_database_url') {
      sendJson(res, 503, { ok: false, error: 'waitlist_not_configured' });
      return;
    }

    console.error('admin waitlist request failed', error);
    sendJson(res, 500, { ok: false, error: 'waitlist_unavailable' });
  }
};