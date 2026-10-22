import React from 'react';

export type BadgeArtType = 'sword' | 'shield' | 'trophy' | 'chrono' | 'compass' | 'flame' | 'crown' | 'dragon';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'platinum';

interface PixelBadgeArtProps {
  type: BadgeArtType;
  tier?: BadgeTier;
  isUnlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PixelBadgeArt: React.FC<PixelBadgeArtProps> = ({
  type,
  tier = 'bronze',
  isUnlocked,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const tierColors = {
    bronze: {
      border: 'border-[#b45309]',
      glow: 'shadow-[0_0_8px_rgba(180,83,9,0.3)]',
      bg: 'bg-[#291708]',
      accent: '#f59e0b',
      label: 'BRONZE',
    },
    silver: {
      border: 'border-[#94a3b8]',
      glow: 'shadow-[0_0_8px_rgba(148,163,184,0.3)]',
      bg: 'bg-[#18202c]',
      accent: '#cbd5e1',
      label: 'SILVER',
    },
    gold: {
      border: 'border-[#eab308]',
      glow: 'shadow-[0_0_12px_rgba(234,179,8,0.4)]',
      bg: 'bg-[#292006]',
      accent: '#fbbf24',
      label: 'GOLD',
    },
    platinum: {
      border: 'border-[#38bdf8]',
      glow: 'shadow-[0_0_14px_rgba(56,189,248,0.5)]',
      bg: 'bg-[#091e2f]',
      accent: '#38bdf8',
      label: 'PLATINUM',
    },
  }[tier];

  // SVG-based authentic pixel graphics (stepped blocky pixel coords)
  const renderPixelGraphic = () => {
    switch (type) {
      case 'sword':
        // Crossed 8-bit pixel blades
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full p-2" shapeRendering="crispEdges">
            <rect x="18" y="2" width="2" height="2" fill={isUnlocked ? '#38bdf8' : '#64748b'} />
            <rect x="16" y="4" width="2" height="2" fill={isUnlocked ? '#7dd3fc' : '#475569'} />
            <rect x="14" y="6" width="2" height="2" fill={isUnlocked ? '#bae6fd' : '#334155'} />
            <rect x="12" y="8" width="2" height="2" fill={isUnlocked ? '#e0f2fe' : '#475569'} />
            <rect x="10" y="10" width="2" height="2" fill={isUnlocked ? '#38bdf8' : '#334155'} />
            {/* Guard */}
            <rect x="8" y="10" width="2" height="2" fill={isUnlocked ? '#f59e0b' : '#334155'} />
            <rect x="12" y="10" width="2" height="2" fill={isUnlocked ? '#f59e0b' : '#334155'} />
            <rect x="10" y="12" width="2" height="2" fill={isUnlocked ? '#f59e0b' : '#334155'} />
            <rect x="8" y="12" width="2" height="2" fill={isUnlocked ? '#f59e0b' : '#334155'} />
            {/* Hilt & Pommel */}
            <rect x="8" y="14" width="2" height="2" fill={isUnlocked ? '#b45309' : '#1e293b'} />
            <rect x="6" y="16" width="2" height="2" fill={isUnlocked ? '#b45309' : '#1e293b'} />
            <rect x="4" y="18" width="2" height="2" fill={isUnlocked ? '#fbbf24' : '#1e293b'} />
            {/* Sparkles */}
            {isUnlocked && (
              <>
                <rect x="19" y="5" width="1" height="1" fill="#fff" />
                <rect x="15" y="2" width="1" height="1" fill="#fff" />
              </>
            )}
          </svg>
        );

      case 'shield':
        // Royal Knight Pixel Shield
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full p-2" shapeRendering="crispEdges">
            <rect x="6" y="3" width="12" height="2" fill={isUnlocked ? tierColors.accent : '#475569'} />
            <rect x="4" y="5" width="16" height="2" fill={isUnlocked ? '#1e293b' : '#1e293b'} />
            <rect x="4" y="7" width="16" height="6" fill={isUnlocked ? '#0f172a' : '#0f172a'} />
            <rect x="6" y="13" width="12" height="3" fill={isUnlocked ? '#0f172a' : '#0f172a'} />
            <rect x="8" y="16" width="8" height="3" fill={isUnlocked ? '#0f172a' : '#0f172a'} />
            <rect x="10" y="19" width="4" height="2" fill={isUnlocked ? tierColors.accent : '#334155'} />
            {/* Crest Emblem on shield */}
            <rect x="11" y="7" width="2" height="8" fill={isUnlocked ? '#39ff14' : '#334155'} />
            <rect x="8" y="9" width="8" height="2" fill={isUnlocked ? '#39ff14' : '#334155'} />
            <rect x="10" y="8" width="4" height="4" fill={isUnlocked ? '#4ade80' : '#475569'} />
          </svg>
        );

      case 'chrono':
        // 8-Bit Glowing Hourglass / Focus Chronometer
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full p-2" shapeRendering="crispEdges">
            <rect x="5" y="3" width="14" height="2" fill={isUnlocked ? '#38bdf8' : '#475569'} />
            <rect x="6" y="5" width="12" height="2" fill={isUnlocked ? '#0284c7' : '#334155'} />
            <rect x="7" y="7" width="10" height="2" fill={isUnlocked ? '#bae6fd' : '#1e293b'} />
            <rect x="9" y="9" width="6" height="2" fill={isUnlocked ? '#38bdf8' : '#1e293b'} />
            <rect x="11" y="11" width="2" height="2" fill={isUnlocked ? '#39ff14' : '#334155'} />
            <rect x="9" y="13" width="6" height="2" fill={isUnlocked ? '#38bdf8' : '#1e293b'} />
            <rect x="7" y="15" width="10" height="2" fill={isUnlocked ? '#39ff14' : '#1e293b'} />
            <rect x="6" y="17" width="12" height="2" fill={isUnlocked ? '#22c55e' : '#334155'} />
            <rect x="5" y="19" width="14" height="2" fill={isUnlocked ? '#38bdf8' : '#475569'} />
            {/* Sand falling particles */}
            {isUnlocked && (
              <>
                <rect x="11" y="8" width="2" height="2" fill="#39ff14" />
                <rect x="11" y="14" width="2" height="2" fill="#39ff14" />
              </>
            )}
          </svg>
        );

      case 'flame':
        // 8-Bit Pixel Streak Flame
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full p-2" shapeRendering="crispEdges">
            <rect x="11" y="3" width="2" height="3" fill={isUnlocked ? '#fef08a' : '#475569'} />
            <rect x="10" y="6" width="4" height="3" fill={isUnlocked ? '#fde047' : '#334155'} />
            <rect x="8" y="9" width="8" height="4" fill={isUnlocked ? '#f59e0b' : '#334155'} />
            <rect x="6" y="13" width="12" height="5" fill={isUnlocked ? '#ef4444' : '#1e293b'} />
            <rect x="7" y="18" width="10" height="2" fill={isUnlocked ? '#dc2626' : '#1e293b'} />
            <rect x="8" y="20" width="8" height="1" fill={isUnlocked ? '#991b1b' : '#0f172a'} />
            {/* Inner flame core */}
            {isUnlocked && (
              <>
                <rect x="10" y="11" width="4" height="4" fill="#ffffff" />
                <rect x="11" y="9" width="2" height="2" fill="#ffffff" />
              </>
            )}
          </svg>
        );

