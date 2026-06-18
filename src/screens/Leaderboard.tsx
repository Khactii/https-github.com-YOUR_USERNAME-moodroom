import { useState } from 'react';
import { Flame } from 'lucide-react';
import { Avatar, Kicker } from '../components/ui';
import { useStore } from '../state/store';
import { startOfWeek, weeklyScore, type RankedUser } from '../engine';

type Scope = 'global' | 'circle';

function Row({ row, isMe }: { row: RankedUser; isMe: boolean }) {
  const { user, rank, score } = row;
  const hours = (user.weeklyMinutes / 60).toFixed(1);
  const medal = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : null;
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border px-3.5 py-3 ${
        isMe ? 'border-acc bg-acc-soft' : 'border-line bg-surf'
      }`}
    >
      <div className={`w-7 text-center stat-num text-lg ${isMe ? 'text-acc' : 'text-mut'}`}>
        {medal ?? rank}
      </div>
      <Avatar initial={user.initial} size={38} accent={isMe} />
      <div className="min-w-0 flex-1">
        <div className="truncate font-grotesk font-semibold">
          @{user.username} {isMe && <span className="kicker text-acc">· you</span>}
        </div>
        <div className="mono text-[11px] text-faint">
          {hours}h this week · {user.level}
        </div>
      </div>
      <div className="flex items-center gap-3 text-right">
        <div className="inline-flex items-center gap-1">
          <Flame size={14} className={user.currentStreak > 0 ? 'text-acc' : 'text-faint'} fill={user.currentStreak > 0 ? 'var(--acc)' : 'none'} />
          <span className="stat-num text-sm">{user.currentStreak}</span>
        </div>
        <div className="w-12">
          <div className="stat-num text-base leading-none">{score}</div>
          <div className="kicker text-[9px] text-faint">score</div>
        </div>
      </div>
    </div>
  );
}

export function Leaderboard() {
  const { ranked, circleRanked, circleName, me } = useStore();
  const [scope, setScope] = useState<Scope>('global');
  const rows = scope === 'global' ? ranked : circleRanked;
  const myRow = rows.find((r) => r.user.id === me?.id);

  return (
    <div className="flex min-h-full flex-col p-5 pb-28">
      <div className="pt-2">
        <Kicker>Weekly · resets Monday</Kicker>
        <h1 className="mt-1 font-grotesk text-3xl font-bold">Leaderboard</h1>
        <p className="mt-1 text-sm text-mut">
          Consistency-weighted: minutes worked + your streak. One long session can't dominate.
        </p>
      </div>

      {/* Scope tabs */}
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-line bg-surf p-1">
        {(['global', 'circle'] as Scope[]).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`rounded-xl py-2.5 text-sm font-semibold transition-colors ${
              scope === s ? 'bg-acc-soft text-acc' : 'text-mut hover:text-cream'
            }`}
          >
            {s === 'global' ? 'Global' : circleName}
          </button>
        ))}
      </div>

      {/* Your standing */}
      {myRow && (
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-surf2 px-4 py-3">
          <div>
            <div className="kicker text-faint">Your standing</div>
            <div className="stat-num text-2xl text-acc">#{myRow.rank}</div>
          </div>
          <div className="text-right">
            <div className="kicker text-faint">Weekly score</div>
            <div className="stat-num text-2xl">{weeklyScore(myRow.user)}</div>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <Row key={row.user.id} row={row} isMe={row.user.id === me?.id} />
        ))}
      </div>

      <p className="mt-5 text-center text-xs text-faint">Week of {startOfWeek()} · only verified, phone-free time counts.</p>
    </div>
  );
}
