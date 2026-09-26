import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Upload, 
  FileText, 
  Camera, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Check, 
  Sparkles, 
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Lock
} from 'lucide-react';
import { useBrokerage } from '../../context/BrokerageContext';
import { UserAccount, KycSubmissionPayload } from '../../types';
import { errMsg } from '../../lib/api';
import { COUNTRIES } from '../../data/countries';

interface UserKycTabProps {
  currentUser: UserAccount;
  onNotify: (msg: string) => void;
}

type DocKind = 'front' | 'back' | 'proof' | 'selfie';

export const UserKycTab: React.FC<UserKycTabProps> = ({ currentUser, onNotify }) => {
  const { submitKycApplication, uploadKycFile } = useBrokerage();

  // Wizard Step: 1 = Personal Details, 2 = ID Doc, 3 = Proof of Address, 4 = Selfie
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State (pre-filled from the account where available)
  const [fullName, setFullName] = useState(currentUser.name || '');
  const [dateOfBirth, setDateOfBirth] = useState(currentUser.dateOfBirth || '');
  const [nationality, setNationality] = useState(currentUser.country || '');
  const [streetAddress, setStreetAddress] = useState(currentUser.streetAddress || '');
  const [city, setCity] = useState(currentUser.city || '');
  const [postalCode, setPostalCode] = useState(currentUser.postalCode || '');

  const [docType, setDocType] = useState<KycSubmissionPayload['docType']>(
    (currentUser.kycDocType as any) || 'Passport'
  );
  const [docNumber, setDocNumber] = useState(currentUser.kycDocNumber || '');
  const [docExpiryDate, setDocExpiryDate] = useState(currentUser.kycExpiryDate || '');
  const [docFrontName, setDocFrontName] = useState(currentUser.kycFileIds?.front ? (currentUser.kycDocFrontName || 'Uploaded') : '');
  const [docBackName, setDocBackName] = useState(currentUser.kycFileIds?.back ? (currentUser.kycDocBackName || 'Uploaded') : '');
  const [proofAddressName, setProofAddressName] = useState(currentUser.kycFileIds?.proof ? (currentUser.kycProofAddressName || 'Uploaded') : '');
  const [uploading, setUploading] = useState<DocKind | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Selfie capture state
  const [isScanning, setIsScanning] = useState(false);
  const [selfieTaken, setSelfieTaken] = useState(!!currentUser.kycFileIds?.selfie);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(currentUser.kycFileIds?.selfie ? `/api/me/files/${currentUser.kycFileIds.selfie}` : null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  const doUpload = async (kind: DocKind, file: File | Blob, filename?: string) => {
    setUploading(kind);
    try {
      const r = await uploadKycFile(kind, file, filename);
      if (kind === 'front') setDocFrontName(r.filename);
      if (kind === 'back') setDocBackName(r.filename);
      if (kind === 'proof') setProofAddressName(r.filename);
      if (kind === 'selfie') { setSelfieTaken(true); setSelfiePreview(URL.createObjectURL(file)); }
      onNotify(`${kind === 'selfie' ? 'Selfie' : 'Document'} uploaded successfully`);
    } catch (err) {
      onNotify(errMsg(err));
    } finally {
      setUploading(null);
    }
  };

  const onPick = (kind: DocKind) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) doUpload(kind, f);
    e.target.value = '';
  };

  const handleStartBiometricScan = async () => {
    if (!navigator.mediaDevices?.getUserMedia) { selfieInputRef.current?.click(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      streamRef.current = stream;
      setIsScanning(true);
      setTimeout(() => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => undefined); } }, 50);
    } catch {
      onNotify('Camera not available - please upload a selfie photo instead.');
      selfieInputRef.current?.click();
    }
  };

  const captureSelfie = () => {
    const v = videoRef.current;
    if (!v) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth || 640;
    canvas.height = v.videoHeight || 480;
    canvas.getContext('2d')!.drawImage(v, 0, 0, canvas.width, canvas.height);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setIsScanning(false);
    canvas.toBlob(blob => { if (blob) doUpload('selfie', blob, 'selfie.jpg'); }, 'image/jpeg', 0.9);
  };

  const handleSubmitKyc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docFrontName) { onNotify('Please upload the front of your identity document'); setStep(2); return; }
    if (!proofAddressName) { onNotify('Please upload your proof of address'); setStep(3); return; }
    if (!selfieTaken) { onNotify('Please take or upload a selfie in Step 4'); setStep(4); return; }
    setSubmitting(true);
    try {
      await submitKycApplication({
        userId: currentUser.id,
        fullName, dateOfBirth, nationality, streetAddress, city, postalCode,
        docType, docNumber, docExpiryDate, docFrontName, docBackName, proofAddressName,
        selfieTaken: true,
      });
      onNotify('Verification package submitted! You will be notified by email once reviewed.');
      setStep(1);
    } catch (err) {
      onNotify(errMsg(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Current Verification Status */}
      <div className={`p-5 rounded-3xl border ${
        currentUser.kycStatus === 'Approved'
          ? 'bg-[#182614] border-[#6dff8a]/40 text-white'
          : currentUser.kycStatus === 'Action Required'
          ? 'bg-red-950/40 border-red-500/40 text-white'
          : currentUser.kycStatus === 'Pending' || currentUser.kycStatus === 'Under Review'
          ? 'bg-yellow-950/30 border-yellow-400/40 text-white'
          : 'bg-white/[0.02] border-white/10 text-white'
      } flex flex-wrap items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            currentUser.kycStatus === 'Approved'
              ? 'bg-[#6dff8a]/20 text-[#6dff8a]'
              : currentUser.kycStatus === 'Action Required'
              ? 'bg-red-500/20 text-red-400'
              : 'bg-yellow-400/20 text-yellow-400'
          }`}>
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold">
                {currentUser.kycStatus === 'Approved' 
                  ? `Identity Verified - ${currentUser.tier}` 
                  : currentUser.kycStatus === 'Action Required'
                  ? 'Compliance Action Required: Document Resubmission'
                  : currentUser.kycStatus === 'Pending' || currentUser.kycStatus === 'Under Review'
                  ? 'KYC Verification In Progress'
                  : 'Identity Verification Incomplete'}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                currentUser.kycStatus === 'Approved' 
                  ? 'bg-[#6dff8a] text-[#15170f]' 
                  : currentUser.kycStatus === 'Action Required'
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-yellow-400 text-black'
              }`}>
                {currentUser.kycStatus}
              </span>
            </div>

            <p className="text-xs text-white/70 mt-1">
              {currentUser.kycStatus === 'Approved'
                ? `Identity verified${currentUser.kycSubmittedDate ? ` (submitted ${currentUser.kycSubmittedDate})` : ''}. Max leverage: 1:${currentUser.leverage}.`
                : currentUser.kycStatus === 'Action Required'
                ? `Compliance Note: ${currentUser.kycNotes || 'Please upload an updated proof of residence dated within 90 days.'}`
                : currentUser.kycStatus === 'Pending' || currentUser.kycStatus === 'Under Review'
                ? 'Your submitted identity artifacts are queued in our compliance desk. Review is typically completed within one business day.'
                : 'Complete identity verification to unlock live market trading and high-volume deposits.'}
            </p>
          </div>
        </div>

        {currentUser.kycStatus === 'Approved' && (
          <div className="text-right">
            <span className="text-[10px] font-mono text-[#6dff8a] block">CLIENT ID</span>
            <span className="font-mono font-bold text-xs text-white">{currentUser.id}</span>
          </div>
        )}
      </div>

      {/* KYC WIZARD CARD */}
      <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
            {[
              { num: 1, label: 'Personal Details' },
              { num: 2, label: 'Identity Document' },
              { num: 3, label: 'Proof of Address' },
              { num: 4, label: 'Biometric Face Scan' }
            ].map((s) => {
              const isActive = step === s.num;
              const isPast = step > s.num || (currentUser.kycStatus === 'Approved' && s.num <= 4);
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setStep(s.num as any)}
                  className={`flex items-center gap-2 py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-[#6dff8a] text-[#15170f]'
                      : isPast
                      ? 'bg-[#6dff8a]/20 text-[#6dff8a]'
                      : 'bg-white/5 text-white/50 hover:text-white'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive ? 'bg-[#15170f] text-[#6dff8a]' : isPast ? 'bg-[#6dff8a] text-[#15170f]' : 'bg-white/20 text-white'
                  }`}>
                    {isPast ? '✓' : s.num}
                  </span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          <span className="text-xs text-white/40 hidden md:inline">
            Step {step} of 4
          </span>
        </div>

        {/* STEP 1: PERSONAL DETAILS */}
        {step === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h4 className="text-sm font-bold text-white">Step 1: Legal Profile &amp; Residential Address</h4>
              <p className="text-xs text-white/50">Details must match the official documents you submit.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-white/70 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#6dff8a]"
                  required
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#6dff8a]"
                  required
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1">Nationality / Country of Tax Residence</label>
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#6dff8a]"
                  required
                >
                  <option value="">Select country...</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-white/70 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#6dff8a]"
                  required
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1">City &amp; Postal Code</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#6dff8a]"
                    required
                  />
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Postcode"
                    className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#6dff8a]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => {
                  if (!fullName.trim() || !dateOfBirth || !nationality || !streetAddress.trim() || !city.trim()) { onNotify('Please complete all required profile fields'); return; }
                  setStep(2);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6dff8a] text-[#15170f] font-bold text-xs hover:bg-[#5ce077]"
              >
                <span>Continue to Document Upload</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: IDENTITY DOCUMENT */}
        {step === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h4 className="text-sm font-bold text-white">Step 2: Government-Issued Identity Document</h4>
              <p className="text-xs text-white/50">Upload a valid, unexpired government identification document.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-white/70 block mb-1">Document Category</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#6dff8a]"
                >
                  <option value="Passport">International Passport</option>
                  <option value="National ID">National Identity Card</option>
                  <option value="Drivers License">Driver's License</option>
                </select>
              </div>

              <div>
                <label className="text-white/70 block mb-1">Document Number</label>
                <input
                  type="text"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#6dff8a] font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-white/70 block mb-1">Expiration Date</label>
                <input
                  type="date"
                  value={docExpiryDate}
                  onChange={(e) => setDocExpiryDate(e.target.value)}
                  className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#6dff8a]"
                  required
                />
              </div>
            </div>

            {/* Document Upload Dropzones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Front Page */}
              <label className="p-4 rounded-2xl bg-black/40 border-2 border-dashed border-white/20 hover:border-[#6dff8a]/50 text-center space-y-2 transition-colors cursor-pointer flex flex-col items-center justify-center">
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={onPick('front')} />
                <Upload className="w-6 h-6 text-[#6dff8a] mx-auto" />
                <div className="text-xs font-bold text-white">Upload Front Photo / Scanned Page</div>
                <p className="text-[11px] text-white/50">PNG, JPG, or PDF up to 10MB</p>
                {uploading === 'front' ? (
                  <span className="text-[11px] text-yellow-300 font-mono">Uploading...</span>
                ) : docFrontName ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-white text-[11px] font-mono max-w-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6dff8a] shrink-0" />
                    <span className="truncate">{docFrontName}</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#6dff8a] font-semibold">Click to choose file</span>
                )}
              </label>

              {/* Back Page */}
              <label className="p-4 rounded-2xl bg-black/40 border-2 border-dashed border-white/20 hover:border-[#6dff8a]/50 text-center space-y-2 transition-colors cursor-pointer flex flex-col items-center justify-center">
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={onPick('back')} />
                <Upload className="w-6 h-6 text-[#6dff8a] mx-auto" />
                <div className="text-xs font-bold text-white">Upload Back Page / MRZ Strip</div>
                <p className="text-[11px] text-white/50">Required for ID cards and driving licences</p>
                {uploading === 'back' ? (
                  <span className="text-[11px] text-yellow-300 font-mono">Uploading...</span>
                ) : docBackName ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-white text-[11px] font-mono max-w-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6dff8a] shrink-0" />
                    <span className="truncate">{docBackName}</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#6dff8a] font-semibold">Click to choose file</span>
                )}
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6dff8a] text-[#15170f] font-bold text-xs hover:bg-[#5ce077]"
              >
                <span>Continue to Proof of Address</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PROOF OF RESIDENCE */}
        {step === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h4 className="text-sm font-bold text-white">Step 3: Proof of Residential Address</h4>
              <p className="text-xs text-white/50">Must be dated within the last 90 days with your full name and address clearly visible.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2">
                <span className="font-bold text-white block">Accepted Documents:</span>
                <ul className="space-y-1 text-white/70 list-disc list-inside text-[11px]">
                  <li>Bank Account or Credit Card Statement</li>
                  <li>Utility Bill (Water, Gas, Electricity, Fiber)</li>
                  <li>Council Tax Bill / Municipal Assessment</li>
                  <li>Government Agency Correspondence</li>
                </ul>
              </div>

<label className="p-4 rounded-2xl bg-black/40 border-2 border-dashed border-white/20 hover:border-[#6dff8a]/50 text-center space-y-2 transition-colors cursor-pointer flex flex-col items-center justify-center">
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={onPick('proof')} />
                <Upload className="w-6 h-6 text-[#6dff8a] mx-auto" />
                <div className="text-xs font-bold text-white">Upload Proof of Address Document</div>
                <p className="text-[11px] text-white/50">Dated within the last 90 days</p>
                {uploading === 'proof' ? (
                  <span className="text-[11px] text-yellow-300 font-mono">Uploading...</span>
                ) : proofAddressName ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-white text-[11px] font-mono max-w-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6dff8a] shrink-0" />
                    <span className="truncate">{proofAddressName}</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#6dff8a] font-semibold">Click to choose file</span>
                )}
              </label>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6dff8a] text-[#15170f] font-bold text-xs hover:bg-[#5ce077]"
              >
                <span>Continue to Biometric Liveness Scan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: BIOMETRIC LIVENESS VERIFICATION */}
        {step === 4 && (
          <div className="space-y-4 animate-fadeIn">
            <div>
              <h4 className="text-sm font-bold text-white">Step 4: Selfie Verification</h4>
              <p className="text-xs text-white/50">Take a clear photo of your face so we can match it to your ID document.</p>
            </div>

            <div className="max-w-md mx-auto p-6 rounded-3xl bg-black/50 border border-white/15 text-center space-y-4">
              <input ref={selfieInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={onPick('selfie')} />
              <div className="relative aspect-[4/3] rounded-2xl bg-[#0e110a] border-2 border-[#6dff8a]/40 flex flex-col items-center justify-center overflow-hidden">
                {isScanning ? (
                  <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover -scale-x-100" />
                ) : selfiePreview ? (
                  <img src={selfiePreview} alt="Selfie" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="w-28 h-36 rounded-[50%] border-2 border-dashed border-[#6dff8a]/70 flex items-center justify-center">
                    <User className="w-8 h-8 text-[#6dff8a]" />
                  </div>
                )}
                {isScanning && <div className="absolute w-36 h-44 rounded-[50%] border-2 border-[#6dff8a] pointer-events-none" />}
                <div className="absolute bottom-2 text-[11px] font-mono bg-black/60 px-2 py-0.5 rounded text-white/80">
                  {uploading === 'selfie' ? 'Uploading...' : selfieTaken ? 'Selfie uploaded' : isScanning ? 'Position your face inside the oval' : 'Camera off'}
                </div>
              </div>

              {isScanning ? (
                <button type="button" onClick={captureSelfie} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#6dff8a] text-[#15170f] font-bold text-xs hover:bg-[#5ce077]">
                  <Camera className="w-4 h-4" /><span>Capture Selfie</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" disabled={uploading === 'selfie'} onClick={handleStartBiometricScan} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#6dff8a] text-[#15170f] font-bold text-xs hover:bg-[#5ce077] disabled:opacity-50">
                    <Camera className="w-4 h-4" /><span>{selfieTaken ? 'Retake with camera' : 'Use camera'}</span>
                  </button>
                  <button type="button" disabled={uploading === 'selfie'} onClick={() => selfieInputRef.current?.click()} className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/10 text-white font-bold text-xs hover:bg-white/15 disabled:opacity-50">
                    <Upload className="w-4 h-4" /><span>Upload photo</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/15"
              >
                Back
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmitKyc}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#6dff8a] text-[#15170f] font-bold text-xs hover:bg-[#5ce077] shadow-[0_0_25px_rgba(109,255,138,0.3)] transition-all transform hover:scale-105 active:scale-95"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{submitting ? 'Submitting...' : 'Submit Verification Package'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
