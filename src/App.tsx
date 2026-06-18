import { useState } from 'react';
import { StoreProvider, useStore } from './state/store';
import { Onboarding } from './screens/Onboarding';
import { Home } from './screens/Home';
import { ActiveSession } from './screens/ActiveSession';
import { SessionComplete, type RewardResult } from './screens/SessionComplete';
import { Profile } from './screens/Profile';
import { Feed } from './screens/Feed';
import { Leaderboard } from './screens/Leaderboard';
import { FocusCircle } from './screens/FocusCircle';
import { BossBattle } from './screens/BossBattle';
import { Paywall } from './screens/Paywall';
import { TabBar } from './components/TabBar';
import type { FinishSessionArgs } from './state/store';
import type { SessionConfig, Tab, View } from './types';

const TABS: Tab[] = ['home', 'feed', 'leaderboard', 'profile'];

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
    setResult(finishSession(args));
    setView('complete');
  };

  // Full-screen flow & flex views hide the tab bar (each has its own back affordance).
  if (view === 'active') {
    return cfg ? <ActiveSession cfg={cfg} onFinish={finish} onAbort={() => setView('home')} /> : null;
  }
  if (view === 'complete') {
    return result ? <SessionComplete result={result} onDone={() => setView('home')} /> : null;
  }
  if (view === 'circle') return <FocusCircle onBack={() => setView('home')} onBoss={() => setView('boss')} />;
  if (view === 'boss') return <BossBattle onBack={() => setView('circle')} />;
  if (view === 'paywall') return <Paywall onBack={() => setView('profile')} />;

  const tab = view as Tab;
  return (
    <>
      <div className="min-h-full">
        {tab === 'home' && <Home onLockIn={lockIn} onProfile={() => setView('profile')} onCircle={() => setView('circle')} />}
        {tab === 'feed' && <Feed />}
        {tab === 'leaderboard' && <Leaderboard />}
        {tab === 'profile' && (
          <Profile onBack={() => setView('home')} onCircle={() => setView('circle')} onPro={() => setView('paywall')} />
        )}
      </div>
      <TabBar active={TABS.includes(tab) ? tab : 'home'} onChange={(t) => setView(t)} />
    </>
  );
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
