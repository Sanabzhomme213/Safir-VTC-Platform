import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { flightIata } = await req.json();
    const apiKey = Deno.env.get('AVIATIONSTACK_KEY');

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'AVIATIONSTACK_KEY not set' }), {
        status: 400, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    // AeroDataBox via RapidAPI (HTTPS, 500 appels/mois gratuits)
    const today = new Date().toISOString().split('T')[0];
    const url = `https://aerodatabox.p.rapidapi.com/flights/number/${encodeURIComponent(flightIata)}/${today}`;

    const res = await fetch(url, {
      headers: {
        'X-RapidAPI-Key':  apiKey,
        'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com',
      },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ status: 'unknown' }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const data = await res.json();
    const flight = Array.isArray(data) ? data[0] : data;

    if (!flight) {
      return new Response(JSON.stringify({ status: 'unknown' }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const depScheduled = flight.departure?.scheduledTime?.local ?? flight.departure?.scheduledTime?.utc;
    const depActual    = flight.departure?.actualTime?.local    ?? flight.departure?.actualTime?.utc ?? depScheduled;
    const rawStatus    = flight.status ?? 'Unknown';

    const status =
      rawStatus === 'Arrived'            ? 'on_time'   :
      rawStatus === 'EnRoute'            ? 'on_time'   :
      rawStatus === 'Departed'           ? 'on_time'   :
      rawStatus === 'Scheduled'          ? 'on_time'   :
      rawStatus === 'Canceled'           ? 'cancelled' :
      rawStatus === 'Diverted'           ? 'delayed'   :
      rawStatus.includes('Delay')        ? 'delayed'   : 'unknown';

    const schedDate = depScheduled ? new Date(depScheduled) : null;
    const actDate   = depActual    ? new Date(depActual)    : null;
    const delayMinutes = schedDate && actDate
      ? Math.max(0, Math.round((actDate.getTime() - schedDate.getTime()) / 60000))
      : 0;

    return new Response(JSON.stringify({
      status,
      scheduledDeparture: depScheduled,
      actualDeparture:    depActual,
      airline:            flight.airline?.name ?? '',
      delayMinutes,
    }), { headers: { ...CORS, 'Content-Type': 'application/json' } });

  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
