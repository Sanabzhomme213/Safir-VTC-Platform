import React, {
  createContext, useContext, useState, useEffect,
  useCallback, useMemo
} from 'react';
import { supabase, generateBookingNumber } from './supabase';
import type {
  Client, Reservation, Payment, SeoPage,
  EmailLog, ConciergeOffer, LoyaltyRule, PromoCode
} from './supabase';
import {
  mockClients, mockReservations, mockPayments, mockSeoPages,
  mockEmailLogs, mockConciergeOffers, mockLoyaltyRules, mockPromoCodes
} from './mockData';

export { generateBookingNumber };

const isSupabaseReady = (): boolean => {
  const url = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
  const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '';
  // URL must be a real Supabase URL; key must be a JWT (eyJ...) — not a placeholder
  return (
    url.startsWith('https://') &&
    !url.includes('your-project') &&
    key.startsWith('eyJ')
  );
};

const devDemo = (import.meta.env.VITE_DEV_DEMO as string) === 'true';

// In-memory store — populated with mock data only in dev/demo mode
const store = {
  clients: devDemo ? [...mockClients] : [],
  reservations: devDemo ? [...mockReservations] : [],
  payments: devDemo ? [...mockPayments] : [],
  seoPages: devDemo ? [...mockSeoPages] : [],
  emailLogs: devDemo ? [...mockEmailLogs] : [],
  conciergeOffers: devDemo ? [...mockConciergeOffers] : [],
  loyaltyRules: devDemo ? [...mockLoyaltyRules] : [],
  promoCodes: devDemo ? [...mockPromoCodes] : [],
};

export interface AppSettings {
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  pricing_per_km: number;
  pricing_min: number;
  pricing_round_trip_discount: number;
  pricing_disposal_hourly: number;
  deposit_default: number;
  sumup_merchant_code: string;
  resend_from_email: string;
  resend_from_name: string;
  google_maps_key: string;
  aviationstack_key: string;
  google_review_url: string;
  openai_key: string;
}

export const defaultSettings: AppSettings = {
  company_name: "L'Ambassadeur des VTC",
  company_email: 'contact@ambassadeur-vtc.fr',
  company_phone: '+33 6 33 82 83 94',
  company_address: 'Toulon, Var, France',
  pricing_per_km: 1.8,
  pricing_min: 25,
  pricing_round_trip_discount: 10,
  pricing_disposal_hourly: 45,
  deposit_default: 20,
  sumup_merchant_code: '',
  resend_from_email: 'noreply@ambassadeur-vtc.fr',
  resend_from_name: "L'Ambassadeur des VTC",
  google_maps_key: '',
  aviationstack_key: '',
  google_review_url: '',
  openai_key: '',
};

