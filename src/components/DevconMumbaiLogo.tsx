import React from 'react';

/**
 * Authentic Devcon VIII India Emblem & Wordmark
 * Faithfully matches the official Devcon 8 Mumbai branding
 */
export const DevconMumbaiEmblem: React.FC<{ size?: number; className?: string }> = ({
  size = 56,
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 100 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Sky / Twilight gradient for diamond */}
        <linearGradient id="ethSky" x1="50" y1="5" x2="50" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4338CA" />
          <stop offset="25%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#EC4899" />
          <stop offset="75%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>

        <linearGradient id="eyeRadiance" x1="50" y1="45" x2="50" y2="75" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>

        <radialGradient id="pupilGlow" cx="50" cy="58" r="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.9" />
          <stop offset="70%" stopColor="#0284C7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer Ethereum Diamond Contour */}
      <path
        d="M50 8 L88 62 L50 122 L12 62 Z"
        fill="#0E1328"
        stroke="url(#ethSky)"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Inner Inset Diamond Frame */}
      <path
        d="M50 16 L80 62 L50 114 L20 62 Z"
        fill="url(#ethSky)"
        fillOpacity="0.18"
        stroke="rgba(255, 255, 255, 0.25)"
        strokeWidth="1"
      />

      {/* Top Half: Lunar Cycle / Moon Phases */}
      <g fill="#FDE68A" opacity="0.95">
        {/* Waxing Crescent */}
        <path d="M38 30 A 4 4 0 0 1 38 38 A 2.5 4 0 0 0 38 30 Z" />
        {/* Half Moon */}
        <path d="M44 26 A 4 4 0 0 1 44 34 L 44 26 Z" />
        {/* Full Moon Center */}
        <circle cx="50" cy="27" r="3.2" fill="#FEF08A" />
        {/* Waning Moon */}
        <path d="M56 26 A 4 4 0 0 0 56 34 L 56 26 Z" />
        {/* Waning Crescent */}
        <path d="M62 30 A 4 4 0 0 0 62 38 A 2.5 4 0 0 1 62 30 Z" />
      </g>

      {/* Center Lotus Flower & Radiant Third Eye */}
      <circle cx="50" cy="58" r="16" fill="url(#pupilGlow)" />

      {/* Lotus Petals around the Eye */}
      <g stroke="#FDE047" strokeWidth="1.2" fill="rgba(245, 158, 11, 0.35)">
        {/* 8 petals */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
          <ellipse
            key={i}
            cx="50"
            cy="58"
            rx="3.5"
            ry="9"
            transform={`rotate(${angle} 50 58)`}
          />
        ))}
      </g>

      {/* Center Eye Contour */}
      <path
        d="M34 58 Q 50 47 66 58 Q 50 69 34 58 Z"
        fill="#0B0F1E"
        stroke="#FFFFFF"
        strokeWidth="1.8"
      />

      {/* Central Iris & Pupil */}
      <circle cx="50" cy="58" r="5" fill="#38BDF8" stroke="#FDE047" strokeWidth="1.2" />
      <circle cx="50" cy="58" r="2.2" fill="#0A0D1B" />
      <circle cx="51.5" cy="56.5" r="1" fill="#FFFFFF" />

      {/* Horizontal Diamond Facet Divider */}
      <line x1="12" y1="62" x2="88" y2="62" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1.2" />

      {/* Lower Half Sacred Triangular Geometry */}
      <g stroke="rgba(244, 114, 182, 0.7)" strokeWidth="1" fill="none">
        <path d="M50 72 L62 90 L38 90 Z" />
        <path d="M50 114 L62 90 L38 90 Z" opacity="0.6" />
        <circle cx="50" cy="84" r="2" fill="#F472B6" />
        <circle cx="50" cy="102" r="2.5" fill="#F59E0B" />
      </g>
    </svg>
  );
};

/**
 * The official Devcon VIII India Logo with typography
 * "DEV [Emblem] CON"
 * "VIII          INDIA"
 */
export const DevconMumbaiLogo: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}> = ({ className = '', size = 'md', onClick }) => {
  const emblemSize = size === 'sm' ? 32 : size === 'lg' ? 52 : 42;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl';
  const subSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[11px]';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* DEV */}
      <div className="flex flex-col items-end">
        <span
          className={`font-serif ${textSize} font-black tracking-widest text-slate-100 uppercase`}
          style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
        >
          DEV
        </span>
        <span
          className={`font-serif ${subSize} font-bold tracking-[0.25em] text-amber-400/90 -mt-1`}
          style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
        >
          VIII
        </span>
      </div>

      {/* Official Emblem */}
      <DevconMumbaiEmblem size={emblemSize} className="flex-shrink-0 hover:scale-105 transition-transform" />

      {/* CON */}
      <div className="flex flex-col items-start">
        <span
          className={`font-serif ${textSize} font-black tracking-widest text-slate-100 uppercase`}
          style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
        >
          CON
        </span>
        <span
          className={`font-serif ${subSize} font-bold tracking-[0.25em] text-teal-300/90 -mt-1`}
          style={{ fontFamily: "'Cinzel', 'Playfair Display', Georgia, serif" }}
        >
          INDIA
        </span>
      </div>
    </div>
  );
};
