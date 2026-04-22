const express = require('express');
const cors = require('cors');
const yaml = require('js-yaml'); // Assicurati di aver fatto npm install js-yaml

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
// Serviamo i file statici dalla cartella 'public'
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));;
// ==========================================
// FUNZIONI DI AIUTO (Helpers)
// ==========================================

// Algoritmo standard (Fisher-Yates) per mescolare un array in modo casuale
function mescolaArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Funzione che scarica lo YAML da GitHub (quella che avevamo creato ieri)
const BASE_RAW_URL = 'https://raw.githubusercontent.com/PlanB-Network/bitcoin-educational-content/dev/courses/btc101/quizz';
const  QUESTION_IDS = ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010', '011', '012', '013', '014', '015', '016', '017', '018', '019', '020', '021'];
async function scaricaDomandaRandom(lingua = 'en') {
  const idDomanda = QUESTION_IDS[Math.floor(Math.random() * QUESTION_IDS.length)];
  const url = `${BASE_RAW_URL}/${idDomanda}/${lingua}.yml`;

  const risposta = await fetch(url);
  if (!risposta.ok) throw new Error(`Errore HTTP ${risposta.status}`);
  
  const testoYaml = await risposta.text();
  return { id: idDomanda, ...yaml.load(testoYaml) };
}


// ==========================================
// LE NOSTRE ROTTE (Endpoints)
// ==========================================



// 1. ROTTA DEL QUIZ: restituisce una domanda pronta per essere giocata
app.get('/api/domanda', async (req, res) => {
  try {
    // 1. Scarica la domanda grezza da GitHub (es. in italiano 'it')
    const domandaGrezza = await scaricaDomandaRandom('it');

    // 2. Uniamo la risposta giusta e quelle sbagliate in un unico array
    const tutteLeRisposte = [domandaGrezza.answer, ...domandaGrezza.wrong_answers];

    // 3. Le mescoliamo in ordine casuale
    const risposteMescolate = mescolaArray(tutteLeRisposte);

    // 4. Prepariamo l'oggetto "pulito" da mandare al frontend
    const domandaPronta = {
      id: domandaGrezza.id,
      testoDomanda: domandaGrezza.question,
      opzioni: risposteMescolate,
      // Manteniamo nascosta la risposta esatta per poterla verificare dopo
      // (in un'app vera questa verifica andrebbe fatta lato server, ma per ora va bene così)
      rispostaEsatta: domandaGrezza.answer,
      spiegazione: domandaGrezza.explanation
    };

    // 5. Inviamo i dati al browser/frontend in formato JSON
    res.json(domandaPronta);

  } catch (errore) {
    console.error(errore);
    res.status(500).json({ errore: 'Impossibile scaricare la domanda da GitHub' });
  }
});

// ==========================================
// CONFIGURAZIONE LIGHTNING (Nodo 1 - App)
// ==========================================
const lnService = require('ln-service');

