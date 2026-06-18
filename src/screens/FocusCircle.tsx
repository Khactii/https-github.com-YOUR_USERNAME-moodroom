import { ArrowLeft, Flame, Swords, UserPlus } from 'lucide-react';
import { Avatar, Button, Card, Kicker } from '../components/ui';
import { useStore } from '../state/store';

export function FocusCircle({ onBack, onBoss }: { onBack: () => void; onBoss: () => void }) {
  const { circleRanked, circleName, me } = useStore();

  const members = circleRanked.map((r) => r.user);
  const combinedMinutes = members.reduce((s, u) => s + u.weeklyMinutes, 0);
  const bestStreak = members.reduce((m, u) => Math.max(m, u.currentStreak), 0);
  const combinedHours = (combinedMinutes / 60).toFixed(0);

  return (
    <div className="absolute inset-0 z-20 flex flex-col overflow-y-auto bg-ink p-5 pb-8">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 self-start pt-2 text-sm text-mut hover:text-cream">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mt-3">
        <Kicker>Your Focus Circle</Kicker>
        <h1 className="mt-1 font-grotesk text-3xl font-bold">{circleName}</h1>
        <p className="mt-1 text-sm text-mut">{members.length} members locking in together this week.</p>
      </div>

      {/* Crew stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Card elevated className="p-4">
          <div className="kicker text-faint">Combined this week</div>
          <div className="stat-num mt-1 text-3xl">{combinedHours}h</div>
        </Card>
        <Card elevated className="p-4">
          <div className="kicker flex items-center gap-1.5 text-faint">
            <Flame size={13} className="text-acc" /> Best flame
          </div>
          <div className="stat-num mt-1 text-3xl">{bestStreak}d</div>
        </Card>
      </div>

      {/* Mini leaderboard */}
      <div className="mt-6">
        <Kicker className="text-mut">Crew standings</Kicker>
        <div className="mt-3 space-y-2">
          {circleRanked.map((row) => {
            const isMe = row.user.id === me?.id;
            return (
              <div
                key={row.user.id}
                className={`flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 ${
                  isMe ? 'border-acc bg-acc-soft' : 'border-line bg-surf'
                }`}
              >
                <span className={`w-5 text-center stat-num ${isMe ? 'text-acc' : 'text-mut'}`}>{row.rank}</span>
                <Avatar initial={row.user.initial} size={34} accent={isMe} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-grotesk text-sm font-semibold">
                    @{row.user.username} {isMe && <span className="kicker text-acc">· you</span>}
                  </div>
                  <div className="mono text-[11px] text-faint">{(row.user.weeklyMinutes / 60).toFixed(1)}h · {row.user.level}</div>
                </div>
                <div className="inline-flex items-center gap-1">
                  <Flame size={13} className={row.user.currentStreak > 0 ? 'text-acc' : 'text-faint'} fill={row.user.currentStreak > 0 ? 'var(--acc)' : 'none'} />
                  <span className="stat-num text-sm">{row.user.currentStreak}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <Button full onClick={onBoss} className="py-4">
          <Swords size={18} /> Start a Boss Battle
        </Button>
        <Button full variant="outline" onClick={() => alert('Invite links are stubbed in this prototype.')} className="py-4">
          <UserPlus size={18} /> Invite to crew
        </Button>
      </div>
    </div>
  );
}
