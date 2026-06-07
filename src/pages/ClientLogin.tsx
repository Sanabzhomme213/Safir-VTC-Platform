import { useState } from 'react';
import { Car, Mail, Phone, ArrowLeft, CheckCircle, Loader2, ArrowRight, MapPin, Calendar } from 'lucide-react';
import { sendMagicLink, sendSmsOtp, verifySmsOtp } from '../lib/clientAuth';
import { NavLink } from 'react-router-dom';

type Step = 'method' | 'email-sent' | 'phone-input' | 'phone-otp';
type Method = 'email' | 'phone';

function getPendingBooking(): null | { departure: string; arrival: string; date: string; time: string; priceEstimate: number | null; isQuote: boolean } {
  try {
    const raw = sessionStorage.getItem('pending_booking');
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export default function ClientLoginPage() {
  const [method, setMethod] = useState<Method>('email');
  const [step, setStep] = useState<Step>('method');
  const pendingBooking = getPendingBooking();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = async () => {
    if (!email.includes('@')) { setError('Email invalide'); return; }
    setLoading(true);
    setError('');
    const { ok, error: err } = await sendMagicLink(email);
    setLoading(false);
    if (ok) setStep('email-sent');
    else setError(err ?? 'Erreur lors de l\'envoi');
  };

  const handlePhoneSubmit = async () => {
    setLoading(true);
    setError('');
    const { ok, error: err } = await sendSmsOtp(phone);
    setLoading(false);
    if (ok) setStep('phone-otp');
    else setError(err ?? 'Erreur lors de l\'envoi');
  };

  const handleOtpSubmit = async () => {
    if (otp.length < 4) { setError('Code invalide'); return; }
    setLoading(true);
    setError('');
    const { ok, error: err } = await verifySmsOtp(phone, otp);
    setLoading(false);
    if (ok) window.location.hash = '/client/dashboard';
    else setError(err ?? 'Code incorrect');
  };

  return (
    <div className="min-h-screen bg-noir-950 flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <NavLink to="/" className="flex items-center gap-2 text-white font-semibold">
          <div className="w-8 h-8 rounded-lg bg-sapphire-600 flex items-center justify-center">
            <Car className="w-4 h-4 text-white" />
          </div>
          L'Ambassadeur des VTC
        </NavLink>
      </nav>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Mon Espace Client</h1>
            <p className="text-noir-400 text-sm mt-2">Accédez à vos réservations et votre programme fidélité</p>
          </div>

          {/* Pending booking banner */}
          {pendingBooking && (
            <div className="mb-6 rounded-xl bg-sapphire-600/10 border border-sapphire-500/20 p-4">
              <p className="text-xs text-sapphire-400 font-semibold uppercase tracking-wide mb-2">
                {pendingBooking.isQuote ? 'Votre demande de devis' : 'Votre réservation en attente'}
              </p>
              <div className="space-y-1 text-sm text-noir-200">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sapphire-400 mt-0.5 shrink-0" />
                  <span className="truncate">{pendingBooking.departure} → {pendingBooking.arrival}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-sapphire-400 shrink-0" />
                  <span>{pendingBooking.date} à {pendingBooking.time}</span>
                </div>
                {pendingBooking.priceEstimate && (
                  <p className="text-sapphire-300 font-semibold mt-1">Estimation : {pendingBooking.priceEstimate}€</p>
                )}
              </div>
              <p className="text-xs text-noir-500 mt-2">Connectez-vous pour confirmer votre demande.</p>
            </div>
          )}

          <div className="glass rounded-2xl p-8 border border-white/10">

            {/* ── STEP: Method selection ── */}
            {step === 'method' && (
              <div className="space-y-5">
                {/* Tabs */}
                <div className="flex gap-1 bg-noir-950 rounded-xl p-1">
                  <button
                    onClick={() => setMethod('email')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      method === 'email' ? 'bg-sapphire-600 text-white' : 'text-noir-400 hover:text-white'
                    }`}
                  >
                    <Mail className="w-4 h-4" /> Email
                  </button>
                  <button
                    onClick={() => setMethod('phone')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      method === 'phone' ? 'bg-sapphire-600 text-white' : 'text-noir-400 hover:text-white'
                    }`}
                  >
                    <Phone className="w-4 h-4" /> SMS
                  </button>
                </div>

                {/* Email */}
                {method === 'email' && (
                  <div className="space-y-4">
                    <p className="text-sm text-noir-300">Entrez votre email — on vous envoie un lien de connexion instantané, sans mot de passe.</p>
                    <div>
                      <label className="block text-sm text-noir-300 mb-1.5">Adresse email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleEmailSubmit()}
                          placeholder="votre@email.fr"
                          className="input-field pl-10"
                          autoComplete="email"
                        />
                      </div>
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                      onClick={handleEmailSubmit}
                      disabled={loading || !email}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      {loading ? 'Envoi...' : 'Envoyer le lien de connexion'}
                    </button>
                  </div>
                )}

                {/* Phone */}
                {method === 'phone' && (
                  <div className="space-y-4">
                    <p className="text-sm text-noir-300">Entrez votre numéro — on vous envoie un code par SMS.</p>
                    <div>
                      <label className="block text-sm text-noir-300 mb-1.5">Numéro de téléphone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handlePhoneSubmit()}
                          placeholder="+33 6 12 34 56 78"
                          className="input-field pl-10"
                          autoComplete="tel"
                        />
                      </div>
                    </div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <button
                      onClick={handlePhoneSubmit}
                      disabled={loading || !phone}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
                      {loading ? 'Envoi...' : 'Envoyer le code SMS'}
                    </button>
                  </div>
                )}

                <p className="text-center text-xs text-noir-500">
                  Pas encore de compte ? Il sera créé automatiquement à votre première connexion.
                </p>
              </div>
            )}

            {/* ── STEP: Email sent ── */}
            {step === 'email-sent' && (
              <div className="text-center space-y-5 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Lien envoyé !</h3>
                  <p className="text-noir-300 text-sm">
                    Consultez votre boîte mail <strong className="text-white">{email}</strong><br />
                    Cliquez sur le lien pour vous connecter automatiquement.
                  </p>
                </div>
                <p className="text-xs text-noir-500">Pas reçu ? Vérifiez vos spams ou</p>
                <button
                  onClick={() => { setStep('method'); setError(''); }}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Réessayer
                </button>
              </div>
            )}

            {/* ── STEP: OTP verification ── */}
            {step === 'phone-otp' && (
              <div className="space-y-5">
                <button
                  onClick={() => { setStep('method'); setOtp(''); setError(''); }}
                  className="flex items-center gap-1.5 text-sm text-noir-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Code envoyé</h3>
                  <p className="text-sm text-noir-300">Entrez le code reçu par SMS au <strong className="text-white">{phone}</strong></p>
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1.5">Code de vérification</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={e => e.key === 'Enter' && handleOtpSubmit()}
                    placeholder="123456"
                    className="input-field text-center text-2xl tracking-[0.5em] font-bold"
                    maxLength={6}
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  onClick={handleOtpSubmit}
                  disabled={loading || otp.length < 4}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  {loading ? 'Vérification...' : 'Confirmer'}
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-xs text-noir-600 mt-6">
            <NavLink to="/" className="hover:text-sapphire-400 transition-colors">← Retour au site</NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}
