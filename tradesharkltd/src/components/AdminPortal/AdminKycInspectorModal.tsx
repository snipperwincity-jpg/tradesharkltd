import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  User, 
  Calendar, 
  MapPin, 
  Camera, 
  Check, 
  ExternalLink,
  Lock,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { UserAccount, UserTier } from '../../types';

interface AdminKycInspectorModalProps {
  user: UserAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (userId: string, promotedTier?: UserTier) => void;
  onRequestResubmit: (userId: string, note: string) => void;
  onReject: (userId: string, reason: string) => void;
}

export const AdminKycInspectorModal: React.FC<AdminKycInspectorModalProps> = (props) =>
  props.isOpen && props.user ? <AdminKycInspectorInner {...props} user={props.user} /> : null;

const AdminKycInspectorInner: React.FC<AdminKycInspectorModalProps & { user: UserAccount }> = ({
  user,
  isOpen,
  onClose,
  onApprove,
  onRequestResubmit,
  onReject
}) => {
  const [resubmitNote, setResubmitNote] = useState('Proof of address is slightly unreadable or older than 90 days. Please provide an updated official bank statement.');
  const [rejectReason, setRejectReason] = useState('Identity document mismatch with registered legal name.');
  const [activeAction, setActiveAction] = useState<'view' | 'resubmit' | 'reject'>('view');
  const [selectedTier, setSelectedTier] = useState<UserTier>('Tier 2 - Verified Pro');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-[#14160d] border border-[#6dff8a]/40 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6dff8a]/20 border border-[#6dff8a]/40 flex items-center justify-center text-[#6dff8a] font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{user.name}</h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  user.kycStatus === 'Approved' ? 'bg-[#6dff8a]/20 text-[#6dff8a]' : 'bg-yellow-400/20 text-yellow-400'
                }`}>
                  {user.kycStatus}
                </span>
              </div>
              <p className="text-xs text-white/50">{user.id} • {user.email} • {user.country}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-5 space-y-6 no-scrollbar">
          
          {/* Identity & AML Scoreboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] text-white/40 uppercase font-mono">Facial Match</span>
              <div className="text-base font-bold text-[#6dff8a] flex items-center gap-1">
                <span>{user.facialMatchScore || 98.8}%</span>
                <CheckCircle2 className="w-4 h-4 text-[#6dff8a]" />
              </div>
              <span className="text-[10px] text-white/50">Biometric Liveness OK</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] text-white/40 uppercase font-mono">AML Risk Rating</span>
              <div className="text-base font-bold text-white">{user.amlRisk || 'Low'}</div>
              <span className="text-[10px] text-white/50">FATF &amp; OFAC Screened</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] text-white/40 uppercase font-mono">PEP / Sanctions</span>
              <div className="text-base font-bold text-[#6dff8a]">Clear (0 Hits)</div>
              <span className="text-[10px] text-white/50">WorldCheck Certified</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 space-y-1">
              <span className="text-[10px] text-white/40 uppercase font-mono">Document Type</span>
              <div className="text-base font-bold text-white">{user.kycDocType || 'Passport'}</div>
              <span className="text-[10px] text-white/50 font-mono">{user.kycDocNumber || 'GB-8392104'}</span>
            </div>
          </div>

          {/* Document Verification Visual Preview Cards */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-white/60 mb-3">
              Submitted Regulatory Identity Artifacts
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {([
                ['front', 'ID Document (Front)', user.kycDocFrontName],
                ['back', 'ID Document (Back)', user.kycDocBackName],
                ['proof', 'Proof of Address', user.kycProofAddressName],
                ['selfie', 'Selfie / Liveness', 'Selfie capture'],
              ] as const).map(([kind, label, name]) => (
                <KycDocCard key={kind} label={label} fileId={user.kycFileIds?.[kind]} filename={name} />
              ))}
            </div>
            <p className="mt-3 text-[11px] text-white/40">
              Declared: {user.kycDocType} #{user.kycDocNumber || '-'} • DOB {user.dateOfBirth || '-'} • {[user.streetAddress, user.city, user.postalCode, user.country].filter(Boolean).join(', ') || 'No address on file'}
            </p>
          </div>

          {/* Action Modals / Panes */}
          {activeAction === 'resubmit' && (
            <div className="p-4 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 space-y-3">
              <h4 className="text-xs font-bold text-yellow-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Specify Document Resubmission Requirement:</span>
              </h4>
              <textarea
                rows={3}
                value={resubmitNote}
                onChange={(e) => setResubmitNote(e.target.value)}
                className="w-full bg-black/50 border border-yellow-400/30 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActiveAction('view')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onRequestResubmit(user.id, resubmitNote);
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-yellow-400 text-black text-xs font-bold hover:bg-yellow-300"
                >
                  Send Resubmission Notice &amp; Email
                </button>
              </div>
            </div>
          )}

          {activeAction === 'reject' && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3">
              <h4 className="text-xs font-bold text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>Specify Rejection Reason:</span>
              </h4>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-black/50 border border-red-500/30 rounded-xl p-3 text-xs text-white placeholder-white/40 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActiveAction('view')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onReject(user.id, rejectReason);
                    onClose();
                  }}
                  className="px-4 py-1.5 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-400"
                >
                  Confirm Rejection &amp; Email Notice
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">Promote to Tier on Approval:</span>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as any)}
              className="bg-black/50 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="Tier 2 - Verified Pro">Tier 2 - Verified Pro (1:100)</option>
              <option value="Tier 3 - Institutional VIP">Tier 3 - Institutional VIP (1:500)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            {activeAction === 'view' && (
              <>
                <button
                  onClick={() => setActiveAction('resubmit')}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
                >
                  Request Resubmission
                </button>

                <button
                  onClick={() => setActiveAction('reject')}
                  className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-xs font-semibold transition-colors"
                >
                  Decline KYC
                </button>

                <button
                  onClick={() => {
                    onApprove(user.id, selectedTier);
                    onClose();
                  }}
                  className="px-5 py-2 rounded-xl bg-[#6dff8a] hover:bg-[#5ce077] text-[#15170f] text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve &amp; Certify KYC</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


const KycDocCard: React.FC<{ label: string; fileId?: string; filename?: string }> = ({ label, fileId, filename }) => {
  const url = fileId ? `/api/admin/files/${fileId}` : '';
  const isPdf = (filename || '').toLowerCase().endsWith('.pdf');
  return (
    <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2 flex flex-col">
      <div className="text-xs font-bold text-white">{label}</div>
      {fileId ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="block aspect-[4/3] rounded-xl bg-black/50 border border-white/10 overflow-hidden group">
          {isPdf ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-white/60 text-xs gap-1"><FileText className="w-8 h-8 text-[#6dff8a]" />PDF document</div>
          ) : (
            <img src={url} alt={label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
          )}
        </a>
      ) : (
        <div className="aspect-[4/3] rounded-xl bg-black/30 border border-dashed border-white/15 flex items-center justify-center text-[11px] text-white/40">Not uploaded</div>
      )}
      <div className="text-[10px] text-white/50 truncate flex items-center justify-between gap-2">
        <span className="truncate">{fileId ? filename || 'uploaded file' : '-'}</span>
        {fileId && <a href={url} target="_blank" rel="noopener noreferrer" className="text-[#6dff8a] flex items-center gap-1 shrink-0"><ExternalLink className="w-3 h-3" />Open</a>}
      </div>
    </div>
  );
};
