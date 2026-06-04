import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  Toggle2,
  X,
  Save,
} from 'lucide-react';
import { mockPromoCodes } from '../lib/mockData';
import type { PromoCode } from '../lib/supabase';

interface PromoCodeWithId extends PromoCode {
  id: string;
}

export default function PromoPage() {
  const [codes, setCodes] = useState<PromoCodeWithId[]>(
    mockPromoCodes.map((code, idx) => ({ ...code, id: `promo-${idx}` }))
  );
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PromoCodeWithId>>({
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    max_uses: null,
    valid_from: new Date().toISOString().split('T')[0],
    valid_until: null,
    is_active: true,
  });

  const totalCodes = codes.length;
  const activeCodes = codes.filter((c) => c.is_active).length;
  const totalUses = codes.reduce((sum, c) => sum + c.current_uses, 0);

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleOpenModal = (code?: PromoCodeWithId) => {
    if (code) {
      setEditingId(code.id);
      setFormData(code);
    } else {
      setEditingId(null);
      setFormData({
        code: generateCode(),
        discount_type: 'percentage',
        discount_value: 0,
        max_uses: null,
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: null,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: 0,
      max_uses: null,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: null,
      is_active: true,
    });
  };

  const handleSave = () => {
    if (!formData.code || formData.discount_value === undefined) return;

    if (editingId) {
      setCodes(
        codes.map((c) =>
          c.id === editingId ? { ...c, ...formData } : c
        ) as PromoCodeWithId[]
      );
    } else {
      const newCode: PromoCodeWithId = {
        id: `promo-${Date.now()}`,
        code: formData.code,
        discount_type: formData.discount_type || 'percentage',
        discount_value: formData.discount_value,
        max_uses: formData.max_uses,
        current_uses: 0,
        valid_from: formData.valid_from || new Date().toISOString().split('T')[0],
        valid_until: formData.valid_until,
        is_active: formData.is_active !== false,
      };
      setCodes([...codes, newCode]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    setCodes(codes.filter((c) => c.id !== id));
  };

  const handleToggleActive = (id: string) => {
    setCodes(
      codes.map((c) =>
        c.id === id ? { ...c, is_active: !c.is_active } : c
      )
    );
  };

  const handleDuplicate = (code: PromoCodeWithId) => {
    const newCode: PromoCodeWithId = {
      ...code,
      id: `promo-${Date.now()}`,
      code: generateCode(),
      current_uses: 0,
    };
    setCodes([...codes, newCode]);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getUsagePercentage = (code: PromoCodeWithId): number => {
    if (!code.max_uses) return 0;
    return (code.current_uses / code.max_uses) * 100;
  };

  return (
    <div className="min-h-screen bg-noir-950">
      {/* Header */}
      <div className="border-b border-sapphire-900 bg-noir-900">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl font-bold text-white mb-2">Codes Promo</h1>
          <p className="text-sapphire-300">Gérez vos codes promotionnels</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="backdrop-blur-xl bg-white/5 border border-sapphire-500/30 rounded-lg p-6">
            <p className="text-sapphire-300 text-sm mb-2">Codes totaux</p>
            <p className="text-3xl font-bold text-white">{totalCodes}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-sapphire-500/30 rounded-lg p-6">
            <p className="text-sapphire-300 text-sm mb-2">Codes actifs</p>
            <p className="text-3xl font-bold text-sapphire-300">{activeCodes}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/5 border border-sapphire-500/30 rounded-lg p-6">
            <p className="text-sapphire-300 text-sm mb-2">Utilisations totales</p>
            <p className="text-3xl font-bold text-white">{totalUses}</p>
          </div>
        </div>

        {/* New Code Button */}
        <div className="mb-8">
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-sapphire-600 hover:bg-sapphire-700 text-white font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouveau code
          </button>
        </div>

        {/* Codes Table */}
        <div className="backdrop-blur-xl bg-white/5 border border-sapphire-500/30 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-noir-800 border-b border-sapphire-500/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                    Réduction
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                    Max utilisations
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                    Utilisations
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                    Validité
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-sapphire-300">
                    Actif
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sapphire-500/20">
                {codes.map((code) => (
                  <tr
                    key={code.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-sm bg-noir-800 text-sapphire-300 px-3 py-1 rounded">
                          {code.code}
                        </code>
                        <button
                          onClick={() => handleCopyCode(code.code)}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                          title="Copier"
                        >
                          <Copy
                            className={`w-4 h-4 ${
                              copiedId === code.code
                                ? 'text-green-400'
                                : 'text-sapphire-300'
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white">
                        {code.discount_value}
                        {code.discount_type === 'percentage' ? '%' : '€'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white">
                      {code.max_uses || 'Illimitée'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-noir-800 rounded-full h-2 overflow-hidden max-w-xs">
                          <div
                            className="h-full bg-sapphire-500 transition-all"
                            style={{
                              width: `${getUsagePercentage(code)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-sapphire-300 min-w-fit">
                          {code.current_uses}
                          {code.max_uses ? `/${code.max_uses}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-400">
                        <div>{code.valid_from}</div>
                        {code.valid_until && (
                          <div className="text-sapphire-400">
                            → {code.valid_until}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleActive(code.id)}
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          code.is_active
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-gray-500/20 text-gray-300'
                        }`}
                      >
                        {code.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal(code)}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4 text-sapphire-300" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(code)}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                          title="Dupliquer"
                        >
                          <Copy className="w-4 h-4 text-sapphire-300" />
                        </button>
                        <button
                          onClick={() => handleDelete(code.id)}
                          className="p-2 hover:bg-white/10 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {codes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sapphire-300">Aucun code promo trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-noir-900 border border-sapphire-500/30 rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-sapphire-500/30">
              <h2 className="text-2xl font-bold text-white">
                {editingId ? 'Modifier le code' : 'Créer un code promo'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-white/10 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Code */}
              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-2">
                  Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    className="flex-1 bg-noir-800 border border-sapphire-500/30 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-sapphire-500"
                    placeholder="AUTO-GÉNÉRÉ"
                  />
                  <button
                    onClick={() =>
                      setFormData({ ...formData, code: generateCode() })
                    }
                    className="px-3 py-2 bg-sapphire-600 hover:bg-sapphire-700 text-white rounded text-sm transition-colors"
                  >
                    Générer
                  </button>
                </div>
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-3">
                  Type de réduction
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="discount_type"
                      value="percentage"
                      checked={formData.discount_type === 'percentage'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_type: e.target.value as 'percentage' | 'fixed',
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-white">Pourcentage (%)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="discount_type"
                      value="fixed"
                      checked={formData.discount_type === 'fixed'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_type: e.target.value as 'percentage' | 'fixed',
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-white">Montant fixe (€)</span>
                  </label>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-2">
                  Valeur de la réduction
                </label>
                <input
                  type="number"
                  value={formData.discount_value || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount_value: parseFloat(e.target.value),
                    })
                  }
                  className="w-full bg-noir-800 border border-sapphire-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sapphire-500"
                  placeholder="0"
                />
              </div>

              {/* Max Uses */}
              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-2">
                  Max utilisations (optionnel)
                </label>
                <input
                  type="number"
                  value={formData.max_uses || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_uses: e.target.value ? parseInt(e.target.value) : null,
                    })
                  }
                  className="w-full bg-noir-800 border border-sapphire-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sapphire-500"
                  placeholder="Illimitée"
                />
              </div>

              {/* Valid From */}
              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-2">
                  Valide à partir du
                </label>
                <input
                  type="date"
                  value={formData.valid_from || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, valid_from: e.target.value })
                  }
                  className="w-full bg-noir-800 border border-sapphire-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sapphire-500"
                />
              </div>

              {/* Valid Until */}
              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-2">
                  Valide jusqu'au (optionnel)
                </label>
                <input
                  type="date"
                  value={formData.valid_until || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      valid_until: e.target.value || null,
                    })
                  }
                  className="w-full bg-noir-800 border border-sapphire-500/30 rounded px-3 py-2 text-white focus:outline-none focus:border-sapphire-500"
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
                  Code actif
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-3 p-6 border-t border-sapphire-500/30">
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
