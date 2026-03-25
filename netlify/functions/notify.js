// netlify/functions/notify.js
// Viene chiamata da Netlify come webhook ad ogni nuova iscrizione.
// Invia:
//   - email di conferma all'iscritto / responsabile squadra
//   - email di notifica all'organizzatore

const ADMIN_EMAIL  = 'cosenzasubbuteo@protonmail.com';
const SENDER_NAME  = 'Cosenza Challenger150 2026';
const SENDER_EMAIL = 'onboarding@resend.dev'; // cambia con tuo dominio se lo verifichi

exports.handler = async function(event) {
  // Netlify invia il payload del form come JSON nel body
  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch(e) {
    return { statusCode: 400, body: 'Payload non valido' };
  }

  const formName = payload.form_name || '';
  const data     = payload.data      || {};

  const RESEND_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_KEY) {
    return { statusCode: 500, body: 'RESEND_API_KEY non configurata' };
  }

  // ── Scegli il template in base al tipo di form ──────────────
  let emails = [];

  if (formName === 'iscrizione-individuale') {
    emails = buildEmailsIndividuale(data, RESEND_KEY);
  } else if (formName === 'iscrizione-squadra') {
    //emails = buildEmailsSquadra(data, RESEND_KEY);
  } else {
    return { statusCode: 200, body: 'Form non gestito, nessuna email inviata' };
  }

  // ── Invia tutte le email ────────────────────────────────────
  const results = await Promise.allSettled(emails.map(sendEmail));
  const errors  = results.filter(r => r.status === 'rejected').map(r => r.reason);

  if (errors.length > 0) {
    console.error('Errori invio email:', errors);
    return { statusCode: 500, body: JSON.stringify({ errors }) };
  }

  return { statusCode: 200, body: 'Email inviate con successo' };
};

