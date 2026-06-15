import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Car, MapPin, Star, Phone, ArrowRight, ChevronDown,
  Shield, Clock, CreditCard, Plane, CheckCircle, Menu, X,
  Users, MessageCircle, Instagram, Facebook,
  Luggage, UserCircle
} from 'lucide-react';
import BookingSection from '../components/BookingSection';

function loadPublicSettings() {
  try {
    const saved = localStorage.getItem('ambassadeur_settings');
    if (saved) return JSON.parse(saved) as Record<string, string>;
  } catch {}
  return {} as Record<string, string>;
}

const _s = loadPublicSettings();
const PHONE = _s.company_phone || '+33 6 33 82 83 94';
const EMAIL = _s.company_email || 'contact@ambassadeur-vtc.fr';
const GOOGLE_REVIEW_URL = _s.google_review_url || 'https://www.google.com/maps/search/?api=1&query=vtc+var+ambassadeur';
const INSTAGRAM_URL = _s.instagram_url || '';
const FACEBOOK_URL = _s.facebook_url || '';

const services = [
  { icon: Plane, label: 'Transfert Aéroport', desc: 'Nice, Toulon, Marseille — suivi de vol en temps réel, prise en charge garantie', price: 'Dès 45€' },
  { icon: Car, label: 'Transfert Gare', desc: 'Gare de Toulon, Saint-Raphaël, Cannes — accueil personnalisé', price: 'Dès 35€' },
  { icon: Shield, label: 'Mise à Disposition', desc: 'Chauffeur dédié à l\'heure pour vos événements, soirées, visites', price: 'Dès 45€/h' },
  { icon: Users, label: 'Transport Corporate', desc: 'Transferts professionnels, séminaires, congrès sur la Côte d\'Azur', price: 'Sur devis' },
];

const destinations = [
  { from: 'Toulon', to: 'Aéroport Nice Côte d\'Azur', price: '120€', duration: '1h20' },
  { from: 'Saint-Tropez', to: 'Aéroport Nice Côte d\'Azur', price: '180€', duration: '1h45' },
  { from: 'Fréjus', to: 'Aéroport Marseille', price: '110€', duration: '1h15' },
  { from: 'Hyères', to: 'Aéroport Toulon-Hyères', price: '35€', duration: '15min' },
  { from: 'Toulon', to: 'Monaco', price: '160€', duration: '1h30' },
  { from: 'Draguignan', to: 'Aéroport Nice Côte d\'Azur', price: '130€', duration: '1h25' },
];

const reviews = [
  { name: 'Jean-Pierre M.', rating: 5, text: "Service impeccable depuis Toulon jusqu'à Nice. Chauffeur ponctuel, véhicule luxueux. Je recommande vivement L'Ambassadeur des VTC pour tous vos transferts.", date: 'Il y a 2 jours' },
  { name: 'Marie L.', rating: 5, text: 'Prise en charge à l\'aéroport de Nice parfaite malgré mon vol retardé. Le chauffeur avait suivi le vol et était là à l\'heure. Parfait !', date: 'Il y a 5 jours' },
  { name: 'Thomas B.', rating: 5, text: "Client régulier depuis 1 an pour mes déplacements pro sur la Côte d'Azur. L'Ambassadeur des VTC, c'est la garantie d'un service premium à chaque trajet.", date: 'Il y a 1 semaine' },
  { name: 'Sophie R.', rating: 5, text: 'Transfert Saint-Tropez — Nice exceptionnel. Véhicule haut de gamme, eau et chargeur à disposition. Je ne prends plus le taxi !', date: 'Il y a 2 semaines' },
];

const faqs = [
  { q: 'Comment réserver un VTC ?', a: 'Utilisez notre formulaire en ligne, appelez-nous ou envoyez un message. Vous recevez une confirmation instantanée par email avec votre numéro de réservation unique.' },
  { q: 'Quels types de véhicules proposez-vous ?', a: 'Nous disposons d\'une Tesla Model Y 2026 noire, SUV électrique premium 5 places. Silencieux, confortable, climatisé, avec chargeur USB-C à bord.' },
  { q: 'Suivez-vous les vols en cas de retard ?', a: 'Oui, nous suivons tous les vols en temps réel. En cas de retard, votre chauffeur ajuste automatiquement l\'heure de prise en charge sans frais supplémentaires.' },
  { q: 'Quels modes de paiement acceptez-vous ?', a: 'Carte bancaire, Apple Pay, Google Pay. Un acompte de 20% est demandé à la réservation, le solde est réglé après la course.' },
  { q: 'Proposez-vous des tarifs pour les entreprises ?', a: 'Oui, nous proposons des contrats corporate avec facturation mensuelle, tarifs préférentiels et gestion centralisée des courses.' },
  { q: 'Quelles zones desservez-vous ?', a: 'Toulon, Hyères, Saint-Tropez, Fréjus, Draguignan, et tout le Var. Liaisons vers Nice, Monaco, Marseille et l\'ensemble de la Côte d\'Azur.' },
];

