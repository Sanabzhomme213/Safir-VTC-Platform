import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { reservationId, amount } = await req.json();
    if (!reservationId) throw new Error('reservationId requis');

    // Only confirm a reservation that is still pending — avoids re-processing
    // an already-confirmed booking if the client retries after a network blip.
    const updateRes = await fetch(
      `${SUPABASE_URL}/rest/v1/reservations?id=eq.${reservationId}&status=eq.pending`,
      {
        method: 'PATCH',
        headers: { ...headers, Prefer: 'return=representation' },
        body: JSON.stringify({ status: 'deposit_paid', updated_at: new Date().toISOString() }),
      }
    );
    const rows = await updateRes.json();
    if (!updateRes.ok) throw new Error(rows?.message ?? 'Erreur mise à jour réservation');

    const reservation = Array.isArray(rows) ? rows[0] : rows;
    if (!reservation) {
      // Reservation was already confirmed (or doesn't exist) — fetch current state instead of failing
      const getRes = await fetch(`${SUPABASE_URL}/rest/v1/reservations?id=eq.${reservationId}&limit=1`, { headers });
      const existing = await getRes.json();
      if (!existing?.[0]) throw new Error('Réservation introuvable');
      return new Response(JSON.stringify({ reservation: existing[0] }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // Log the payment
    await fetch(`${SUPABASE_URL}/rest/v1/payments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        reservation_id: reservationId,
        amount: amount ?? reservation.deposit_amount,
        method: 'card',
        type: 'deposit',
        status: 'completed',
      }),
    });

    return new Response(JSON.stringify({ reservation }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
