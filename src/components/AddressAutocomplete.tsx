import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';

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
    // viewbox biases results towards Var & Côte d'Azur (lon 4.5–8.0, lat 42.8–44.5)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=8&countrycodes=fr,mc&accept-language=fr&addressdetails=1&viewbox=4.5,44.5,8.0,42.8&bounded=0`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'AmbassadeurVTC/1.0 contact@ambassadeur-vtc.fr' },
    });
    const data = await res.json();
    return data.map((d: Record<string, string | Record<string, string>>) => {
      const addr = d.address as Record<string, string> | undefined;
      // Build a precise label: house number + road + city + postcode
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
      return {
        label: r.formatted_address as string,
        lat: loc.lat,
        lng: loc.lng,
      };
    });
  } catch {
    return [];
  }
}

function formatLabel(label: string): string {
  const parts = label.split(',').map(p => p.trim()).filter(Boolean);
  // Remove trailing country parts ("France", code postal seul, etc.)
  const filtered = parts.filter(p => !/^France$/i.test(p));
  return filtered.slice(0, 3).join(', ');
}

export default function AddressAutocomplete({ value, onChange, onSelect, placeholder = 'Adresse...', className = '', icon = true }: Props) {
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);
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
    timer.current = setTimeout(() => search(v), 400);
  };

  const handleSelect = (result: AddressResult) => {
    onChange(formatLabel(result.label));
    onSelect({ ...result, label: formatLabel(result.label) });
    setSuggestions([]);
    setOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setOpen(false);
    onSelect({ label: '', lat: 0, lng: 0 });
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        {icon && (
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500 pointer-events-none" />
        )}
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500 animate-spin" />
        )}
        {!loading && value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-noir-500 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={`input-field ${icon ? 'pl-10' : ''} ${value ? 'pr-9' : ''} ${className}`}
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-noir-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={() => handleSelect(s)}
                className="w-full px-4 py-3 text-left text-sm hover:bg-white/5 transition-colors flex items-start gap-2.5 border-b border-white/5 last:border-0"
              >
                <MapPin className="w-3.5 h-3.5 text-sapphire-400 shrink-0 mt-0.5" />
                <span className="text-white text-xs leading-relaxed">{formatLabel(s.label)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
