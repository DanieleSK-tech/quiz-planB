const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==========================================
// DATABASE SETUP
// ==========================================
const dbPath = path.resolve(__dirname, 'winners_log.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ DB Error:', err.message);
  } else {
    console.log('✅ Connected to SQLite (winners_log.db)');

    db.run(`CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      lightning_address TEXT NOT NULL,
      date TEXT NOT NULL,
      score INTEGER NOT NULL,
      total INTEGER NOT NULL,
      sats_earned INTEGER NOT NULL,
      status TEXT NOT NULL
    )`, (err) => {
      if (err) console.error('❌ Table error:', err.message);
      else console.log('✅ Attempts table ready');
    });

    db.run(`CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      lightning_address TEXT NOT NULL,
      amount_sats INTEGER NOT NULL,
      transaction_id TEXT,
      status TEXT NOT NULL
    )`, (err) => {
      if (err) console.error('❌ Table error:', err.message);
      else console.log('✅ Payments table ready');
    });
  }
});

// ==========================================
// HELPERS
// ==========================================
function getToday() {
  return new Date().toISOString().split('T')[0];
}

function hasAlreadyPlayedToday(lightningAddress) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT COUNT(*) as count FROM attempts WHERE lightning_address = ? AND date = ?`,
      [lightningAddress, getToday()],
      (err, row) => {
        if (err) reject(err);
        else resolve(row.count > 0);
      }
    );
  });
}

function logAttempt(lightningAddress, score, total, satsEarned, status) {
  db.run(
    `INSERT INTO attempts (lightning_address, date, score, total, sats_earned, status) VALUES (?, ?, ?, ?, ?, ?)`,
    [lightningAddress, getToday(), score, total, satsEarned, status],
    function(err) {
      if (err) console.error('❌ Attempt log error:', err.message);
      else console.log(`📝 Attempt saved: ${lightningAddress} — ${score}/${total}`);
    }
  );
}

function logPayment(lightningAddress, amount, transactionId, status) {
  db.run(
    `INSERT INTO payments (lightning_address, amount_sats, transaction_id, status) VALUES (?, ?, ?, ?)`,
    [lightningAddress, amount, transactionId, status],
    function(err) {
      if (err) console.error('❌ Payment log error:', err.message);
      else console.log(`💰 Payment saved: ${lightningAddress} — ${amount} sats`);
    }
  );
}

// ==========================================
// SEEDED RANDOM (personalized per user+day)
// ==========================================
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function getPersonalizedQuestionIds(lightningAddress, count = 5) {
  const seedStr = getToday() + lightningAddress.toLowerCase();
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed += seedStr.charCodeAt(i) * (i + 1);
  }

  const rng = seededRandom(seed);
  const shuffled = [...QUESTION_IDS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ==========================================
// QUIZ DATA
// ==========================================
const BASE_RAW_URL = 'https://raw.githubusercontent.com/PlanB-Network/bitcoin-educational-content/dev/courses/btc101/quizz';
const QUESTION_IDS = ['001','002','003','004','005','006','007','008','009','010','011','012','013','014','015','016','017','018','019','020','021'];
const QUESTIONS_PER_DAY = 5;

async function fetchQuestion(id, lang = 'en') {
  const url = `${BASE_RAW_URL}/${id}/${lang}.yml`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP Error ${response.status} for question ${id}`);
  return yaml.load(await response.text());
}

// ==========================================
// ROUTES
// ==========================================

