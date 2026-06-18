import { Home, Rss, Trophy, User } from 'lucide-react';
import type { Tab } from '../types';

const TABS: { id: Tab; label: string; Icon: typeof Home }[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'feed', label: 'Feed', Icon: Rss },
  { id: 'leaderboard', label: 'Rank', Icon: Trophy },
  { id: 'profile', label: 'Profile', Icon: User },
];

export function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-20 border-t border-line bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-[420px] items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {TABS.map(({ id, label, Icon }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition-colors ${
                on ? 'text-acc' : 'text-faint hover:text-mut'
              }`}
            >
              <Icon size={21} strokeWidth={on ? 2.5 : 1.75} fill={on && id === 'leaderboard' ? 'var(--acc-soft)' : 'none'} />
              <span className="kicker text-[10px]">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
