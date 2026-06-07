import React from 'react';
import {
  Car, TrendingUp, BarChart3, CreditCard, FileText, UserPlus, Clock, CheckCircle,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatDate, reservationStatusLabel, reservationStatusColor } from '../lib/supabase';
import { useData } from '../lib/DataContext';

export default function DashboardPage() {
  const { reservations, clients, payments } = useData();

  const today = new Date().toISOString().split('T')[0];

  const reservationsToday = reservations.filter(r => r.ride_date === today).length;

  const revenueToday = reservations
    .filter(r => r.ride_date === today && (r.status === 'completed' || r.status === 'deposit_paid'))
    .reduce((s, r) => s + r.total_price, 0);

  const currentMonth = today.slice(0, 7);
  const revenueMonth = reservations
    .filter(r => r.ride_date.startsWith(currentMonth))
    .reduce((s, r) => s + r.total_price, 0);

  const depositsCollected = payments
    .filter(p => p.status === 'completed' && p.type === 'deposit')
    .reduce((s, p) => s + p.amount, 0);

  const pendingQuotes = reservations.filter(r => r.is_quote && r.status === 'pending').length;
  const newClients   = clients.filter(c => c.status === 'new').length;
  const upcomingRides = reservations.filter(r => r.status === 'confirmed' || r.status === 'deposit_paid').length;
  const completedRides = reservations.filter(r => r.status === 'completed').length;

  const recentReservations = [...reservations]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 6);

  const clientMap = Object.fromEntries(
    clients.map(c => [c.id, `${c.first_name} ${c.last_name}`])
  );

  // Build real monthly chart data from reservations (last 6 months)
  const chartData = (() => {
    const months: { month: string; revenue: number; reservations: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('fr-FR', { month: 'short' });
      const monthRes = reservations.filter(r => r.ride_date.startsWith(key) && !r.is_quote);
      months.push({
        month: label.charAt(0).toUpperCase() + label.slice(1),
        revenue: Math.round(monthRes.reduce((s, r) => s + r.total_price, 0)),
        reservations: monthRes.length,
      });
    }
    return months;
  })();

  interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    color: string;
  }

  const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-noir-400 text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );

  const tooltipStyle = {
    contentStyle: {
      background: 'rgba(10,10,25,.95)',
      border: '1px solid rgba(51,108,255,.3)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '12px',
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Tableau de bord</h1>
        <p className="text-noir-400">Bienvenue sur L'Ambassadeur des VTC</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Car}          label="Réservations du jour"  value={reservationsToday}                color="bg-sapphire-600/80" />
        <StatCard icon={TrendingUp}   label="CA du jour"            value={formatCurrency(revenueToday)}     color="bg-emerald-600/80" />
        <StatCard icon={BarChart3}    label="CA du mois"            value={formatCurrency(revenueMonth)}     color="bg-amber-600/80" />
        <StatCard icon={CreditCard}   label="Acomptes encaissés"    value={formatCurrency(depositsCollected)} color="bg-cyan-600/80" />
        <StatCard icon={FileText}     label="Devis en attente"      value={pendingQuotes}                    color="bg-violet-600/80" />
        <StatCard icon={UserPlus}     label="Nouveaux clients"      value={newClients}                       color="bg-pink-600/80" />
        <StatCard icon={Clock}        label="Courses à venir"       value={upcomingRides}                    color="bg-indigo-600/80" />
        <StatCard icon={CheckCircle}  label="Courses terminées"     value={completedRides}                   color="bg-teal-600/80" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-base font-bold text-white mb-5">Évolution du CA</h2>
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
          <h2 className="text-base font-bold text-white mb-5">Réservations par mois</h2>
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
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-bold text-white">Dernières réservations</h2>
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
                <tr><td colSpan={6} className="px-5 py-8 text-center text-noir-500">Aucune réservation</td></tr>
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