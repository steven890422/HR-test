import React, { useState, useEffect, useRef } from 'react';
import { Trophy, RotateCcw, Play, CheckCircle, Settings } from 'lucide-react';
import { Participant } from '../types';

interface LuckyDrawProps {
  participants: Participant[];
}

export const LuckyDraw: React.FC<LuckyDrawProps> = ({ participants }) => {
  const [winners, setWinners] = useState<Participant[]>([]);
  const [currentDisplay, setCurrentDisplay] = useState<string>('???');
  const [isSpinning, setIsSpinning] = useState(false);
  const [allowRepeats, setAllowRepeats] = useState(false);
  
  // Animation refs
  const intervalRef = useRef<number | null>(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const getCandidates = () => {
    if (allowRepeats) return participants;
    // Exclude existing winners
    const winnerIds = new Set(winners.map(w => w.id));
    return participants.filter(p => !winnerIds.has(p.id));
  };

  const startDraw = () => {
    const candidates = getCandidates();
    
    if (candidates.length === 0) {
      alert("所有人都已經中獎了！");
      return;
    }

    setIsSpinning(true);
    let speed = 50;
    let counter = 0;
    
    // Initial rapid cycling
    intervalRef.current = window.setInterval(() => {
      const randomIndex = Math.floor(Math.random() * candidates.length);
      setCurrentDisplay(candidates[randomIndex].name);
      counter++;
    }, speed);

    // Stop after random time between 2s and 4s
    const stopTime = 2000 + Math.random() * 2000;
    
    setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      // Select final winner
      const finalCandidates = getCandidates(); // Re-fetch to be safe
      const winnerIndex = Math.floor(Math.random() * finalCandidates.length);
      const winner = finalCandidates[winnerIndex];
      
      setCurrentDisplay(winner.name);
      setWinners(prev => [winner, ...prev]);
      setIsSpinning(false);
      
    }, stopTime);
  };

  const reset = () => {
    if (window.confirm("確定要重置中獎名單嗎？")) {
      setWinners([]);
      setCurrentDisplay('???');
      setIsSpinning(false);
    }
  };

  const candidatesCount = getCandidates().length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-center relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

        <h2 className="text-3xl font-bold text-gray-800 mb-6 flex justify-center items-center gap-3">
          <Trophy className="text-yellow-500" size={32} />
          幸運抽獎
          <Trophy className="text-yellow-500" size={32} />
        </h2>

        {/* Display Box */}
        <div className="relative mb-8">
            <div className={`
              text-6xl md:text-8xl font-black py-12 px-4 rounded-xl 
              transition-all duration-300
              ${isSpinning ? 'bg-gray-100 text-gray-400 scale-95' : 'bg-gradient-to-r from-brand-500 to-indigo-600 text-white scale-100 shadow-2xl shadow-brand-200'}
            `}>
              {currentDisplay}
            </div>
            {/* Confetti effect simulation via CSS if needed, but keeping it clean for now */}
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
          <button
            onClick={startDraw}
            disabled={isSpinning || candidatesCount === 0}
            className={`
              flex items-center gap-2 px-8 py-4 rounded-full text-xl font-bold text-white shadow-lg transition-transform active:scale-95
              ${isSpinning || candidatesCount === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-500 hover:shadow-brand-300'}
            `}
          >
            {isSpinning ? (
              <>抽獎中...</>
            ) : (
              <>
                <Play size={24} fill="currentColor" />
                開始抽獎
              </>
            )}
          </button>

          <button
            onClick={reset}
            disabled={isSpinning || winners.length === 0}
            className="flex items-center gap-2 px-6 py-4 rounded-full text-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
          >
            <RotateCcw size={20} />
            重置
          </button>
        </div>

        {/* Settings */}
        <div className="flex justify-center items-center gap-2 text-sm text-gray-500">
          <Settings size={16} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allowRepeats}
              onChange={(e) => setAllowRepeats(e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            允許重複中獎 (目前剩餘候選人: {candidatesCount})
          </label>
        </div>
      </div>

      {/* History */}
      {winners.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-500" />
            中獎名單紀錄
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {winners.map((winner, index) => (
              <div key={`${winner.id}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 animate-fade-in-up">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-brand-100 text-brand-700 font-bold rounded-full text-sm">
                  {winners.length - index}
                </span>
                <span className="font-medium text-gray-800 truncate">{winner.name}</span>
                <span className="ml-auto text-xs text-gray-400">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};