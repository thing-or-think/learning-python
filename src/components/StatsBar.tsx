import React from 'react';
import { motion } from 'motion/react';
import { Code, Trophy, Sparkles } from 'lucide-react';
import { UserStats } from '../types';

interface StatsBarProps {
  stats: UserStats;
  citizenCount: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, citizenCount }) => {
  const xpNeeded = stats.level * 500;
  const progress = (stats.xp / xpNeeded) * 100;

  return (
    <header className="fixed top-0 left-0 right-0 h-20 px-8 bg-white/95 backdrop-blur-sm border-b-8 border-wood-tan z-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-earth-brown rounded-2xl flex items-center justify-center text-2xl shadow-lg border-2 border-white">
          🐍
        </div>
        <div>
          <h1 className="font-black text-xl text-earth-brown uppercase tracking-tighter leading-none">PyCity</h1>
          <p className="text-[10px] font-black text-sky-blue uppercase">Coding Academy</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* XP & Level Bar */}
        <div className="flex flex-col items-center">
          <div className="bg-white px-5 py-2 rounded-full border-2 border-wood-tan flex flex-col gap-1 shadow-sm min-w-[200px] relative overflow-hidden">
            <div className="flex items-center justify-between font-black text-[9px] uppercase relative z-10">
               <span className="text-earth-brown flex items-center gap-1">
                 <Trophy className="w-3 h-3" />
                 CẤP ĐỘ {stats.level}
               </span>
               <span className="text-earth-brown/40">{stats.xp} / {xpNeeded} XP</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full relative z-10 overflow-hidden">
              <motion.div 
                 className="h-full bg-sky-blue"
                 animate={{ width: `${progress}%` }}
                 transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
            <div className="absolute top-0 right-0 p-1">
              <Sparkles className="w-3 h-3 text-sun-yellow animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Money Display */}
        <div className="bg-white px-5 py-2.5 rounded-full border-2 border-wood-tan flex items-center gap-3 font-black text-sm shadow-sm group hover:scale-105 transition-all">
          <div className="w-6 h-6 bg-sun-yellow rounded-lg flex items-center justify-center text-white shadow-inner">
             🪙
          </div>
          <span className="text-earth-brown">{Math.floor(stats.money)}</span>
        </div>

        {/* Citizen Counter */}
        <div className="bg-white px-5 py-2.5 rounded-full border-2 border-wood-tan flex items-center gap-3 font-black text-sm shadow-sm group hover:scale-105 transition-all">
          <div className="w-6 h-6 bg-berry-red rounded-lg flex items-center justify-center text-white shadow-inner">
             🏘️
          </div>
          <span className="text-earth-brown">{citizenCount}</span>
        </div>
      </div>
    </header>
  );
};
