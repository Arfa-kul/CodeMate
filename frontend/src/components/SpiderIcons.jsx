export function SpiderLogo({ className = "w-6 h-6 text-[#E62429]" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* Sleek cyber spider glyph */}
      <circle cx="12" cy="12" r="3.2" fill="currentColor" fillOpacity="0.25" stroke="currentColor" />
      <path d="M12 5V2" />
      <path d="M12 22V19" />
      <path d="M9 10L4 6" />
      <path d="M15 10L20 6" />
      <path d="M9 14L4 18" />
      <path d="M15 14L20 18" />
      <path d="M8.5 12H3" />
      <path d="M21 12H15.5" />
    </svg>
  );
}

export function WebGridGraphic({ className = "w-48 h-48" }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <radialGradient id="spiderGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E62429" stopOpacity="0.35" />
          <stop offset="70%" stopColor="#E62429" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#E62429" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="92" fill="url(#spiderGlow)" />
      
      {/* Outer Web Rings */}
      <polygon points="100,10 165,35 190,100 165,165 100,190 35,165 10,100 35,35" stroke="#E62429" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="3 3" />
      <polygon points="100,30 150,50 170,100 150,150 100,170 50,150 30,100 50,50" stroke="#E62429" strokeWidth="1.2" strokeOpacity="0.45" />
      <polygon points="100,55 132,68 145,100 132,132 100,145 68,132 55,100 68,68" stroke="#FF3B45" strokeWidth="1.2" strokeOpacity="0.65" />
      <polygon points="100,75 118,82 125,100 118,118 100,125 82,118 75,100 82,82" stroke="#FF3B45" strokeWidth="1.4" strokeOpacity="0.85" />
      
      {/* Web Radial Spokes */}
      <line x1="100" y1="10" x2="100" y2="190" stroke="#E62429" strokeWidth="1.2" strokeOpacity="0.45" />
      <line x1="10" y1="100" x2="190" y2="100" stroke="#E62429" strokeWidth="1.2" strokeOpacity="0.45" />
      <line x1="35" y1="35" x2="165" y2="165" stroke="#E62429" strokeWidth="1.2" strokeOpacity="0.45" />
      <line x1="165" y1="35" x2="35" y2="165" stroke="#E62429" strokeWidth="1.2" strokeOpacity="0.45" />

      {/* Center glowing core emblem */}
      <circle cx="100" cy="100" r="10" fill="#E62429" fillOpacity="0.3" stroke="#FF3B45" strokeWidth="2" />
      <circle cx="100" cy="100" r="4" fill="#FFFFFF" />
    </svg>
  );
}

export function WebIcon({ className = "w-4 h-4" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07" strokeOpacity="0.5" />
      <circle cx="12" cy="12" r="6" stroke="currentColor" strokeOpacity="0.8" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
  );
}

export function HudCorner({ position = "top-left", className = "w-3 h-3 text-[#E62429]" }) {
  const rotation = {
    "top-left": "rotate-0",
    "top-right": "rotate-90",
    "bottom-right": "rotate-180",
    "bottom-left": "-rotate-90",
  }[position] || "rotate-0";

  return (
    <svg viewBox="0 0 12 12" fill="none" className={`${className} ${rotation} pointer-events-none`}>
      <path d="M1 11V1H11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
