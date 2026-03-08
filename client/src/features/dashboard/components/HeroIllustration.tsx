/** Lightweight SVG placeholder - collaboration / achievement theme */
export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 280 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-24 w-full max-w-[200px] shrink-0 opacity-90 md:h-32 md:max-w-[280px]"
      aria-hidden
    >
      {/* High-five figures */}
      <circle cx="50" cy="75" r="12" fill="currentColor" className="text-primary/40" />
      <circle cx="50" cy="50" r="8" fill="currentColor" className="text-primary/50" />
      <path
        d="M42 58 L46 54 L50 58 L54 54 L58 58"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-primary/60"
      />
      <circle cx="90" cy="75" r="12" fill="currentColor" className="text-primary/30" />
      <circle cx="90" cy="50" r="8" fill="currentColor" className="text-primary/40" />
      <path
        d="M82 58 L86 54 L90 58 L94 54 L98 58"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-primary/50"
      />
      <circle cx="70" cy="65" r="10" fill="currentColor" className="text-primary/35" />
      <circle cx="70" cy="42" r="6" fill="currentColor" className="text-primary/45" />
      {/* Mountain + flag */}
      <path
        d="M140 100 L200 40 L260 100 Z"
        fill="currentColor"
        className="text-primary/20"
      />
      <path
        d="M180 100 L220 60 L260 100 Z"
        fill="currentColor"
        className="text-primary/25"
      />
      <line
        x1="220"
        y1="60"
        x2="220"
        y2="25"
        stroke="currentColor"
        strokeWidth="2"
        className="text-primary/50"
      />
      <path
        d="M220 25 L235 35 L220 30 L205 35 Z"
        fill="currentColor"
        className="text-primary"
      />
      {/* Climber figures */}
      <circle cx="190" cy="55" r="6" fill="currentColor" className="text-primary/60" />
      <path
        d="M190 61 L190 75 L185 85"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-primary/50"
      />
      <path
        d="M190 70 L200 80"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-primary/50"
      />
      <circle cx="245" cy="65" r="6" fill="currentColor" className="text-primary/60" />
      <path
        d="M245 71 L245 82 L250 90"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-primary/50"
      />
      <path
        d="M245 76 L238 86"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="text-primary/50"
      />
    </svg>
  );
}
