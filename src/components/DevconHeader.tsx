import React from 'react';
import { DevconMumbaiLogo } from './DevconMumbaiLogo';
import { Plane, Wifi } from 'lucide-react';

interface DevconHeaderProps {
  activeTab: 'customer' | 'vendor' | 'vault';
  setActiveTab: (tab: 'customer' | 'vendor' | 'vault') => void;
  isAirplaneMode: boolean;
  setIsAirplaneMode: (val: boolean) => void;
  pendingVoucherCount: number;
  customerBalanceINR: number;
}

export const DevconHeader: React.FC<DevconHeaderProps> = ({
  activeTab,
  setActiveTab,
  isAirplaneMode,
  setIsAirplaneMode,
  pendingVoucherCount,
  customerBalanceINR,
}) => {
  return (
    <header className="relative border-b border-white/[0.08] bg-[#0A0E1C]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Subtle Devcon Mumbai Moonlight Art Banner as Top Backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <img
          src="/assets/devcon-mumbai-hero.jpg"
          alt="Devcon Mumbai Night Sky"
          className="w-full h-full object-cover object-top filter saturate-150"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E1C]/40 via-[#0A0E1C]/85 to-[#0A0E1C]"></div>
      </div>

      {/* Main Top Bar */}
      <div className="relative max-w-4xl mx-auto px-4 pt-3 pb-2">
        <div className="flex items-center justify-between gap-3">
          {/* Official Devcon VIII Logo & ChaiTap Title */}
          <div className="flex items-center gap-3.5">
            <DevconMumbaiLogo
              size="md"
              onClick={() => setActiveTab('customer')}
            />
            <div className="h-7 w-[1px] bg-white/10 hidden sm:block"></div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white tracking-tight text-sm">ChaiTap</span>
                <span className="text-[10px] text-amber-400 font-serif font-medium bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                  Mumbai
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans">
                Offline P2P Micro-Escrow
              </p>
            </div>
          </div>

          {/* Right Controls: Balance Pill & Airplane Mode Hardware Switch */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Spending Balance Pill */}
            <div
              onClick={() => setActiveTab('customer')}
              className="hidden xs:flex items-center gap-1.5 bg-white/[0.04] hover:bg-white/[0.08] transition px-3 py-1.5 rounded-full border border-white/[0.08] text-xs cursor-pointer"
            >
              <span className="text-slate-400">Vault:</span>
              <span className="text-white font-mono font-bold">₹{customerBalanceINR.toFixed(0)}</span>
              {pendingVoucherCount > 0 && (
                <span className="ml-1 text-[10px] bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded-full font-mono">
                  {pendingVoucherCount} queued
                </span>
              )}
            </div>

            {/* Tactile Airplane Mode Pill Switch */}
            <button
              onClick={() => setIsAirplaneMode(!isAirplaneMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 border ${
                isAirplaneMode
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:border-emerald-500/50'
              }`}
              title="Click to toggle Airplane Mode Simulator"
            >
              {isAirplaneMode ? (
                <>
                  <Plane className="w-3.5 h-3.5 text-amber-400 transform -rotate-45 animate-pulse" />
                  <span className="font-semibold">Airplane Mode (100% Offline)</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Base Sepolia (Online)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Minimalist Natural-Flowing Tab Navigation */}
        <nav className="mt-3 flex items-center justify-between border-t border-white/[0.08] pt-2">
          <div className="flex space-x-1 sm:space-x-2 w-full">
            <button
              onClick={() => setActiveTab('customer')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'customer'
                  ? 'bg-white/[0.08] text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <span>☕</span>
              <span>Pay (Customer)</span>
            </button>

            <button
              onClick={() => setActiveTab('vendor')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'vendor'
                  ? 'bg-white/[0.08] text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <span>📷</span>
              <span>Scan (Chaiwala)</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center gap-1.5 relative ${
                activeTab === 'vault'
                  ? 'bg-white/[0.08] text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
              }`}
            >
              <span>🏛️</span>
              <span>Settlement</span>
              {pendingVoucherCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
              )}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
