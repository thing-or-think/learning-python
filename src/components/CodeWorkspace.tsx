import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Check, AlertCircle, Clock, Coffee, SendHorizontal, Code } from 'lucide-react';
import { Exercise } from '../types';
import { validatePythonCode } from '../services/geminiService';

interface CodeWorkspaceProps {
  exercise: Exercise | null;
  onComplete: (exerciseId: string) => void;
  onFail: (exerciseId: string) => void;
}

export const CodeWorkspace: React.FC<CodeWorkspaceProps> = ({ exercise, onComplete, onFail }) => {
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; text: string } | null>(null);

  useEffect(() => {
    if (exercise && isActive && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isActive) {
      onFail(exercise?.id || '');
      setIsActive(false);
    }
  }, [isActive, timeLeft, exercise, onFail]);

  const startSession = () => {
    if (!exercise) return;
    setTimeLeft(exercise.duration * 60);
    setIsActive(true);
    setFeedback(null);
  };

  const handleSubmit = async () => {
    if (!exercise || !code.trim()) return;
    setIsValidating(true);
    setFeedback(null);

    const result = await validatePythonCode(code, exercise);
    setIsValidating(false);
    
    if (result.success) {
      setFeedback({ success: true, text: result.feedback });
      setTimeout(() => {
        onComplete(exercise.id);
        setIsActive(false);
        setCode('');
      }, 2000);
    } else {
      setFeedback({ success: false, text: result.feedback });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!exercise) {
    return (
      <div className="town-panel h-full flex flex-col items-center justify-center text-center p-12">
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6">
          <Coffee className="w-12 h-12 text-stone-300" />
        </div>
        <h3 className="text-xl font-black text-earth-brown mb-2 uppercase">CHƯA CHỌN BÀI TẬP</h3>
        <p className="text-sm text-stone-500 max-w-[200px]">Hãy chọn một bài học bên trái để bắt đầu xây dựng kỹ năng lập trình nhé!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-5">
      {/* Exercise Info & Timer */}
      <div className="town-panel shrink-0 !p-6 flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-blue/20 rounded-2xl flex items-center justify-center text-sky-blue">
            <Clock className={`w-7 h-7 ${isActive ? 'animate-spin-slow' : ''}`} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-stone-400 mb-0.5">Thời gian thực hiện</p>
            <p className={`text-2xl font-black ${isActive ? 'text-berry-red' : 'text-earth-brown'}`}>
              {isActive ? formatTime(timeLeft) : `${exercise.duration}:00`}
            </p>
          </div>
        </div>

        {!isActive ? (
          <button 
            onClick={startSession}
            className="bg-earth-brown text-white px-8 py-3 rounded-2xl font-black uppercase text-sm shadow-lg hover:-translate-y-1 transition-all active:scale-95 flex items-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            BẮT ĐẦU HỌC
          </button>
        ) : (
          <button 
            onClick={() => onFail(exercise.id)}
            className="bg-stone-200 text-stone-500 px-6 py-3 rounded-2xl font-black uppercase text-[10px] hover:bg-berry-red hover:text-white transition-all"
          >
             DỪNG LẠI
          </button>
        )}
      </div>

      {/* Code Editor Area */}
      <div className={`town-panel flex-1 min-h-0 relative ${!isActive ? 'grayscale-[0.5] opacity-50 pointer-events-none' : ''}`}>
        <div className="flex flex-col h-full gap-4">
          <div className="flex items-center justify-between border-b-2 border-stone-100 pb-3">
             <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-earth-brown" />
                <h3 className="font-black text-earth-brown uppercase text-sm">{exercise.title}</h3>
             </div>
             <div className="flex gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full" />
                <div className="w-3 h-3 bg-amber-400 rounded-full" />
                <div className="w-3 h-3 bg-emerald-400 rounded-full" />
             </div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="bg-stone-50 p-4 rounded-2xl border-2 border-wood-tan">
              <p className="font-bold text-sm text-stone-800 leading-relaxed">{exercise.description}</p>
              <div className="mt-3 flex gap-4 text-[10px]">
                <div className="flex-1 p-2 bg-white rounded-lg border border-wood-tan">
                    <p className="font-black text-stone-400 uppercase mb-1">Ví dụ input:</p>
                    <code className="text-emerald-600 font-bold">{exercise.sampleInput || "N/A"}</code>
                </div>
                <div className="flex-1 p-2 bg-white rounded-lg border border-wood-tan">
                    <p className="font-black text-stone-400 uppercase mb-1">Ví dụ output:</p>
                    <code className="text-amber-600 font-bold">{exercise.sampleOutput}</code>
                </div>
              </div>
            </div>

            <div className="flex-1 relative font-mono text-sm">
                <textarea 
                  className="w-full h-full p-4 bg-stone-900 text-emerald-400 rounded-2xl border-4 border-earth-brown outline-none resize-none custom-scrollbar"
                  placeholder="# Nhập mã Python của bạn ở đây..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                />
                <div className="absolute right-4 bottom-4">
                    <button 
                      onClick={handleSubmit}
                      disabled={isValidating || !isActive}
                      className="w-14 h-14 bg-earth-brown text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                    >
                      {isValidating ? (
                         <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <SendHorizontal className="w-7 h-7 translate-x-0.5" />
                      )}
                    </button>
                </div>
            </div>
          </div>
        </div>

        {/* Feedback Overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`absolute bottom-24 left-6 right-6 p-4 rounded-2xl border-4 shadow-2xl flex items-center gap-4 z-50 ${feedback.success ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700'}`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${feedback.success ? 'bg-emerald-500' : 'bg-rose-500'} text-white`}>
                {feedback.success ? <Check className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>
              <p className="font-black text-sm">{feedback.text}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Focus Mode Note */}
      <div className="bg-sun-yellow/10 p-4 rounded-2xl border-2 border-sun-yellow/30 flex items-center gap-3">
         <div className="p-2 bg-sun-yellow rounded-xl text-earth-brown">
            <AlertCircle className="w-5 h-5" />
         </div>
         <p className="text-[10px] font-bold text-earth-brown leading-tight italic">
            Chế độ tập trung đang bật! Hãy hoàn thành bài tập Python của bạn thật tốt để nhận được tiền và tăng cấp cho các cư dân nhé.
         </p>
      </div>
    </div>
  );
};
