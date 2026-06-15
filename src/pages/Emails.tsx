import React, { useState, useMemo, useCallback } from 'react';
import { sendEmail } from '../lib/emailService';
import {
  Mail,
  Send,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  ChevronRight,
  X,
  Plus,
} from 'lucide-react';
import { formatDate, emailTypeLabel } from '../lib/supabase';
import { useData } from '../lib/DataContext';

interface Email {
  id: string;
  type: keyof typeof emailTypeLabel;
  subject: string;
  client: string;
  status: 'sent' | 'pending' | 'failed';
  sent_date: string;
  content?: string;
}

interface ComposeFormData {
  recipient: string;
  type: keyof typeof emailTypeLabel;
  subject: string;
  body: string;
}

interface AutomationRule {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  last_sent?: string;
}

export default function EmailsPage() {
  const { emailLogs, clients } = useData();
  const clientMap = Object.fromEntries(clients.map(c => [c.id, `${c.first_name} ${c.last_name}`.trim() || c.email]));
  const [localEmails, setLocalEmails] = useState<Email[]>([]);

  const emails = useMemo<Email[]>(() => [
    ...localEmails,
    ...emailLogs.map(log => ({
      id: log.id,
      type: (log.email_type ?? 'custom') as keyof typeof emailTypeLabel,
      subject: log.subject,
      client: (log.client_id ? (clientMap[log.client_id] ?? log.client_id) : 'Client'),
      status: log.status as 'sent' | 'pending' | 'failed',
      sent_date: log.sent_at ?? log.created_at,
    })),
  ], [emailLogs, localEmails]);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [showComposeForm, setShowComposeForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [composeData, setComposeData] = useState<ComposeFormData>({
    recipient: '',
    type: 'booking_confirmation',
    subject: '',
    body: '',
  });
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      title: 'Confirmation de réservation',
      description: 'Envoyé automatiquement après chaque réservation',
      enabled: true,
      last_sent: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'Confirmation d\'acompte',
      description: 'Envoyé après paiement d\'acompte',
      enabled: true,
      last_sent: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      title: 'Rappel 24h',
      description: 'Envoyé 24h avant le trajet',
      enabled: true,
      last_sent: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '4',
      title: 'Merci après trajet',
      description: 'Envoyé après course terminée',
      enabled: false,
      last_sent: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: '5',
      title: 'Demande d\'avis Google',
      description: 'Envoyé 2h après la fin du trajet',
      enabled: true,
      last_sent: new Date(Date.now() - 7200000).toISOString(),
    },
  ]);

  const todayStr = new Date().toISOString().split('T')[0];
  const stats = {
    sent_today: emails.filter((e) => e.status === 'sent' && e.sent_date.startsWith(todayStr)).length,
    delivery_rate:
      emails.length > 0
        ? Math.round((emails.filter((e) => e.status === 'sent').length / emails.length) * 100)
        : 100,
    pending: emails.filter((e) => e.status === 'pending').length,
  };

  const filteredEmails = emails.filter((email) => {
    const typeMatch = typeFilter === 'all' || email.type === typeFilter;
    const statusMatch = statusFilter === 'all' || email.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const handleSendEmail = useCallback(async () => {
    if (!composeData.recipient || !composeData.subject || !composeData.body) return;
    setSending(true);
    const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
    const result = await sendEmail({
      to: composeData.recipient,
      subject: composeData.subject,
      html: `<div style="font-family:Arial,sans-serif;white-space:pre-wrap">${composeData.body.replace(/\n/g,'<br/>')}</div>`,
    }, supabaseUrl);
    const newEmail: Email = {
      id: `email-${Date.now()}`,
      type: composeData.type,
      subject: composeData.subject,
      client: composeData.recipient,
      status: result.ok ? 'sent' : 'failed',
      sent_date: new Date().toISOString(),
      content: composeData.body,
    };
    setLocalEmails(prev => [newEmail, ...prev]);
    setShowComposeForm(false);
    setComposeData({ recipient: '', type: 'booking_confirmation', subject: '', body: '' });
    setSending(false);
  }, [composeData]);

  const handleToggleRule = (ruleId: string) => {
    setAutomationRules(
      automationRules.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const handleViewEmail = (email: Email) => {
    setSelectedEmail(email);
    setShowDetailModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Envoyé';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échoué';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-noir-950 via-noir-900 to-noir-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-sapphire-400 to-sapphire-600 rounded-lg">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Gestion des Emails</h1>
          </div>
          <button
            onClick={() => setShowComposeForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sapphire-500 to-sapphire-600 text-white rounded-lg hover:from-sapphire-600 hover:to-sapphire-700 transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Composer un email
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="backdrop-blur-md bg-noir-900/40 border border-sapphire-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sapphire-300 text-sm font-medium">
                  Emails envoyés (aujourd'hui)
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.sent_today}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-sapphire-400/40" />
            </div>
          </div>

          <div className="backdrop-blur-md bg-noir-900/40 border border-sapphire-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sapphire-300 text-sm font-medium">
                  Taux de livraison
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.delivery_rate}%
                </p>
              </div>
              <Zap className="w-10 h-10 text-sapphire-400/40" />
            </div>
          </div>

          <div className="backdrop-blur-md bg-noir-900/40 border border-sapphire-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sapphire-300 text-sm font-medium">
                  Emails en attente
                </p>
                <p className="text-3xl font-bold text-white mt-2">
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-10 h-10 text-sapphire-400/40" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-4 h-4 text-sapphire-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 px-4 py-2 bg-noir-800/50 border border-sapphire-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-sapphire-500/50 transition-colors"
            >
              <option value="all">Tous les types</option>
              {Object.entries(emailTypeLabel).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 px-4 py-2 bg-noir-800/50 border border-sapphire-500/20 rounded-lg text-white text-sm focus:outline-none focus:border-sapphire-500/50 transition-colors"
          >
            <option value="all">Tous les statuts</option>
            <option value="sent">Envoyé</option>
            <option value="pending">En attente</option>
            <option value="failed">Échoué</option>
          </select>
        </div>

        {/* Emails Table */}
        <div className="backdrop-blur-md bg-noir-900/40 border border-sapphire-500/20 rounded-xl overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-sapphire-500/20 bg-noir-800/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                    Sujet
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                    Client
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                    Date d'envoi
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-sapphire-300">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredEmails.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-noir-500">
                      <Mail className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>Aucun email trouvé</p>
                    </td>
                  </tr>
                )}
                {filteredEmails.map((email) => (
                  <tr
                    key={email.id}
                    className="border-b border-sapphire-500/10 hover:bg-noir-800/30 transition-colors cursor-pointer"
                    onClick={() => handleViewEmail(email)}
                  >
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-sapphire-400" />
                        <span className="text-white">
                          {emailTypeLabel[email.type as keyof typeof emailTypeLabel]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {email.subject}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {email.client}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="flex items-center gap-2">
                        {getStatusIcon(email.status)}
                        <span className="text-gray-300">
                          {getStatusLabel(email.status)}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {formatDate(email.sent_date)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <ChevronRight className="w-4 h-4 text-sapphire-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Automation Rules */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6">
            Règles d'automatisation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {automationRules.map((rule) => (
              <div
                key={rule.id}
                className="backdrop-blur-md bg-noir-900/40 border border-sapphire-500/20 rounded-xl p-6 hover:border-sapphire-500/40 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{rule.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {rule.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleRule(rule.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ml-4 flex-shrink-0 ${
                      rule.enabled
                        ? 'bg-sapphire-500'
                        : 'bg-noir-700 border border-sapphire-500/20'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        rule.enabled ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {rule.last_sent && (
                  <p className="text-xs text-gray-500 mt-3">
                    Dernier envoi: {formatDate(rule.last_sent)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compose Email Modal */}
      {showComposeForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl backdrop-blur-md bg-noir-900 border border-sapphire-500/20 rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Composer un email</h2>
              <button
                onClick={() => setShowComposeForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sapphire-300 mb-2">
                  Destinataire
                </label>
                <input
                  type="text"
                  value={composeData.recipient}
                  onChange={(e) =>
                    setComposeData({ ...composeData, recipient: e.target.value })
                  }
                  placeholder="Sélectionner un client ou entrer un email"
                  className="w-full px-4 py-2 bg-noir-800/50 border border-sapphire-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sapphire-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sapphire-300 mb-2">
                  Type
                </label>
                <select
                  value={composeData.type}
                  onChange={(e) =>
                    setComposeData({
                      ...composeData,
                      type: e.target.value as keyof typeof emailTypeLabel,
                    })
                  }
                  className="w-full px-4 py-2 bg-noir-800/50 border border-sapphire-500/20 rounded-lg text-white focus:outline-none focus:border-sapphire-500/50 transition-colors"
                >
                  {Object.entries(emailTypeLabel).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-sapphire-300 mb-2">
                  Sujet
                </label>
                <input
                  type="text"
                  value={composeData.subject}
                  onChange={(e) =>
                    setComposeData({ ...composeData, subject: e.target.value })
                  }
                  placeholder="Sujet de l'email"
                  className="w-full px-4 py-2 bg-noir-800/50 border border-sapphire-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sapphire-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-sapphire-300 mb-2">
                  Corps du message
                </label>
                <textarea
                  value={composeData.body}
                  onChange={(e) =>
                    setComposeData({ ...composeData, body: e.target.value })
                  }
                  placeholder="Contenu de l'email"
                  rows={6}
                  className="w-full px-4 py-2 bg-noir-800/50 border border-sapphire-500/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-sapphire-500/50 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowComposeForm(false)}
                  className="flex-1 px-4 py-2 border border-sapphire-500/30 text-sapphire-300 rounded-lg hover:bg-noir-800/50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendEmail}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-sapphire-500 to-sapphire-600 text-white rounded-lg hover:from-sapphire-600 hover:to-sapphire-700 transition-all duration-300"
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Detail Modal */}
      {showDetailModal && selectedEmail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl backdrop-blur-md bg-noir-900 border border-sapphire-500/20 rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Détail de l'email</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-sapphire-300">
                  Type
                </label>
                <p className="text-white mt-1">
                  {emailTypeLabel[selectedEmail.type as keyof typeof emailTypeLabel]}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-sapphire-300">
                  Sujet
                </label>
                <p className="text-white mt-1">{selectedEmail.subject}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-sapphire-300">
                  Client
                </label>
                <p className="text-white mt-1">{selectedEmail.client}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-sapphire-300">
                  Statut
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusIcon(selectedEmail.status)}
                  <span className="text-white">
                    {getStatusLabel(selectedEmail.status)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-sapphire-300">
                  Date d'envoi
                </label>
                <p className="text-white mt-1">
                  {formatDate(selectedEmail.sent_date)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-sapphire-300">
                  Contenu
                </label>
                <div className="mt-2 p-4 bg-noir-800/50 border border-sapphire-500/10 rounded-lg text-gray-300 whitespace-pre-wrap">
                  {selectedEmail.content || 'Aucun contenu'}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-sapphire-500 to-sapphire-600 text-white rounded-lg hover:from-sapphire-600 hover:to-sapphire-700 transition-all duration-300"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
