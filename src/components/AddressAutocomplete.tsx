import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2, X, Navigation } from 'lucide-react';

export interface AddressResult {
  label: string;
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: AddressResult) => void;
  placeholder?: string;
  className?: string;
  icon?: boolean;
}

async function searchNominatim(query: string): Promise<AddressResult[]> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&countrycodes=fr,mc&accept-language=fr&addressdetails=1&viewbox=4.5,44.5,8.0,42.8&bounded=0`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AmbassadeurVTC/1.0 contact@ambassadeur-vtc.fr' },
    });
    const data = await res.json();
    return data.map((d: Record<string, string | Record<string, string>>) => {
      const addr = d.address as Record<string, string> | undefined;
      let label = d.display_name as string;
      if (addr) {
        const parts: string[] = [];
        const street = [addr.house_number, addr.road].filter(Boolean).join(' ');
        if (street) parts.push(street);
        const city = addr.city || addr.town || addr.village || addr.municipality || '';
        if (city) parts.push(city);
        const postcode = addr.postcode || '';
        if (postcode) parts.push(postcode);
        const dept = addr.county || addr.state_district || '';
        if (dept && !city.toLowerCase().includes(dept.toLowerCase())) parts.push(dept);
        if (parts.length >= 2) label = parts.join(', ');
      }
      return { label, lat: parseFloat(d.lat as string), lng: parseFloat(d.lon as string) };
    });
  } catch {
    return [];
  }
}

async function searchGoogle(query: string, apiKey: string): Promise<AddressResult[]> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}&language=fr&region=fr&components=country:FR`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.status !== 'OK') return [];
    return data.results.slice(0, 6).map((r: Record<string, unknown>) => {
      const loc = (r.geometry as { location: { lat: number; lng: number } }).location;
      return { label: r.formatted_address as string, lat: loc.lat, lng: loc.lng };
    });
  } catch {
    return [];
  }
}

function formatLabel(label: string): string {
  const parts = label.split(',').map(p => p.trim()).filter(Boolean);
  const filtered = parts.filter(p => !/^France$/i.test(p));
  return filtered.slice(0, 3).join(', ');
}

// Popular VTC pickup points for quick selection
const QUICK_PICKS = [
  { label: 'Aéroport Nice Côte d\'Azur', lat: 43.6584, lng: 7.2159 },
  { label: 'Aéroport Toulon-Hyères', lat: 43.0977, lng: 6.1460 },
  { label: 'Gare de Toulon', lat: 43.1244, lng: 5.9302 },
  { label: 'Gare de Nice-Ville', lat: 43.7046, lng: 7.2617 },
  { label: 'Saint-Tropez', lat: 43.2677, lng: 6.6404 },
];

export default function AddressAutocomplete({
  value, onChange, onSelect, placeholder = 'Adresse...', className = '', icon = true,
}: Props) {
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const googleKey = (import.meta.env.VITE_GOOGLE_MAPS_KEY as string) ?? '';

  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    const results = googleKey
      ? await searchGoogle(q, googleKey)
      : await searchNominatim(q);
    setSuggestions(results);
    setOpen(results.length > 0);
    setLoading(false);
  }, [googleKey]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    onChange(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => search(v), 350);
  };

  const handleSelect = (result: AddressResult) => {
    const label = formatLabel(result.label);
    onChange(label);
    onSelect({ ...result, label });
    setSuggestions([]);
    setOpen(false);
    setFocused(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setOpen(false);
    onSelect({ label: '', lat: 0, lng: 0 });
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setFocused(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, []);

  const showQuickPicks = focused && !value && !loading;
  const showDropdown = open && (suggestions.length > 0 || showQuickPicks);

  return (
    <div ref={wrapperRef} className="relative">
      <div className={`relative group transition-all duration-200 ${focused ? 'ring-2 ring-sapphire-500/40 rounded-xl' : ''}`}>
        {icon && (
          <MapPin className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${focused ? 'text-sapphire-400' : 'text-noir-500'}`} />
        )}
        {loading && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-sapphire-400 animate-spin" />
        )}
        {!loading && value && (
          <button
            type="button"
            onPointerDown={e => { e.preventDefault(); handleClear(); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-noir-400 hover:text-white transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => { setFocused(true); if (suggestions.length > 0) setOpen(true); }}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          inputMode="search"
          className={`input-field ${icon ? 'pl-10' : ''} ${value ? 'pr-10' : ''} ${className} border-transparent focus:border-transparent focus:ring-0`}
          style={{ background: 'rgba(255,255,255,0.06)' }}
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-[9999] mt-2 w-full bg-noir-900/98 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-slide-down">
          {showQuickPicks && (
            <>
              <div className="px-4 pt-3 pb-1.5">
                <p className="text-[10px] font-semibold text-noir-500 uppercase tracking-widest">Adresses populaires</p>
              </div>
              {QUICK_PICKS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  onPointerDown={e => { e.preventDefault(); handleSelect(p); }}
                  className="w-full px-4 py-3 text-left hover:bg-white/5 active:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/[0.04] last:border-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-sapphire-600/15 flex items-center justify-center shrink-0">
                    <Navigation className="w-3.5 h-3.5 text-sapphire-400" />
                  </div>
                  <span className="text-white text-sm">{p.label}</span>
                </button>
              ))}
            </>
          )}
          {suggestions.length > 0 && (
            <>
              {showQuickPicks && <div className="h-px bg-white/5 mx-4" />}
              <div className="px-4 pt-3 pb-1.5">
                <p className="text-[10px] font-semibold text-noir-500 uppercase tracking-widest">Résultats</p>
              </div>
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onPointerDown={e => { e.preventDefault(); handleSelect(s); }}
                  className="w-full px-4 py-3 text-left hover:bg-white/5 active:bg-white/10 transition-colors flex items-start gap-3 border-b border-white/[0.04] last:border-0"
                >
                  <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-sapphire-400" />
                  </div>
                  <span className="text-white text-sm leading-relaxed">{formatLabel(s.label)}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
