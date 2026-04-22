const lnService = require('ln-service');

// ==========================================
// 1. CREDENZIALI NODO 1 (Chi PAGA - L'App)
// ==========================================
const GRPC_HOST_NODO_1 = 'localhost:10001'; 
const TLS_CERT_NODO_1 = 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNUekNDQWZXZ0F3SUJBZ0lSQUlMWHJ5azg3OUYzVURWM2Q1cnJPam93Q2dZSUtvWkl6ajBFQXdJd05ERWYKTUIwR0ExVUVDaE1XYkc1a0lHRjFkRzluWlc1bGNtRjBaV1FnWTJWeWRERVJNQThHQTFVRUF4TUliV2x1YVMxQgpVRkF3SGhjTk1qWXdOREUwTVRrMU56UXhXaGNOTWpjd05qQTVNVGsxTnpReFdqQTBNUjh3SFFZRFZRUUtFeFpzCmJtUWdZWFYwYjJkbGJtVnlZWFJsWkNCalpYSjBNUkV3RHdZRFZRUURFd2h0YVc1cExVRlFVREJaTUJNR0J5cUcKU000OUFnRUdDQ3FHU000OUF3RUhBMElBQkJ6cGNPT3NkQzNzYVZKbC9GZkVWWHpSVjNwZ1piUVpxZTRrbjRNVQppcExyQUZ6NmloYjVIcHlwanFtcnNwVjZ1bWF2ckhoVnU3TnZIYjZKZ2RhZHlrYWpnZWN3Z2VRd0RnWURWUjBQCkFRSC9CQVFEQWdLa01CTUdBMVVkSlFRTU1Bb0dDQ3NHQVFVRkJ3TUJNQThHQTFVZEV3RUIvd1FGTUFNQkFmOHcKSFFZRFZSME9CQllFRkIwbjFjK2hFb01PcEoycTB0ckFSMmRjSUtaY01JR01CZ05WSFJFRWdZUXdnWUdDQ0cxcApibWt0UVZCUWdnbHNiMk5oYkdodmMzU0NDRzFwYm1rdFFWQlFnaEZ3YjJ4aGNpMXVNUzF0YVc1cExVRlFVSUlVCmFHOXpkQzVrYjJOclpYSXVhVzUwWlhKdVlXeUNCSFZ1YVhpQ0NuVnVhWGh3WVdOclpYU0NCMkoxWm1OdmJtNkgKQkg4QUFBR0hFQUFBQUFBQUFBQUFBQUFBQUFBQUFBR0hCS3dTQUFJd0NnWUlLb1pJemowRUF3SURTQUF3UlFJaApBUGdNKy8zVFRpZzdCL1hCUzVja09zV2NRc0JUaXRNRFJpeDVoUDZMUGZuOUFpQWk3eVNhTDlGb2RzbmtjT3hNCitvK3l6OXVrbmhxeHM2eHlYRnJUMXR0OGR3PT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=';
const MACAROON_NODO_1 = 'AgEDbG5kAvgBAwoQKmb6Bt8gsKts2LTL49YmbxIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgWSgbUgCPh9Sg+M0FJOTJQwcGsDT0jzdjEesRpzl1oPI=';