function StarRating({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
      ))}
    </div>
  );
}

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function AnimatedNumber({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView(0.3);
  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);
  return <span ref={ref}>{prefix}{count}{suffix}</span>;
}

export default function LandingPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [legalModal, setLegalModal] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setNavOpen(false);
  };

  return (
    <div className="bg-noir-950 text-white min-h-screen overflow-x-hidden">
      {/* NAV */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-noir-950/95 backdrop-blur-xl border-b border-white/5 shadow-xl' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sapphire-600 flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">L'Ambassadeur <span className="text-sapphire-400">des VTC</span></span>
          </a>

          <div className="hidden lg:flex items-center gap-8">
            {[['Services', 'services'], ['Destinations', 'destinations'], ['Tarifs', 'booking'], ['Avis', 'reviews'], ['FAQ', 'faq']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-sm font-medium text-noir-300 hover:text-white transition-colors">{label}</button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <a href={`tel:${PHONE}`} className="flex items-center gap-2 text-sm text-noir-300 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />{PHONE}
            </a>
            <NavLink to="/client/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-noir-300 hover:text-white transition-colors">
              <UserCircle className="w-4 h-4" /> Mon Espace
            </NavLink>
            <button onClick={() => scrollTo('booking')} className="btn-primary text-sm">Réserver</button>
          </div>

          <button onClick={() => setNavOpen(!navOpen)} className="lg:hidden p-2 text-white">
            {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {navOpen && (
          <div className="lg:hidden bg-noir-950/98 backdrop-blur-xl border-t border-white/5 px-4 py-4 space-y-2">
            {[['Services', 'services'], ['Destinations', 'destinations'], ['Réservation', 'booking'], ['Avis', 'reviews'], ['FAQ', 'faq']].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="block w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-noir-300 hover:text-white hover:bg-white/5 transition">{label}</button>
            ))}
            <div className="pt-2 border-t border-white/5">
              <a href={`tel:${PHONE}`} className="flex items-center gap-2 px-4 py-3 text-sm text-noir-300"><Phone className="w-4 h-4" />{PHONE}</a>
              <button onClick={() => scrollTo('booking')} className="w-full mt-2 btn-primary">Réserver maintenant</button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/tesla-avant.png"
            alt="Tesla noire L'Ambassadeur des VTC"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-noir-950/60 via-noir-950/40 to-noir-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-noir-950/80 to-transparent" />
        </div>

        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-sapphire-700/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pt-20 pb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sapphire-600/15 border border-sapphire-500/25 text-sapphire-300 text-sm font-medium mb-6 animate-fade-in">
              <div className="w-2 h-2 rounded-full bg-sapphire-400 animate-pulse" />
              Disponible 24h/24 — 7j/7
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-5 animate-slide-up">
              Votre chauffeur<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sapphire-400 to-sapphire-200">premium</span><br />
              <span className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white/80">dans le Var & la Côte d'Azur</span>
            </h1>

            <p className="text-base md:text-xl text-noir-300 mb-7 max-w-xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Transferts aéroport (Nice, Toulon, Marseille), gare, corporate. Tesla Model Y 2026, chauffeur pro. Confirmation immédiate.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <button onClick={() => scrollTo('booking')} className="btn-primary flex items-center justify-center gap-2 px-6 py-3.5 text-base shadow-xl shadow-sapphire-900/50">
                Réserver maintenant <ArrowRight className="w-4 h-4" />
              </button>
              {PHONE !== '+33 6 XX XX XX XX' ? (
                <a href={`tel:${PHONE}`} className="btn-secondary flex items-center justify-center gap-2 px-6 py-3.5 text-base">
                  <Phone className="w-4 h-4" /> {PHONE}
                </a>
              ) : (
                <button onClick={() => scrollTo('booking')} className="btn-secondary flex items-center justify-center gap-2 px-6 py-3.5 text-base">
                  <Phone className="w-4 h-4" /> Nous appeler
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-noir-400 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {[
                { icon: CheckCircle, text: 'Suivi de vol inclus' },
                { icon: Shield, text: 'Assurance premium' },
                { icon: CreditCard, text: 'Paiement sécurisé' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-sapphire-400" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats banner */}
        <div className="relative z-10 border-t border-white/5 bg-white/[0.02] backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="text-center">
                <div className="text-xl md:text-3xl font-black text-white">4.9/5</div>
                <div className="text-xs md:text-sm font-semibold text-noir-300 mt-0.5">Note Google</div>
                <div className="text-[10px] md:text-xs text-noir-500">+200 avis</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-3xl font-black text-white"><AnimatedNumber target={2000} suffix="+" /></div>
                <div className="text-xs md:text-sm font-semibold text-noir-300 mt-0.5">Trajets</div>
                <div className="text-[10px] md:text-xs text-noir-500">Service premium</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-3xl font-black text-white"><AnimatedNumber target={100} suffix="%" /></div>
                <div className="text-xs md:text-sm font-semibold text-noir-300 mt-0.5">Ponctualité</div>
                <div className="text-[10px] md:text-xs text-noir-500">Garantie</div>
              </div>
              <div className="text-center">
                <div className="text-xl md:text-3xl font-black text-white">24/7</div>
                <div className="text-xs md:text-sm font-semibold text-noir-300 mt-0.5">Disponible</div>
                <div className="text-[10px] md:text-xs text-noir-500">Toujours là</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce text-noir-500">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* BOOKING ENGINE */}
      <section id="booking" className="py-20 lg:py-28 bg-noir-950">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Réservez votre trajet</h2>
            <p className="text-noir-400 max-w-xl mx-auto">Obtenez un tarif instantané et réservez en 2 minutes</p>
          </div>

          <div className="glass rounded-2xl overflow-hidden glow-sapphire">
            <BookingSection />
          </div>

          <div className="mt-4 text-center text-sm text-noir-500">
            Besoin d'''aide ? <a href={`tel:${PHONE}`} className="text-sapphire-400 hover:underline">{PHONE}</a>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" className="py-20 lg:py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-sapphire-600/15 border border-sapphire-500/20 text-sapphire-400 text-xs font-semibold uppercase tracking-widest mb-4">Nos services</span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Une solution pour chaque besoin</h2>
            <p className="text-noir-400 max-w-xl mx-auto">Du simple transfert aéroport au voyage longue distance, nous couvrons tous vos déplacements.</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {services.map((s, i) => (
              <FadeIn key={s.label} delay={i * 80}>
                <div className="glass rounded-xl p-6 hover:glow-sapphire transition-all duration-300 group h-full">
                  <div className="w-12 h-12 rounded-xl bg-sapphire-600/15 flex items-center justify-center mb-4 group-hover:bg-sapphire-600/25 transition-colors">
                    <s.icon className="w-6 h-6 text-sapphire-400" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{s.label}</h3>
                  <p className="text-sm text-noir-400 mb-4 leading-relaxed">{s.desc}</p>
                  <div className="text-sapphire-400 font-semibold text-sm">{s.price}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-20 lg:py-28 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <FadeIn>
              <span className="inline-block px-3 py-1 rounded-full bg-sapphire-600/15 border border-sapphire-500/20 text-sapphire-400 text-xs font-semibold uppercase tracking-widest mb-4">Pourquoi L'Ambassadeur des VTC ?</span>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">L'excellence comme standard</h2>
              <p className="text-noir-400 mb-8 leading-relaxed">L'Ambassadeur des VTC, c'est la promesse d'un service VTC premium dans le Var et sur la Côte d'Azur. À bord d'une Tesla Model Y 2026, profitez d'un trajet silencieux, confortable et éco-responsable avec un chauffeur professionnel dédié.</p>

              <div className="space-y-4">
                {[
                  { icon: Plane, title: 'Suivi des vols en temps réel', desc: 'Votre chauffeur s\'adapte automatiquement aux retards et modifications de vol.' },
                  { icon: Clock, title: 'Ponctualité garantie', desc: 'Nous nous engageons sur l\'heure de prise en charge. Toujours à l\'heure.' },
                  { icon: Shield, title: 'Tesla Model Y 2026 assurée tous risques', desc: 'SUV électrique 2026, noir, entretenu et assuré. Zéro émission, confort maximal.' },
                  { icon: MessageCircle, title: 'Support 24h/24', desc: 'Notre équipe est joignable à tout moment par téléphone ou email.' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-sapphire-600/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-sapphire-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-0.5">{title}</h4>
                      <p className="text-sm text-noir-400">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn delay={150} className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img src="/tesla-dos.png" alt="Tesla L'Ambassadeur des VTC" className="w-full h-full object-cover opacity-95" />
                <div className="absolute inset-0 bg-gradient-to-t from-noir-950/60 to-transparent" />
              </div>
              <div className="absolute -bottom-5 -left-5 glass rounded-xl p-4 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Trajet confirmé</p>
                    <p className="text-xs text-noir-400">SAF-20250604-A1B2</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-5 -right-5 glass rounded-xl p-4 shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sapphire-500/20 flex items-center justify-center">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">4.9/5 sur Google</p>
                    <p className="text-xs text-noir-400">+200 avis vérifiés</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section id="destinations" className="py-20 lg:py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-sapphire-600/15 border border-sapphire-500/20 text-sapphire-400 text-xs font-semibold uppercase tracking-widest mb-4">Destinations populaires</span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Trajets les plus demandés</h2>
            <p className="text-noir-400">Tarifs fixes, aucune surprise. Réservez en toute confiance.</p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {destinations.map((d, i) => (
              <FadeIn key={`${d.from}-${d.to}`} delay={i * 60}>
              <button onClick={() => scrollTo('booking')}
                className="glass rounded-xl p-5 text-left hover:glow-sapphire transition-all duration-300 group w-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">{d.from}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-sapphire-400 flex-shrink-0" />
                      <span className="font-semibold truncate">{d.to}</span>
                    </div>
                    <p className="text-xs text-noir-500 mt-1">{d.duration} de trajet</p>
                  </div>
                  <div className="ml-3 text-right">
                    <p className="text-lg font-bold text-sapphire-400">{d.price}</p>
                    <p className="text-xs text-noir-500">TTC</p>
                  </div>
                </div>
                <p className="text-xs text-sapphire-400 group-hover:text-sapphire-300 transition-colors flex items-center gap-1">
                  Réserver ce trajet <ArrowRight className="w-3 h-3" />
                </p>
              </button>
              </FadeIn>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-noir-500 mb-3">Votre destination n'est pas listée ?</p>
            <button onClick={() => scrollTo('booking')} className="btn-secondary text-sm">Demander un tarif personnalisé</button>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section id="reviews" className="py-20 lg:py-28 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-sapphire-600/15 border border-sapphire-500/20 text-sapphire-400 text-xs font-semibold uppercase tracking-widest mb-4">Avis clients</span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ce que disent nos clients</h2>
            <div className="flex items-center justify-center gap-3">
              <StarRating n={5} />
              <span className="text-xl font-bold">4.9 / 5</span>
              <span className="text-noir-400 text-sm">sur Google (+200 avis)</span>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {reviews.map((r, i) => (
              <FadeIn key={r.name} delay={i * 80}>
              <div className="glass rounded-xl p-5 h-full">
                <StarRating n={r.rating} />
                <p className="mt-3 text-sm text-noir-300 leading-relaxed">"{r.text}"</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-xs text-noir-500">{r.date}</p>
                  </div>
                  <div className="w-6 h-6 opacity-40">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="text-white">
                      <path d="M12 0C5.383 0 0 5.383 0 12c0 6.616 5.383 12 12 12 6.616 0 12-5.384 12-12 0-6.617-5.384-12-12-12z" />
                    </svg>
                  </div>
                </div>
              </div>
              </FadeIn>
            ))}
          </div>

          <div className="mt-10 text-center">
            <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 btn-secondary text-sm">
              <Star className="w-4 h-4 text-amber-400" /> Laisser un avis Google
            </a>
          </div>
        </div>
      </section>

      {/* FLEET */}
      <section className="py-20 lg:py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-sapphire-600/15 border border-sapphire-500/20 text-sapphire-400 text-xs font-semibold uppercase tracking-widest mb-4">Notre véhicule</span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Tesla Model Y 2026 — Noir Minuit</h2>
            <p className="text-noir-400">Une berline électrique premium pour un trajet silencieux, confortable et éco-responsable</p>
          </div>

          <div className="max-w-2xl mx-auto">
            {[
              { name: 'Tesla Model Y', model: '2026 — Noir Minuit', seats: 4, luggage: 4, img: '/tesla-avant.png', features: ['100% électrique', 'Silencieux', 'Climatisation auto', 'Chargeur USB-C', 'Eau minérale', 'Autopilot'] },
            ].map((v) => (
              <div key={v.name} className="glass rounded-2xl overflow-hidden group">
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={v.img} alt={v.name} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-500" />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-0.5">{v.name}</h3>
                      <p className="text-sm text-noir-500">{v.model}</p>
                    </div>
                    <span className="badge-success">Disponible</span>
                  </div>
                  <div className="flex gap-6 text-sm text-noir-400 mb-5">
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-sapphire-400" /> {v.seats} passagers max</span>
                    <span className="flex items-center gap-1.5"><Luggage className="w-4 h-4 text-sapphire-400" /> {v.luggage} bagages</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {v.features.map((f) => (
                      <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-sapphire-500/10 text-sapphire-400 border border-sapphire-500/15">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 lg:py-28 border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <FadeIn className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full bg-sapphire-600/15 border border-sapphire-500/20 text-sapphire-400 text-xs font-semibold uppercase tracking-widest mb-4">FAQ</span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Questions fréquentes</h2>
          </FadeIn>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <FadeIn key={i} delay={i * 50}>
              <div className="glass rounded-xl overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition">
                  <span className="font-medium text-sm pr-4">{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-sapphire-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-noir-400 leading-relaxed border-t border-white/5 pt-3">
                    {f.a}
                  </div>
                )}
              </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20 lg:py-28 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sapphire-600/15 border border-sapphire-500/25 text-sapphire-300 text-sm font-medium mb-6">
            <div className="w-2 h-2 rounded-full bg-sapphire-400 animate-pulse" />
            Disponible maintenant
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">Prêt pour votre prochain<br />trajet premium ?</h2>
          <p className="text-noir-400 text-lg mb-10 max-w-xl mx-auto">Rejoignez plus de 2 000 voyageurs satisfaits. Réservez en 2 minutes, voyagez en toute sérénité.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => scrollTo('booking')} className="btn-primary flex items-center gap-2 px-8 py-4 text-base">
              Réserver maintenant <ArrowRight className="w-4 h-4" />
            </button>
            <a href={`tel:${PHONE}`} className="btn-secondary flex items-center gap-2 px-8 py-4 text-base">
              <Phone className="w-4 h-4" /> {PHONE}
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-noir-950">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-sapphire-600 flex items-center justify-center"><Car className="w-4 h-4 text-white" /></div>
                <span className="font-bold text-white">L'Ambassadeur <span className="text-sapphire-400">des VTC</span></span>
              </div>
              <p className="text-sm text-noir-500 mb-4 leading-relaxed">Service de chauffeur privé premium dans le Var et sur la Côte d'Azur. Disponible 24h/24.</p>
              <div className="flex gap-3">
                {INSTAGRAM_URL && (
                  <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-noir-400 hover:text-white hover:bg-white/10 transition">
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {FACEBOOK_URL && (
                  <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-noir-400 hover:text-white hover:bg-white/10 transition">
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-sm">Services</h4>
              <ul className="space-y-2">
                {['Transfert aéroport', 'Transfert gare', 'Mise à disposition', 'Transport corporate'].map(l => (
                  <li key={l}><button onClick={() => scrollTo('booking')} className="text-sm text-noir-500 hover:text-noir-300 transition-colors text-left">{l}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Destinations</h4>
              <ul className="space-y-2">
                {['VTC Toulon', 'VTC Hyères', 'VTC Saint-Tropez', 'VTC Fréjus'].map((label) => (
                  <li key={label}><button onClick={() => scrollTo('booking')} className="text-sm text-noir-500 hover:text-noir-300 transition-colors text-left">{label}</button></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Contact</h4>
              <ul className="space-y-2">
                <li><a href={`tel:${PHONE}`} className="text-sm text-noir-500 hover:text-noir-300 transition-colors">Tel: {PHONE}</a></li>
                <li><a href={`mailto:${EMAIL}`} className="text-sm text-noir-500 hover:text-noir-300 transition-colors">Email: {EMAIL}</a></li>
                <li><span className="text-sm text-noir-500">Var &amp; Côte d'Azur</span></li>
                <li><span className="text-sm text-noir-500">Disponible 24/7</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-noir-600">© {new Date().getFullYear()} L'Ambassadeur des VTC. Tous droits réservés.</p>
            <div className="flex gap-6">
              {['Mentions légales', 'CGU', 'Politique de confidentialité'].map((l) => (
                <button key={l} onClick={() => setLegalModal(l)} className="text-xs text-noir-600 hover:text-noir-400 transition-colors">{l}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Floating mobile CTA bar — shows when hero is off-screen */}
      {scrolled && (
        <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-noir-950/95 backdrop-blur-xl border-t border-white/8 px-4 py-3 flex gap-3 animate-slide-up"
             style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
          <a href={`tel:${PHONE}`}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/8 border border-white/10 text-white flex-shrink-0 active:scale-95 transition-all">
            <Phone className="w-5 h-5" />
          </a>
          <button onClick={() => scrollTo('booking')}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-sapphire-600 text-white font-semibold text-base shadow-lg shadow-sapphire-900/40 active:scale-[0.98] transition-all">
            <Car className="w-5 h-5" />
            Réserver maintenant
          </button>
        </div>
      )}

      {/* Legal modals */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setLegalModal(null)}>
          <div className="bg-noir-900 border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{legalModal}</h2>
              <button onClick={() => setLegalModal(null)} className="text-noir-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            {legalModal === 'Mentions légales' && (
              <div className="prose prose-invert prose-sm max-w-none text-noir-300 space-y-4">
                <p><strong className="text-white">Éditeur du site</strong><br />
                L'Ambassadeur des VTC<br />
                Chauffeur VTC indépendant — Carte professionnelle VTC<br />
                Téléphone : {PHONE}<br />
                Email : {EMAIL}<br />
                Zone d'activité : Var &amp; Côte d'Azur, France</p>
                <p><strong className="text-white">Hébergement</strong><br />
                Vercel Inc. — 340 Pine Street Suite 701, San Francisco, CA 94104, USA</p>
                <p><strong className="text-white">Responsabilité</strong><br />
                Les informations fournies sur ce site le sont à titre indicatif. L'Ambassadeur des VTC ne saurait être tenu responsable des erreurs ou omissions.</p>
              </div>
            )}
            {legalModal === 'CGU' && (
              <div className="prose prose-invert prose-sm max-w-none text-noir-300 space-y-4">
                <p><strong className="text-white">1. Objet</strong><br />
                Les présentes conditions générales d'utilisation régissent l'accès et l'utilisation du service de réservation en ligne proposé par L'Ambassadeur des VTC.</p>
                <p><strong className="text-white">2. Services</strong><br />
                L'Ambassadeur des VTC propose un service de transport privé avec chauffeur (VTC) dans le Var et sur la Côte d'Azur. Les tarifs sont calculés à titre indicatif et peuvent varier selon les conditions réelles de trajet.</p>
                <p><strong className="text-white">3. Réservation</strong><br />
                Toute réservation est confirmée par email ou SMS. Un acompte peut être demandé pour valider la réservation. L'annulation gratuite est possible jusqu'à 24h avant la course.</p>
                <p><strong className="text-white">4. Responsabilité</strong><br />
                Le chauffeur est assuré en responsabilité civile professionnelle. En cas de retard dû à des circonstances extérieures (trafic, météo, etc.), la responsabilité du chauffeur ne saurait être engagée.</p>
                <p><strong className="text-white">5. Données personnelles</strong><br />
                Vos données sont traitées conformément à notre politique de confidentialité et au RGPD.</p>
              </div>
            )}
            {legalModal === 'Politique de confidentialité' && (
              <div className="prose prose-invert prose-sm max-w-none text-noir-300 space-y-4">
                <p><strong className="text-white">Responsable du traitement</strong><br />
                L'Ambassadeur des VTC — {EMAIL}</p>
                <p><strong className="text-white">Données collectées</strong><br />
                Nous collectons vos nom, prénom, email, numéro de téléphone et adresses de trajet dans le seul but d'assurer la prestation de transport commandée.</p>
                <p><strong className="text-white">Utilisation des données</strong><br />
                Vos données sont utilisées pour : confirmer et gérer vos réservations, vous envoyer des communications relatives à votre course, améliorer notre service. Elles ne sont jamais vendues à des tiers.</p>
                <p><strong className="text-white">Conservation</strong><br />
                Vos données sont conservées 3 ans après votre dernière interaction avec notre service.</p>
                <p><strong className="text-white">Vos droits</strong><br />
                Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour exercer ces droits, contactez-nous à {EMAIL}.</p>
                <p><strong className="text-white">Cookies</strong><br />
                Ce site utilise uniquement des cookies techniques nécessaires au bon fonctionnement du service. Aucun cookie publicitaire ou de traçage tiers n'est utilisé.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
