// netlify/functions/iscritti.js
// Questa funzione gira sul server Netlify e legge i dati dai form.
// Il token API resta nascosto qui e non è mai visibile nel browser.

exports.handler = async function(event, context) {
  const TOKEN   = process.env.NETLIFY_API_TOKEN;
  const SITE_ID = process.env.NETLIFY_SITE_ID;

  if (!TOKEN || !SITE_ID) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Variabili di ambiente non configurate' })
    };
  }

  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // 1. Recupera tutti i form del sito
    const formsRes = await fetch(
      `https://api.netlify.com/api/v1/sites/${SITE_ID}/forms`,
      { headers }
    );
    const forms = await formsRes.json();

    // 2. Trova i form per nome
    const formIndividuale = forms.find(f => f.name === 'iscrizione-individuale');
    const formSquadra     = forms.find(f => f.name === 'iscrizione-squadra');

    // 3. Recupera le submissions di ciascun form
    async function getSubmissions(formId) {
      if (!formId) return [];
      const res = await fetch(
        `https://api.netlify.com/api/v1/forms/${formId}/submissions?per_page=500`,
        { headers }
      );
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }

    const [individuali, squadre] = await Promise.all([
      getSubmissions(formIndividuale?.id),
      getSubmissions(formSquadra?.id)
    ]);

    // 4. Normalizza i dati (prende solo i campi utili da "data")
    const individualiClean = individuali.map(s => ({
      cognome:   s.data?.cognome   || '',
      nome:      s.data?.nome      || '',
      categoria: s.data?.categoria || '',
      club:      s.data?.club      || '',
      fistf:     s.data?.fistf     || '',
      data:      s.created_at      || ''
    }));

    const squadreClean = squadre.map(s => ({
      resp_cognome: s.data?.resp_cognome || '',
      resp_nome:    s.data?.resp_nome    || '',
      resp_email:   s.data?.resp_email   || '',
      club1:        s.data?.club_1       || '',
      giocatori1:   s.data?.giocatori_1  || '',
      squadre_extra: s.data?.squadre_extra || '',
      data:         s.created_at         || ''
    }));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ individuali: individualiClean, squadre: squadreClean })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
