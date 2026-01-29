"use client";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className = "", size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: 20, text: "text-base" },
    md: { icon: 24, text: "text-lg" },
    lg: { icon: 32, text: "text-2xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex shrink-0 items-center justify-center" style={{ width: icon, height: icon }}>
        <svg
          width={icon}
          height={icon}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 4H21C23.2091 4 25 5.79086 25 8V11C25 13.2091 23.2091 15 21 15H8V4Z"
            fill="white"
          />
          <path
            d="M8 17H21C23.2091 17 25 18.7909 25 21V24C25 26.2091 23.2091 28 21 28H8V17Z"
            fill="white"
            fillOpacity="0.6"
          />
          <rect x="8" y="4" width="4" height="24" fill="white" />
        </svg>
      </div>
      {showText && (
        <span className={`font-bold tracking-tight text-white uppercase ${text}`}>
          Beesto
        </span>
      )}
    </div>
  );
}

export function LogoIcon({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <div className={`relative flex shrink-0 items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 4H21C23.2091 4 25 5.79086 25 8V11C25 13.2091 23.2091 15 21 15H8V4Z"
          fill="white"
        />
        <path
          d="M8 17H21C23.2091 17 25 18.7909 25 21V24C25 26.2091 23.2091 28 21 28H8V17Z"
          fill="white"
          fillOpacity="0.6"
        />
        <rect x="8" y="4" width="4" height="24" fill="white" />
      </svg>
    </div>
  );
}
