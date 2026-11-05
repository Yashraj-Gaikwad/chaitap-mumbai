import React, { useState } from 'react';
import { Voucher, SettlementBatch } from '../types';
import { truncateHash } from '../utils/crypto';
import { sound } from '../utils/sound';
import {
  Coins,
  Plane,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface VaultViewProps {
  collectedVouchers: Voucher[];
  settledBatches: SettlementBatch[];
  onBatchSettled: (batch: SettlementBatch) => void;
  onClearLedger: () => void;
  isAirplaneMode: boolean;
  setIsAirplaneMode: (val: boolean) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  collectedVouchers,
  settledBatches,
  onBatchSettled,
  onClearLedger,
  isAirplaneMode,
  setIsAirplaneMode,
}) => {
  const [isSettling, setIsSettling] = useState<boolean>(false);
  const [activeBatchModal, setActiveBatchModal] = useState<SettlementBatch | null>(null);
  const [selectedVoucherForModal, setSelectedVoucherForModal] = useState<Voucher | null>(null);

  const pendingVouchers = collectedVouchers;
  const totalPendingINR = pendingVouchers.reduce((acc, v) => acc + v.amountINR, 0);
  const totalPendingUSDC = (totalPendingINR / 83.3333).toFixed(2);

  const handleBatchSettle = async () => {
    if (isAirplaneMode) {
      sound.playErrorBuzz();
      return;
    }

    if (pendingVouchers.length === 0) return;

    setIsSettling(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1800));

      const batchId = `BATCH-MUMBAI-${Date.now().toString().slice(-6)}`;
      const randomBytes = Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      const txHash = `0x${randomBytes}`;
      const blockNumber = 17894210 + Math.floor(Math.random() * 100);

      const newBatch: SettlementBatch = {
        batchId,
        vouchers: [...pendingVouchers],
        totalINR: totalPendingINR,
        totalUSDC: totalPendingUSDC,
        txHash,
        timestamp: Date.now(),
        status: 'settled',
        blockNumber,
      };

      sound.playPaymentSuccessChime();
      onBatchSettled(newBatch);
      setActiveBatchModal(newBatch);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSettling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Vault Summary Card */}
      <div className="rounded-2xl bg-[#12172D] border border-white/[0.08] p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Base Sepolia Escrow</span>
              <span>•</span>
              <span className="font-mono">0x389E...c982</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
              Vendor Vault & Batch Rollup
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Vouchers collected offline are held in local state until an internet connection is available to claim from the Base Sepolia vault.
            </p>
          </div>

          <div className="text-left sm:text-right bg-white/[0.03] p-4 rounded-xl border border-white/[0.06]">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-mono">
              Pending Claims
            </span>
            <div className="text-3xl font-serif font-black text-amber-400">
              ₹{totalPendingINR.toFixed(2)}
            </div>
            <span className="text-xs text-teal-300 font-mono">
              ~{totalPendingUSDC} USDC
            </span>
          </div>
        </div>

        {/* Settle Action Bar */}
        <div className="pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {isAirplaneMode ? (
              <span className="text-amber-400 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5 transform -rotate-45" />
                <span>Airplane Mode active. Disable to submit batch to Base Sepolia.</span>
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Base Sepolia network connected.</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isAirplaneMode && (
              <button
                onClick={() => setIsAirplaneMode(false)}
                className="py-2.5 px-3.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs text-slate-200 transition"
              >
                Go Online
              </button>
            )}

            <button
              onClick={handleBatchSettle}
              disabled={isAirplaneMode || pendingVouchers.length === 0 || isSettling}
              className={`w-full sm:w-auto py-2.5 px-5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                isAirplaneMode || pendingVouchers.length === 0
                  ? 'bg-white/[0.04] text-slate-500 border border-white/[0.06] cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-md'
              }`}
            >
              {isSettling ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-950" />
                  <span>Submitting to Base Sepolia...</span>
                </>
              ) : (
                <>
                  <Coins className="w-3.5 h-3.5" />
                  <span>Batch Settle ({pendingVouchers.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Offline Ledger */}
      <div className="rounded-2xl bg-[#12172D] border border-white/[0.08] overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between text-xs">
          <span className="font-semibold text-white">
            Collected Vouchers ({pendingVouchers.length})
          </span>
          {pendingVouchers.length > 0 && (
            <button
              onClick={onClearLedger}
              className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition text-[11px]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {pendingVouchers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-1">
            <Coins className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <div className="text-xs text-slate-300">No pending vouchers</div>
            <p className="text-[11px] text-slate-500">
              Create a voucher in Customer view, then scan it or click Simulate in Vendor view.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] text-xs font-mono">
            {pendingVouchers.map((v) => (
              <div
                key={v.voucherId}
                onClick={() => setSelectedVoucherForModal(v)}
                className="px-5 py-3.5 hover:bg-white/[0.02] transition cursor-pointer flex items-center justify-between gap-3"
              >
                <div>
                  <div className="text-white font-medium font-sans">
                    ₹{v.amountINR}.00 • <span className="text-slate-400 text-xs">{v.itemLabel || 'Cutting Chai'}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ID: <span className="text-amber-300">{v.voucherId}</span> • Card: <span className="text-teal-300">{v.cardUID}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right text-[11px]">
                    <div className="text-teal-300 font-semibold">{v.amountUSDC} USDC</div>
                    <div className="text-slate-500">
                      {new Date(v.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Batches */}
      {settledBatches.length > 0 && (
        <div className="rounded-2xl bg-[#12172D] border border-white/[0.08] p-5 space-y-3">
          <div className="text-xs font-semibold text-white">
            Settled Batches on Base Sepolia ({settledBatches.length})
          </div>

          <div className="space-y-2">
            {settledBatches.map(batch => (
              <div
                key={batch.batchId}
                onClick={() => setActiveBatchModal(batch)}
                className="p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] transition cursor-pointer flex items-center justify-between text-xs font-mono"
              >
                <div>
                  <div className="text-emerald-400 font-bold">{batch.batchId}</div>
                  <div className="text-[11px] text-slate-400">
                    Tx: {truncateHash(batch.txHash || '', 10, 8)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold font-sans">₹{batch.totalINR.toFixed(2)}</div>
                  <div className="text-[10px] text-teal-300">{batch.totalUSDC} USDC</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settlement Success Modal */}
      {activeBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#12172D] border border-emerald-500/40 p-6 space-y-4 shadow-xl">
            <div className="text-center space-y-1">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h3 className="text-lg font-serif font-bold text-white">
                Settled on Base Sepolia
              </h3>
              <p className="text-xs text-slate-400">
                Batch {activeBatchModal.batchId} confirmed in Block #{activeBatchModal.blockNumber}
              </p>
            </div>

            <div className="bg-black/40 rounded-xl p-4 text-xs font-mono space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span>Vouchers:</span>
                <span className="text-white">{activeBatchModal.vouchers.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="text-emerald-400 font-bold">
                  ₹{activeBatchModal.totalINR.toFixed(2)} (~{activeBatchModal.totalUSDC} USDC)
                </span>
              </div>
              <div className="pt-2 border-t border-white/[0.08]">
                <span className="text-slate-400 block mb-1">Tx Hash:</span>
                <a
                  href={`https://sepolia.basescan.org/tx/${activeBatchModal.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-300 hover:underline break-all flex items-center gap-1"
                >
                  <span>{activeBatchModal.txHash}</span>
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                </a>
              </div>
            </div>

            <button
              onClick={() => setActiveBatchModal(null)}
              className="w-full py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Individual Voucher Modal */}
      {selectedVoucherForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#12172D] border border-white/10 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white font-mono">
                Voucher #{selectedVoucherForModal.voucherId}
              </h3>
              <button
                onClick={() => setSelectedVoucherForModal(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-black/40 rounded-xl p-4 text-xs font-mono text-slate-300 space-y-2">
              <div>
                <span className="text-slate-500 block text-[10px]">CUSTOMER:</span>
                <span className="text-white break-all">{selectedVoucherForModal.customer}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">BORN.LIVE CARD UID:</span>
                <span className="text-teal-300 font-bold">{selectedVoucherForModal.cardUID}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">WORLD ID NULLIFIER:</span>
                <span className="text-slate-300 break-all">{selectedVoucherForModal.worldNullifier}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">EIP-712 SIGNATURE:</span>
                <span className="text-amber-300/80 break-all text-[11px]">{selectedVoucherForModal.sig}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedVoucherForModal(null)}
              className="w-full py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-white text-xs font-semibold transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
