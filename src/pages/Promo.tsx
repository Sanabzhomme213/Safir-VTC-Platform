import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Copy, X, Save } from 'lucide-react';
import { useData } from '../lib/DataContext';
import { formatDate } from '../lib/supabase';

export default function PromoPage() {
  const { promoCodes, addPromoCode, updatePromoCode, deletePromoCode } = useData();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    maxUses: '' as string | number,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    isActive: true,
  });

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ code: generateCode(), discountType: 'percentage', discountValue: 10, maxUses: '', validFrom: new Date().toISOString().split('T')[0], validUntil: '', isActive: true });
    setShowModal(true);
  };

  const openEdit = (id: string) => {
    const p = promoCodes.find(c => c.id === id);
    if (!p) return;
    setEditingId(id);
    setForm({
      code: p.code,
      discountType: p.discount_percent > 0 ? 'percentage' : 'fixed',
      discountValue: p.discount_percent > 0 ? p.discount_percent : p.discount_amount,
      maxUses: p.max_uses ?? '',
      validFrom: p.valid_from ? p.valid_from.slice(0, 10) : '',
      validUntil: p.valid_until ? p.valid_until.slice(0, 10) : '',
      isActive: p.is_active,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.discountValue) return;
    const data = {
      code: form.code.toUpperCase(),
      discount_percent: form.discountType === 'percentage' ? form.discountValue : 0,
      discount_amount:  form.discountType === 'fixed'      ? form.discountValue : 0,
      max_uses:         form.maxUses !== '' ? Number(form.maxUses) : null,
      valid_from:       form.validFrom ? new Date(form.validFrom).toISOString() : new Date().toISOString(),
      valid_until:      form.validUntil ? new Date(form.validUntil).toISOString() : null,
      is_active:        form.isActive,
    };
    if (editingId) {
      await updatePromoCode(editingId, data);
    } else {
      await addPromoCode(data);
    }
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer ce code promo ?')) await deletePromoCode(id);
  };

  const handleToggle = async (id: string) => {
    const p = promoCodes.find(c => c.id === id);
    if (p) await updatePromoCode(id, { is_active: !p.is_active });
  };

  const handleDuplicate = async (id: string) => {
    const p = promoCodes.find(c => c.id === id);
    if (!p) return;
    await addPromoCode({
      code: generateCode(),
      discount_percent: p.discount_percent,
      discount_amount:  p.discount_amount,
      max_uses:         p.max_uses,
      valid_from:       p.valid_from ?? new Date().toISOString(),
      valid_until:      p.valid_until,
      is_active:        true,
    });
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const discountLabel = (p: typeof promoCodes[0]) =>
    p.discount_percent > 0 ? `${p.discount_percent}%` : `${p.discount_amount}€`;

  const usagePct = (p: typeof promoCodes[0]) =>
    p.max_uses ? Math.min(100, (p.current_uses / p.max_uses) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Codes Promo</h1>
        <p className="text-noir-400">Gérez vos codes promotionnels</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Codes totaux',      val: promoCodes.length,                                    color: 'text-white' },
          { label: 'Codes actifs',       val: promoCodes.filter(c => c.is_active).length,           color: 'text-sapphire-400' },
          { label: 'Utilisations total', val: promoCodes.reduce((s, c) => s + c.current_uses, 0),   color: 'text-emerald-400' },
        ].map(s => (
          <div key={s.label} className="card">
            <p className="text-xs text-noir-400 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <button onClick={openCreate} className="btn-primary flex items-center gap-2">
        <Plus className="w-4 h-4" /> Nouveau code
      </button>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Code', 'Réduction', 'Max', 'Utilisations', 'Validité', 'Statut', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-noir-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {promoCodes.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-noir-500">Aucun code promo</td></tr>
              )}
              {promoCodes.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs bg-noir-800 text-sapphire-300 px-2.5 py-1 rounded">{p.code}</code>
                      <button onClick={() => handleCopy(p.code)} className="p-1 hover:bg-white/10 rounded transition-colors">
                        <Copy className={`w-3.5 h-3.5 ${copiedId === p.code ? 'text-emerald-400' : 'text-noir-400'}`} />
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-semibold text-white">{discountLabel(p)}</td>
                  <td className="px-5 py-3 text-noir-300">{p.max_uses ?? '∞'}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-noir-800 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full bg-sapphire-500 transition-all" style={{ width: `${usagePct(p)}%` }} />
                      </div>
                      <span className="text-xs text-noir-400">{p.current_uses}{p.max_uses ? `/${p.max_uses}` : ''}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-noir-400 text-xs">
                    {p.valid_from ? formatDate(p.valid_from.slice(0,10)) : '—'}
                    {p.valid_until ? ` → ${formatDate(p.valid_until.slice(0,10))}` : ''}
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleToggle(p.id)} className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${p.is_active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-noir-700 text-noir-400 border border-white/10'}`}>
                      {p.is_active ? 'Actif' : 'Inactif'}
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p.id)} className="p-1.5 rounded hover:bg-white/5 text-noir-400 hover:text-sapphire-400 transition-colors" title="Modifier"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDuplicate(p.id)} className="p-1.5 rounded hover:bg-white/5 text-noir-400 hover:text-sapphire-400 transition-colors" title="Dupliquer"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-white/5 text-noir-400 hover:text-red-400 transition-colors" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-noir-900 border border-white/10 rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-white">{editingId ? 'Modifier le code' : 'Créer un code promo'}</h2>
              <button onClick={() => setShowModal(false)} className="text-noir-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-noir-300 mb-1.5">Code</label>
                <div className="flex gap-2">
                  <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="input-field flex-1 font-mono" />
                  <button onClick={() => setForm(f => ({ ...f, code: generateCode() }))} className="btn-secondary px-3">↻</button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-noir-300 mb-1.5">Type de réduction</label>
                <div className="flex gap-4">
                  {[['percentage', 'Pourcentage (%)'], ['fixed', 'Montant fixe (€)']].map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="dtype" value={val} checked={form.discountType === val} onChange={() => setForm(f => ({ ...f, discountType: val as 'percentage' | 'fixed' }))} />
                      <span className="text-sm text-white">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm text-noir-300 mb-1.5">Valeur {form.discountType === 'percentage' ? '(%)' : '(€)'}</label>
                <input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: parseFloat(e.target.value) || 0 }))} className="input-field" min={0} step={form.discountType === 'percentage' ? 1 : 0.5} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-noir-300 mb-1.5">Max utilisations</label>
                  <input type="number" value={form.maxUses} onChange={e => setForm(f => ({ ...f, maxUses: e.target.value }))} placeholder="Illimitée" className="input-field" min={0} />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer pb-2">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4" />
                    <span className="text-sm text-white">Actif</span>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-noir-300 mb-1.5">Début</label>
                  <input type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1.5">Fin (optionnel)</label>
                  <input type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} className="input-field" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-white/5">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Annuler</button>
              <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />{editingId ? 'Enregistrer' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
