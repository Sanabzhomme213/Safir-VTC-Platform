import { useState, useEffect, useMemo } from 'react';
import {
  MapPin, ArrowRight, ArrowUpDown, Calendar, Clock, Users, Luggage,
  Plane, CheckCircle, Loader2, Navigation, Car, Send, Shield, Phone,
  User, Mail, AlertCircle,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AddressAutocomplete, { type AddressResult } from './AddressAutocomplete';
import { calculatePrice } from '../lib/distance';
import { supabase } from '../lib/supabase';
import { sendEmail, buildConfirmationEmail } from '../lib/emailService';
import { sendSms } from '../lib/smsService';

// Fix Vite bundler breaking default icon paths
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: '', iconRetinaUrl: '', shadowUrl: '' });

function loadPublicSettings() {
  try { return JSON.parse(localStorage.getItem('ambassadeur_settings') ?? '{}'); } catch { return {}; }
}
const _s = loadPublicSettings();
const PRICE_KM = parseFloat(_s.pricing_per_km) || 1.8;
const PRICE_MIN = parseFloat(_s.pricing_min) || 25;
const PRICE_RT_DISC = parseFloat(_s.pricing_round_trip_discount) || 10;
const PRICE_DISPOSAL = parseFloat(_s.pricing_disposal_hourly) || 45;

interface Props {
  onScrollRequest?: () => void;
}

interface Coords { dep: AddressResult | null; arr: AddressResult | null; }