// ==========================================
// 2. CREDENZIALI NODO 2 (Chi RICEVE - L'Utente)
// ==========================================
const GRPC_HOST_NODO_2 = 'localhost:10003'; // Di solito la porta è 10002 o diversa da 10001
const TLS_CERT_NODO_2 = 'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNZVENDQWdpZ0F3SUJBZ0lRZnNvTzNjanJvV29nYVJ0cENEQ2cvekFLQmdncWhrak9QUVFEQWpBNE1SOHcKSFFZRFZRUUtFeFpzYm1RZ1lYVjBiMmRsYm1WeVlYUmxaQ0JqWlhKME1SVXdFd1lEVlFRREV3eFFiR0Z1UW5OMApkV1JsYm5Rd0hoY05Nall3TkRFME1UazFPREUzV2hjTk1qY3dOakE1TVRrMU9ERTNXakE0TVI4d0hRWURWUVFLCkV4WnNibVFnWVhWMGIyZGxibVZ5WVhSbFpDQmpaWEowTVJVd0V3WURWUVFERXd4UWJHRnVRbk4wZFdSbGJuUXcKV1RBVEJnY3Foa2pPUFFJQkJnZ3Foa2pPUFFNQkJ3TkNBQVN0K0lkVG9vNitub29IR082WTNsTmtSNEUzV3ZQdApnSHB6Nk1ZbmZUQ0ZqUmdNNG52aXpHVGlNcnFjeGx6aXk3MG56bHRmOUlRcDNDZEpCUGhOUEdiWW80SHpNSUh3Ck1BNEdBMVVkRHdFQi93UUVBd0lDcERBVEJnTlZIU1VFRERBS0JnZ3JCZ0VGQlFjREFUQVBCZ05WSFJNQkFmOEUKQlRBREFRSC9NQjBHQTFVZERnUVdCQlF5Ty8zSEJQQ3BTby81TGZrS2xSU1VEOHBacmpDQm1BWURWUjBSQklHUQpNSUdOZ2d4UWJHRnVRbk4wZFdSbGJuU0NDV3h2WTJGc2FHOXpkSUlNVUd4aGJrSnpkSFZrWlc1MGdoVndiMnhoCmNpMXVNUzFRYkdGdVFuTjBkV1JsYm5TQ0ZHaHZjM1F1Wkc5amEyVnlMbWx1ZEdWeWJtRnNnZ1IxYm1sNGdncDEKYm1sNGNHRmphMlYwZ2dkaWRXWmpiMjV1aHdSL0FBQUJoeEFBQUFBQUFBQUFBQUFBQUFBQUFBQUJod1NzRWdBRApNQW9HQ0NxR1NNNDlCQU1DQTBjQU1FUUNJQUNoeUF6R21rdVZXMkNCYnU4ZG11U2tRRXR5SytiT1RRSmZvTEQ0ClBmajVBaUJOa05wQmtYdWlKY3VaVi9YU0loWXl5UjZHcFYrZjl1U0kveHJlT1BLc0tRPT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=';
const MACAROON_NODO_2 = 'AgEDbG5kAvgBAwoQf6RvlXboyBWoThKNM8EG5xIBMBoWCgdhZGRyZXNzEgRyZWFkEgV3cml0ZRoTCgRpbmZvEgRyZWFkEgV3cml0ZRoXCghpbnZvaWNlcxIEcmVhZBIFd3JpdGUaIQoIbWFjYXJvb24SCGdlbmVyYXRlEgRyZWFkEgV3cml0ZRoWCgdtZXNzYWdlEgRyZWFkEgV3cml0ZRoXCghvZmZjaGFpbhIEcmVhZBIFd3JpdGUaFgoHb25jaGFpbhIEcmVhZBIFd3JpdGUaFAoFcGVlcnMSBHJlYWQSBXdyaXRlGhgKBnNpZ25lchIIZ2VuZXJhdGUSBHJlYWQAAAYgMmQK+2qxrOLJbS+Cjfi1WbE9oCv8VkzYCF14zT638L4=';


async function main() {
  try {
    // --- AUTENTICAZIONE SUI DUE NODI ---
    console.log("1. Mi connetto ai due nodi...");
    
    const lndNodo1 = lnService.authenticatedLndGrpc({
      cert: TLS_CERT_NODO_1,
      macaroon: MACAROON_NODO_1,
      socket: GRPC_HOST_NODO_1,
    }).lnd;

    const lndNodo2 = lnService.authenticatedLndGrpc({
      cert: TLS_CERT_NODO_2,
      macaroon: MACAROON_NODO_2,
      socket: GRPC_HOST_NODO_2,
    }).lnd;


    // --- FASE A: IL NODO 2 CREA LA FATTURA ---
    console.log("2. L'utente ha vinto! Il Nodo 2 sta creando la fattura...");
    
    const fattura = await lnService.createInvoice({
      lnd: lndNodo2, // <-- Attenzione qui: usiamo lndNodo2!
      tokens: 5000,
      description: "Premio quiz Plan B"
    });

    console.log("   Fattura creata con successo:", fattura.id);


    // --- FASE B: IL NODO 1 PAGA LA FATTURA ---
    console.log("3. Il Nodo 1 (App) sta pagando la fattura...");

    const pagamento = await lnService.pay({
      lnd: lndNodo1, // <-- Attenzione qui: usiamo lndNodo1!
      request: fattura.request
    });

    console.log("✅ Pagamento completato con successo!");
    console.log("   I 5000 sats sono stati inviati dal Nodo 1 al Nodo 2.");
    
  } catch (error) {
    console.error("\n❌ ERRORE:");
    console.error(error.message || error);
  }
}

main();