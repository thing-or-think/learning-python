import React, { useState } from 'react';
import { Search, Code, Lock, CheckCircle2, ChevronRight, Filter } from 'lucide-react';
import { Exercise, ExerciseDifficulty, ExerciseTopic, Citizen } from '../types';

interface ExerciseListProps {
  exercises: Exercise[];
  citizens: Citizen[];
  activeExerciseId: string | null;
  onSelectExercise: (exercise: Exercise) => void;
  onGenerateNew: (topic: ExerciseTopic, difficulty: ExerciseDifficulty) => void;
}

const TOPICS: { id: ExerciseTopic; label: string; icon: string }[] = [
  { id: 'variables', label: 'Biến & Kiểu dữ liệu', icon: '📦' },
  { id: 'conditionals', label: 'Cấu trúc rẽ nhánh', icon: '🔀' },
  { id: 'loops', label: 'Vòng lặp', icon: '♻️' },
  { id: 'functions', label: 'Hàm & Module', icon: '🧩' },
  { id: 'lists', label: 'Danh sách (List)', icon: '📜' },
  { id: 'dictionaries', label: 'Từ điển (Dict)', icon: '📖' },
  { id: 'oop', label: 'Hướng đối tượng', icon: '🏛️' },
];

const DIFFICULTIES: { id: ExerciseDifficulty; label: string; color: string }[] = [
  { id: 'easy', label: 'Dễ', color: 'bg-emerald-500' },
  { id: 'medium', label: 'Trung bình', color: 'bg-amber-500' },
  { id: 'hard', label: 'Khó', color: 'bg-rose-500' },
];

export const ExerciseList: React.FC<ExerciseListProps> = ({ 
  exercises, 
  activeExerciseId,
  onSelectExercise,
}) => {
  const [filterTopic, setFilterTopic] = useState<ExerciseTopic | 'all'>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<ExerciseDifficulty | 'all'>('all');

  const filteredExercises = exercises.filter(ex => {
    const matchTopic = filterTopic === 'all' || ex.topic === filterTopic;
    const matchDifficulty = filterDifficulty === 'all' || ex.difficulty === filterDifficulty;
    return matchTopic && matchDifficulty;
  });

  return (
    <div className="flex flex-col gap-6 h-full max-h-full min-h-0">
      {/* Search and Filters */}
      <div className="town-panel shrink-0 bg-white shadow-xl border-4 border-white">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input 
              type="text" 
              placeholder="Tìm bài học..."
              className="w-full pl-12 pr-4 py-3 bg-stone-100 rounded-2xl border-none font-bold text-sm focus:ring-4 focus:ring-sky-blue/20 transition-all"
            />
          </div>
          <button className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center hover:bg-stone-200 transition-colors">
            <Filter className="w-5 h-5 text-earth-brown" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
            <button 
              onClick={() => setFilterTopic('all')}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${filterTopic === 'all' ? 'bg-earth-brown text-white shadow-lg -translate-y-1' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
            >
              TẤT CẢ
            </button>
            {TOPICS.map(t => (
              <button 
                key={t.id}
                onClick={() => setFilterTopic(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap flex items-center gap-2 transition-all ${filterTopic === t.id ? 'bg-earth-brown text-white shadow-lg -translate-y-1' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}
              >
                <span>{t.icon}</span>
                {t.label.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setFilterDifficulty('all')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${filterDifficulty === 'all' ? 'bg-stone-800 text-white shadow-md' : 'bg-stone-100 text-stone-400'}`}
            >
              TẤT CẢ ĐỘ KHÓ
            </button>
            {DIFFICULTIES.map(d => (
              <button 
                key={d.id}
                onClick={() => setFilterDifficulty(d.id)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${filterDifficulty === d.id ? `${d.color} text-white shadow-md` : 'bg-stone-100 text-stone-400'}`}
              >
                {d.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exercise Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 sm:grid-cols-2 gap-4 pb-10">
        {filteredExercises.map(ex => {
          const isLocked = ex.status === 'locked';
          const isCompleted = ex.status === 'completed';
          const isActive = activeExerciseId === ex.id;
          const topicInfo = TOPICS.find(t => t.id === ex.topic);
          const diffInfo = DIFFICULTIES.find(d => d.id === ex.difficulty);

          return (
            <div 
              key={ex.id}
              onClick={() => !isLocked && onSelectExercise(ex)}
              className={`group relative p-5 rounded-3xl border-4 transition-all duration-300 ${isLocked ? 'bg-stone-100 border-transparent opacity-60 grayscale cursor-not-allowed' : 'bg-white border-white shadow-lg hover:shadow-2xl hover:-translate-y-2 cursor-pointer'} ${isActive ? 'ring-8 ring-sky-blue/30 border-sky-blue' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${isLocked ? 'bg-stone-200' : 'bg-sun-yellow/20'}`}>
                  {isLocked ? <Lock className="w-6 h-6 text-stone-400" /> : topicInfo?.icon}
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase text-white shadow-sm ${diffInfo?.color}`}>
                  {diffInfo?.label}
                </div>
              </div>

              <h4 className={`font-black text-lg mb-2 ${isLocked ? 'text-stone-400' : 'text-earth-brown'}`}>
                {ex.title}
              </h4>
              
              <div className="flex items-center gap-3 text-xs mb-4">
                <span className="flex items-center gap-1 font-bold text-stone-500">
                  <Code className="w-3 h-3" />
                  {topicInfo?.label}
                </span>
                <span className="text-stone-300">•</span>
                <span className="font-bold text-stone-500">{ex.duration} phút</span>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-stone-50">
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-sun-yellow/10 text-sun-yellow text-[10px] font-black rounded-lg">+{ex.moneyReward}💰</span>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg">+{ex.xpReward} XP</span>
                </div>
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : !isLocked && (
                  <ChevronRight className="w-6 h-6 text-stone-300 group-hover:text-earth-brown group-hover:translate-x-1 transition-all" />
                )}
              </div>

              {isLocked && (
                 <div className="absolute inset-0 flex items-center justify-center bg-stone-800/10 rounded-3xl backdrop-blur-[1px]">
                    <div className="bg-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2">
                      <Lock className="w-4 h-4 text-earth-brown" />
                      <span className="text-[10px] font-black text-earth-brown uppercase">Hoàn thành bài trước để mở</span>
                    </div>
                 </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
