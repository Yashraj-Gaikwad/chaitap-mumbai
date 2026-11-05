import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Voucher } from '../types';
import {
  signVoucherPayload,
  getOrCreateCustomerWallet,
  getWorldIDNullifier,
  inrToUSDC,
  truncateHash
} from '../utils/crypto';
import {
  isWebNFCSupported,
  scanRealNfcCard,
  simulateNfcTap
} from '../utils/nfc';
import { sound } from '../utils/sound';
import { WorldIDModal } from './WorldIDModal';
import {
  ShieldCheck,
  Smartphone,
  Radio,
  Copy,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  Check
} from 'lucide-react';

interface CustomerViewProps {
  balanceINR: number;
  onVoucherCreated: (voucher: Voucher) => void;
  isAirplaneMode: boolean;
}

const CHAI_MENU = [
  { amount: 10, label: 'Cutting Chai', icon: '☕', note: 'Tapri classic' },
  { amount: 20, label: 'Masala Chai', icon: '🫖', note: 'Ginger & spices' },
  { amount: 35, label: 'Bun Maska', icon: '🍞', note: 'Warm butter pav' },
  { amount: 50, label: 'Chai + Vada Pav', icon: '🥪', note: 'Mumbai special' },
];

export const CustomerView: React.FC<CustomerViewProps> = ({
  balanceINR,
  onVoucherCreated,
  isAirplaneMode,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(20);
  const [selectedItemLabel, setSelectedItemLabel] = useState<string>('Masala Chai');
  const [customAmountStr, setCustomAmountStr] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // NFC & Hardware 2FA state
  const [isScanningNfc, setIsScanningNfc] = useState<boolean>(false);
  const [detectedCardUID, setDetectedCardUID] = useState<string>('04:A2:8B:1F:72:60:80');
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [signingError, setSigningError] = useState<string | null>(null);

  // Active Signed Voucher State
  const [activeVoucher, setActiveVoucher] = useState<Voucher | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 mins in seconds
  const [showPayloadDetails, setShowPayloadDetails] = useState<boolean>(false);
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);

  // Identity state
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [worldNullifier, setWorldNullifier] = useState<string>(() => getWorldIDNullifier());
  const [isWorldIDModalOpen, setIsWorldIDModalOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      const wallet = getOrCreateCustomerWallet();
      wallet.getAddress().then(addr => setCustomerAddress(addr));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Timer countdown for active voucher
  useEffect(() => {
    if (!activeVoucher) return;

    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = activeVoucher.expiry - now;
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeVoucher]);

  const currentAmount = isCustomMode
    ? (parseFloat(customAmountStr) || 0)
    : selectedAmount;

  const currentUSDC = inrToUSDC(currentAmount);

  const handleSelectQuick = (amount: number, label: string) => {
    setIsCustomMode(false);
    setSelectedAmount(amount);
    setSelectedItemLabel(label);
    setCustomAmountStr('');
    setSigningError(null);
  };

  // Sign Voucher with NFC Hardware 2FA
  const handleSignVoucher = async (useRealNfc = false) => {
    if (currentAmount <= 0) {
      setSigningError('Please specify an amount greater than ₹0');
      return;
    }

    if (currentAmount > balanceINR) {
      setSigningError(`Amount exceeds offline vault spending limit (₹${balanceINR.toFixed(2)})`);
      return;
    }

    setSigningError(null);
    setIsSigning(true);

    try {
      let cardUID = detectedCardUID;

      if (useRealNfc && isWebNFCSupported()) {
        setIsScanningNfc(true);
        const scanResult = await scanRealNfcCard();
        cardUID = scanResult.cardUID;
        setDetectedCardUID(cardUID);
        setIsScanningNfc(false);
      } else {
        const simResult = await simulateNfcTap(detectedCardUID);
        cardUID = simResult.cardUID;
        setDetectedCardUID(cardUID);
      }

      sound.playNfcTapSound();

      // Sign EIP-712 structured data
      const voucher = await signVoucherPayload({
        amountINR: currentAmount,
        cardUID,
        itemLabel: isCustomMode ? `Custom Voucher ₹${currentAmount}` : selectedItemLabel,
        customExpirySeconds: 300,
      });

      setActiveVoucher(voucher);
      setTimeLeft(300);
      onVoucherCreated(voucher);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign voucher';
      setSigningError(msg);
      sound.playErrorBuzz();
    } finally {
      setIsSigning(false);
      setIsScanningNfc(false);
    }
  };

  const handleCopyPayload = () => {
    if (!activeVoucher) return;
    navigator.clipboard.writeText(JSON.stringify(activeVoucher, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / 300) * 100));

  return (
    <div className="space-y-6">
      {/* 1. Minimalist Wallet Balance Card */}
      <div className="relative overflow-hidden rounded-2xl bg-[#12172D] border border-white/[0.08] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Offline Escrow Vault</span>
              <span>•</span>
              <span className="font-mono">{customerAddress ? truncateHash(customerAddress, 6, 4) : 'Loading...'}</span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-4xl font-serif font-black tracking-tight text-white">
                ₹{balanceINR.toFixed(2)}
              </h2>
              <span className="text-xs font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
                ~{inrToUSDC(balanceINR)} USDC
              </span>
            </div>
          </div>

          {/* World ID Pill */}
          <div
            onClick={() => setIsWorldIDModalOpen(true)}
            className="flex items-center gap-2.5 bg-white/[0.04] hover:bg-white/[0.07] transition cursor-pointer px-3.5 py-2 rounded-xl border border-white/[0.08] self-start sm:self-auto"
            title="Click to manage World ID"
          >
            <div className="w-7 h-7 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-300">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span>World ID Verified</span>
                <span className="text-[10px] text-teal-400 font-mono">ZK</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {truncateHash(worldNullifier, 6, 4)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Voucher Ticket / Optical Air-Gapped Code */}
      {activeVoucher ? (
        <div className="rounded-2xl bg-[#12172D] border border-amber-500/30 p-6 shadow-lg text-center space-y-5">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              ChaiTap Offline Voucher
            </span>
            <h3 className="text-2xl font-serif font-bold text-white">
              ₹{activeVoucher.amountINR}.00
            </h3>
            <p className="text-xs text-slate-300">
              {activeVoucher.itemLabel || 'Cutting Chai'} (~{activeVoucher.amountUSDC} USDC)
            </p>
          </div>

          {/* Clean Optical QR Frame */}
          <div className="flex flex-col items-center">
            <div className="p-4 rounded-2xl bg-white shadow-md">
              <QRCodeSVG
                value={JSON.stringify(activeVoucher)}
                size={210}
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Countdown line */}
            <div className="mt-4 w-full max-w-xs space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>Valid for:</span>
                <span className={`font-bold ${timeLeft < 60 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-teal-400 transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 pt-1">
                Scan with Chaiwala terminal in 100% Airplane Mode
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2 max-w-sm mx-auto">
            <button
              onClick={() => setActiveVoucher(null)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-medium transition"
            >
              Done / New Chai
            </button>
            <button
              onClick={handleCopyPayload}
              className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-medium transition flex items-center justify-center gap-1.5"
            >
              {copiedPayload ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPayload ? 'Copied' : 'Copy Payload'}</span>
            </button>
          </div>

          {/* Collapsible Tech Details */}
          <div className="pt-2 border-t border-white/[0.06]">
            <button
              onClick={() => setShowPayloadDetails(!showPayloadDetails)}
              className="text-[11px] text-slate-400 hover:text-slate-200 inline-flex items-center gap-1"
            >
              <span>{showPayloadDetails ? 'Hide' : 'Inspect'} EIP-712 Signature & Card UID</span>
              {showPayloadDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {showPayloadDetails && (
              <div className="mt-2 text-left bg-black/40 p-3 rounded-xl border border-white/[0.06] text-[10px] font-mono text-slate-300 space-y-1">
                <div>Card UID: <span className="text-teal-300">{activeVoucher.cardUID}</span></div>
                <div>Signer: <span className="text-slate-200">{activeVoucher.customer}</span></div>
                <div>Sig: <span className="text-amber-300/80">{truncateHash(activeVoucher.sig, 12, 10)}</span></div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* 3. Ordering Flow */
        <div className="space-y-6">
          {/* Chai Menu Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Select Chai or Snack</span>
              <button
                onClick={() => setIsCustomMode(!isCustomMode)}
                className="text-amber-400 hover:underline text-xs"
              >
                {isCustomMode ? 'Show Menu' : 'Custom Amount'}
              </button>
            </div>

            {!isCustomMode ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CHAI_MENU.map(item => {
                  const isSelected = selectedAmount === item.amount && !isCustomMode;
                  return (
                    <button
                      key={item.amount}
                      onClick={() => handleSelectQuick(item.amount, item.label)}
                      className={`p-4 rounded-xl text-left transition-all border ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500/60 shadow-sm ring-1 ring-amber-500/30'
                          : 'bg-[#12172D] border-white/[0.08] hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <div className="text-white font-bold text-base">₹{item.amount}</div>
                      <div className="text-xs text-amber-200/90 font-medium truncate">{item.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{item.note}</div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#12172D] border border-white/[0.08] space-y-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                    <input
                      type="number"
                      min="1"
                      max={balanceINR}
                      value={customAmountStr}
                      onChange={e => setCustomAmountStr(e.target.value)}
                      placeholder="Amount in INR"
                      className="w-full pl-8 pr-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-white font-mono text-base focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="text-right font-mono text-xs text-teal-300">
                    ~{inrToUSDC(parseFloat(customAmountStr) || 0)} USDC
                  </div>
                </div>

                <div className="flex gap-2">
                  {[25, 60, 100, 150].map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCustomAmountStr(amt.toString())}
                      className="flex-1 py-1 px-2 rounded bg-white/[0.05] hover:bg-white/[0.1] text-xs font-mono text-slate-300"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Hardware NFC 2FA Signing Action */}
          <div className="p-5 rounded-2xl bg-[#12172D] border border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-slate-400" />
                <span className="text-slate-300">Born.Live NFC Card Auth</span>
              </div>
              <span className="font-mono text-slate-400 text-[11px]">{detectedCardUID}</span>
            </div>

            {signingError && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{signingError}</span>
              </div>
            )}

            <button
              onClick={() => handleSignVoucher(isWebNFCSupported())}
              disabled={isSigning || isScanningNfc}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-[0.99] text-slate-950 font-bold text-sm tracking-wide shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2.5"
            >
              {isSigning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Signing EIP-712 Voucher...</span>
                </>
              ) : isScanningNfc ? (
                <>
                  <Radio className="w-4 h-4 animate-ping text-slate-950" />
                  <span>Hold Born.Live Card to Phone...</span>
                </>
              ) : (
                <>
                  <span>Tap Born.Live Card to Pay ₹{currentAmount}</span>
                  <span className="text-xs opacity-75 font-normal">(~{currentUSDC} USDC)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* World ID Modal */}
      <WorldIDModal
        isOpen={isWorldIDModalOpen}
        onClose={() => setIsWorldIDModalOpen(false)}
        currentNullifier={worldNullifier}
        onNullifierUpdated={setWorldNullifier}
        isAirplaneMode={isAirplaneMode}
      />
    </div>
  );
};
