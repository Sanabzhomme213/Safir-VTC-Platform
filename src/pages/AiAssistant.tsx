import React, { useState } from 'react';
import {
  Sparkles,
  FileText,
  MessageSquare,
  Megaphone,
  Mail,
  MapPin,
  Send,
} from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const shortcuts = [
  {
    id: 'devis',
    title: 'Générer un devis',
    description: 'Créez un devis personnalisé en quelques secondes',
    icon: FileText,
    prompt: 'Générer un devis',
    aiResponse:
      'Bien sûr ! Donnez-moi les détails du trajet (départ, arrivée, date) et je génère un devis personnalisé immédiatement.',
  },
  {
    id: 'client',
    title: 'Répondre à un client',
    description: 'Rédigez des réponses professionnelles aux demandes des clients',
    icon: MessageSquare,
    prompt: 'Répondre à un client',
    aiResponse:
      'Je suis prêt à vous aider. Quel est le message du client et quelle est votre réponse souhaitée ?',
  },
  {
    id: 'seo',
    title: 'Rédiger une page SEO',
    description: 'Optimisez votre contenu pour les moteurs de recherche',
    icon: MapPin,
    prompt: 'Rédiger une page SEO',
    aiResponse:
      'Excellente idée ! Pour quelle ville ou lieu souhaitez-vous créer une page SEO optimisée ?',
  },
  {
    id: 'google',
    title: 'Publication Google Business',
    description: 'Créez une publication attrayante pour votre Google Business',
    icon: Megaphone,
    prompt: 'Publication Google Business',
    aiResponse:
      'Créons une publication attractive ! S\'agit-il d\'une promotion, d\'une actualité ou d\'un événement ?',
  },
  {
    id: 'marketing',
    title: 'Email marketing',
    description: 'Rédigez des emails percutants pour vos campagnes',
    icon: Mail,
    prompt: 'Email marketing',
    aiResponse:
      'Je vais rédiger un email percutant. Quelle est l\'occasion et le public cible ?',
  },
];

const initialMessage: Message = {
  role: 'ai',
  content:
    'Bonjour ! Je suis l\'assistant IA Safir. Je peux vous aider à générer des devis, répondez aux clients, rédiger du contenu SEO et bien plus. Comment puis-je vous aider ?',
};

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleShortcut = (shortcut: (typeof shortcuts)[0]) => {
    const userMessage: Message = {
      role: 'user',
      content: shortcut.prompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    setTimeout(() => {
      const aiMessage: Message = {
        role: 'ai',
        content: shortcut.aiResponse,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1200);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    setTimeout(() => {
      const aiMessage: Message = {
        role: 'ai',
        content:
          'Je traite votre demande. Pouvez-vous fournir plus de détails ou préciser ce que vous souhaitez ?',
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-noir-950 text-white">
      <div className="flex h-screen">
        {/* Left Sidebar - Action Cards */}
        <div className="w-72 border-r border-sapphire-500/20 overflow-y-auto p-6 space-y-4">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="w-6 h-6 text-sapphire-400" />
            <h1 className="text-2xl font-bold">IA Safir</h1>
          </div>

          <div className="space-y-4">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <button
                  key={shortcut.id}
                  onClick={() => handleShortcut(shortcut)}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 border border-sapphire-500/30 hover:border-sapphire-400/60 rounded-lg transition-all duration-300 text-left backdrop-blur-sm group"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-sapphire-400 mt-0.5 flex-shrink-0 group-hover:text-sapphire-300 transition-colors" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm mb-1 group-hover:text-sapphire-300 transition-colors">
                        {shortcut.title}
                      </h3>
                      <p className="text-xs text-gray-400 group-hover:text-gray-300">
                        {shortcut.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side - Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-2xl px-6 py-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-sapphire-600 text-white rounded-br-none'
                      : 'bg-white/5 border border-sapphire-500/20 text-gray-100 rounded-bl-none backdrop-blur-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-sapphire-500/20 px-6 py-4 rounded-lg rounded-bl-none backdrop-blur-sm">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-sapphire-400 rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-sapphire-400 rounded-full animate-pulse delay-100" />
                    <div className="w-2 h-2 bg-sapphire-400 rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-sapphire-500/20 p-6">
            <div className="flex gap-3 max-w-4xl">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Écrivez votre question..."
                className="flex-1 bg-white/5 border border-sapphire-500/30 hover:border-sapphire-400/60 focus:border-sapphire-400 focus:outline-none px-4 py-3 rounded-lg text-white placeholder-gray-500 transition-colors backdrop-blur-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                className="bg-sapphire-600 hover:bg-sapphire-500 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-3 rounded-lg transition-colors flex items-center gap-2 font-medium"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">Envoyer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
