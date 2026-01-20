/**
 * Authentic Nepalese Political Party Icons
 * These are custom SVG icons representing actual party symbols
 */

// CPN-UML Sun Symbol
export const UMLSunIcon = ({ size = 24, className = "" }) => (
  <svg 
    viewBox="0 0 100 100" 
    width={size} 
    height={size} 
    className={className}
    fill="currentColor"
  >
    {/* Main sun circle */}
    <circle cx="50" cy="50" r="25" fill="currentColor" />
    {/* Sun rays */}
    {[...Array(12)].map((_, i) => {
      const angle = (i * 30) * Math.PI / 180;
      const x1 = 50 + Math.cos(angle) * 30;
      const y1 = 50 + Math.sin(angle) * 30;
      const x2 = 50 + Math.cos(angle) * 45;
      const y2 = 50 + Math.sin(angle) * 45;
      return (
        <line 
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2} 
          stroke="currentColor" 
          strokeWidth="6" 
          strokeLinecap="round"
        />
      );
    })}
  </svg>
);

// Nepali Congress Tree Symbol
export const CongressTreeIcon = ({ size = 24, className = "" }) => (
  <svg 
    viewBox="0 0 100 100" 
    width={size} 
    height={size} 
    className={className}
    fill="currentColor"
  >
    {/* Tree trunk */}
    <rect x="44" y="60" width="12" height="30" rx="2" fill="currentColor" />
    {/* Tree foliage - layered triangles */}
    <polygon points="50,5 20,45 80,45" fill="currentColor" />
    <polygon points="50,20 15,65 85,65" fill="currentColor" />
    <polygon points="50,35 10,80 90,80" fill="currentColor" opacity="0.9" />
  </svg>
);

// RSP Bell Symbol  
export const RSPBellIcon = ({ size = 24, className = "" }) => (
  <svg 
    viewBox="0 0 100 100" 
    width={size} 
    height={size} 
    className={className}
    fill="currentColor"
  >
    {/* Bell top */}
    <circle cx="50" cy="15" r="6" fill="currentColor" />
    {/* Bell body */}
    <path 
      d="M50 20 C50 20, 25 30, 20 60 C18 70, 20 80, 30 82 L70 82 C80 80, 82 70, 80 60 C75 30, 50 20, 50 20" 
      fill="currentColor"
    />
    {/* Bell clapper */}
    <circle cx="50" cy="88" r="8" fill="currentColor" />
    {/* Bell rim */}
    <ellipse cx="50" cy="82" rx="25" ry="5" fill="currentColor" />
  </svg>
);

// CPN-Maoist Centre Hammer & Sickle Symbol
export const MaoistHammerIcon = ({ size = 24, className = "" }) => (
  <svg 
    viewBox="0 0 100 100" 
    width={size} 
    height={size} 
    className={className}
    fill="currentColor"
  >
    {/* Hammer handle */}
    <rect x="45" y="35" width="10" height="55" rx="2" fill="currentColor" transform="rotate(-45 50 50)" />
    {/* Hammer head */}
    <rect x="30" y="20" width="40" height="18" rx="3" fill="currentColor" transform="rotate(-45 50 35)" />
    {/* Sickle blade */}
    <path 
      d="M70 25 Q90 45, 75 70 Q60 85, 40 85 L45 75 Q60 75, 70 60 Q80 45, 65 30 Z" 
      fill="currentColor"
    />
  </svg>
);

// RPP Crown Symbol
export const RPPCrownIcon = ({ size = 24, className = "" }) => (
  <svg 
    viewBox="0 0 100 100" 
    width={size} 
    height={size} 
    className={className}
    fill="currentColor"
  >
    {/* Crown base */}
    <rect x="15" y="70" width="70" height="15" rx="3" fill="currentColor" />
    {/* Crown body with peaks */}
    <path 
      d="M15 70 L20 35 L35 50 L50 25 L65 50 L80 35 L85 70 Z" 
      fill="currentColor"
    />
    {/* Crown jewels */}
    <circle cx="35" cy="55" r="5" fill="currentColor" opacity="0.5" />
    <circle cx="50" cy="40" r="6" fill="currentColor" opacity="0.5" />
    <circle cx="65" cy="55" r="5" fill="currentColor" opacity="0.5" />
  </svg>
);

// Generic Independent/Other Symbol
export const IndependentIcon = ({ size = 24, className = "" }) => (
  <svg 
    viewBox="0 0 100 100" 
    width={size} 
    height={size} 
    className={className}
    fill="currentColor"
  >
    {/* Person silhouette */}
    <circle cx="50" cy="25" r="15" fill="currentColor" />
    <path 
      d="M50 40 C30 45, 20 60, 20 85 L40 85 L40 60 L45 85 L55 85 L60 60 L60 85 L80 85 C80 60, 70 45, 50 40" 
      fill="currentColor"
    />
  </svg>
);

// Nepal Flag Shape (for branding)
export const NepalFlagIcon = ({ size = 24, className = "" }) => (
  <svg 
    viewBox="0 0 40 48" 
    width={size} 
    height={size * 1.2} 
    className={className}
  >
    <polygon points="0,0 40,16 0,32" fill="#D90429" />
    <polygon points="0,16 40,32 0,48" fill="#003049" />
    <circle cx="12" cy="12" r="4" fill="white" />
    <circle cx="12" cy="28" r="4" fill="white" />
  </svg>
);

// Map party symbol string to component
export const getPartyIcon = (symbolName, size = 24, color = "currentColor") => {
  const iconProps = { size, className: "" };
  
  switch(symbolName?.toLowerCase()) {
    case 'sun':
      return <UMLSunIcon {...iconProps} style={{ color }} />;
    case 'treedeciduous':
    case 'tree':
      return <CongressTreeIcon {...iconProps} style={{ color }} />;
    case 'bell':
      return <RSPBellIcon {...iconProps} style={{ color }} />;
    case 'gavel':
    case 'hammer':
      return <MaoistHammerIcon {...iconProps} style={{ color }} />;
    case 'crown':
      return <RPPCrownIcon {...iconProps} style={{ color }} />;
    default:
      return <IndependentIcon {...iconProps} style={{ color }} />;
  }
};

export default {
  UMLSunIcon,
  CongressTreeIcon,
  RSPBellIcon,
  MaoistHammerIcon,
  RPPCrownIcon,
  IndependentIcon,
  NepalFlagIcon,
  getPartyIcon,
};
