import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Home, PieChart, Plus, Wallet, Target, Settings } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { PageId } from '@/types';

const TABS = [
  { id: 'home' as PageId, label: '首页', icon: Home },
  { id: 'stats' as PageId, label: '统计', icon: PieChart },
  { id: 'record' as PageId, label: '记账', icon: Plus, center: true },
  { id: 'accounts' as PageId, label: '账户', icon: Wallet },
  { id: 'budget' as PageId, label: '预算', icon: Target },
  { id: 'settings' as PageId, label: '设置', icon: Settings },
];

export default function BottomNav() {
  const activePage = useStore((s) => s.activePage);
  const setActivePage = useStore((s) => s.setActivePage);

  const centerIndex = TABS.findIndex((t) => 'center' in t && t.center);
  const leftTabs = TABS.slice(0, centerIndex);
  const centerTab = TABS[centerIndex];
  const rightTabs = TABS.slice(centerIndex + 1);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-md mx-auto pb-3 pt-2 px-4 pointer-events-auto">
        <div
          className="bg-white/90 backdrop-blur-xl rounded-3xl h-16 flex items-center px-1 border border-white/60"
          style={{ boxShadow: '0 8px 32px rgba(217,119,6,0.15)' }}
        >
          {leftTabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              active={activePage === tab.id}
              onClick={() => setActivePage(tab.id)}
            />
          ))}

          {centerTab && (
            <div className="flex flex-col items-center justify-center">
              <button
                onClick={() => setActivePage(centerTab.id)}
                className={twMerge(
                  clsx(
                    '-mt-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-cream-400 to-cream-500 flex items-center justify-center text-white active:scale-90 transition-all'
                  )
                )}
                style={{ boxShadow: '0 0 24px rgba(217, 119, 6, 0.35)' }}
              >
                <Plus className="w-7 h-7" />
              </button>
              <span className="text-[10px] text-cream-600 mt-1 font-semibold">
                {centerTab.label}
              </span>
            </div>
          )}

          {rightTabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              active={activePage === tab.id}
              onClick={() => setActivePage(tab.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface TabButtonProps {
  tab: { id: PageId; label: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
  onClick: () => void;
}

function TabButton({ tab, active, onClick }: TabButtonProps) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className="flex-col items-center flex-1 transition-transform active:scale-90 flex"
    >
      <div
        className={twMerge(
          clsx(
            'flex flex-col items-center rounded-full px-3 py-1.5',
            active && 'bg-cream-50'
          )
        )}
      >
        <Icon
          className={twMerge(
            clsx(
              'w-5 h-5',
              active ? 'text-cream-600' : 'text-gray-400'
            )
          )}
        />
        <span
          className={twMerge(
            clsx(
              'text-[10px] mt-0.5',
              active ? 'text-cream-600 font-semibold' : 'text-gray-400'
            )
          )}
        >
          {tab.label}
        </span>
      </div>
    </button>
  );
}
