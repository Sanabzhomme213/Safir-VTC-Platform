import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, FileText, MessageSquare, Megaphone,
  Mail, MapPin, Send, Bot
} from 'lucide-react';
import { sendAiMessage, type ChatMessage } from '../lib/aiService';

const shortcuts = [
  {
    id: 'devis',
    icon: FileText,
    title: 'Générer un devis',
    description: 'Créez un devis personnalisé en quelques secondes',
    prompt: 'Je veux générer un devis pour un client.',
  },
  {
    id: 'client',
    icon: MessageSquare,
    title: 'Répondre à un client',
    description: 'Rédigez des réponses professionnelles',
    prompt: 'Aide-moi à répondre à un message client de manière professionnelle.',
  },
  {
    id: 'seo',
    icon: MapPin,
    title: 'Rédiger une page SEO',
    description: 'Optimisez votre contenu pour les moteurs de recherche',
    prompt: 'Rédige une page SEO optimisée pour ma ville.',
  },
  {
    id: 'google',
    icon: Megaphone,
    title: 'Publication Google Business',
    description: 'Créez une publication attrayante',
    prompt: "Crée une publication Google Business attrayante pour L'Ambassadeur des VTC.",
  },
  {
    id: 'marketing',
    icon: Mail,
    title: 'Email marketing',
    description: 'Rédigez des emails percutants',
    prompt: 'Rédige un email marketing pour mes clients fidèles avec une offre promotionnelle.',
  },
];

const initialMessages: ChatMessage[] = [
  {
    role: 'assistant',
    content: 'Bonjour ! Je suis **l\'assistant IA Ambassadeur**. Je peux vous aider à générer des devis, répondre aux clients, rédiger du contenu SEO, créer des publications Google Business et bien plus encore.\n\nComment puis-je vous aider ?',
  },
];

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^• /gm, '&bull; ')
    .replace(/\n/g, '<br/>');
}

export default function AiPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (userText: string) => {
    if (!userText.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: userText };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);

    const response = await sendAiMessage(next);
    setMessages([...next, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 -m-4 lg:-m-6 rounded-xl overflow-hidden border border-white/5">
      {/* Left sidebar */}
      <aside className="w-72 bg-noir-950 border-r border-white/5 flex flex-col p-4 gap-3 overflow-y-auto shrink-0 hidden md:flex">
        <div className="flex items-center gap-2 mb-2 px-1">
          <Sparkles className="w-5 h-5 text-sapphire-400" />
          <h2 className="text-lg font-bold text-white">IA Ambassadeur</h2>
        </div>

        {shortcuts.map(s => (
          <button
            key={s.id}
            onClick={() => send(s.prompt)}
            disabled={loading}
            className="w-full p-3.5 glass rounded-lg text-left hover:bg-white/5 border border-white/5 hover:border-sapphire-500/30 transition-all group"
          >
            <div className="flex items-start gap-3">
              <s.icon className="w-4 h-4 text-sapphire-400 mt-0.5 shrink-0 group-hover:text-sapphire-300 transition-colors" />
              <div>
                <p className="text-sm font-medium text-white group-hover:text-sapphire-300 transition-colors">{s.title}</p>
                <p className="text-xs text-noir-400 mt-0.5">{s.description}</p>
              </div>
            </div>
          </button>
        ))}

      </aside>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-noir-950 min-w-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-sapphire-600 flex items-center justify-center shrink-0 mr-3 mt-0.5">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-sapphire-600 text-white rounded-br-sm'
                    : 'glass border border-white/8 text-noir-100 rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <span dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start animate-fade-in">
              <div className="w-7 h-7 rounded-lg bg-sapphire-600 flex items-center justify-center shrink-0 mr-3">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="glass border border-white/8 px-4 py-3 rounded-2xl rounded-bl-sm">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-sapphire-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/5 p-4">
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre question... (Entrée pour envoyer, Maj+Entrée pour aller à la ligne)"
              rows={1}
              className="flex-1 input-field resize-none py-3 min-h-[48px] max-h-[160px] overflow-y-auto"
              style={{ height: `${Math.min(160, Math.max(48, (input.match(/\n/g)?.length ?? 0) * 24 + 48))}px` }}
              disabled={loading}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || loading}
              className="btn-primary px-4 py-3 shrink-0 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}