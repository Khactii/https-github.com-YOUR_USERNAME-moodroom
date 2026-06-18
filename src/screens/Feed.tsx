import { useMemo } from 'react';
import { Flame, Lock } from 'lucide-react';
import { Avatar, Card, Kicker } from '../components/ui';
import { useStore } from '../state/store';
import { timeAgo } from '../utils';
import type { Session, User } from '../engine';

export function Feed() {
  const { sessions, users, me } = useStore();

  const byId = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  // Public feed = verified sessions, most recent first. Every entry is social proof.
  const entries = useMemo(
    () =>
      sessions
        .filter((s) => s.verified)
        .slice()
        .sort((a, b) => new Date(b.endedAt).getTime() - new Date(a.endedAt).getTime()),
    [sessions],
  );

  return (
    <div className="flex min-h-full flex-col p-5 pb-28">
      <div className="pt-2">
        <Kicker>Live</Kicker>
        <h1 className="mt-1 font-grotesk text-3xl font-bold">Feed</h1>
        <p className="mt-1 text-sm text-mut">People locking in right now. Proof that the work gets done.</p>
      </div>

      <div className="mt-5 space-y-3">
        {entries.map((s) => (
          <FeedItem key={s.id} session={s} author={byId.get(s.userId)} isMe={s.userId === me?.id} />
        ))}
        {entries.length === 0 && (
          <p className="mt-10 text-center text-sm text-faint">No sessions yet. Lock in to be the first.</p>
        )}
      </div>
    </div>
  );
}

function FeedItem({ session, author, isMe }: { session: Session; author?: User; isMe: boolean }) {
  if (!author) return null;
  return (
    <Card className={`p-4 ${isMe ? 'border-acc/40' : ''}`}>
      <div className="flex items-center gap-3">
        <Avatar initial={author.initial} size={40} accent={isMe} />
        <div className="min-w-0 flex-1">
          <div className="font-grotesk">
            <span className="font-semibold">@{author.username}</span>
            <span className="text-mut"> locked in {session.actualMin}m</span>
          </div>
          <div className="mono text-[11px] text-faint">{timeAgo(session.endedAt)}</div>
        </div>
        <div className="text-right">
          <div className="stat-num text-lg text-acc">+{session.xpEarned}</div>
          <div className="kicker text-[9px] text-faint">XP</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-ink/40 px-3 py-2">
        <Lock size={13} className="text-faint" />
        <span className="truncate text-sm text-cream">{session.intention}</span>
      </div>

      <div className="mt-2.5 flex items-center gap-4 text-xs text-faint">
        {author.currentStreak > 0 && (
          <span className="inline-flex items-center gap-1">
            <Flame size={13} className="text-acc" fill="var(--acc)" /> Day {author.currentStreak}
          </span>
        )}
        <span className="mono">{session.vibe}</span>
      </div>
    </Card>
  );
}
