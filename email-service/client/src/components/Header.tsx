import React from 'react';
import { Menu, Search, HelpCircle, Settings, Grid, LogOut } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onSearch }) => {
  return (
    <header className="h-16 flex items-center justify-between px-4 bg-gmail-bg border-b border-gray-200 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4 w-64 shrink-0">
        <button className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-8 h-8 bg-orange rounded flex items-center justify-center text-white font-black text-xs transition-transform group-hover:scale-110">K</div>
          <span className="text-xl font-black text-ink tracking-tighter">KREATIX <span className="text-orange">MAIL</span></span>
        </div>
      </div>

      <div className="flex-1 max-w-3xl px-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            onChange={(e) => onSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 bg-gray-100 border-transparent rounded-lg focus:bg-white focus:ring-0 focus:shadow-md transition-all sm:text-sm placeholder-gray-500 text-gray-900"
            placeholder="Search mail"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button className="p-2 hover:bg-gray-200 rounded-full text-gray-600">
          <HelpCircle className="w-6 h-6" />
        </button>
        <button className="p-2 hover:bg-gray-200 rounded-full text-gray-600">
          <Settings className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-ink">{user.display_name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button 
                onClick={onLogout}
                className="p-2 hover:bg-orange-light text-gray-600 hover:text-orange rounded-full transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-orange text-white flex items-center justify-center font-bold shadow-md ring-2 ring-white">
                {user.display_name[0]}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
