import { useState, useEffect } from 'react';
import { Car, Calendar, MapPin, CreditCard, Star, LogOut, User, Clock, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { NavLink, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatCurrency, formatDate, reservationStatusLabel, reservationStatusColor } from '../lib/supabase';
import type { Reservation, Client } from '../lib/supabase';
import { clientSignOut, ensureClientRecord } from '../lib/clientAuth';

export default function ClientSpacePage() {
  const [session, setSession] = useState<{ id: string; email?: string; phone?: string } | null | 'loading'>('loading');
  const [client, setClient] = useState<Client | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reservations' | 'profile' | 'loyalty'>('reservations');

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!s) { setSession(null); return; }
      const sess = { id: s.user.id, email: s.user.email, phone: s.user.phone };
      setSession(sess);
      await ensureClientRecord(sess);

      // Load client data
      const { data: clientData } = await supabase
        .from('clients')
        .select('*')
        .eq('email', sess.email ?? '')
        .maybeSingle();
      setClient(clientData);

      // Load reservations
      if (clientData) {
        const { data: resData } = await supabase
          .from('reservations')
          .select('*')
          .eq('client_id', clientData.id)
          .order('ride_date', { ascending: false });
        setReservations(resData ?? []);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!s) setSession(null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === 'loading') {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-sapphire-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <Navigate to="/client/login" replace />;

  const upcoming = reservations.filter(r => ['pending','deposit_paid','confirmed'].includes(r.status));
  const past     = reservations.filter(r => ['completed','cancelled'].includes(r.status));

  return (
    <div className="min-h-screen bg-noir-950">
      {/* Nav */}
      <nav className="border-b border-white/5 bg-noir-950/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-white font-semibold">
            <div className="w-7 h-7 rounded-lg bg-sapphire-600 flex items-center justify-center">
              <Car className="w-3.5 h-3.5 text-white" />
            </div>
            L'Ambassadeur des VTC
          </NavLink>
          <div className="flex items-center gap-3">
            <span className="text-xs text-noir-400 hidden sm:block">{session.email ?? session.phone}</span>
            <button
              onClick={() => clientSignOut().then(() => setSession(null))}
              className="flex items-center gap-1.5 text-sm text-noir-400 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            Bonjour{client?.first_name ? ` ${client.first_name}` : ''} 👋
          </h1>
          <p className="text-noir-400 text-sm mt-1">Gérez vos réservations et votre compte</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass rounded-xl p-4 text-center border border-white/8">
            <p className="text-2xl font-bold text-sapphire-400">{client?.total_rides ?? 0}</p>
            <p className="text-xs text-noir-400 mt-1">Trajets</p>
          </div>
          <div className="glass rounded-xl p-4 text-center border border-white/8">
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(client?.total_spent ?? 0)}</p>
            <p className="text-xs text-noir-400 mt-1">Dépensé</p>
          </div>
          <div className="glass rounded-xl p-4 text-center border border-white/8">
            <p className="text-2xl font-bold text-amber-400">{client?.loyalty_points ?? 0}</p>
            <p className="text-xs text-noir-400 mt-1">Points</p>
          </div>
        </div>

        {/* Book again CTA */}
        <NavLink
          to="/#booking"
          className="flex items-center justify-between p-4 mb-6 rounded-xl bg-sapphire-600/15 border border-sapphire-500/20 hover:bg-sapphire-600/25 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Car className="w-5 h-5 text-sapphire-400" />
            <span className="text-white font-medium">Réserver un nouveau trajet</span>
          </div>
          <ChevronRight className="w-5 h-5 text-sapphire-400" />
        </NavLink>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-white/5 mb-6">
          {[
            { id: 'reservations', label: 'Mes réservations', icon: Calendar },
            { id: 'profile',      label: 'Mon profil',       icon: User },
            { id: 'loyalty',      label: 'Fidélité',         icon: Star },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-all ${
                activeTab === t.id ? 'text-sapphire-400 border-sapphire-500' : 'text-noir-400 border-transparent hover:text-white'
              }`}
            >
              <t.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Reservations tab */}
        {activeTab === 'reservations' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8"><div className="w-6 h-6 border-2 border-sapphire-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
            ) : reservations.length === 0 ? (
              <div className="glass rounded-xl p-10 text-center border border-white/8">
                <Calendar className="w-10 h-10 text-noir-600 mx-auto mb-3" />
                <p className="text-noir-400">Aucune réservation pour le moment</p>
                <NavLink to="/" className="inline-block mt-4 btn-primary text-sm px-5 py-2">Réserver maintenant</NavLink>
              </div>
            ) : (
              <>
                {upcoming.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">À venir</h3>
                    {upcoming.map(r => <ReservationCard key={r.id} r={r} />)}
                  </>
                )}
                {past.length > 0 && (
                  <>
                    <h3 className="text-sm font-semibold text-noir-500 uppercase tracking-wider mt-4">Historique</h3>
                    {past.map(r => <ReservationCard key={r.id} r={r} />)}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Profile tab */}
        {activeTab === 'profile' && (
          <div className="glass rounded-xl p-6 border border-white/8 space-y-4">
            <h3 className="font-semibold text-white">Mes informations</h3>
            {[
              { label: 'Email', value: session.email },
              { label: 'Téléphone', value: session.phone },
              { label: 'Prénom', value: client?.first_name },
              { label: 'Nom', value: client?.last_name },
            ].map(f => f.value ? (
              <div key={f.label} className="flex justify-between py-2 border-b border-white/5">
                <span className="text-noir-400 text-sm">{f.label}</span>
                <span className="text-white text-sm font-medium">{f.value}</span>
              </div>
            ) : null)}
            <p className="text-xs text-noir-500">Pour modifier vos informations, contactez-nous.</p>
          </div>
        )}

        {/* Loyalty tab */}
        {activeTab === 'loyalty' && (
          <div className="space-y-4">
            <div className="glass rounded-xl p-6 border border-amber-500/20">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-6 h-6 text-amber-400" />
                <div>
                  <p className="text-white font-bold text-lg">
                    {client?.loyalty_points ?? 0} points
                  </p>
                  <p className="text-xs text-noir-400">Statut : {
                    (client?.total_rides ?? 0) >= 15 ? '⭐ VIP' :
                    (client?.total_rides ?? 0) >= 5  ? '🥈 Fidèle' : '🆕 Nouveau'
                  }</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-noir-400">Réduction actuelle</span>
                  <span className="text-emerald-400 font-medium">
                    {(client?.total_rides ?? 0) >= 15 ? '10%' :
                     (client?.total_rides ?? 0) >= 5  ? '5%' : '0%'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/5">
                  <span className="text-noir-400">Points pour VIP</span>
                  <span className="text-white">{Math.max(0, 1000 - (client?.total_spent ?? 0))}€ de trajet restant</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-5 border border-white/8">
              <h4 className="font-medium text-white mb-3">Paliers de fidélité</h4>
              {[
                { name: 'Nouveau', rides: 0, discount: '0%', color: 'text-noir-300' },
                { name: 'Fidèle', rides: 5, discount: '5%', color: 'text-amber-300' },
                { name: 'VIP',    rides: 15, discount: '10%', color: 'text-emerald-300' },
              ].map(tier => (
                <div key={tier.name} className={`flex items-center justify-between py-2 text-sm ${
                  (client?.total_rides ?? 0) >= tier.rides ? tier.color : 'text-noir-600'
                }`}>
                  <span>{tier.name} (dès {tier.rides} trajets)</span>
                  <span className="font-semibold">{tier.discount}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReservationCard({ r }: { r: Reservation }) {
  return (
    <div className="glass rounded-xl p-4 border border-white/8 hover:border-sapphire-500/20 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-mono text-sapphire-400 text-xs">{r.booking_number}</p>
          <p className="text-white font-medium mt-0.5">{formatDate(r.ride_date)} à {r.ride_time}</p>
        </div>
        <span className={`badge ${reservationStatusColor[r.status]}`}>
          {reservationStatusLabel[r.status]}
        </span>
      </div>
      <div className="flex items-start gap-2 text-sm">
        <MapPin className="w-3.5 h-3.5 text-sapphire-400 shrink-0 mt-0.5" />
        <div className="text-noir-300 text-xs">
          <p>{r.departure_address}</p>
          <p className="mt-0.5">→ {r.arrival_address}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <span className="text-xs text-noir-400">{r.distance_km} km · {r.passengers} pax</span>
        <span className="font-bold text-white">{formatCurrency(r.total_price)}</span>
      </div>
      {r.status === 'pending' && r.deposit_amount > 0 && (
        <div className="mt-2 flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 rounded-lg px-3 py-2">
          <AlertCircle className="w-3.5 h-3.5" />
          Acompte en attente : {formatCurrency(r.deposit_amount)}
        </div>
      )}
      {r.status === 'deposit_paid' && (
        <div className="mt-2 flex items-center gap-2 text-xs text-emerald-300 bg-emerald-500/10 rounded-lg px-3 py-2">
          <CheckCircle className="w-3.5 h-3.5" />
          Acompte payé — solde à régler : {formatCurrency(r.total_price - r.deposit_amount)}
        </div>
      )}
    </div>
  );
}
