import { supabase } from './supabase';

const SESSION_KEY = 'ambassadeur_vtc_auth';

const isSupabaseConfigured = () => {
  const url = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
  return url.startsWith('https://') && !url.includes('your-project');
};

export function isAuthenticated(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export async function login(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const adminEmail    = (import.meta.env.VITE_ADMIN_EMAIL    as string) ?? 'admin@ambassadeur-vtc.fr';
  const adminPassword = (import.meta.env.VITE_ADMIN_PASSWORD as string) ?? 'admin123';

  // Vérification locale d'abord (toujours disponible)
  if (email === adminEmail && password === adminPassword) {
    sessionStorage.setItem(SESSION_KEY, '1');
    // Aussi connecter Supabase Auth si disponible (pour les RLS)
    if (isSupabaseConfigured()) {
      supabase.auth.signInWithPassword({ email, password }).catch(() => {});
    }
    return { ok: true };
  }

  // Fallback Supabase Auth (si compte différent)
  if (isSupabaseConfigured()) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      sessionStorage.setItem(SESSION_KEY, '1');
      return { ok: true };
    }
  }

  return { ok: false, error: 'Email ou mot de passe incorrect' };
}

export async function logout(): Promise<void> {
  sessionStorage.removeItem(SESSION_KEY);
  if (isSupabaseConfigured()) {
    try { await supabase.auth.signOut(); } catch {}
  }
}