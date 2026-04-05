interface LogoProps {
  size?: number;
  className?: string;
  variant?: "full" | "icon";
}

export function Logo({ size = 48, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="100" cy="100" r="100" fill="#14532d" />
      <circle cx="100" cy="100" r="92" fill="#1b6b3a" />

      {/* Decorative crescent */}
      <path
        d="M130 45c-25 0-45 20-45 45s20 45 45 45c-5 2-12 3-18 3-28 0-50-22-50-48s22-48 50-48c6 0 13 1 18 3z"
        fill="#c9952b"
        opacity="0.25"
      />

      {/* Mosque silhouette */}
      <path
        d="M60 130h80v10H60z"
        fill="white"
        opacity="0.15"
      />
      <path
        d="M100 70c-6 0-10 8-10 18h20c0-10-4-18-10-18z"
        fill="#c9952b"
        opacity="0.3"
      />

      {/* Text: AEMUL */}
      <text
        x="100"
        y="108"
        textAnchor="middle"
        fontFamily="serif"
        fontWeight="800"
        fontSize="42"
        letterSpacing="3"
      >
        <tspan fill="white">AEM</tspan>
        <tspan fill="#e6b94d">UL</tspan>
      </text>

      {/* Subtitle */}
      <text
        x="100"
        y="128"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontWeight="500"
        fontSize="9.5"
        fill="white"
        opacity="0.7"
        letterSpacing="1.5"
      >
        ÉTUDIANTS MUSULMANS
      </text>
      <text
        x="100"
        y="140"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontWeight="500"
        fontSize="9.5"
        fill="white"
        opacity="0.7"
        letterSpacing="1.5"
      >
        UNIVERSITÉ LAVAL
      </text>

      {/* Gold ring accent */}
      <circle cx="100" cy="100" r="95" stroke="#c9952b" strokeWidth="1.5" opacity="0.4" />
      <circle cx="100" cy="100" r="88" stroke="#c9952b" strokeWidth="0.5" opacity="0.2" />
    </svg>
  );
}

export function LogoText({ className = "" }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-tight ${className}`}>
      <span className="text-primary">AEM</span>
      <span className="text-[var(--gold)]">UL</span>
    </span>
  );
}
