import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 48, className = "" }: LogoProps) {
  return (
    <Image
      src="/logo-aemul.jpg"
      alt="Logo AEMUL"
      width={size}
      height={size}
      className={`object-cover ${className}`}
      priority
    />
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
