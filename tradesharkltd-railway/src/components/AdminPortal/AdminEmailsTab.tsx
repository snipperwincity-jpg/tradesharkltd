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
  Filter, 
  Sparkles, 
  Reply, 
  Trash2, 
  Search,
  Check,
  Shield,
  DollarSign,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { useBrokerage } from '../../context/BrokerageContext';
import { EmailMessage, UserAccount } from '../../types';

interface AdminEmailsTabProps {
  onNotify: (msg: string) => void;
}

const EMAIL_TEMPLATES = [
  {
    id: 'kyc-approved',
    name: 'KYC Certified - Promotion to Tier 2 Pro',
    category: 'KYC' as const,
    priority: 'High' as const,
    subject: 'Regulatory Identity Certified: Welcome to Tier 2 - Verified Pro',
    body: `Dear {USER_NAME},\n\nWe are pleased to notify you that your government-issued identity documents and proof of residential address have been fully certified by {BRAND} Compliance.\n\nYour account has been elevated to Tier 2 - Verified Pro. Institutional leverage of 1:100 is now active with unrestricted execution on all stock CFDs, forex majors, ETFs, and digital asset markets.\n\nBest regards,\n{BRAND} Compliance Operations`
  },
  {
    id: 'kyc-resubmit',
    name: 'KYC Resubmission - Action Required',
    category: 'KYC' as const,
    priority: 'Urgent' as const,
    subject: 'Action Required: Verification Document Resubmission Needed',
    body: `Dear {USER_NAME},\n\nOur compliance officer reviewed your verification file. We require an updated document before your application can be approved:\n\nNote: Please provide a clear, full-color copy of your recent bank statement or utility bill dated within the last 90 days. The residential address must match your registered account profile.\n\nPlease visit the KYC Verification Center in your Client Portal to upload the revised file.\n\nThank you,\n{BRAND} Compliance Desk`
  },
  {
    id: 'deposit-cleared',
    name: 'Deposit Clearance & Margin Available',
    category: 'FUNDING' as const,
    priority: 'Normal' as const,
    subject: 'Deposit Clearance Notice: Funds Credited to Your Account',
    body: `Dear {USER_NAME},\n\nWe confirm that your incoming deposit of {AMOUNT} USD has cleared custodian settlement and has been credited directly to your live trading account.\n\nAll client balances are kept separate from company operating funds.\n\nHappy trading,\n{BRAND} Treasury Operations`
  },
  {
    id: 'withdrawal-dispatched',
    name: 'Withdrawal Dispatched & Wire Reference',
    category: 'FUNDING' as const,
    priority: 'Normal' as const,
    subject: 'Disbursement Notice: Withdrawal Dispatched to Destination Rail',
    body: `Dear {USER_NAME},\n\nYour requested withdrawal of {AMOUNT} USD has been processed and released by our treasury cashier.\n\nDisbursement Rail: Bank Wire / SWIFT Clearing\nEstimated Settlement: 1-2 business days depending on receiving financial institution.\n\nSincerely,\n{BRAND} Cashier Desk`
  },
  {
    id: 'margin-warning',
    name: 'Margin Call Advisory & Risk Notice',
    category: 'TRADING' as const,
    priority: 'Urgent' as const,
    subject: 'Risk Advisory: Account Margin Utilization Warning',
    body: `Dear {USER_NAME},\n\nThis is an automated advisory from the {BRAND} Risk Management Desk. Your current account equity is approaching our maintenance margin threshold (80% utilization).\n\nTo prevent automatic liquidation of your active open positions, please consider reducing position sizes or depositing additional margin.\n\n{BRAND} Risk Management Desk`
  },
  {
    id: 'market-notice',
    name: 'Platform Liquidity & Market Hours',
    category: 'MARKET_ALERT' as const,
    priority: 'High' as const,
    subject: 'Market Advisory: Holiday Trading Hours & Spread Widening',
    body: `Institutional Notice to All Clients:\n\nPlease be advised that due to upcoming international bank holidays, trading hours for US Equities and UK Index futures will close early this Friday at 17:00 GMT.\n\nSpread widening and reduced market liquidity may be observed across FX and Commodity pairs during rollover hours. Stop-loss orders and hedging positions should be monitored accordingly.\n\nChief Market Strategist\n{BRAND} Analytics`
  }
];

