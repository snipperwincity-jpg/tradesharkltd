import React, { useState, useRef, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { X, Send, Bot, Sparkles, User, TrendingUp, DollarSign, ShieldCheck, BarChart3, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { useBrokerage } from '../context/BrokerageContext';
import { api } from '../lib/api';

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTrade: (symbol: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  actionSymbol?: string;
  time: string;
  isError?: boolean;
}

const QUICK_ACTIONS = [
  { icon: <TrendingUp className="w-3.5 h-3.5" />, label: 'Top movers today', q: 'What are the top stock movers today and why?' },
  { icon: <BarChart3 className="w-3.5 h-3.5" />, label: 'BTC outlook', q: 'What is the current Bitcoin (BTC) market outlook and key price levels to watch?' },
  { icon: <DollarSign className="w-3.5 h-3.5" />, label: 'Best ETFs 2025', q: 'What are the best ETFs to invest in for 2025 and why?' },
  { icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Risk management', q: 'Explain risk management strategies for new traders — stop-loss, position sizing, and diversification.' },
  { icon: <Zap className="w-3.5 h-3.5" />, label: 'NVIDIA (NVDA)', q: 'Analyse NVIDIA (NVDA) — earnings, AI exposure, and current technical picture.' },
  { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'How to deposit', q: 'How do I deposit funds into my TradeShark account? What methods are available?' },
];

class AiChatErrorBoundary extends Component<{ children: ReactNode; onClose: () => void }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; onClose: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Shark AI Assistant error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#171a10] border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Shark AI™ Restart Required</h3>
            <p className="text-xs text-[#a3a89e]">
              A temporary display error occurred while rendering the copilot. Click below to reload the assistant.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 rounded-xl bg-[#6dff8a] text-[#15170f] font-bold text-xs hover:bg-[#5ce077] transition-all"
              >
                Reload Assistant
              </button>
              <button
                onClick={this.props.onClose}
                className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AiChatDrawer: React.FC<AiChatDrawerProps> = (props) => {
  if (!props.isOpen) return null;
  return (
    <AiChatErrorBoundary onClose={props.onClose}>
      <AiChatDrawerInner {...props} />
    </AiChatErrorBoundary>
  );
};

const AiChatDrawerInner: React.FC<AiChatDrawerProps> = ({ onClose, onOpenTrade }) => {
  const { config, currentUser, positions } = useBrokerage();

  const getWelcome = () => {
    const firstName = currentUser?.name ? ` ${currentUser.name.trim().split(' ')[0]}` : '';
    const userPositions = Array.isArray(positions) && currentUser?.id
      ? positions.filter(p => p.userId === currentUser.id)
      : [];
    const portfolioNote = userPositions.length
      ? ` You currently have ${userPositions.length} active position(s).`
      : '';
    const brandName = config?.appName || 'TradeShark';
    return `Hello${firstName}! I'm **Shark AI™**, your institutional trading copilot at ${brandName}.${portfolioNote}\n\nI can help you with:\n• **Market analysis** — real-time insight on stocks, crypto, ETFs & commodities\n• **Trading strategies** — entry/exit timing, stop-loss & risk management\n• **Account help** — instant deposits, withdrawals, and KYC verification\n• **Portfolio review** — allocation balance and position sizing\n\nAsk me anything or choose a quick topic below.`;
  };

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'ai',
      text: getWelcome(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || isTyping) return;

    const newMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    const history = messages.slice(-10).map(m => ({ sender: m.sender, text: m.text }));

    try {
      const r = await api.post('/api/ai/chat', {
        message: userText,
        history,
      });

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: r.reply || "I couldn't generate a response. Please try asking again.",
          actionSymbol: r.symbol || undefined,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      const errText = err?.message?.includes('Too many')
        ? err.message
        : "Sorry, I couldn't reach the AI service right now. Please try again in a moment.";
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'ai',
          text: errText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: `welcome-${Date.now()}`,
      sender: 'ai',
      text: getWelcome(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  // Safe markdown-like parser
  const renderText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Escape HTML entities to prevent injection
      const sanitized = line
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      // Format bold markdown
      const formatted = sanitized.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');

      if (line.startsWith('• ') || line.startsWith('- ')) {
        const bulletContent = formatted.replace(/^[•\-]\s*/, '');
        return (
          <div key={i} className="flex items-start gap-2 mt-1.5 first:mt-0">
            <span className="text-[#6dff8a] mt-0.5 shrink-0 font-bold">•</span>
            <span dangerouslySetInnerHTML={{ __html: bulletContent }} />
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={i} className="h-1.5" />;
      }

      return (
        <p key={i} className="mt-1 first:mt-0" dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-stretch justify-end bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg h-full bg-[#161910] border-l border-white/15 flex flex-col shadow-2xl animate-slideLeft text-left"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 'min(520px, 100vw)' }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#111308] shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6dff8a]/40 to-[#6dff8a]/10 border border-[#6dff8a]/40 flex items-center justify-center text-[#6dff8a] shadow-[0_0_15px_rgba(109,255,138,0.2)]">
              <Bot className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#6dff8a] border-2 border-[#111308] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm sm:text-base">Shark AI™ Copilot</span>
                <span className="text-[10px] bg-[#6dff8a] text-[#15170f] font-extrabold px-1.5 py-0.5 rounded">LIVE</span>
              </div>
              <p className="text-[11px] text-[#a3a89e]">Real-time market intelligence · Portfolio assistant · 24/7</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={clearChat}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              title="Clear conversation"
              aria-label="Clear conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              title="Close assistant"
              aria-label="Close assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Action Pills */}
        <div className="px-3 py-2.5 bg-black/30 border-b border-white/5 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-2 min-w-max">
            {QUICK_ACTIONS.map((qa, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qa.q)}
                className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full bg-white/5 hover:bg-[#6dff8a]/20 hover:text-[#6dff8a] border border-white/10 hover:border-[#6dff8a]/40 text-white/70 whitespace-nowrap transition-all"
              >
                <span className="text-[#6dff8a]">{qa.icon}</span>
                {qa.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 scroll-smooth">
          {messages.map(m => (
            <div key={m.id} className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'ai' && (
                <div className="w-7 h-7 rounded-xl bg-[#6dff8a]/20 text-[#6dff8a] flex items-center justify-center shrink-0 mt-0.5 border border-[#6dff8a]/20">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-[#6dff8a] text-[#15170f] font-medium rounded-tr-sm'
                    : m.isError
                    ? 'bg-red-950/60 text-red-200 border border-red-500/30 rounded-tl-sm'
                    : 'bg-[#1e2217] text-[#e8eae3] border border-white/10 rounded-tl-sm'
                }`}
              >
                <div className="space-y-0.5">
                  {renderText(m.text)}
                </div>

                {m.actionSymbol && (
                  <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-white/60">
                      Open trade ticket for <strong className="text-white font-mono">{m.actionSymbol}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenTrade(m.actionSymbol!);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6dff8a] text-[#15170f] font-bold text-xs hover:bg-[#5ce077] transition-all shadow-[0_0_8px_rgba(109,255,138,0.3)] shrink-0"
                    >
                      <Zap className="w-3 h-3" />
                      Trade {m.actionSymbol}
                    </button>
                  </div>
                )}
                <span className="block text-[10px] opacity-40 mt-1.5 text-right">{m.time}</span>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-white/10 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-xl bg-[#6dff8a]/20 text-[#6dff8a] flex items-center justify-center shrink-0 border border-[#6dff8a]/20">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-[#1e2217] border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#6dff8a] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#6dff8a] animate-bounce [animation-delay:0.15s]" />
                <span className="w-2 h-2 rounded-full bg-[#6dff8a] animate-bounce [animation-delay:0.3s]" />
                <span className="text-[11px] text-white/50 ml-1.5">Shark AI is analyzing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-[#111308] shrink-0">
          <div className="flex items-end gap-2 bg-black/40 border border-white/15 rounded-2xl p-2 focus-within:border-[#6dff8a]/50 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about markets, stocks, crypto, strategies..."
              className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-white focus:outline-none placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-xl bg-[#6dff8a] text-[#15170f] hover:bg-[#5ce077] disabled:opacity-40 disabled:pointer-events-none transition-all shadow-[0_0_10px_rgba(109,255,138,0.2)] shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-white/40 text-center mt-2">
            Shark AI™ is for informational analysis only. Not financial advice. Capital at risk.
          </p>
        </div>
      </div>
    </div>
  );
};
