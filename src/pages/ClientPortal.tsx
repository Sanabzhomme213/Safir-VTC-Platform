import React, { useState } from 'react';
import { Calendar, MapPin, FileText, User, Plus, ChevronDown, ChevronUp, Download, LogOut, Edit2, RotateCcw, Shield, Eye, Palette, MessageSquare } from 'lucide-react';
import { formatCurrency, formatDate, reservationStatusLabel, reservationStatusColor, type Reservation } from '../lib/supabase';
import { mockReservations, mockClients, mockPayments } from '../lib/mockData';

type ViewMode = 'admin' | 'client';

export default function ClientPortalPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('client');

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">Espace Client</h1>
          <p className="text-noir-400">Apercu et personnalisation du portail client</p>
        </div>
        <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
          <button onClick={() => setViewMode('client')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'client' ? 'bg-sapphire-600 text-white' : 'text-noir-400 hover:text-white'}`}>
            Vue Client
          </button>
          <button onClick={() => setViewMode('admin')} className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'admin' ? 'bg-sapphire-600 text-white' : 'text-noir-400 hover:text-white'}`}>
            Vue Admin
          </button>
        </div>
      </div>

      {viewMode === 'client' ? <ClientView /> : <AdminView />}
    </div>
  );
}

function ClientView() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const completedReservations = mockReservations.filter((r) => r.status === 'completed' || r.status === 'confirmed');
  const invoices = mockReservations.filter((r) => r.status === 'completed');

  return (
    <div className="rounded-xl border border-white/10 bg-noir-900/50 overflow-hidden max-w-4xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-sapphire-700 to-sapphire-900 px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Mon espace L'Ambassadeur des VTC</h2>
            <p className="text-sapphire-200">Bienvenue, Jean Dupont</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge-success">VIP</span>
            <button className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition"><LogOut size={18} /></button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card text-center">
            <p className="text-2xl font-bold text-sapphire-400">{completedReservations.length}</p>
            <p className="text-xs text-noir-400 mt-1">Trajets</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-emerald-400">{formatCurrency(mockClients[0].total_spent)}</p>
            <p className="text-xs text-noir-400 mt-1">Total depense</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-amber-400">{mockClients[0].loyalty_points}</p>
            <p className="text-xs text-noir-400 mt-1">Points fidelite</p>
          </div>
        </div>

        {/* Reservations */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={20} className="text-sapphire-400" />
            <h3 className="text-lg font-semibold">Mes reservations</h3>
          </div>
          <div className="space-y-2">
            {mockReservations.slice(0, 5).map((res) => (
              <div key={res.id} className="card p-0 overflow-hidden">
                <button className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition" onClick={() => setExpandedId(expandedId === res.id ? null : res.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm text-white">
                      <MapPin size={14} className="text-sapphire-400 flex-shrink-0" />
                      <span className="truncate">{res.departure_address} → {res.arrival_address}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-noir-400 ml-5">
                      <span>{res.ride_date}</span>
                      <span>{res.ride_time}</span>
                      <span className="font-medium text-white">{formatCurrency(res.total_price)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    <span className={reservationStatusColor[res.status]}>{reservationStatusLabel[res.status]}</span>
                    {expandedId === res.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>
                {expandedId === res.id && (
                  <div className="border-t border-white/5 px-4 py-3 bg-white/[0.02] space-y-2">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div><p className="text-noir-500">Passagers</p><p>{res.passengers}</p></div>
                      <div><p className="text-noir-500">Bagages</p><p>{res.luggage}</p></div>
                      <div><p className="text-noir-500">Type</p><p>{res.ride_type === 'one_way' ? 'Aller simple' : res.ride_type === 'round_trip' ? 'Aller-retour' : 'Mise a dispo'}</p></div>
                    </div>
                    {res.distance_km > 0 && <p className="text-sm text-noir-400">{res.distance_km} km - {res.duration_min} min</p>}
                    {res.status === 'completed' && (
                      <button className="btn-primary flex items-center gap-2 text-sm mt-2"><RotateCcw size={14} /> Reserver a nouveau</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Invoices */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-sapphire-400" />
            <h3 className="text-lg font-semibold">Mes factures</h3>
          </div>
          <div className="space-y-2">
            {invoices.map((inv) => (
              <div key={inv.id} className="card flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">FAC-{inv.booking_number}</p>
                  <p className="text-xs text-noir-500">{formatDate(inv.created_at)}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{formatCurrency(inv.total_price)}</span>
                  <button className="flex items-center gap-1.5 text-sapphire-400 hover:text-sapphire-300 transition text-sm"><Download size={14} /> PDF</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Profile */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User size={20} className="text-sapphire-400" />
            <h3 className="text-lg font-semibold">Mon profil</h3>
          </div>
          <div className="card space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-noir-500 mb-1">Email</label>
                <input type="email" defaultValue="jean.dupont@email.fr" className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs text-noir-500 mb-1">Telephone</label>
                <input type="tel" defaultValue="+33 6 12 34 56 78" className="input-field text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-4 pt-2 border-t border-white/5">
              <span className="badge-success">VIP</span>
              <span className="text-sm text-noir-400">5 700 points fidelite</span>
            </div>
            <button className="btn-primary flex items-center gap-2 text-sm"><Edit2 size={14} /> Enregistrer</button>
          </div>
        </section>

        {/* Quick Book */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Plus size={20} className="text-sapphire-400" />
            <h3 className="text-lg font-semibold">Reserver</h3>
          </div>
          <div className="card space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-noir-500 mb-1">Depart</label>
                <input type="text" placeholder="Adresse de depart..." className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs text-noir-500 mb-1">Arrivee</label>
                <input type="text" placeholder="Adresse d'arrivee..." className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs text-noir-500 mb-1">Date</label>
                <input type="date" className="input-field text-sm" />
              </div>
              <div>
                <label className="block text-xs text-noir-500 mb-1">Heure</label>
                <input type="time" className="input-field text-sm" />
              </div>
            </div>
            <button className="btn-primary w-full">Reserver maintenant</button>
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminView() {
  const [visibleSections, setVisibleSections] = useState({ reservations: true, invoices: true, profile: true, booking: true });

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="card">
        <div className="flex items-center gap-2 mb-4"><Shield size={20} className="text-sapphire-400" /><h3 className="text-lg font-semibold">Personnalisation du portail</h3></div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-noir-300 mb-2">Logo</label>
            <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center hover:border-sapphire-500/30 transition cursor-pointer">
              <p className="text-noir-400 text-sm">Cliquez pour telecharger un logo</p>
              <p className="text-noir-500 text-xs mt-1">PNG, JPG jusqu'a 5MB</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-noir-300 mb-2">Message de bienvenue</label>
            <textarea rows={3} className="input-field resize-none" defaultValue="Bienvenue sur votre espace client L'Ambassadeur des VTC. Gerez vos reservations et consultez vos factures." />
          </div>
          <div>
            <label className="block text-sm font-medium text-noir-300 mb-3">Theme couleur</label>
            <div className="flex gap-4">
              {[
                { name: 'Saphir', color: 'bg-sapphire-500', checked: true },
                { name: 'Emeraude', color: 'bg-emerald-500', checked: false },
                { name: 'Ambre', color: 'bg-amber-500', checked: false },
              ].map((t) => (
                <label key={t.name} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="theme" defaultChecked={t.checked} className="w-4 h-4" />
                  <div className={`w-5 h-5 rounded ${t.color}`} />
                  <span className="text-sm text-noir-300">{t.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4"><Eye size={20} className="text-sapphire-400" /><h3 className="text-lg font-semibold">Sections visibles</h3></div>
        <div className="space-y-3">
          {[
            { key: 'reservations', label: 'Mes reservations' },
            { key: 'invoices', label: 'Mes factures' },
            { key: 'profile', label: 'Mon profil' },
            { key: 'booking', label: 'Reserver' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white/[0.02] transition">
              <input type="checkbox" checked={visibleSections[key as keyof typeof visibleSections]} onChange={(e) => setVisibleSections({ ...visibleSections, [key]: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-white/5 text-sapphire-600 focus:ring-sapphire-500" />
              <span className="text-sm text-noir-300">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <button className="btn-primary">Enregistrer les parametres</button>
    </div>
  );
}