app.post('/api/start', async (req, res) => {
  const { lightningAddress } = req.body;

  if (!lightningAddress || !lightningAddress.includes('@') || !lightningAddress.includes('.')) {
    return res.status(400).json({ errore: 'Invalid Lightning Address format.' });
  }

  try {
    const alreadyPlayed = await hasAlreadyPlayedToday(lightningAddress);
    if (alreadyPlayed) {
      return res.status(429).json({
        errore: `You already played today! Come back tomorrow ⚡`
      });
    }

    const questionIds = getPersonalizedQuestionIds(lightningAddress, QUESTIONS_PER_DAY);
    console.log(`🎯 Questions for ${lightningAddress}: ${questionIds.join(', ')}`);

    const questions = await Promise.all(
      questionIds.map(id => fetchQuestion(id, 'en'))
    );

    const formattedQuestions = questions.map((q, i) => ({
      index: i,
      testoDomanda: q.question,
      opzioni: shuffleArray([q.answer, ...q.wrong_answers]),
      rispostaEsatta: q.answer,
      spiegazione: q.explanation
    }));

    res.json({
      successo: true,
      total: QUESTIONS_PER_DAY,
      questions: formattedQuestions
    });

  } catch (err) {
    console.error('❌ Start error:', err.message);
    res.status(500).json({ errore: 'Error loading questions. Try again.' });
  }
});

// ==========================================
// LIGHTNING CONFIG (LNbits)
// ==========================================
const LNBITS_URL = 'https://demo.lnbits.com';
const LNBITS_ADMIN_KEY = 'fb180207afaa400e97781e9fdd3a58e0';

app.post('/api/submit', async (req, res) => {
  const { lightningAddress, score, total } = req.body;
  const satsEarned = score;

  if (!lightningAddress || score === undefined || total === undefined) {
    return res.status(400).json({ errore: 'Missing data.' });
  }

  logAttempt(lightningAddress, score, total, satsEarned, 'COMPLETED');

  if (satsEarned === 0) {
    return res.json({
      successo: true,
      messaggio: `You scored ${score}/${total}. No sats earned this time. Come back tomorrow!`,
      satsEarned: 0
    });
  }

  try {
    const amountMsat = satsEarned * 1000;
    const [user, domain] = lightningAddress.split('@');
    const lnurlpUrl = `https://${domain}/.well-known/lnurlp/${user}`;

    console.log(`⚡ Paying ${satsEarned} sats to ${lightningAddress}`);

    const lnurlResponse = await fetch(lnurlpUrl);
    if (!lnurlResponse.ok) throw new Error(`Lightning Address not found`);
    const lnurlData = await lnurlResponse.json();
    if (lnurlData.status === 'ERROR') throw new Error(lnurlData.reason);

    if (amountMsat < lnurlData.minSendable || amountMsat > lnurlData.maxSendable) {
      throw new Error(`Amount out of range: min ${lnurlData.minSendable/1000} sat`);
    }

    const callbackUrl = `${lnurlData.callback}?amount=${amountMsat}`;
    const invoiceResponse = await fetch(callbackUrl);
    const invoiceData = await invoiceResponse.json();
    if (invoiceData.status === 'ERROR') throw new Error(invoiceData.reason);

    const paymentResponse = await fetch(`${LNBITS_URL}/api/v1/payments`, {
      method: 'POST',
      headers: { 'X-Api-Key': LNBITS_ADMIN_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ out: true, bolt11: invoiceData.pr })
    });

    const paymentData = await paymentResponse.json();
    if (!paymentResponse.ok) throw new Error(paymentData.detail || 'LNbits error');

    console.log(`✅ Payment OK! ${satsEarned} sats → ${lightningAddress}`);
    logPayment(lightningAddress, satsEarned, paymentData.payment_hash, 'SUCCESS');

    res.json({
      successo: true,
      messaggio: `🎉 ${score}/${total} correct! ${satsEarned} sats sent to ${lightningAddress}!`,
      satsEarned,
      transactionId: paymentData.payment_hash
    });

  } catch (error) {
    console.error('❌ Payment error:', error.message);
    logPayment(lightningAddress, satsEarned, 'N/A', `FAILED: ${error.message}`);
    res.status(500).json({
      successo: false,
      errore: `Score saved (${score}/${total}) but payment failed: ${error.message}`
    });
  }
});

app.get('/api/logs', (req, res) => {
  db.all("SELECT * FROM attempts ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ errore: 'DB Error' });
    res.json({ successo: true, storico: rows || [] });
  });
});

app.listen(PORT, () => console.log(`🚀 Server running: http://localhost:${PORT}`));