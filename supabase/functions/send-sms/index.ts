import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { to, text } = await req.json();

    const apiKey    = Deno.env.get('VONAGE_API_KEY');
    const apiSecret = Deno.env.get('VONAGE_API_SECRET');
    const from      = Deno.env.get('VONAGE_FROM') ?? 'SafirVTC';

    if (!apiKey || !apiSecret) throw new Error('VONAGE_API_KEY / VONAGE_API_SECRET non configurés');

    // Formatage numéro → E.164 sans '+'
    const toFormatted = to.replace(/[\s\-\+\.]/g, '').replace(/^0/, '33');

    const res = await fetch('https://rest.nexmo.com/sms/json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key:    apiKey,
        api_secret: apiSecret,
        from,
        to:   toFormatted,
        text,
        type: 'unicode', // Supporte les accents français
      }),
    });

    const data = await res.json();
    const msg  = data.messages?.[0];

    if (msg?.status !== '0') {
      throw new Error(`Vonage error: ${msg?.['error-text'] ?? 'Erreur inconnue'}`);
    }

    return new Response(
      JSON.stringify({ ok: true, messageId: msg['message-id'] }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
});