export const AdminEmailsTab: React.FC<AdminEmailsTabProps> = ({ onNotify }) => {
  const { users, emails, sendEmail, deleteEmail, config } = useBrokerage();

  const [subTab, setSubTab] = useState<'compose' | 'outbox' | 'inbound'>('compose');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('ALL');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<EmailMessage['category']>('KYC');
  const [priority, setPriority] = useState<EmailMessage['priority']>('Normal');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  // Selected email for inspection/reply
  const [viewingEmail, setViewingEmail] = useState<EmailMessage | null>(null);
  const [replyText, setReplyText] = useState('');

  // Search/Filter for Outbox
  const [searchQuery, setSearchQuery] = useState('');

  // Handle template selection
  const handleSelectTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    if (!tmplId) return;

    const tmpl = EMAIL_TEMPLATES.find(t => t.id === tmplId);
    if (!tmpl) return;

    const targetUser = users.find(u => u.id === selectedRecipient);
    const userName = targetUser ? targetUser.name : 'Valued Client';

    setSubject(tmpl.subject.replace(/\{BRAND\}/g, config.appName));
    setCategory(tmpl.category);
    setPriority(tmpl.priority);
    setBody(tmpl.body.replace('{USER_NAME}', userName).replace('{AMOUNT}', '$10,000.00').replace(/\{BRAND\}/g, config.appName));
  };

  // Handle send email
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      onNotify('Please enter a subject and message body');
      return;
    }

    const isBroadcast = selectedRecipient === 'ALL';
    const targetUser = users.find(u => u.id === selectedRecipient);

    try {
    await sendEmail({
      from: '',
      to: isBroadcast ? 'All Clients' : (targetUser?.email || ''),
      userId: selectedRecipient,
      userName: isBroadcast ? 'All Clients' : targetUser?.name,
      subject,
      body,
      category,
      priority,
      direction: 'outbound'
    });
    } catch (err: any) {
      onNotify(err?.message || 'Email could not be sent');
      return;
    }

    onNotify(`Email "${subject}" sent to ${isBroadcast ? 'all clients' : targetUser?.name} (portal inbox + email)`);
    setSubject('');
    setBody('');
    setSelectedTemplateId('');
    setSubTab('outbox');
  };

  // Handle reply to inbound email
  const handleSendReply = async (inbound: EmailMessage) => {
    if (!replyText.trim()) return;

    try {
    await sendEmail({
      replyToId: inbound.id,
      from: '',
      to: inbound.replyEmail || inbound.from,
      userId: inbound.userId,
      userName: inbound.userName,
      subject: `Re: ${inbound.subject}`,
      body: `${replyText}\n\n--- Previous Message from ${inbound.userName} (${inbound.date}) ---\n${inbound.body}`,
      category: inbound.category,
      priority: 'Normal',
      direction: 'outbound'
    });
    } catch (err: any) {
      onNotify(err?.message || 'Reply could not be sent');
      return;
    }

    onNotify(`Reply emailed to ${inbound.userName || inbound.to}`);
    setReplyText('');
    setViewingEmail(null);
  };

  const outboundEmails = emails.filter(e => e.direction === 'outbound');
  const inboundEmails = emails.filter(e => e.direction === 'inbound');

  const filteredOutbound = outboundEmails.filter(e => 
    e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.to.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (e.userName && e.userName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#6dff8a]" />
            <span>Official Emailing System &amp; Regulatory Dispatches</span>
          </h3>
          <p className="text-xs text-[#a3a89e]">
            Compose KYC updates, funding notices, and automated advisory dispatches to client inboxes.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => setSubTab('compose')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              subTab === 'compose' ? 'bg-[#6dff8a] text-[#15170f]' : 'text-white/70 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose Dispatch</span>
          </button>

          <button
            onClick={() => setSubTab('outbox')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              subTab === 'outbox' ? 'bg-[#6dff8a] text-[#15170f]' : 'text-white/70 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Outbox &amp; Sent ({outboundEmails.length})</span>
          </button>

          <button
            onClick={() => setSubTab('inbound')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
              subTab === 'inbound' ? 'bg-[#6dff8a] text-[#15170f]' : 'text-white/70 hover:text-white'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>Client Inquiries ({inboundEmails.length})</span>
            {inboundEmails.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* SUBTAB 1: COMPOSE DISPATCH */}
      {subTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compose Form */}
          <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6dff8a]" />
              <span>Draft Client Communication</span>
            </h4>

            {/* Template Presets Bar */}
            <div>
              <label className="text-xs font-semibold text-white/70 block mb-1.5">
                Load Institutional Template Preset
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleSelectTemplate(e.target.value)}
                className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6dff8a]"
              >
                <option value="">-- Choose an Institutional Template or start blank --</option>
                {EMAIL_TEMPLATES.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    [{tmpl.category}] {tmpl.name}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              {/* Recipient Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-white/70 block mb-1">
                    Recipient Target
                  </label>
                  <select
                    value={selectedRecipient}
                    onChange={(e) => setSelectedRecipient(e.target.value)}
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6dff8a]"
                  >
                    <option value="ALL">All Registered Traders (Broadcast Notice)</option>
                    <optgroup label="Individual Trader Accounts">
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.email} • {u.id})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#6dff8a]"
                    >
                      <option value="KYC">KYC</option>
                      <option value="FUNDING">Funding</option>
                      <option value="ACCOUNT">Account</option>
                      <option value="TRADING">Trading</option>
                      <option value="MARKET_ALERT">Market Alert</option>
                      <option value="SUPPORT">Support</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-white/70 block mb-1">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full bg-black/50 border border-white/15 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-[#6dff8a]"
                    >
                      <option value="Normal">Normal</option>
                      <option value="High">High Priority</option>
                      <option value="Urgent">Urgent / Regulatory</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  placeholder="e.g., Regulatory Identity Certified: Welcome to Tier 2"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#6dff8a]"
                  required
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-xs font-semibold text-white/70 block mb-1">
                  Dispatch Body
                </label>
                <textarea
                  rows={8}
                  placeholder="Enter message content..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#6dff8a] font-mono leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-white/50">
                  Delivered to the client portal inbox and by email
                </span>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-xs shadow-md transition-all transform active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch Email Notice</span>
                </button>
              </div>
            </form>
          </div>

          {/* Real-time Email Preview Card */}
          <div className="bg-[#14160d] border border-white/10 rounded-2xl p-5 space-y-3 flex flex-col">
            <span className="text-xs font-mono uppercase tracking-wider text-white/40 block">
              Recipient Inbox Preview
            </span>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3 flex-1 flex flex-col text-xs">
              <div className="border-b border-white/10 pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/50">From:</span>
                  <span className="text-[10px] font-mono text-[#6dff8a]">{config.appName} Client Desk</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/50">To:</span>
                  <span className="text-[10px] font-mono text-white">
                    {selectedRecipient === 'ALL' ? 'All Clients' : users.find(u => u.id === selectedRecipient)?.email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/50">Priority:</span>
                  <span className={`text-[10px] font-bold ${priority === 'Urgent' ? 'text-red-400' : 'text-[#6dff8a]'}`}>
                    {priority}
                  </span>
                </div>
              </div>

              <div className="font-bold text-white text-sm">
                {subject || '(No Subject)'}
              </div>

              <div className="flex-1 whitespace-pre-wrap text-white/70 text-xs font-sans leading-relaxed">
                {body || 'Type your message or select an institutional template on the left to preview formatted output...'}
              </div>

              <div className="pt-3 border-t border-white/10 text-[10px] text-white/40 space-y-0.5">
                <div>{config.legalName}{config.companyNumber ? ` • Company No. ${config.companyNumber}` : ''}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: OUTBOX & SENT HISTORY */}
      {subTab === 'outbox' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search sent emails by recipient or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#6dff8a]"
              />
            </div>

            <span className="text-xs text-white/60">
              Total Outbound Records: <strong>{filteredOutbound.length}</strong>
            </span>
          </div>

          <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181b11] text-white/50 uppercase border-b border-white/10 font-mono text-[10px]">
                <tr>
                  <th className="p-3.5">Recipient &amp; Target</th>
                  <th className="p-3.5">Category &amp; Priority</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Date &amp; Time</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredOutbound.map((email) => (
                  <tr key={email.id} className="hover:bg-white/[0.02]">
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{email.userName || email.to}</div>
                      <div className="text-white/40 text-[10px] font-mono">{email.to}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#6dff8a]/20 text-[#6dff8a]">
                          {email.category}
                        </span>
                        <span className={`text-[10px] font-semibold ${email.priority === 'Urgent' ? 'text-red-400' : 'text-white/60'}`}>
                          {email.priority}
                        </span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-medium text-white max-w-md truncate">{email.subject}</div>
                      <div className="text-white/40 text-[10px] truncate max-w-sm">{email.body.slice(0, 70)}...</div>
                    </td>

                    <td className="p-3.5 font-mono text-white/50 text-[11px]">
                      {email.date}
                      {email.delivery && (
                        <div className={`text-[9px] ${email.delivery.startsWith('failed') ? 'text-red-400' : 'text-[#6dff8a]/70'}`} title={email.delivery}>
                          {email.delivery.length > 28 ? email.delivery.slice(0, 28) + '…' : email.delivery}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setViewingEmail(email)}
                        className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => {
                          deleteEmail(email.id);
                          onNotify('Email log record deleted');
                        }}
                        className="p-1 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CLIENT INBOUND INQUIRIES */}
      {subTab === 'inbound' && (
        <div className="space-y-4">
          <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/20">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#181b11] text-white/50 uppercase border-b border-white/10 font-mono text-[10px]">
                <tr>
                  <th className="p-3.5">Client &amp; ID</th>
                  <th className="p-3.5">Inquiry Topic</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Received Date</th>
                  <th className="p-3.5 text-right">Desk Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {inboundEmails.map((email) => (
                  <tr key={email.id} className="hover:bg-white/[0.02]">
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{email.userName || email.from}</div>
                      <div className="text-white/40 text-[10px] font-mono">{email.userId || email.from}</div>
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-400/20 text-cyan-400">
                        {email.category}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="font-medium text-white">{email.subject}</div>
                      <div className="text-white/40 text-[10px] truncate max-w-sm">{email.body}</div>
                    </td>

                    <td className="p-3.5 font-mono text-white/50 text-[11px]">
                      {email.date}
                    </td>

                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => setViewingEmail(email)}
                        className="px-3 py-1 rounded-lg bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] font-bold text-xs transition-colors flex items-center gap-1.5 ml-auto"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>Reply to Trader</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INSPECT & REPLY MODAL */}
      {viewingEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#15180f] border border-[#6dff8a]/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#6dff8a]/20 text-[#6dff8a] font-bold text-[10px]">
                  {viewingEmail.category}
                </span>
                <h4 className="font-bold text-white text-sm">{viewingEmail.subject}</h4>
              </div>
              <button
                onClick={() => setViewingEmail(null)}
                className="text-white/60 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>

            <div className="text-xs space-y-1 text-white/60">
              <div><strong>From:</strong> {viewingEmail.from}</div>
              <div><strong>To:</strong> {viewingEmail.to}</div>
              <div><strong>Date:</strong> {viewingEmail.date}</div>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs text-white/80 whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
              {viewingEmail.body}
            </div>

            {/* Quick Reply Form */}
            {viewingEmail.direction === 'inbound' && (
              <div className="space-y-3 pt-2 border-t border-white/10">
                <label className="text-xs font-bold text-white block">
                  Compose Official Response to {viewingEmail.userName || viewingEmail.from}:
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Enter response message..."
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#6dff8a]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setViewingEmail(null)}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSendReply(viewingEmail)}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#6dff8a] text-[#15170f] text-xs font-bold hover:bg-[#5ce077]"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Official Reply</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