// ── INDIVIDUALE ─────────────────────────────────────────────────
function buildEmailsIndividuale(data, key) {
  const nomeCompleto = `${data.nome || ''} ${data.cognome || ''}`.trim();
  const categoria    = data.categoria || '—';
  const club         = data.club      || '—';
  const fistf        = data.fistf     || '—';
  const emailDest    = data.email     || '';

  const emails = [];

  // 1. Conferma all'iscritto
  if (emailDest) {
    emails.push({
      key,
      to:      emailDest,
      subject: `✅ Iscrizione confermata — ${SENDER_NAME}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#00194A;padding:2rem;text-align:center">
            <h1 style="color:#F5C518;font-size:1.8rem;margin:0;letter-spacing:2px">
              COSENZA CHALLENGER150 2026
            </h1>
            <p style="color:rgba(255,255,255,0.7);margin:0.5rem 0 0">
              Iscrizione Individuale
            </p>
          </div>

          <div style="padding:2rem;background:#ffffff;border:1px solid #DDE2EA">
            <p style="font-size:1rem;color:#0D1B2E">Ciao <strong>${nomeCompleto}</strong>,</p>
            <p style="color:#6B7A90;line-height:1.7">
              La tua iscrizione al <strong>Cosenza Challenger150 2026</strong> è stata ricevuta con successo.
            </p>

            <div style="background:#F2F4F8;padding:1.5rem;margin:1.5rem 0;border-left:4px solid #003087">
              <table style="width:100%;font-size:0.9rem;color:#0D1B2E;border-collapse:collapse">
                <tr><td style="padding:0.4rem 0;color:#6B7A90;width:40%">Giocatore</td><td><strong>${nomeCompleto}</strong></td></tr>
                <tr><td style="padding:0.4rem 0;color:#6B7A90">Categoria</td><td><strong>${categoria}</strong></td></tr>
                <tr><td style="padding:0.4rem 0;color:#6B7A90">Club</td><td>${club}</td></tr>
                <tr><td style="padding:0.4rem 0;color:#6B7A90">Codice FISTF</td><td style="font-family:monospace">${fistf}</td></tr>
              </table>
            </div>

            <div style="background:#C8102E;color:#fff;padding:1.25rem 1.5rem;margin:1.5rem 0">
              <p style="margin:0;font-weight:bold;font-size:0.95rem">
                ⚠️ Per completare l'iscrizione effettua il pagamento entro il 25 Marzo 2026
              </p>
            </div>

            <table style="width:100%;font-size:0.9rem;color:#0D1B2E;border-collapse:collapse;margin-bottom:1rem">
              <tr>
                <td style="padding:0.75rem;background:#F2F4F8;vertical-align:top;width:50%">
                  <strong>Bonifico Bancario</strong><br>
                  A.S.D. CCT Cosenza<br>
                  <span style="font-family:monospace;font-size:0.82rem">IT41R0103003411000001172018</span>
                </td>
                <td style="padding:0.75rem;background:#F2F4F8;vertical-align:top">
                  <strong>PayPal</strong><br>
                  xxxxx@libero.it
                </td>
              </tr>
            </table>

            <p style="color:#6B7A90;font-size:0.85rem;line-height:1.7">
              📅 <strong>Quando:</strong> 28 Marzo 2026 (individuali)<br>
              📍 <strong>Dove:</strong> Centro Polifunzionale di Soccavo, Viale Adriano, Napoli
            </p>
          </div>

          <div style="background:#050D1A;padding:1.5rem;text-align:center">
            <p style="color:rgba(255,255,255,0.4);font-size:0.8rem;margin:0">
              © 2026 ${SENDER_NAME} — Per informazioni: xxxxx@libero.it
            </p>
          </div>
        </div>
      `
    });
  }

  // 2. Notifica all'organizzatore
  emails.push({
    key,
    to:      ADMIN_EMAIL,
    subject: `🔔 Nuova iscrizione individuale — ${nomeCompleto} (${categoria})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px">
        <div style="background:#00194A;padding:1.5rem">
          <h2 style="color:#F5C518;margin:0">Nuova iscrizione individuale</h2>
          <p style="color:rgba(255,255,255,0.6);margin:0.3rem 0 0;font-size:0.85rem">
            ${new Date().toLocaleString('it-IT')}
          </p>
        </div>
        <div style="padding:1.5rem;background:#fff;border:1px solid #DDE2EA">
          <table style="width:100%;font-size:0.9rem;border-collapse:collapse">
            <tr><td style="padding:0.5rem 0;color:#6B7A90;width:40%">Giocatore</td><td><strong>${nomeCompleto}</strong></td></tr>
            <tr><td style="padding:0.5rem 0;color:#6B7A90">Email</td><td>${emailDest || '—'}</td></tr>
            <tr><td style="padding:0.5rem 0;color:#6B7A90">Categoria</td><td><strong>${categoria}</strong></td></tr>
            <tr><td style="padding:0.5rem 0;color:#6B7A90">Club</td><td>${club}</td></tr>
            <tr><td style="padding:0.5rem 0;color:#6B7A90">Codice FISTF</td><td style="font-family:monospace">${fistf}</td></tr>
          </table>
        </div>
      </div>
    `
  });

  return emails;
}

