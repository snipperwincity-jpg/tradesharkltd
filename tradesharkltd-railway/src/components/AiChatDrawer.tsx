import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, User, TrendingUp, DollarSign, ShieldCheck, BarChart3, Zap, RefreshCw } from 'lucide-react';
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

export const AiChatDrawer: React.FC<AiChatDrawerProps> = (props) => (props.isOpen ? <AiChatDrawerInner {...props} /> : null);

const AiChatDrawerInner: React.FC<AiChatDrawerProps> = ({ onClose, onOpenTrade }) => {
  const { config, currentUser, instruments, positions } = useBrokerage();

  const getWelcome = () => {
    const name = currentUser ? ` ${currentUser.name.split(' ')[0]}` : '';
    const portfolioNote = currentUser && positions?.length
      ? ` You currently have ${positions.filter(p => p.userId === currentUser.id).length} open position(s).`
      : '';
    return `Hello${name}! I'm **Shark AI™**, your intelligent financial copilot at ${config.appName}.${portfolioNote}\n\nI can help you with:\n• **Market analysis** — stocks, crypto, ETFs, commodities\n• **Trading strategies** — entry/exit, risk management, position sizing\n• **Account help** — deposits, withdrawals, KYC verification\n• **Portfolio insights** — allocation, diversification, rebalancing\n\nAsk me anything — I'm powered by real-time AI and updated market data.`;
  };

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: getWelcome(),
      time: 'Just now'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 200);
  }, []);

  const buildSystemContext = useCallback(() => {
    const topInstruments = instruments.slice(0, 10).map(i => `${i.symbol} (${i.name}) @ $${i.price?.toFixed(2) || 'N/A'}`).join(', ');
    const userContext = currentUser
      ? `The user is logged in as ${currentUser.name}. Real balance: $${currentUser.realBalance?.toLocaleString()}. KYC: ${currentUser.kycStatus}. Tier: ${currentUser.tier}.`
      : 'The user is not logged in.';
    return `You are Shark AI™, the intelligent financial copilot for ${config.appName} (${config.legalName}). You are an expert in global financial markets, trading strategies, portfolio management, and the TradeShark platform.

${userContext}

Platform context: ${config.appName} offers trading in stocks, crypto, ETFs, commodities, currencies, and indices. Key features: 5,000+ instruments, zero commission, CopyTrader™, Shark AI™, KYC verification, instant deposits/withdrawals.

Top instruments available: ${topInstruments}.

Support email: ${config.supportEmail}.

Rules:
- Be concise, insightful, and data-driven. 
- For trading questions, always mention risk management.
- If the user asks to trade a specific symbol, include it as JSON at the end: {"symbol":"AAPL"}.
- Never give illegal financial advice. Always add appropriate disclaimers.
- Respond naturally and helpfully, not like a chatbot.`;
  }, [config, currentUser, instruments, positions]);

  const handleSend = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText) return;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
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
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: r.reply || 'I couldn\'t generate a response. Please try again.',
          actionSymbol: r.symbol || undefined,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      const errText = err?.message?.includes('Too many')
        ? err.message
        : 'Sorry, I couldn\'t reach the AI service right now. Please try again in a moment.';
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
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
      id: Date.now().toString(),
      sender: 'ai',
      text: getWelcome(),
      time: 'Just now'
    }]);
  };

  // Simple markdown-like renderer
  const renderText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      // Bold
      line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      // Bullet
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return <div key={i} className="flex items-start gap-1.5 mt-1"><span className="text-[#6dff8a] mt-0.5 shrink-0">•</span><span dangerouslySetInnerHTML={{ __html: line.replace(/^[•\-]\s*/, '') }} /></div>;
      }
      return line ? <p key={i} className="mt-1 first:mt-0" dangerouslySetInnerHTML={{ __html: line }} /> : <div key={i} className="h-1" />;
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg h-full bg-[#161910] border-l border-white/15 flex flex-col shadow-2xl animate-slideLeft"
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
              <p className="text-[11px] text-[#a3a89e]">Real-time market AI · Portfolio assistant · 24/7</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={clearChat}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              title="Clear conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
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
                    ? 'bg-red-950/50 text-red-300 border border-red-500/20 rounded-tl-sm'
                    : 'bg-[#1e2217] text-[#e8eae3] border border-white/8 rounded-tl-sm'
                }`}
              >
                <div className="space-y-0.5">
                  {renderText(m.text)}
                </div>

                {m.actionSymbol && (
                  <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between">
                    <span className="text-[11px] text-white/50">Open trade for <strong className="text-white">{m.actionSymbol}</strong></span>
                    <button
                      onClick={() => onOpenTrade(m.actionSymbol!)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6dff8a] text-[#15170f] font-bold text-xs hover:bg-[#5ce077] transition-all shadow-[0_0_8px_rgba(109,255,138,0.3)]"
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
                <span className="text-[11px] text-white/40 ml-1">Shark AI is analyzing...</span>
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
              placeholder="Ask about markets, strategies, your portfolio..."
              className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-white focus:outline-none placeholder:text-white/30"
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="p-2.5 rounded-xl bg-[#6dff8a] text-[#15170f] hover:bg-[#5ce077] disabled:opacity-40 disabled:pointer-events-none transition-all shadow-[0_0_10px_rgba(109,255,138,0.2)] shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-white/30 text-center mt-2">
            Shark AI™ is for informational purposes only. Not financial advice. Trading involves risk.
          </p>
        </div>
      </div>
    </div>
  );
};
