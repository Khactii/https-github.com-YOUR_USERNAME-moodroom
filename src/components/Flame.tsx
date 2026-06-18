import { Flame as FlameIcon, Snowflake } from 'lucide-react';

export function StreakFlame({
  streak,
  freezes = 0,
  size = 'md',
}: {
  streak: number;
  freezes?: number;
  size?: 'sm' | 'md' | 'lg';
}) {
  const alive = streak > 0;
  const dims = { sm: 16, md: 22, lg: 40 }[size];
  const text = { sm: 'text-base', md: 'text-xl', lg: 'text-5xl' }[size];
  return (
    <div className="inline-flex items-center gap-1.5">
      <FlameIcon
        size={dims}
        className={alive ? 'text-acc animate-flame-pulse' : 'text-faint'}
        fill={alive ? 'var(--acc)' : 'none'}
        strokeWidth={1.75}
      />
      <span className={`stat-num ${text} ${alive ? 'text-cream' : 'text-faint'}`}>{streak}</span>
      {freezes > 0 && (
        <Snowflake size={size === 'lg' ? 18 : 13} className="text-cream/70 ml-0.5" aria-label="streak freeze banked" />
      )}
    </div>
  );
}
