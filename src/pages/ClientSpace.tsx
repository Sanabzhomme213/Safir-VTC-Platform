import { useState, useEffect } from 'react';
import {
  Car, Calendar, MapPin, Star, LogOut, User, Clock,
  CheckCircle, AlertCircle, ChevronRight, Phone, Mail, Home,
  ArrowRight, Shield, RotateCcw, Bookmark, Plus, X, Trash2, Loader2, Sparkles,
} from 'lucide-react';
import { NavLink, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  formatCurrency, formatDate, reservationStatusLabel, reservationStatusColor,
  generateBookingNumber,
} from '../lib/supabase';
import type { Reservation, Client, SavedAddress } from '../lib/supabase';
import { clientSignOut, ensureClientRecord } from '../lib/clientAuth';
import { sendEmail, buildConfirmationEmail } from '../lib/emailService';
import { sendSms, notifyReservationCreated } from '../lib/smsService';
import { calculatePrice } from '../lib/distance';
import AddressAutocomplete from '../components/AddressAutocomplete';
import ConfettiBurst from '../components/ConfettiBurst';

type Tab = 'home' | 'reservations' | 'profile';

function loadPublicSettings() {
  try { return JSON.parse(localStorage.getItem('ambassadeur_settings') ?? '{}'); } catch { return {}; }
}

const TIERS = [
  { name: 'Nouveau', rides: 0 },
  { name: 'Fidèle', rides: 5 },
  { name: 'VIP', rides: 15 },
] as const;

