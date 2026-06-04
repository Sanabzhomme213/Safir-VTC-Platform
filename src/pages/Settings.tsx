import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Copy,
  Eye,
  EyeOff,
  Upload,
  Check,
  AlertCircle,
} from 'lucide-react';

type SettingsTab = 'general' | 'pricing' | 'payment' | 'emails' | 'api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-noir-950">
      {/* Header */}
      <div className="border-b border-noir-800 bg-noir-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <SettingsIcon size={32} className="text-sapphire-400" />
            <h1 className="text-3xl font-bold text-white">Paramètres</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-noir-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            {[
              { id: 'general', label: 'Général' },
              { id: 'pricing', label: 'Tarification' },
              { id: 'payment', label: 'Paiement' },
              { id: 'emails', label: 'Emails' },
              { id: 'api', label: 'API' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'border-sapphire-500 text-sapphire-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isSaved && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2">
            <Check size={20} className="text-emerald-400" />
            <span className="text-emerald-300">Paramètres enregistrés avec succès</span>
          </div>
        )}

        {activeTab === 'general' && <GeneralTab onSave={handleSave} />}
        {activeTab === 'pricing' && <PricingTab onSave={handleSave} />}
        {activeTab === 'payment' && <PaymentTab onSave={handleSave} />}
        {activeTab === 'emails' && <EmailsTab onSave={handleSave} />}
        {activeTab === 'api' && <ApiTab onSave={handleSave} />}
      </div>
    </div>
  );
}

function GeneralTab({ onSave }: { onSave: () => void }) {
  const [companyName, setCompanyName] = useState('Safir VTC');
  const [email, setEmail] = useState('contact@safir-vtc.fr');
  const [phone, setPhone] = useState('+33 1 23 45 67 89');
  const [address, setAddress] = useState('123 Avenue des Champs, 75008 Paris');
  const [language, setLanguage] = useState('fr');
  const [timezone, setTimezone] = useState('Europe/Paris');

  return (
    <div className="space-y-6">
      {/* Company Info */}
      <div className="bg-noir-900/50 backdrop-blur border border-noir-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-sapphire-400 mb-6">Informations entreprise</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom de l'entreprise</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-field w-full"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Adresse</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>
      </div>

      {/* Logo Upload */}
      <div className="bg-noir-900/50 backdrop-blur border border-noir-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-sapphire-400 mb-4">Logo</h2>
        <div className="border-2 border-dashed border-noir-700 rounded-lg p-8 text-center cursor-pointer hover:border-sapphire-500 transition-colors">
          <Upload size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-300 mb-1">Cliquez pour télécharger un logo</p>
          <p className="text-sm text-gray-500">PNG, JPG jusqu'à 5MB</p>
        </div>
      </div>

      {/* Language & Timezone */}
      <div className="bg-noir-900/50 backdrop-blur border border-noir-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-sapphire-400 mb-6">Préférences</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Langue</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-field w-full">
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Fuseau horaire</label>
            <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="input-field w-full">
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Berlin">Europe/Berlin</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={onSave}
        className="flex items-center gap-2 px-6 py-3 bg-sapphire-500 hover:bg-sapphire-600 text-white rounded-lg font-bold transition-colors"
      >
        <Save size={20} />
        <span>Enregistrer</span>
      </button>
    </div>
  );
}

function PricingTab({ onSave }: { onSave: () => void }) {
  const [pricePerKm, setPricePerKm] = useState('1.80');
  const [minimumPrice, setMinimumPrice] = useState('25');
  const [roundTripDiscount, setRoundTripDiscount] = useState('10');
  const [standbyRatePerHour, setStandbyRatePerHour] = useState('45');
  const [luggageSupplement, setLuggageSupplement] = useState('0');
  const [nightSupplement, setNightSupplement] = useState('0');

  return (
    <div className="space-y-6">
      <div className="bg-noir-900/50 backdrop-blur border border-noir-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-sapphire-400 mb-6">Tarifs de base</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prix par km</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={pricePerKm}
                  onChange={(e) => setPricePerKm(e.target.value)}
                  className="input-field w-full"
                />
                <span className="text-gray-400">€</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Prix minimum</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={minimumPrice}
                  onChange={(e) => setMinimumPrice(e.target.value)}
                  className="input-field w-full"
                />
                <span className="text-gray-400">€</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Réduction aller-retour
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={roundTripDiscount}
                  onChange={(e) => setRoundTripDiscount(e.target.value)}
                  className="input-field w-full"
                />
                <span className="text-gray-400">%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tarif mise à disposition / heure
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={standbyRatePerHour}
                  onChange={(e) => setStandbyRatePerHour(e.target.value)}
                  className="input-field w-full"
                />
                <span className="text-gray-400">€</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-noir-900/50 backdrop-blur border border-noir-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-sapphire-400 mb-6">Suppléments</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Supplément bagages
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={luggageSupplement}
                  onChange={(e) => setLuggageSupplement(e.target.value)}
                  className="input-field w-full"
                />
                <span className="text-gray-400">€</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Supplément nuit
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={nightSupplement}
                  onChange={(e) => setNightSupplement(e.target.value)}
                  className="input-field w-full"
                />
                <span className="text-gray-400">€</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onSave}
        className="flex items-center gap-2 px-6 py-3 bg-sapphire-500 hover:bg-sapphire-600 text-white rounded-lg font-bold transition-colors"
      >
        <Save size={20} />
        <span>Enregistrer</span>
      </button>
    </div>
  );
}

