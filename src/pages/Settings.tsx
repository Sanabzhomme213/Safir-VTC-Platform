import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, Save,
  Check, AlertCircle
} from 'lucide-react';
import { useData } from '../lib/DataContext';
import type { AppSettings } from '../lib/DataContext';

type Tab = 'general' | 'pricing' | 'payment';

export default function SettingsPage() {
  const { settings, updateSettings } = useData();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [saved, setSaved] = useState(false);
  const [local, setLocal] = useState<AppSettings>({ ...settings });
  useEffect(() => { setLocal({ ...settings }); }, [settings]);

  const handleSave = async () => {
    await updateSettings(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setLocal(p => ({ ...p, [key]: value }));

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general',  label: 'Général' },
    { id: 'pricing',  label: 'Tarification' },
    { id: 'payment',  label: 'Paiement' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-sapphire-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Paramètres</h1>
          <p className="text-xs text-noir-500 mt-0.5">Gérez les paramètres de votre application</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-all ${
              activeTab === t.id ? 'text-sapphire-400 border-sapphire-500' : 'text-noir-400 border-transparent hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
          <Check className="w-4 h-4" /> Paramètres enregistrés avec succès
        </div>
      )}

      {/* GENERAL */}
      {activeTab === 'general' && (
        <div className="space-y-5 max-w-2xl">
          <div className="card space-y-4">
            <h2 className="text-base font-bold text-sapphire-400">Informations entreprise</h2>
            <Field label="Nom de l'entreprise" value={local.company_name} onChange={v => set('company_name', v)} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Email" type="email" value={local.company_email} onChange={v => set('company_email', v)} />
              <Field label="Téléphone" type="tel" value={local.company_phone} onChange={v => set('company_phone', v)} />
            </div>
            <Field label="Adresse" value={local.company_address} onChange={v => set('company_address', v)} />
            <Field label="URL avis Google (lien direct)" value={local.google_review_url} onChange={v => set('google_review_url', v)} placeholder="https://g.page/r/..." />
            <p className="text-xs text-noir-500">Trouvez ce lien dans Google Business Profile → Obtenir des avis → Lien court.</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="URL Instagram" value={local.instagram_url} onChange={v => set('instagram_url', v)} placeholder="https://www.instagram.com/..." />
              <Field label="URL Facebook" value={local.facebook_url} onChange={v => set('facebook_url', v)} placeholder="https://www.facebook.com/..." />
            </div>
          </div>
          <SaveBtn onClick={handleSave} />
        </div>
      )}

      {/* PRICING */}
      {activeTab === 'pricing' && (
        <div className="space-y-5 max-w-2xl">
          <div className="card space-y-4">
            <h2 className="text-base font-bold text-sapphire-400">Tarifs de base</h2>
            <div className="grid grid-cols-2 gap-4">
              <NumberField label="Prix par km (€)" value={local.pricing_per_km} onChange={v => set('pricing_per_km', v)} step={0.01} />
              <NumberField label="Prix minimum (€)" value={local.pricing_min} onChange={v => set('pricing_min', v)} step={1} />
              <NumberField label="Réduction aller-retour (%)" value={local.pricing_round_trip_discount} onChange={v => set('pricing_round_trip_discount', v)} step={1} />
              <NumberField label="Tarif mise à dispo / heure (€)" value={local.pricing_disposal_hourly} onChange={v => set('pricing_disposal_hourly', v)} step={1} />
            </div>
          </div>

          <SaveBtn onClick={handleSave} />
        </div>
      )}

      {/* PAYMENT */}
      {activeTab === 'payment' && (
        <div className="space-y-5 max-w-2xl">
          <div className="card space-y-4">
            <h2 className="text-base font-bold text-sapphire-400">SumUp</h2>
            <Field
              label="Code marchand SumUp (Merchant Code)"
              value={local.sumup_merchant_code}
              onChange={v => set('sumup_merchant_code', v)}
              placeholder="MC1234567"
            />
            {local.sumup_merchant_code && (
              <StatusBadge ok={local.sumup_merchant_code.length > 4} okText="Code renseigné" koText="Code trop court" />
            )}
            <div className="bg-noir-950 rounded-lg p-4 border border-white/5 text-sm space-y-2">
              <p className="text-white font-medium">Configuration côté serveur (Supabase Secrets) :</p>
              <ul className="list-none space-y-1 text-xs font-mono text-sapphire-300">
                <li>SUMUP_API_KEY — clé API SumUp (dashboard.sumup.com → Développeur → Clés API)</li>
                <li>SUMUP_MERCHANT_CODE — même valeur que ci-dessus</li>
              </ul>
              <p className="text-noir-400 text-xs">Obtenez ces informations sur <strong className="text-white">me.sumup.com</strong> → Paramètres → Développeur → Clés API.</p>
            </div>
          </div>

          <div className="card space-y-4">
            <h2 className="text-base font-bold text-sapphire-400">Acompte par défaut</h2>
            <div className="flex gap-3">
              {[20, 30, 50].map(p => (
                <button
                  key={p}
                  onClick={() => set('deposit_default', p)}
                  className={`flex-1 py-3 rounded-xl border font-semibold transition-all ${
                    local.deposit_default === p
                      ? 'border-sapphire-500 bg-sapphire-600/15 text-sapphire-400'
                      : 'border-white/10 bg-white/5 text-noir-300 hover:bg-white/10'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>
          <SaveBtn onClick={handleSave} />
        </div>
      )}

    </div>
  );
}

/* ── Sub-components ───────────────────────────────────────── */

function Field({ label, value, onChange, type = 'text', placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-noir-300 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="input-field" />
    </div>
  );
}

function NumberField({ label, value, onChange, step = 1 }: {
  label: string; value: number; onChange: (v: number) => void; step?: number;
}) {
  return (
    <div>
      <label className="block text-sm text-noir-300 mb-1.5">{label}</label>
      <input
        type="number"
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="input-field"
      />
    </div>
  );
}

function StatusBadge({ ok, okText, koText }: { ok: boolean; okText: string; koText: string }) {
  return (
    <div className={`inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
      ok ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
    }`}>
      {ok ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
      {ok ? okText : koText}
    </div>
  );
}

function SaveBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn-primary flex items-center gap-2 px-6 py-2.5">
      <Save className="w-4 h-4" /> Enregistrer
    </button>
  );
}
