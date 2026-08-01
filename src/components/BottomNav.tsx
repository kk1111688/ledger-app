import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Home, PieChart, Plus, Wallet, Target, Settings } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { PageId } from '@/types';

const TABS = [
  { id: 'home' as PageId, label: '首页', icon: Home },
  { id: 'stats' as PageId, label: '统计', icon: PieChart },
  { id: 'record' as PageId, label: '记账', icon: Plus },
  { id: 'accounts' as PageId, label: '账户', icon: Wallet },
  { id: 'budget' as PageId, label: '预算', icon: Target },
  { id: 'settings' as PageId, label: '设置', icon: Settings },
];

export default function BottomNav() {
  const activePage = useStore((s) => s.activePage);
  const setActivePage = useStore((s) => s.setActivePage);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      <div className="max-w-md mx-auto pb-3 pt-2 px-4 pointer-events-auto">
        <div
          className="bg-white/90 backdrop-blur-xl rounded-3xl h-16 flex items-center justify-around px-2 border border-white/60"
          style={{ boxShadow: '0 8px 32px rgba(217,119,6,0.15)' }}
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePage(tab.id)}
                className="flex flex-col items-center justify-center flex-1 h-full transition-transform active:scale-90"
              >
                <div
                  className={twMerge(
                    clsx(
                      'flex items-center justify-center px-3 py-1.5 rounded-full transition-all',
                      isActive && 'bg-cream-50'
                    )
                  )}
                >
                  <Icon
                    className={twMerge(
                      clsx(
                        'w-5 h-5 transition-colors',
                        isActive ? 'text-cream-600' : 'text-gray-400'
                      )
                    )}
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                </div>
                <span
                  className={twMerge(
                    clsx(
                      'text-[10px] mt-0.5 transition-colors',
                      isActive ? 'text-cream-600 font-semibold' : 'text-gray-400'
                    )
                  )}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
