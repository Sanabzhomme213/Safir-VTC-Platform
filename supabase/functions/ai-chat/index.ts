import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { messages } = await req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY not set in Supabase secrets');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 1024,
        messages: [
          {
            role: 'system',
            content: `Tu es l'assistant IA de Safir VTC, une société de transport VTC premium dans le Var (Toulon, Hyères, Saint-Tropez) et la Côte d'Azur.
Tu aides le gérant à :
- Générer des devis et calculer des prix (tarif : 1,80€/km, min 25€, nuit +20%, aller-retour -10%)
- Rédiger des pages SEO optimisées pour les villes desservies
- Répondre aux clients de façon professionnelle
- Créer des publications Google Business attractives
- Rédiger des emails marketing efficaces
- Gérer sa plateforme (factures, réservations, fidélité)

Réponds toujours en français, de façon concise, professionnelle et actionnelle. Utilise le markdown pour structurer tes réponses.`,
          },
          ...messages.map((m: { role: string; content: string }) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    return new Response(JSON.stringify({ content }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});
