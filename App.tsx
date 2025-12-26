import React, { useState } from 'react';
import { NameInput } from './components/NameInput';
import { LuckyDraw } from './components/LuckyDraw';
import { TeamGenerator } from './components/TeamGenerator';
import { Participant, AppMode } from './types';
import { Gift, Users, List, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.INPUT);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const renderContent = () => {
    switch (mode) {
      case AppMode.INPUT:
        return (
          <NameInput 
            participants={participants} 
            setParticipants={setParticipants} 
            onNext={() => setMode(AppMode.LUCKY_DRAW)}
          />
        );
      case AppMode.LUCKY_DRAW:
        return <LuckyDraw participants={participants} />;
      case AppMode.TEAM_GENERATOR:
        return <TeamGenerator participants={participants} />;
      default:
        return null;
    }
  };

  const NavButton = ({ targetMode, icon: Icon, label }: { targetMode: AppMode, icon: any, label: string }) => (
    <button
      onClick={() => setMode(targetMode)}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium
        ${mode === targetMode 
          ? 'bg-brand-600 text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-brand-600'
        }
      `}
    >
      <Icon size={20} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-brand-600 p-2 rounded-lg text-white">
                <Sparkles size={24} />
              </div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                HR 萬能工具箱
              </h1>
            </div>

            <nav className="flex space-x-2">
              <NavButton targetMode={AppMode.INPUT} icon={List} label="名單管理" />
              <NavButton targetMode={AppMode.LUCKY_DRAW} icon={Gift} label="幸運抽獎" />
              <NavButton targetMode={AppMode.TEAM_GENERATOR} icon={Users} label="自動分組" />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} HR Toolkit. Powered by React & Gemini AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;