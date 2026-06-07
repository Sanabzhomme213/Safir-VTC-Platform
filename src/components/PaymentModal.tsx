import { useState, useEffect, useRef } from 'react';
import { X, CreditCard, Lock, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../lib/supabase';
import { supabase } from '../lib/supabase';
import type { Reservation, Client } from '../lib/supabase';

/* ── Types SumUp SDK (chargé dynamiquement) ──────────────────── */
declare global {
  interface Window {
    SumUpCard?: {
      mount: (options: {
        id: string;
        checkoutId: string;
        onResponse: (type: string, body: unknown) => void;
        showInstallments?: boolean;
        showSubmitButton?: boolean;
        locale?: string;
      }) => void;
      unmount: () => void;
    };
  }
}

interface Props {
  reservation: Reservation;
  client: Client | null;
  paymentType: 'deposit' | 'balance';
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

const SUMUP_SDK_URL = 'https://gateway.sumupapis.com/integration/sdk/sumup-card.js';

export default function PaymentModal({ reservation, client, paymentType, amount, onSuccess, onClose }: Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'widget' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const sdkLoaded = useRef(false);

  /* Charger le SDK SumUp une seule fois */
  useEffect(() => {
    if (document.querySelector(`script[src="${SUMUP_SDK_URL}"]`)) {
      sdkLoaded.current = true;
      return;
    }
    const script = document.createElement('script');
    script.src = SUMUP_SDK_URL;
    script.async = true;
    script.onload = () => { sdkLoaded.current = true; };
    document.head.appendChild(script);
  }, []);

  const handleStartPayment = async () => {
    setStatus('loading');
    setError('');

    try {
      /* 1. Créer le checkout SumUp via Edge Function */
      const { data, error: fnError } = await supabase.functions.invoke('create-payment', {
        body: {
          amount,
          currency: 'EUR',
          reservationId: reservation.id,
          bookingNumber: reservation.booking_number,
          type: paymentType,
          clientEmail: client?.email,
          clientName: client ? `${client.first_name} ${client.last_name}` : '',
        },
      });

      if (fnError || !data?.checkoutId) {
        throw new Error(fnError?.message ?? 'Erreur création paiement SumUp');
      }

      setStatus('widget');

      /* 2. Monter le widget SumUp après le rendu */
      setTimeout(() => {
        const sdk = window.SumUpCard;
        if (!sdk) {
          setError('SDK SumUp non chargé. Vérifiez votre connexion et réessayez.');
          setStatus('error');
          return;
        }
        sdk.mount({
          id: 'sumup-card-widget',
          checkoutId: data.checkoutId,
          locale: 'fr-FR',
          showInstallments: false,
          onResponse: (type: string) => {
            if (type === 'success') {
              setStatus('success');
              setTimeout(onSuccess, 1500);
            } else if (type === 'error' || type === 'failure') {
              setError('Paiement refusé. Vérifiez vos informations de carte.');
              setStatus('error');
            }
          },
        });
      }, 300);
    } catch (e) {
      setError((e as Error).message);
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-noir-900 border border-white/10 rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-sapphire-400" />
            {paymentType === 'deposit' ? 'Paiement acompte' : 'Paiement solde'}
          </h2>
          <button onClick={onClose} className="text-noir-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Montant */}
          <div className="bg-sapphire-600/10 border border-sapphire-500/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-noir-400">{paymentType === 'deposit' ? 'Acompte à encaisser' : 'Solde à encaisser'}</p>
              <p className="text-3xl font-bold text-white mt-1">{formatCurrency(amount)}</p>
              <p className="text-xs text-noir-400 mt-1">Réservation {reservation.booking_number}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
              <Lock className="w-3 h-3" />
              Sécurisé
            </div>
          </div>

          {/* Succès */}
          {status === 'success' && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Paiement accepté !</h3>
              <p className="text-noir-300 text-sm">{formatCurrency(amount)} encaissé avec succès</p>
            </div>
          )}

          {/* Chargement initial */}
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-sapphire-400" />
              <p className="text-noir-300 text-sm">Préparation du terminal SumUp...</p>
            </div>
          )}

          {/* Erreur */}
          {status === 'error' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">{error}</p>
                  {error.includes('SUMUP') && (
                    <p className="text-xs text-red-300 mt-1">
                      Configurez <code className="font-mono">SUMUP_API_KEY</code> et <code className="font-mono">SUMUP_MERCHANT_CODE</code> dans Supabase → Edge Functions → Secrets.
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => { setStatus('idle'); setError(''); }} className="btn-secondary w-full">
                Réessayer
              </button>
            </div>
          )}

          {/* Widget SumUp */}
          {status === 'widget' && (
            <div>
              <div
                id="sumup-card-widget"
                className="rounded-xl overflow-hidden min-h-[300px] bg-white"
              />
              <p className="text-center text-xs text-noir-600 mt-3">
                Paiement sécurisé par <strong className="text-noir-400">SumUp</strong>
              </p>
            </div>
          )}

          {/* Bouton initial */}
          {status === 'idle' && (
            <button
              onClick={handleStartPayment}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base"
            >
              <Lock className="w-4 h-4" />
              Payer {formatCurrency(amount)} via SumUp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
