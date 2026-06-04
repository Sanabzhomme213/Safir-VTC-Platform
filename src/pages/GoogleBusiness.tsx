import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Circle, Power, MessageSquare, AlertCircle } from 'lucide-react';
import { GoogleBusinessPost, formatDate } from '../lib/supabase';

export default function GoogleBusinessPage() {
  const [posts, setPosts] = useState<GoogleBusinessPost[]>([
    {
      id: 'gb1',
      title: 'Nouveau service de transfert express',
      content:
        'Découvrez notre nouveau service de transfert express avec chauffeur professionnel. Disponible 24h/24, 7j/7.',
      post_type: 'update',
      media_url: null,
      status: 'published',
      published_at: '2025-06-02T10:00:00Z',
      created_at: '2025-06-02T10:00:00Z',
    },
    {
      id: 'gb2',
      title: 'Promotion été : -15% sur tous les transferts',
      content: 'Profitez de l\'été avec -15% de réduction sur tous nos transferts VTC. Code promo: ETE2025',
      post_type: 'offer',
      media_url: null,
      status: 'published',
      published_at: '2025-06-01T14:00:00Z',
      created_at: '2025-06-01T14:00:00Z',
    },
    {
      id: 'gb3',
      title: 'Événement : Journée portes ouvertes',
      content: 'Visitez nos locaux le 15 juin pour découvrir nos véhicules et nos services. Entrée gratuite.',
      post_type: 'event',
      media_url: null,
      status: 'draft',
      published_at: null,
      created_at: '2025-06-03T16:00:00Z',
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<GoogleBusinessPost>>({
    title: '',
    content: '',
    post_type: 'update',
    media_url: '',
    status: 'draft',
  });
  const [autoPostTemplate, setAutoPostTemplate] = useState(
    'Merci pour votre trajet avec Safir VTC! Un avis sur Google Business? Cliquez ici: {review_link}'
  );
  const [autoPost, setAutoPost] = useState(false);
  const [autoReview, setAutoReview] = useState(false);

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.status === 'published').length,
    drafts: posts.filter((p) => p.status === 'draft').length,
  };

  const typeLabels: Record<string, string> = {
    update: 'Actualité',
    offer: 'Promotion',
    event: 'Événement',
  };

  const handleSave = () => {
    if (!formData.title || !formData.content) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingId) {
      setPosts(
        posts.map((p) =>
          p.id === editingId
            ? {
                ...p,
                title: formData.title || p.title,
                content: formData.content || p.content,
                post_type: formData.post_type || p.post_type,
                media_url: formData.media_url || p.media_url,
              }
            : p
        )
      );
    } else {
      const newPost: GoogleBusinessPost = {
        id: `gb${Date.now()}`,
        title: formData.title || '',
        content: formData.content || '',
        post_type: formData.post_type || 'update',
        media_url: formData.media_url || null,
        status: 'draft',
        published_at: null,
        created_at: new Date().toISOString(),
      };
      setPosts([...posts, newPost]);
    }

    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      content: '',
      post_type: 'update',
      media_url: '',
      status: 'draft',
    });
  };

  const handleEdit = (post: GoogleBusinessPost) => {
    setEditingId(post.id);
    setFormData(post);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) {
      setPosts(posts.filter((p) => p.id !== id));
    }
  };

  const publishPost = (id: string) => {
    setPosts(
      posts.map((p) =>
        p.id === id
          ? {
              ...p,
              status: 'published',
              published_at: new Date().toISOString(),
            }
          : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-noir-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Google Business Profile</h1>
          <p className="text-sapphire-300">Boostez votre présence Google avec des publications automatisées</p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-sapphire-500/10 border border-sapphire-500/30 rounded-xl p-4 backdrop-blur">
            <div className="text-sm text-sapphire-300 mb-1">Total</div>
            <div className="text-3xl font-bold text-sapphire-400">{stats.total}</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 backdrop-blur">
            <div className="text-sm text-emerald-300 mb-1">Publiées</div>
            <div className="text-3xl font-bold text-emerald-400">{stats.published}</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 backdrop-blur">
            <div className="text-sm text-amber-300 mb-1">Brouillons</div>
            <div className="text-3xl font-bold text-amber-400">{stats.drafts}</div>
          </div>
          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 backdrop-blur flex items-center justify-between">
            <div>
              <div className="text-sm text-cyan-300 mb-1">Connexion</div>
              <div className="text-xs text-gray-400">Status API</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-emerald-400">Connecté</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-sapphire-600 hover:bg-sapphire-700 px-6 py-2 rounded-lg font-semibold transition"
          >
            <Plus size={20} />
            Nouvelle publication
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-noir-900/50 border border-sapphire-500/20 rounded-xl p-4 backdrop-blur hover:border-sapphire-500/40 transition"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="bg-sapphire-500/20 text-sapphire-300 px-3 py-1 rounded-full text-xs font-semibold">
                  {typeLabels[post.post_type]}
                </span>
                {post.status === 'published' ? (
                  <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                    <CheckCircle size={14} />
                    Publiée
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 text-xs font-semibold">
                    <Circle size={14} />
                    Brouillon
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold mb-2 text-white">{post.title}</h3>

              <p className="text-sm text-gray-300 mb-3 line-clamp-3">{post.content}</p>

              {post.media_url && (
                <div className="mb-3 bg-noir-800 rounded text-center py-2 text-xs text-gray-400">
                  Image: {post.media_url}
                </div>
              )}

              <div className="text-xs text-gray-500 mb-4">
                {post.published_at
                  ? `Publiée le ${formatDate(post.published_at)}`
                  : `Créée le ${formatDate(post.created_at)}`}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(post)}
                  className="flex-1 flex items-center justify-center gap-2 bg-noir-800 border border-sapphire-500/30 hover:bg-noir-700 px-3 py-2 rounded text-sm font-semibold transition"
                >
                  <Edit2 size={14} />
                  Modifier
                </button>
                {post.status === 'draft' && (
                  <button
                    onClick={() => publishPost(post.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded text-sm font-semibold transition"
                  >
                    <CheckCircle size={14} />
                    Publier
                  </button>
                )}
                <button
                  onClick={() => handleDelete(post.id)}
                  className="flex items-center justify-center gap-2 bg-noir-800 border border-red-500/30 hover:bg-red-500/20 px-3 py-2 rounded text-sm font-semibold transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-noir-900/50 border border-sapphire-500/20 rounded-xl p-6 backdrop-blur">
            <h2 className="text-2xl font-bold mb-6">Publication automatique</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-noir-800/50 rounded-lg border border-sapphire-500/20">
                <div className="flex items-center gap-3">
                  <Power size={20} className="text-sapphire-400" />
                  <div>
                    <div className="font-semibold text-white">Publication automatique après chaque course</div>
                    <div className="text-sm text-gray-400">
                      Publie automatiquement un message après chaque trajet terminé
                    </div>
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoPost}
                    onChange={(e) => setAutoPost(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-noir-800/50 rounded-lg border border-sapphire-500/20">
                <div className="flex items-center gap-3">
                  <MessageSquare size={20} className="text-sapphire-400" />
                  <div>
                    <div className="font-semibold text-white">Demande d'avis automatique</div>
                    <div className="text-sm text-gray-400">
                      Envoie un email au client pour demander un avis Google
                    </div>
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoReview}
                    onChange={(e) => setAutoReview(e.target.checked)}
                    className="w-5 h-5"
                  />
                </label>
              </div>
            </div>

            {autoPost && (
              <div className="mt-6 pt-6 border-t border-sapphire-500/20">
                <label className="block text-sm font-semibold text-sapphire-300 mb-3">
                  Modèle de publication automatique
                </label>
                <textarea
                  value={autoPostTemplate}
                  onChange={(e) => setAutoPostTemplate(e.target.value)}
                  rows={4}
                  className="w-full bg-noir-800 border border-sapphire-500/30 rounded px-4 py-2 text-white placeholder-gray-500"
                  placeholder="Entrez le modèle..."
                />
                <div className="text-xs text-gray-400 mt-2">
                  Variables disponibles: {'{review_link}'}, {'{client_name}'}, {'{ride_date}'}
                </div>
              </div>
            )}
          </div>

          <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-6 backdrop-blur">
            <div className="flex gap-3">
              <AlertCircle className="flex-shrink-0 text-cyan-400 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-white mb-2">Demande d'avis automatique</h3>
                <p className="text-sm text-gray-300">
                  Après chaque course terminée, un email automatique est envoyé au client avec un lien
                  direct vers votre fiche Google Business. Cela aide à augmenter vos avis et votre
                  visibilité locale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-noir-900 border border-sapphire-500/30 rounded-xl max-w-xl w-full">
            <div className="bg-noir-800/50 border-b border-sapphire-500/20 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingId ? 'Modifier la publication' : 'Créer une publication'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre de la publication"
                  className="w-full bg-noir-800 border border-sapphire-500/30 rounded px-3 py-2 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-2">
                  Contenu
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={5}
                  placeholder="Contenu de la publication"
                  className="w-full bg-noir-800 border border-sapphire-500/30 rounded px-3 py-2 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-2">
                  Type
                </label>
                <select
                  value={formData.post_type}
                  onChange={(e) => setFormData({ ...formData, post_type: e.target.value as any })}
                  className="w-full bg-noir-800 border border-sapphire-500/30 rounded px-3 py-2 text-white"
                >
                  <option value="update">Actualité</option>
                  <option value="offer">Promotion</option>
                  <option value="event">Événement</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-sapphire-300 mb-2">
                  URL Image (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.media_url || ''}
                  onChange={(e) => setFormData({ ...formData, media_url: e.target.value })}
                  placeholder="https://exemple.com/image.jpg"
                  className="w-full bg-noir-800 border border-sapphire-500/30 rounded px-3 py-2 text-white placeholder-gray-500"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-sapphire-600 hover:bg-sapphire-700 px-4 py-2 rounded-lg font-semibold transition"
                >
                  {editingId ? 'Mettre à jour' : 'Créer en brouillon'}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 bg-noir-800 border border-sapphire-500/30 hover:bg-noir-700 px-4 py-2 rounded-lg font-semibold transition"
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
