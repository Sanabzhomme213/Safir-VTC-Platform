import React, { useState } from 'react';
import {
  Gift,
  Plus,
  Edit2,
  Zap,
  Users,
  TrendingUp,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/supabase';

interface LoyaltyTier {
  id: string;
  name: string;
  min_rides: number;
  min_spent: number;
  discount_percent: number;
  points_rate: number;
  color: string;
}

interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  max_uses: number;
  current_uses: number;
  valid_from: string;
  valid_to: string;
  active: boolean;
}

interface Referral {
  id: string;
  referrer_id: string;
  referrer_name: string;
  referee_id: string;
  referee_name: string;
  status: 'pending' | 'completed';
  created_date: string;
  completed_date?: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  loyalty_points: number;
  rides: number;
  total_spent: number;
}

export default function LoyaltyPage() {
  const [activeTab, setActiveTab] = useState<
    'programme' | 'promo' | 'parrainage'
  >('programme');
  const [tiers, setTiers] = useState<LoyaltyTier[]>([
    {
      id: '1',
      name: 'Nouveau',
      min_rides: 0,
      min_spent: 0,
      discount_percent: 0,
      points_rate: 1,
      color: 'gray',
    },
    {
      id: '2',
      name: 'Fidèle',
      min_rides: 5,
      min_spent: 300,
      discount_percent: 5,
      points_rate: 1.5,
      color: 'amber',
    },
    {
      id: '3',
      name: 'VIP',
      min_rides: 15,
      min_spent: 1000,
      discount_percent: 10,
      points_rate: 2,
      color: 'sapphire',
    },
  ]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [clientsList] = useState<Client[]>([]);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<LoyaltyTier>>({});
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [promoFormData, setPromoFormData] = useState<Partial<PromoCode>>({
    discount_type: 'percent',
    active: true,
  });
  const [copiedReferralLink, setCopiedReferralLink] = useState<string | null>(
    null
  );
  const [referrals] = useState<Referral[]>([]);

  const getTierColor = (color: string) => {
    switch (color) {
      case 'gray':
        return 'from-gray-700 to-gray-900 border-gray-600';
      case 'amber':
        return 'from-amber-600 to-amber-900 border-amber-500';
      case 'sapphire':
        return 'from-sapphire-600 to-sapphire-900 border-sapphire-500';
      default:
        return 'from-gray-700 to-gray-900 border-gray-600';
    }
  };

  const getClientTier = (client: Client) => {
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (
        client.rides >= tiers[i].min_rides &&
        client.total_spent >= tiers[i].min_spent
      ) {
        return tiers[i];
      }
    }
    return tiers[0];
  };

  const topLoyalClients = [...clientsList]
    .sort((a, b) => b.loyalty_points - a.loyalty_points)
    .slice(0, 5);

  const clientTierDistribution = {
    nouveau: clientsList.filter((c) => getClientTier(c).id === '1').length,
    fidele: clientsList.filter((c) => getClientTier(c).id === '2').length,
    vip: clientsList.filter((c) => getClientTier(c).id === '3').length,
  };

  const referralStats = {
    total: referrals.length,
    pending: referrals.filter((r) => r.status === 'pending').length,
    completed: referrals.filter((r) => r.status === 'completed').length,
  };

  const handleStartEditingTier = (tier: LoyaltyTier) => {
    setEditingTierId(tier.id);
    setEditFormData({ ...tier });
  };

  const handleSaveTier = () => {
    if (editingTierId) {
      setTiers(
        tiers.map((t) =>
          t.id === editingTierId ? { ...t, ...editFormData } : t
        )
      );
      setEditingTierId(null);
      setEditFormData({});
    }
  };

  const handleAddPromoCode = () => {
    const newPromo: PromoCode = {
      id: `promo-${Date.now()}`,
      code: (promoFormData.code || '').toUpperCase(),
      discount_type: promoFormData.discount_type || 'percent',
      discount_value: promoFormData.discount_value || 0,
      max_uses: promoFormData.max_uses || 0,
      current_uses: 0,
      valid_from: promoFormData.valid_from || new Date().toISOString(),
      valid_to: promoFormData.valid_to || new Date().toISOString(),
      active: promoFormData.active !== false,
    };
    setPromoCodes([newPromo, ...promoCodes]);
    setShowPromoForm(false);
    setPromoFormData({ discount_type: 'percent', active: true });
  };

  const handleTogglePromoActive = (promoId: string) => {
    setPromoCodes(
      promoCodes.map((promo) =>
        promo.id === promoId ? { ...promo, active: !promo.active } : promo
      )
    );
  };

  const handleCopyReferralLink = (clientId: string) => {
    const link = `https://ambassadeur-vtc.com/ref/${clientId}`;
    navigator.clipboard.writeText(link);
    setCopiedReferralLink(clientId);
    setTimeout(() => setCopiedReferralLink(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-noir-950 via-noir-900 to-noir-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-sapphire-400 to-sapphire-600 rounded-lg">
            <Gift className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Programme de Fidélité
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-sapphire-500/20">
          {[
            { value: 'programme', label: 'Programme Fidélité' },
            { value: 'promo', label: 'Codes Promo' },
            { value: 'parrainage', label: 'Parrainage' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() =>
                setActiveTab(tab.value as 'programme' | 'promo' | 'parrainage')
              }
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.value
                  ? 'border-sapphire-500 text-sapphire-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Programme Fidélité */}
        {activeTab === 'programme' && (
          <div className="space-y-8">
            {/* Loyalty Tiers */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6">
                Niveaux de Fidélité
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`relative backdrop-blur-md bg-gradient-to-br ${getTierColor(
                      tier.color
                    )} border-2 rounded-xl p-6 overflow-hidden group hover:shadow-lg transition-all duration-300`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform duration-300" />

                    <div className="relative z-10">
                      <h3 className="text-xl font-bold text-white mb-4">
                        {tier.name}
                      </h3>

                      <div className="space-y-3 mb-6">
                        <div>
                          <p className="text-white/70 text-xs uppercase tracking-wide">
                            Trajets requis
                          </p>
                          <p className="text-white text-lg font-semibold">
                            {tier.min_rides}+
                          </p>
                        </div>

                        <div>
                          <p className="text-white/70 text-xs uppercase tracking-wide">
                            Dépense minimale
                          </p>
                          <p className="text-white text-lg font-semibold">
                            {formatCurrency(tier.min_spent)}+
                          </p>
                        </div>

                        <div>
                          <p className="text-white/70 text-xs uppercase tracking-wide">
                            Réduction
                          </p>
                          <p className="text-white text-lg font-semibold">
                            {tier.discount_percent}%
                          </p>
                        </div>

                        <div>
                          <p className="text-white/70 text-xs uppercase tracking-wide">
                            Taux de points
                          </p>
                          <p className="text-white text-lg font-semibold">
                            {tier.points_rate} pt/€
                          </p>
                        </div>
                      </div>

                      {editingTierId === tier.id ? (
                        <div className="space-y-3 mb-4">
                          <input
                            type="text"
                            value={editFormData.name || ''}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                name: e.target.value,
                              })
                            }
                            placeholder="Nom"
                            className="w-full px-3 py-2 bg-noir-900/50 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-white/50"
                          />
                          <input
                            type="number"
                            value={editFormData.min_rides || ''}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                min_rides: parseInt(e.target.value),
                              })
                            }
                            placeholder="Trajets min"
                            className="w-full px-3 py-2 bg-noir-900/50 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-white/50"
                          />
                          <input
                            type="number"
                            value={editFormData.min_spent || ''}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                min_spent: parseFloat(e.target.value),
                              })
                            }
                            placeholder="Dépense min"
                            className="w-full px-3 py-2 bg-noir-900/50 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-white/50"
                          />
                          <input
                            type="number"
                            value={editFormData.discount_percent || ''}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                discount_percent: parseFloat(e.target.value),
                              })
                            }
                            placeholder="Réduction %"
                            className="w-full px-3 py-2 bg-noir-900/50 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-white/50"
                          />
                          <input
                            type="number"
                            value={editFormData.points_rate || ''}
                            onChange={(e) =>
                              setEditFormData({
                                ...editFormData,
                                points_rate: parseFloat(e.target.value),
                              })
                            }
                            placeholder="Taux points"
                            step="0.1"
                            className="w-full px-3 py-2 bg-noir-900/50 border border-white/20 rounded text-white text-sm focus:outline-none focus:border-white/50"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveTier}
                              className="flex-1 px-3 py-2 bg-white/20 text-white rounded text-sm hover:bg-white/30 transition-colors"
                            >
                              Enregistrer
                            </button>
                            <button
                              onClick={() => {
                                setEditingTierId(null);
                                setEditFormData({});
                              }}
                              className="flex-1 px-3 py-2 bg-noir-900/50 text-white rounded text-sm hover:bg-noir-900 transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEditingTier(tier)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          <Edit2 className="w-4 h-4" />
                          Modifier
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Client Distribution */}
            <div className="backdrop-blur-md bg-noir-900/40 border border-sapphire-500/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">
                Distribution des clients par niveau
              </h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full bg-gray-700/30 border border-gray-600/50">
                    <span className="text-2xl font-bold text-white">
                      {clientTierDistribution.nouveau}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Nouveau</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full bg-amber-700/30 border border-amber-600/50">
                    <span className="text-2xl font-bold text-white">
                      {clientTierDistribution.fidele}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Fidèle</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 rounded-full bg-sapphire-700/30 border border-sapphire-600/50">
                    <span className="text-2xl font-bold text-white">
                      {clientTierDistribution.vip}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">VIP</p>
                </div>
              </div>
            </div>

            {/* Top Loyal Clients */}
            <div className="backdrop-blur-md bg-noir-900/40 border border-sapphire-500/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">
                Clients les plus fidèles
              </h3>
              <div className="space-y-3">
                {topLoyalClients.length === 0 ? (
                  <div className="text-center py-8 text-noir-400 text-sm">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Aucun client fidèle pour le moment.</p>
                    <p className="text-xs mt-1">Les clients apparaîtront ici après leurs premières réservations.</p>
                  </div>
                ) : topLoyalClients.map((client, index) => {
                  const tier = getClientTier(client);
                  return (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-4 bg-noir-800/50 border border-sapphire-500/10 rounded-lg hover:border-sapphire-500/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-sapphire-500/20 text-sapphire-300 font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-medium">{client.name}</p>
                          <p className="text-gray-400 text-sm">
                            {client.rides} trajets • {formatCurrency(client.total_spent)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sapphire-400 font-semibold">
                          {client.loyalty_points} pts
                        </p>
                        <p className="text-gray-400 text-xs">{tier.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Codes Promo */}
        {activeTab === 'promo' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowPromoForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sapphire-500 to-sapphire-600 text-white rounded-lg hover:from-sapphire-600 hover:to-sapphire-700 transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                Ajouter un code promo
              </button>
            </div>

            {/* Promo Codes Table */}
            <div className="backdrop-blur-md bg-noir-900/40 border border-sapphire-500/20 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-sapphire-500/20 bg-noir-800/50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                        Code
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                        Réduction
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                        Utilisations
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                        Validité
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {promoCodes.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-noir-400 text-sm">Aucun code promo. Créez-en un pour vos clients.</td></tr>
                    )}
                    {promoCodes.map((promo) => (
                      <tr
                        key={promo.id}
                        className="border-b border-sapphire-500/10 hover:bg-noir-800/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm">
                          <span className="font-mono font-semibold text-white bg-noir-800/50 px-3 py-1 rounded">
                            {promo.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {promo.discount_type === 'percent'
                            ? `${promo.discount_value}%`
                            : formatCurrency(promo.discount_value)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {promo.current_uses}/{promo.max_uses}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {formatDate(promo.valid_from)} à{' '}
                          {formatDate(promo.valid_to)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            onClick={() => handleTogglePromoActive(promo.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              promo.active
                                ? 'bg-sapphire-500'
                                : 'bg-noir-700 border border-sapphire-500/20'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                promo.active
                                  ? 'translate-x-5'
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Parrainage */}
        {activeTab === 'parrainage' && (
          <div className="space-y-8">
            {/* Info Section */}
            <div className="backdrop-blur-md bg-noir-900/40 border border-sapphire-500/20 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-sapphire-500/20 rounded-lg flex-shrink-0">
                  <Zap className="w-6 h-6 text-sapphire-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Comment fonctionne le parrainage?
                  </h3>
                  <p className="text-gray-300">
                    Chaque parrainage réussi rapporte 100 points au parrain. Les
                    clients peuvent générer un lien de parrainage unique pour
                    partager avec leurs amis et augmenter leurs points de
                    fidélité.
                  </p>
                </div>
              </div>
            </div>

            {/* Referral Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="backdrop-blur-md bg-noir-900/40 border border-sapphire-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sapphire-300 text-sm font-medium">
                      Total parrainages
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {referralStats.total}
                    </p>
                  </div>
                  <Users className="w-10 h-10 text-sapphire-400/40" />
                </div>
              </div>

              <div className="backdrop-blur-md bg-noir-900/40 border border-sapphire-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sapphire-300 text-sm font-medium">
                      En attente
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {referralStats.pending}
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-sapphire-400/40" />
                </div>
              </div>

              <div className="backdrop-blur-md bg-noir-900/40 border border-sapphire-500/20 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sapphire-300 text-sm font-medium">
                      Complétés
                    </p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {referralStats.completed}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-sapphire-400/40" />
                </div>
              </div>
            </div>

            {/* Referral Link Generator */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">
                Liens de parrainage par client
              </h3>
              <div className="space-y-3">
                {clientsList.slice(0, 5).map((client) => (
                  <div
                    key={client.id}
                    className="backdrop-blur-md bg-noir-900/40 border border-sapphire-500/20 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold">{client.name}</p>
                        <p className="text-gray-400 text-sm truncate">
                          https://ambassadeur-vtc.com/ref/{client.id}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopyReferralLink(client.id)}
                        className="flex-shrink-0 p-2 hover:bg-noir-800/50 rounded-lg transition-colors"
                      >
                        {copiedReferralLink === client.id ? (
                          <Check className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-sapphire-400" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Referrals */}
            <div>
              <h3 className="text-lg font-bold text-white mb-4">
                Parrainages récents
              </h3>
              <div className="backdrop-blur-md bg-noir-900/40 border border-sapphire-500/20 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-sapphire-500/20 bg-noir-800/50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                          Parrain
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                          Filleul
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                          Statut
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((referral) => (
                        <tr
                          key={referral.id}
                          className="border-b border-sapphire-500/10 hover:bg-noir-800/30 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm text-white">
                            {referral.referrer_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-white">
                            {referral.referee_name}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                referral.status === 'completed'
                                  ? 'bg-green-500/20 text-green-300'
                                  : 'bg-yellow-500/20 text-yellow-300'
                              }`}
                            >
                              {referral.status === 'completed' ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              {referral.status === 'completed'
                                ? 'Complété'
                                : 'En attente'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            {formatDate(referral.created_date)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Promo Code Modal */}
      {showPromoForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl backdrop-blur-md bg-noir-900 border border-sapphire-500/20 rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Ajouter un code promo
              </h2>
              <button
                onClick={() => {
                  setShowPromoForm(false);
                  setPromoFormData({ discount_type: 'percent', active: true });
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sapphire-300 mb-2">
                  Code
                </label>
                <input
                  type="text"
                  value={promoFormData.code || ''}
                  onChange={(e) =>
                    setPromoFormData({
                      ...promoFormData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="Ex: SUMMER2024"
                  className="w-full px-4 py-2 bg-noir-800/50 border border-sapphire-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sapphire-500/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sapphire-300 mb-2">
                    Type de réduction
                  </label>
                  <select
                    value={promoFormData.discount_type || 'percent'}
                    onChange={(e) =>
                      setPromoFormData({
                        ...promoFormData,
                        discount_type: e.target.value as 'percent' | 'fixed',
                      })
                    }
                    className="w-full px-4 py-2 bg-noir-800/50 border border-sapphire-500/20 rounded-lg text-white focus:outline-none focus:border-sapphire-500/50 transition-colors"
                  >
                    <option value="percent">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (€)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-sapphire-300 mb-2">
                    Valeur
                  </label>
                  <input
                    type="number"
                    value={promoFormData.discount_value || ''}
                    onChange={(e) =>
                      setPromoFormData({
                        ...promoFormData,
                        discount_value: parseFloat(e.target.value),
                      })
                    }
                    placeholder="10"
                    step={
                      promoFormData.discount_type === 'percent' ? '1' : '0.01'
                    }
                    className="w-full px-4 py-2 bg-noir-800/50 border border-sapphire-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sapphire-500/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sapphire-300 mb-2">
                  Utilisations maximales
                </label>
                <input
                  type="number"
                  value={promoFormData.max_uses || ''}
                  onChange={(e) =>
                    setPromoFormData({
                      ...promoFormData,
                      max_uses: parseInt(e.target.value),
                    })
                  }
                  placeholder="100"
                  className="w-full px-4 py-2 bg-noir-800/50 border border-sapphire-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sapphire-500/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-sapphire-300 mb-2">
                    Valide à partir de
                  </label>
                  <input
                    type="date"
                    value={
                      promoFormData.valid_from
                        ? new Date(promoFormData.valid_from)
                            .toISOString()
                            .split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      setPromoFormData({
                        ...promoFormData,
                        valid_from: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="w-full px-4 py-2 bg-noir-800/50 border border-sapphire-500/20 rounded-lg text-white focus:outline-none focus:border-sapphire-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sapphire-300 mb-2">
                    Valide jusqu'au
                  </label>
                  <input
                    type="date"
                    value={
                      promoFormData.valid_to
                        ? new Date(promoFormData.valid_to)
                            .toISOString()
                            .split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      setPromoFormData({
                        ...promoFormData,
                        valid_to: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="w-full px-4 py-2 bg-noir-800/50 border border-sapphire-500/20 rounded-lg text-white focus:outline-none focus:border-sapphire-500/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowPromoForm(false);
                    setPromoFormData({ discount_type: 'percent', active: true });
                  }}
                  className="flex-1 px-4 py-2 border border-sapphire-500/30 text-sapphire-300 rounded-lg hover:bg-noir-800/50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddPromoCode}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-sapphire-500 to-sapphire-600 text-white rounded-lg hover:from-sapphire-600 hover:to-sapphire-700 transition-all duration-300"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Clock } from 'lucide-react';