// ── SQUADRA ─────────────────────────────────────────────────────
function buildEmailsSquadra(data, key) {
  const respNome  = `${data.resp_nome || ''} ${data.resp_cognome || ''}`.trim();
  const respEmail = data.resp_email   || '';
  const club1     = data.club_1       || '—';
  const gioc1     = data.giocatori_1  || '—';
  const fistf     = data.resp_fistf   || '—';

  let extraHtml = '';
  try {
    const extra = JSON.parse(data.squadre_extra || '[]');
    extra.forEach((sq, i) => {
      extraHtml += `
        <tr>
          <td style="padding:0.4rem 0;color:#6B7A90;vertical-align:top">${i + 2}ª Squadra</td>
          <td><strong>${sq.club || '—'}</strong><br>
          <span style="font-size:0.82rem;color:#6B7A90;white-space:pre-line">${sq.giocatori || ''}</span></td>
        </tr>`;
    });
  } catch(e) {}

  const emails = [];

  // 1. Conferma al responsabile
  if (respEmail) {
    emails.push({
      key,
      to:      respEmail,
      subject: `✅ Iscrizione squadra confermata — ${SENDER_NAME}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#00194A;padding:2rem;text-align:center">
            <h1 style="color:#F5C518;font-size:1.8rem;margin:0;letter-spacing:2px">
              COSENZA CHALLENGER150 2026
            </h1>
            <p style="color:rgba(255,255,255,0.7);margin:0.5rem 0 0">
              Iscrizione Squadra
            </p>
          </div>

          <div style="padding:2rem;background:#ffffff;border:1px solid #DDE2EA">
            <p style="font-size:1rem;color:#0D1B2E">Ciao <strong>${respNome}</strong>,</p>
            <p style="color:#6B7A90;line-height:1.7">
              L'iscrizione squadra al <strong>Cosenza Challenger150 2026</strong> è stata ricevuta con successo.
            </p>

            <div style="background:#F2F4F8;padding:1.5rem;margin:1.5rem 0;border-left:4px solid #003087">
              <table style="width:100%;font-size:0.9rem;color:#0D1B2E;border-collapse:collapse">
                <tr><td style="padding:0.4rem 0;color:#6B7A90;width:40%;vertical-align:top">Responsabile</td><td><strong>${respNome}</strong></td></tr>
                <tr><td style="padding:0.4rem 0;color:#6B7A90;vertical-align:top">1ª Squadra</td>
                  <td><strong>${club1}</strong><br>
                  <span style="font-size:0.82rem;color:#6B7A90;white-space:pre-line">${gioc1}</span></td>
                </tr>
                ${extraHtml}
                <tr><td style="padding:0.4rem 0;color:#6B7A90">FISTF Resp.</td><td style="font-family:monospace">${fistf}</td></tr>
              </table>
            </div>

            <div style="background:#C8102E;color:#fff;padding:1.25rem 1.5rem;margin:1.5rem 0">
              <p style="margin:0;font-weight:bold;font-size:0.95rem">
                ⚠️ Per completare l'iscrizione effettua il pagamento entro il 25 Marzo 2026
              </p>
            </div>

            <table style="width:100%;font-size:0.9rem;color:#0D1B2E;border-collapse:collapse;margin-bottom:1rem">
              <tr>
                <td style="padding:0.75rem;background:#F2F4F8;vertical-align:top;width:50%">
                  <strong>Bonifico Bancario</strong><br>
                  A.S.D. CCT Cosenza<br>
                  <span style="font-family:monospace;font-size:0.82rem">IT41R0103003411000001172018</span>
                </td>
                <td style="padding:0.75rem;background:#F2F4F8;vertical-align:top">
                  <strong>PayPal</strong><br>
                  xxxxx@libero.it
                </td>
              </tr>
            </table>

            <p style="color:#6B7A90;font-size:0.85rem;line-height:1.7">
              📅 <strong>Quando:</strong> 29 Marzo 2026 (torneo a squadre)<br>
              📍 <strong>Dove:</strong> Centro Polifunzionale di Soccavo, Viale Adriano, Napoli
            </p>
          </div>

          <div style="background:#050D1A;padding:1.5rem;text-align:center">
            <p style="color:rgba(255,255,255,0.4);font-size:0.8rem;margin:0">
              © 2026 ${SENDER_NAME} — Per informazioni: xxxxx@libero.it
            </p>
          </div>
        </div>
      `
    });
  }

  // 2. Notifica all'organizzatore
  emails.push({
    key,
    to:      ADMIN_EMAIL,
    subject: `🔔 Nuova iscrizione squadra — ${club1} (resp. ${respNome})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px">
        <div style="background:#00194A;padding:1.5rem">
          <h2 style="color:#F5C518;margin:0">Nuova iscrizione squadra</h2>
          <p style="color:rgba(255,255,255,0.6);margin:0.3rem 0 0;font-size:0.85rem">
            ${new Date().toLocaleString('it-IT')}
          </p>
        </div>
        <div style="padding:1.5rem;background:#fff;border:1px solid #DDE2EA">
          <table style="width:100%;font-size:0.9rem;border-collapse:collapse">
            <tr><td style="padding:0.5rem 0;color:#6B7A90;width:40%">Responsabile</td><td><strong>${respNome}</strong></td></tr>
            <tr><td style="padding:0.5rem 0;color:#6B7A90">Email</td><td>${respEmail || '—'}</td></tr>
            <tr><td style="padding:0.5rem 0;color:#6B7A90;vertical-align:top">1ª Squadra</td>
              <td><strong>${club1}</strong><br>
              <span style="font-size:0.82rem;color:#6B7A90;white-space:pre-line">${gioc1}</span></td>
            </tr>
            ${extraHtml}
          </table>
        </div>
      </div>
    `
  });

  return emails;
}

// ── HELPER: invia una singola email via Resend ──────────────────
async function sendEmail({ key, to, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from:    `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to:      [to],
      subject,
      html
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
  return res.json();
}
