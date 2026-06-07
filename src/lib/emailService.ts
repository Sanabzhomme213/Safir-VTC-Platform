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
  companyName: string;
  companyPhone: string;
}): string {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:32px;background:#f4f4f8;font-family:Arial,sans-serif">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.1)">
  <div style="background:#1a45f5;padding:32px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:24px">🚗 ${params.companyName}</h1>
    <p style="color:rgba(255,255,255,.8);margin:8px 0 0;font-size:14px">Votre chauffeur privé premium</p>
  </div>
  <div style="padding:32px">
    <h2 style="color:#0a0a0a;margin:0 0 16px">Réservation confirmée ✅</h2>
    <p style="color:#6d6d6d;margin:0 0 24px">Bonjour <strong style="color:#0a0a0a">${params.clientName}</strong>,<br/>Votre réservation <strong style="color:#1a45f5">${params.bookingNumber}</strong> est bien confirmée.</p>
    <table width="100%" style="border-collapse:collapse;background:#f6f6f6;border-radius:8px;overflow:hidden">
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e7e7e7;color:#888;font-size:13px;width:40%">Date</td><td style="padding:12px 16px;border-bottom:1px solid #e7e7e7;font-weight:bold;font-size:13px">${params.date}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e7e7e7;color:#888;font-size:13px">Heure</td><td style="padding:12px 16px;border-bottom:1px solid #e7e7e7;font-weight:bold;font-size:13px">${params.time}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e7e7e7;color:#888;font-size:13px">Départ</td><td style="padding:12px 16px;border-bottom:1px solid #e7e7e7;font-weight:bold;font-size:13px">${params.from}</td></tr>
      <tr><td style="padding:12px 16px;border-bottom:1px solid #e7e7e7;color:#888;font-size:13px">Arrivée</td><td style="padding:12px 16px;border-bottom:1px solid #e7e7e7;font-weight:bold;font-size:13px">${params.to}</td></tr>
      <tr><td style="padding:12px 16px;color:#888;font-size:13px">Montant</td><td style="padding:12px 16px;font-weight:bold;font-size:13px;color:#1a45f5">${params.amount}</td></tr>
    </table>
    <p style="color:#6d6d6d;font-size:13px;margin-top:24px">Pour toute question : <strong>${params.companyPhone}</strong></p>
  </div>
  <div style="background:#f6f6f6;padding:16px;text-align:center;color:#888;font-size:12px">${params.companyName} — Votre confort, notre priorité</div>
</div>
</body></html>`;
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