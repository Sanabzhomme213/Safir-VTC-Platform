import { supabase } from './supabase';

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

export async function signInWithPassword(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: translateError(error.message) };
  return { ok: true };
}

export async function signUpWithPassword(
  email: string,
  password: string,
  firstName = '',
  lastName = '',
): Promise<{ ok: boolean; error?: string; needsConfirmation?: boolean }> {
  const APP_URL = (import.meta.env.VITE_APP_URL as string) || 'https://ambassadeur-des-vtc.fr';
  const origin = window.location.hostname === 'localhost' ? APP_URL : window.location.origin;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/#/client/dashboard`,
      data: { first_name: firstName, last_name: lastName },
    },
  });
  if (error) return { ok: false, error: translateError(error.message) };

  // If session is null after signUp, email confirmation is required
  const needsConfirmation = !data.session;
  return { ok: true, needsConfirmation };
}

export async function resetPassword(email: string): Promise<{ ok: boolean; error?: string }> {
  const APP_URL = (import.meta.env.VITE_APP_URL as string) || 'https://ambassadeur-des-vtc.fr';
  const origin = window.location.hostname === 'localhost' ? APP_URL : window.location.origin;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/#/client/dashboard`,
  });
  if (error) return { ok: false, error: translateError(error.message) };
  return { ok: true };
}

export async function clientSignOut(): Promise<void> {
  await supabase.auth.signOut();
}

function translateError(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'Email ou mot de passe incorrect.';
  if (msg.includes('Email not confirmed')) return 'Confirmez votre email avant de vous connecter.';
  if (msg.includes('User already registered')) return 'Un compte existe déjà avec cet email.';
  if (msg.includes('Password should be at least')) return 'Le mot de passe doit contenir au moins 6 caractères.';
  if (msg.includes('Unable to validate email')) return 'Adresse email invalide.';
  return msg;
}

// Create or link a client record when they first authenticate
export async function ensureClientRecord(session: ClientSession): Promise<void> {
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('email', session.email ?? '')
    .maybeSingle();

  if (!existing) {
    // Fetch user metadata (first_name / last_name set during signUp)
    const { data: { user } } = await supabase.auth.getUser();
    const meta = user?.user_metadata ?? {};
    await supabase.from('clients').insert({
      first_name: meta.first_name ?? '',
      last_name: meta.last_name ?? '',
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
