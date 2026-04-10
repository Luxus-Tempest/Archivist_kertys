import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function HeaderNew() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-sm flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-slate-600">account_balance_wallet</span>
        <h1 className="text-xl font-bold tracking-tighter text-slate-800 font-headline">Archivist</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex gap-6 items-center mr-8">
          <Link 
            to="/history-new" 
            className="text-slate-900 font-semibold font-headline tracking-tight"
          >
            Library
          </Link>
          <Link 
            to="#" 
            className="text-slate-500 hover:bg-slate-100 transition-colors duration-300 px-3 py-1 rounded-lg"
          >
            Recent
          </Link>
          <Link 
            to="#" 
            className="text-slate-500 hover:bg-slate-100 transition-colors duration-300 px-3 py-1 rounded-lg"
          >
            Shared
          </Link>
        </div>

        <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/20 active:scale-95 transition-transform duration-200 cursor-pointer">
          <img 
            alt="User profile" 
            src={`https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=random`} 
          />
        </div>
      </div>
    </header>
  );
}