      case 'compass':
        // 4-Quadrant Eisenhower Compass
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full p-2" shapeRendering="crispEdges">
            {/* Outer Ring */}
            <rect x="8" y="2" width="8" height="2" fill={isUnlocked ? '#e2e8f0' : '#475569'} />
            <rect x="4" y="4" width="4" height="2" fill={isUnlocked ? '#e2e8f0' : '#475569'} />
            <rect x="16" y="4" width="4" height="2" fill={isUnlocked ? '#e2e8f0' : '#475569'} />
            <rect x="2" y="8" width="2" height="8" fill={isUnlocked ? '#e2e8f0' : '#475569'} />
            <rect x="20" y="8" width="2" height="8" fill={isUnlocked ? '#e2e8f0' : '#475569'} />
            <rect x="4" y="18" width="4" height="2" fill={isUnlocked ? '#e2e8f0' : '#475569'} />
            <rect x="16" y="18" width="4" height="2" fill={isUnlocked ? '#e2e8f0' : '#475569'} />
            <rect x="8" y="20" width="8" height="2" fill={isUnlocked ? '#e2e8f0' : '#475569'} />
            {/* 4 Quadrant Quadrants */}
            <rect x="7" y="7" width="4" height="4" fill={isUnlocked ? '#ef4444' : '#1e293b'} />
            <rect x="13" y="7" width="4" height="4" fill={isUnlocked ? '#38bdf8' : '#1e293b'} />
            <rect x="7" y="13" width="4" height="4" fill={isUnlocked ? '#f59e0b' : '#1e293b'} />
            <rect x="13" y="13" width="4" height="4" fill={isUnlocked ? '#475569' : '#1e293b'} />
            {/* Center Pin */}
            <rect x="11" y="11" width="2" height="2" fill={isUnlocked ? '#39ff14' : '#64748b'} />
          </svg>
        );

      case 'crown':
        // Grand Paladin Imperial Crown
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full p-2" shapeRendering="crispEdges">
            <rect x="4" y="6" width="3" height="3" fill={isUnlocked ? '#fbbf24' : '#334155'} />
            <rect x="10" y="4" width="4" height="3" fill={isUnlocked ? '#fbbf24' : '#475569'} />
            <rect x="17" y="6" width="3" height="3" fill={isUnlocked ? '#fbbf24' : '#334155'} />
            <rect x="5" y="9" width="14" height="4" fill={isUnlocked ? '#f59e0b' : '#1e293b'} />
            <rect x="4" y="13" width="16" height="5" fill={isUnlocked ? '#d97706' : '#1e293b'} />
            <rect x="4" y="18" width="16" height="2" fill={isUnlocked ? '#b45309' : '#0f172a'} />
            {/* Jewels */}
            {isUnlocked && (
              <>
                <rect x="6" y="15" width="2" height="2" fill="#ef4444" />
                <rect x="11" y="15" width="2" height="2" fill="#38bdf8" />
                <rect x="16" y="15" width="2" height="2" fill="#39ff14" />
              </>
            )}
          </svg>
        );

      case 'dragon':
        // Mythic Dragon Boss Slayer
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full p-2" shapeRendering="crispEdges">
            <rect x="12" y="3" width="6" height="3" fill={isUnlocked ? '#ef4444' : '#475569'} />
            <rect x="18" y="5" width="3" height="2" fill={isUnlocked ? '#dc2626' : '#334155'} />
            <rect x="10" y="6" width="10" height="4" fill={isUnlocked ? '#b91c1c' : '#334155'} />
            <rect x="8" y="10" width="8" height="6" fill={isUnlocked ? '#991b1b' : '#1e293b'} />
            <rect x="6" y="14" width="4" height="4" fill={isUnlocked ? '#ef4444' : '#1e293b'} />
            <rect x="16" y="12" width="5" height="2" fill={isUnlocked ? '#f59e0b' : '#1e293b'} />
            {/* Fiery Eye */}
            <rect x="15" y="7" width="2" height="2" fill={isUnlocked ? '#fef08a' : '#0f172a'} />
            {/* Horns */}
            <rect x="11" y="2" width="2" height="2" fill={isUnlocked ? '#f59e0b' : '#475569'} />
            <rect x="9" y="4" width="2" height="2" fill={isUnlocked ? '#f59e0b' : '#334155'} />
          </svg>
        );

      case 'trophy':
      default:
        // Retro Golden Trophy
        return (
          <svg viewBox="0 0 24 24" className="w-full h-full p-2" shapeRendering="crispEdges">
            <rect x="6" y="4" width="12" height="6" fill={isUnlocked ? '#fbbf24' : '#334155'} />
            <rect x="4" y="5" width="2" height="4" fill={isUnlocked ? '#f59e0b' : '#1e293b'} />
            <rect x="18" y="5" width="2" height="4" fill={isUnlocked ? '#f59e0b' : '#1e293b'} />
            <rect x="8" y="10" width="8" height="3" fill={isUnlocked ? '#d97706' : '#1e293b'} />
            <rect x="10" y="13" width="4" height="4" fill={isUnlocked ? '#b45309' : '#0f172a'} />
            <rect x="6" y="17" width="12" height="3" fill={isUnlocked ? '#78350f' : '#1e293b'} />
            {isUnlocked && <rect x="8" y="6" width="3" height="3" fill="#ffffff" />}
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center border-3 ${tierColors.border} ${
        isUnlocked ? `${tierColors.bg} ${tierColors.glow}` : 'bg-[#0f141d] border-[#222d3f] opacity-50 grayscale'
      } ${sizeMap[size]} shadow-[2px_2px_0_0_#06090e] ${className}`}
    >
      {/* 4 Stepped Corner Pixel Studs */}
      <span className="absolute -top-1 -left-1 w-1.5 h-1.5 bg-[#0b0e14] pointer-events-none" />
      <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#0b0e14] pointer-events-none" />
      <span className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-[#0b0e14] pointer-events-none" />
      <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-[#0b0e14] pointer-events-none" />

      {renderPixelGraphic()}

      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-[10px]">
          🔒
        </div>
      )}
    </div>
  );
};
