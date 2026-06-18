import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Kicker({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`kicker text-acc ${className}`}>{children}</div>;
}

export function Card({ children, className = '', elevated = false }: { children: ReactNode; className?: string; elevated?: boolean }) {
  return (
    <div
      className={`rounded-2xl border border-line ${elevated ? 'bg-surf2' : 'bg-surf'} ${className}`}
    >
      {children}
    </div>
  );
}

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  full?: boolean;
}

export function Button({ variant = 'primary', full, className = '', children, ...rest }: BtnProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all active:scale-[0.98] disabled:opacity-40 disabled:active:scale-100';
  const variants: Record<string, string> = {
    primary: 'bg-acc text-ink hover:brightness-110',
    ghost: 'bg-transparent text-mut hover:text-cream',
    outline: 'border border-line bg-transparent text-cream hover:bg-surf2',
  };
  return (
    <button className={`${base} ${variants[variant]} ${full ? 'w-full' : ''} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function Avatar({ initial, size = 40, accent = false }: { initial: string; size?: number; accent?: boolean }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-grotesk font-bold ${
        accent ? 'bg-acc text-ink' : 'bg-surf2 text-cream border border-line'
      }`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {initial}
    </div>
  );
}