//  LE CREDENZIALI DEL NODO 1 DA POLAR (Base64)
const GRPC_HOST = 'localhost:10001'; 
const TLS_CERT = 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNUekNDQWZXZ0F3SUJBZ0lSQUlMWHJ5azg3OUYzVURWM2Q1cnJPam93Q2dZSUtvWkl6ajBFQXdJd05ERWYKTUIwR0ExVUVDaE1XYkc1a0lHRjFkRzluWlc1bGNtRjBaV1FnWTJWeWRERVJNQThHQTFVRUF4TUliV2x1YVMxQgpVRkF3SGhjTk1qWXdOREUwTVRrMU56UXhXaGNOTWpjd05qQTVNVGsxTnpReFdqQTBNUjh3SFFZRFZRUUtFeFpzCmJtUWdZWFYwYjJkbGJtVnlZWFJsWkNCalpYSjBNUkV3RHdZRFZRUURFd2h0YVc1cExVRlFVREJaTUJNR0J5cUcKU000OUFnRUdDQ3FHU000OUF3RUhBMElBQkJ6cGNPT3NkQzNzYVZKbC9GZkVWWHpSVjNwZ1piUVpxZTRrbjRNVQppcExyQUZ6NmloYjVIcHlwanFtcnNwVjZ1bWF2ckhoVnU3TnZIYjZKZ2RhZHlrYWpnZWN3Z2VRd0RnWURWUjBQCkFRSC9CQVFEQWdLa01CTUdBMVVkSlFRTU1Bb0dDQ3NHQVFVRkJ3TUJNQThHQTFVZEV3RUIvd1FGTUFNQkFmOHcKSFFZRFZSME9CQllFRkIwbjFjK2hFb01PcEoycTB0ckFSMmRjSUtaY01JR01CZ05WSFJFRWdZUXdnWUdDQ0cxcApibWt0UVZCUWdnbHNiMk5oYkdodmMzU0NDRzFwYm1rdFFWQlFnaEZ3YjJ4aGNpMXVNUzF0YVc1cExVRlFVSUlVCmFHOXpkQzVrYjJOclpYSXVhVzUwWlhKdVlXeUNCSFZ1YVhpQ0NuVnVhWGh3WVdOclpYU0NCMkoxWm1OdmJtNkgKQkg4QUFBR0hFQUFBQUFBQUFBQUFBQUFBQUFBQUFBR0hCS3dTQUFJd0NnWUlLb1pJemowRUF3SURTQUF3UlFJaApBUGdNKy8zVFRpZzdCL1hCUzVja09zV2NRc0JUaXRNRFJpeDVoUDZMUGZuOUFpQWk3eVNhTDlGb2RzbmtjT3hNCitvK3l6OXVrbmhxeHM2eHlYRnJUMXR0OGR3PT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=';
const ADMIN_MACAROON = 'AgEDbG5kAvgBAwoQKmb6Bt8gsKts2LTL49YmbxIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgWSgbUgCPh9Sg+M0FJOTJQwcGsDT0jzdjEesRpzl1oPI=';

// Creiamo l'oggetto di connessione al nodo in modo permanente
const { lnd } = lnService.authenticatedLndGrpc({
  cert: TLS_CERT,
  macaroon: ADMIN_MACAROON,
  socket: GRPC_HOST,
});

// ==========================================
// 2. ROTTA DEI PAGAMENTI
// ==========================================
// Questa rotta riceve la stringa "lnbc..." e la paga!
app.post('/api/paga', async (req, res) => {
  try {
    // 1. Estraiamo la fattura inviata dal frontend nel "corpo" della richiesta
    const fatturaStudente = req.body.fattura;

    if (!fatturaStudente) {
      return res.status(400).json({ errore: "Manca la fattura Lightning!" });
    }

    console.log("⚡ Tentativo di pagamento della fattura:", fatturaStudente.substring(0, 15) + "...");

    // 2. Usiamo ln-service per dire al Nodo 1 di pagare
    const pagamento = await lnService.pay({
      lnd: lnd,
      request: fatturaStudente
    });

    console.log("✅ Pagamento andato a buon fine! ID:", pagamento.id);

    // 3. Rispondiamo al frontend dicendo che i soldi sono stati inviati
    res.json({
      successo: true,
      messaggio: "Congratulazioni! I tuoi satoshi sono in arrivo.",
      idTransazione: pagamento.id
    });

  } catch (errore) {
    console.error("❌ Errore durante il pagamento:", errore.message || errore);
    
    // In caso di fondi insufficienti o fattura scaduta, avvisiamo il frontend
    res.status(500).json({ 
      successo: false, 
      errore: "Il pagamento è fallito. Controlla che la fattura sia valida e non sia già stata pagata."
    });
  }
});
// ==========================================
// AVVIO DEL SERVER
// ==========================================
const fs = require('fs');
const percorsoHtml = path.join(__dirname, 'public', 'index.html');
console.log("Cerco il file HTML in:", percorsoHtml);
if (fs.existsSync(percorsoHtml)) {
  console.log("✅ File HTML trovato!");
} else {
  console.log("❌ File HTML NON trovato!");
}
app.listen(PORT, () => {
  console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
});