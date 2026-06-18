import { useState } from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { Button, Kicker } from '../components/ui';
import { useStore } from '../state/store';

export function Onboarding() {
  const { onboard } = useStore();
  const [name, setName] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    onboard(name);
  };

  return (
    <div className="flex min-h-full flex-col justify-between p-7">
      <div className="pt-10">
        <div className="flex items-center gap-2">
          <Lock size={20} className="text-acc" strokeWidth={2.5} />
          <span className="mono text-lg font-bold tracking-[0.2em]">WERC</span>
        </div>
        <p className="kicker mt-1 text-faint">/wɜːk/ · deep work, rewarded</p>
      </div>

      <div className="py-8">
        <Kicker>Welcome</Kicker>
        <h1 className="mt-3 font-grotesk text-4xl font-bold leading-[1.05]">
          Lock in.
          <br />
          Get rewarded the
          <br />
          <span className="text-acc">second you finish.</span>
        </h1>
        <p className="mt-4 max-w-[300px] text-[15px] leading-relaxed text-mut">
          Strava made a run something you post. WERC makes deep work something you post. Pick a name —
          you start as a <span className="text-cream">Novice</span>. Lock in to climb.
        </p>

        <div className="mt-8">
          <label className="kicker text-mut">Your handle</label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="e.g. chris"
            maxLength={18}
            className="mt-2 w-full rounded-2xl border border-line bg-surf px-4 py-4 font-grotesk text-lg text-cream outline-none placeholder:text-faint focus:border-acc"
          />
        </div>
      </div>

      <div className="pb-6">
        <Button full disabled={!name.trim()} onClick={submit} className="py-4 text-base">
          Become a Novice <ArrowRight size={18} />
        </Button>
        <p className="mt-3 text-center text-xs text-faint">
          We reward committed, phone-free time — never just opening the app.
        </p>
      </div>
    </div>
  );
}
