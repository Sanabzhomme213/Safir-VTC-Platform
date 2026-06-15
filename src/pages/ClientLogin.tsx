import { useState } from 'react';
import {
  Car, Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle,
  Loader2, MapPin, Calendar, User,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { signInWithPassword, signUpWithPassword, resetPassword } from '../lib/clientAuth';

type Mode = 'login' | 'signup' | 'forgot' | 'confirm' | 'forgot-sent';

function getPendingBooking() {
  try {
    const raw = localStorage.getItem('pending_booking');
    if (raw) return JSON.parse(raw) as { departure: string; arrival: string; date: string; time: string; priceEstimate: number | null; isQuote: boolean };
  } catch {}
  return null;
}

export default function ClientLoginPage() {
  const [mode, setMode] = useState<Mode>('login');
  const pending = getPendingBooking();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => { setError(''); setPassword(''); setConfirm(''); };

  const handleLogin = async () => {
    if (!email || !password) { setError('Remplissez tous les champs.'); return; }
    setLoading(true); setError('');
    const { ok, error: err } = await signInWithPassword(email, password);
    setLoading(false);
    if (ok) window.location.replace('/#/client/dashboard');
    else setError(err ?? 'Erreur de connexion');
  };

  const handleSignup = async () => {
    if (!email || !password) { setError('Remplissez tous les champs.'); return; }
    if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères.'); return; }
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoading(true); setError('');
    const { ok, error: err, needsConfirmation } = await signUpWithPassword(email, password, firstName, lastName);
    setLoading(false);
    if (!ok) { setError(err ?? 'Erreur lors de la création du compte'); return; }
    if (needsConfirmation) setMode('confirm');
    else window.location.replace('/#/client/dashboard');
  };

  const handleForgot = async () => {
    if (!email) { setError('Entrez votre email.'); return; }
    setLoading(true); setError('');
    const { ok, error: err } = await resetPassword(email);
    setLoading(false);
    if (ok) setMode('forgot-sent');
    else setError(err ?? 'Erreur');
  };

  return (
    <div className="min-h-screen bg-noir-950 flex flex-col">
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

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Mon Espace Client</h1>
            <p className="text-noir-400 text-sm mt-2">Gérez vos réservations et votre programme fidélité</p>
          </div>

          {/* Pending booking banner */}
          {pending && (
            <div className="mb-6 rounded-xl bg-sapphire-600/10 border border-sapphire-500/20 p-4">
              <p className="text-xs text-sapphire-400 font-semibold uppercase tracking-wide mb-2">
                {pending.isQuote ? 'Demande de devis en attente' : 'Réservation en attente'}
              </p>
              <div className="space-y-1 text-sm text-noir-200">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-sapphire-400 mt-0.5 shrink-0" />
                  <span className="truncate">{pending.departure} → {pending.arrival}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-sapphire-400 shrink-0" />
                  <span>{pending.date} à {pending.time}</span>
                </div>
                {pending.priceEstimate != null && (
                  <p className="text-sapphire-300 font-semibold mt-1">Estimation : {pending.priceEstimate}€</p>
                )}
              </div>
              <p className="text-xs text-noir-500 mt-2">Connectez-vous pour confirmer votre demande.</p>
            </div>
          )}

          <div className="glass rounded-2xl border border-white/10 overflow-hidden">

            {/* ── LOGIN ── */}
            {mode === 'login' && (
              <div>
                {/* Tab switcher */}
                <div className="flex border-b border-white/8">
                  <button className="flex-1 py-3.5 text-sm font-semibold text-white border-b-2 border-sapphire-500 -mb-px bg-sapphire-600/5">
                    Se connecter
                  </button>
                  <button
                    onClick={() => { setMode('signup'); reset(); }}
                    className="flex-1 py-3.5 text-sm font-medium text-noir-400 hover:text-white transition-colors"
                  >
                    Créer un compte
                  </button>
                </div>

                <div className="p-8 space-y-4">
                  <div>
                    <label className="block text-sm text-noir-300 mb-1.5">Adresse email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        placeholder="votre@email.fr"
                        className="input-field pl-10"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm text-noir-300">Mot de passe</label>
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); reset(); }}
                        className="text-xs text-sapphire-400 hover:text-sapphire-300 transition-colors"
                      >
                        Mot de passe oublié ?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500 pointer-events-none" />
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleLogin()}
                        placeholder="••••••••"
                        className="input-field pl-10 pr-10"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-500 hover:text-white transition-colors"
                      >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? 'Connexion...' : 'Se connecter'}
                  </button>
                </div>
              </div>
            )}

            {/* ── SIGNUP ── */}
            {mode === 'signup' && (
              <div>
                <div className="flex border-b border-white/8">
                  <button
                    onClick={() => { setMode('login'); reset(); }}
                    className="flex-1 py-3.5 text-sm font-medium text-noir-400 hover:text-white transition-colors"
                  >
                    Se connecter
                  </button>
                  <button className="flex-1 py-3.5 text-sm font-semibold text-white border-b-2 border-sapphire-500 -mb-px bg-sapphire-600/5">
                    Créer un compte
                  </button>
                </div>

                <div className="p-8 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-noir-300 mb-1.5">Prénom</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500 pointer-events-none" />
                        <input
                          type="text"
                          value={firstName}
                          onChange={e => setFirstName(e.target.value)}
                          placeholder="Jean"
                          className="input-field pl-10"
                          autoComplete="given-name"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-noir-300 mb-1.5">Nom</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        placeholder="Dupont"
                        className="input-field"
                        autoComplete="family-name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-noir-300 mb-1.5">Adresse email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500 pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="votre@email.fr"
                        className="input-field pl-10"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-noir-300 mb-1.5">Mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500 pointer-events-none" />
                      <input
                        type={showPwd ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Au moins 6 caractères"
                        className="input-field pl-10 pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-500 hover:text-white transition-colors"
                      >
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-noir-300 mb-1.5">Confirmer le mot de passe</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500 pointer-events-none" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSignup()}
                        placeholder="••••••••"
                        className="input-field pl-10 pr-10"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-500 hover:text-white transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <button
                    onClick={handleSignup}
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {loading ? 'Création...' : 'Créer mon compte'}
                  </button>

                  <p className="text-xs text-noir-500 text-center">
                    En créant un compte, vous acceptez nos{' '}
                    <span className="text-sapphire-400">Conditions Générales</span>.
                  </p>
                </div>
              </div>
            )}

            {/* ── EMAIL CONFIRMATION REQUIRED ── */}
            {mode === 'confirm' && (
              <div className="p-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-sapphire-600/15 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-sapphire-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Confirmez votre email</h3>
                  <p className="text-noir-300 text-sm">
                    Un email de confirmation a été envoyé à<br />
                    <strong className="text-white">{email}</strong>
                  </p>
                  <p className="text-noir-400 text-sm mt-3">
                    Cliquez sur le lien dans l'email pour activer votre compte, puis revenez vous connecter.
                  </p>
                </div>
                <button
                  onClick={() => { setMode('login'); reset(); }}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Retour à la connexion
                </button>
              </div>
            )}

            {/* ── FORGOT PASSWORD ── */}
            {mode === 'forgot' && (
              <div className="p-8 space-y-5">
                <button
                  onClick={() => { setMode('login'); reset(); }}
                  className="flex items-center gap-1.5 text-sm text-noir-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Retour
                </button>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Mot de passe oublié</h3>
                  <p className="text-sm text-noir-300">Entrez votre email pour recevoir un lien de réinitialisation.</p>
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1.5">Adresse email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleForgot()}
                      placeholder="votre@email.fr"
                      className="input-field pl-10"
                      autoComplete="email"
                    />
                  </div>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  onClick={handleForgot}
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {loading ? 'Envoi...' : 'Envoyer le lien'}
                </button>
              </div>
            )}

            {/* ── FORGOT SENT ── */}
            {mode === 'forgot-sent' && (
              <div className="p-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Email envoyé !</h3>
                  <p className="text-noir-300 text-sm">
                    Consultez votre boîte mail <strong className="text-white">{email}</strong><br />
                    et cliquez sur le lien pour réinitialiser votre mot de passe.
                  </p>
                </div>
                <button
                  onClick={() => { setMode('login'); reset(); }}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Retour à la connexion
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