export default function ClientSpacePage() {
  const [session, setSession] = useState<{ id: string; email?: string; phone?: string } | null | 'loading'>('loading');
  const [client, setClient] = useState<Client | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [bookingCreated, setBookingCreated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [confetti, setConfetti] = useState(false);

  // Quick rebook
  const [rebook, setRebook] = useState<Reservation | null>(null);
  const [rebookDate, setRebookDate] = useState('');
  const [rebookTime, setRebookTime] = useState('');
  const [rebookSubmitting, setRebookSubmitting] = useState(false);
  const [rebookError, setRebookError] = useState('');

  // Saved addresses
  const [addingAddr, setAddingAddr] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('');
  const [newAddrValue, setNewAddrValue] = useState('');
  const [newAddrCoords, setNewAddrCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [savingAddr, setSavingAddr] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };
  const fireConfetti = () => { setConfetti(true); setTimeout(() => setConfetti(false), 1200); };

  useEffect(() => {
    async function init() {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!s) { setSession(null); setLoading(false); return; }
        const sess = { id: s.user.id, email: s.user.email, phone: s.user.phone };
        setSession(sess);
        await ensureClientRecord(sess);

        let clientData: Client | null = null;
        if (sess.email) {
          const { data } = await supabase.from('clients').select('*').eq('email', sess.email).maybeSingle();
          clientData = data;
        }
        if (!clientData && sess.phone) {
          const { data } = await supabase.from('clients').select('*').eq('phone', sess.phone).maybeSingle();
          clientData = data;
        }
        setClient(clientData);

        if (clientData) {
          const { data: resData } = await supabase
            .from('reservations')
            .select('*')
            .eq('client_id', clientData.id)
            .order('ride_date', { ascending: false });
          setReservations(resData ?? []);

          const pendingRaw = localStorage.getItem('pending_booking');
          if (pendingRaw) {
            try {
              const pending = JSON.parse(pendingRaw);
              localStorage.removeItem('pending_booking');
              const newRes = {
                booking_number: generateBookingNumber(),
                client_id: clientData.id,
                departure_address: pending.departure,
                departure_lat: pending.depLat ?? null,
                departure_lng: pending.depLng ?? null,
                arrival_address: pending.arrival,
                arrival_lat: pending.arrLat ?? null,
                arrival_lng: pending.arrLng ?? null,
                ride_date: pending.date,
                ride_time: pending.time,
                passengers: parseInt(pending.passengers) || 1,
                luggage: parseInt(pending.luggage) || 0,
                ride_type: (pending.type as 'one_way' | 'round_trip' | 'disposal') || 'one_way',
                distance_km: pending.distanceKm ?? 0,
                duration_min: 0,
                base_price: pending.priceEstimate ?? 0,
                total_price: pending.priceEstimate ?? 0,
                deposit_amount: Math.round((pending.priceEstimate ?? 0) * 0.2),
                deposit_percentage: 20,
                status: 'pending' as const,
                is_quote: pending.isQuote ?? false,
                notes: '',
                flight_number: pending.flightNumber ?? null,
                flight_status: null,
                return_date: pending.returnDate ?? null,
                return_time: pending.returnTime ?? null,
              };
              const { data: created, error } = await supabase.from('reservations').insert(newRes).select().single();
              if (!error && created) {
                setReservations(prev => [created, ...prev]);
                setBookingCreated(true);
                setActiveTab('reservations');
                if (clientData.email) {
                  try {
                    const settings = JSON.parse(localStorage.getItem('ambassadeur_settings') ?? '{}');
                    const html = buildConfirmationEmail({
                      clientName: [clientData.first_name, clientData.last_name].filter(Boolean).join(' ') || clientData.email,
                      bookingNumber: created.booking_number,
                      date: created.ride_date,
                      time: created.ride_time,
                      from: created.departure_address,
                      to: created.arrival_address,
                      amount: `${created.total_price}€`,
                      companyName: settings.company_name || "L'Ambassadeur des VTC",
                      companyPhone: settings.company_phone || '+33 6 33 82 83 94',
                    });
                    await sendEmail(
                      { to: clientData.email, subject: `Confirmation réservation ${created.booking_number}`, html },
                      import.meta.env.VITE_SUPABASE_URL as string ?? '',
                    );
                  } catch {}
                }
                try {
                  const settings = JSON.parse(localStorage.getItem('ambassadeur_settings') ?? '{}');
                  await notifyReservationCreated(created, clientData, settings.company_name || "L'Ambassadeur des VTC", settings.company_phone || '+33 6 33 82 83 94');
                } catch {}
              }
            } catch {}
          }
        }
      } catch (e) {
        console.error('ClientSpace init error:', e);
      } finally {
        setLoading(false);
      }
    }
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!s) setSession(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === 'loading') {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-sapphire-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-noir-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!session) return <Navigate to="/client/login" replace />;

  const upcoming = reservations.filter(r => ['pending', 'deposit_paid', 'confirmed'].includes(r.status));
  const past = reservations.filter(r => ['completed', 'cancelled'].includes(r.status));
  const completedCount = reservations.filter(r => r.status === 'completed').length;

  const openRebook = (r: Reservation) => {
    const next = new Date(r.ride_date);
    next.setDate(next.getDate() + 7);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (next < today) next.setTime(today.getTime() + 24 * 60 * 60 * 1000);
    setRebookDate(next.toISOString().split('T')[0]);
    setRebookTime(r.ride_time?.slice(0, 5) || '10:00');
    setRebookError('');
    setRebook(r);
  };

  const confirmRebook = async () => {
    if (!rebook || !client) return;
    if (!rebookDate || !rebookTime) { setRebookError('Choisissez une date et une heure'); return; }
    setRebookSubmitting(true);
    setRebookError('');
    try {
      const s = loadPublicSettings();
      const price = calculatePrice(rebook.distance_km, rebook.ride_type, {
        pricing_per_km: parseFloat(s.pricing_per_km) || 1.8,
        pricing_min: parseFloat(s.pricing_min) || 25,
        pricing_round_trip_discount: parseFloat(s.pricing_round_trip_discount) || 10,
        pricing_disposal_hourly: parseFloat(s.pricing_disposal_hourly) || 45,
      }) || rebook.total_price;

      const { data, error } = await supabase.functions.invoke('create-booking', {
        body: {
          firstName: client.first_name, lastName: client.last_name,
          email: client.email || null, phone: client.phone,
          departure: rebook.departure_address, departureLat: rebook.departure_lat, departureLng: rebook.departure_lng,
          arrival: rebook.arrival_address, arrivalLat: rebook.arrival_lat, arrivalLng: rebook.arrival_lng,
          date: rebookDate, time: rebookTime,
          passengers: rebook.passengers, luggage: rebook.luggage, type: rebook.ride_type,
          distanceKm: rebook.distance_km, durationMin: rebook.duration_min, priceEstimate: price,
          flightNumber: null, returnDate: null, returnTime: null, isQuote: false,
        },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setReservations(prev => [data.reservation, ...prev]);
      setRebook(null);
      fireConfetti();
      showToast(`Trajet réservé pour le ${formatDate(rebookDate)} ! Un lien de paiement vous sera envoyé.`);
      setActiveTab('reservations');

      // Best-effort confirmation, mirrors the public booking flow
      try {
        const s = loadPublicSettings();
        const companyName = s.company_name || "L'Ambassadeur des VTC";
        const companyPhone = s.company_phone || '+33 6 33 82 83 94';
        if (client.email) {
          const html = buildConfirmationEmail({
            clientName: [client.first_name, client.last_name].filter(Boolean).join(' ') || client.email,
            bookingNumber: data.reservation.booking_number,
            date: data.reservation.ride_date, time: data.reservation.ride_time,
            from: data.reservation.departure_address, to: data.reservation.arrival_address,
            amount: `${data.reservation.total_price}€`, companyName, companyPhone,
          });
          sendEmail({ to: client.email, subject: `Confirmation réservation ${data.reservation.booking_number}`, html }, import.meta.env.VITE_SUPABASE_URL as string ?? '');
        }
        if (client.phone) {
          sendSms(client.phone, `${companyName} - Reservation enregistree (N° ${data.reservation.booking_number}).\nIl reste a regler l'acompte de ${data.reservation.deposit_amount}€ pour la confirmer.\nContact : ${companyPhone}`);
        }
      } catch { /* best-effort */ }
    } catch (e) {
      setRebookError(e instanceof Error ? e.message : 'Une erreur est survenue');
    } finally {
      setRebookSubmitting(false);
    }
  };

  const addSavedAddress = async () => {
    if (!client || !newAddrLabel.trim() || !newAddrValue.trim()) return;
    setSavingAddr(true);
    try {
      const entry: SavedAddress = {
        id: `addr-${Date.now()}`,
        label: newAddrLabel.trim(),
        address: newAddrValue.trim(),
        lat: newAddrCoords?.lat ?? null,
        lng: newAddrCoords?.lng ?? null,
      };
      const next = [...(client.saved_addresses ?? []), entry];
      const { error } = await supabase.from('clients').update({ saved_addresses: next }).eq('id', client.id);
      if (error) throw error;
      setClient({ ...client, saved_addresses: next });
      setNewAddrLabel(''); setNewAddrValue(''); setNewAddrCoords(null);
      setAddingAddr(false);
      showToast('Adresse enregistrée');
    } catch {
      showToast("Erreur lors de l'enregistrement");
    } finally {
      setSavingAddr(false);
    }
  };

  const deleteSavedAddress = async (id: string) => {
    if (!client) return;
    const next = (client.saved_addresses ?? []).filter(a => a.id !== id);
    try {
      const { error } = await supabase.from('clients').update({ saved_addresses: next }).eq('id', client.id);
      if (error) throw error;
      setClient({ ...client, saved_addresses: next });
    } catch {
      showToast('Erreur lors de la suppression');
    }
  };

  const bookFromAddress = (a: SavedAddress) => {
    try {
      localStorage.setItem('prefill_departure', JSON.stringify({ label: a.address, lat: a.lat, lng: a.lng }));
    } catch {}
    window.location.href = '/';
  };

  const tabs = [
    { id: 'home' as Tab, label: 'Accueil', icon: Home },
    { id: 'reservations' as Tab, label: 'Courses', icon: Calendar },
    { id: 'profile' as Tab, label: 'Profil', icon: User },
  ];

  const currentTierIdx = completedCount >= 15 ? 2 : completedCount >= 5 ? 1 : 0;
  const nextTier = TIERS[currentTierIdx + 1];
  const tierFloor = TIERS[currentTierIdx].rides;
  const tierProgress = nextTier ? Math.min(100, Math.round(((completedCount - tierFloor) / (nextTier.rides - tierFloor)) * 100)) : 100;

  return (
    <div className="min-h-screen bg-noir-950 flex flex-col">
      {confetti && <ConfettiBurst />}

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-900/95 border border-emerald-600/50 text-emerald-200 text-sm font-medium shadow-2xl animate-slide-down max-w-[90%] text-center">
          <CheckCircle className="w-4 h-4 shrink-0" />
          {toast}
        </div>
      )}

      {/* Top nav */}
      <nav className="border-b border-white/5 bg-noir-950/90 backdrop-blur-xl sticky top-0 z-30"
           style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sapphire-600 flex items-center justify-center shadow-lg shadow-sapphire-600/30">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm">L'Ambassadeur</span>
          </NavLink>
          <button
            onClick={() => clientSignOut().then(() => setSession(null))}
            className="flex items-center gap-1.5 text-sm text-noir-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Content — padded bottom for tab bar */}
      <div className="flex-1 overflow-y-auto pb-safe-xl">
        <div className="max-w-xl mx-auto px-4 pt-4 space-y-4">

          {/* Booking created banner */}
          {bookingCreated && (
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 animate-fade-in">
              <CheckCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">Réservation créée ! Confirmation par email en cours.</p>
            </div>
          )}

          {/* HOME TAB */}
          {activeTab === 'home' && (
            <div className="space-y-4 pb-2">
              {/* Greeting */}
              <div className="pt-2">
                <h1 className="text-2xl font-bold text-white">
                  Bonjour{client?.first_name ? `, ${client.first_name}` : ''} 👋
                </h1>
                <p className="text-noir-400 text-sm mt-1">Bienvenue dans votre espace client</p>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="glass rounded-2xl p-4 text-center border border-white/8">
                  <p className="text-2xl font-bold text-sapphire-400">{completedCount}</p>
                  <p className="text-[11px] text-noir-500 mt-1 uppercase tracking-wide">Trajets</p>
                </div>
                <div className="glass rounded-2xl p-4 text-center border border-white/8">
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(client?.total_spent ?? 0)}</p>
                  <p className="text-[11px] text-noir-500 mt-1 uppercase tracking-wide">Dépensé</p>
                </div>
              </div>

              {/* Book new ride CTA — hero card */}
              <NavLink
                to="/"
                className="block rounded-2xl bg-gradient-to-br from-sapphire-600 to-sapphire-800 p-5 shadow-2xl shadow-sapphire-900/50 hover:from-sapphire-500 hover:to-sapphire-700 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-bold text-lg">Réserver un trajet</p>
                    <p className="text-sapphire-200 text-sm mt-0.5">Aller simple · Aller-retour · Mise à dispo</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-sapphire-200 text-sm font-medium">
                  Réserver maintenant <ArrowRight className="w-4 h-4" />
                </div>
              </NavLink>

              {/* Status progress — light gamification */}
              <div className="glass rounded-2xl p-4 border border-white/8">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <p className="text-xs font-semibold text-white uppercase tracking-wide">
                      Statut {TIERS[currentTierIdx].name}
                    </p>
                  </div>
                  {nextTier && <p className="text-[11px] text-noir-500">{nextTier.rides - completedCount} trajet{nextTier.rides - completedCount > 1 ? 's' : ''} avant {nextTier.name}</p>}
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-sapphire-500 transition-all duration-700 ease-out"
                    style={{ width: `${nextTier ? tierProgress : 100}%` }}
                  />
                </div>
                {!nextTier && <p className="text-[11px] text-emerald-400 mt-1.5">⭐ Statut maximum atteint, merci de votre confiance !</p>}
              </div>

              {/* Saved addresses — quick rebook */}
              {(client?.saved_addresses?.length ?? 0) > 0 && (
                <div>
                  <p className="text-sm font-semibold text-white uppercase tracking-wide mb-2">Vos adresses</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {client!.saved_addresses!.map(a => (
                      <button
                        key={a.id}
                        onClick={() => bookFromAddress(a)}
                        className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-sapphire-500/30 transition-all active:scale-95"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-sapphire-400 shrink-0" />
                        <span className="text-white text-xs font-medium whitespace-nowrap">{a.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming rides */}
              {upcoming.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-white uppercase tracking-wide">Prochaines courses</p>
                    <button onClick={() => setActiveTab('reservations')} className="text-xs text-sapphire-400">Tout voir</button>
                  </div>
                  <div className="space-y-3">
                    {upcoming.slice(0, 2).map(r => <ReservationCard key={r.id} r={r} />)}
                  </div>
                </div>
              )}

              {/* Quick links */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: Phone, label: 'Appeler', action: () => window.open('tel:+33633828394') },
                  { icon: Mail, label: 'Email', action: () => window.open('mailto:contact@ambassadeur-vtc.fr') },
                  { icon: Shield, label: 'Garanties', action: () => setActiveTab('profile') },
                ].map(({ icon: Icon, label, action }) => (
                  <button key={label} onClick={action}
                    className="glass rounded-2xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors border border-white/6 active:scale-[0.97]">
                    <div className="w-9 h-9 rounded-xl bg-sapphire-600/15 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-sapphire-400" />
                    </div>
                    <span className="text-white text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* RESERVATIONS TAB */}
          {activeTab === 'reservations' && (
            <div className="space-y-4 pb-2">
              <h2 className="text-xl font-bold text-white pt-2">Mes réservations</h2>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="glass rounded-2xl p-4 border border-white/8 h-32 shimmer" />
                  ))}
                </div>
              ) : reservations.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center border border-white/8">
                  <Calendar className="w-10 h-10 text-noir-600 mx-auto mb-3" />
                  <p className="text-white font-semibold mb-1">Aucune réservation</p>
                  <p className="text-noir-400 text-sm mb-5">Réservez votre premier trajet premium</p>
                  <NavLink to="/" className="inline-block btn-primary text-sm px-6">Réserver maintenant</NavLink>
                </div>
              ) : (
                <>
                  {upcoming.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-sapphire-400 uppercase tracking-widest mb-2">À venir · {upcoming.length}</p>
                      <div className="space-y-3">{upcoming.map(r => <ReservationCard key={r.id} r={r} />)}</div>
                    </div>
                  )}
                  {past.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-noir-500 uppercase tracking-widest mb-2 mt-4">Historique · {past.length}</p>
                      <div className="space-y-3">{past.map(r => <ReservationCard key={r.id} r={r} past onRebook={openRebook} />)}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-4 pb-2">
              <h2 className="text-xl font-bold text-white pt-2">Mon profil</h2>

              {/* Avatar + name */}
              <div className="glass rounded-2xl p-5 border border-white/8 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sapphire-500 to-sapphire-700 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-sapphire-900/50">
                  {client?.first_name?.[0]?.toUpperCase() ?? session?.email?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">
                    {client?.first_name && client?.last_name
                      ? `${client.first_name} ${client.last_name}`
                      : client?.first_name ?? 'Client'}
                  </p>
                  <p className="text-noir-400 text-sm">{session?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-sapphire-600/15 text-sapphire-400 text-xs">
                    {completedCount >= 15 ? '⭐ VIP' : completedCount >= 5 ? '🥈 Fidèle' : '🆕 Nouveau'}
                  </span>
                </div>
              </div>

              {/* Info fields */}
              <div className="glass rounded-2xl border border-white/8 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                  <p className="font-semibold text-white">Mes informations</p>
                </div>
                {[
                  { label: 'Prénom', value: client?.first_name, icon: User },
                  { label: 'Nom', value: client?.last_name, icon: User },
                  { label: 'Email', value: session?.email, icon: Mail },
                  { label: 'Téléphone', value: session?.phone, icon: Phone },
                ].filter(f => f.value).map(f => (
                  <div key={f.label} className="flex items-center gap-4 px-5 py-3.5 border-b border-white/5 last:border-0">
                    <f.icon className="w-4 h-4 text-noir-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-noir-500 mb-0.5">{f.label}</p>
                      <p className="text-white text-sm font-medium truncate">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Saved addresses */}
              <div className="glass rounded-2xl border border-white/8 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                  <p className="font-semibold text-white">Mes adresses</p>
                  <button
                    onClick={() => setAddingAddr(a => !a)}
                    className="flex items-center gap-1 text-xs text-sapphire-400 hover:text-sapphire-300 font-medium"
                  >
                    {addingAddr ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {addingAddr ? 'Annuler' : 'Ajouter'}
                  </button>
                </div>

                {addingAddr && (
                  <div className="px-5 py-4 border-b border-white/5 space-y-3 bg-white/[0.02]">
                    <input
                      value={newAddrLabel}
                      onChange={e => setNewAddrLabel(e.target.value)}
                      placeholder="Nom (ex: Domicile, Bureau...)"
                      className="input-field text-sm"
                    />
                    <AddressAutocomplete
                      value={newAddrValue}
                      onChange={setNewAddrValue}
                      onSelect={r => { setNewAddrValue(r.label); setNewAddrCoords(r.lat ? { lat: r.lat, lng: r.lng } : null); }}
                      placeholder="Adresse..."
                    />
                    <button
                      onClick={addSavedAddress}
                      disabled={savingAddr || !newAddrLabel.trim() || !newAddrValue.trim()}
                      className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {savingAddr ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bookmark className="w-4 h-4" />}
                      Enregistrer
                    </button>
                  </div>
                )}

                {(client?.saved_addresses?.length ?? 0) === 0 && !addingAddr ? (
                  <div className="px-5 py-6 text-center">
                    <p className="text-noir-500 text-sm">Aucune adresse enregistrée</p>
                    <p className="text-noir-600 text-xs mt-1">Gagnez du temps sur vos prochaines réservations</p>
                  </div>
                ) : (
                  client?.saved_addresses?.map(a => (
                    <div key={a.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 last:border-0">
                      <div className="w-9 h-9 rounded-xl bg-sapphire-600/15 flex items-center justify-center shrink-0">
                        <Bookmark className="w-4 h-4 text-sapphire-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">{a.label}</p>
                        <p className="text-noir-500 text-xs truncate">{a.address}</p>
                      </div>
                      <button onClick={() => deleteSavedAddress(a.id)} className="text-noir-600 hover:text-red-400 transition-colors shrink-0 p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Contact */}
              <div className="glass rounded-2xl border border-white/8 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                  <p className="font-semibold text-white">Nous contacter</p>
                </div>
                <a href="tel:+33633828394"
                  className="flex items-center gap-4 px-5 py-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors active:bg-white/5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Appeler</p>
                    <p className="text-noir-400 text-xs">+33 6 33 82 83 94</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-noir-600 ml-auto" />
                </a>
                <a href="mailto:contact@ambassadeur-vtc.fr"
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors active:bg-white/5">
                  <div className="w-10 h-10 rounded-xl bg-sapphire-500/15 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-sapphire-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Email</p>
                    <p className="text-noir-400 text-xs">contact@ambassadeur-vtc.fr</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-noir-600 ml-auto" />
                </a>
              </div>

              {/* Guarantees */}
              <div className="glass rounded-2xl p-5 border border-white/8 space-y-3">
                <p className="font-semibold text-white mb-1">Nos garanties</p>
                {[
                  { icon: Clock, text: 'Ponctualité garantie — remboursement si retard de notre fait' },
                  { icon: Shield, text: 'Véhicule assuré tous risques — confort & sécurité' },
                  { icon: Star, text: 'Satisfaction ou remboursement — votre satisfaction est notre priorité' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-start gap-3">
                    <Icon className="w-4 h-4 text-sapphire-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-noir-300">{text}</p>
                  </div>
                ))}
              </div>

              {/* Logout */}
              <button
                onClick={() => clientSignOut().then(() => setSession(null))}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-medium hover:bg-red-500/15 transition-colors active:scale-[0.98]"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Tab Bar — native mobile nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-noir-950/95 backdrop-blur-xl border-t border-white/8 bottom-bar">
        <div className="max-w-xl mx-auto flex">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-all"
              >
                <div className={`w-6 h-6 flex items-center justify-center transition-all ${active ? 'scale-110' : ''}`}>
                  <Icon className={`w-5 h-5 ${active ? 'text-sapphire-400' : 'text-noir-500'}`} />
                </div>
                <span className={`text-[10px] font-medium transition-colors ${active ? 'text-sapphire-400' : 'text-noir-600'}`}>
                  {tab.label}
                </span>
                {active && (
                  <div className="absolute bottom-[calc(100%_+_1px)] w-8 h-0.5 bg-sapphire-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick rebook modal */}
      {rebook && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-noir-900 border border-white/10 rounded-2xl max-w-md w-full shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-sapphire-400" />
                Refaire ce trajet
              </h2>
              <button onClick={() => setRebook(null)} className="text-noir-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-sapphire-500 shrink-0" />
                  <p className="text-white truncate">{rebook.departure_address.split(',')[0]}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <p className="text-white truncate">{rebook.arrival_address.split(',')[0]}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-noir-400 mb-1.5">Date</label>
                  <input type="date" value={rebookDate} min={new Date().toISOString().split('T')[0]}
                    onChange={e => setRebookDate(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="block text-xs text-noir-400 mb-1.5">Heure</label>
                  <input type="time" value={rebookTime} onChange={e => setRebookTime(e.target.value)} className="input-field" />
                </div>
              </div>

              {rebookError && (
                <p className="text-xs text-red-400 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{rebookError}</p>
              )}

              <button
                onClick={confirmRebook}
                disabled={rebookSubmitting}
                className="w-full btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {rebookSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                {rebookSubmitting ? 'Réservation...' : 'Confirmer le trajet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReservationCard({ r, past = false, onRebook }: { r: Reservation; past?: boolean; onRebook?: (r: Reservation) => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className={`glass rounded-2xl border overflow-hidden transition-all ${past ? 'border-white/6 opacity-80' : 'border-white/10 hover:border-sapphire-500/20'}`}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-sapphire-400 text-xs font-bold">{r.booking_number}</span>
              <span className={`badge ${reservationStatusColor[r.status]}`}>{reservationStatusLabel[r.status]}</span>
            </div>
            <p className="text-white font-semibold mt-1">{formatDate(r.ride_date)}{r.ride_time ? ` · ${r.ride_time.slice(0, 5)}` : ''}</p>
          </div>
          <p className="text-white font-bold text-lg ml-3 shrink-0">
            {r.total_price > 0 ? formatCurrency(r.total_price) : 'Devis'}
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-sapphire-500 shrink-0" />
            <p className="text-noir-300 truncate">{r.departure_address.split(',')[0]}</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
            <p className="text-noir-300 truncate">{r.arrival_address.split(',')[0]}</p>
          </div>
        </div>
      </div>

      {/* Status messages */}
      {r.status === 'pending' && r.deposit_amount > 0 && (
        <div className="mx-4 mb-3 flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 rounded-xl px-3 py-2.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          Acompte en attente : {formatCurrency(r.deposit_amount)} — un lien de paiement vous sera envoyé par SMS et email
        </div>
      )}
      {r.status === 'deposit_paid' && (
        <div className="mx-4 mb-3 flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 rounded-xl px-3 py-2.5">
          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
          Acompte payé · solde : {formatCurrency(r.total_price - r.deposit_amount)}
        </div>
      )}
      {r.status === 'confirmed' && (
        <div className="mx-4 mb-3 flex items-center gap-2 text-xs text-sapphire-300 bg-sapphire-500/10 rounded-xl px-3 py-2.5">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          Confirmée — votre chauffeur sera ponctuel
        </div>
      )}
      {r.status === 'completed' && onRebook && (
        <div className="mx-4 mb-3">
          <button
            onClick={e => { e.stopPropagation(); onRebook(r); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sapphire-600/10 border border-sapphire-500/20 text-sapphire-400 text-sm font-medium hover:bg-sapphire-600/20 transition-colors active:scale-[0.98]"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Refaire ce trajet
          </button>
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-2" onClick={e => e.stopPropagation()}>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {r.distance_km > 0 && (
              <div className="bg-white/[0.02] rounded-xl p-2.5">
                <p className="text-noir-500 mb-0.5">Distance</p>
                <p className="text-white font-medium">{r.distance_km} km</p>
              </div>
            )}
            <div className="bg-white/[0.02] rounded-xl p-2.5">
              <p className="text-noir-500 mb-0.5">Passagers</p>
              <p className="text-white font-medium">{r.passengers} personne{r.passengers > 1 ? 's' : ''}</p>
            </div>
            {r.flight_number && (
              <div className="bg-sapphire-600/5 border border-sapphire-500/15 rounded-xl p-2.5">
                <p className="text-noir-500 mb-0.5">N° Vol</p>
                <p className="text-sapphire-400 font-mono font-bold">{r.flight_number}</p>
              </div>
            )}
            <div className="bg-white/[0.02] rounded-xl p-2.5">
              <p className="text-noir-500 mb-0.5">Acompte</p>
              <p className="text-white font-medium">{formatCurrency(r.deposit_amount)}</p>
            </div>
          </div>
          {r.notes && (
            <div className="bg-white/[0.02] rounded-xl p-3 text-xs">
              <p className="text-noir-500 mb-0.5">Notes</p>
              <p className="text-white">{r.notes}</p>
            </div>
          )}
          <a href="tel:+33633828394"
            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-sapphire-600/10 border border-sapphire-500/20 text-sapphire-400 text-sm font-medium hover:bg-sapphire-600/20 transition-colors">
            <Phone className="w-4 h-4" /> Contacter le chauffeur
          </a>
        </div>
      )}

      {/* Expand toggle */}
      <div className="flex items-center justify-center py-2 border-t border-white/5">
        <MapPin className="w-3 h-3 text-noir-700" />
      </div>
    </div>
  );
}
