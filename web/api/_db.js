const { Pool } = require('pg');

let pool;
let ensurePromise;

function getPool() {
  if (!process.env.DATABASE_URL) {
    const error = new Error('DATABASE_URL is required');
    error.code = 'missing_database_url';
    throw error;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 3
    });
  }

  return pool;
}

async function ensureWaitlistTable() {
  if (!ensurePromise) {
    ensurePromise = getPool().query(`
      CREATE TABLE IF NOT EXISTS waitlist_leads (
        id BIGSERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        organization_name TEXT NOT NULL,
        email TEXT NOT NULL,
        area TEXT,
        message TEXT,
        source TEXT NOT NULL DEFAULT 'landing_ong',
        page_path TEXT,
        ip_address TEXT,
        user_agent TEXT,
        referrer TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      CREATE INDEX IF NOT EXISTS waitlist_leads_type_created_idx
        ON waitlist_leads (type, created_at DESC);

      CREATE INDEX IF NOT EXISTS waitlist_leads_status_created_idx
        ON waitlist_leads (status, created_at DESC);
    `);
  }

  await ensurePromise;
}

function mapLeadRow(row) {
  return {
    id: Number(row.id),
    type: row.type,
    organizationName: row.organization_name,
    email: row.email,
    area: row.area,
    message: row.message,
    source: row.source,
    pagePath: row.page_path,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    referrer: row.referrer,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  };
}

async function saveWaitlistLead(lead) {
  await ensureWaitlistTable();

  const result = await getPool().query(
    `INSERT INTO waitlist_leads (
      type,
      organization_name,
      email,
      area,
      message,
      source,
      page_path,
      ip_address,
      user_agent,
      referrer
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *`,
    [
      lead.type,
      lead.organizationName,
      lead.email,
      lead.area,
      lead.message,
      lead.source,
      lead.pagePath,
      lead.ipAddress,
      lead.userAgent,
      lead.referrer
    ]
  );

  return mapLeadRow(result.rows[0]);
}

async function listWaitlistLeads(options) {
  await ensureWaitlistTable();

  const opts = options || {};
  const limit = Math.max(1, Math.min(Number(opts.limit) || 100, 200));
  const type = opts.type || 'ngo';

  const result = await getPool().query(
    `SELECT *
     FROM waitlist_leads
     WHERE type = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [type, limit]
  );

  return result.rows.map(mapLeadRow);
}

module.exports = {
  listWaitlistLeads,
  saveWaitlistLead
};