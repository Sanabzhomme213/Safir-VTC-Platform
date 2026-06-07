import { useState, useMemo } from 'react';
import {
  FileText, Download, Mail, Eye, Plus, CheckCircle,
  Calendar, Filter, ArrowRight, Clock, Check, Loader2
} from 'lucide-react';
import { formatCurrency, formatDate, generateBookingNumber } from '../lib/supabase';
// reservationStatusLabel not needed — badge labels are hardcoded in French
import { useData } from '../lib/DataContext';
import { downloadInvoicePDF } from '../lib/pdf';
import type { InvoiceData } from '../lib/pdf';
import { getRouteInfo, calculatePrice } from '../lib/distance';

type TabType = 'invoices' | 'quotes';

export default function InvoicesPage() {
  const { reservations, clients, settings, updateReservation, addReservation, addEmailLog } = useData();
  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
  const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '';

  const [activeTab, setActiveTab] = useState<TabType>('invoices');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pdfLoading, setPdfLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showNewQuote, setShowNewQuote] = useState(false);
  const [newQuote, setNewQuote] = useState({ clientId: '', departure: '', arrival: '', date: '', time: '10:00', passengers: 1, notes: '' });
  const [quoteLoading, setQuoteLoading] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const clientName = (clientId: string) => {
    const c = clients.find(c => c.id === clientId);
    return c ? `${c.first_name} ${c.last_name}` : 'Client inconnu';
  };

  const invoiceNumber = (r: typeof reservations[0]) =>
    r.is_quote ? `DEV-${r.booking_number}` : `FAC-${r.booking_number}`;

  const isPaid = (r: typeof reservations[0]) =>
    r.status === 'completed' || r.status === 'deposit_paid';

  const invoices = useMemo(() => {
    let list = reservations.filter(r => !r.is_quote && r.status !== 'cancelled');
    if (dateStart) list = list.filter(r => r.ride_date >= dateStart);
    if (dateEnd) list = list.filter(r => r.ride_date <= dateEnd);
    if (statusFilter === 'paid') list = list.filter(isPaid);
    if (statusFilter === 'pending') list = list.filter(r => !isPaid(r));
    return [...list].sort((a, b) => b.ride_date.localeCompare(a.ride_date));
  }, [reservations, dateStart, dateEnd, statusFilter]);

  const quotes = useMemo(() =>
    [...reservations.filter(r => r.is_quote)]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
  , [reservations]);

  const selectedRes = reservations.find(r => r.id === selectedId) ?? null;

  const handleDownloadPDF = async (id: string) => {
    const r = reservations.find(res => res.id === id);
    if (!r) return;
    setPdfLoading(id);
    try {
      const invoiceData: InvoiceData = {
        reservation: r,
        client: clients.find(c => c.id === r.client_id) ?? null,
        invoiceNumber: invoiceNumber(r),
        isPaid: isPaid(r),
        settings,
      };
      await downloadInvoicePDF(invoiceData);
      showToast('PDF téléchargé');
    } catch (e) {
      showToast('Erreur lors de la génération du PDF');
      console.error(e);
    } finally {
      setPdfLoading(null);
    }
  };

  const handleSendEmail = async (id: string) => {
    const r = reservations.find(res => res.id === id);
    if (!r) return;
    const client = clients.find(c => c.id === r.client_id);
    if (!client?.email) { showToast('Pas d\'email pour ce client'); return; }

    const { sendEmail, buildConfirmationEmail } = await import('../lib/emailService');
    const subject = `${r.is_quote ? 'Devis' : 'Facture'} ${invoiceNumber(r)} – ${settings.company_name}`;
    const html = buildConfirmationEmail({
      clientName: `${client.first_name} ${client.last_name}`,
      bookingNumber: r.booking_number,
      date: formatDate(r.ride_date),
      time: r.ride_time,
      from: r.departure_address,
      to: r.arrival_address,
      amount: formatCurrency(r.total_price),
      companyName: settings.company_name,
      companyPhone: settings.company_phone,
    });
    const { ok } = await sendEmail(
      { to: client.email, subject, html },
      supabaseUrl, supabaseKey
    );
    if (ok) {
      await addEmailLog({
        reservation_id: r.id,
        client_id: client.id,
        email_type: r.is_quote ? 'quote_sent' : 'confirmation',
        subject,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    }
    showToast(ok ? `Email envoyé à ${client.email}` : 'Erreur lors de l\'envoi');
  };

  const handleConvertQuote = async (id: string) => {
    try {
      await updateReservation(id, { is_quote: false, status: 'pending' });
      showToast('Devis converti en réservation');
    } catch {
      showToast('Erreur lors de la conversion');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-3">
          <FileText className="w-8 h-8 text-sapphire-400" />
          Factures & Devis
        </h1>
        <p className="text-noir-400">Gestion des factures et devis clients</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-900/90 border border-emerald-600/40 text-emerald-200 text-sm font-medium animate-fade-in">
          <Check className="w-4 h-4" />{toast}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5">
        {(['invoices', 'quotes'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-all ${
              activeTab === t ? 'text-sapphire-400 border-sapphire-500' : 'text-noir-400 border-transparent hover:text-white'
            }`}
          >
            {t === 'invoices' ? `Factures (${invoices.length})` : `Devis (${quotes.length})`}
          </button>
        ))}
      </div>

      {/* INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="card flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs text-noir-400 mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Du</label>
              <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)} className="input-field" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-noir-400 mb-1.5 flex items-center gap-1"><Calendar className="w-3 h-3" /> Au</label>
              <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)} className="input-field" />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-noir-400 mb-1.5 flex items-center gap-1"><Filter className="w-3 h-3" /> Statut</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field">
                <option value="all">Tous</option>
                <option value="paid">Payée</option>
                <option value="pending">En attente</option>
              </select>
            </div>
          </div>

          {invoices.length === 0 ? (
            <div className="card text-center py-12">
              <FileText className="w-12 h-12 text-noir-700 mx-auto mb-3" />
              <p className="text-noir-400">Aucune facture trouvée</p>
            </div>
          ) : (
            <div className="card overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Numéro', 'Client', 'Date', 'Montant', 'Statut', 'Actions'].map(h => (
                        <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-noir-400 uppercase tracking-wider ${h === 'Montant' || h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(r => (
                      <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5 font-mono text-sapphire-400 font-medium text-xs">{invoiceNumber(r)}</td>
                        <td className="px-5 py-3.5 text-white font-medium">{clientName(r.client_id)}</td>
                        <td className="px-5 py-3.5 text-noir-300">{formatDate(r.ride_date)}</td>
                        <td className="px-5 py-3.5 text-right font-semibold text-white">{formatCurrency(r.total_price)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            isPaid(r)
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/15 text-amber-400 border-amber-500/20'
                          }`}>
                            {isPaid(r) ? <><Check className="w-3 h-3" /> Payée</> : <><Clock className="w-3 h-3" /> En attente</>}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setSelectedId(r.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-noir-400 hover:text-sapphire-400 transition-colors" title="Voir">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(r.id)}
                              disabled={pdfLoading === r.id}
                              className="p-1.5 rounded-lg hover:bg-white/5 text-noir-400 hover:text-sapphire-400 transition-colors disabled:opacity-50"
                              title="Télécharger PDF"
                            >
                              {pdfLoading === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            </button>
                            <button onClick={() => handleSendEmail(r.id)} className="p-1.5 rounded-lg hover:bg-white/5 text-noir-400 hover:text-sapphire-400 transition-colors" title="Envoyer email">
                              <Mail className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUOTES */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowNewQuote(true)} className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nouveau devis
            </button>
          </div>

          {quotes.length === 0 ? (
            <div className="card text-center py-12">
              <FileText className="w-12 h-12 text-noir-700 mx-auto mb-3" />
              <p className="text-noir-400">Aucun devis</p>
            </div>
          ) : (
            <div className="space-y-3">
              {quotes.map(q => (
                <div key={q.id} className="card hover:border-sapphire-500/20 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-mono font-bold text-sapphire-400 text-base">{invoiceNumber(q)}</span>
                        <span className="badge badge-warning">En attente</span>
                        {q.is_quote && <span className="badge badge-info">Devis</span>}
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div><p className="text-xs text-noir-500 mb-1">Client</p><p className="text-white font-medium">{clientName(q.client_id)}</p></div>
                        <div><p className="text-xs text-noir-500 mb-1">Date trajet</p><p className="text-white">{formatDate(q.ride_date)}</p></div>
                        <div><p className="text-xs text-noir-500 mb-1">Montant</p><p className="text-sapphire-400 font-semibold">{formatCurrency(q.total_price)}</p></div>
                        <div><p className="text-xs text-noir-500 mb-1">Trajet</p><p className="text-white text-xs truncate">{q.departure_address.split(',')[0]} <ArrowRight className="inline w-3 h-3" /> {q.arrival_address.split(',')[0]}</p></div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 flex-wrap">
                      <button onClick={() => handleConvertQuote(q.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/25 text-xs font-medium transition-colors">
                        <CheckCircle className="w-4 h-4" /> Convertir
                      </button>
                      <button onClick={() => handleSendEmail(q.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sapphire-600/15 text-sapphire-400 border border-sapphire-500/30 hover:bg-sapphire-600/25 text-xs font-medium transition-colors">
                        <Mail className="w-4 h-4" /> Envoyer
                      </button>
                      <button onClick={() => handleDownloadPDF(q.id)} disabled={pdfLoading === q.id} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-noir-300 border border-white/10 hover:bg-white/10 text-xs font-medium transition-colors disabled:opacity-50">
                        {pdfLoading === q.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} PDF
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* INVOICE DETAIL MODAL */}
      {selectedRes && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-noir-900 border border-white/10 rounded-2xl max-w-2xl w-full my-8 shadow-2xl">
            <div className="border-b border-white/5 px-6 py-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-sapphire-400" />
                {invoiceNumber(selectedRes)}
              </h2>
              <button onClick={() => setSelectedId(null)} className="text-noir-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-noir-950 rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-noir-500 mb-2 uppercase tracking-wide">Client</p>
                  <p className="text-white font-semibold">{clientName(selectedRes.client_id)}</p>
                </div>
                <div className="bg-noir-950 rounded-lg p-4 border border-white/5">
                  <p className="text-xs text-noir-500 mb-2 uppercase tracking-wide">Date du trajet</p>
                  <p className="text-white font-semibold">{formatDate(selectedRes.ride_date)} à {selectedRes.ride_time}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1.5 border-b border-white/5"><span className="text-noir-400">Départ</span><span className="text-white">{selectedRes.departure_address}</span></div>
                <div className="flex justify-between py-1.5 border-b border-white/5"><span className="text-noir-400">Arrivée</span><span className="text-white">{selectedRes.arrival_address}</span></div>
                <div className="flex justify-between py-1.5 border-b border-white/5"><span className="text-noir-400">Distance</span><span className="text-white">{selectedRes.distance_km} km</span></div>
                <div className="flex justify-between py-1.5 border-b border-white/5"><span className="text-noir-400">Durée</span><span className="text-white">{selectedRes.duration_min} min</span></div>
                <div className="flex justify-between py-1.5 border-b border-white/5"><span className="text-noir-400">Prix de base</span><span className="text-white font-medium">{formatCurrency(selectedRes.base_price)}</span></div>
                <div className="flex justify-between py-1.5 border-b border-white/5"><span className="text-noir-400">Acompte ({selectedRes.deposit_percentage}%)</span><span className="text-emerald-400 font-medium">–{formatCurrency(selectedRes.deposit_amount)}</span></div>
                <div className="flex justify-between py-1.5 border-b border-white/5"><span className="text-noir-400">Solde</span><span className="text-white font-medium">{formatCurrency(selectedRes.total_price - selectedRes.deposit_amount)}</span></div>
                <div className="flex justify-between py-2 bg-sapphire-600/10 rounded-lg px-3 mt-2">
                  <span className="text-white font-bold">Total TTC</span>
                  <span className="text-sapphire-400 font-bold text-base">{formatCurrency(selectedRes.total_price)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 px-6 py-4 flex gap-3">
              <button
                onClick={() => { handleDownloadPDF(selectedRes.id); setSelectedId(null); }}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Télécharger PDF
              </button>
              <button onClick={() => { handleSendEmail(selectedRes.id); setSelectedId(null); }} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" /> Envoyer email
              </button>
              <button onClick={() => setSelectedId(null)} className="btn-secondary px-4">Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* NEW QUOTE MODAL */}
      {showNewQuote && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-noir-900 border border-white/10 rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="border-b border-white/5 px-6 py-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Nouveau devis</h2>
              <button onClick={() => setShowNewQuote(false)} className="text-noir-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-noir-300 mb-1.5">Client</label>
                <select value={newQuote.clientId} onChange={e => setNewQuote(p => ({ ...p, clientId: e.target.value }))} className="input-field">
                  <option value="">— Sélectionner —</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-noir-300 mb-1.5">Départ</label>
                  <input type="text" value={newQuote.departure} onChange={e => setNewQuote(p => ({ ...p, departure: e.target.value }))} className="input-field" placeholder="Adresse de départ" />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1.5">Arrivée</label>
                  <input type="text" value={newQuote.arrival} onChange={e => setNewQuote(p => ({ ...p, arrival: e.target.value }))} className="input-field" placeholder="Adresse d'arrivée" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-noir-300 mb-1.5">Date</label>
                  <input type="date" value={newQuote.date} onChange={e => setNewQuote(p => ({ ...p, date: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-noir-300 mb-1.5">Heure</label>
                  <input type="time" value={newQuote.time} onChange={e => setNewQuote(p => ({ ...p, time: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-noir-300 mb-1.5">Notes</label>
                <textarea value={newQuote.notes} onChange={e => setNewQuote(p => ({ ...p, notes: e.target.value }))} rows={2} className="input-field resize-none" />
              </div>
            </div>
            <div className="border-t border-white/5 px-6 py-4 flex gap-3">
              <button
                disabled={quoteLoading || !newQuote.clientId || !newQuote.departure || !newQuote.arrival || !newQuote.date}
                onClick={async () => {
                  setQuoteLoading(true);
                  try {
                    const client = clients.find(c => c.id === newQuote.clientId);
                    if (!client) { showToast('Client introuvable'); setQuoteLoading(false); return; }
                    const route = await getRouteInfo(newQuote.departure, newQuote.arrival, settings.google_maps_key || undefined);
                    const totalPrice = route.distanceKm > 0
                      ? calculatePrice(route.distanceKm, 'one_way', settings)
                      : settings.pricing_min;
                    const depositAmt = Math.round(totalPrice * settings.deposit_default) / 100;
                    const created = await addReservation({
                      booking_number: generateBookingNumber(),
                      client_id: client.id,
                      departure_address: newQuote.departure,
                      departure_lat: route.originCoords?.lat ?? null,
                      departure_lng: route.originCoords?.lng ?? null,
                      arrival_address: newQuote.arrival,
                      arrival_lat: route.destCoords?.lat ?? null,
                      arrival_lng: route.destCoords?.lng ?? null,
                      ride_date: newQuote.date,
                      ride_time: newQuote.time,
                      passengers: newQuote.passengers,
                      luggage: 0,
                      ride_type: 'one_way',
                      return_date: null,
                      return_time: null,
                      distance_km: route.distanceKm,
                      duration_min: route.durationMin,
                      base_price: totalPrice,
                      deposit_amount: depositAmt,
                      deposit_percentage: settings.deposit_default,
                      total_price: totalPrice,
                      status: 'pending',
                      flight_number: null,
                      flight_status: null,
                      is_quote: true,
                      notes: newQuote.notes,
                    });
                    showToast(`Devis ${created.booking_number} créé`);
                    setNewQuote({ clientId: '', departure: '', arrival: '', date: '', time: '10:00', passengers: 1, notes: '' });
                    setShowNewQuote(false);
                  } catch (err) {
                    showToast('Erreur lors de la création du devis');
                    console.error(err);
                  } finally {
                    setQuoteLoading(false);
                  }
                }}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {quoteLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Création...</> : 'Créer le devis'}
              </button>
              <button onClick={() => setShowNewQuote(false)} className="btn-secondary px-5">Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}