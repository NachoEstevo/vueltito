function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function leadText(lead) {
  return [
    'Nueva ONG en waitlist de vueltito',
    '',
    `ONG: ${lead.organizationName}`,
    `Contacto: ${lead.contactName || 'Sin contacto'}`,
    `Email: ${lead.email}`,
    `Area: ${lead.area || 'Sin area'}`,
    `Mensaje: ${lead.message || 'Sin mensaje'}`,
    `Fuente: ${lead.source}`,
    `Fecha: ${lead.createdAt}`
  ].join('\n');
}

function leadHtml(lead) {
  return `
    <h2>Nueva ONG en waitlist de vueltito</h2>
    <p><strong>ONG:</strong> ${escapeHtml(lead.organizationName)}</p>
    <p><strong>Contacto:</strong> ${escapeHtml(lead.contactName || 'Sin contacto')}</p>
    <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
    <p><strong>Area:</strong> ${escapeHtml(lead.area || 'Sin area')}</p>
    <p><strong>Mensaje:</strong> ${escapeHtml(lead.message || 'Sin mensaje')}</p>
    <p><strong>Fuente:</strong> ${escapeHtml(lead.source)}</p>
    <p><strong>Fecha:</strong> ${escapeHtml(lead.createdAt)}</p>
  `;
}

async function postJson(url, headers, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`notification_failed_${response.status}`);
  }
}

async function notifyWaitlistLead(lead) {
  const errors = [];
  const webhookUrl = process.env.WAITLIST_WEBHOOK_URL;
  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.WAITLIST_TO_EMAIL;
  const fromEmail = process.env.WAITLIST_FROM_EMAIL;

  if (webhookUrl) {
    try {
      await postJson(webhookUrl, {}, { text: leadText(lead), lead });
    } catch (error) {
      errors.push(error);
    }
  }

  if (resendKey && toEmail && fromEmail) {
    try {
      await postJson(
        'https://api.resend.com/emails',
        { Authorization: `Bearer ${resendKey}` },
        {
          from: fromEmail,
          to: [toEmail],
          subject: `Nueva ONG en vueltito: ${lead.organizationName}`,
          text: leadText(lead),
          html: leadHtml(lead)
        }
      );
    } catch (error) {
      errors.push(error);
    }
  }

  if (errors.length > 0) {
    throw errors.length === 1 ? errors[0] : new AggregateError(errors, 'waitlist notification failed');
  }
}

module.exports = {
  notifyWaitlistLead
};
