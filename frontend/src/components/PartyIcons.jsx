/**
 * Authentic Nepalese Political Party Icons
 * Based on official Election Commission Nepal allocated symbols
 */

// CPN-UML Sun Symbol (Red sun with radiating lines - like Nepal flag)
export const UMLSunIcon = ({ size = 24, className = "" }) => (
  <svg 
    viewBox="0 0 100 100" 
    width={size} 
    height={size} 
    className={className}
    fill="currentColor"
  >
    {/* Central sun circle */}
    <ellipse cx="50" cy="50" rx="18" ry="22" fill="currentColor" />
    {/* Radiating sun rays - many thin lines like the official symbol */}
    {[...Array(32)].map((_, i) => {
      const angle = (i * 11.25) * Math.PI / 180;
      const x1 = 50 + Math.cos(angle) * 26;
      const y1 = 50 + Math.sin(angle) * 26;
      const x2 = 50 + Math.cos(angle) * 48;
      const y2 = 50 + Math.sin(angle) * 48;
      return (
        <line 
          key={i}
          x1={x1} y1={y1} x2={x2} y2={y2} 
          stroke="currentColor" 
          strokeWidth={i % 2 === 0 ? "3" : "2"} 
          strokeLinecap="round"
        />
      );
    })}
  </svg>
);

// Nepali Congress Symbol (4 Stars in Diamond Pattern on Tree/Flag)
export const CongressTreeIcon = ({ size = 24, className = "" }) => (
  <svg 
    viewBox="0 0 100 100" 
    width={size} 
    height={size} 
    className={className}
    fill="currentColor"
  >
    {/* Flag background stripes */}
    <rect x="10" y="5" width="80" height="28" fill="currentColor" opacity="0.3" />
    <rect x="10" y="33" width="80" height="34" fill="white" stroke="currentColor" strokeWidth="1" />
    <rect x="10" y="67" width="80" height="28" fill="currentColor" opacity="0.3" />
    
    {/* 4 Stars in diamond pattern - the actual NC symbol */}
    <g fill="currentColor">
      {/* Top star */}
      <polygon points="50,38 52,44 58,44 53,48 55,54 50,50 45,54 47,48 42,44 48,44" />
      {/* Bottom star */}
      <polygon points="50,56 52,62 58,62 53,66 55,72 50,68 45,72 47,66 42,62 48,62" />
      {/* Left star */}
      <polygon points="32,47 34,53 40,53 35,57 37,63 32,59 27,63 29,57 24,53 30,53" />
      {/* Right star */}
      <polygon points="68,47 70,53 76,53 71,57 73,63 68,59 63,63 65,57 60,53 66,53" />
    </g>
  </svg>
);

// RSP Bell Symbol (Official Rastriya Swatantra Party Bell)
export const RSPBellIcon = ({ size = 24, className = "" }) => (
  <svg 
    viewBox="0 0 100 100" 
    width={size} 
    height={size} 
    className={className}
    fill="currentColor"
  >
    {/* Bell top loop */}
    <path d="M45 12 Q50 5, 55 12" stroke="currentColor" strokeWidth="4" fill="none" />
    {/* Bell top cap */}
    <ellipse cx="50" cy="18" rx="8" ry="5" fill="currentColor" />
    {/* Bell body - classic temple bell shape */}
    <path 
      d="M50 23 
         C35 28, 25 45, 22 65 
         Q20 75, 25 80 
         L75 80 
         Q80 75, 78 65 
         C75 45, 65 28, 50 23" 
      fill="currentColor"
    />
    {/* Bell rim */}
    <ellipse cx="50" cy="80" rx="28" ry="6" fill="currentColor" />
    {/* Bell clapper */}
    <line x1="50" y1="55" x2="50" y2="78" stroke="currentColor" strokeWidth="4" />
    <circle cx="50" cy="88" r="7" fill="currentColor" />
  </svg>
);

// CPN-Maoist Centre Hammer & Sickle (Classic communist symbol)
export const MaoistHammerIcon = ({ size = 24, className = "" }) => (
  <svg 
    viewBox="0 0 100 100" 
    width={size} 
    height={size} 
    className={className}
    fill="currentColor"
  >
    {/* Hammer handle */}
    <rect x="44" y="40" width="12" height="50" rx="2" fill="currentColor" transform="rotate(-45 50 65)" />
    {/* Hammer head */}
    <rect x="25" y="25" width="35" height="16" rx="2" fill="currentColor" transform="rotate(-45 42 33)" />
    
    {/* Sickle blade - curved */}
    <path 
      d="M62 20 
         C85 25, 90 50, 75 72 
         C65 85, 45 88, 35 82
         L40 74
         C48 78, 60 76, 68 65
         C78 50, 75 32, 58 28
         Z" 
      fill="currentColor"
    />
  </svg>
);

// RPP Crown Symbol (Rastriya Prajatantra Party - monarchist)
export const RPPCrownIcon = ({ size = 24, className = "" }) => (
  <svg 
    viewBox="0 0 100 100" 
    width={size} 
    height={size} 
    className={className}
    fill="currentColor"
  >
    {/* Crown base band */}
    <rect x="15" y="70" width="70" height="12" rx="2" fill="currentColor" />
    {/* Crown body with 5 points */}
    <path 
      d="M15 70 
         L18 40 L30 55 
         L40 30 L50 50 
         L60 30 L70 55 
         L82 40 L85 70 Z" 
      fill="currentColor"
    />
    {/* Crown jewels/dots */}
    <circle cx="30" cy="58" r="4" fill="currentColor" opacity="0.4" />
    <circle cx="50" cy="52" r="5" fill="currentColor" opacity="0.4" />
    <circle cx="70" cy="58" r="4" fill="currentColor" opacity="0.4" />
    {/* Top center jewel */}
    <circle cx="50" cy="38" r="4" fill="currentColor" opacity="0.5" />
  </svg>
);

// Generic Independent/Other Symbol (Person silhouette)
export const IndependentIcon = ({ size = 24, className = "" }) => (
  <svg 
    viewBox="0 0 100 100" 
    width={size} 
    height={size} 
    className={className}
    fill="currentColor"
  >
    {/* Person head */}
    <circle cx="50" cy="25" r="18" fill="currentColor" />
    {/* Person body */}
    <path 
      d="M50 43 
         C30 48, 18 65, 18 90 
         L35 90 L38 65 L45 90 
         L55 90 L62 65 L65 90 
         L82 90 
         C82 65, 70 48, 50 43" 
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
    {/* Moon symbol */}
    <circle cx="12" cy="10" r="5" fill="white" />
    <circle cx="14" cy="9" r="3" fill="#D90429" />
    {/* Sun symbol */}
    <circle cx="12" cy="26" r="4" fill="white" />
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
