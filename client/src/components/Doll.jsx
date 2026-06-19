export const Doll = ({ className = "" }) => (
  <svg
    viewBox="0 0 200 220"
    className={className}
    role="img"
    aria-label="A small character resting"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <style>{`
      @keyframes doll-sway { 0%,100% { transform: rotate(-2.5deg); } 50% { transform: rotate(2.5deg); } }
      @keyframes doll-blink { 0%,92%,100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
      @keyframes doll-z { 0% { opacity: 0; transform: translateY(6px) scale(0.8); } 40% { opacity: 1; } 100% { opacity: 0; transform: translateY(-16px) scale(1.1); } }
      .doll-body { transform-origin: 100px 200px; animation: doll-sway 5s ease-in-out infinite; }
      .doll-eye { transform-origin: center; animation: doll-blink 5.5s ease-in-out infinite; }
      .doll-z1 { animation: doll-z 3s ease-in-out infinite; }
      .doll-z2 { animation: doll-z 3s ease-in-out infinite 1s; }
      @media (prefers-reduced-motion: reduce) {
        .doll-body, .doll-eye, .doll-z1, .doll-z2 { animation: none; }
        .doll-z1, .doll-z2 { opacity: 0.7; }
      }
    `}</style>

    <ellipse cx="100" cy="205" rx="52" ry="9" fill="#14171D" />

    <g className="doll-body">
      <rect x="62" y="120" width="76" height="66" rx="26" fill="#1B1F26" stroke="#2a3038" strokeWidth="2" />
      <rect x="68" y="150" width="64" height="30" rx="14" fill="#14171D" />

      <circle cx="100" cy="86" r="46" fill="#1B1F26" stroke="#2a3038" strokeWidth="2" />
      <path d="M70 60 q30 -26 60 0" stroke="#4FD1C5" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.85" />

      <g className="doll-eye">
        <circle cx="84" cy="88" r="5.5" fill="#4FD1C5" />
        <circle cx="116" cy="88" r="5.5" fill="#4FD1C5" />
      </g>
      <path d="M92 104 q8 6 16 0" stroke="#98A0AC" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="74" cy="98" r="4" fill="#E3B873" opacity="0.5" />
      <circle cx="126" cy="98" r="4" fill="#E3B873" opacity="0.5" />

      <rect x="44" y="132" width="22" height="11" rx="5.5" fill="#1B1F26" stroke="#2a3038" strokeWidth="2" />
      <rect x="134" y="132" width="22" height="11" rx="5.5" fill="#1B1F26" stroke="#2a3038" strokeWidth="2" />
    </g>

    <text className="doll-z1" x="150" y="70" fill="#98A0AC" fontFamily="JetBrains Mono, monospace" fontSize="16">z</text>
    <text className="doll-z2" x="162" y="56" fill="#98A0AC" fontFamily="JetBrains Mono, monospace" fontSize="12">z</text>
  </svg>
);
