const test = require('node:test');
const assert = require('node:assert/strict');
const { Readable } = require('node:stream');
const publicWaitlist = require('../waitlist/ongs');
const adminWaitlist = require('../admin/waitlist/ongs');

function response() {
  return {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(body) { this.body = JSON.parse(body); }
  };
}

test('rejects malformed JSON before storage', async () => {
  const res = response();
  await publicWaitlist({
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{"ong":'
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'invalid_json');
});

test('rejects oversized streamed requests before storage', async () => {
  const req = Readable.from([Buffer.alloc(10 * 1024), Buffer.alloc(10 * 1024)]);
  req.method = 'POST';
  req.headers = { 'content-type': 'application/json' };
  const res = response();
  await publicWaitlist(req, res);

  assert.equal(res.statusCode, 413);
  assert.equal(res.body.error, 'request_too_large');
});

test('rejects requests with other content types before storage', async () => {
  const res = response();
  await publicWaitlist({ method: 'POST', headers: { 'content-type': 'text/plain' } }, res);

  assert.equal(res.statusCode, 415);
  assert.equal(res.body.error, 'unsupported_media_type');
});

test('marks waitlist admin responses as private even when authentication fails', async (t) => {
  const previous = process.env.ADMIN_WAITLIST_TOKEN;
  process.env.ADMIN_WAITLIST_TOKEN = 'synthetic-test-value';
  t.after(() => {
    if (previous === undefined) delete process.env.ADMIN_WAITLIST_TOKEN;
    else process.env.ADMIN_WAITLIST_TOKEN = previous;
  });
  const res = response();
  await adminWaitlist({ method: 'GET', headers: {} }, res);

  assert.equal(res.statusCode, 401);
  assert.equal(res.headers['Cache-Control'], 'no-store');
});
