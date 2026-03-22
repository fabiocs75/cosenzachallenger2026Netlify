# Cosenza GP 2026 — Guida al Deploy su Netlify

## Come funziona ora (senza Google, senza backend)

I form usano **Netlify Forms**: quando un utente si iscrive,
Netlify salva automaticamente i dati. Tu vai nella dashboard
di Netlify e scarichi tutto come **CSV** con un clic.
Nessun account Google, nessun server, nessun codice extra.

---

## STEP 1 — Crea account Netlify (gratuito)

1. Vai su **https://netlify.com** → clicca **Sign up**
2. Registrati con GitHub, GitLab, o email — a tua scelta
3. Non serve carta di credito

---

## STEP 2 — Pubblica il sito (metodo drag & drop, 30 secondi)

1. Vai su **https://app.netlify.com**
2. Nella sezione **"Sites"** trovi un riquadro grigio:
   > *"Want to deploy a new site without connecting to Git?
   > Drag and drop your site output folder here"*
3. **Trascina l'intera cartella** con i tuoi file dentro quel riquadro
4. Netlify pubblica il sito istantaneamente con un URL tipo:
   `https://random-name-123.netlify.app`
5. Puoi rinominarlo: **Site settings → Site details → Change site name**
   → diventa `https://Cosenza-gp-2026.netlify.app`

---

## STEP 3 — I form vengono attivati automaticamente

Netlify rileva in automatico i form con `data-netlify="true"`.
Non devi fare nulla: dopo il primo invio trovi i dati qui:

**Netlify dashboard → Il tuo sito → Forms**

Vedrai due form separati:
- **iscrizione-individuale** — tutte le iscrizioni individuali
- **iscrizione-squadra** — tutte le iscrizioni squadra

---

## STEP 4 — Scaricare gli iscritti come CSV

1. Vai su **https://app.netlify.com** → apri il tuo sito
2. Clicca sul tab **"Forms"**
3. Clicca sul form che vuoi esportare (es. *iscrizione-individuale*)
4. In alto a destra clicca **"Download CSV"**
5. Ottieni un file Excel/Calc con tutte le iscrizioni

Puoi farlo in qualsiasi momento, quante volte vuoi.

---

## Aggiornare il sito dopo modifiche

**Metodo drag & drop** (più semplice):
1. Vai su **Netlify → Il tuo sito → Deploys**
2. Trascina di nuovo la cartella aggiornata
3. Il sito si aggiorna in pochi secondi

**Metodo GitHub** (automatico ad ogni modifica):
1. Carica i file su un repository GitHub
2. Su Netlify: **Site settings → Build & deploy → Link to Git**
3. Seleziona il repository → da quel momento ogni push aggiorna il sito

---

## Limiti piano gratuito Netlify

| Voce | Piano gratuito |
|------|---------------|
| Siti | Illimitati |
| Bandwidth | 100 GB/mese |
| Deploy | 300 minuti build/mese |
| **Form submissions** | **100/mese** |
| Esportazione CSV | ✅ Inclusa |

100 invii/mese sono più che sufficienti per un torneo.
Se servissero più invii, il piano Pro costa $19/mese.

---

## File inclusi

| File | Descrizione |
|------|-------------|
| `index.html` | Pagina principale del torneo |
| `individuale.html` | Form iscrizione individuale (Netlify Forms) |
| `squadra.html` | Form iscrizione squadra (Netlify Forms) |
| `clubs.js` | Lista club FISTF condivisa |
