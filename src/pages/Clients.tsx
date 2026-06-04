import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  X,
  ChevronDown,
  Edit2,
  Save,
  AlertCircle,
} from 'lucide-react';
import type { Client, Reservation } from '../lib/supabase';
import { formatCurrency, formatDate, clientStatusLabel } from '../lib/supabase';
import { mockClients, mockReservations } from '../lib/mockData';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'loyal' | 'vip'>('all');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<Client>>({});
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const detectClientStatus = (client: Client): 'new' | 'loyal' | 'vip' => {
    if (client.total_rides >= 15 && client.total_spent >= 1000) return 'vip';
    if (client.total_rides >= 5 && client.total_spent >= 300) return 'loyal';
    return 'new';
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const detectedStatus = detectClientStatus(client);
      const matchesStatus = statusFilter === 'all' || detectedStatus === statusFilter;
      const matchesSearch =
        searchQuery === '' ||
        client.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [clients, searchQuery, statusFilter]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const clientRides = selectedClient
    ? reservations.filter((r) => r.client_id === selectedClient.id)
    : [];

  const handleAddClient = () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      return;
    }

    const newClient: Client = {
      id: (Math.max(...clients.map((c) => parseInt(c.id) || 0)) + 1).toString(),
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone,
      status: 'new',
      total_spent: 0,
      total_rides: 0,
      loyalty_points: 0,
      notes: formData.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setClients([...clients, newClient]);
    setFormData({ first_name: '', last_name: '', email: '', phone: '', notes: '' });
    setShowAddModal(false);
  };

  const handleEditClient = (client: Client) => {
    setEditingClientId(client.id);
    setEditValues(client);
  };

  const handleSaveEdit = () => {
    if (!editingClientId) return;
    setClients(
      clients.map((c) => (c.id === editingClientId ? { ...c, ...editValues } : c))
    );
    setEditingClientId(null);
    setEditValues({});
  };

  const getInitials = (first: string, last: string) => {
    return (first.charAt(0) + last.charAt(0)).toUpperCase();
  };

  const getStatusColor = (status: 'new' | 'loyal' | 'vip'): string => {
    switch (status) {
      case 'new':
        return 'badge badge-info';
      case 'loyal':
        return 'badge badge-warning';
      case 'vip':
        return 'badge badge-success';
    }
  };

  const getStatusAvatarBg = (status: 'new' | 'loyal' | 'vip'): string => {
    switch (status) {
      case 'new':
        return 'bg-blue-500/30 border border-blue-400/50';
      case 'loyal':
        return 'bg-amber-500/30 border border-amber-400/50';
      case 'vip':
        return 'bg-emerald-500/30 border border-emerald-400/50';
    }
  };

  return (
    <div className="min-h-screen bg-noir-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Clients</h1>
          <p className="text-gray-400">Gérez vos clients et leur historique de réservations</p>
        </div>

        {/* Top Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-noir-900 border border-sapphire-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sapphire-500 focus:ring-1 focus:ring-sapphire-500"
            />
          </div>

          {/* Add Client Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Ajouter un client
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(['all', 'new', 'loyal', 'vip'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === status
                  ? 'bg-sapphire-600 text-white'
                  : 'bg-noir-900 text-gray-300 border border-gray-700 hover:border-sapphire-500'
              }`}
            >
              {status === 'all' ? 'Tous' : clientStatusLabel[status] || status}
            </button>
          ))}
        </div>

        {/* Clients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredClients.map((client) => {
            const detectedStatus = detectClientStatus(client);
            return (
              <div
                key={client.id}
                onClick={() => setSelectedClientId(client.id)}
                className="group cursor-pointer p-6 bg-noir-900/50 backdrop-blur border border-sapphire-500/20 rounded-xl hover:border-sapphire-500/50 hover:shadow-lg hover:shadow-sapphire-500/20 transition-all"
              >
                {/* Avatar and Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm ${getStatusAvatarBg(
                      detectedStatus
                    )}`}
                  >
                    {getInitials(client.first_name, client.last_name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">
                      {client.first_name} {client.last_name}
                    </h3>
                    <span className={`inline-block mt-1 ${getStatusColor(detectedStatus)}`}>
                      {clientStatusLabel[detectedStatus]}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4 text-sm">
                  <p className="text-gray-400">{client.email}</p>
                  <p className="text-gray-400">{client.phone}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-sapphire-500/10">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-sapphire-400">
                      {client.total_rides}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Trajets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(client.total_spent)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Dépensé</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-400">
                      {client.loyalty_points}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Points</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredClients.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Aucun client trouvé</p>
          </div>
        )}
      </div>

      {/* Detail Panel - Slide-in from right */}
      {selectedClient && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur"
            onClick={() => setSelectedClientId(null)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-96 bg-noir-900 border-l border-sapphire-500/30 overflow-y-auto shadow-2xl shadow-sapphire-500/10">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Détails Client</h2>
                <button
                  onClick={() => setSelectedClientId(null)}
                  className="p-2 hover:bg-noir-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Client Info */}
              <div className="bg-noir-800/50 rounded-lg p-4 mb-6 border border-sapphire-500/10">
                {editingClientId === selectedClient.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Prénom</label>
                      <input
                        type="text"
                        value={editValues.first_name || ''}
                        onChange={(e) =>
                          setEditValues({ ...editValues, first_name: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-noir-700 border border-sapphire-500/30 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Nom</label>
                      <input
                        type="text"
                        value={editValues.last_name || ''}
                        onChange={(e) =>
                          setEditValues({ ...editValues, last_name: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-noir-700 border border-sapphire-500/30 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Email</label>
                      <input
                        type="email"
                        value={editValues.email || ''}
                        onChange={(e) =>
                          setEditValues({ ...editValues, email: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-noir-700 border border-sapphire-500/30 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Téléphone</label>
                      <input
                        type="tel"
                        value={editValues.phone || ''}
                        onChange={(e) =>
                          setEditValues({ ...editValues, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-noir-700 border border-sapphire-500/30 rounded text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Notes</label>
                      <textarea
                        value={editValues.notes || ''}
                        onChange={(e) =>
                          setEditValues({ ...editValues, notes: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-noir-700 border border-sapphire-500/30 rounded text-white text-sm"
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded transition-colors text-sm"
                      >
                        <Save className="w-4 h-4" />
                        Enregistrer
                      </button>
                      <button
                        onClick={() => setEditingClientId(null)}
                        className="flex-1 px-3 py-2 bg-noir-700 hover:bg-noir-600 text-gray-300 rounded transition-colors text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Nom</p>
                      <p className="text-white font-semibold">
                        {selectedClient.first_name} {selectedClient.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="text-white break-all">{selectedClient.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Téléphone
                      </p>
                      <p className="text-white">{selectedClient.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Statut</p>
                      <p className="text-white">
                        {clientStatusLabel[detectClientStatus(selectedClient)]}
                      </p>
                    </div>
                    {selectedClient.notes && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Notes</p>
                        <p className="text-gray-300 text-sm">{selectedClient.notes}</p>
                      </div>
                    )}
                    <button
                      onClick={() => handleEditClient(selectedClient)}
                      className="w-full flex items-center justify-center gap-2 mt-4 px-3 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded transition-colors text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Éditer
                    </button>
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div className="space-y-3 mb-6">
                <h3 className="text-lg font-semibold text-white">Statistiques</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-noir-800/50 rounded-lg p-3 border border-sapphire-500/10">
                    <p className="text-2xl font-bold text-sapphire-400">
                      {selectedClient.total_rides}
                    </p>
                    <p className="text-xs text-gray-400">Trajets</p>
                  </div>
                  <div className="bg-noir-800/50 rounded-lg p-3 border border-sapphire-500/10">
                    <p className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(selectedClient.total_spent)}
                    </p>
                    <p className="text-xs text-gray-400">Dépensé</p>
                  </div>
                  <div className="bg-noir-800/50 rounded-lg p-3 border border-sapphire-500/10">
                    <p className="text-2xl font-bold text-amber-400">
                      {selectedClient.loyalty_points}
                    </p>
                    <p className="text-xs text-gray-400">Points</p>
                  </div>
                  <div className="bg-noir-800/50 rounded-lg p-3 border border-sapphire-500/10">
                    <p className="text-2xl font-bold text-purple-400">
                      {clientRides.filter((r) => r.status === 'completed').length}
                    </p>
                    <p className="text-xs text-gray-400">Trajets complétés</p>
                  </div>
                </div>
              </div>

              {/* Ride History */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Historique des trajets</h3>
                {clientRides.length === 0 ? (
                  <p className="text-gray-400 text-sm">Aucun trajet pour ce client</p>
                ) : (
                  <div className="space-y-2">
                    {clientRides.map((ride) => (
                      <div
                        key={ride.id}
                        className="bg-noir-800/50 rounded-lg p-3 border border-sapphire-500/10"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-white">
                              {ride.booking_number}
                            </p>
                            <p className="text-xs text-gray-400">
                              {formatDate(ride.ride_date)} à {ride.ride_time}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-sapphire-400">
                            {formatCurrency(ride.total_price)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2">
                          {ride.departure_address} → {ride.arrival_address}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur"
            onClick={() => setShowAddModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-noir-900 rounded-xl border border-sapphire-500/30 shadow-2xl shadow-sapphire-500/20 max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Ajouter un client</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-noir-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Jean"
                    className="w-full px-4 py-2 bg-noir-800 border border-sapphire-500/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-sapphire-500 focus:ring-1 focus:ring-sapphire-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nom</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Dupont"
                    className="w-full px-4 py-2 bg-noir-800 border border-sapphire-500/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-sapphire-500 focus:ring-1 focus:ring-sapphire-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jean@example.com"
                    className="w-full px-4 py-2 bg-noir-800 border border-sapphire-500/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-sapphire-500 focus:ring-1 focus:ring-sapphire-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full px-4 py-2 bg-noir-800 border border-sapphire-500/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-sapphire-500 focus:ring-1 focus:ring-sapphire-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notes optionnelles..."
                    rows={3}
                    className="w-full px-4 py-2 bg-noir-800 border border-sapphire-500/30 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-sapphire-500 focus:ring-1 focus:ring-sapphire-500"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddClient}
                  className="flex-1 px-4 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded-lg font-medium transition-colors"
                >
                  Ajouter
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 bg-noir-800 hover:bg-noir-700 text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
