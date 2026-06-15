import { useState, useEffect } from 'react';
import {
  Car, Calendar, MapPin, CreditCard, Star, LogOut, User, Clock,
  CheckCircle, AlertCircle, ChevronRight, Phone, Mail, Home,
  ArrowRight, Shield, Zap, Gift,
} from 'lucide-react';
import { NavLink, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  formatCurrency, formatDate, reservationStatusLabel, reservationStatusColor,
  generateBookingNumber,
} from '../lib/supabase';
import type { Reservation, Client } from '../lib/supabase';
import { clientSignOut, ensureClientRecord } from '../lib/clientAuth';
import { sendEmail, buildConfirmationEmail } from '../lib/emailService';
import { notifyReservationCreated } from '../lib/smsService';

type Tab = 'home' | 'reservations' | 'profile' | 'loyalty';

export default function ClientSpacePage() {
  const [session, setSession] = useState<{ id: string; email?: string; phone?: string } | null | 'loading'>('loading');
  const [client, setClient] = useState<Client | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [bookingCreated, setBookingCreated] = useState(false);

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

  const tabs = [
    { id: 'home' as Tab, label: 'Accueil', icon: Home },
    { id: 'reservations' as Tab, label: 'Courses', icon: Calendar },
    { id: 'loyalty' as Tab, label: 'Fidélité', icon: Star },
    { id: 'profile' as Tab, label: 'Profil', icon: User },
  ];

  return (
    <div className="min-h-screen bg-noir-950 flex flex-col">
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
              <div className="grid grid-cols-3 gap-2.5">
                <div className="glass rounded-2xl p-4 text-center border border-white/8">
                  <p className="text-2xl font-bold text-sapphire-400">{completedCount}</p>
                  <p className="text-[11px] text-noir-500 mt-1 uppercase tracking-wide">Trajets</p>
                </div>
                <div className="glass rounded-2xl p-4 text-center border border-white/8">
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(client?.total_spent ?? 0)}</p>
                  <p className="text-[11px] text-noir-500 mt-1 uppercase tracking-wide">Dépensé</p>
                </div>
                <div className="glass rounded-2xl p-4 text-center border border-amber-500/15">
                  <p className="text-2xl font-bold text-amber-400">{client?.loyalty_points ?? 0}</p>
                  <p className="text-[11px] text-noir-500 mt-1 uppercase tracking-wide">Points</p>
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
                  { icon: Gift, label: 'Fidélité', action: () => setActiveTab('loyalty') },
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
                      <div className="space-y-3">{past.map(r => <ReservationCard key={r.id} r={r} past />)}</div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* LOYALTY TAB */}
          {activeTab === 'loyalty' && (
            <div className="space-y-4 pb-2">
              <h2 className="text-xl font-bold text-white pt-2">Programme fidélité</h2>

              {/* Status card */}
              <div className="rounded-2xl bg-gradient-to-br from-amber-600/20 to-amber-800/10 border border-amber-500/25 p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                    <Star className="w-7 h-7 text-amber-400 fill-amber-400/30" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-white">{client?.loyalty_points ?? 0}</p>
                    <p className="text-amber-400 text-sm">points fidélité</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <p className="text-amber-300 text-sm font-medium">
                    Statut : {completedCount >= 15 ? '⭐ VIP' : completedCount >= 5 ? '🥈 Fidèle' : '🆕 Nouveau'}
                  </p>
                </div>
              </div>

              {/* Tiers */}
              <div className="glass rounded-2xl border border-white/8 overflow-hidden">
                <div className="px-5 py-4 border-b border-white/5">
                  <p className="font-semibold text-white">Paliers de récompense</p>
                </div>
                {[
                  { name: '🆕 Nouveau', rides: 0,  discount: '0%',  color: 'text-noir-300' },
                  { name: '🥈 Fidèle',  rides: 5,  discount: '5%',  color: 'text-amber-300' },
                  { name: '⭐ VIP',     rides: 15, discount: '10%', color: 'text-emerald-300' },
                ].map(tier => {
                  const active = completedCount >= tier.rides;
                  const isCurrent = tier.rides === (completedCount >= 15 ? 15 : completedCount >= 5 ? 5 : 0);
                  return (
                    <div key={tier.name} className={`flex items-center justify-between px-5 py-4 border-b border-white/5 last:border-0 ${active ? '' : 'opacity-40'}`}>
                      <div>
                        <p className={`font-medium ${isCurrent ? 'text-white' : tier.color}`}>{tier.name}</p>
                        <p className="text-xs text-noir-500 mt-0.5">dès {tier.rides} trajet{tier.rides > 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-noir-500'}`}>
                          {tier.discount}
                        </span>
                        {isCurrent && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="glass rounded-2xl p-4 border border-white/6">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-4 h-4 text-sapphire-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-noir-400 leading-relaxed">
                    <span className="text-white font-medium">1€ dépensé = 1 point.</span> Les points sont crédités automatiquement après chaque trajet terminé. La réduction s'applique sur votre prochain trajet.
                  </p>
                </div>
              </div>
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
    </div>
  );
}

function ReservationCard({ r, past = false }: { r: Reservation; past?: boolean }) {
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
          Acompte en attente : {formatCurrency(r.deposit_amount)}
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