type DataContextValue = {
  clients: Client[];
  reservations: Reservation[];
  payments: Payment[];
  seoPages: SeoPage[];
  emailLogs: EmailLog[];
  conciergeOffers: ConciergeOffer[];
  loyaltyRules: LoyaltyRule[];
  promoCodes: PromoCode[];
  settings: AppSettings;
  loading: boolean;
  supabaseConnected: boolean;

  addClient: (c: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<Client>;
  updateClient: (id: string, c: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  addReservation: (r: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>) => Promise<Reservation>;
  updateReservation: (id: string, r: Partial<Reservation>) => Promise<void>;
  deleteReservation: (id: string) => Promise<void>;

  saveSeoPage: (page: Partial<SeoPage> & { slug: string }) => Promise<void>;
  deleteSeoPage: (id: string) => Promise<void>;

  addPromoCode: (c: Omit<PromoCode, 'id' | 'created_at' | 'current_uses'>) => Promise<void>;
  updatePromoCode: (id: string, d: Partial<PromoCode>) => Promise<void>;
  deletePromoCode: (id: string) => Promise<void>;

  updateLoyaltyRule: (id: string, d: Partial<LoyaltyRule>) => Promise<void>;

  addConciergeOffer: (o: Omit<ConciergeOffer, 'id' | 'created_at'>) => Promise<void>;
  updateConciergeOffer: (id: string, d: Partial<ConciergeOffer>) => Promise<void>;
  deleteConciergeOffer: (id: string) => Promise<void>;

  addEmailLog: (l: Omit<EmailLog, 'id' | 'created_at'>) => Promise<void>;

  updateSettings: (s: Partial<AppSettings>) => Promise<void>;
};

const DataContext = createContext<DataContextValue>(null as unknown as DataContextValue);
export const useData = () => useContext(DataContext);

function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem('ambassadeur_settings');
    if (saved) return { ...defaultSettings, ...JSON.parse(saved) };
  } catch {}
  return { ...defaultSettings };
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const connected = isSupabaseReady();

  const [clients, setClients] = useState<Client[]>(store.clients);
  const [reservations, setReservations] = useState<Reservation[]>(store.reservations);
  const [payments] = useState<Payment[]>(store.payments);
  const [seoPages, setSeoPages] = useState<SeoPage[]>(store.seoPages);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>(store.emailLogs);
  const [conciergeOffers, setConciergeOffers] = useState<ConciergeOffer[]>(store.conciergeOffers);
  const [loyaltyRules, setLoyaltyRules] = useState<LoyaltyRule[]>(store.loyaltyRules);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(store.promoCodes);
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!connected) return;
    setLoading(true);
    Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('reservations').select('*').order('created_at', { ascending: false }),
      supabase.from('seo_pages').select('*').order('created_at', { ascending: false }),
      supabase.from('email_logs').select('*').order('created_at', { ascending: false }),
      supabase.from('concierge_offers').select('*').order('created_at', { ascending: false }),
      supabase.from('loyalty_rules').select('*').order('min_rides'),
      supabase.from('promo_codes').select('*').order('created_at', { ascending: false }),
      supabase.from('settings').select('*'),
    ]).then(([c, r, s, e, co, lr, pc, st]) => {
      if (c.data?.length) setClients(c.data);
      if (r.data?.length) setReservations(r.data);
      if (s.data?.length) setSeoPages(s.data);
      if (e.data?.length) setEmailLogs(e.data);
      if (co.data?.length) setConciergeOffers(co.data);
      if (lr.data?.length) setLoyaltyRules(lr.data);
      if (pc.data?.length) setPromoCodes(pc.data);
      if (st.data?.length) {
        const merged: Record<string, unknown> = {};
        for (const item of st.data) {
          try { merged[item.key] = JSON.parse(item.value); } catch { merged[item.key] = item.value; }
        }
        setSettings(prev => ({ ...prev, ...merged }));
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [connected]);

  /* ── Clients ─────────────────────────────────────────────── */
  const addClient = useCallback(async (c: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> => {
    const now = new Date().toISOString();
    if (connected) {
      const { data, error } = await supabase.from('clients').insert(c).select().single();
      if (error) throw error;
      setClients(p => [data, ...p]);
      return data;
    }
    const n: Client = { ...c, id: `mock-${Date.now()}`, created_at: now, updated_at: now };
    store.clients = [n, ...store.clients];
    setClients(store.clients);
    return n;
  }, [connected]);

  const updateClient = useCallback(async (id: string, d: Partial<Client>) => {
    const now = new Date().toISOString();
    if (connected) {
      const { error } = await supabase.from('clients').update({ ...d, updated_at: now }).eq('id', id);
      if (error) throw error;
    } else {
      store.clients = store.clients.map(c => c.id === id ? { ...c, ...d, updated_at: now } : c);
    }
    setClients(p => p.map(c => c.id === id ? { ...c, ...d, updated_at: now } : c));
  }, [connected]);

  const deleteClient = useCallback(async (id: string) => {
    if (connected) {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
    } else {
      store.clients = store.clients.filter(c => c.id !== id);
    }
    setClients(p => p.filter(c => c.id !== id));
  }, [connected]);

  /* ── Reservations ────────────────────────────────────────── */
  const addReservation = useCallback(async (r: Omit<Reservation, 'id' | 'created_at' | 'updated_at'>): Promise<Reservation> => {
    const now = new Date().toISOString();
    if (connected) {
      const { data, error } = await supabase.from('reservations').insert(r).select().single();
      if (error) throw error;
      setReservations(p => [data, ...p]);
      return data;
    }
    const n: Reservation = { ...r, id: `mock-${Date.now()}`, created_at: now, updated_at: now };
    store.reservations = [n, ...store.reservations];
    setReservations(store.reservations);
    return n;
  }, [connected]);

  const updateReservation = useCallback(async (id: string, d: Partial<Reservation>) => {
    const now = new Date().toISOString();
    if (connected) {
      const { error } = await supabase.from('reservations').update({ ...d, updated_at: now }).eq('id', id);
      if (error) throw error;
    } else {
      store.reservations = store.reservations.map(r => r.id === id ? { ...r, ...d, updated_at: now } : r);
    }
    setReservations(p => p.map(r => r.id === id ? { ...r, ...d, updated_at: now } : r));
  }, [connected]);

  const deleteReservation = useCallback(async (id: string) => {
    if (connected) {
      const { error } = await supabase.from('reservations').delete().eq('id', id);
      if (error) throw error;
    } else {
      store.reservations = store.reservations.filter(r => r.id !== id);
    }
    setReservations(p => p.filter(r => r.id !== id));
  }, [connected]);

  /* ── SEO Pages ───────────────────────────────────────────── */
  const saveSeoPage = useCallback(async (page: Partial<SeoPage> & { slug: string }) => {
    const now = new Date().toISOString();
    const existing = seoPages.find(p => p.id === page.id || p.slug === page.slug);
    if (connected) {
      if (existing) {
        const { error } = await supabase.from('seo_pages').update({ ...page, updated_at: now }).eq('id', existing.id);
        if (error) throw error;
        setSeoPages(p => p.map(s => s.id === existing.id ? { ...s, ...page, updated_at: now } : s));
      } else {
        const { data, error } = await supabase.from('seo_pages').insert({ ...page, is_published: page.is_published ?? false, faq: page.faq ?? [] }).select().single();
        if (error) throw error;
        setSeoPages(p => [...p, data]);
      }
      return;
    }
    if (existing) {
      store.seoPages = store.seoPages.map(s => s.id === existing.id ? { ...s, ...page, updated_at: now } : s);
      setSeoPages(store.seoPages);
    } else {
      const n: SeoPage = {
        id: `mock-${Date.now()}`,
        page_type: page.page_type ?? 'city',
        title: page.title ?? '',
        meta_description: page.meta_description ?? '',
        h1: page.h1 ?? '',
        content: page.content ?? '',
        faq: page.faq ?? [],
        is_published: page.is_published ?? false,
        created_at: now,
        updated_at: now,
        ...page,
      };
      store.seoPages = [...store.seoPages, n];
      setSeoPages(store.seoPages);
    }
  }, [connected, seoPages]);

  const deleteSeoPage = useCallback(async (id: string) => {
    if (connected) {
      const { error } = await supabase.from('seo_pages').delete().eq('id', id);
      if (error) throw error;
    } else {
      store.seoPages = store.seoPages.filter(p => p.id !== id);
    }
    setSeoPages(p => p.filter(s => s.id !== id));
  }, [connected]);

  /* ── Promo Codes ─────────────────────────────────────────── */
  const addPromoCode = useCallback(async (c: Omit<PromoCode, 'id' | 'created_at' | 'current_uses'>) => {
    const now = new Date().toISOString();
    if (connected) {
      const { data, error } = await supabase.from('promo_codes').insert({ ...c, current_uses: 0 }).select().single();
      if (error) throw error;
      setPromoCodes(p => [data, ...p]);
      return;
    }
    const n: PromoCode = { ...c, id: `mock-${Date.now()}`, current_uses: 0, created_at: now };
    store.promoCodes = [n, ...store.promoCodes];
    setPromoCodes(store.promoCodes);
  }, [connected]);

  const updatePromoCode = useCallback(async (id: string, d: Partial<PromoCode>) => {
    if (connected) {
      const { error } = await supabase.from('promo_codes').update(d).eq('id', id);
      if (error) throw error;
    } else {
      store.promoCodes = store.promoCodes.map(c => c.id === id ? { ...c, ...d } : c);
    }
    setPromoCodes(p => p.map(c => c.id === id ? { ...c, ...d } : c));
  }, [connected]);

  const deletePromoCode = useCallback(async (id: string) => {
    if (connected) {
      const { error } = await supabase.from('promo_codes').delete().eq('id', id);
      if (error) throw error;
    } else {
      store.promoCodes = store.promoCodes.filter(c => c.id !== id);
    }
    setPromoCodes(p => p.filter(c => c.id !== id));
  }, [connected]);

  /* ── Loyalty Rules ───────────────────────────────────────── */
  const updateLoyaltyRule = useCallback(async (id: string, d: Partial<LoyaltyRule>) => {
    if (connected) {
      const { error } = await supabase.from('loyalty_rules').update(d).eq('id', id);
      if (error) throw error;
    } else {
      store.loyaltyRules = store.loyaltyRules.map(r => r.id === id ? { ...r, ...d } : r);
    }
    setLoyaltyRules(p => p.map(r => r.id === id ? { ...r, ...d } : r));
  }, [connected]);

  /* ── Concierge Offers ────────────────────────────────────── */
  const addConciergeOffer = useCallback(async (o: Omit<ConciergeOffer, 'id' | 'created_at'>) => {
    const now = new Date().toISOString();
    if (connected) {
      const { data, error } = await supabase.from('concierge_offers').insert(o).select().single();
      if (error) throw error;
      setConciergeOffers(p => [data, ...p]);
      return;
    }
    const n: ConciergeOffer = { ...o, id: `mock-${Date.now()}`, created_at: now };
    store.conciergeOffers = [n, ...store.conciergeOffers];
    setConciergeOffers(store.conciergeOffers);
  }, [connected]);

  const updateConciergeOffer = useCallback(async (id: string, d: Partial<ConciergeOffer>) => {
    if (connected) {
      const { error } = await supabase.from('concierge_offers').update(d).eq('id', id);
      if (error) throw error;
    } else {
      store.conciergeOffers = store.conciergeOffers.map(o => o.id === id ? { ...o, ...d } : o);
    }
    setConciergeOffers(p => p.map(o => o.id === id ? { ...o, ...d } : o));
  }, [connected]);

  const deleteConciergeOffer = useCallback(async (id: string) => {
    if (connected) {
      const { error } = await supabase.from('concierge_offers').delete().eq('id', id);
      if (error) throw error;
    } else {
      store.conciergeOffers = store.conciergeOffers.filter(o => o.id !== id);
    }
    setConciergeOffers(p => p.filter(o => o.id !== id));
  }, [connected]);

  /* ── Email Logs ──────────────────────────────────────────── */
  const addEmailLog = useCallback(async (l: Omit<EmailLog, 'id' | 'created_at'>) => {
    const now = new Date().toISOString();
    if (connected) {
      const { data, error } = await supabase.from('email_logs').insert(l).select().single();
      if (error) throw error;
      setEmailLogs(p => [data, ...p]);
      return;
    }
    const n: EmailLog = { ...l, id: `mock-${Date.now()}`, created_at: now };
    store.emailLogs = [n, ...store.emailLogs];
    setEmailLogs(store.emailLogs);
  }, [connected]);

  /* ── Settings ────────────────────────────────────────────── */
  const updateSettings = useCallback(async (s: Partial<AppSettings>) => {
    const merged = { ...settings, ...s };
    setSettings(merged);
    localStorage.setItem('ambassadeur_settings', JSON.stringify(merged));
    if (connected) {
      const upserts = Object.entries(s).map(([key, value]) => ({
        key,
        value: JSON.stringify(value),
        updated_at: new Date().toISOString(),
      }));
      await supabase.from('settings').upsert(upserts, { onConflict: 'key' });
    }
  }, [connected, settings]);

  const value = useMemo<DataContextValue>(() => ({
    clients, reservations, payments, seoPages, emailLogs,
    conciergeOffers, loyaltyRules, promoCodes, settings,
    loading, supabaseConnected: connected,
    addClient, updateClient, deleteClient,
    addReservation, updateReservation, deleteReservation,
    saveSeoPage, deleteSeoPage,
    addPromoCode, updatePromoCode, deletePromoCode,
    updateLoyaltyRule,
    addConciergeOffer, updateConciergeOffer, deleteConciergeOffer,
    addEmailLog,
    updateSettings,
  }), [
    clients, reservations, payments, seoPages, emailLogs,
    conciergeOffers, loyaltyRules, promoCodes, settings,
    loading, connected,
    addClient, updateClient, deleteClient,
    addReservation, updateReservation, deleteReservation,
    saveSeoPage, deleteSeoPage,
    addPromoCode, updatePromoCode, deletePromoCode,
    updateLoyaltyRule,
    addConciergeOffer, updateConciergeOffer, deleteConciergeOffer,
    addEmailLog,
    updateSettings,
  ]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}