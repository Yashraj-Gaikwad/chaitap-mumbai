import React, { useState, useEffect } from 'react';
import { DevconHeader } from './components/DevconHeader';
import { CustomerView } from './components/CustomerView';
import { VendorView } from './components/VendorView';
import { VaultView } from './components/VaultView';
import { Voucher, SettlementBatch } from './types';
import { Plane, Wifi } from 'lucide-react';

const STORAGE_KEY_VOUCHERS = 'chaitap_vendor_vouchers';
const STORAGE_KEY_SETTLED = 'chaitap_settled_batches';
const STORAGE_KEY_BALANCE = 'chaitap_customer_balance';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'customer' | 'vendor' | 'vault'>('customer');

  // Airplane mode state: defaults to true to demonstrate offline P2P
  const [isAirplaneMode, setIsAirplaneMode] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return true;
    }
    return true;
  });

  // Customer Vault Balance
  const [customerBalanceINR, setCustomerBalanceINR] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BALANCE);
    return saved ? parseFloat(saved) : 500.0;
  });

  // Vendor Collected Vouchers
  const [collectedVouchers, setCollectedVouchers] = useState<Voucher[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VOUCHERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Settled Batches on Base Sepolia
  const [settledBatches, setSettledBatches] = useState<SettlementBatch[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTLED);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const spentVoucherIds = new Set<string>([
    ...collectedVouchers.map(v => v.voucherId),
    ...settledBatches.flatMap(b => b.vouchers.map(v => v.voucherId)),
  ]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BALANCE, customerBalanceINR.toString());
  }, [customerBalanceINR]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_VOUCHERS, JSON.stringify(collectedVouchers));
  }, [collectedVouchers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTLED, JSON.stringify(settledBatches));
  }, [settledBatches]);

  useEffect(() => {
    const handleOffline = () => setIsAirplaneMode(true);
    window.addEventListener('offline', handleOffline);
    return () => window.removeEventListener('offline', handleOffline);
  }, []);

  const handleVoucherCreated = (voucher: Voucher) => {
    setCustomerBalanceINR(prev => Math.max(0, prev - voucher.amountINR));
  };

  const handleVoucherAccepted = (voucher: Voucher) => {
    setCollectedVouchers(prev => [voucher, ...prev]);
  };

  const handleBatchSettled = (batch: SettlementBatch) => {
    setSettledBatches(prev => [batch, ...prev]);
    setCollectedVouchers([]);
  };

  const handleClearLedger = () => {
    if (window.confirm('Clear all offline vouchers from the vendor ledger?')) {
      setCollectedVouchers([]);
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset demo state to ₹500 balance and clear test vouchers?')) {
      setCustomerBalanceINR(500.0);
      setCollectedVouchers([]);
      setSettledBatches([]);
      localStorage.removeItem(STORAGE_KEY_VOUCHERS);
      localStorage.removeItem(STORAGE_KEY_SETTLED);
      localStorage.setItem(STORAGE_KEY_BALANCE, '500.00');
    }
  };

  const totalCollectedINR = collectedVouchers.reduce((sum, v) => sum + v.amountINR, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0D1B] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Devcon VIII Mumbai Header */}
      <DevconHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAirplaneMode={isAirplaneMode}
        setIsAirplaneMode={setIsAirplaneMode}
        pendingVoucherCount={collectedVouchers.length}
        customerBalanceINR={customerBalanceINR}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-6">
        {/* Subtle Mode Indicator Banner */}
        <div className="mb-5 flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center gap-2">
            {isAirplaneMode ? (
              <>
                <Plane className="w-3.5 h-3.5 text-amber-400 transform -rotate-45" />
                <span className="text-amber-300 font-medium">100% Airplane Mode</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Zero cellular or Wi-Fi required</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Online (Base Sepolia)</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">Ready to settle accumulated claims</span>
              </>
            )}
          </div>

          <button
            onClick={() => setIsAirplaneMode(!isAirplaneMode)}
            className="text-[11px] text-slate-400 hover:text-white underline underline-offset-2 transition"
          >
            {isAirplaneMode ? 'Simulate Online' : 'Simulate Offline'}
          </button>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'customer' && (
            <CustomerView
              balanceINR={customerBalanceINR}
              onVoucherCreated={handleVoucherCreated}
              isAirplaneMode={isAirplaneMode}
            />
          )}

          {activeTab === 'vendor' && (
            <VendorView
              onVoucherAccepted={handleVoucherAccepted}
              spentVoucherIds={spentVoucherIds}
              isAirplaneMode={isAirplaneMode}
              totalCollectedINR={totalCollectedINR}
            />
          )}

          {activeTab === 'vault' && (
            <VaultView
              collectedVouchers={collectedVouchers}
              settledBatches={settledBatches}
              onBatchSettled={handleBatchSettled}
              onClearLedger={handleClearLedger}
              isAirplaneMode={isAirplaneMode}
              setIsAirplaneMode={setIsAirplaneMode}
            />
          )}
        </div>
      </main>

      {/* Minimalist Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0A0D1B] py-6 text-xs text-slate-500">
        <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <div className="text-slate-300 font-medium">
              ChaiTap • Devcon VIII Mumbai (2026)
            </div>
            <div className="text-[11px] text-slate-500">
              Offline P2P Micro-Escrow • Born.Live NFC • World ID • Base Sepolia
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={handleResetDemo}
              className="text-slate-400 hover:text-amber-400 transition"
            >
              Reset Demo Data
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
