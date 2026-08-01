import { useStore } from './store/useStore';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Record from './pages/Record';
import Stats from './pages/Stats';
import Accounts from './pages/Accounts';
import Budget from './pages/Budget';
import Settings from './pages/Settings';
import type { PageId } from './types';

export default function App() {
  const activePage = useStore((s) => s.activePage);

  const renderPage = () => {
    switch (activePage as PageId) {
      case 'home':
        return <Home />;
      case 'record':
        return <Record />;
      case 'stats':
        return <Stats />;
      case 'accounts':
        return <Accounts />;
      case 'budget':
        return <Budget />;
      case 'settings':
        return <Settings />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 max-w-md mx-auto relative">
      <div key={activePage} className="animate-page-in">
        {renderPage()}
      </div>
      <BottomNav />
    </div>
  );
}
