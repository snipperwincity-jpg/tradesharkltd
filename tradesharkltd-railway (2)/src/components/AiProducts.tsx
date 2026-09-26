import React, { useState } from 'react';
import { AI_SLIDES } from '../data/mockData';
import { ChevronLeft, ChevronRight, Bot, Cpu, Sliders, Sparkles, Send, Check } from 'lucide-react';

interface AiProductsProps {
  onOpenAiChat: () => void;
}

export const AiProducts: React.FC<AiProductsProps> = ({ onOpenAiChat }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Interactive tester state for Slide 1
  const [selectedPrompt, setSelectedPrompt] = useState('Why did NVDA drop 2.4% today?');
  const [promptAnswer, setPromptAnswer] = useState(
    'NVIDIA experienced short-term profit taking following a 14% two-week rally ahead of the quarterly datacenter chip update. Institutional sentiment remains 89% Buy on TradeShark with solid guidance.'
  );

  // Interactive slider state for Slide 2
  const [agentRisk, setAgentRisk] = useState(3);
  const [rebalanceFreq, setRebalanceFreq] = useState<'Daily' | 'Weekly' | 'Threshold'>('Daily');

  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % AI_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + AI_SLIDES.length) % AI_SLIDES.length);
  };

  const currentSlide = AI_SLIDES[currentSlideIndex];

  const samplePrompts = [
    {
      q: 'Why did NVDA drop 2.4% today?',
      a: 'NVIDIA experienced short-term profit taking following a 14% two-week rally ahead of datacenter chip shipments. Institutional sentiment remains 89% Buy with strong TradeShark community volume.'
    },
    {
      q: 'Compare BTC vs ETH 30-day Sharpe ratio',
      a: 'Bitcoin has a 30-day Sharpe ratio of 2.14 versus Ethereum at 1.62. BTC experienced lower historical drawdown over the recent macroeconomic CPI print.'
    },
    {
      q: 'Find top 3 dividend aristocrats with low debt',
      a: 'Based on TradeShark screener: 1. Johnson & Johnson (JNJ, 3.1% yield), 2. Procter & Gamble (PG, 2.5% yield), 3. Chevron (CVX, 4.2% yield). All have interest coverage > 12x.'
    }
  ];

  return (
    <section id="shark-ai" className="py-20 bg-gradient-to-b from-[#15170f] via-[#1a1e14] to-[#15170f] relative border-b border-white/5 overflow-hidden">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#6dff8a]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Tag */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#6dff8a]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Next-Gen Intelligence by TradeShark
            </span>
          </div>

          {/* Slide Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              className="p-2.5 rounded-full border border-white/10 hover:border-[#6dff8a] bg-white/5 hover:bg-[#6dff8a]/10 text-white transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-xs text-[#a3a89e] px-2 font-mono">
              {currentSlideIndex + 1} / {AI_SLIDES.length}
            </div>
            <button
              onClick={nextSlide}
              className="p-2.5 rounded-full border border-white/10 hover:border-[#6dff8a] bg-white/5 hover:bg-[#6dff8a]/10 text-white transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Slide Content Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Text, Bullets, and Action */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6dff8a]/15 text-[#6dff8a] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentSlide.tagline}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              {currentSlide.headline}
            </h2>

            <ul className="space-y-3.5 text-sm sm:text-base text-[#d4d6cf]">
              {currentSlide.bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6dff8a]/20 text-[#6dff8a] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <button
                onClick={onOpenAiChat}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-base transition-all transform hover:scale-[1.02] shadow-[0_0_25px_rgba(109,255,138,0.25)]"
              >
                <span>{currentSlide.ctaText}</span>
                <Bot className="w-4 h-4" />
              </button>
            </div>

            {currentSlide.id === 1 && (
              <p className="text-[11px] text-[#a3a89e] italic">
                Shark AI is an artificial intelligence assistant for informational analysis; responses should not be considered investment advice.
              </p>
            )}
          </div>

          {/* Right: Interactive Live Simulation Box based on currentSlide */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl bg-[#181b12] border border-white/15 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative">
              
              {/* Slide 1 Preview: Live Interactive AI Dialogue Box */}
              {currentSlide.previewType === 'chat' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-[#6dff8a] text-[#15170f] flex items-center justify-center font-bold text-xs">
                        TS
                      </div>
                      <span className="text-xs font-bold text-white">Shark AI™ Interactive Preview</span>
                    </div>
                    <span className="text-[10px] text-[#6dff8a] bg-[#6dff8a]/10 px-2 py-0.5 rounded-full font-mono">
                      Online 24/7
                    </span>
                  </div>

                  {/* Sample Prompt Chips */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] text-[#a3a89e] font-semibold">Try sample questions:</span>
                    <div className="flex flex-wrap gap-2">
                      {samplePrompts.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setSelectedPrompt(p.q);
                            setPromptAnswer(p.a);
                          }}
                          className={`text-xs px-3 py-1.5 rounded-xl border text-left transition-all ${
                            selectedPrompt === p.q
                              ? 'bg-[#6dff8a]/20 border-[#6dff8a] text-[#6dff8a] font-medium'
                              : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
                          }`}
                        >
                          {p.q}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chat Bubbles */}
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-end">
                      <div className="max-w-[85%] rounded-2xl bg-white/10 px-4 py-2.5 text-xs text-white">
                        {selectedPrompt}
                      </div>
                    </div>

                    <div className="flex justify-start items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[#6dff8a]/20 text-[#6dff8a] flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                      <div className="max-w-[90%] rounded-2xl bg-black/40 border border-white/10 p-3.5 text-xs text-[#d4d6cf] leading-relaxed">
                        {promptAnswer}
                      </div>
                    </div>
                  </div>

                  {/* Input bar mockup */}
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Ask Shark AI anything about markets..."
                      className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#6dff8a]"
                      disabled
                    />
                    <button 
                      onClick={onOpenAiChat}
                      className="p-2 rounded-xl bg-[#6dff8a] text-[#15170f] hover:bg-[#5ce077] transition-colors"
                      title="Open full AI chat"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Slide 2 Preview: Agent Portfolio Configuration */}
              {currentSlide.previewType === 'agent' && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-[#6dff8a]" />
                      <span className="text-xs font-bold text-white">Autonomous Agent Allocation Guardrails</span>
                    </div>
                    <span className="text-[10px] text-white/50">Rule Engine v2.4</span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <div className="flex justify-between text-[#d4d6cf] mb-1.5">
                        <span>Risk Sensitivity Profile:</span>
                        <strong className="text-[#6dff8a]">Level {agentRisk} / 5 (Moderate Growth)</strong>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="5" 
                        value={agentRisk} 
                        onChange={(e) => setAgentRisk(Number(e.target.value))}
                        className="w-full accent-[#6dff8a] cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[#d4d6cf] mb-1.5">
                        <span>Rebalancing Frequency:</span>
                        <strong className="text-white">{rebalanceFreq}</strong>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Daily', 'Weekly', 'Threshold'] as const).map((mode) => (
                          <button
                            key={mode}
                            onClick={() => setRebalanceFreq(mode)}
                            className={`py-2 rounded-lg font-semibold transition-all ${
                              rebalanceFreq === mode 
                                ? 'bg-[#6dff8a] text-[#15170f]' 
                                : 'bg-white/5 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/60">Target Portfolio Yield:</span>
                        <span className="font-bold text-[#6dff8a] font-mono">14.2% - 18.5% ARR</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Auto Stop-Loss Trigger:</span>
                        <span className="font-bold text-white font-mono">-4.5% strictly enforced</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Current Active Agent:</span>
                        <span className="font-bold text-white">Macro Alpha Shark v4</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Slide 3 Preview: App Store Extensions */}
              {currentSlide.previewType === 'custom' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-bold text-white">TradeShark Extension Store</span>
                    <span className="text-[10px] text-[#6dff8a]">45+ Apps Available</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { name: 'Whale Flow Scanner', desc: 'Real-time detection of $1M+ block orders on NASDAQ & NYSE.', rating: '4.9 ★', users: '12.4k' },
                      { name: 'Crypto Volatility Harvester', desc: 'Auto-hedging grid bots for high-volume delta capture.', rating: '4.8 ★', users: '8.9k' },
                      { name: 'ESG Impact Filter', desc: 'Filter companies adhering strictly to global sustainability benchmarks.', rating: '4.7 ★', users: '6.1k' }
                    ].map((app, aIdx) => (
                      <div key={aIdx} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3 hover:border-[#6dff8a]/40 transition-colors">
                        <div>
                          <div className="font-bold text-white text-xs">{app.name}</div>
                          <p className="text-[11px] text-[#a3a89e]">{app.desc}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-[#6dff8a] block font-mono font-bold">{app.rating}</span>
                          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-white font-semibold">Installed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
