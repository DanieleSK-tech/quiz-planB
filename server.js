const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml'); 
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ==========================================
// CONFIGURAZIONE DATABASE
// ==========================================
const dbPath = path.resolve(__dirname, 'winners_log.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Errore DB:', err.message);
  } else {
    console.log('✅ Connesso al database SQLite (winners_log.db)');
    db.run(`CREATE TABLE IF NOT EXISTS winners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      invoice TEXT NOT NULL,
      amount_sats INTEGER NOT NULL,
      transaction_id TEXT,
      status TEXT NOT NULL
    )`, (err) => {
      if (err) console.error('❌ Errore creazione tabella:', err.message);
      else console.log('✅ Tabella winners pronta');
    });
  }
});

function logWinner(invoice, amount, transactionId, status) {
  const query = `INSERT INTO winners (invoice, amount_sats, transaction_id, status) VALUES (?, ?, ?, ?)`;
  db.run(query, [invoice, amount, transactionId, status], function(err) {
    if (err) console.error('❌ Errore salvataggio DB:', err.message);
    else console.log(`📝 Log salvato nel DB con ID: ${this.lastID}`);
  });
}

// ==========================================
// FUNZIONI E QUIZ
// ==========================================
function mescolaArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const BASE_RAW_URL = 'https://raw.githubusercontent.com/PlanB-Network/bitcoin-educational-content/dev/courses/btc101/quizz';
const QUESTION_IDS = ['001','002','003','004','005','006','007','008','009','010','011','012','013','014','015','016','017','018','019','020','021'];

async function scaricaDomandaRandom(lingua = 'en') {
  const idDomanda = QUESTION_IDS[Math.floor(Math.random() * QUESTION_IDS.length)];
  const url = `${BASE_RAW_URL}/${idDomanda}/${lingua}.yml`;
  const risposta = await fetch(url);
  if (!risposta.ok) throw new Error(`Errore HTTP ${risposta.status}`);
  return { id: idDomanda, ...yaml.load(await risposta.text()) };
}

app.get('/api/domanda', async (req, res) => {
  try {
    const domanda = await scaricaDomandaRandom('it');
    res.json({
      id: domanda.id,
      testoDomanda: domanda.question,
      opzioni: mescolaArray([domanda.answer, ...domanda.wrong_answers]),
      rispostaEsatta: domanda.answer,
      spiegazione: domanda.explanation
    });
  } catch (err) {
    res.status(500).json({ errore: 'Errore GitHub' });
  }
});

// ==========================================
// CONFIGURAZIONE LIGHTNING (LNbits API)
// ==========================================
const LNBITS_URL = 'https://demo.lnbits.com';
const LNBITS_ADMIN_KEY = 'fb180207afaa400e97781e9fdd3a58e0'; // <-- dalla pagina demo.lnbits.com

// ==========================================
// 2. ROTTA DEI PAGAMENTI (Via LNbits)
// ==========================================
// ==========================================
// 2. ROTTA DEI PAGAMENTI (Via Lightning Address)
// ==========================================
app.post('/api/paga', async (req, res) => {
  const { lightningAddress } = req.body;
  const amountSats = 1; // Cambia a 1500 in produzione!
  const amountMsat = amountSats * 1000; // LNbits vuole i millisatoshi

  if (!lightningAddress || !lightningAddress.includes('@')) {
    return res.status(400).json({ errore: "Lightning Address non valido!" });
  }

  console.log(`⚡ Pagamento verso Lightning Address: ${lightningAddress}`);

  try {
    // STEP 1: Risolvi il Lightning Address → ottieni i parametri LNURL
    const [utente, dominio] = lightningAddress.split('@');
    const lnurlpUrl = `https://${dominio}/.well-known/lnurlp/${utente}`;
    
    console.log(`🔍 Chiamo LNURL: ${lnurlpUrl}`);
    const lnurlRisposta = await fetch(lnurlpUrl);
    if (!lnurlRisposta.ok) throw new Error(`Lightning Address non trovato: ${lightningAddress}`);
    
    const lnurlDati = await lnurlRisposta.json();
    if (lnurlDati.status === 'ERROR') throw new Error(lnurlDati.reason);

    // STEP 2: Controlla che l'importo sia nei limiti accettati dal wallet
    if (amountMsat < lnurlDati.minSendable || amountMsat > lnurlDati.maxSendable) {
      throw new Error(`Importo fuori range: min ${lnurlDati.minSendable/1000} sat, max ${lnurlDati.maxSendable/1000} sat`);
    }

    // STEP 3: Richiedi la fattura (invoice) al wallet dell'utente
    const callbackUrl = `${lnurlDati.callback}?amount=${amountMsat}`;
    console.log(`📋 Richiedo fattura: ${callbackUrl}`);
    
    const fatturaRisposta = await fetch(callbackUrl);
    const fatturaDati = await fatturaRisposta.json();
    if (fatturaDati.status === 'ERROR') throw new Error(fatturaDati.reason);

    const fattura = fatturaDati.pr; // La stringa lnbc...
    console.log(`📄 Fattura ricevuta: ${fattura.substring(0, 20)}...`);

    // STEP 4: Paga la fattura tramite LNbits
    const pagamentoRisposta = await fetch(`${LNBITS_URL}/api/v1/payments`, {
      method: 'POST',
      headers: {
        'X-Api-Key': LNBITS_ADMIN_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ out: true, bolt11: fattura })
    });

    const datiPagamento = await pagamentoRisposta.json();
    if (!pagamentoRisposta.ok) throw new Error(datiPagamento.detail || "Errore LNbits");

    console.log(`✅ Pagamento OK! Hash: ${datiPagamento.payment_hash}`);
    logWinner(lightningAddress, amountSats, datiPagamento.payment_hash, "SUCCESS");

    res.json({
      successo: true,
      messaggio: `${amountSats} sat inviati a ${lightningAddress}!`,
      idTransazione: datiPagamento.payment_hash
    });

  } catch (errore) {
    const msgErrore = errore.message || String(errore);
    console.error("❌ Errore pagamento:", msgErrore);
    logWinner(lightningAddress, amountSats, "N/A", `FAILED: ${msgErrore}`);
    res.status(500).json({ successo: false, errore: msgErrore });
  }
});

// ==========================================
// ROTTA DEI LOG! (Questa mancava!)
// ==========================================
app.get('/api/logs', (req, res) => {
  db.all("SELECT * FROM winners ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ errore: 'Errore DB' });
    res.json({ successo: true, storico: rows || [] });
  });
});

// ==========================================
// AVVIO
// ==========================================
app.listen(PORT, () => console.log(`🚀 Server ok: http://localhost:${PORT}`));