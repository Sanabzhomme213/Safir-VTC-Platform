import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Car, Phone, ArrowRight, MapPin, Plane, TrainFront, Navigation, Menu, X } from 'lucide-react';
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

const typeIcon: Record<string, typeof MapPin> = {
  city: MapPin, airport: Plane, station: TrainFront, transfer: Navigation,
};

export default function SeoIndexPage() {
  const [pages, setPages] = useState<SeoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    document.title = "Toutes nos destinations VTC — L'Ambassadeur des VTC";
    supabase.from('seo_pages').select('*').eq('is_published', true).order('page_type').then(({ data }) => {
      setPages(data ?? []);
      setLoading(false);
    });
    return () => { document.title = "L'Ambassadeur des VTC — Chauffeur Premium Var & Côte d'Azur"; };
  }, []);

  const scrollToBooking = () => { window.location.href = '/'; setTimeout(() => document.getElementById('booking')?.scrollIntoView(), 300); };

  const groups: Record<string, SeoPage[]> = { city: [], airport: [], station: [], transfer: [] };
  for (const p of pages) (groups[p.page_type] ??= []).push(p);

  return (
    <div className="bg-noir-950 text-white min-h-screen overflow-x-hidden">
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

      <header className="border-b border-white/5 py-12 lg:py-16 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="inline-block px-3 py-1 rounded-full bg-sapphire-600/15 border border-sapphire-500/20 text-sapphire-400 text-xs font-semibold uppercase tracking-widest mb-4">Toutes nos destinations</span>
          <h1 className="text-3xl lg:text-5xl font-black leading-tight mb-5">VTC dans le Var &amp; la Côte d'Azur</h1>
          <p className="text-noir-300 text-lg leading-relaxed">Villes, aéroports, gares et trajets desservis par L'Ambassadeur des VTC. Tarif fixe, chauffeur professionnel, réservation en 2 minutes.</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 lg:px-8 py-12 lg:py-16">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-sapphire-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pages.length === 0 ? (
          <p className="text-center text-noir-500 py-16">Aucune destination publiée pour le moment.</p>
        ) : (
          (['city', 'airport', 'station', 'transfer'] as const).map(type => groups[type]?.length ? (
            <div key={type} className="mb-12">
              <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
                {(() => { const Icon = typeIcon[type]; return <Icon className="w-5 h-5 text-sapphire-400" />; })()}
                {seoPageTypeLabel[type]}s
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groups[type].map(p => (
                  <NavLink key={p.id} to={`/vtc/${p.slug}`} className="glass rounded-xl p-5 hover:glow-sapphire transition-all duration-300 group">
                    <p className="font-semibold text-sm mb-1.5 group-hover:text-sapphire-300 transition-colors">{p.h1 || p.title}</p>
                    <p className="text-xs text-noir-500 line-clamp-2">{p.meta_description}</p>
                    <p className="text-xs text-sapphire-400 group-hover:text-sapphire-300 transition-colors flex items-center gap-1 mt-3">
                      En savoir plus <ArrowRight className="w-3 h-3" />
                    </p>
                  </NavLink>
                ))}
              </div>
            </div>
          ) : null)
        )}
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-noir-600">
        © {new Date().getFullYear()} L'Ambassadeur des VTC — Var &amp; Côte d'Azur
      </footer>
    </div>
  );
}
