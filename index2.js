const lnService = require('ln-service');

// Le tue credenziali esatte copiate da Polar
const GRPC_HOST = 'localhost:10001';
const TLS_CERT = 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNUekNDQWZXZ0F3SUJBZ0lSQUlMWHJ5azg3OUYzVURWM2Q1cnJPam93Q2dZSUtvWkl6ajBFQXdJd05ERWYKTUIwR0ExVUVDaE1XYkc1a0lHRjFkRzluWlc1bGNtRjBaV1FnWTJWeWRERVJNQThHQTFVRUF4TUliV2x1YVMxQgpVRkF3SGhjTk1qWXdOREUwTVRrMU56UXhXaGNOTWpjd05qQTVNVGsxTnpReFdqQTBNUjh3SFFZRFZRUUtFeFpzCmJtUWdZWFYwYjJkbGJtVnlZWFJsWkNCalpYSjBNUkV3RHdZRFZRUURFd2h0YVc1cExVRlFVREJaTUJNR0J5cUcKU000OUFnRUdDQ3FHU000OUF3RUhBMElBQkJ6cGNPT3NkQzNzYVZKbC9GZkVWWHpSVjNwZ1piUVpxZTRrbjRNVQppcExyQUZ6NmloYjVIcHlwanFtcnNwVjZ1bWF2ckhoVnU3TnZIYjZKZ2RhZHlrYWpnZWN3Z2VRd0RnWURWUjBQCkFRSC9CQVFEQWdLa01CTUdBMVVkSlFRTU1Bb0dDQ3NHQVFVRkJ3TUJNQThHQTFVZEV3RUIvd1FGTUFNQkFmOHcKSFFZRFZSME9CQllFRkIwbjFjK2hFb01PcEoycTB0ckFSMmRjSUtaY01JR01CZ05WSFJFRWdZUXdnWUdDQ0cxcApibWt0UVZCUWdnbHNiMk5oYkdodmMzU0NDRzFwYm1rdFFWQlFnaEZ3YjJ4aGNpMXVNUzF0YVc1cExVRlFVSUlVCmFHOXpkQzVrYjJOclpYSXVhVzUwWlhKdVlXeUNCSFZ1YVhpQ0NuVnVhWGh3WVdOclpYU0NCMkoxWm1OdmJtNkgKQkg4QUFBR0hFQUFBQUFBQUFBQUFBQUFBQUFBQUFBR0hCS3dTQUFJd0NnWUlLb1pJemowRUF3SURTQUF3UlFJaApBUGdNKy8zVFRpZzdCL1hCUzVja09zV2NRc0JUaXRNRFJpeDVoUDZMUGZuOUFpQWk3eVNhTDlGb2RzbmtjT3hNCitvK3l6OXVrbmhxeHM2eHlYRnJUMXR0OGR3PT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=';
const ADMIN_MACAROON = 'AgEDbG5kAvgBAwoQKmb6Bt8gsKts2LTL49YmbxIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgWSgbUgCPh9Sg+M0FJOTJQwcGsDT0jzdjEesRpzl1oPI='
async function main() {
  try {
    console.log("1. Mi sto connettendo al nodo LND...");

    // Inizializza la connessione a LND
    const { lnd } = lnService.authenticatedLndGrpc({
      cert: TLS_CERT,
      macaroon: ADMIN_MACAROON,
      socket: GRPC_HOST,
    });

    // Testa la connessione leggendo le info del nodo
    const walletInfo = await lnService.getWalletInfo({ lnd });
    console.log("✅ Connessione riuscita! Il nodo si chiama:", walletInfo.alias);
    console.log("------------------------------------------------");

    // CREAZIONE DELLA FATTURA
    console.log("2. Sto creando una nuova fattura per una birra...");
    const importoSatoshi = 200; 
    const descrizione = "Pagamento birra Plan B";

    const fattura = await lnService.createInvoice({
      lnd: lnd,
      tokens: importoSatoshi,
      description: descrizione
    });

    console.log("✅ Fattura creata con successo!");
    console.log("------------------------------------------------");
    console.log("Copia questa stringa e incollala nel secondo nodo su Polar per pagare:");
    console.log("\n" + fattura.request + "\n"); 
    console.log("------------------------------------------------");

  } catch (error) {
    console.error("❌ Errore di connessione o di creazione fattura:");
    console.error(error.message || error);
  }
}

main();