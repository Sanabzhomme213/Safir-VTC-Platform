import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateBookingNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SAF-${y}${m}${d}-${rand}`;
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

    const body = await req.json();
    const {
      firstName, lastName, email, phone,
      departure, departureLat, departureLng,
      arrival, arrivalLat, arrivalLng,
      date, time, passengers, luggage, type,
      distanceKm, durationMin, priceEstimate,
      flightNumber, returnDate, returnTime, isQuote,
    } = body;

    if (!email && !phone) throw new Error('Email ou téléphone requis');
    if (!departure || !arrival || !date || !time) throw new Error('Informations de trajet manquantes');

    // 1) Find existing client by email, then phone
    let client: Record<string, unknown> | null = null;
    if (email) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/clients?email=eq.${encodeURIComponent(email)}&limit=1`, { headers });
      const rows = await r.json();
      if (Array.isArray(rows) && rows[0]) client = rows[0];
    }
    if (!client && phone) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/clients?phone=eq.${encodeURIComponent(phone)}&limit=1`, { headers });
      const rows = await r.json();
      if (Array.isArray(rows) && rows[0]) client = rows[0];
    }

    // 2) Create client if not found
    if (!client) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/clients`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=representation' },
        body: JSON.stringify({
          first_name: firstName ?? '',
          last_name: lastName ?? '',
          email: email ?? '',
          phone: phone ?? '',
          status: 'new',
          total_spent: 0,
          total_rides: 0,
          loyalty_points: 0,
          notes: '',
        }),
      });
      const rows = await r.json();
      if (!r.ok) throw new Error(rows?.message ?? 'Erreur création client');
      client = Array.isArray(rows) ? rows[0] : rows;
    }

    const clientId = (client as { id: string }).id;
    const price = priceEstimate ?? 0;

    // 3) Create reservation
    const reservationPayload = {
      booking_number: generateBookingNumber(),
      client_id: clientId,
      departure_address: departure,
      departure_lat: departureLat ?? null,
      departure_lng: departureLng ?? null,
      arrival_address: arrival,
      arrival_lat: arrivalLat ?? null,
      arrival_lng: arrivalLng ?? null,
      ride_date: date,
      ride_time: time,
      passengers: parseInt(passengers) || 1,
      luggage: parseInt(luggage) || 0,
      ride_type: (type as string) || 'one_way',
      distance_km: distanceKm ?? 0,
      duration_min: durationMin ?? 0,
      base_price: price,
      total_price: price,
      deposit_amount: Math.round(price * 0.2),
      deposit_percentage: 20,
      status: 'pending',
      is_quote: isQuote ?? false,
      notes: '',
      flight_number: flightNumber ?? null,
      flight_status: null,
      return_date: returnDate ?? null,
      return_time: returnTime ?? null,
    };

    const resRes = await fetch(`${SUPABASE_URL}/rest/v1/reservations`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify(reservationPayload),
    });
    const resRows = await resRes.json();
    if (!resRes.ok) throw new Error(resRows?.message ?? 'Erreur création réservation');
    const reservation = Array.isArray(resRows) ? resRows[0] : resRows;

    return new Response(JSON.stringify({ client, reservation }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
