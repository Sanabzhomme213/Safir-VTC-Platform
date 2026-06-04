import { useState, useMemo } from 'react';
import {
  FileText, Download, Mail, Eye, Plus, Trash2, CheckCircle,
  Calendar, Filter, MoreVertical, ArrowRight, Clock, Check
} from 'lucide-react';
import { Reservation, formatCurrency, formatDate, reservationStatusLabel } from '../lib/supabase';
import { mockReservations, mockClients } from '../lib/mockData';

type TabType = 'invoices' | 'quotes';
type InvoiceStatus = 'Payée' | 'En attente';

interface InvoiceItem extends Reservation {
  invoiceNumber: string;
  invoiceStatus: InvoiceStatus;
  clientName: string;
  validUntil?: string;
}

function InvoicesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewQuoteForm, setShowNewQuoteForm] = useState(false);
  const [newQuoteData, setNewQuoteData] = useState({
    clientId: '',
    departure: '',
    arrival: '',
    date: '',
    time: '',
    passengers: 1,
    luggage: 0,
    notes: ''
  });

  const enrichedReservations = useMemo(() => {
    return mockReservations.map(res => {
      const client = mockClients.find(c => c.id === res.client_id);
      const isCompleted = res.status === 'completed';
      const isQuote = res.is_quote;
      const invoiceNumber = isQuote
        ? `DEV-${res.booking_number.split('-')[1]}`
        : `FAC-${res.booking_number.split('-')[1]}`;

      return {
        ...res,
        invoiceNumber,
        invoiceStatus: (isCompleted || (res.status === 'deposit_paid' && !isQuote) ? 'Payée' : 'En attente') as InvoiceStatus,
        clientName: client ? `${client.first_name} ${client.last_name}` : 'Unknown',
        validUntil: isQuote ? new Date(new Date(res.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
      };
    });
  }, []);

  const invoices = useMemo(() => {
    let filtered = enrichedReservations.filter(r => !r.is_quote && r.status === 'completed');

    if (dateRangeStart) {
      filtered = filtered.filter(r => new Date(r.ride_date) >= new Date(dateRangeStart));
    }
    if (dateRangeEnd) {
      filtered = filtered.filter(r => new Date(r.ride_date) <= new Date(dateRangeEnd));
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.invoiceStatus === statusFilter);
    }

    return filtered.sort((a, b) => new Date(b.ride_date).getTime() - new Date(a.ride_date).getTime());
  }, [enrichedReservations, dateRangeStart, dateRangeEnd, statusFilter]);

  const quotes = useMemo(() => {
    return enrichedReservations
      .filter(r => r.is_quote)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [enrichedReservations]);

  const handleConvertToReservation = (quoteId: string) => {
    console.log('Converting quote to reservation:', quoteId);
  };

  const handleSendEmail = (invoiceId: string) => {
    console.log('Sending email for:', invoiceId);
  };

  const handleDeleteQuote = (quoteId: string) => {
    console.log('Deleting quote:', quoteId);
  };

  const handleGeneratePDF = (invoiceId: string) => {
    console.log('Generating PDF for:', invoiceId);
  };

  const handleDownloadPDF = (invoiceId: string) => {
    console.log('Downloading PDF for:', invoiceId);
  };

  const handleCreateQuote = () => {
    console.log('Creating new quote:', newQuoteData);
    setShowNewQuoteForm(false);
    setNewQuoteData({
      clientId: '',
      departure: '',
      arrival: '',
      date: '',
      time: '',
      passengers: 1,
      luggage: 0,
      notes: ''
    });
  };

  return (
    <div className="min-h-screen bg-noir-950 text-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-sapphire-400" />
          <h1 className="text-3xl font-bold text-white">Factures & Devis</h1>
        </div>
        <p className="text-noir-400">Gestion des factures et devis clients</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-white/5">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 -mb-px ${
            activeTab === 'invoices'
              ? 'text-sapphire-400 border-sapphire-500'
              : 'text-noir-400 border-transparent hover:text-white'
          }`}
        >
          Factures
        </button>
        <button
          onClick={() => setActiveTab('quotes')}
          className={`px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 -mb-px ${
            activeTab === 'quotes'
              ? 'text-sapphire-400 border-sapphire-500'
              : 'text-noir-400 border-transparent hover:text-white'
          }`}
        >
          Devis
        </button>
      </div>

      {/* TAB 1: INVOICES */}
      {activeTab === 'invoices' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-glass-card border border-white/10 rounded-xl p-6 backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-noir-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date de début
                </label>
                <input
                  type="date"
                  value={dateRangeStart}
                  onChange={(e) => setDateRangeStart(e.target.value)}
                  className="w-full px-4 py-2 bg-noir-900 border border-white/10 rounded-lg text-white placeholder-noir-500 focus:outline-none focus:border-sapphire-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-noir-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date de fin
                </label>
                <input
                  type="date"
                  value={dateRangeEnd}
                  onChange={(e) => setDateRangeEnd(e.target.value)}
                  className="w-full px-4 py-2 bg-noir-900 border border-white/10 rounded-lg text-white placeholder-noir-500 focus:outline-none focus:border-sapphire-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-noir-300 mb-2">
                  <Filter className="w-4 h-4 inline mr-2" />
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-noir-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sapphire-500"
                >
                  <option value="all">Tous</option>
                  <option value="Payée">Payée</option>
                  <option value="En attente">En attente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          {invoices.length > 0 ? (
            <div className="bg-glass-card border border-white/10 rounded-xl overflow-hidden backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-noir-400 uppercase tracking-wider">
                        Numéro
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-noir-400 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-noir-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-noir-400 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-noir-400 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-noir-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono font-semibold text-sapphire-400 text-sm">
                            {invoice.invoiceNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-white text-sm">{invoice.clientName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-noir-300 text-sm">{formatDate(invoice.ride_date)}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-semibold text-white text-sm">{formatCurrency(invoice.total_price)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                              invoice.invoiceStatus === 'Payée'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {invoice.invoiceStatus === 'Payée' && <Check className="w-3 h-3" />}
                            {invoice.invoiceStatus === 'En attente' && <Clock className="w-3 h-3" />}
                            {invoice.invoiceStatus}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setSelectedInvoice(invoice)}
                              className="p-2 rounded-lg hover:bg-white/5 text-noir-400 hover:text-sapphire-400 transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleGeneratePDF(invoice.id)}
                              className="p-2 rounded-lg hover:bg-white/5 text-noir-400 hover:text-sapphire-400 transition-colors"
                              title="Générer PDF"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSendEmail(invoice.id)}
                              className="p-2 rounded-lg hover:bg-white/5 text-noir-400 hover:text-sapphire-400 transition-colors"
                              title="Envoyer par email"
                            >
                              <Mail className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 rounded-lg hover:bg-white/5 text-noir-400 hover:text-white transition-colors"
                              title="Plus d'options"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-glass-card border border-white/10 rounded-xl p-12 text-center backdrop-blur-xl">
              <FileText className="w-12 h-12 text-noir-600 mx-auto mb-4" />
              <p className="text-noir-400">Aucune facture trouvée</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: QUOTES */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          {/* New Quote Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowNewQuoteForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-sapphire-600 hover:bg-sapphire-700 rounded-lg font-medium text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau devis
            </button>
          </div>

          {/* Quotes List */}
          {quotes.length > 0 ? (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div key={quote.id} className="bg-glass-card border border-white/10 rounded-xl p-6 backdrop-blur-xl hover:border-sapphire-500/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="font-mono font-semibold text-sapphire-400 text-lg">
                          {quote.invoiceNumber}
                        </div>
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            quote.status === 'pending'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                              : quote.status === 'sent'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20'
                              : quote.status === 'accepted'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {quote.status === 'pending' && 'En attente'}
                          {quote.status === 'sent' && 'Envoyé'}
                          {quote.status === 'accepted' && 'Accepté'}
                          {quote.status === 'rejected' && 'Rejeté'}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-noir-500 uppercase tracking-wide mb-1">Client</p>
                          <p className="text-sm font-medium text-white">{quote.clientName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-noir-500 uppercase tracking-wide mb-1">Date</p>
                          <p className="text-sm font-medium text-white">{formatDate(quote.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-noir-500 uppercase tracking-wide mb-1">Montant</p>
                          <p className="text-sm font-medium text-sapphire-400">{formatCurrency(quote.total_price)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-noir-500 uppercase tracking-wide mb-1">Valide jusqu'au</p>
                          <p className="text-sm font-medium text-white">
                            {quote.validUntil ? formatDate(quote.validUntil) : '-'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 lg:gap-1">
                      <button
                        onClick={() => handleConvertToReservation(quote.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/25 text-xs font-medium transition-colors"
                        title="Convertir en réservation"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Convertir</span>
                      </button>
                      <button
                        onClick={() => handleSendEmail(quote.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sapphire-600/15 text-sapphire-400 border border-sapphire-500/30 hover:bg-sapphire-600/25 text-xs font-medium transition-colors"
                        title="Envoyer par email"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="hidden sm:inline">Envoyer</span>
                      </button>
                      <button
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-rose-600/15 text-rose-400 border border-rose-500/30 hover:bg-rose-600/25 text-xs font-medium transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Supprimer</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-glass-card border border-white/10 rounded-xl p-12 text-center backdrop-blur-xl">
              <FileText className="w-12 h-12 text-noir-600 mx-auto mb-4" />
              <p className="text-noir-400">Aucun devis</p>
            </div>
          )}
        </div>
      )}

      {/* INVOICE DETAIL MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-noir-900 border border-white/10 rounded-xl max-w-2xl w-full my-8">
            {/* Header */}
            <div className="border-b border-white/5 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <FileText className="w-6 h-6 text-sapphire-400" />
                Détails de la facture
              </h2>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-noir-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Company Header */}
              <div className="border-b border-white/5 pb-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white">Safir VTC</h3>
                  <p className="text-noir-400 text-sm">Service de VTC Premium</p>
                  <p className="text-noir-400 text-sm">Tel: +33 3 XX XX XX XX</p>
                  <p className="text-noir-400 text-sm">Email: contact@safir-vtc.fr</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-noir-500 uppercase tracking-wide mb-2">Numéro de facture</p>
                  <p className="text-lg font-bold text-sapphire-400">{selectedInvoice.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-noir-500 uppercase tracking-wide mb-2">Date</p>
                  <p className="text-lg font-bold text-white">{formatDate(selectedInvoice.ride_date)}</p>
                </div>
              </div>

              {/* Client Details */}
              <div className="bg-noir-950 rounded-lg p-4 border border-white/5">
                <p className="text-xs text-noir-500 uppercase tracking-wide mb-2">Informations client</p>
                <p className="text-white font-medium">{selectedInvoice.clientName}</p>
              </div>

              {/* Ride Details */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white uppercase tracking-wide">Détails du trajet</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-noir-400">Départ</span>
                    <span className="text-white">{selectedInvoice.departure_address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-noir-400">Arrivée</span>
                    <span className="text-white">{selectedInvoice.arrival_address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-noir-400">Date et heure</span>
                    <span className="text-white">{formatDate(selectedInvoice.ride_date)} à {selectedInvoice.ride_time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-noir-400">Distance</span>
                    <span className="text-white">{selectedInvoice.distance_km} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-noir-400">Durée</span>
                    <span className="text-white">{selectedInvoice.duration_min} min</span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-noir-950 rounded-lg p-4 border border-white/5 space-y-3">
                <p className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Détail tarifaire</p>
                <div className="flex justify-between text-sm">
                  <span className="text-noir-400">Prix de base</span>
                  <span className="text-white font-medium">{formatCurrency(selectedInvoice.base_price)}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-white/5 pt-2">
                  <span className="text-noir-400">Acompte payé</span>
                  <span className="text-emerald-400 font-medium">-{formatCurrency(selectedInvoice.deposit_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-noir-400">Solde</span>
                  <span className="text-white font-medium">{formatCurrency(selectedInvoice.total_price - selectedInvoice.deposit_amount)}</span>
                </div>
                <div className="flex justify-between text-base border-t border-white/5 pt-2">
                  <span className="text-white font-bold">Total TTC</span>
                  <span className="text-sapphire-400 font-bold text-lg">{formatCurrency(selectedInvoice.total_price)}</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-noir-400 text-sm">Statut :</span>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                    selectedInvoice.invoiceStatus === 'Payée'
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {selectedInvoice.invoiceStatus === 'Payée' && <Check className="w-3 h-3" />}
                  {selectedInvoice.invoiceStatus === 'En attente' && <Clock className="w-3 h-3" />}
                  {selectedInvoice.invoiceStatus}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-white/5 p-6 flex gap-3">
              <button
                onClick={() => handleDownloadPDF(selectedInvoice.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sapphire-600 hover:bg-sapphire-700 rounded-lg font-medium text-white transition-colors"
              >
                <Download className="w-4 h-4" />
                Télécharger PDF
              </button>
              <button
                onClick={() => handleSendEmail(selectedInvoice.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 rounded-lg font-medium text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                Envoyer par email
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg font-medium text-white transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW QUOTE FORM MODAL */}
      {showNewQuoteForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-noir-900 border border-white/10 rounded-xl max-w-2xl w-full my-8">
            {/* Header */}
            <div className="border-b border-white/5 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Plus className="w-6 h-6 text-sapphire-400" />
                Nouveau devis
              </h2>
              <button
                onClick={() => setShowNewQuoteForm(false)}
                className="text-noir-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Client</label>
                  <select
                    value={newQuoteData.clientId}
                    onChange={(e) => setNewQuoteData({ ...newQuoteData, clientId: e.target.value })}
                    className="w-full px-4 py-2 bg-noir-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sapphire-500"
                  >
                    <option value="">Sélectionner un client</option>
                    {mockClients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.first_name} {c.last_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Passagers</label>
                  <input
                    type="number"
                    min="1"
                    value={newQuoteData.passengers}
                    onChange={(e) => setNewQuoteData({ ...newQuoteData, passengers: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-noir-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sapphire-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Lieu de départ</label>
                <input
                  type="text"
                  placeholder="Adresse de départ"
                  value={newQuoteData.departure}
                  onChange={(e) => setNewQuoteData({ ...newQuoteData, departure: e.target.value })}
                  className="w-full px-4 py-2 bg-noir-800 border border-white/10 rounded-lg text-white placeholder-noir-500 focus:outline-none focus:border-sapphire-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Lieu d'arrivée</label>
                <input
                  type="text"
                  placeholder="Adresse d'arrivée"
                  value={newQuoteData.arrival}
                  onChange={(e) => setNewQuoteData({ ...newQuoteData, arrival: e.target.value })}
                  className="w-full px-4 py-2 bg-noir-800 border border-white/10 rounded-lg text-white placeholder-noir-500 focus:outline-none focus:border-sapphire-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Date</label>
                  <input
                    type="date"
                    value={newQuoteData.date}
                    onChange={(e) => setNewQuoteData({ ...newQuoteData, date: e.target.value })}
                    className="w-full px-4 py-2 bg-noir-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sapphire-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Heure</label>
                  <input
                    type="time"
                    value={newQuoteData.time}
                    onChange={(e) => setNewQuoteData({ ...newQuoteData, time: e.target.value })}
                    className="w-full px-4 py-2 bg-noir-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sapphire-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Bagages</label>
                <input
                  type="number"
                  min="0"
                  value={newQuoteData.luggage}
                  onChange={(e) => setNewQuoteData({ ...newQuoteData, luggage: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-noir-800 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sapphire-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Notes</label>
                <textarea
                  placeholder="Notes additionnelles"
                  value={newQuoteData.notes}
                  onChange={(e) => setNewQuoteData({ ...newQuoteData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-noir-800 border border-white/10 rounded-lg text-white placeholder-noir-500 focus:outline-none focus:border-sapphire-500"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-white/5 p-6 flex gap-3">
              <button
                onClick={handleCreateQuote}
                className="flex-1 px-4 py-2.5 bg-sapphire-600 hover:bg-sapphire-700 rounded-lg font-medium text-white transition-colors"
              >
                Créer le devis
              </button>
              <button
                onClick={() => setShowNewQuoteForm(false)}
                className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg font-medium text-white transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvoicesPage;
