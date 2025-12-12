import React from 'react';
import { Home, Sword, Book, Shield, User } from 'lucide-react';
import { AppView } from '../types';

interface LayoutProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, onChangeView, children }) => {
  // Hide bottom nav in battle mode for immersive experience AND in login mode
  const showNav = currentView !== AppView.BATTLE && currentView !== AppView.LOGIN;

  return (
    <div className="h-screen w-screen bg-slate-900 text-slate-100 flex flex-col font-sans relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content Area - Layout handles container, Children handle scrolling */}
      <main className={`flex-1 relative z-10 overflow-hidden ${showNav ? 'pb-16' : ''}`}>
        {children}
      </main>

      {/* Bottom Navigation (Sticky) */}
      {showNav && (
        <nav className="absolute bottom-0 left-0 w-full bg-slate-800/95 backdrop-blur-md border-t border-slate-700 z-50 h-16 safe-area-pb">
          <div className="grid grid-cols-5 h-full">
            <button 
              onClick={() => onChangeView(AppView.LOBBY)}
              className={`flex flex-col items-center justify-center space-y-1 ${currentView === AppView.LOBBY ? 'text-yellow-400' : 'text-slate-400'}`}
            >
              <Home size={20} />
              <span className="text-[10px]">大厅</span>
            </button>
            <button 
              onClick={() => onChangeView(AppView.DATABASE)}
              className={`flex flex-col items-center justify-center space-y-1 ${currentView === AppView.DATABASE ? 'text-cyan-400' : 'text-slate-400'}`}
            >
              <Book size={20} />
              <span className="text-[10px]">词汇库</span>
            </button>
            <button 
              onClick={() => onChangeView(AppView.BATTLE_PREP)}
              className="flex flex-col items-center justify-center -mt-6"
            >
              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transform transition-transform ${currentView === AppView.BATTLE_PREP ? 'bg-gradient-to-br from-yellow-400 to-orange-500 scale-110' : 'bg-slate-700 border border-slate-600'}`}>
                <Sword size={24} className="text-white fill-current" />
              </div>
              <span className={`text-[10px] mt-1 ${currentView === AppView.BATTLE_PREP ? 'text-yellow-400' : 'text-slate-400'}`}>实战</span>
            </button>
            <button 
              onClick={() => onChangeView(AppView.ARMORY)}
              className={`flex flex-col items-center justify-center space-y-1 ${currentView === AppView.ARMORY ? 'text-red-400' : 'text-slate-400'}`}
            >
              <Shield size={20} />
              <span className="text-[10px]">军械库</span>
            </button>
            <button 
              onClick={() => onChangeView(AppView.PROFILE)}
              className={`flex flex-col items-center justify-center space-y-1 ${currentView === AppView.PROFILE ? 'text-purple-400' : 'text-slate-400'}`}
            >
              <User size={20} />
              <span className="text-[10px]">战绩</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;