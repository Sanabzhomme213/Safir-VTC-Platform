import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Hotel,
  UtensilsCrossed,
  Car,
  Compass,
  TrendingUp,
} from 'lucide-react';
import type { ConciergeOffer } from '../lib/supabase';
import { useData } from '../lib/DataContext';

type ConciergeOfferWithId = ConciergeOffer;
type OfferType = 'hotel' | 'restaurant' | 'car_rental' | 'activity';

export default function ConciergePage() {
  const { conciergeOffers: offers, addConciergeOffer, updateConciergeOffer, deleteConciergeOffer } = useData();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<OfferType | 'all'>('all');
  const [formData, setFormData] = useState<Partial<ConciergeOfferWithId>>({
    offer_type: 'hotel',
    name: '',
    description: '',
    partner_name: '',
    affiliate_url: '',
    commission_percent: 0,
    city: '',
    is_active: true,
  });

  const filteredOffers =
    selectedFilter === 'all'
      ? offers
      : offers.filter((o) => o.offer_type === selectedFilter);

  const activeOffers = offers.filter((o) => o.is_active).length;
  const monthlyCommission = 2847; // Mock value

  const getOfferIcon = (type: OfferType) => {
    switch (type) {
      case 'hotel':
        return <Hotel className="w-5 h-5" />;
      case 'restaurant':
        return <UtensilsCrossed className="w-5 h-5" />;
      case 'car_rental':
        return <Car className="w-5 h-5" />;
      case 'activity':
        return <Compass className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getOfferTypeLabel = (type: OfferType): string => {
    switch (type) {
      case 'hotel':
        return 'Hôtel';
      case 'restaurant':
        return 'Restaurant';
      case 'car_rental':
        return 'Location voiture';
      case 'activity':
        return 'Activité';
      default:
        return '';
    }
  };

  const handleOpenModal = (offer?: ConciergeOfferWithId) => {
    if (offer) {
      setEditingId(offer.id);
      setFormData(offer);
    } else {
      setEditingId(null);
      setFormData({
        offer_type: 'hotel',
        name: '',
        description: '',
        partner_name: '',
        affiliate_url: '',
        commission_percent: 0,
        city: '',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      offer_type: 'hotel',
      name: '',
      description: '',
      partner_name: '',
      affiliate_url: '',
      commission_percent: 0,
      city: '',
      is_active: true,
    });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.partner_name) return;
    if (editingId) {
      await updateConciergeOffer(editingId, formData);
    } else {
      await addConciergeOffer({
        offer_type: (formData.offer_type || 'hotel') as OfferType,
        name: formData.name ?? '',
        description: formData.description ?? '',
        partner_name: formData.partner_name ?? '',
        affiliate_url: formData.affiliate_url ?? '',
        commission_percent: formData.commission_percent ?? 0,
        city: formData.city ?? '',
        is_active: formData.is_active !== false,
      });
    }
    handleCloseModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette offre ?')) await deleteConciergeOffer(id);
  };

  const handleToggleActive = async (id: string) => {
    const offer = offers.find(o => o.id === id);
    if (offer) await updateConciergeOffer(id, { is_active: !offer.is_active });
  };

  return (
    <div className="min-h-screen bg-noir-950">
      {/* Header */}
      <div className="border-b border-sapphire-900 bg-noir-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-white mb-2">Concierge</h1>
          <p className="text-sapphire-300 max-w-2xl">
            Quand un client réserve un trajet aéroport, proposez automatiquement :
            hôtel, restaurant, location de voiture, activités. Générez des revenus
            annexes avec chaque course.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Revenue Estimate */}
        <div className="mb-8 backdrop-blur-xl bg-white/5 border border-sapphire-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-6 h-6 text-sapphire-400" />
            <p className="text-sapphire-300 font-semibold">Revenus estimés ce mois</p>
          </div>
          <p className="text-4xl font-bold text-white">{monthlyCommission}€</p>
        </div>

        {/* Filter and Add Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'hotel', 'restaurant', 'car_rental', 'activity'] as const).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFilter(type)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    selectedFilter === type
                      ? 'bg-sapphire-600 text-white'
                      : 'bg-noir-800 text-sapphire-300 hover:bg-noir-700'
                  }`}
                >
                  {type === 'all'
                    ? 'Tous'
                    : type === 'car_rental'
                      ? 'Location voiture'
                      : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              )
            )}
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-sapphire-600 hover:bg-sapphire-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Nouvelle offre
          </button>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className="backdrop-blur-xl bg-white/5 border border-sapphire-500/30 rounded-lg overflow-hidden hover:border-sapphire-500/60 transition-all"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-sapphire-500/20 rounded-lg text-sapphire-400">
                      {getOfferIcon(offer.offer_type as OfferType)}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{offer.name}</h3>
                      <p className="text-xs text-sapphire-300">
                        {getOfferTypeLabel(offer.offer_type as OfferType)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleActive(offer.id)}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                      offer.is_active
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-gray-500/20 text-gray-300'
                    }`}
                  >
                    {offer.is_active ? 'Actif' : 'Inactif'}
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {offer.description}
                </p>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Partenaire:</span>
                    <span className="text-white font-semibold">
                      {offer.partner_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ville:</span>
                    <span className="text-white">{offer.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Commission:</span>
                    <span className="text-sapphire-300 font-bold">
                      {offer.commission_percent}%
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-sapphire-500/20">
                  <button
                    onClick={() => handleOpenModal(offer)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded text-sm font-semibold transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded text-sm font-semibold transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sapphire-300 mb-4">Aucune offre trouvée</p>
          </div>
        )}

        {/* How It Works Section */}
        <div className="mt-16 mb-12">
          <h2 className="text-2xl font-bold text-white mb-8">
            Comment ça marche ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="backdrop-blur-xl bg-white/5 border border-sapphire-500/30 rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-sapphire-600 rounded-full mb-4">
                <span className="text-white font-bold text-lg">1</span>
              </div>
              <h3 className="text-white font-bold mb-2">
                Client réserve un trajet aéroport
              </h3>
              <p className="text-sm text-gray-400">
                Un passager réserve un trajet vers ou depuis l'aéroport via votre
                plateforme.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-sapphire-500/30 rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-sapphire-600 rounded-full mb-4">
                <span className="text-white font-bold text-lg">2</span>
              </div>
              <h3 className="text-white font-bold mb-2">
                Suggestions concierge automatiques
              </h3>
              <p className="text-sm text-gray-400">
                Le système envoie automatiquement des suggestions hôtels, restaurants,
                locations et activités par email.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-white/5 border border-sapphire-500/30 rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-sapphire-600 rounded-full mb-4">
                <span className="text-white font-bold text-lg">3</span>
              </div>
              <h3 className="text-white font-bold mb-2">
                Gagnez des commissions
              </h3>
              <p className="text-sm text-gray-400">
                Chaque réservation via vos liens d'affiliation vous rapporte une
                commission.
              </p>
            </div>
          </div>
        </div>

        {/* Commission Tracking */}
        <div className="backdrop-blur-xl bg-white/5 border border-sapphire-500/30 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">
            Suivi des commissions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-noir-800 rounded-lg p-4">
              <p className="text-sapphire-300 text-xs mb-1">Offres actives</p>
              <p className="text-2xl font-bold text-white">{activeOffers}</p>
            </div>
            <div className="bg-noir-800 rounded-lg p-4">
              <p className="text-sapphire-300 text-xs mb-1">Offres totales</p>
              <p className="text-2xl font-bold text-white">{offers.length}</p>
            </div>
            <div className="bg-noir-800 rounded-lg p-4">
              <p className="text-sapphire-300 text-xs mb-1">Commission moyenne</p>
              <p className="text-2xl font-bold text-sapphire-300">
                {offers.length > 0
                  ? (
                      offers.reduce((sum, o) => sum + o.commission_percent, 0) /
                      offers.length
                    ).toFixed(1)
                  : '0'}
                %
              </p>
            </div>
            <div className="bg-noir-800 rounded-lg p-4">
              <p className="text-sapphire-300 text-xs mb-1">Ce mois</p>
              <p className="text-2xl font-bold text-green-400">{monthlyCommission}€</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-noir-900 border border-sapphire-500/30 rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-sapphire-500/30 sticky top-0 bg-noir-900">
              <h2 className="text-2xl font-bold text-white">
                {editingId ? 'Modifier l\'offre' : 'Créer une offre'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-2">
                  Type d'offre
                </label>
                <select
                  value={formData.offer_type || 'hotel'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      offer_type: e.target.value as OfferType,
                    })
                  }
                  className="w-full bg-noir-800 border border-sapphire-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sapphire-500"
                >
                  <option value="hotel">Hôtel</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="car_rental">Location voiture</option>
                  <option value="activity">Activité</option>
                </select>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-2">
                  Nom de l'offre
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-noir-800 border border-sapphire-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sapphire-500"
                  placeholder="Ex: Hôtel 5 étoiles"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-noir-800 border border-sapphire-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sapphire-500 resize-none"
                  rows={3}
                  placeholder="Description de l'offre"
                />
              </div>

              {/* Partner Name */}
              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-2">
                  Nom du partenaire
                </label>
                <input
                  type="text"
                  value={formData.partner_name || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, partner_name: e.target.value })
                  }
                  className="w-full bg-noir-800 border border-sapphire-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sapphire-500"
                  placeholder="Ex: Marriott Hotels"
                />
              </div>

              {/* Affiliate URL */}
              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-2">
                  URL d'affiliation
                </label>
                <input
                  type="url"
                  value={formData.affiliate_url || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, affiliate_url: e.target.value })
                  }
                  className="w-full bg-noir-800 border border-sapphire-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sapphire-500"
                  placeholder="https://..."
                />
              </div>

              {/* Commission */}
              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-2">
                  Commission (%)
                </label>
                <input
                  type="number"
                  value={formData.commission_percent || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      commission_percent: parseFloat(e.target.value),
                    })
                  }
                  className="w-full bg-noir-800 border border-sapphire-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sapphire-500"
                  placeholder="5"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-2">
                  Ville
                </label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full bg-noir-800 border border-sapphire-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sapphire-500"
                  placeholder="Paris"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active !== false}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="is_active" className="text-white font-semibold">
                  Offre active
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-sapphire-500/30 sticky bottom-0 bg-noir-900">
              <button
                onClick={handleCloseModal}
                className="flex-1 px-4 py-2 bg-noir-800 hover:bg-noir-700 text-white rounded font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded font-semibold transition-colors"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
