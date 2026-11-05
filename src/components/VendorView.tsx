import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Voucher, VerificationResult } from '../types';
import {
  verifyVoucherOffline,
  signVoucherPayload,
  truncateHash
} from '../utils/crypto';
import { sound } from '../utils/sound';
import { MandalaBurst } from './MumbaiMotifs';
import {
  Camera,
  CameraOff,
  Sparkles,
  Check,
  AlertTriangle
} from 'lucide-react';

interface VendorViewProps {
  onVoucherAccepted: (voucher: Voucher) => void;
  spentVoucherIds: Set<string>;
  isAirplaneMode: boolean;
  totalCollectedINR: number;
}

export const VendorView: React.FC<VendorViewProps> = ({
  onVoucherAccepted,
  spentVoucherIds,
  isAirplaneMode,
  totalCollectedINR,
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verifiedVoucher, setVerifiedVoucher] = useState<Voucher | null>(null);
  const [manualPayloadStr, setManualPayloadStr] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'chaitap-qr-reader';

  const processVoucherPayload = (payloadString: string) => {
    try {
      let parsed: Voucher;
      try {
        parsed = JSON.parse(payloadString.trim());
      } catch {
        const result: VerificationResult = {
          isValid: false,
          error: 'QR payload is not valid JSON.',
        };
        setVerificationResult(result);
        sound.playErrorBuzz();
        return;
      }

      // Offline Cryptographic Validation
      const result = verifyVoucherOffline(parsed, spentVoucherIds);
      setVerificationResult(result);

      if (result.isValid) {
        setVerifiedVoucher(parsed);
        onVoucherAccepted(parsed);
        sound.playPaymentSuccessChime();

        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([100, 50, 100]);
          } catch {
            // ignore
          }
        }
        stopCamera();
      } else {
        sound.playErrorBuzz();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Validation failure';
      setVerificationResult({
        isValid: false,
        error: msg,
      });
      sound.playErrorBuzz();
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    setVerificationResult(null);
    setVerifiedVoucher(null);

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        { fps: 15, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          processVoucherPayload(decodedText);
        },
        () => {}
      );

      setIsCameraActive(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Camera unavailable';
      setCameraError(msg);
      setIsCameraActive(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Single-Device Evaluation
  const handleSimulateIncomingVoucher = async () => {
    setIsSimulating(true);
    setCameraError(null);

    try {
      const simulatedVoucher = await signVoucherPayload({
        amountINR: 20,
        cardUID: '04:78:E1:92:4B:33:80',
        itemLabel: 'Masala Chai',
        customExpirySeconds: 300,
      });

      processVoucherPayload(JSON.stringify(simulatedVoucher));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Simulation failed';
      setCameraError(msg);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleReset = () => {
    setVerificationResult(null);
    setVerifiedVoucher(null);
    setManualPayloadStr('');
  };

  return (
    <div className="space-y-6">
      {/* Vendor Stats Header */}
      <div className="rounded-2xl bg-[#12172D] border border-white/[0.08] p-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center text-xl">
            ☕
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm sm:text-base">
              Chaiwala Terminal
            </h2>
            <p className="text-xs text-slate-400">
              Devcon 8 Mumbai • {isAirplaneMode ? 'Offline Mode' : 'Online'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Today's Total</span>
          <span className="text-lg font-bold font-mono text-emerald-400">
            ₹{totalCollectedINR.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 font-mono block">
            {spentVoucherIds.size} vouchers
          </span>
        </div>
      </div>

      {/* Main Scanner / Verification Area */}
      <div className="rounded-2xl bg-[#12172D] border border-white/[0.08] p-6 shadow-sm">
        {/* Celebration State */}
        {verificationResult?.isValid && verifiedVoucher ? (
          <div className="py-6 flex flex-col items-center text-center space-y-5 animate-fade-in">
            <MandalaBurst size={180} />

            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
                Payment Verified
              </span>
              <h3 className="text-3xl font-serif font-black text-white">
                ₹{verifiedVoucher.amountINR}.00 Received
              </h3>
              <p className="text-sm text-slate-300">
                {verifiedVoucher.itemLabel || 'Cutting Chai'} (~{verifiedVoucher.amountUSDC} USDC)
              </p>
            </div>

            {/* Clean 3-Point Checklist */}
            <div className="w-full max-w-sm bg-black/40 rounded-xl p-4 border border-white/[0.06] text-xs font-mono text-left space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Born.Live NFC Card: {verifiedVoucher.cardUID}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>World ID Sybil Protected: {truncateHash(verifiedVoucher.worldNullifier, 6, 4)}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>EIP-712 Signer: {truncateHash(verifiedVoucher.customer, 6, 4)}</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full max-w-sm py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition"
            >
              Scan Next Customer
            </button>
          </div>
        ) : (
          /* Normal Scanner View */
          <div className="space-y-5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Optical QR Viewfinder</span>
              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className="text-amber-400 hover:underline"
              >
                {showManualInput ? 'Show Camera' : 'Paste JSON Payload'}
              </button>
            </div>

            {/* Error Message */}
            {verificationResult && !verificationResult.isValid && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Voucher Rejected</span>
                </div>
                <p className="font-mono text-[11px]">{verificationResult.error}</p>
                <button
                  onClick={() => setVerificationResult(null)}
                  className="mt-2 text-[11px] font-semibold text-rose-300 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {!showManualInput ? (
              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-xs aspect-square bg-black/60 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center">
                  <div id={scannerContainerId} className="w-full h-full" />

                  {!isCameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#0E1328]/95 z-10">
                      <Camera className="w-8 h-8 text-slate-400" />
                      <p className="text-xs text-slate-400 max-w-xs">
                        Camera scanner works in 100% Airplane Mode
                      </p>
                      <button
                        onClick={startCamera}
                        className="py-2.5 px-5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white font-medium text-xs transition border border-white/10"
                      >
                        Start Camera
                      </button>
                      {cameraError && (
                        <p className="text-[11px] text-rose-400">{cameraError}</p>
                      )}
                    </div>
                  )}
                </div>

                {isCameraActive && (
                  <button
                    onClick={stopCamera}
                    className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white py-1.5 px-3 rounded-lg bg-white/[0.05]"
                  >
                    <CameraOff className="w-3.5 h-3.5" />
                    <span>Stop Camera</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={5}
                  value={manualPayloadStr}
                  onChange={e => setManualPayloadStr(e.target.value)}
                  placeholder='Paste signed voucher JSON here...'
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
                />
                <button
                  onClick={() => processVoucherPayload(manualPayloadStr)}
                  disabled={!manualPayloadStr.trim()}
                  className="w-full py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold text-xs transition border border-white/10 disabled:opacity-40"
                >
                  Verify Payload
                </button>
              </div>
            )}

            {/* Single-Device Fast Evaluation */}
            <div className="pt-3 border-t border-white/[0.06]">
              <button
                onClick={handleSimulateIncomingVoucher}
                disabled={isSimulating}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold text-xs transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>
                  {isSimulating ? 'Simulating Voucher...' : 'Simulate Incoming ₹20 Chai Voucher'}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
