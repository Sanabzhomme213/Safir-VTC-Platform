import { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Users,
  Briefcase,
  ChevronDown,
  Check,
  Plus,
} from 'lucide-react';
import {
  formatCurrency,
  formatDate,
  reservationStatusLabel,
  reservationStatusColor,
  rideTypeLabel,
  type Reservation,
} from '../lib/supabase';
import { mockReservations, mockClients } from '../lib/mockData';

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedReservationId, setExpandedReservationId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    departure: '',
    arrival: '',
    date: '',
    time: '14:00',
    passengers: 1,
    luggage: 0,
    rideType: 'one_way' as const,
    returnDate: '',
    returnTime: '17:00',
    depositPercentage: 20,
  });

  const statusOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'pending', label: 'En attente' },
    { value: 'deposit_paid', label: 'Acompte payé' },
    { value: 'confirmed', label: 'Confirmée' },
    { value: 'completed', label: 'Terminée' },
    { value: 'cancelled', label: 'Annulée' },
  ];

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return mockReservations.filter((res) => {
      const matchesSearch =
        res.booking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.departure_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        res.arrival_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mockClients
          .find((c) => c.id === res.client_id)
          ?.first_name.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        mockClients
          .find((c) => c.id === res.client_id)
          ?.last_name.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || res.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // Calculate price based on distance
  const calculatePrice = (distance: number, rideType: string): number => {
    const basePrice = Math.max(distance * 1.8, 25);
    if (rideType === 'round_trip') {
      return Math.round(basePrice * 1.8 * 0.9 * 100) / 100; // 2x distance - 10%
    }
    if (rideType === 'disposal') {
      return 45 * (formData.time ? 4 : 1); // 45€/h, assume 4h default
    }
    return Math.round(basePrice * 100) / 100;
  };

  // Mock distance calculation (normally from maps API)
  const estimatedDistance = formData.departure && formData.arrival ? 45 : 0;
  const estimatedPrice = estimatedDistance > 0 ? calculatePrice(estimatedDistance, formData.rideType) : 0;
  const depositAmount = estimatedPrice > 0 ? Math.round((estimatedPrice * formData.depositPercentage) * 100) / 100 : 0;

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent, isQuote: boolean) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  const getClientName = (clientId: string): string => {
    const client = mockClients.find((c) => c.id === clientId);
    return client ? `${client.first_name} ${client.last_name}` : 'Inconnu';
  };

  const truncateAddress = (address: string, length: number = 35): string => {
    return address.length > length ? address.substring(0, length) + '...' : address;
  };

  const getStatusBadgeColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      pending: 'bg-amber-900/30 text-amber-200 border border-amber-700/50',
      deposit_paid: 'bg-blue-900/30 text-blue-200 border border-blue-700/50',
      confirmed: 'bg-emerald-900/30 text-emerald-200 border border-emerald-700/50',
      completed: 'bg-slate-700/30 text-slate-200 border border-slate-600/50',
      cancelled: 'bg-red-900/30 text-red-200 border border-red-700/50',
    };
    return colorMap[status] || 'bg-slate-700/30 text-slate-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300 mb-2">
          Réservations
        </h1>
        <p className="text-slate-400">Gestion des trajets et moteur de réservation</p>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-emerald-900/80 border border-emerald-700 rounded-lg px-4 py-3 flex items-center gap-2 text-emerald-200 backdrop-blur-sm z-50 animate-in fade-in slide-in-from-top-2 duration-300">
          <Check className="w-5 h-5" />
          <span className="font-medium">
            {formData.rideType === 'one_way'
              ? 'Réservation effectuée avec succès'
              : 'Devis généré avec succès'}
          </span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 border-b border-slate-700/50">
        <button
          onClick={() => {
            setActiveTab('list');
            setShowSuccess(false);
          }}
          className={`px-6 py-3 font-medium border-b-2 transition-all duration-300 ${
            activeTab === 'list'
              ? 'text-cyan-300 border-cyan-500 bg-cyan-500/5'
              : 'text-slate-400 border-transparent hover:text-slate-300'
          }`}
        >
          Liste des réservations
        </button>
        <button
          onClick={() => {
            setActiveTab('new');
            setShowSuccess(false);
          }}
          className={`px-6 py-3 font-medium border-b-2 transition-all duration-300 ${
            activeTab === 'new'
              ? 'text-cyan-300 border-cyan-500 bg-cyan-500/5'
              : 'text-slate-400 border-transparent hover:text-slate-300'
          }`}
        >
          Nouvelle réservation
        </button>
      </div>

      {/* TAB 1: Reservation List */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Rechercher par N°, client, adresse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  statusFilter === option.value
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-800/50 text-slate-300 border border-slate-700 hover:bg-slate-700/50'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Reservations Table */}
          <div className="rounded-xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50 bg-slate-800/30">
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      N°
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Départ
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Arrivée
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.length > 0 ? (
                    filteredReservations.map((reservation) => (
                      <div key={reservation.id}>
                        <tr
                          onClick={() =>
                            setExpandedReservationId(
                              expandedReservationId === reservation.id
                                ? null
                                : reservation.id
                            )
                          }
                          className="border-b border-slate-700/30 hover:bg-slate-800/40 cursor-pointer transition-colors duration-200 group"
                        >
                          <td className="px-4 py-4 text-sm font-mono text-cyan-300">
                            {reservation.booking_number}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-300">
                            {formatDate(reservation.ride_date)}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-300">
                            {getClientName(reservation.client_id)}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-400">
                            {truncateAddress(reservation.departure_address)}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-400">
                            {truncateAddress(reservation.arrival_address)}
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-300">
                            {rideTypeLabel[reservation.ride_type]}
                          </td>
                          <td className="px-4 py-4 text-sm font-semibold text-cyan-300">
                            {formatCurrency(reservation.total_price)}
                          </td>
                          <td className="px-4 py-4 text-sm">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                                reservation.status
                              )}`}
                            >
                              {reservationStatusLabel[reservation.status]}
                            </span>
                          </td>
                        </tr>
                        {/* Expanded Details Row */}
                        {expandedReservationId === reservation.id && (
                          <tr className="bg-slate-800/20 border-b border-slate-700/30">
                            <td colSpan={8} className="px-4 py-6">
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-400 mb-2">
                                      Adresses
                                    </h4>
                                    <p className="text-sm text-slate-300 mb-2">
                                      <span className="text-cyan-300">Départ:</span>{' '}
                                      {reservation.departure_address}
                                    </p>
                                    <p className="text-sm text-slate-300">
                                      <span className="text-cyan-300">Arrivée:</span>{' '}
                                      {reservation.arrival_address}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-400 mb-2">
                                      Détails du trajet
                                    </h4>
                                    <p className="text-sm text-slate-300 mb-1">
                                      <span className="text-cyan-300">Distance:</span>{' '}
                                      {reservation.distance_km} km
                                    </p>
                                    <p className="text-sm text-slate-300">
                                      <span className="text-cyan-300">Durée:</span>{' '}
                                      {reservation.duration_min} min
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-400 mb-2">
                                      Passagers
                                    </h4>
                                    <p className="text-sm text-slate-300 mb-1">
                                      <span className="text-cyan-300">Passagers:</span>{' '}
                                      {reservation.passengers}
                                    </p>
                                    <p className="text-sm text-slate-300">
                                      <span className="text-cyan-300">Bagages:</span>{' '}
                                      {reservation.luggage}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-400 mb-2">
                                      Tarification
                                    </h4>
                                    <p className="text-sm text-slate-300 mb-1">
                                      <span className="text-cyan-300">Prix total:</span>{' '}
                                      {formatCurrency(reservation.total_price)}
                                    </p>
                                    <p className="text-sm text-slate-300">
                                      <span className="text-cyan-300">Acompte:</span>{' '}
                                      {formatCurrency(reservation.deposit_amount)}
                                    </p>
                                  </div>
                                </div>
                                {reservation.notes && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-400 mb-2">
                                      Notes
                                    </h4>
                                    <p className="text-sm text-slate-300">
                                      {reservation.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </div>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center">
                        <p className="text-slate-400">
                          Aucune réservation trouvée
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: New Reservation Form */}
      {activeTab === 'new' && (
        <div className="max-w-4xl">
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            {/* Trajet Section */}
            <div className="rounded-xl border border-slate-700/50 backdrop-blur-sm bg-slate-800/20 p-6 hover:border-slate-600/50 transition-all duration-300">
              <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Trajet
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Adresse de départ
                  </label>
                  <input
                    type="text"
                    value={formData.departure}
                    onChange={(e) =>
                      handleFormChange('departure', e.target.value)
                    }
                    placeholder="Ex: Gare Lille Europe"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Adresse d'arrivée
                  </label>
                  <input
                    type="text"
                    value={formData.arrival}
                    onChange={(e) =>
                      handleFormChange('arrival', e.target.value)
                    }
                    placeholder="Ex: Aéroport de Lille"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Date & Heure Section */}
            <div className="rounded-xl border border-slate-700/50 backdrop-blur-sm bg-slate-800/20 p-6 hover:border-slate-600/50 transition-all duration-300">
              <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Date & Heure
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Date de départ
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleFormChange('date', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Heure de départ
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => handleFormChange('time', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                {formData.rideType === 'round_trip' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Date de retour
                      </label>
                      <input
                        type="date"
                        value={formData.returnDate}
                        onChange={(e) =>
                          handleFormChange('returnDate', e.target.value)
                        }
                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Heure de retour
                      </label>
                      <input
                        type="time"
                        value={formData.returnTime}
                        onChange={(e) =>
                          handleFormChange('returnTime', e.target.value)
                        }
                        className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Passagers & Bagages Section */}
            <div className="rounded-xl border border-slate-700/50 backdrop-blur-sm bg-slate-800/20 p-6 hover:border-slate-600/50 transition-all duration-300">
              <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Passagers & Bagages
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nombre de passagers (1-8)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.passengers}
                    onChange={(e) =>
                      handleFormChange('passengers', parseInt(e.target.value))
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nombre de bagages (0-8)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="8"
                    value={formData.luggage}
                    onChange={(e) =>
                      handleFormChange('luggage', parseInt(e.target.value))
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Type de trajet Section */}
            <div className="rounded-xl border border-slate-700/50 backdrop-blur-sm bg-slate-800/20 p-6 hover:border-slate-600/50 transition-all duration-300">
              <h3 className="text-lg font-semibold text-cyan-300 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Type de trajet
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: 'one_way', label: 'Aller simple' },
                  { value: 'round_trip', label: 'Aller-retour' },
                  { value: 'disposal', label: 'Mise à disposition' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleFormChange('rideType', type.value)}
                    className={`p-3 rounded-lg border-2 font-medium transition-all duration-200 ${
                      formData.rideType === type.value
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                        : 'border-slate-600 bg-slate-900/50 text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Distance & Durée Section */}
            {estimatedDistance > 0 && (
              <div className="rounded-xl border border-slate-700/50 backdrop-blur-sm bg-slate-800/20 p-6">
                <h3 className="text-lg font-semibold text-cyan-300 mb-4">
                  Distance & Durée estimées
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-1">Distance</p>
                    <p className="text-2xl font-bold text-cyan-300">
                      {estimatedDistance} km
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-sm text-slate-400 mb-1">Durée estimée</p>
                    <p className="text-2xl font-bold text-cyan-300">
                      {Math.round(estimatedDistance / 50 * 60)} min
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tarif Estimatif Section */}
            {estimatedPrice > 0 && (
              <div className="rounded-xl border border-cyan-500/30 backdrop-blur-sm bg-cyan-500/5 p-6">
                <h3 className="text-lg font-semibold text-cyan-300 mb-6">
                  Tarif estimatif
                </h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-4 border-b border-cyan-500/20">
                    <span className="text-slate-300">Prix de base</span>
                    <span className="text-xl font-semibold text-cyan-300">
                      {formatCurrency(estimatedPrice)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-3">
                      Acompte
                    </label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[20, 30, 50].map((percent) => (
                        <button
                          key={percent}
                          type="button"
                          onClick={() =>
                            handleFormChange('depositPercentage', percent)
                          }
                          className={`px-3 py-2 rounded-lg border font-medium text-sm transition-all duration-200 ${
                            formData.depositPercentage === percent
                              ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                              : 'border-slate-600 bg-slate-900/50 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          {percent}%
                        </button>
                      ))}
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <p className="text-sm text-slate-400 mb-1">Montant à verser</p>
                      <p className="text-2xl font-bold text-cyan-300">
                        {formatCurrency(depositAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                onClick={(e) => handleSubmit(e, false)}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-cyan-500/25"
              >
                <Check className="w-5 h-5" />
                Réserver
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                className="flex-1 px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600 text-slate-300 hover:text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Demander un devis
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
