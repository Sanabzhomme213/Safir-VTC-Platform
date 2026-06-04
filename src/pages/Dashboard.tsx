import React from 'react';
import {
  Car, TrendingUp, BarChart3, CreditCard, FileText, UserPlus, Clock, CheckCircle,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import {
  formatCurrency, formatDate, reservationStatusLabel, reservationStatusColor,
  type Reservation, type Client, type Payment
} from '../lib/supabase';
import {
  mockReservations, mockClients, mockPayments, monthlyRevenue, conversionData
} from '../lib/mockData';

export default function DashboardPage() {
  // Calculate today's date
  const today = new Date('2025-06-04').toISOString().split('T')[0];

  // Stat 1: Réservations du jour - count of today's rides
  const reservationsToday = mockReservations.filter(r => r.ride_date === today).length;

  // Stat 2: CA du jour - sum of today's completed/paid rides
  const revenueToday = mockReservations
    .filter(r => r.ride_date === today && (r.status === 'completed' || r.status === 'deposit_paid'))
    .reduce((sum, r) => sum + r.total_price, 0);

  // Stat 3: CA du mois - sum of month's rides (June 2025)
  const revenueMonth = mockReservations
    .filter(r => r.ride_date.startsWith('2025-06'))
    .reduce((sum, r) => sum + r.total_price, 0);

  // Stat 4: Acomptes encaissés - sum of completed deposits
  const depositsCollected = mockPayments
    .filter(p => p.status === 'completed' && p.type === 'deposit')
    .reduce((sum, p) => sum + p.amount, 0);

  // Stat 5: Devis en attente - count of is_quote with pending status
  const pendingQuotes = mockReservations
    .filter(r => r.is_quote && r.status === 'pending').length;

  // Stat 6: Nouveaux clients - count of 'new' status clients
  const newClients = mockClients.filter(c => c.status === 'new').length;

  // Stat 7: Courses à venir - count of confirmed + deposit_paid
  const upcomingRides = mockReservations
    .filter(r => r.status === 'confirmed' || r.status === 'deposit_paid').length;

  // Stat 8: Courses terminées - count of completed
  const completedRides = mockReservations.filter(r => r.status === 'completed').length;

  // Calculate conversion rate
  const currentMonthConversion = conversionData.find(d => d.month === 'Jun');
  const conversionRate = currentMonthConversion
    ? ((currentMonthConversion.reservations / currentMonthConversion.quotes) * 100).toFixed(1)
    : '0';

  // Get recent reservations (last 5)
  const recentReservations = [...mockReservations]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  // Get client names map
  const clientMap = Object.fromEntries(mockClients.map(c => [c.id, `${c.first_name} ${c.last_name}`]));

  interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    change?: number;
    iconColor: string;
  }

  const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, change, iconColor }) => (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-noir-300 text-sm mb-2">{label}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Tableau de bord</h1>
        <p className="text-noir-400">Bienvenue sur Safir VTC Manager</p>
      </div>

      {/* Stats Grid - 2x4 on desktop, responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Car}
          label="Réservations du jour"
          value={reservationsToday}
          change={12}
          iconColor="bg-sapphire-600/20 group-hover:bg-sapphire-600/30 text-sapphire-400"
        />
        <StatCard
          icon={TrendingUp}
          label="CA du jour"
          value={formatCurrency(revenueToday)}
          change={8}
          iconColor="bg-emerald-600/20 group-hover:bg-emerald-600/30 text-emerald-400"
        />
        <StatCard
          icon={BarChart3}
          label="CA du mois"
          value={formatCurrency(revenueMonth)}
          change={15}
          iconColor="bg-amber-600/20 group-hover:bg-amber-600/30 text-amber-400"
        />
        <StatCard
          icon={CreditCard}
          label="Acomptes encaissés"
          value={formatCurrency(depositsCollected)}
          change={5}
          iconColor="bg-cyan-600/20 group-hover:bg-cyan-600/30 text-cyan-400"
        />
        <StatCard
          icon={FileText}
          label="Devis en attente"
          value={pendingQuotes}
          change={-2}
          iconColor="bg-violet-600/20 group-hover:bg-violet-600/30 text-violet-400"
        />
        <StatCard
          icon={UserPlus}
          label="Nouveaux clients"
          value={newClients}
          change={20}
          iconColor="bg-pink-600/20 group-hover:bg-pink-600/30 text-pink-400"
        />
        <StatCard
          icon={Clock}
          label="Courses à venir"
          value={upcomingRides}
          change={3}
          iconColor="bg-indigo-600/20 group-hover:bg-indigo-600/30 text-indigo-400"
        />
        <StatCard
          icon={CheckCircle}
          label="Courses terminées"
          value={completedRides}
          change={10}
          iconColor="bg-teal-600/20 group-hover:bg-teal-600/30 text-teal-400"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card animate-fade-in">
          <h2 className="text-lg font-bold text-white mb-6">Évolution du CA</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(51, 108, 255, 0.3)" />
                  <stop offset="95%" stopColor="rgba(51, 108, 255, 0.05)" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.2)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.2)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 10, 25, 0.9)',
                  border: '1px solid rgba(51, 108, 255, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
                formatter={(value) => formatCurrency(value as number)}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="rgb(51, 108, 255)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Reservations Chart */}
        <div className="card animate-fade-in">
          <h2 className="text-lg font-bold text-white mb-6">Réservations par mois</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.2)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.2)"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 10, 25, 0.9)',
                  border: '1px solid rgba(51, 108, 255, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar
                dataKey="reservations"
                fill="rgba(51, 108, 255, 0.7)"
                radius={[8, 8, 0, 0]}
                stroke="rgb(51, 108, 255)"
                strokeWidth={1}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conversion Rate Section */}
      <div className="card animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-noir-300 text-sm mb-2">Taux de conversion Devis → Réservation</p>
            <p className="text-4xl font-bold text-white">{conversionRate}%</p>
            {currentMonthConversion && (
              <p className="text-noir-400 text-sm mt-2">
                {currentMonthConversion.reservations} réservations sur {currentMonthConversion.quotes} devis
              </p>
            )}
          </div>
          <div className="w-24 h-24 rounded-full bg-sapphire-600/20 flex items-center justify-center">
            <p className="text-3xl font-bold text-sapphire-400">{conversionRate}%</p>
          </div>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="card animate-fade-in overflow-hidden">
        <h2 className="text-lg font-bold text-white mb-6">Dernières réservations</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-3 text-left text-xs font-semibold text-noir-400">Réservation</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-noir-400">Client</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-noir-400">Trajet</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-noir-400">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-noir-400">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-noir-400">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {recentReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-medium text-white">{reservation.booking_number}</span>
                  </td>
                  <td className="px-6 py-4 text-noir-300">
                    {clientMap[reservation.client_id] || 'Client inconnu'}
                  </td>
                  <td className="px-6 py-4 text-noir-300 max-w-xs">
                    <div className="flex items-center gap-2">
                      <span className="truncate">{reservation.departure_address.split(',')[0]}</span>
                      <ArrowUpRight className="w-4 h-4 text-sapphire-400 flex-shrink-0" />
                      <span className="truncate">{reservation.arrival_address.split(',')[0]}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-noir-300">
                    {formatDate(reservation.ride_date)}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {formatCurrency(reservation.total_price)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${reservationStatusColor[reservation.status]}`}>
                      {reservationStatusLabel[reservation.status]}
                    </span>
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
