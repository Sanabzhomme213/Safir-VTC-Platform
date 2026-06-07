import React, { useState } from 'react';
import { Plus, Edit2, Eye, Trash2, CheckCircle, Circle, Wand2 } from 'lucide-react';
import { type SeoPage as SeoPageT, seoPageTypeLabel, formatDate } from '../lib/supabase';
import { useData } from '../lib/DataContext';

export default function SeoPage() {
  const { seoPages: pages, saveSeoPage, deleteSeoPage } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'city' | 'airport' | 'station' | 'transfer'>('all');
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'draft'>('all');
  const [formData, setFormData] = useState<Partial<SeoPageT>>({
    page_type: 'city', title: '', meta_description: '', h1: '', content: '', faq: [], is_published: false, slug: '',
  });
  const [locationName, setLocationName] = useState('');

  const filteredPages = pages.filter((page) => {
    const typeMatch = filterType === 'all' || page.page_type === filterType;
    const publishMatch = filterPublished === 'all' || (filterPublished === 'published' && page.is_published) || (filterPublished === 'draft' && !page.is_published);
    return typeMatch && publishMatch;
  });

  const stats = {
    total: pages.length,
    published: pages.filter((p) => p.is_published).length,
    drafts: pages.filter((p) => !p.is_published).length,
    byType: { city: pages.filter((p) => p.page_type === 'city').length, airport: pages.filter((p) => p.page_type === 'airport').length, station: pages.filter((p) => p.page_type === 'station').length, transfer: pages.filter((p) => p.page_type === 'transfer').length },
  };

  const generateSlug = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

  const generateContent = () => {
    const { page_type } = formData;
    const name = locationName.trim();
    if (!name) return;
    let title = '', metaDesc = '', h1 = '', content = '', slug = '';
    switch (page_type) {
      case 'city':
        slug = `vtc-${generateSlug(name)}`; title = `Chauffeur VTC à ${name} - Service Premium | L'Ambassadeur des VTC`; metaDesc = `Service VTC premium à ${name}. Chauffeur privé, transferts aéroport, gare. Réservation instantanée.`; h1 = `Chauffeur VTC à ${name}`; content = `L'Ambassadeur des VTC propose un service de chauffeur privé premium à ${name} et ses environs. Nos conducteurs expérimentés vous offrent un confort et une fiabilité sans égal pour tous vos trajets.`; break;
      case 'airport':
        slug = `vtc-aeroport-${generateSlug(name)}`; title = `Transfert VTC Aéroport ${name} | L'Ambassadeur des VTC`; metaDesc = `Transfert VTC aéroport ${name}. Prise en charge, suivi de vol en temps réel.`; h1 = `Transfert VTC Aéroport de ${name}`; content = `Service de transfert premium vers l'aéroport ${name}. L'Ambassadeur des VTC assure votre transfert avec suivi des vols en temps réel et confort premium.`; break;
      case 'station':
        slug = `vtc-gare-${generateSlug(name)}`; title = `VTC Gare ${name} - Chauffeur Privé | L'Ambassadeur des VTC`; metaDesc = `Chauffeur VTC à la gare ${name}. Transfert gare premium.`; h1 = `Chauffeur VTC à la Gare ${name}`; content = `Transfert en VTC depuis la gare ${name}. Prise en charge directe en sortie de gare, accueil personnalisé, et confort optimal.`; break;
      case 'transfer':
        slug = `transfert-${generateSlug(name)}`; title = `Transfert VTC ${name} | L'Ambassadeur des VTC`; metaDesc = `Transfert VTC ${name} en voiture premium.`; h1 = `Transfert VTC ${name}`; content = `Transfert en VTC pour ${name}. L'Ambassadeur des VTC offre un service de chauffeur privé rapide et fiable pour cette liaison.`; break;
    }
    setFormData({ ...formData, slug, title, meta_description: metaDesc, h1, content, faq: [{ q: `Quel est le prix d'un VTC à ${name} ?`, a: 'Nos tarifs commencent à 25€ pour un trajet en ville.' }, { q: `Comment réserver un VTC à ${name} ?`, a: 'Réservez en ligne en 2 minutes sur notre site ou par téléphone.' }, { q: 'VTC disponible 24h/24 ?', a: `Oui, notre service est disponible 24h/24 et 7j/7 à ${name}.` }] });
  };

  const handleSave = async () => {
    if (!formData.slug || !formData.title) return;
    await saveSeoPage({ ...formData, id: editingId ?? undefined } as Partial<SeoPageT> & { slug: string });
    resetForm();
  };

  const resetForm = () => { setShowForm(false); setEditingId(null); setLocationName(''); setFormData({ page_type: 'city', title: '', meta_description: '', h1: '', content: '', faq: [], is_published: false, slug: '' }); };
  const handleEdit = (page: SeoPageT) => { setEditingId(page.id); setFormData(page); setShowForm(true); };
  const handleDelete = async (id: string) => { if (confirm('Supprimer cette page ?')) await deleteSeoPage(id); };
  const togglePublish = async (id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) await saveSeoPage({ ...page, is_published: !page.is_published });
  };
  const addFaqItem = () => setFormData({ ...formData, faq: [...(formData.faq || []), { q: '', a: '' }] });
  const removeFaqItem = (index: number) => setFormData({ ...formData, faq: (formData.faq || []).filter((_, i) => i !== index) });
  const updateFaqItem = (index: number, field: 'q' | 'a', value: string) => { const updatedFaq = [...(formData.faq || [])]; updatedFaq[index] = { ...updatedFaq[index], [field]: value }; setFormData({ ...formData, faq: updatedFaq }); };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Generateur de Pages SEO</h1>
        <p className="text-noir-400">L'arme secrete - Creez des centaines de pages optimisees pour Google</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total pages', value: stats.total, color: 'sapphire' },
          { label: 'Publiees', value: stats.published, color: 'emerald' },
          { label: 'Brouillons', value: stats.drafts, color: 'amber' },
          { label: 'Types', value: `V:${stats.byType.city} A:${stats.byType.airport} G:${stats.byType.station}`, color: 'cyan' },
        ].map((s, i) => (
          <div key={i} className="card">
            <div className="text-sm text-noir-400 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold text-${s.color}-400`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Generer une page
        </button>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="input-field w-auto">
          <option value="all">Tous les types</option>
          <option value="city">Ville</option>
          <option value="airport">Aeroport</option>
          <option value="station">Gare</option>
          <option value="transfer">Transfert</option>
        </select>
        <select value={filterPublished} onChange={(e) => setFilterPublished(e.target.value as any)} className="input-field w-auto">
          <option value="all">Tous</option>
          <option value="published">Publiees</option>
          <option value="draft">Brouillons</option>
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/[0.02] border-b border-white/5">
              <tr>
                {['Slug', 'Type', 'Titre', 'Statut', 'Date', 'Actions'].map((h) => (
                  <th key={h} className={`px-4 py-3 text-left text-xs font-semibold text-noir-400 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : ''}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPages.map((page) => (
                <tr key={page.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-sapphire-400">{page.slug}</td>
                  <td className="px-4 py-3"><span className="badge-info">{seoPageTypeLabel[page.page_type]}</span></td>
                  <td className="px-4 py-3 text-sm text-noir-300 max-w-[200px] truncate">{page.title}</td>
                  <td className="px-4 py-3">{page.is_published ? <span className="badge-success">Publiee</span> : <span className="badge-warning">Brouillon</span>}</td>
                  <td className="px-4 py-3 text-sm text-noir-500">{formatDate(page.updated_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => handleEdit(page)} className="p-1.5 rounded-lg hover:bg-white/5 text-noir-400 hover:text-sapphire-400 transition"><Edit2 size={14} /></button>
                      <button onClick={() => togglePublish(page.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-noir-400 hover:text-emerald-400 transition">{page.is_published ? <CheckCircle size={14} /> : <Circle size={14} />}</button>
                      <button className="p-1.5 rounded-lg hover:bg-white/5 text-noir-400 hover:text-sapphire-400 transition"><Eye size={14} /></button>
                      <button onClick={() => handleDelete(page.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-noir-400 hover:text-red-400 transition"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPages.length === 0 && <div className="px-4 py-12 text-center text-noir-500">Aucune page trouvee</div>}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={resetForm}>
          <div className="bg-noir-900 border border-white/10 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-noir-900/90 backdrop-blur border-b border-white/5 px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-lg font-semibold">{editingId ? 'Modifier la page' : 'Creer une nouvelle page'}</h2>
              <button onClick={resetForm} className="text-noir-400 hover:text-white transition text-xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-noir-400 mb-1.5">Type de page</label>
                  <select value={formData.page_type} onChange={(e) => setFormData({ ...formData, page_type: e.target.value as any })} className="input-field">
                    <option value="city">Ville</option>
                    <option value="airport">Aeroport</option>
                    <option value="station">Gare</option>
                    <option value="transfer">Transfert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-noir-400 mb-1.5">Nom du lieu</label>
                  <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="ex: Lille, CDG, Gare du Nord" className="input-field" />
                </div>
              </div>
              <button onClick={generateContent} className="w-full btn-primary flex items-center justify-center gap-2"><Wand2 size={18} /> Generer automatiquement</button>
              <hr className="border-white/5" />
              <div>
                <label className="block text-sm font-medium text-noir-400 mb-1.5">Slug</label>
                <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="input-field font-mono text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-noir-400 mb-1.5">Titre SEO</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-noir-400 mb-1.5">Meta Description</label>
                <textarea value={formData.meta_description} onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })} rows={2} className="input-field resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-noir-400 mb-1.5">H1</label>
                <input type="text" value={formData.h1} onChange={(e) => setFormData({ ...formData, h1: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-noir-400 mb-1.5">Contenu</label>
                <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={5} className="input-field resize-none" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-noir-400">FAQ</label>
                  <button onClick={addFaqItem} className="text-sapphire-400 hover:text-sapphire-300 text-sm font-medium transition">+ Ajouter</button>
                </div>
                <div className="space-y-3">
                  {(formData.faq || []).map((item, idx) => (
                    <div key={idx} className="border border-white/5 rounded-lg p-3 space-y-2">
                      <input type="text" value={item.q} onChange={(e) => updateFaqItem(idx, 'q', e.target.value)} placeholder="Question" className="input-field text-sm" />
                      <textarea value={item.a} onChange={(e) => updateFaqItem(idx, 'a', e.target.value)} placeholder="Reponse" rows={2} className="input-field text-sm resize-none" />
                      <button onClick={() => removeFaqItem(idx)} className="text-red-400 hover:text-red-300 text-xs font-medium transition">Supprimer</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-white/5 text-sapphire-600 focus:ring-sapphire-500" />
                <label className="text-sm font-medium text-noir-300">Publier immediatement</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleSave} className="flex-1 btn-primary">Enregistrer</button>
                <button onClick={resetForm} className="flex-1 btn-secondary">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
