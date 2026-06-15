export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
  fromName?: string;
}

export async function sendEmail(
  payload: EmailPayload,
  supabaseUrl: string,
  _supabaseKey?: string
): Promise<{ ok: boolean; error?: string }> {
  const configured =
    supabaseUrl.startsWith('https://') && !supabaseUrl.includes('your-project');

  if (!configured) {
    console.info('[Demo] Email would be sent:', payload.to, payload.subject);
    return { ok: true };
  }

  try {
    const { supabase } = await import('./supabase');
    const { error } = await supabase.functions.invoke('send-email', { body: payload });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
  }
}

// ── HTML templates ──────────────────────────────────────────────

export function buildConfirmationEmail(params: {
  clientName: string;
  bookingNumber: string;
  date: string;
  time: string;
  from: string;
  to: string;
  amount: string;
  deposit?: string;
  companyName: string;
  companyPhone: string;
  flightNumber?: string;
}): string {
  const deposit = params.deposit ?? (params.amount ? `${Math.round(parseFloat(params.amount) * 0.2)}€` : '');
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Confirmation de réservation — ${params.companyName}</title>
</head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#0e1a56 0%,#1a45f5 100%);border-radius:20px 20px 0 0;padding:40px 32px;text-align:center">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:16px;margin-bottom:16px">
        <span style="font-size:28px">🚗</span>
      </div>
      <h1 style="color:#fff;margin:0 0 4px;font-size:22px;font-weight:800;letter-spacing:-0.5px">${params.companyName}</h1>
      <p style="color:rgba(255,255,255,0.65);margin:0;font-size:13px;letter-spacing:0.5px;text-transform:uppercase">Chauffeur Privé Premium • Var & Côte d'Azur</p>
    </div>

    <!-- BOOKING CONFIRMED BADGE -->
    <div style="background:#111;padding:28px 32px;text-align:center;border-left:1px solid #1a45f5;border-right:1px solid #1a45f5">
      <div style="display:inline-block;background:#1a45f520;border:1px solid #1a45f540;border-radius:100px;padding:8px 20px;margin-bottom:16px">
        <span style="color:#6b9fff;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:1px">✓ Réservation confirmée</span>
      </div>
      <h2 style="color:#fff;margin:0 0 8px;font-size:28px;font-weight:800">Bonjour ${params.clientName} !</h2>
      <p style="color:#999;margin:0;font-size:14px;line-height:1.6">Votre réservation <strong style="color:#6b9fff;font-family:monospace">${params.bookingNumber}</strong> est confirmée.<br/>Votre chauffeur sera à l'heure.</p>
    </div>

    <!-- TRIP DETAILS -->
    <div style="background:#111;padding:0 32px 28px;border-left:1px solid #1a45f5;border-right:1px solid #1a45f5">
      <div style="background:#1a1a1a;border:1px solid #222;border-radius:16px;overflow:hidden">
        <!-- Route -->
        <div style="padding:20px 24px;border-bottom:1px solid #222">
          <p style="color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;font-weight:600">Itinéraire</p>
          <div style="display:flex;align-items:flex-start;gap:12px">
            <div style="display:flex;flex-direction:column;align-items:center;padding-top:4px">
              <div style="width:10px;height:10px;border-radius:50%;background:#6b9fff;flex-shrink:0"></div>
              <div style="width:2px;height:28px;background:linear-gradient(#6b9fff,#ff4444);margin:4px 0"></div>
              <div style="width:10px;height:10px;border-radius:50%;background:#ff4444;flex-shrink:0"></div>
            </div>
            <div style="flex:1">
              <p style="color:#fff;font-size:14px;font-weight:600;margin:0 0 16px;line-height:1.3">${params.from}</p>
              <p style="color:#fff;font-size:14px;font-weight:600;margin:0;line-height:1.3">${params.to}</p>
            </div>
          </div>
        </div>
        <!-- Date/Time -->
        <div style="display:grid;grid-template-columns:1fr 1fr;border-bottom:1px solid #222">
          <div style="padding:16px 20px;border-right:1px solid #222">
            <p style="color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;font-weight:600">Date</p>
            <p style="color:#fff;font-size:15px;font-weight:700;margin:0">${params.date}</p>
          </div>
          <div style="padding:16px 20px">
            <p style="color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;font-weight:600">Heure</p>
            <p style="color:#fff;font-size:15px;font-weight:700;margin:0">${params.time}</p>
          </div>
        </div>
        ${params.flightNumber ? `
        <!-- Flight -->
        <div style="padding:16px 20px;border-bottom:1px solid #222;background:#1a45f508">
          <p style="color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;font-weight:600">Vol suivi en temps réel</p>
          <p style="color:#6b9fff;font-size:16px;font-weight:800;margin:0;font-family:monospace;letter-spacing:2px">${params.flightNumber}</p>
        </div>
        ` : ''}
      </div>
    </div>

    <!-- PRICE BLOCK -->
    <div style="background:linear-gradient(135deg,#0e1a56,#152bb6);padding:24px 32px;border-left:1px solid #1a45f5;border-right:1px solid #1a45f5">
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div>
          <p style="color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;font-weight:600">Montant total TTC</p>
          <p style="color:#fff;font-size:32px;font-weight:900;margin:0;letter-spacing:-1px">${params.amount}</p>
        </div>
        ${deposit ? `
        <div style="text-align:right;background:rgba(255,255,255,0.1);border-radius:12px;padding:12px 16px">
          <p style="color:rgba(255,255,255,0.6);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 2px;font-weight:600">Acompte (20%)</p>
          <p style="color:#fff;font-size:20px;font-weight:800;margin:0">${deposit}</p>
          <p style="color:rgba(255,255,255,0.4);font-size:10px;margin:2px 0 0">à régler à la réservation</p>
        </div>
        ` : ''}
      </div>
    </div>

    <!-- GUARANTEES -->
    <div style="background:#111;padding:24px 32px;border-left:1px solid #1a45f5;border-right:1px solid #1a45f5">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;text-align:center">
        <div>
          <p style="font-size:20px;margin:0 0 4px">✓</p>
          <p style="color:#666;font-size:11px;margin:0;line-height:1.4">Confirmation<br/>immédiate</p>
        </div>
        <div>
          <p style="font-size:20px;margin:0 0 4px">🔒</p>
          <p style="color:#666;font-size:11px;margin:0;line-height:1.4">Paiement<br/>sécurisé</p>
        </div>
        <div>
          <p style="font-size:20px;margin:0 0 4px">📞</p>
          <p style="color:#666;font-size:11px;margin:0;line-height:1.4">Support<br/>24h/24</p>
        </div>
      </div>
    </div>

    <!-- CONTACT -->
    <div style="background:#111;padding:20px 32px 28px;border-left:1px solid #1a45f5;border-right:1px solid #1a45f5;border-bottom:1px solid #1a45f5;border-radius:0 0 20px 20px">
      <div style="background:#1a1a1a;border:1px solid #222;border-radius:12px;padding:16px 20px;display:flex;align-items:center;justify-content:space-between">
        <div>
          <p style="color:#666;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin:0 0 2px;font-weight:600">Une question ?</p>
          <p style="color:#fff;font-size:14px;font-weight:600;margin:0">${params.companyPhone}</p>
        </div>
        <a href="tel:${params.companyPhone}" style="display:inline-block;background:#1a45f5;color:#fff;text-decoration:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600">Appeler</a>
      </div>
    </div>

    <!-- FOOTER -->
    <div style="text-align:center;padding:24px 16px 8px">
      <p style="color:#333;font-size:11px;margin:0">${params.companyName} • Var &amp; Côte d'Azur • Disponible 24h/24</p>
    </div>

  </div>
</body>
</html>`;
}

export function buildThankYouEmail(params: {
  clientName: string;
  companyName: string;
  reviewUrl: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:32px;background:#f4f4f8;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
  <div style="background:#1a45f5;padding:32px;text-align:center">
    <h1 style="color:#fff;margin:0">🚗 ${params.companyName}</h1>
  </div>
  <div style="padding:32px;text-align:center">
    <h2 style="color:#0a0a0a">Merci ${params.clientName} ! ⭐</h2>
    <p style="color:#6d6d6d">Nous espérons que votre trajet s'est passé dans les meilleures conditions.</p>
    <p style="color:#6d6d6d">Si vous êtes satisfait de nos services, un avis Google nous aiderait beaucoup !</p>
    <a href="${params.reviewUrl}" style="display:inline-block;margin-top:16px;padding:12px 28px;background:#1a45f5;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px">Laisser un avis ⭐</a>
  </div>
  <div style="background:#f6f6f6;padding:16px;text-align:center;color:#888;font-size:12px">${params.companyName}</div>
</div>
</body></html>`;
}