// --- Leaflet custom icons ---
const departIcon = L.divIcon({
  className: '',
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#336cff;border:3px solid #fff;box-shadow:0 0 0 4px rgba(51,108,255,0.35),0 2px 8px rgba(51,108,255,0.6);"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const arriveIcon = L.divIcon({
  className: '',
  html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="#336cff"/>
    <circle cx="15" cy="15" r="6" fill="#fff"/>
  </svg>`,
  iconSize: [30, 40],
  iconAnchor: [15, 40],
});

// --- MapFitter: adjusts map view when coordinates change ---
function MapFitter({ dep, arr }: { dep: AddressResult | null; arr: AddressResult | null }) {
  const map = useMap();
  useEffect(() => {
    if (dep && arr && dep.lat && arr.lat) {
      map.fitBounds([[dep.lat, dep.lng], [arr.lat, arr.lng]], { padding: [80, 80] });
    } else if (dep && dep.lat) {
      map.setView([dep.lat, dep.lng], 14);
    }
  }, [map, dep, arr]);
  return null;
}

async function fetchOsrmRoute(dep: AddressResult, arr: AddressResult): Promise<{ coords: [number, number][]; distanceKm: number; durationMin: number } | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${dep.lng},${dep.lat};${arr.lng},${arr.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    const route = data?.routes?.[0];
    if (!route) return null;
    const coords: [number, number][] = route.geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]]
    );
    return {
      coords,
      distanceKm: Math.round((route.distance / 1000) * 10) / 10,
      durationMin: Math.round(route.duration / 60),
    };
  } catch {
    return null;
  }
}

export default function BookingSection({ onScrollRequest }: Props) {
  void onScrollRequest;

  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState({
    departure: '', arrival: '', date: '', time: '', passengers: 1, luggage: 0, type: 'one_way',
    returnDate: '', returnTime: '', flightNumber: '',
  });
  const [coords, setCoords] = useState<Coords>({ dep: null, arr: null });
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number | null>(null);
  const [priceEstimate, setPriceEstimate] = useState<number | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [step1Errors, setStep1Errors] = useState<{ departure?: string; arrival?: string }>({});
  const [step2Errors, setStep2Errors] = useState<{ date?: string; time?: string; returnDate?: string; returnTime?: string }>({});
  const [contact, setContact] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [contactErrors, setContactErrors] = useState<{ firstName?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bookingResult, setBookingResult] = useState<{ bookingNumber: string; isQuote: boolean } | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const isAirport = useMemo(
    () => /a[ée]roport|airport|aéro|\bNCE\b|\bTLN\b|\bMRS\b|\bCDG\b|\bORY\b/i.test(form.departure + ' ' + form.arrival),
    [form.departure, form.arrival]
  );

  // Fetch OSRM route + compute price when both addresses selected
  useEffect(() => {
    const dep = coords.dep, arr = coords.arr;
    if (!dep || !arr || !dep.lat || !arr.lat) {
      setRouteCoords([]); setDistanceKm(null); setDurationMin(null); setPriceEstimate(null);
      return;
    }
    let cancelled = false;
    setRouteLoading(true);
    fetchOsrmRoute(dep, arr).then(route => {
      if (cancelled) return;
      if (route) {
        setRouteCoords(route.coords);
        setDistanceKm(route.distanceKm);
        setDurationMin(route.durationMin);
        const price = calculatePrice(route.distanceKm, form.type, {
          pricing_per_km: PRICE_KM, pricing_min: PRICE_MIN,
          pricing_round_trip_discount: PRICE_RT_DISC, pricing_disposal_hourly: PRICE_DISPOSAL,
        });
        setPriceEstimate(price);
      } else {
        setRouteCoords([]); setDistanceKm(null); setDurationMin(null); setPriceEstimate(null);
      }
      setRouteLoading(false);
    });
    return () => { cancelled = true; setRouteLoading(false); };
  }, [coords.dep, coords.arr, form.type]);

  const goToStep2 = () => {
    const errors: typeof step1Errors = {};
    if (!form.departure) errors.departure = 'Veuillez saisir une adresse de départ';
    if (!form.arrival) errors.arrival = "Veuillez saisir une adresse d'arrivée";
    setStep1Errors(errors);
    if (Object.keys(errors).length === 0) setWizardStep(2);
  };

  const goToStep3 = () => {
    const errors: typeof step2Errors = {};
    if (!form.date) errors.date = 'Veuillez choisir une date';
    if (!form.time) errors.time = 'Veuillez choisir une heure';
    if (form.type === 'round_trip') {
      if (!form.returnDate) errors.returnDate = 'Veuillez choisir une date de retour';
      if (!form.returnTime) errors.returnTime = 'Veuillez choisir une heure de retour';
    }
    setStep2Errors(errors);
    if (Object.keys(errors).length === 0) setWizardStep(3);
  };

  const swap = () => {
    setForm(f => ({ ...f, departure: f.arrival, arrival: f.departure }));
    setCoords(c => ({ dep: c.arr, arr: c.dep }));
  };

  const handleBook = async (isQuote = false) => {
    const errors: typeof contactErrors = {};
    if (!contact.firstName.trim()) errors.firstName = 'Indiquez votre prénom';
    if (!contact.phone.trim()) errors.phone = 'Indiquez votre numéro de téléphone';
    setContactErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setSubmitError('');

    const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
    const configured = supabaseUrl.startsWith('https://') && !supabaseUrl.includes('your-project');

    const payload = {
      firstName: contact.firstName.trim(),
      lastName: contact.lastName.trim(),
      email: contact.email.trim() || null,
      phone: contact.phone.trim(),
      departure: form.departure,
      departureLat: coords.dep?.lat ?? null,
      departureLng: coords.dep?.lng ?? null,
      arrival: form.arrival,
      arrivalLat: coords.arr?.lat ?? null,
      arrivalLng: coords.arr?.lng ?? null,
      date: form.date,
      time: form.time,
      passengers: form.passengers,
      luggage: form.luggage,
      type: form.type,
      distanceKm,
      durationMin,
      priceEstimate,
      flightNumber: form.flightNumber || null,
      returnDate: form.returnDate || null,
      returnTime: form.returnTime || null,
      isQuote,
    };

    if (!configured) {
      // Demo mode (no Supabase configured) — keep legacy flow via client login
      localStorage.setItem('pending_booking', JSON.stringify({
        departure: form.departure, arrival: form.arrival, date: form.date, time: form.time,
        passengers: String(form.passengers), luggage: String(form.luggage), type: form.type,
        returnDate: form.returnDate || null, returnTime: form.returnTime || null,
        priceEstimate, distanceKm,
        depLat: coords.dep?.lat ?? null, depLng: coords.dep?.lng ?? null,
        arrLat: coords.arr?.lat ?? null, arrLng: coords.arr?.lng ?? null,
        flightNumber: form.flightNumber || null, isQuote,
      }));
      window.location.href = '/#/client/login';
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-booking', { body: payload });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      const { client, reservation } = data;

      // Fire-and-forget confirmations — booking is already secured regardless of outcome
      try {
        const settings = loadPublicSettings();
        if (client.email) {
          const html = buildConfirmationEmail({
            clientName: [client.first_name, client.last_name].filter(Boolean).join(' ') || client.email,
            bookingNumber: reservation.booking_number,
            date: reservation.ride_date,
            time: reservation.ride_time,
            from: reservation.departure_address,
            to: reservation.arrival_address,
            amount: `${reservation.total_price}€`,
            companyName: settings.company_name || "L'Ambassadeur des VTC",
            companyPhone: settings.company_phone || '+33 6 33 82 83 94',
            flightNumber: reservation.flight_number ?? undefined,
          });
          sendEmail(
            { to: client.email, subject: `Confirmation réservation ${reservation.booking_number}`, html },
            supabaseUrl,
          );
        }
        if (client.phone) {
          const msg = isQuote
            ? `${settings.company_name || "L'Ambassadeur des VTC"} - Votre devis ${reservation.booking_number}\n${reservation.departure_address.split(',')[0]} -> ${reservation.arrival_address.split(',')[0]}\nMontant estimé : ${reservation.total_price}€\nContact : ${settings.company_phone || '+33 6 33 82 83 94'}`
            : `${settings.company_name || "L'Ambassadeur des VTC"} - Réservation confirmée !\nN° ${reservation.booking_number}\nLe ${reservation.ride_date} à ${reservation.ride_time}\nMontant : ${reservation.total_price}€\nContact : ${settings.company_phone || '+33 6 33 82 83 94'}`;
          sendSms(client.phone, msg);
        }
      } catch { /* confirmations are best-effort */ }

      setBookingResult({ bookingNumber: reservation.booking_number, isQuote });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Une erreur est survenue. Réessayez ou appelez-nous directement.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetBooking = () => {
    setWizardStep(1);
    setForm({ departure: '', arrival: '', date: '', time: '', passengers: 1, luggage: 0, type: 'one_way', returnDate: '', returnTime: '', flightNumber: '' });
    setCoords({ dep: null, arr: null });
    setContact({ firstName: '', lastName: '', email: '', phone: '' });
    setContactErrors({});
    setBookingResult(null);
    setSubmitError('');
  };

  const typeLabel = form.type === 'one_way' ? 'Aller simple' : form.type === 'round_trip' ? 'Aller-retour' : 'Mise à disposition';

  return (
    <div className="grid lg:grid-cols-[42%_58%] min-h-[580px]">
      {/* LEFT PANEL */}
      <div className="bg-noir-950 p-5 sm:p-8 lg:p-10 flex flex-col order-1">
        {/* Step indicator */}
        {!bookingResult && (
        <div className="flex items-center justify-center mb-8">
          {([1, 2, 3] as const).map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                wizardStep > step
                  ? 'bg-sapphire-600/40 text-sapphire-200'
                  : wizardStep === step
                  ? 'bg-sapphire-600 text-white shadow-lg shadow-sapphire-900/50'
                  : 'bg-white/10 text-noir-500'
              }`}>
                {wizardStep > step ? <CheckCircle className="w-4 h-4" /> : step}
              </div>
              {idx < 2 && (
                <div className={`w-14 h-0.5 mx-1 transition-all ${wizardStep > step ? 'bg-sapphire-600/40' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>
        )}

        {/* SUCCESS — booking confirmed */}
        {bookingResult && (
          <div key="success" className="flex-1 flex flex-col items-center justify-center text-center animate-slide-up py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-5">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {bookingResult.isQuote ? 'Devis envoyé !' : 'Réservation confirmée !'}
            </h3>
            <p className="text-noir-300 text-sm mb-1">
              Numéro : <span className="text-sapphire-300 font-mono font-semibold">{bookingResult.bookingNumber}</span>
            </p>
            <p className="text-noir-500 text-xs mb-7 max-w-xs leading-relaxed">
              Vous allez recevoir un email et un SMS de confirmation avec tous les détails de votre trajet.
            </p>
            <div className="w-full space-y-2.5">
              <button onClick={resetBooking} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                Faire une nouvelle réservation
              </button>
              <a href="/#/client/login" className="block text-center text-xs text-noir-500 hover:text-sapphire-400 transition-colors py-1">
                Créer un compte pour suivre vos réservations →
              </a>
            </div>
          </div>
        )}

        {/* STEP 1 — Votre trajet */}
        {!bookingResult && wizardStep === 1 && (
          <div key="step1" className="flex-1 flex flex-col animate-slide-up">
            <h3 className="text-lg font-semibold text-white mb-5">Votre trajet</h3>

            <div className="flex gap-1.5 mb-6 p-1 bg-white/5 rounded-xl">
              {([['one_way', 'Aller', 'Aller simple'], ['round_trip', 'A/R', 'Aller-retour'], ['disposal', 'Dispo.', 'Mise à dispo']] as const).map(([val, shortLabel, fullLabel]) => (
                <button key={val} onClick={() => setForm(f => ({ ...f, type: val }))}
                  className={`flex-1 py-2.5 px-1.5 rounded-lg text-xs font-medium transition-all ${form.type === val ? 'bg-sapphire-600 text-white' : 'text-noir-400 hover:text-white'}`}>
                  <span className="hidden xs:inline">{fullLabel}</span>
                  <span className="xs:hidden">{shortLabel}</span>
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-noir-400 mb-1.5">Départ</label>
                <AddressAutocomplete
                  value={form.departure}
                  onChange={v => { setForm(f => ({ ...f, departure: v })); setStep1Errors(e => ({ ...e, departure: undefined })); }}
                  onSelect={r => { setForm(f => ({ ...f, departure: r.label })); setCoords(c => ({ ...c, dep: r.lat ? r : null })); setStep1Errors(e => ({ ...e, departure: undefined })); }}
                  placeholder="Adresse de départ..."
                />
                {step1Errors.departure && <p className="mt-1 text-xs text-red-400">{step1Errors.departure}</p>}
              </div>

              <div className="flex justify-center">
                <button onClick={swap} type="button"
                  className="w-9 h-9 rounded-full bg-sapphire-600/20 border border-sapphire-500/30 flex items-center justify-center text-sapphire-400 hover:bg-sapphire-600/30 transition-colors">
                  <ArrowUpDown className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-noir-400 mb-1.5">Arrivée</label>
                <AddressAutocomplete
                  value={form.arrival}
                  onChange={v => { setForm(f => ({ ...f, arrival: v })); setStep1Errors(e => ({ ...e, arrival: undefined })); }}
                  onSelect={r => { setForm(f => ({ ...f, arrival: r.label })); setCoords(c => ({ ...c, arr: r.lat ? r : null })); setStep1Errors(e => ({ ...e, arrival: undefined })); }}
                  placeholder="Adresse d'arrivée..."
                />
                {step1Errors.arrival && <p className="mt-1 text-xs text-red-400">{step1Errors.arrival}</p>}
              </div>
            </div>

            <div className="mt-auto pt-6">
              <button onClick={goToStep2} className="w-full btn-primary flex items-center justify-center gap-2 py-3">
                Suivant <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Quand ? */}
        {!bookingResult && wizardStep === 2 && (
          <div key="step2" className="flex-1 flex flex-col animate-slide-up">
            <h3 className="text-lg font-semibold text-white mb-5">Quand ?</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-noir-400 mb-1.5">Date de départ</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500 pointer-events-none" />
                    <input value={form.date} onChange={e => { setForm(f => ({ ...f, date: e.target.value })); setStep2Errors(er => ({ ...er, date: undefined })); }}
                      type="date" min={today} className="input-field pl-9" />
                  </div>
                  {step2Errors.date && <p className="mt-1 text-xs text-red-400">{step2Errors.date}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-noir-400 mb-1.5">Heure de départ</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500 pointer-events-none" />
                    <input value={form.time} onChange={e => { setForm(f => ({ ...f, time: e.target.value })); setStep2Errors(er => ({ ...er, time: undefined })); }}
                      type="time" className="input-field pl-9" />
                  </div>
                  {step2Errors.time && <p className="mt-1 text-xs text-red-400">{step2Errors.time}</p>}
                </div>
              </div>

              {form.type === 'round_trip' && (
                <div className="grid grid-cols-2 gap-3 pl-3 border-l-2 border-sapphire-500/30">
                  <div>
                    <label className="block text-xs font-medium text-noir-400 mb-1.5">Date retour</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500 pointer-events-none" />
                      <input value={form.returnDate} onChange={e => { setForm(f => ({ ...f, returnDate: e.target.value })); setStep2Errors(er => ({ ...er, returnDate: undefined })); }}
                        type="date" min={form.date || today} className="input-field pl-9" />
                    </div>
                    {step2Errors.returnDate && <p className="mt-1 text-xs text-red-400">{step2Errors.returnDate}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-noir-400 mb-1.5">Heure retour</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500 pointer-events-none" />
                      <input value={form.returnTime} onChange={e => { setForm(f => ({ ...f, returnTime: e.target.value })); setStep2Errors(er => ({ ...er, returnTime: undefined })); }}
                        type="time" className="input-field pl-9" />
                    </div>
                    {step2Errors.returnTime && <p className="mt-1 text-xs text-red-400">{step2Errors.returnTime}</p>}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-noir-400 mb-2">Passagers</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setForm(f => ({ ...f, passengers: Math.max(1, f.passengers - 1) }))}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition-colors">−</button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold text-white">{form.passengers}</span>
                    <span className="text-xs text-noir-400 ml-2">passager{form.passengers > 1 ? 's' : ''}</span>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, passengers: Math.min(5, f.passengers + 1) }))}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition-colors">+</button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-noir-400 mb-2">Bagages</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setForm(f => ({ ...f, luggage: Math.max(0, f.luggage - 1) }))}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition-colors">−</button>
                  <div className="flex-1 text-center">
                    <span className="text-2xl font-bold text-white">{form.luggage}</span>
                    <span className="text-xs text-noir-400 ml-2">bagage{form.luggage > 1 ? 's' : ''}</span>
                  </div>
                  <button onClick={() => setForm(f => ({ ...f, luggage: Math.min(6, f.luggage + 1) }))}
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white font-bold transition-colors">+</button>
                </div>
              </div>

              {isAirport && (
                <div className="rounded-xl bg-sapphire-600/5 border border-sapphire-500/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Plane className="w-4 h-4 text-sapphire-400" />
                    <label className="text-xs font-semibold text-sapphire-300 uppercase tracking-wide">Transfert aéroport détecté</label>
                  </div>
                  <p className="text-xs text-noir-400 mb-3">Votre numéro de vol permet au chauffeur de suivre les retards en temps réel.</p>
                  <input type="text" value={form.flightNumber}
                    onChange={e => setForm(f => ({ ...f, flightNumber: e.target.value.toUpperCase() }))}
                    placeholder="Ex : AF1234, EZY3321, FR7788..."
                    className="input-field uppercase tracking-widest font-mono text-sm" maxLength={8} />
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 flex gap-3">
              <button onClick={() => setWizardStep(1)} className="flex-1 btn-secondary flex items-center justify-center gap-2 py-3">← Retour</button>
              <button onClick={goToStep3} className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">Suivant <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        {/* STEP 3 — Récapitulatif */}
        {!bookingResult && wizardStep === 3 && (
          <div key="step3" className="flex-1 flex flex-col animate-slide-up">
            <h3 className="text-lg font-semibold text-white mb-5">Récapitulatif</h3>

            <div className="rounded-xl bg-white/[0.03] border border-white/8 divide-y divide-white/5 mb-5">
              <div className="px-4 py-3 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-sapphire-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-noir-500 mb-0.5">Itinéraire</p>
                  <p className="text-sm text-white font-medium truncate">{form.departure}</p>
                  <p className="text-xs text-noir-400 mt-0.5">→ {form.arrival}</p>
                </div>
              </div>
              <div className="px-4 py-3 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-sapphire-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-noir-500 mb-0.5">Date &amp; heure</p>
                  <p className="text-sm text-white font-medium">{form.date} à {form.time}</p>
                  {form.type === 'round_trip' && form.returnDate && (
                    <p className="text-xs text-noir-400 mt-0.5">Retour : {form.returnDate} à {form.returnTime}</p>
                  )}
                </div>
              </div>
              <div className="px-4 py-3 flex items-center gap-3">
                <Users className="w-4 h-4 text-sapphire-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-noir-500 mb-0.5">Passagers &amp; bagages</p>
                  <p className="text-sm text-white font-medium">{form.passengers} passager{form.passengers > 1 ? 's' : ''} · {form.luggage} bagage{form.luggage > 1 ? 's' : ''}</p>
                </div>
              </div>
              {form.flightNumber && (
                <div className="px-4 py-3 flex items-center gap-3">
                  <Plane className="w-4 h-4 text-sapphire-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-noir-500 mb-0.5">Numéro de vol</p>
                    <p className="text-sm text-white font-mono font-bold">{form.flightNumber}</p>
                  </div>
                </div>
              )}
              <div className="px-4 py-3 flex items-center gap-3">
                <Car className="w-4 h-4 text-sapphire-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-noir-500 mb-0.5">Type de trajet</p>
                  <p className="text-sm text-white font-medium">{typeLabel}</p>
                </div>
              </div>
            </div>

            {priceEstimate !== null && distanceKm !== null ? (
              <div className="rounded-xl bg-sapphire-600/10 border border-sapphire-500/20 overflow-hidden mb-5">
                <div className="flex items-end justify-between px-5 py-4">
                  <div>
                    <p className="text-xs text-sapphire-400 uppercase tracking-wide font-medium mb-1">Prix estimé</p>
                    <p className="text-4xl font-bold text-sapphire-300 leading-none">{priceEstimate}€ <span className="text-sm font-normal text-noir-400">TTC</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-noir-500">Acompte (20%)</p>
                    <p className="text-lg font-semibold text-white">{Math.round(priceEstimate * 0.2)}€</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-5 py-2 border-t border-sapphire-500/10 bg-sapphire-600/5">
                  <Navigation className="w-3.5 h-3.5 text-sapphire-400" />
                  <p className="text-xs text-noir-400">{distanceKm} km{durationMin !== null ? ` · ${durationMin} min` : ''} · {PRICE_KM.toFixed(2).replace('.', ',')}€/km</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-sapphire-600/10 border border-sapphire-500/20 px-4 py-3 mb-5 text-center">
                <p className="text-sm text-noir-400">Prix sur devis (adresses sans coordonnées précises)</p>
              </div>
            )}

            {/* Contact info — no account required */}
            <div className="rounded-xl bg-white/[0.03] border border-white/8 p-4 mb-5 space-y-3">
              <p className="text-xs font-medium text-noir-400 mb-1">Vos coordonnées <span className="text-noir-600">(pour la confirmation)</span></p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500 pointer-events-none" />
                    <input value={contact.firstName}
                      onChange={e => { setContact(c => ({ ...c, firstName: e.target.value })); setContactErrors(er => ({ ...er, firstName: undefined })); }}
                      placeholder="Prénom" className="input-field pl-9" autoComplete="given-name" />
                  </div>
                  {contactErrors.firstName && <p className="mt-1 text-xs text-red-400">{contactErrors.firstName}</p>}
                </div>
                <div>
                  <input value={contact.lastName}
                    onChange={e => setContact(c => ({ ...c, lastName: e.target.value }))}
                    placeholder="Nom" className="input-field" autoComplete="family-name" />
                </div>
              </div>
              <div>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500 pointer-events-none" />
                  <input value={contact.phone} type="tel"
                    onChange={e => { setContact(c => ({ ...c, phone: e.target.value })); setContactErrors(er => ({ ...er, phone: undefined })); }}
                    placeholder="Téléphone" className="input-field pl-9" autoComplete="tel" />
                </div>
                {contactErrors.phone && <p className="mt-1 text-xs text-red-400">{contactErrors.phone}</p>}
              </div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500 pointer-events-none" />
                <input value={contact.email} type="email"
                  onChange={e => setContact(c => ({ ...c, email: e.target.value }))}
                  placeholder="Email (optionnel)" className="input-field pl-9" autoComplete="email" />
              </div>
            </div>

            {submitError && (
              <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-300">{submitError}</p>
              </div>
            )}

            <div className="space-y-3">
              <button onClick={() => handleBook(false)} disabled={submitting} className="w-full btn-primary flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-60">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Car className="w-4 h-4" />}
                {submitting ? 'Réservation en cours...' : 'Réserver maintenant'}
              </button>
              <button onClick={() => handleBook(true)} disabled={submitting} className="w-full btn-secondary flex items-center justify-center gap-2 py-3 disabled:opacity-60">
                <Send className="w-4 h-4" /> Demander un devis
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-3 text-xs text-noir-500 flex-wrap">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Paiement sécurisé</span>
              <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Confirmation immédiate</span>
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Assistance 24/7</span>
            </div>

            <button onClick={() => setWizardStep(2)} disabled={submitting} className="mt-3 w-full text-sm text-noir-500 hover:text-noir-300 transition-colors py-1 disabled:opacity-50">← Retour</button>
          </div>
        )}
      </div>

      {/* RIGHT — MAP */}
      <div className="relative min-h-[280px] sm:min-h-[340px] lg:min-h-full order-2 bg-noir-900">
        <MapContainer
          center={[43.12, 5.93]}
          zoom={10}
          zoomControl={false}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', minHeight: '280px', background: '#0a0a0a' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/attributions">CartoDB</a>'
          />
          <ZoomControl position="bottomright" />
          <MapFitter dep={coords.dep} arr={coords.arr} />
          {coords.dep && coords.dep.lat && (
            <Marker position={[coords.dep.lat, coords.dep.lng]} icon={departIcon} />
          )}
          {coords.arr && coords.arr.lat && (
            <Marker position={[coords.arr.lat, coords.arr.lng]} icon={arriveIcon} />
          )}
          {routeCoords.length > 0 && (
            <Polyline positions={routeCoords} pathOptions={{ color: '#336cff', opacity: 0.8, weight: 4, lineCap: 'round', lineJoin: 'round' }} />
          )}
        </MapContainer>

        {/* Loading spinner overlay */}
        {routeLoading && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center pointer-events-none">
            <div className="bg-noir-950/70 backdrop-blur-sm rounded-full p-4">
              <Loader2 className="w-7 h-7 text-sapphire-400 animate-spin" />
            </div>
          </div>
        )}

        {/* Price pill overlay */}
        {priceEstimate !== null && distanceKm !== null && (
          <div className="absolute bottom-4 left-4 z-[1000] glass rounded-2xl px-5 py-3 shadow-2xl border border-sapphire-500/20">
            <p className="text-[10px] text-sapphire-400 uppercase tracking-wider font-medium mb-0.5">Tarif estimé</p>
            <p className="text-2xl font-bold text-white leading-none">{priceEstimate}€ <span className="text-xs font-normal text-noir-400">TTC</span></p>
            <p className="text-[11px] text-noir-400 mt-1">{distanceKm} km{durationMin !== null ? ` · ${durationMin} min` : ''}</p>
          </div>
        )}
      </div>
    </div>
  );
}
