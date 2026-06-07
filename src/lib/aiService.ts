export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Tu es l'assistant IA de L'Ambassadeur des VTC, une société de transport VTC premium dans le Var (Toulon, Hyères, Saint-Tropez) et la Côte d'Azur.
Tu aides le gérant à :
- Générer des devis et calculer des prix (tarif : 1,80€/km, min 25€, nuit +20%, aller-retour -10%)
- Rédiger des pages SEO optimisées pour les villes desservies
- Répondre aux clients de façon professionnelle
- Créer des publications Google Business attractives
- Rédiger des emails marketing efficaces
- Gérer sa plateforme (factures, réservations, fidélité)

Réponds toujours en français, de façon concise, professionnelle et actionnelle. Utilise le markdown pour structurer tes réponses.`;

async function callOpenAI(messages: ChatMessage[], apiKey: string): Promise<string> {
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
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw new Error(err?.error?.message ?? `OpenAI error ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

// ── Mode démo : réponses intelligentes sans API ───────────────────────────────
function detectIntent(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('devis') || t.includes('prix') || t.includes('tarif')) return 'quote';
  if (t.includes('seo') || t.includes('page') || t.includes('référencement')) return 'seo';
  if (t.includes('répondre') || t.includes('client') || t.includes('message')) return 'client';
  if (t.includes('google business') || t.includes('publication') || t.includes('post')) return 'google';
  if (t.includes('email') || t.includes('campagne') || t.includes('newsletter')) return 'marketing';
  return 'general';
}

function smartDemoResponse(userMessage: string): string {
  switch (detectIntent(userMessage)) {
    case 'quote':
      return `Je vais calculer un devis personnalisé.\n\nPour un tarif précis, merci de m'indiquer :\n\n• **Adresse de départ**\n• **Adresse d'arrivée**\n• **Date et heure**\n• **Nombre de passagers** et bagages\n• **Type** : aller simple, aller-retour ou mise à disposition\n\nTarif : **1,80€/km**, minimum **25€**.`;

    case 'seo': {
      const villes = ['Toulon','Hyères','Saint-Tropez','Fréjus','Draguignan','Nice','Cannes'];
      const ville = villes.find(v => userMessage.toLowerCase().includes(v.toLowerCase())) ?? 'votre ville';
      return `**Page SEO pour "${ville}"**\n\n**Title :** Chauffeur VTC à ${ville} - Service Premium | L'Ambassadeur des VTC\n\n**H1 :** Votre Chauffeur Privé à ${ville}\n\n**Contenu :** L'Ambassadeur des VTC propose un service VTC haut de gamme à ${ville}. Nos chauffeurs assurent vos transferts aéroport, gare et déplacements professionnels.\n\n**FAQ :** Prix d'un VTC à ${ville} ? Disponible 24h/24 ? Comment réserver ?`;
    }

    case 'client':
      return `**Modèle de réponse professionnelle**\n\n---\nBonjour [Prénom],\n\nMerci pour votre message. Nous sommes ravis de vous accompagner pour votre trajet.\n\nPour confirmer votre réservation, pourriez-vous nous préciser la date, l'heure et l'adresse de prise en charge ?\n\nCordialement,\n*L'équipe L'Ambassadeur des VTC*\n\n---`;

    case 'google':
      return `**Publication Google Business**\n\n🚗 **L'Ambassadeur des VTC — Votre chauffeur privé sur la Côte d'Azur**\n\n✅ Ponctualité garantie\n✅ Véhicule premium climatisé\n✅ Suivi de vols en temps réel\n✅ Disponible 24h/24 — 7j/7\n\n📍 Toulon · Hyères · Saint-Tropez · Nice\n\n👉 Réservez en ligne → [lien]`;

    case 'marketing':
      return `**Email marketing — Clients fidèles**\n\n**Objet :** 🎁 -10% sur votre prochain trajet\n\n---\nCher(e) [Prénom],\n\nCode promo exclusif : **FIDELE10** — 10% de réduction, valable 30 jours.\n\n[RÉSERVER]\n\n*L'équipe L'Ambassadeur des VTC*`;

    default:
      return `Bonjour ! Je suis **l'assistant IA Ambassadeur**.\n\nJe peux vous aider avec :\n📋 Devis · 🌐 SEO · 💬 Réponses clients · 📢 Google Business · 📧 Email marketing\n\nComment puis-je vous aider ?`;
  }
}

function getOpenAiKey(): string {
  // 1. Runtime key from settings (localStorage)
  try {
    const saved = localStorage.getItem('ambassadeur_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.openai_key && parsed.openai_key.startsWith('sk-')) return parsed.openai_key;
    }
  } catch {}
  // 2. Build-time key from .env.local
  return (import.meta.env.VITE_OPENAI_KEY as string) ?? '';
}

export async function sendAiMessage(messages: ChatMessage[]): Promise<string> {
  // 1. Essai OpenAI direct (clé dans settings ou .env.local)
  const openaiKey = getOpenAiKey();
  if (openaiKey && openaiKey.startsWith('sk-')) {
    try {
      return await callOpenAI(messages, openaiKey);
    } catch (e) {
      console.warn('OpenAI error:', e);
    }
  }

  // 2. Fallback : Edge Function Supabase (si configurée)
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
  const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '';
  if (supabaseUrl.startsWith('https://') && !supabaseUrl.includes('your-project') && supabaseKey.startsWith('eyJ')) {
    try {
      const { supabase } = await import('./supabase');
      const { data, error } = await supabase.functions.invoke('ai-chat', { body: { messages } });
      if (error) throw error;
      return (data as { content: string }).content;
    } catch (e) {
      console.warn('Edge Function unavailable:', e);
    }
  }

  // 3. Réponse intégrée
  await new Promise(r => setTimeout(r, 700 + Math.random() * 400));
  return smartDemoResponse(messages[messages.length - 1]?.content ?? '');
}
