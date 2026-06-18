import { useEffect, useState } from 'react';
import { useParams, NavLink, Navigate } from 'react-router-dom';
import {
  Car, Phone, ArrowRight, ChevronDown, MapPin, CheckCircle, Shield, Menu, X,
} from 'lucide-react';
import { supabase, seoPageTypeLabel, type SeoPage } from '../lib/supabase';

function loadPublicSettings() {
  try {
    const saved = localStorage.getItem('ambassadeur_settings');
    if (saved) return JSON.parse(saved) as Record<string, string>;
  } catch {}
  return {} as Record<string, string>;
}
const _s = loadPublicSettings();
const PHONE = _s.company_phone || '+33 6 33 82 83 94';

export default function SeoLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<SeoPage | null | 'loading' | 'not-found'>('loading');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPage('loading');
    async function load() {
      if (!slug) { setPage('not-found'); return; }
      try {
        const { data } = await supabase
          .from('seo_pages')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .maybeSingle();
        if (cancelled) return;
        setPage(data ?? 'not-found');
      } catch {
        if (!cancelled) setPage('not-found');
      }
    }
    load();
    return () => { cancelled = true; };
  }, [slug]);

  // Apply SEO meta tags dynamically
  useEffect(() => {
    if (page && page !== 'loading' && page !== 'not-found') {
      document.title = page.title || "L'Ambassadeur des VTC";
      const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
        let el = document.querySelector(`meta[${attr}="${name}"]`);
        if (!el) {
          el = document.createElement('meta');
          el.setAttribute(attr, name);
          document.head.appendChild(el);
        }
        el.setAttribute('content', content);
      };
      setMeta('description', page.meta_description || '');
      setMeta('og:title', page.title || '', 'property');
      setMeta('og:description', page.meta_description || '', 'property');
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        document.head.appendChild(canonical);
      }
      canonical.setAttribute('href', `https://ambassadeur-des-vtc.fr/vtc/${page.slug}`);
    }
    return () => { document.title = "L'Ambassadeur des VTC — Chauffeur Premium Var & Côte d'Azur"; };
  }, [page]);

  const scrollToBooking = () => { window.location.href = '/'; setTimeout(() => document.getElementById('booking')?.scrollIntoView(), 300); };

  if (page === 'loading') {
    return (
      <div className="min-h-screen bg-noir-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-sapphire-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (page === 'not-found') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="bg-noir-950 text-white min-h-screen overflow-x-hidden">
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-noir-950/95 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sapphire-600 flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">L'Ambassadeur <span className="text-sapphire-400">des VTC</span></span>
          </NavLink>
          <div className="hidden lg:flex items-center gap-3">
            <a href={`tel:${PHONE}`} className="flex items-center gap-2 text-sm text-noir-300 hover:text-white transition-colors">
              <Phone className="w-4 h-4" />{PHONE}
            </a>
            <button onClick={scrollToBooking} className="btn-primary text-sm">Réserver</button>
          </div>
          <button onClick={() => setNavOpen(!navOpen)} className="lg:hidden p-2 text-white">
            {navOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {navOpen && (
          <div className="lg:hidden bg-noir-950/98 backdrop-blur-xl border-t border-white/5 px-4 py-4 space-y-2">
            <a href={`tel:${PHONE}`} className="flex items-center gap-2 px-4 py-3 text-sm text-noir-300"><Phone className="w-4 h-4" />{PHONE}</a>
            <button onClick={scrollToBooking} className="w-full btn-primary">Réserver maintenant</button>
          </div>
        )}
      </nav>

      {/* HERO */}
      <header className="border-b border-white/5 py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-2 text-xs text-sapphire-400 font-semibold uppercase tracking-widest mb-4">
            <MapPin className="w-3.5 h-3.5" />
            {seoPageTypeLabel[page.page_type] ?? 'Service'}
          </div>
          <h1 className="text-3xl lg:text-5xl font-black leading-tight mb-5">{page.h1 || page.title}</h1>
          <p className="text-noir-300 text-lg leading-relaxed">{page.meta_description}</p>
          <div className="flex flex-wrap gap-3 mt-7">
            <button onClick={scrollToBooking} className="btn-primary flex items-center gap-2 px-6 py-3.5">
              Réserver maintenant <ArrowRight className="w-4 h-4" />
            </button>
            <a href={`tel:${PHONE}`} className="btn-secondary flex items-center gap-2 px-6 py-3.5">
              <Phone className="w-4 h-4" /> {PHONE}
            </a>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-3xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="prose prose-invert max-w-none text-noir-300 leading-relaxed space-y-4 whitespace-pre-line">
          {page.content}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10">
          {[
            { icon: CheckCircle, text: 'Confirmation immédiate' },
            { icon: Shield, text: 'Chauffeur assuré pro' },
            { icon: Phone, text: 'Support 24h/24' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="glass rounded-xl p-4 flex items-center gap-3">
              <Icon className="w-5 h-5 text-sapphire-400 flex-shrink-0" />
              <span className="text-sm text-noir-300">{text}</span>
            </div>
          ))}
        </div>

        {/* FAQ */}
        {page.faq && page.faq.length > 0 && (
          <div className="mt-14">
            <h2 className="text-2xl font-bold mb-6">Questions fréquentes</h2>
            <div className="space-y-3">
              {page.faq.map((f, i) => (
                <div key={i} className="glass rounded-xl overflow-hidden">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition">
                    <span className="font-medium text-sm pr-4">{f.q}</span>
                    <ChevronDown className={`w-4 h-4 text-sapphire-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm text-noir-400 leading-relaxed border-t border-white/5 pt-3">{f.a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 glass rounded-2xl p-8 text-center glow-sapphire">
          <h2 className="text-2xl font-bold mb-3">Réservez votre chauffeur dès maintenant</h2>
          <p className="text-noir-400 mb-6">Tarif instantané, confirmation immédiate, sans création de compte.</p>
          <button onClick={scrollToBooking} className="btn-primary px-8 py-4 inline-flex items-center gap-2">
            Réserver maintenant <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* CONTACT & CARTE */}
        <div className="mt-10 glass rounded-2xl p-6 lg:p-8">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sapphire-400" /> Zone de service &amp; Contact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <ul className="space-y-2 text-sm text-noir-300">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-sapphire-400 flex-shrink-0" />
                <span>Fréjus, Var (83600) — Côte d'Azur</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-sapphire-400 flex-shrink-0" />
                <a href={`tel:${PHONE}`} className="hover:text-white transition-colors">{PHONE}</a>
              </li>
              <li className="text-xs text-noir-500 pl-6">Disponible 24h/24 — 7j/7</li>
            </ul>
            <div className="flex flex-col gap-2">
              <a
                href="https://share.google/MM8dMQbO3vWL5mso5"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm flex items-center justify-center gap-2 py-3"
              >
                <MapPin className="w-4 h-4" /> Voir sur Google Maps
              </a>
              <a
                href="https://g.page/r/CbiEE78WCroOEBM/review"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm flex items-center justify-center gap-2 py-3 rounded-xl border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-colors font-medium"
              >
                ★ Laisser un avis Google
              </a>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden w-full" style={{ height: 240 }}>
            <iframe
              title="L'Ambassadeur des VTC — Fréjus, Var"
              src="https://maps.google.com/maps?q=Frejus+83600+Var+France&t=&z=13&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-noir-500">
          <NavLink to="/vtc" className="hover:text-sapphire-400 transition-colors">← Voir toutes nos destinations</NavLink>
        </p>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-noir-600">
        <p>© {new Date().getFullYear()} L'Ambassadeur des VTC — Fréjus, Var (83600) &amp; Côte d'Azur</p>
        <p className="mt-1">
          <a href={`tel:${PHONE}`} className="hover:text-noir-400 transition-colors">{PHONE}</a>
          {' · '}
          <a href="https://share.google/MM8dMQbO3vWL5mso5" target="_blank" rel="noopener noreferrer" className="hover:text-noir-400 transition-colors">Google Maps</a>
        </p>
      </footer>
    </div>
  );
}