function PaymentTab({ onSave }: { onSave: () => void }) {
  const [stripeConnected, setStripeConnected] = useState(true);
  const [depositPercentages, setDepositPercentages] = useState({
    twenty: true,
    thirty: true,
    fifty: true,
  });
  const [defaultDeposit, setDefaultDeposit] = useState('30');
  const [paymentMethods, setPaymentMethods] = useState({
    card: true,
    apple: true,
    google: true,
    cash: true,
    transfer: false,
  });

  return (
    <div className="space-y-6">
      {/* Stripe Connection */}
      <div className="bg-noir-900/50 backdrop-blur border border-noir-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-sapphire-400 mb-4">Connexion Stripe</h2>
        <div className="flex items-center justify-between p-4 bg-noir-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                stripeConnected ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <span className="text-gray-300">
              {stripeConnected ? 'Connecté' : 'Non connecté'}
            </span>
          </div>
          <button className="px-4 py-2 bg-sapphire-500 hover:bg-sapphire-600 text-white rounded-lg font-medium transition-colors">
            {stripeConnected ? 'Modifier' : 'Connecter'}
          </button>
        </div>
      </div>

      {/* Deposit Options */}
      <div className="bg-noir-900/50 backdrop-blur border border-noir-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-sapphire-400 mb-6">Options d'acompte</h2>
        <div className="space-y-4">
          <div>
            <p className="text-gray-400 mb-4">Pourcentages disponibles</p>
            <div className="space-y-3">
              {[
                { key: 'twenty', label: '20%' },
                { key: 'thirty', label: '30%' },
                { key: 'fifty', label: '50%' },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-2 cursor-pointer hover:bg-noir-800 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={depositPercentages[key as keyof typeof depositPercentages]}
                    onChange={(e) =>
                      setDepositPercentages({
                        ...depositPercentages,
                        [key]: e.target.checked,
                      })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-gray-300">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-noir-700 pt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Acompte par défaut
            </label>
            <select value={defaultDeposit} onChange={(e) => setDefaultDeposit(e.target.value)} className="input-field w-full">
              <option value="20">20%</option>
              <option value="30">30%</option>
              <option value="50">50%</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-noir-900/50 backdrop-blur border border-noir-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-sapphire-400 mb-6">Moyens de paiement acceptés</h2>
        <div className="space-y-3">
          {[
            { key: 'card', label: 'Carte bancaire (CB)' },
            { key: 'apple', label: 'Apple Pay' },
            { key: 'google', label: 'Google Pay' },
            { key: 'cash', label: 'Espèces' },
            { key: 'transfer', label: 'Virement bancaire' },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-3 p-2 cursor-pointer hover:bg-noir-800 rounded-lg transition-colors"
            >
              <input
                type="checkbox"
                checked={paymentMethods[key as keyof typeof paymentMethods]}
                onChange={(e) =>
                  setPaymentMethods({
                    ...paymentMethods,
                    [key]: e.target.checked,
                  })
                }
                className="w-4 h-4"
              />
              <span className="text-gray-300">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={onSave}
        className="flex items-center gap-2 px-6 py-3 bg-sapphire-500 hover:bg-sapphire-600 text-white rounded-lg font-bold transition-colors"
      >
        <Save size={20} />
        <span>Enregistrer</span>
      </button>
    </div>
  );
}

function EmailsTab({ onSave }: { onSave: () => void }) {
  const [resendConnected, setResendConnected] = useState(true);
  const [senderEmail, setSenderEmail] = useState('noreply@safir-vtc.fr');
  const [senderName, setSenderName] = useState('Safir VTC');

  const templates = [
    { id: 1, name: 'Confirmation de réservation', subject: 'Votre réservation est confirmée', modified: '2024-01-15' },
    { id: 2, name: 'Rappel avant départ', subject: 'Rappel: votre trajet dans 1 heure', modified: '2024-01-10' },
    { id: 3, name: 'Facture', subject: 'Votre facture Safir VTC', modified: '2024-01-05' },
    { id: 4, name: 'Annulation', subject: 'Votre réservation a été annulée', modified: '2024-01-01' },
  ];

  return (
    <div className="space-y-6">
      {/* Resend Connection */}
      <div className="bg-noir-900/50 backdrop-blur border border-noir-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-sapphire-400 mb-4">Connexion Resend</h2>
        <div className="flex items-center justify-between p-4 bg-noir-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                resendConnected ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
            <span className="text-gray-300">
              {resendConnected ? 'Connecté' : 'Non connecté'}
            </span>
          </div>
          <button className="px-4 py-2 bg-sapphire-500 hover:bg-sapphire-600 text-white rounded-lg font-medium transition-colors">
            {resendConnected ? 'Modifier' : 'Connecter'}
          </button>
        </div>
      </div>

      {/* Sender Settings */}
      <div className="bg-noir-900/50 backdrop-blur border border-noir-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-sapphire-400 mb-6">Paramètres d'expédition</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email d'expédition</label>
            <input
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nom d'expédition</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="input-field w-full"
            />
          </div>
        </div>
      </div>

      {/* Email Templates */}
      <div className="bg-noir-900/50 backdrop-blur border border-noir-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-sapphire-400 mb-6">Modèles d'email</h2>
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="p-4 bg-noir-800/50 rounded-lg flex items-center justify-between hover:bg-noir-800 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-gray-300">{template.name}</p>
                <p className="text-sm text-gray-500">{template.subject}</p>
                <p className="text-xs text-gray-600 mt-1">Modifié: {template.modified}</p>
              </div>
              <button className="px-4 py-2 bg-sapphire-500 hover:bg-sapphire-600 text-white rounded-lg font-medium transition-colors text-sm">
                Éditer
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onSave}
        className="flex items-center gap-2 px-6 py-3 bg-sapphire-500 hover:bg-sapphire-600 text-white rounded-lg font-bold transition-colors"
      >
        <Save size={20} />
        <span>Enregistrer</span>
      </button>
    </div>
  );
}

function ApiTab({ onSave }: { onSave: () => void }) {
  const [visibleKeys, setVisibleKeys] = useState({
    googleMaps: false,
    stripeSecret: false,
    stripePublishable: false,
    resend: false,
    flight: false,
    googleBusiness: false,
  });

  const toggleKeyVisibility = (key: keyof typeof visibleKeys) => {
    setVisibleKeys({ ...visibleKeys, [key]: !visibleKeys[key] });
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const ApiKeyInput = ({ label, value, keysKey }: { label: string; value: string; keysKey: keyof typeof visibleKeys }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={visibleKeys[keysKey] ? 'text' : 'password'}
            defaultValue={value}
            readOnly
            className="input-field w-full pr-10"
          />
          <button
            onClick={() => toggleKeyVisibility(keysKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
          >
            {visibleKeys[keysKey] ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <button
          onClick={() => copyToClipboard(value)}
          className="px-3 py-2 bg-noir-800 hover:bg-noir-700 text-gray-300 rounded-lg transition-colors"
        >
          <Copy size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* API Keys */}
      <div className="bg-noir-900/50 backdrop-blur border border-noir-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-sapphire-400 mb-6">Clés API</h2>
        <div className="space-y-4">
          <ApiKeyInput
            label="Google Maps API Key"
            value="AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxx"
            keysKey="googleMaps"
          />
          <ApiKeyInput
            label="Stripe Secret Key"
            value="sk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
            keysKey="stripeSecret"
          />
          <ApiKeyInput
            label="Stripe Publishable Key"
            value="pk_live_xxxxxxxxxxxxxxxxxxxxxxxx"
            keysKey="stripePublishable"
          />
          <ApiKeyInput
            label="Resend API Key"
            value="re_xxxxxxxxxxxxxxxxxxxxxxxx"
            keysKey="resend"
          />
          <ApiKeyInput
            label="Flight API Key"
            value="flight_xxxxxxxxxxxxxxxxxxxxxxxx"
            keysKey="flight"
          />
          <ApiKeyInput
            label="Google Business API"
            value="gba_xxxxxxxxxxxxxxxxxxxxxxxx"
            keysKey="googleBusiness"
          />
        </div>
      </div>

      {/* Connection Tests */}
      <div className="bg-noir-900/50 backdrop-blur border border-noir-800 rounded-xl p-6">
        <h2 className="text-xl font-bold text-sapphire-400 mb-6">Tester les connexions</h2>
        <div className="space-y-3">
          {[
            'Google Maps',
            'Stripe',
            'Resend',
            'Flight API',
            'Google Business',
          ].map((service) => (
            <div
              key={service}
              className="flex items-center justify-between p-4 bg-noir-800/50 rounded-lg"
            >
              <span className="text-gray-300">{service}</span>
              <button className="px-4 py-2 bg-noir-700 hover:bg-noir-600 text-gray-300 rounded-lg font-medium transition-colors">
                Tester
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onSave}
        className="flex items-center gap-2 px-6 py-3 bg-sapphire-500 hover:bg-sapphire-600 text-white rounded-lg font-bold transition-colors"
      >
        <Save size={20} />
        <span>Enregistrer</span>
      </button>
    </div>
  );
}
