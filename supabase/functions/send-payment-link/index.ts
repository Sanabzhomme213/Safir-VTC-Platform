import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendSms(to: string, text: string): Promise<void> {
  try {
    const apiKey = Deno.env.get('VONAGE_API_KEY');
    const apiSecret = Deno.env.get('VONAGE_API_SECRET');
    const from = Deno.env.get('VONAGE_FROM') ?? 'SafirVTC';
    if (!to || !apiKey || !apiSecret) return;
    const dest = to.replace(/[\s\-\+\.]/g, '').replace(/^0/, '33');
    await fetch('https://rest.nexmo.com/sms/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, api_secret: apiSecret, from, to: dest, text, type: 'unicode' }),
    });
  } catch { /* best-effort */ }
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    const apiKey = Deno.env.get('RESEND_API_KEY');
    if (!to || !apiKey) return;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: `${Deno.env.get('RESEND_FROM_NAME') ?? 'Safir VTC'} <${Deno.env.get('RESEND_FROM_EMAIL') ?? 'onboarding@resend.dev'}>`,
        to: [to],
        subject,
        html,
      }),
    });
  } catch { /* best-effort */ }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Supabase service credentials not configured');

    const headers = {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
    };

    const { reservationId, type } = await req.json();
    if (!reservationId) throw new Error('reservationId requis');
    if (type !== 'deposit' && type !== 'balance') throw new Error('type doit être "deposit" ou "balance"');

    const getRes = await fetch(`${SUPABASE_URL}/rest/v1/reservations?id=eq.${reservationId}&limit=1`, { headers });
    const rows = await getRes.json();
    const reservation = rows?.[0];
    if (!reservation) throw new Error('Réservation introuvable');

    const clientRes = await fetch(`${SUPABASE_URL}/rest/v1/clients?id=eq.${reservation.client_id}&limit=1`, { headers });
    const clientRows = await clientRes.json();
    const client = clientRows?.[0];
    if (!client) throw new Error('Client introuvable');

    const amount = type === 'deposit'
      ? reservation.deposit_amount
      : Math.round((reservation.total_price - reservation.deposit_amount) * 100) / 100;

    const token = reservation.payment_token ?? crypto.randomUUID();
    if (!reservation.payment_token) {
      await fetch(`${SUPABASE_URL}/rest/v1/reservations?id=eq.${reservationId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ payment_token: token }),
      });
    }
    await fetch(`${SUPABASE_URL}/rest/v1/reservations?id=eq.${reservationId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ payment_link_sent_at: new Date().toISOString() }),
    });

    const siteUrl = (Deno.env.get('SITE_URL') ?? 'https://ambassadeur-des-vtc.fr').replace(/\/$/, '');
    const link = `${siteUrl}/payer/${reservationId}?t=${token}&type=${type}`;
    const companyName = Deno.env.get('COMPANY_NAME') ?? "L'Ambassadeur des VTC";
    const label = type === 'deposit' ? 'acompte' : 'solde';

    await Promise.all([
      sendSms(
        client.phone,
        `${companyName} - Reglez votre ${label} (${amount}EUR) pour la resa ${reservation.booking_number} :\n${link}`
      ),
      sendEmail(
        client.email,
        `Lien de paiement — réservation ${reservation.booking_number}`,
        `<div style="font-family:Arial,sans-serif;font-size:15px;color:#111;max-width:480px;margin:0 auto">
          <h2 style="margin:0 0 12px">${companyName}</h2>
          <p>Bonjour ${client.first_name || ''},</p>
          <p>Voici le lien sécurisé pour régler ${type === 'deposit' ? "l'acompte" : 'le solde'} de votre réservation <strong>${reservation.booking_number}</strong> :</p>
          <p style="margin:20px 0"><a href="${link}" style="display:inline-block;background:#1a45f5;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold">Payer ${amount}€</a></p>
          <p style="color:#666;font-size:13px">Si le bouton ne fonctionne pas, copiez ce lien : ${link}</p>
        </div>`
      ),
    ]);

    return new Response(JSON.stringify({ ok: true, link }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
