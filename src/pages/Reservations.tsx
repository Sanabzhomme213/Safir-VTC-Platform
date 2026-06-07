import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, MapPin, Calendar, Clock, Users, Briefcase,
  ChevronDown, Check, Plus, Loader2, Navigation, AlertCircle, CreditCard
} from 'lucide-react';
import {
  formatCurrency, formatDate, generateBookingNumber,
  reservationStatusLabel, reservationStatusColor, rideTypeLabel, type Reservation,
} from '../lib/supabase';
import { useData } from '../lib/DataContext';
import { getRouteInfo, calculatePrice } from '../lib/distance';
import PaymentModal from '../components/PaymentModal';
import { notifyReservationCreated, notifyDepositPaid, notifyBalancePaid, notifyThankYou } from '../lib/smsService';

type RideType = 'one_way' | 'round_trip' | 'disposal';
interface FormState {
  clientId: string; departure: string; arrival: string; date: string; time: string;
  passengers: number; luggage: number; rideType: RideType; returnDate: string;
  returnTime: string; depositPct: number; flightNumber: string; notes: string; disposalHours: number;
}

export default function ReservationsPage() {
  const { reservations, clients, settings, addReservation, updateReservation } = useData();

  const [activeTab, setActiveTab] = useState<'list' | 'new'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [paymentModal, setPaymentModal] = useState<{
    reservation: Reservation;
    type: 'deposit' | 'balance';
    amount: number;
  } | null>(null);

  // New reservation form
  const [form, setForm] = useState<FormState>({
    clientId: '',
    departure: '',
    arrival: '',
    date: '',
    time: '14:00',
    passengers: 1,
    luggage: 0,
    rideType: 'one_way',
    returnDate: '',
    returnTime: '19:00',
    depositPct: settings.deposit_default,
    flightNumber: '',
    notes: '',
    disposalHours: 4,
  });
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  // undefined initial value → MutableRefObject (mutable), null → RefObject (read-only)
  const routeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Sync deposit default from settings
  useEffect(() => {
    setForm(f => ({ ...f, depositPct: settings.deposit_default }));
  }, [settings.deposit_default]);

  // Auto-calculate route when addresses change
  useEffect(() => {
    if (!form.departure || !form.arrival) { setRouteInfo(null); return; }
    if (routeTimer.current) clearTimeout(routeTimer.current);
    routeTimer.current = setTimeout(async () => {
      setRouteLoading(true);
      const info = await getRouteInfo(form.departure, form.arrival, settings.google_maps_key || undefined);
      setRouteInfo(info.distanceKm > 0 ? info : null);
      setRouteLoading(false);
    }, 800);
    return () => { if (routeTimer.current) clearTimeout(routeTimer.current); };
  }, [form.departure, form.arrival, settings.google_maps_key]);

  const price = useMemo(() => {
    if (!routeInfo) return 0;
    return calculatePrice(routeInfo.distanceKm, form.rideType, settings, form.disposalHours);
  }, [routeInfo, form.rideType, form.disposalHours, settings]);

  const depositAmt = price > 0 ? Math.round(price * form.depositPct) / 100 : 0;

  const statusOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'pending', label: 'En attente' },
    { value: 'deposit_paid', label: 'Acompte payé' },
    { value: 'confirmed', label: 'Confirmée' },
    { value: 'completed', label: 'Terminée' },
    { value: 'cancelled', label: 'Annulée' },
  ];

  const filtered = useMemo(() => {
    return reservations.filter(r => {
      const c = clients.find(cl => cl.id === r.client_id);
      const name = c ? `${c.first_name} ${c.last_name}` : '';
      const matchSearch =
        r.booking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.departure_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.arrival_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch && (statusFilter === 'all' || r.status === statusFilter);
    });
  }, [reservations, clients, searchTerm, statusFilter]);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent, isQuote: boolean) => {
    e.preventDefault();
    if (!form.departure || !form.arrival || !form.date) {
      showToast('Veuillez remplir tous les champs requis', false);
      return;
    }
    const selectedClient = clients.find(c => c.id === form.clientId) ?? clients[0];
    if (!selectedClient) {
      showToast('Veuillez sélectionner un client', false);
      return;
    }
    const dist = routeInfo?.distanceKm ?? 0;
    const dur  = routeInfo?.durationMin ?? 0;
    const totalPrice = price || 0;
    const dep = totalPrice > 0 ? Math.round(totalPrice * form.depositPct) / 100 : 0;

    try {
      const newRes = await addReservation({
        booking_number: generateBookingNumber(),
        client_id: selectedClient.id,
        departure_address: form.departure,
        departure_lat: null,
        departure_lng: null,
        arrival_address: form.arrival,
        arrival_lat: null,
        arrival_lng: null,
        ride_date: form.date,
        ride_time: form.time,
        passengers: form.passengers,
        luggage: form.luggage,
        ride_type: form.rideType,
        return_date: form.rideType === 'round_trip' ? form.returnDate || null : null,
        return_time: form.rideType === 'round_trip' ? form.returnTime || null : null,
        distance_km: dist,
        duration_min: dur,
        base_price: totalPrice,
        deposit_amount: dep,
        deposit_percentage: form.depositPct,
        total_price: totalPrice,
        status: 'pending',
        flight_number: form.flightNumber || null,
        flight_status: null,
        is_quote: isQuote,
        notes: form.notes,
      });
      showToast(isQuote
        ? `Devis ${newRes.booking_number} créé`
        : `Réservation ${newRes.booking_number} enregistrée`);

      // SMS notification automatique
      notifyReservationCreated(newRes, selectedClient, settings.company_name, settings.company_phone);
      setForm(f => ({
        ...f,
        departure: '', arrival: '', date: '', time: '14:00',
        passengers: 1, luggage: 0, rideType: 'one_way',
        returnDate: '', returnTime: '19:00', flightNumber: '', notes: '', clientId: '',
      }));
      setRouteInfo(null);
      setTimeout(() => setActiveTab('list'), 800);
    } catch (err) {
      showToast('Erreur lors de la création', false);
    }
  };

  const handleStatusChange = async (id: string, status: Reservation['status']) => {
    try {
      await updateReservation(id, { status });
      showToast('Statut mis à jour');
    } catch {
      showToast('Erreur lors de la mise à jour', false);
    }
  };

  const getClientName = (clientId: string) => {
    const c = clients.find(cl => cl.id === clientId);
    return c ? `${c.first_name} ${c.last_name}` : 'Client inconnu';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Réservations</h1>
        <p className="text-noir-400">Gestion des trajets et moteur de réservation</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg border text-sm font-medium animate-fade-in ${
          toast.ok
            ? 'bg-emerald-900/90 border-emerald-600/50 text-emerald-200'
            : 'bg-red-900/90 border-red-600/50 text-red-200'
        }`}>
          <Check className="w-4 h-4" />
          {toast.msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5">
        {(['list', 'new'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all ${
              activeTab === tab
                ? 'text-sapphire-400 border-sapphire-500'
                : 'text-noir-400 border-transparent hover:text-white'
            }`}
          >
            {tab === 'list' ? 'Liste des réservations' : 'Nouvelle réservation'}
          </button>
        ))}
      </div>

      {/* LIST */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500" />
              <input
                type="text"
                placeholder="Rechercher N°, client, adresse..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {statusOptions.map(o => (
                <button
                  key={o.value}
                  onClick={() => setStatusFilter(o.value)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    statusFilter === o.value
                      ? 'bg-sapphire-600 text-white'
                      : 'bg-white/5 text-noir-300 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['N°', 'Date', 'Client', 'Trajet', 'Type', 'Montant', 'Statut', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-noir-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-noir-500">Aucune réservation trouvée</td></tr>
                  ) : filtered.flatMap(r => [
                    <tr
                      key={r.id}
                      onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-sapphire-400 font-medium text-xs">{r.booking_number}</td>
                      <td className="px-4 py-3 text-noir-300 whitespace-nowrap">{formatDate(r.ride_date)}</td>
                      <td className="px-4 py-3 text-white font-medium">{getClientName(r.client_id)}</td>
                      <td className="px-4 py-3 text-noir-400 max-w-[200px] truncate">
                        {r.departure_address.split(',')[0]} → {r.arrival_address.split(',')[0]}
                      </td>
                      <td className="px-4 py-3 text-noir-300">{rideTypeLabel[r.ride_type]}</td>
                      <td className="px-4 py-3 font-semibold text-white">{formatCurrency(r.total_price)}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${reservationStatusColor[r.status]}`}>{reservationStatusLabel[r.status]}</span>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronDown className={`w-4 h-4 text-noir-500 transition-transform ${expandedId === r.id ? 'rotate-180' : ''}`} />
                      </td>
                    </tr>,
                    expandedId === r.id ? (
                      <tr key={`${r.id}-detail`} className="border-b border-white/5 bg-white/[0.01]">
                        <td colSpan={8} className="px-4 py-5">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                            <div>
                              <p className="text-noir-500 text-xs mb-1">Départ</p>
                              <p className="text-white">{r.departure_address}</p>
                            </div>
                            <div>
                              <p className="text-noir-500 text-xs mb-1">Arrivée</p>
                              <p className="text-white">{r.arrival_address}</p>
                            </div>
                            <div>
                              <p className="text-noir-500 text-xs mb-1">Distance / Durée</p>
                              <p className="text-white">{r.distance_km} km · {r.duration_min} min</p>
                            </div>
                            <div>
                              <p className="text-noir-500 text-xs mb-1">Acompte</p>
                              <p className="text-white">{formatCurrency(r.deposit_amount)} ({r.deposit_percentage}%)</p>
                            </div>
                            <div>
                              <p className="text-noir-500 text-xs mb-1">Passagers / Bagages</p>
                              <p className="text-white">{r.passengers} pax · {r.luggage} bag.</p>
                            </div>
                            {r.flight_number && (
                              <div>
                                <p className="text-noir-500 text-xs mb-1">Vol</p>
                                <p className="text-sapphire-400 font-mono">{r.flight_number}</p>
                              </div>
                            )}
                            {r.notes && (
                              <div className="col-span-2">
                                <p className="text-noir-500 text-xs mb-1">Notes</p>
                                <p className="text-white">{r.notes}</p>
                              </div>
                            )}
                          </div>
                          {/* Payment buttons */}
                          <div className="flex gap-2 flex-wrap mb-3">
                            {r.status === 'pending' && r.deposit_amount > 0 && (
                              <button
                                onClick={e => { e.stopPropagation(); setPaymentModal({ reservation: r, type: 'deposit', amount: r.deposit_amount }); }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sapphire-600 hover:bg-sapphire-700 text-white text-xs font-bold transition-colors"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                Encaisser acompte {formatCurrency(r.deposit_amount)}
                              </button>
                            )}
                            {r.status === 'deposit_paid' && (
                              <button
                                onClick={e => { e.stopPropagation(); setPaymentModal({ reservation: r, type: 'balance', amount: r.total_price - r.deposit_amount }); }}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                Encaisser solde {formatCurrency(r.total_price - r.deposit_amount)}
                              </button>
                            )}
                          </div>
                          {/* Status buttons */}
                          <div className="flex gap-2 flex-wrap">
                            {(['pending','deposit_paid','confirmed','completed','cancelled'] as const).map(s => (
                              <button
                                key={s}
                                onClick={e => { e.stopPropagation(); handleStatusChange(r.id, s); }}
                                disabled={r.status === s}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border ${
                                  r.status === s
                                    ? 'bg-sapphire-600/20 text-sapphire-300 border-sapphire-500/30 cursor-default'
                                    : 'bg-white/5 text-noir-300 border-white/10 hover:bg-white/10'
                                }`}
                              >
                                {reservationStatusLabel[s]}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ) : null
                  ])}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NEW RESERVATION FORM */}
      {activeTab === 'new' && (
        <form onSubmit={e => handleSubmit(e, false)} className="max-w-3xl space-y-5">
          {/* Client */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2"><Users className="w-4 h-4 text-sapphire-400" /> Client</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-noir-300 mb-1.5">Client</label>
                <select
                  value={form.clientId}
                  onChange={e => setForm(f => ({ ...f, clientId: e.target.value }))}
                  className="input-field"
                >
                  <option value="">— Sélectionner un client —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-noir-300 mb-1.5">N° Vol (optionnel)</label>
                <input
                  type="text"
                  value={form.flightNumber}
                  onChange={e => setForm(f => ({ ...f, flightNumber: e.target.value.toUpperCase() }))}
                  placeholder="AF1234, BA678..."
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Trajet */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2"><MapPin className="w-4 h-4 text-sapphire-400" /> Trajet</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-noir-300 mb-1.5">Adresse de départ *</label>
                <input
                  type="text"
                  value={form.departure}
                  onChange={e => setForm(f => ({ ...f, departure: e.target.value }))}
                  placeholder="Ex: Gare de Toulon, Var"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-noir-300 mb-1.5">Adresse d'arrivée *</label>
                <input
                  type="text"
                  value={form.arrival}
                  onChange={e => setForm(f => ({ ...f, arrival: e.target.value }))}
                  placeholder="Ex: Aéroport Nice Côte d'Azur"
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Route info */}
            {routeLoading && (
              <div className="flex items-center gap-2 text-noir-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Calcul du trajet...
              </div>
            )}
            {routeInfo && !routeLoading && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-sapphire-600/10 border border-sapphire-500/20 rounded-lg p-3 text-center">
                  <Navigation className="w-4 h-4 text-sapphire-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{routeInfo.distanceKm} km</p>
                  <p className="text-xs text-noir-400">Distance estimée</p>
                </div>
                <div className="bg-sapphire-600/10 border border-sapphire-500/20 rounded-lg p-3 text-center">
                  <Clock className="w-4 h-4 text-sapphire-400 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-white">{routeInfo.durationMin} min</p>
                  <p className="text-xs text-noir-400">Durée estimée</p>
                </div>
              </div>
            )}
            {!settings.google_maps_key && form.departure && form.arrival && !routeLoading && (
              <p className="text-xs text-noir-500 flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3" />
                Distance calculée automatiquement. Pour plus de précision, configurez votre clé Google Maps dans les Paramètres.
              </p>
            )}
          </div>

          {/* Date & Heure */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-sapphire-400" /> Date & Heure</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm text-noir-300 mb-1.5">Date départ *</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm text-noir-300 mb-1.5">Heure départ *</label>
                <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="input-field" required />
              </div>
              {form.rideType === 'round_trip' && (
                <>
                  <div>
                    <label className="block text-sm text-noir-300 mb-1.5">Date retour</label>
                    <input type="date" value={form.returnDate} onChange={e => setForm(f => ({ ...f, returnDate: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm text-noir-300 mb-1.5">Heure retour</label>
                    <input type="time" value={form.returnTime} onChange={e => setForm(f => ({ ...f, returnTime: e.target.value }))} className="input-field" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Passagers & Type */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-white flex items-center gap-2"><Briefcase className="w-4 h-4 text-sapphire-400" /> Options</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm text-noir-300 mb-1.5">Passagers</label>
                <input type="number" min={1} max={8} value={form.passengers} onChange={e => setForm(f => ({ ...f, passengers: +e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="block text-sm text-noir-300 mb-1.5">Bagages</label>
                <input type="number" min={0} max={8} value={form.luggage} onChange={e => setForm(f => ({ ...f, luggage: +e.target.value }))} className="input-field" />
              </div>
              {form.rideType === 'disposal' && (
                <div>
                  <label className="block text-sm text-noir-300 mb-1.5">Heures (MAD)</label>
                  <input type="number" min={1} max={12} value={form.disposalHours} onChange={e => setForm(f => ({ ...f, disposalHours: +e.target.value }))} className="input-field" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['one_way', 'round_trip', 'disposal'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, rideType: t }))}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    form.rideType === t
                      ? 'border-sapphire-500 bg-sapphire-600/15 text-sapphire-400'
                      : 'border-white/10 bg-white/5 text-noir-300 hover:bg-white/10'
                  }`}
                >
                  {rideTypeLabel[t]}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm text-noir-300 mb-1.5">Notes</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className="input-field resize-none" placeholder="Instructions particulières..." />
            </div>
          </div>

          {/* Pricing */}
          {price > 0 && (
            <div className="card border-sapphire-500/20 space-y-4">
              <h3 className="font-semibold text-white">Tarif estimatif</h3>
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <span className="text-noir-300">Prix total estimé</span>
                <span className="text-xl font-bold text-white">{formatCurrency(price)}</span>
              </div>
              <div>
                <p className="text-sm text-noir-300 mb-2">Pourcentage d'acompte</p>
                <div className="flex gap-2 mb-3">
                  {[20, 30, 50].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, depositPct: p }))}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        form.depositPct === p
                          ? 'border-sapphire-500 bg-sapphire-600/15 text-sapphire-400'
                          : 'border-white/10 bg-white/5 text-noir-300 hover:bg-white/10'
                      }`}
                    >
                      {p}%
                    </button>
                  ))}
                </div>
                <div className="bg-sapphire-600/10 border border-sapphire-500/20 rounded-lg p-4 text-center">
                  <p className="text-xs text-noir-400 mb-1">Acompte à encaisser</p>
                  <p className="text-2xl font-bold text-sapphire-400">{formatCurrency(depositAmt)}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
              <Check className="w-4 h-4" /> Réserver
            </button>
            <button
              type="button"
              onClick={e => handleSubmit(e as unknown as React.FormEvent, true)}
              className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3"
            >
              <Plus className="w-4 h-4" /> Créer un devis
            </button>
          </div>
        </form>
      )}

      {/* Payment Modal */}
      {paymentModal && (
        <PaymentModal
          reservation={paymentModal.reservation}
          client={clients.find(c => c.id === paymentModal.reservation.client_id) ?? null}
          paymentType={paymentModal.type}
          amount={paymentModal.amount}
          onSuccess={async () => {
            const newStatus = paymentModal.type === 'deposit' ? 'deposit_paid' : 'completed';
            await updateReservation(paymentModal.reservation.id, { status: newStatus });
            setPaymentModal(null);
            showToast(`Paiement encaissé — réservation ${reservationStatusLabel[newStatus]}`);

            // SMS automatique selon le type de paiement
            const client = clients.find(c => c.id === paymentModal.reservation.client_id);
            if (client) {
              if (paymentModal.type === 'deposit') {
                notifyDepositPaid(paymentModal.reservation, client, paymentModal.amount, settings.company_name);
              } else {
                notifyBalancePaid(paymentModal.reservation, client, settings.company_name);
                // SMS de remerciement après trajet terminé
                setTimeout(() => notifyThankYou(client, settings.company_name), 2000);
              }
            }
          }}
          onClose={() => setPaymentModal(null)}
        />
      )}
    </div>
  );
}