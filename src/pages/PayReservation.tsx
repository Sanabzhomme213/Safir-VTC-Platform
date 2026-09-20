import { useEffect, useState } from 'react';
import { useParams, useSearchParams, NavLink } from 'react-router-dom';
import { Car, MapPin, Calendar, Clock, ShieldCheck, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { supabase, formatCurrency, formatDate } from '../lib/supabase';
import type { Reservation } from '../lib/supabase';
import PaymentModal from '../components/PaymentModal';

type LoadState = 'loading' | 'ready' | 'invalid' | 'already_paid' | 'error';

export default function PayReservationPage() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();
  const token = params.get('t') ?? '';
  const requestedType = params.get('type') === 'balance' ? 'balance' : 'deposit';

  const [state, setState] = useState<LoadState>('loading');
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id || !token) { setState('invalid'); return; }
      const { data, error } = await supabase.from('reservations').select('*').eq('id', id).maybeSingle();
      if (error || !data || data.payment_token !== token) { setState('invalid'); return; }
      if (requestedType === 'deposit' && data.status !== 'pending') { setState('already_paid'); setReservation(data); return; }
      if (requestedType === 'balance' && data.status !== 'deposit_paid') { setState('already_paid'); setReservation(data); return; }
      setReservation(data);
      setState('ready');
    }
    load().catch(() => setState('error'));
  }, [id, token, requestedType]);

  const amount = reservation
    ? (requestedType === 'deposit' ? reservation.deposit_amount : reservation.total_price - reservation.deposit_amount)
    : 0;

  const handleSuccess = async () => {
    if (!reservation) return;
    try {
      const fn = requestedType === 'deposit' ? 'confirm-deposit' : 'confirm-balance';
      await supabase.functions.invoke(fn, { body: { reservationId: reservation.id, amount } });
    } catch { /* payment was captured by SumUp regardless — admin can reconcile manually */ }
    setPaying(false);
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-noir-950 flex flex-col items-center px-4 py-10">
      <NavLink to="/" className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-sapphire-600 flex items-center justify-center shadow-lg shadow-sapphire-600/30">
          <Car className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-white">L'Ambassadeur des VTC</span>
      </NavLink>

      <div className="w-full max-w-md">
        {state === 'loading' && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-sapphire-400" />
            <p className="text-noir-400 text-sm">Chargement de votre réservation...</p>
          </div>
        )}

        {state === 'invalid' && (
          <div className="glass rounded-2xl border border-red-500/20 p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h1 className="text-lg font-bold text-white mb-1">Lien invalide ou expiré</h1>
            <p className="text-noir-400 text-sm">Contactez-nous pour recevoir un nouveau lien de paiement.</p>
          </div>
        )}

        {state === 'error' && (
          <div className="glass rounded-2xl border border-red-500/20 p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h1 className="text-lg font-bold text-white mb-1">Une erreur est survenue</h1>
            <p className="text-noir-400 text-sm">Réessayez dans quelques instants ou contactez-nous.</p>
          </div>
        )}

        {state === 'already_paid' && (
          <div className="glass rounded-2xl border border-emerald-500/20 p-8 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h1 className="text-lg font-bold text-white mb-1">Déjà réglé</h1>
            <p className="text-noir-400 text-sm">Ce paiement a déjà été pris en compte. Merci de votre confiance !</p>
          </div>
        )}

        {done && (
          <div className="glass rounded-2xl border border-emerald-500/20 p-8 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h1 className="text-lg font-bold text-white mb-1">Paiement reçu !</h1>
            <p className="text-noir-400 text-sm">Votre réservation {reservation?.booking_number} est confirmée. Vous recevrez un SMS de confirmation.</p>
          </div>
        )}

        {state === 'ready' && reservation && !done && (
          <div className="glass rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <p className="text-xs text-sapphire-400 uppercase tracking-wide font-medium mb-1">
                {requestedType === 'deposit' ? "Paiement de l'acompte" : 'Paiement du solde'}
              </p>
              <p className="font-mono text-sm text-noir-400">{reservation.booking_number}</p>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-sapphire-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-white truncate">{reservation.departure_address}</p>
                  <p className="text-noir-400 truncate">→ {reservation.arrival_address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-noir-300">
                <Calendar className="w-4 h-4 text-sapphire-400 shrink-0" />
                {formatDate(reservation.ride_date)}
                <Clock className="w-4 h-4 text-sapphire-400 shrink-0 ml-2" />
                {reservation.ride_time?.slice(0, 5)}
              </div>
            </div>
            <div className="p-6 bg-sapphire-600/10 border-t border-sapphire-500/20">
              <p className="text-xs text-noir-400 mb-1">Montant à régler</p>
              <p className="text-3xl font-bold text-white mb-4">{formatCurrency(amount)}</p>
              <button onClick={() => setPaying(true)} className="w-full btn-primary flex items-center justify-center gap-2 py-3.5">
                <ShieldCheck className="w-4 h-4" /> Payer maintenant
              </button>
            </div>
          </div>
        )}
      </div>

      {paying && reservation && (
        <PaymentModal
          reservation={reservation}
          client={null}
          paymentType={requestedType}
          amount={amount}
          onSuccess={handleSuccess}
          onClose={() => setPaying(false)}
        />
      )}
    </div>
  );
}
