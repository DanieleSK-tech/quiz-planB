const lnService = require('ln-service');

// 1. INCOLLA QUI I VALORI PRESI DA POLAR (Dal pannello Connect in formato Base64)
const GRPC_HOST = 'localhost:10001';
const TLS_CERT = 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNUekNDQWZXZ0F3SUJBZ0lSQUlMWHJ5azg3OUYzVURWM2Q1cnJPam93Q2dZSUtvWkl6ajBFQXdJd05ERWYKTUIwR0ExVUVDaE1XYkc1a0lHRjFkRzluWlc1bGNtRjBaV1FnWTJWeWRERVJNQThHQTFVRUF4TUliV2x1YVMxQgpVRkF3SGhjTk1qWXdOREUwTVRrMU56UXhXaGNOTWpjd05qQTVNVGsxTnpReFdqQTBNUjh3SFFZRFZRUUtFeFpzCmJtUWdZWFYwYjJkbGJtVnlZWFJsWkNCalpYSjBNUkV3RHdZRFZRUURFd2h0YVc1cExVRlFVREJaTUJNR0J5cUcKU000OUFnRUdDQ3FHU000OUF3RUhBMElBQkJ6cGNPT3NkQzNzYVZKbC9GZkVWWHpSVjNwZ1piUVpxZTRrbjRNVQppcExyQUZ6NmloYjVIcHlwanFtcnNwVjZ1bWF2ckhoVnU3TnZIYjZKZ2RhZHlrYWpnZWN3Z2VRd0RnWURWUjBQCkFRSC9CQVFEQWdLa01CTUdBMVVkSlFRTU1Bb0dDQ3NHQVFVRkJ3TUJNQThHQTFVZEV3RUIvd1FGTUFNQkFmOHcKSFFZRFZSME9CQllFRkIwbjFjK2hFb01PcEoycTB0ckFSMmRjSUtaY01JR01CZ05WSFJFRWdZUXdnWUdDQ0cxcApibWt0UVZCUWdnbHNiMk5oYkdodmMzU0NDRzFwYm1rdFFWQlFnaEZ3YjJ4aGNpMXVNUzF0YVc1cExVRlFVSUlVCmFHOXpkQzVrYjJOclpYSXVhVzUwWlhKdVlXeUNCSFZ1YVhpQ0NuVnVhWGh3WVdOclpYU0NCMkoxWm1OdmJtNkgKQkg4QUFBR0hFQUFBQUFBQUFBQUFBQUFBQUFBQUFBR0hCS3dTQUFJd0NnWUlLb1pJemowRUF3SURTQUF3UlFJaApBUGdNKy8zVFRpZzdCL1hCUzVja09zV2NRc0JUaXRNRFJpeDVoUDZMUGZuOUFpQWk3eVNhTDlGb2RzbmtjT3hNCitvK3l6OXVrbmhxeHM2eHlYRnJUMXR0OGR3PT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=';
const ADMIN_MACAROON = 'AgEDbG5kAvgBAwoQKmb6Bt8gsKts2LTL49YmbxIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgWSgbUgCPh9Sg+M0FJOTJQwcGsDT0jzdjEesRpzl1oPI=';

async function main() {
  try {
    console.log("Tentativo di connessione al nodo LND...");

    // 2. Inizializza la connessione a LND
    const { lnd } = lnService.authenticatedLndGrpc({
      cert: TLS_CERT,
      macaroon: ADMIN_MACAROON,
      socket: GRPC_HOST,
    });

    // 3. Chiedi al nodo le sue informazioni per testare la connessione
    const walletInfo = await lnService.getWalletInfo({ lnd });
    
    console.log("✅ Connessione riuscita!");
    console.log("Alias del nodo:", walletInfo.alias);
    console.log("Chiave pubblica:", walletInfo.public_key);
    console.log("Canali attivi:", walletInfo.active_channels_count);

  } catch (error) {
    console.error("❌ Errore di connessione:");
    console.error("Messaggio:", error.message);
    console.error("Codice:", error.code);
    console.error("Dettagli completi:", error);
  }
}

main();