import { useState } from 'react';
import { StoreProvider, useStore } from './state/store';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { ActiveSession } from './screens/ActiveSession';
import { SessionComplete, type RewardResult } from './screens/SessionComplete';
import { Profile } from './screens/Profile';
import type { FinishSessionArgs } from './state/store';
import type { SessionConfig, View } from './types';

function Shell() {
  const { ready, onboarded, finishSession } = useStore();
  const [view, setView] = useState<View>('home');
  const [cfg, setCfg] = useState<SessionConfig | null>(null);
  const [result, setResult] = useState<RewardResult | null>(null);

  if (!ready) {
    return <div className="flex min-h-full items-center justify-center text-faint mono text-sm">loading…</div>;
  }

  if (!onboarded) return <Onboarding />;

  const lockIn = (config: SessionConfig) => {
    setCfg(config);
    setView('active');
  };

  const finish = (args: FinishSessionArgs) => {
    const res = finishSession(args);
    setResult(res);
    setView('complete');
  };

  switch (view) {
    case 'active':
      return cfg ? <ActiveSession cfg={cfg} onFinish={finish} onAbort={() => setView('home')} /> : <Home onLockIn={lockIn} onProfile={() => setView('profile')} />;
    case 'complete':
      return result ? <SessionComplete result={result} onDone={() => setView('home')} /> : <Home onLockIn={lockIn} onProfile={() => setView('profile')} />;
    case 'profile':
      return <Profile onBack={() => setView('home')} />;
    case 'home':
    default:
      return <Home onLockIn={lockIn} onProfile={() => setView('profile')} />;
  }
}

export default function App() {
  return (
    <StoreProvider>
      {/* Mobile-first phone frame; responsive to a centered column on desktop. */}
      <div className="flex min-h-full justify-center bg-black sm:py-6">
        <div className="no-scrollbar relative w-full max-w-[420px] overflow-y-auto bg-ink sm:rounded-[2.25rem] sm:border sm:border-line sm:shadow-2xl" style={{ minHeight: '100dvh' }}>
          <Shell />
        </div>
      </div>
    </StoreProvider>
  );
}
