import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Inbox, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  User, 
  FileText, 
  Search, 
  Reply, 
  Trash2, 
  ShieldCheck, 
  Building2,
  ChevronRight,
  PlusCircle,
  MessageSquare
} from 'lucide-react';
import { useBrokerage } from '../../context/BrokerageContext';
import { EmailMessage, UserAccount } from '../../types';

interface UserInboxTabProps {
  currentUser: UserAccount;
  onNotify: (msg: string) => void;
}

export const UserInboxTab: React.FC<UserInboxTabProps> = ({ currentUser, onNotify }) => {
  const { emails, markEmailAsRead, sendEmail, config } = useBrokerage();

  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Reply / Compose state
  const [isComposing, setIsComposing] = useState(false);
  const [inquiryTopic, setInquiryTopic] = useState<EmailMessage['category']>('SUPPORT');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryBody, setInquiryBody] = useState('');

  // Client sees emails addressed to them specifically OR broadcast to ALL
  const clientEmails = emails.filter(
    e => e.userId === currentUser.id || e.to.includes('All') || e.userId === 'ALL' || e.to === currentUser.email
  );

  const filteredEmails = clientEmails.filter(e => {
    const matchesSearch = e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.from.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || e.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const activeEmail = clientEmails.find(e => e.id === selectedEmailId) || filteredEmails[0] || null;

  const handleSelectEmail = (email: EmailMessage) => {
    setSelectedEmailId(email.id);
    if (!email.read && !email.isRead) {
      markEmailAsRead(email.id);
    }
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquirySubject.trim() || !inquiryBody.trim()) {
      onNotify('Please complete subject and message body');
      return;
    }

    try {
    await sendEmail({
      from: `${currentUser.name} <${currentUser.email}>`,
      to: 'Client Desk',
      userId: currentUser.id,
      userName: currentUser.name,
      subject: inquirySubject,
      body: inquiryBody,
      category: inquiryTopic,
      priority: 'Normal',
      direction: 'inbound'
    });
    } catch (err: any) {
      onNotify(err?.message || 'Could not send your message');
      return;
    }

    onNotify('Message sent to our client desk. We will reply to your inbox and email.');
    setInquirySubject('');
    setInquiryBody('');
    setIsComposing(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#6dff8a]" />
            <span>Official Communications &amp; Compliance Inbox</span>
          </h3>
          <p className="text-xs text-[#a3a89e]">
            Official regulatory notices, funding clearance confirmations, and direct messaging with your broker.
          </p>
        </div>

        <button
          onClick={() => setIsComposing(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-xs shadow-md transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Contact Broker Desk</span>
        </button>
      </div>

      {/* Main Mailbox Grid: Left List + Right Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[520px]">
        {/* Left Column: Email List */}
        <div className="lg:col-span-5 bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
          {/* Search & Filter */}
          <div className="p-3 border-b border-white/10 space-y-2 bg-black/20">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#6dff8a]"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[10px]">
              {(['ALL', 'KYC', 'FUNDING', 'MARKET_ALERT', 'TRADING', 'SUPPORT'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                    filterCategory === cat
                      ? 'bg-[#6dff8a] text-[#15170f]'
                      : 'bg-white/5 text-white/60 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Email Items List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 max-h-[480px]">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-xs text-white/40 space-y-2">
                <Inbox className="w-8 h-8 mx-auto text-white/20" />
                <div>No messages in this folder</div>
              </div>
            ) : (
              filteredEmails.map((msg) => {
                const isSelected = activeEmail?.id === msg.id;
                return (
                  <button
                    key={msg.id}
                    onClick={() => handleSelectEmail(msg)}
                    className={`w-full text-left p-3.5 transition-colors block ${
                      isSelected
                        ? 'bg-[#6dff8a]/10 border-l-2 border-[#6dff8a]'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {(!msg.read && !msg.isRead) && (
                          <span className="w-2 h-2 rounded-full bg-[#6dff8a] shrink-0" />
                        )}
                        <span className={`text-xs truncate ${(!msg.read && !msg.isRead) ? 'font-bold text-white' : 'font-medium text-white/80'}`}>
                          {msg.direction === 'inbound' ? `You: ${msg.subject}` : msg.from.split('<')[0]}
                        </span>
                      </div>

                      <span className="text-[10px] font-mono text-white/40 shrink-0">
                        {msg.date.split(' ')[0]}
                      </span>
                    </div>

                    <div className={`text-xs truncate mb-1.5 ${(!msg.read && !msg.isRead) ? 'font-bold text-white' : 'text-white/70'}`}>
                      {msg.subject}
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/60 font-medium">
                        {msg.category}
                      </span>
                      {msg.priority === 'Urgent' && (
                        <span className="text-red-400 font-bold">URGENT</span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Email Reader */}
        <div className="lg:col-span-7 bg-[#14160d] border border-white/10 rounded-2xl flex flex-col overflow-hidden">
          {activeEmail ? (
            <div className="flex flex-col h-full">
              {/* Reader Header */}
              <div className="p-4 sm:p-5 border-b border-white/10 space-y-3 bg-[#181b11]">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6dff8a]/20 text-[#6dff8a]">
                    OFFICIAL DISPATCH • {activeEmail.category}
                  </span>
                  <span className="text-xs font-mono text-white/40">
                    {activeEmail.date}
                  </span>
                </div>

                <h4 className="text-base font-bold text-white">
                  {activeEmail.subject}
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs text-white/60 pt-1">
                  <div>
                    <span className="text-white/40 block text-[10px]">From:</span>
                    <span className="text-white font-medium">{activeEmail.from}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block text-[10px]">To:</span>
                    <span className="text-white font-medium">{activeEmail.to}</span>
                  </div>
                </div>
              </div>

              {/* Reader Body */}
              <div className="p-5 flex-1 overflow-y-auto text-xs text-white/85 whitespace-pre-wrap leading-relaxed space-y-4 font-sans">
                {activeEmail.body}
              </div>

              {/* Reader Footer with Reply Action */}
              <div className="p-4 border-t border-white/10 bg-black/30 flex items-center justify-between">
                <div className="text-[10px] text-white/40">
                  {config.legalName}
                </div>

                <button
                  onClick={() => {
                    setInquirySubject(`Re: ${activeEmail.subject}`);
                    setInquiryTopic(activeEmail.category);
                    setIsComposing(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                >
                  <Reply className="w-3.5 h-3.5 text-[#6dff8a]" />
                  <span>Reply to Broker</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white/40 text-xs">
              <Mail className="w-12 h-12 text-white/20 mb-3" />
              <div>Select a message from the list to view full communication</div>
            </div>
          )}
        </div>
      </div>

      {/* COMPOSE / INQUIRY MODAL */}
      {isComposing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-[#14160d] border border-[#6dff8a]/40 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#6dff8a]" />
                <h4 className="font-bold text-white text-sm">Send Message to TradeShark Desk</h4>
              </div>
              <button
                onClick={() => setIsComposing(false)}
                className="text-white/60 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSendInquiry} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/70 block mb-1">Inquiry Topic</label>
                  <select
                    value={inquiryTopic}
                    onChange={(e) => setInquiryTopic(e.target.value as any)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#6dff8a]"
                  >
                    <option value="SUPPORT">General Trading Support</option>
                    <option value="KYC">KYC &amp; Verification Query</option>
                    <option value="FUNDING">Deposit / Withdrawal Wire Query</option>
                    <option value="ACCOUNT">Tier Upgrade Request</option>
                  </select>
                </div>

                <div>
                  <label className="text-white/70 block mb-1">Assigned Executive</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.accountManager || 'David Sterling (Executive Desk)'}
                    className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-white/70 block mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g., Query regarding corporate account verification"
                  value={inquirySubject}
                  onChange={(e) => setInquirySubject(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#6dff8a]"
                  required
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1">Message Content</label>
                <textarea
                  rows={5}
                  placeholder="Describe your inquiry in detail..."
                  value={inquiryBody}
                  onChange={(e) => setInquiryBody(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-3 text-white focus:outline-none focus:border-[#6dff8a] leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-white/40">
                  Priority desk turnaround: &lt; 2 hours during market hours
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsComposing(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#6dff8a] text-[#15170f] text-xs font-bold hover:bg-[#5ce077]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
