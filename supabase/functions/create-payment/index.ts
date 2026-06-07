import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const {
      amount,
      currency = 'EUR',
      reservationId,
      bookingNumber,
      type,
      clientEmail,
      clientName,
    } = await req.json();

    const apiKey      = Deno.env.get('SUMUP_API_KEY');
    const merchantCode = Deno.env.get('SUMUP_MERCHANT_CODE');

    if (!apiKey)       throw new Error('SUMUP_API_KEY not set in Edge Function secrets');
    if (!merchantCode) throw new Error('SUMUP_MERCHANT_CODE not set in Edge Function secrets');

    const checkoutRef = `${bookingNumber}-${type}-${Date.now()}`;
    const description = `Safir VTC — ${type === 'deposit' ? 'Acompte' : 'Solde'} résa ${bookingNumber}`;

    const body: Record<string, unknown> = {
      checkout_reference: checkoutRef,
      amount: parseFloat(Number(amount).toFixed(2)),
      currency: currency.toUpperCase(),
      merchant_code: merchantCode,
      description,
    };
    if (clientEmail) body.pay_to_email = clientEmail;

    const res = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message ?? `SumUp error ${res.status}`);
    }

    return new Response(
      JSON.stringify({
        checkoutId: data.id,
        checkoutRef,
        reservationId,
      }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } }
    );
  }
});
