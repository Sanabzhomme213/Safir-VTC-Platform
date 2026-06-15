import React, { useState, useEffect } from 'react';
import {
  Car, TrendingUp, BarChart3, CreditCard, FileText, UserPlus, Clock, CheckCircle,
  ArrowUpRight, Zap, Users, AlertTriangle, Plus, Calendar, ChevronRight,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatDate, reservationStatusLabel, reservationStatusColor } from '../lib/supabase';
import { useData } from '../lib/DataContext';
import { NavLink } from 'react-router-dom';

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div className="text-right">
      <p className="text-2xl font-bold text-white tabular-nums tracking-wider">{timeStr}</p>
      <p className="text-xs text-noir-400 capitalize mt-0.5">{dateStr}</p>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  sub?: string;
  trend?: 'up' | 'down' | null;
}

function StatCard({ icon: Icon, label, value, color, sub, trend }: StatCardProps) {
  return (
    <div className="stat-card animate-fade-in group hover:scale-[1.02] transition-transform duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
            trend === 'up' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
          }`}>
            <ArrowUpRight className={`w-3 h-3 ${trend === 'down' ? 'rotate-90' : ''}`} />
          </span>
        )}
      </div>
      <p className="text-noir-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-noir-500 mt-1">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { reservations, clients, payments, supabaseConnected } = useData();

  const today = new Date().toISOString().split('T')[0];

  const reservationsToday = reservations.filter(r => r.ride_date === today).length;

  const revenueToday = reservations
    .filter(r => r.ride_date === today && (r.status === 'completed' || r.status === 'deposit_paid'))
    .reduce((s, r) => s + r.total_price, 0);

  const currentMonth = today.slice(0, 7);
  const revenueMonth = reservations
    .filter(r => r.ride_date?.startsWith(currentMonth))
    .reduce((s, r) => s + r.total_price, 0);

  const depositsCollected = payments
    .filter(p => p.status === 'completed' && p.type === 'deposit')
    .reduce((s, p) => s + p.amount, 0);

  const pendingQuotes = reservations.filter(r => r.is_quote && r.status === 'pending').length;
  const newClients = clients.filter(c => c.status === 'new').length;
  const upcomingRides = reservations.filter(r => r.status === 'confirmed' || r.status === 'deposit_paid').length;
  const completedRides = reservations.filter(r => r.status === 'completed').length;

  const recentReservations = [...reservations]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 6);

  const clientMap = Object.fromEntries(
    clients.map(c => [c.id, `${c.first_name} ${c.last_name}`])
  );

  const chartData = (() => {
    const months: { month: string; revenue: number; reservations: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('fr-FR', { month: 'short' });
      const monthRes = reservations.filter(r => r.ride_date?.startsWith(key) && !r.is_quote);
      months.push({
        month: label.charAt(0).toUpperCase() + label.slice(1),
        revenue: Math.round(monthRes.reduce((s, r) => s + r.total_price, 0)),
        reservations: monthRes.length,
      });
    }
    return months;
  })();

  const tooltipStyle = {
    contentStyle: {
      background: 'rgba(10,10,25,.95)',
      border: '1px solid rgba(51,108,255,.3)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '12px',
    },
  };

  const showRLSWarning = supabaseConnected && reservations.length === 0 && clients.length === 0;

  return (
    <div className="space-y-6">
      {/* Header with live clock */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
            <Zap className="w-7 h-7 text-sapphire-400" />
            Tableau de bord
          </h1>
          <p className="text-noir-400">Bienvenue, <span className="text-white font-medium">Ambassadeur</span></p>
        </div>
        <LiveClock />
      </div>

      {/* RLS warning banner */}
      {showRLSWarning && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Les données ne s'affichent pas</p>
            <p className="text-amber-400/80">Supabase est connecté mais vide. Si vous avez des réservations, désactivez les règles RLS dans le Dashboard Supabase → chaque table → Disable RLS. Ou créez l'utilisateur admin dans Supabase Authentication avec le même email/mot de passe.</p>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Nouvelle réservation', icon: Plus, path: '/admin/reservations', color: 'from-sapphire-600 to-sapphire-700' },
          { label: 'Voir les clients', icon: Users, path: '/admin/clients', color: 'from-violet-600 to-violet-700' },
          { label: 'Agenda du jour', icon: Calendar, path: '/admin/reservations', color: 'from-emerald-600 to-emerald-700' },
          { label: 'Devis en attente', icon: FileText, path: '/admin/invoices', color: 'from-amber-600 to-amber-700' },
        ].map(({ label, icon: Icon, path, color }) => (
          <NavLink
            key={path + label}
            to={path}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r ${color} text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Car}         label="Réservations du jour"  value={reservationsToday}                 color="bg-sapphire-600/80" sub={reservationsToday === 0 ? 'Aucune course ce jour' : `${reservationsToday} course${reservationsToday > 1 ? 's' : ''}`} />
        <StatCard icon={TrendingUp}  label="CA du jour"            value={formatCurrency(revenueToday)}      color="bg-emerald-600/80"  trend={revenueToday > 0 ? 'up' : null} />
        <StatCard icon={BarChart3}   label="CA du mois"            value={formatCurrency(revenueMonth)}      color="bg-amber-600/80"    trend={revenueMonth > 0 ? 'up' : null} />
        <StatCard icon={CreditCard}  label="Acomptes encaissés"    value={formatCurrency(depositsCollected)} color="bg-cyan-600/80" />
        <StatCard icon={FileText}    label="Devis en attente"      value={pendingQuotes}                     color="bg-violet-600/80"   sub="À valider" />
        <StatCard icon={UserPlus}    label="Nouveaux clients"      value={newClients}                        color="bg-pink-600/80"     trend={newClients > 0 ? 'up' : null} />
        <StatCard icon={Clock}       label="Courses à venir"       value={upcomingRides}                     color="bg-indigo-600/80"   sub="Confirmées" />
        <StatCard icon={CheckCircle} label="Courses terminées"     value={completedRides}                    color="bg-teal-600/80"     trend={completedRides > 0 ? 'up' : null} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">Évolution du CA</h2>
            <span className="text-xs text-noir-500">6 derniers mois</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gCA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="rgba(51,108,255,.35)" />
                  <stop offset="95%" stopColor="rgba(51,108,255,.02)" />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="rgba(255,255,255,.15)" tick={{ fontSize: 11, fill: '#888' }} />
              <YAxis stroke="rgba(255,255,255,.15)" tick={{ fontSize: 11, fill: '#888' }} />
              <Tooltip {...tooltipStyle} formatter={(v) => formatCurrency(Number(v))} />
              <Area type="monotone" dataKey="revenue" stroke="rgb(51,108,255)" strokeWidth={2} fill="url(#gCA)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-white">Réservations par mois</h2>
            <span className="text-xs text-noir-500">6 derniers mois</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <XAxis dataKey="month" stroke="rgba(255,255,255,.15)" tick={{ fontSize: 11, fill: '#888' }} />
              <YAxis stroke="rgba(255,255,255,.15)" tick={{ fontSize: 11, fill: '#888' }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="reservations" fill="rgba(51,108,255,.7)" radius={[6,6,0,0]} stroke="rgb(51,108,255)" strokeWidth={1} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent reservations */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Car className="w-4 h-4 text-sapphire-400" />
            Dernières réservations
          </h2>
          <NavLink to="/admin/reservations" className="flex items-center gap-1 text-xs text-sapphire-400 hover:text-sapphire-300 transition-colors">
            Voir tout <ChevronRight className="w-3 h-3" />
          </NavLink>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Réservation', 'Client', 'Trajet', 'Date', 'Montant', 'Statut'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-noir-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentReservations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Car className="w-8 h-8 text-noir-700 mx-auto mb-2" />
                    <p className="text-noir-500 text-sm">Aucune réservation pour le moment</p>
                    <NavLink to="/admin/reservations" className="inline-flex items-center gap-1.5 mt-3 px-4 py-2 rounded-lg bg-sapphire-600/20 text-sapphire-400 text-xs font-medium hover:bg-sapphire-600/30 transition-colors">
                      <Plus className="w-3 h-3" /> Créer la première
                    </NavLink>
                  </td>
                </tr>
              ) : recentReservations.map(r => (
                <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 font-mono text-sapphire-400 text-xs font-medium">{r.booking_number}</td>
                  <td className="px-5 py-3.5 text-white font-medium">{clientMap[r.client_id] ?? 'Inconnu'}</td>
                  <td className="px-5 py-3.5 text-noir-400 max-w-[180px]">
                    <div className="flex items-center gap-1 truncate">
                      <span className="truncate">{r.departure_address.split(',')[0]}</span>
                      <ArrowUpRight className="w-3 h-3 text-sapphire-400 shrink-0" />
                      <span className="truncate">{r.arrival_address.split(',')[0]}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-noir-300 whitespace-nowrap">{formatDate(r.ride_date)}</td>
                  <td className="px-5 py-3.5 font-semibold text-white">{formatCurrency(r.total_price)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`badge ${reservationStatusColor[r.status]}`}>{reservationStatusLabel[r.status]}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
