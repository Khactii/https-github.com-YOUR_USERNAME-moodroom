import { useState } from 'react';
import { ArrowLeft, Check, Snowflake, Sparkles, BarChart3, Swords, Palette } from 'lucide-react';
import { Button, Card, Kicker } from '../components/ui';

const FEATURES = [
  { icon: Snowflake, title: 'Unlimited freezes', desc: 'Bank more than one — never lose a flame to real life.' },
  { icon: BarChart3, title: 'Deep stats', desc: 'Heatmaps, focus trends, and your best hours.' },
  { icon: Sparkles, title: 'Atlas, unlimited', desc: 'Your AI coach, on demand — plans and nudges.' },
  { icon: Swords, title: 'Unlimited boss battles', desc: 'Challenge anyone, any time, ranked.' },
  { icon: Palette, title: 'Custom vibes', desc: 'The full binaural + soundscape library.' },
];

export function Paywall({ onBack }: { onBack: () => void }) {
  const [plan, setPlan] = useState<'annual' | 'monthly'>('annual');

  return (
    <div className="absolute inset-0 z-30 flex flex-col overflow-y-auto bg-ink p-5 pb-8">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 self-start pt-2 text-sm text-mut hover:text-cream">
        <ArrowLeft size={16} /> Not now
      </button>

      <div className="mt-3">
        <Kicker>WERC Pro</Kicker>
        <h1 className="mt-1 font-grotesk text-3xl font-bold leading-tight">
          Protect the flame.
          <br />
          <span className="text-acc">Go further.</span>
        </h1>
        <p className="mt-2 text-sm text-mut">The work is free. Pro is for the people who've made locking in their identity.</p>
      </div>

      <div className="mt-5 space-y-2.5">
        {FEATURES.map((f) => (
          <Card key={f.title} className="flex items-start gap-3 p-3.5">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-acc-soft">
              <f.icon size={17} className="text-acc" />
            </div>
            <div>
              <div className="font-grotesk font-semibold">{f.title}</div>
              <div className="text-sm text-mut">{f.desc}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Plan toggle */}
      <div className="mt-6 grid grid-cols-2 gap-2">
        <button
          onClick={() => setPlan('annual')}
          className={`rounded-2xl border p-4 text-left transition-all ${plan === 'annual' ? 'border-acc bg-acc-soft' : 'border-line bg-surf'}`}
        >
          <div className="flex items-center justify-between">
            <span className="kicker text-mut">Annual</span>
            {plan === 'annual' && <Check size={15} className="text-acc" />}
          </div>
          <div className="stat-num mt-1 text-2xl">$59<span className="text-base text-faint">/yr</span></div>
          <div className="kicker mt-0.5 text-acc">Save 50%</div>
        </button>
        <button
          onClick={() => setPlan('monthly')}
          className={`rounded-2xl border p-4 text-left transition-all ${plan === 'monthly' ? 'border-acc bg-acc-soft' : 'border-line bg-surf'}`}
        >
          <div className="flex items-center justify-between">
            <span className="kicker text-mut">Monthly</span>
            {plan === 'monthly' && <Check size={15} className="text-acc" />}
          </div>
          <div className="stat-num mt-1 text-2xl">$9<span className="text-base text-faint">/mo</span></div>
          <div className="kicker mt-0.5 text-faint">Flexible</div>
        </button>
      </div>

      <div className="mt-6">
        <Button full onClick={() => alert('Payments are stubbed in this prototype — nothing is gated.')} className="py-4 text-base">
          Start 7-day free trial
        </Button>
        <p className="mt-3 text-center text-xs text-faint">Prototype: payments are stubbed and nothing is gated.</p>
      </div>
    </div>
  );
}
