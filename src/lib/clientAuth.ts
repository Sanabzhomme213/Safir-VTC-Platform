import { supabase } from './supabase';

export type ClientAuthMethod = 'email' | 'phone';

export interface ClientSession {
  id: string;
  email?: string;
  phone?: string;
}

export async function getClientSession(): Promise<ClientSession | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? undefined,
    phone: session.user.phone ?? undefined,
  };
}

const APP_URL = (import.meta.env.VITE_APP_URL as string) || 'https://ambassadeur-des-vtc.fr';

export async function sendMagicLink(email: string): Promise<{ ok: boolean; error?: string }> {
  const origin = window.location.hostname === 'localhost' ? APP_URL : window.location.origin;
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/#/client/dashboard`,
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function sendSmsOtp(phone: string): Promise<{ ok: boolean; error?: string }> {
  // Format phone to E.164
  const formatted = formatPhone(phone);
  if (!formatted) return { ok: false, error: 'Numéro de téléphone invalide' };

  const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function verifySmsOtp(phone: string, token: string): Promise<{ ok: boolean; error?: string }> {
  const formatted = formatPhone(phone);
  if (!formatted) return { ok: false, error: 'Numéro invalide' };

  const { error } = await supabase.auth.verifyOtp({
    phone: formatted,
    token,
    type: 'sms',
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function clientSignOut(): Promise<void> {
  await supabase.auth.signOut();
}

// Format French phone numbers to E.164
function formatPhone(phone: string): string | null {
  const clean = phone.replace(/[\s\-\.]/g, '');
  if (clean.startsWith('+')) return clean;
  if (clean.startsWith('0') && clean.length === 10) return '+33' + clean.slice(1);
  if (clean.startsWith('33') && clean.length === 11) return '+' + clean;
  return null;
}

// Create or link a client record when they first authenticate
export async function ensureClientRecord(session: ClientSession): Promise<void> {
  const { data } = await supabase
    .from('clients')
    .select('id')
    .eq('email', session.email ?? '')
    .maybeSingle();

  if (!data) {
    // Create a minimal client record
    await supabase.from('clients').insert({
      first_name: '',
      last_name: '',
      email: session.email ?? '',
      phone: session.phone ?? '',
      status: 'new',
      total_spent: 0,
      total_rides: 0,
      loyalty_points: 0,
      notes: '',
    });
  }
}
