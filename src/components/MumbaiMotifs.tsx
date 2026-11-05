import React from 'react';

/**
 * Devcon VIII Mumbai Emblem:
 * Integrates Ethereum diamond geometry with an Indian third-eye / lotus motif
 */
export const DevconEmblem: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 40 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="ethGrad" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <radialGradient id="eyeGlow" cx="50" cy="48" r="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0A0D1B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Lotus base petals */}
      <path
        d="M50 78 C35 88 18 84 12 70 C24 73 38 68 50 78 Z"
        fill="#EA580C"
        opacity="0.7"
      />
      <path
        d="M50 78 C65 88 82 84 88 70 C76 73 62 68 50 78 Z"
        fill="#EA580C"
        opacity="0.7"
      />

      {/* Outer sacred geometry halo */}
      <circle cx="50" cy="50" r="44" stroke="rgba(245, 158, 11, 0.4)" strokeWidth="1" strokeDasharray="3 3" />
      <circle cx="50" cy="50" r="39" stroke="rgba(56, 189, 248, 0.3)" strokeWidth="0.8" />

      {/* Center radiant glow */}
      <circle cx="50" cy="48" r="18" fill="url(#eyeGlow)" />

      {/* Ethereum Upper Diamond */}
      <path
        d="M50 12 L72 48 L50 60 L28 48 Z"
        stroke="url(#ethGrad)"
        strokeWidth="2.5"
        fill="rgba(6, 182, 212, 0.15)"
        strokeLinejoin="round"
      />
      {/* Upper facet line */}
      <path
        d="M50 12 L50 60"
        stroke="#38BDF8"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Ethereum Lower Spike */}
      <path
        d="M50 65 L72 52 L50 88 L28 52 Z"
        stroke="url(#ethGrad)"
        strokeWidth="2.2"
        fill="rgba(234, 88, 12, 0.15)"
        strokeLinejoin="round"
      />

      {/* Third Eye Center Jewel / Bindu */}
      <ellipse cx="50" cy="48" rx="6" ry="10" stroke="#FDE047" strokeWidth="1.5" fill="#0A0D1B" />
      <circle cx="50" cy="48" r="3" fill="#38BDF8" />
    </svg>
  );
};

/**
 * Watermark silhouette of Mumbai's iconic Gateway of India & Bandra-Worli Sea Link cables
 */
export const MumbaiWatermark: React.FC<{ className?: string }> = ({ className = 'absolute inset-0 opacity-10 pointer-events-none' }) => {
  return (
    <svg
      viewBox="0 0 600 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Bandra-Worli Sea Link Cables (Left & Center Background) */}
      <g stroke="#38BDF8" strokeWidth="1" strokeOpacity="0.45">
        {/* Sea link tower 1 */}
        <line x1="80" y1="210" x2="130" y2="40" strokeWidth="2.5" />
        <line x1="180" y1="210" x2="130" y2="40" strokeWidth="2.5" />
        <line x1="130" y1="40" x2="20" y2="210" />
        <line x1="130" y1="40" x2="50" y2="210" />
        <line x1="130" y1="40" x2="80" y2="210" />
        <line x1="130" y1="40" x2="110" y2="210" />
        <line x1="130" y1="40" x2="150" y2="210" />
        <line x1="130" y1="40" x2="180" y2="210" />
        <line x1="130" y1="40" x2="210" y2="210" />
        <line x1="130" y1="40" x2="240" y2="210" />

        {/* Sea link tower 2 */}
        <line x1="260" y1="210" x2="310" y2="60" strokeWidth="2" />
        <line x1="360" y1="210" x2="310" y2="60" strokeWidth="2" />
        <line x1="310" y1="60" x2="230" y2="210" />
        <line x1="310" y1="60" x2="270" y2="210" />
        <line x1="310" y1="60" x2="350" y2="210" />
        <line x1="310" y1="60" x2="390" y2="210" />
      </g>

      {/* Gateway of India Silhouette (Right Foreground) */}
      <g fill="#F59E0B" fillOpacity="0.5">
        {/* Plinth */}
        <rect x="420" y="200" width="160" height="15" rx="1" />
        <rect x="425" y="190" width="150" height="10" />

        {/* Outer pillars */}
        <rect x="430" y="110" width="22" height="80" />
        <rect x="548" y="110" width="22" height="80" />

        {/* Inner pillars */}
        <rect x="475" y="130" width="14" height="60" />
        <rect x="511" y="130" width="14" height="60" />

        {/* Main Central Arch */}
        <path d="M489 135 C489 115 511 115 511 135 L511 190 L489 190 Z" />

        {/* Side Arches */}
        <path d="M452 145 C452 135 475 135 475 145 L475 190 L452 190 Z" />
        <path d="M525 145 C525 135 548 135 548 145 L548 190 L525 190 Z" />

        {/* Cornice / Upper frieze */}
        <rect x="425" y="98" width="150" height="12" />

        {/* Central Dome */}
        <path d="M480 98 C480 65 520 65 520 98 Z" />
        {/* Central Spire */}
        <rect x="498" y="55" width="4" height="12" />
        <circle cx="500" cy="53" r="3" />

        {/* Left & Right Turrets */}
        <path d="M432 98 C432 80 450 80 450 98 Z" />
        <path d="M550 98 C550 80 568 80 568 98 Z" />
      </g>

      {/* Arabian Sea Waves waterline */}
      <path
        d="M0 215 Q50 210 100 215 T200 215 T300 215 T400 215 T500 215 T600 215 L600 240 L0 240 Z"
        fill="rgba(6, 182, 212, 0.2)"
      />
    </svg>
  );
};

/**
 * Devcon Celebration Mandala Burst
 */
export const MandalaBurst: React.FC<{ size?: number; className?: string }> = ({ size = 180, className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Outer rotating rays */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        className="animate-spin-slow absolute inset-0"
        fill="none"
      >
        <defs>
          <linearGradient id="mandalaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* 16 Radial Petals */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16;
          return (
            <g key={i} transform={`rotate(${angle} 100 100)`}>
              <path
                d="M100 20 C108 45 116 75 100 95 C84 75 92 45 100 20 Z"
                fill="url(#mandalaGrad)"
                opacity="0.45"
              />
              <circle cx="100" cy="18" r="3" fill="#FDE047" />
              <line x1="100" y1="24" x2="100" y2="60" stroke="#38BDF8" strokeWidth="1" opacity="0.6" />
            </g>
          );
        })}

        {/* Inner concentric lotus rings */}
        <circle cx="100" cy="100" r="70" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
        <circle cx="100" cy="100" r="50" stroke="#F59E0B" strokeWidth="1.5" opacity="0.7" />
        <circle cx="100" cy="100" r="34" stroke="#10B981" strokeWidth="1.5" strokeDasharray="2 3" opacity="0.8" />
      </svg>

      {/* Center glowing checkmark seal */}
      <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[2px] shadow-[0_0_35px_rgba(16,185,129,0.7)] animate-bounce-short">
        <div className="w-full h-full rounded-full bg-[#0A0D1B] flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};
