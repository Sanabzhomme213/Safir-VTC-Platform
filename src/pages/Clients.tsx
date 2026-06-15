import { useState, useMemo } from 'react';
import { Search, Plus, X, Edit2, Save, AlertCircle, Trash2, Phone, Mail } from 'lucide-react';
import { formatCurrency, formatDate, clientStatusLabel } from '../lib/supabase';
import type { Client } from '../lib/supabase';
import { useData } from '../lib/DataContext';

export default function ClientsPage() {
  const { clients, reservations, addClient, updateClient, deleteClient } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'loyal' | 'vip'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Client>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const detectStatus = (c: Client): 'new' | 'loyal' | 'vip' => {
    if (c.total_rides >= 15 && c.total_spent >= 1000) return 'vip';
    if (c.total_rides >= 5  && c.total_spent >= 300)  return 'loyal';
    return 'new';
  };

  const filtered = useMemo(() =>
    clients.filter(c => {
      const status = detectStatus(c);
      const matchStatus = statusFilter === 'all' || status === statusFilter;
      const q = search.toLowerCase();
      const matchSearch = !q ||
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q);
      return matchStatus && matchSearch;
    })
  , [clients, search, statusFilter]);

  const selected = clients.find(c => c.id === selectedId) ?? null;
  const clientRides = selected ? reservations.filter(r => r.client_id === selected.id) : [];

  const handleAdd = async () => {
    if (!form.first_name || !form.last_name || !form.email) return;
    setSaving(true);
    try {
      await addClient({
        first_name: form.first_name,
        last_name:  form.last_name,
        email:      form.email,
        phone:      form.phone,
        status:     'new',
        total_spent: 0,
        total_rides: 0,
        loyalty_points: 0,
        notes: form.notes,
      });
      setForm({ first_name: '', last_name: '', email: '', phone: '', notes: '' });
      setShowAddModal(false);
      showToast('Client ajouté');
    } catch { showToast('Erreur lors de l\'ajout'); }
    setSaving(false);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateClient(editingId, editValues);
      setEditingId(null);
      setEditValues({});
      showToast('Client mis à jour');
    } catch { showToast('Erreur lors de la mise à jour'); }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce client ?')) return;
    try {
      await deleteClient(id);
      if (selectedId === id) setSelectedId(null);
      showToast('Client supprimé');
    } catch { showToast('Erreur lors de la suppression'); }
  };

  const initials = (c: Client) => ((c.first_name?.[0] ?? '') + (c.last_name?.[0] ?? '')).toUpperCase() || '?';

  const avatarBg = (s: string) =>
    s === 'vip'   ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300' :
    s === 'loyal' ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300' :
                    'bg-sapphire-500/20 border border-sapphire-500/30 text-sapphire-300';

  const statusBadge = (s: string) =>
    s === 'vip'   ? 'badge badge-success' :
    s === 'loyal' ? 'badge badge-warning' : 'badge badge-info';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Clients</h1>
        <p className="text-noir-400">Gérez vos clients et leur historique</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg bg-emerald-900/90 border border-emerald-600/40 text-emerald-200 text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-noir-500" />
          <input
            type="text"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Ajouter un client
        </button>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'new', 'loyal', 'vip'] as const).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              statusFilter === s ? 'bg-sapphire-600 text-white' : 'bg-white/5 text-noir-300 border border-white/10 hover:bg-white/10'
            }`}
          >
            {s === 'all' ? `Tous (${clients.length})` : `${clientStatusLabel[s]} (${clients.filter(c => detectStatus(c) === s).length})`}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(c => {
          const status = detectStatus(c);
          return (
            <div
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className="card cursor-pointer hover:border-sapphire-500/25 hover:shadow-lg hover:shadow-sapphire-500/10 transition-all group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${avatarBg(status)}`}>
                  {initials(c)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{c.first_name} {c.last_name}</p>
                  <span className={`${statusBadge(status)} mt-1`}>{clientStatusLabel[status]}</span>
                </div>
              </div>
              <div className="space-y-1.5 mb-4 text-sm">
                <p className="text-noir-400 truncate flex items-center gap-1.5"><Mail className="w-3 h-3" />{c.email || '—'}</p>
                <p className="text-noir-400 flex items-center gap-1.5"><Phone className="w-3 h-3" />{c.phone || '—'}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center">
                <div>
                  <p className="text-lg font-bold text-sapphire-400">{c.total_rides}</p>
                  <p className="text-xs text-noir-500 mt-0.5">Trajets</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-400">{formatCurrency(c.total_spent)}</p>
                  <p className="text-xs text-noir-500 mt-0.5">Dépensé</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-400">{c.loyalty_points}</p>
                  <p className="text-xs text-noir-500 mt-0.5">Points</p>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12">
            <AlertCircle className="w-10 h-10 text-noir-700 mx-auto mb-3" />
            <p className="text-noir-400">Aucun client trouvé</p>
          </div>
        )}
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setSelectedId(null); setEditingId(null); }} />
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-noir-900 border-l border-white/8 overflow-y-auto shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Détails client</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleDelete(selected.id)} className="p-2 rounded-lg text-rouge-400 hover:bg-red-500/10 text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setSelectedId(null); setEditingId(null); }} className="p-2 rounded-lg text-noir-400 hover:text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Info / Edit */}
              <div className="bg-noir-800/50 rounded-xl p-4 mb-5 border border-white/5">
                {editingId === selected.id ? (
                  <div className="space-y-3">
                    {['first_name','last_name','email','phone'].map(field => (
                      <div key={field}>
                        <label className="block text-xs text-noir-500 mb-1 capitalize">{field.replace('_',' ')}</label>
                        <input
                          type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                          value={(editValues as Record<string,string>)[field] ?? ''}
                          onChange={e => setEditValues(p => ({ ...p, [field]: e.target.value }))}
                          className="input-field text-sm"
                        />
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs text-noir-500 mb-1">Notes</label>
                      <textarea
                        value={editValues.notes ?? ''}
                        onChange={e => setEditValues(p => ({ ...p, notes: e.target.value }))}
                        rows={2}
                        className="input-field text-sm resize-none"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={handleSaveEdit} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm py-2">
                        <Save className="w-3.5 h-3.5" />{saving ? 'Sauvegarde...' : 'Enregistrer'}
                      </button>
                      <button onClick={() => { setEditingId(null); setEditValues({}); }} className="btn-secondary flex-1 text-sm py-2">Annuler</button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 ${avatarBg(detectStatus(selected))}`}>
                        {initials(selected)}
                      </div>
                      <div>
                        <p className="font-bold text-white">{selected.first_name} {selected.last_name}</p>
                        <span className={statusBadge(detectStatus(selected))}>{clientStatusLabel[detectStatus(selected)]}</span>
                      </div>
                    </div>
                    {[
                      { label: 'Email',     val: selected.email },
                      { label: 'Téléphone', val: selected.phone },
                      { label: 'Client depuis', val: formatDate(selected.created_at) },
                    ].map(row => row.val ? (
                      <div key={row.label}>
                        <p className="text-xs text-noir-500 uppercase tracking-wide mb-0.5">{row.label}</p>
                        <p className="text-white text-sm">{row.val}</p>
                      </div>
                    ) : null)}
                    {selected.notes && (
                      <div>
                        <p className="text-xs text-noir-500 uppercase tracking-wide mb-0.5">Notes</p>
                        <p className="text-noir-300 text-sm">{selected.notes}</p>
                      </div>
                    )}
                    <button
                      onClick={() => { setEditingId(selected.id); setEditValues({ ...selected }); }}
                      className="btn-secondary w-full flex items-center justify-center gap-2 text-sm mt-3"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Éditer
                    </button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: 'Trajets totaux', val: selected.total_rides, color: 'text-sapphire-400' },
                  { label: 'Total dépensé', val: formatCurrency(selected.total_spent), color: 'text-emerald-400' },
                  { label: 'Points fidélité', val: selected.loyalty_points, color: 'text-amber-400' },
                  { label: 'Trajets complétés', val: clientRides.filter(r => r.status === 'completed').length, color: 'text-purple-400' },
                ].map(s => (
                  <div key={s.label} className="bg-noir-800/50 rounded-lg p-3 border border-white/5">
                    <p className={`text-xl font-bold ${s.color}`}>{s.val}</p>
                    <p className="text-xs text-noir-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Ride history */}
              <h3 className="text-sm font-semibold text-white mb-3">Historique des trajets</h3>
              {clientRides.length === 0 ? (
                <p className="text-noir-500 text-sm">Aucun trajet</p>
              ) : (
                <div className="space-y-2">
                  {clientRides.slice(0, 5).map(r => (
                    <div key={r.id} className="bg-noir-800/50 rounded-lg p-3 border border-white/5">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-xs font-mono text-sapphire-400">{r.booking_number}</p>
                        <p className="text-xs font-semibold text-white">{formatCurrency(r.total_price)}</p>
                      </div>
                      <p className="text-xs text-noir-400">{formatDate(r.ride_date)} · {r.ride_time}</p>
                      <p className="text-xs text-noir-500 truncate mt-1">{r.departure_address.split(',')[0]} → {r.arrival_address.split(',')[0]}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-noir-900 rounded-2xl border border-white/10 max-w-md w-full shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">Ajouter un client</h2>
              <button onClick={() => setShowAddModal(false)} className="text-noir-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              {[
                { field: 'first_name', label: 'Prénom *', type: 'text', ph: 'Jean' },
                { field: 'last_name',  label: 'Nom *',    type: 'text', ph: 'Dupont' },
                { field: 'email',      label: 'Email *',  type: 'email', ph: 'jean@example.com' },
                { field: 'phone',      label: 'Téléphone', type: 'tel', ph: '+33 6 12 34 56 78' },
              ].map(({ field, label, type, ph }) => (
                <div key={field}>
                  <label className="block text-sm text-noir-300 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={(form as Record<string,string>)[field]}
                    onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                    placeholder={ph}
                    className="input-field"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm text-noir-300 mb-1.5">Notes</label>
                <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2} className="input-field resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleAdd}
                disabled={saving || !form.first_name || !form.last_name || !form.email}
                className="btn-primary flex-1"
              >
                {saving ? 'Ajout...' : 'Ajouter'}
              </button>
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}