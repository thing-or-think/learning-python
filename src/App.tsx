import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, Construction, GraduationCap } from 'lucide-react';
import { useCityStore } from './store/useCityStore';
import { StatsBar } from './components/StatsBar';
import { CityGrid } from './components/CityGrid';
import { ExerciseList } from './components/ExerciseList';
import { CodeWorkspace } from './components/CodeWorkspace';
import { getCitizenResponse, generatePythonExercise } from './services/geminiService';
import { Exercise, ExerciseDifficulty, ExerciseTopic } from './types';

export default function App() {
  const {
    citizens,
    buildings,
    exercises,
    stats,
    addExercise,
    completeExercise,
    failExercise,
    addBuilding,
    moveBuilding,
    updateCitizen,
    expandLand,
    toggleRoad,
  } = useCityStore();

  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const [aiMessage, setAiMessage] = useState<{ name: string; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'learn' | 'city' | 'shop'>('learn');

  const handleExerciseSuccess = async (exerciseId: string) => {
    completeExercise(exerciseId);
    const ex = exercises.find(e => e.id === exerciseId);
    const citizen = citizens.find(c => c.id === ex?.citizenId) || citizens[0];
    
    if (citizen && ex) {
      const msg = await getCitizenResponse(citizen.name, 'focus_success', ex.title);
      setAiMessage({ name: citizen.name, text: msg });
      setTimeout(() => setAiMessage(null), 5000);
    }
    setActiveExercise(null);
    setActiveTab('city'); 
  };

  const handleExerciseFail = async (exerciseId: string) => {
    failExercise(exerciseId);
    const ex = exercises.find(e => e.id === exerciseId);
    const citizen = citizens.find(c => c.id === ex?.citizenId) || citizens[0];
    
    if (citizen && ex) {
      const msg = await getCitizenResponse(citizen.name, 'focus_fail', ex.title);
      setAiMessage({ name: citizen.name, text: msg });
      setTimeout(() => setAiMessage(null), 5000);
    }
    setActiveExercise(null);
  };

  const startExercise = async (exercise: Exercise) => {
    setActiveExercise(exercise);
    const citizen = citizens.find(c => c.id === exercise.citizenId) || citizens[0];
    if (citizen) {
      const msg = await getCitizenResponse(citizen.name, 'focus_start', exercise.title);
      setAiMessage({ name: citizen.name, text: msg });
      setTimeout(() => setAiMessage(null), 3000);
    }
  };

  const handleGenerateNew = async (topic: ExerciseTopic, difficulty: ExerciseDifficulty) => {
    try {
      const newEx = await generatePythonExercise(topic, difficulty);
      const fullEx: Exercise = {
        ...newEx as Exercise,
        id: Math.random().toString(36).substr(2, 9),
        status: 'unlocked',
        completed: false,
        createdAt: Date.now(),
        topic,
        difficulty
      };
      addExercise(fullEx);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="h-screen flex flex-col pt-20 bg-[#Fdf6f0]">
      <StatsBar stats={stats} citizenCount={citizens.length} />

      {/* Navigation Tabs */}
      <nav className="flex justify-center gap-4 px-5 pt-4 z-10">
        {[
          { id: 'learn', label: 'Học tập', icon: <GraduationCap className="w-4 h-4" /> },
          { id: 'city', label: 'Thành phố', icon: <LayoutGrid className="w-4 h-4" /> },
          { id: 'shop', label: 'Cửa hàng', icon: <Construction className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-xs uppercase transition-all shadow-sm ${
              activeTab === tab.id 
                ? 'bg-earth-brown text-white shadow-lg -translate-y-1' 
                : 'bg-white text-earth-brown/60 hover:bg-white/80'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-5 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'learn' && (
            <motion.div 
              key="learn"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full grid grid-cols-1 md:grid-cols-[1fr_450px] gap-6 min-h-0"
            >
              <div className="min-h-0 h-full">
                <ExerciseList 
                  exercises={exercises}
                  citizens={citizens}
                  activeExerciseId={activeExercise?.id || null}
                  onSelectExercise={startExercise}
                  onGenerateNew={handleGenerateNew}
                />
              </div>
              <div className="h-full flex flex-col min-h-0">
                <CodeWorkspace 
                  exercise={activeExercise}
                  onComplete={handleExerciseSuccess}
                  onFail={handleExerciseFail}
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'city' && (
            <motion.div 
              key="city"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full relative town-panel !p-0 overflow-hidden"
            >
              <CityGrid 
                  citizens={citizens} 
                  buildings={buildings} 
                  unlockedGridSize={stats.unlockedGridSize}
                  money={stats.money}
                  onMoveBuilding={moveBuilding}
                  onUpdateCitizen={updateCitizen}
                  onExpandLand={expandLand}
                  onToggleRoad={toggleRoad}
              />
              
              {/* AI Speech Bubble */}
              <AnimatePresence>
                {aiMessage && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 w-full max-w-[280px]"
                  >
                    <div className="bg-white p-4 rounded-3xl shadow-xl border-4 border-wood-tan relative">
                      <p className="font-black text-earth-brown text-[10px] uppercase mb-1 opacity-60">{aiMessage.name} nhắn:</p>
                      <p className="font-bold text-stone-800 text-sm leading-tight">"{aiMessage.text}"</p>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-r-4 border-b-4 border-wood-tan rotate-45" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'shop' && (
            <motion.div 
              key="shop"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full flex justify-center"
            >
              <div className="town-panel w-full max-w-2xl overflow-y-auto custom-scrollbar">
                <h2 className="text-earth-brown text-xl font-black mb-6 flex items-center gap-3 justify-center">
                  <Construction className="w-6 h-6" />
                  KIẾN THIẾT THÀNH PHỐ
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { type: 'house', price: 100, icon: '🏠', desc: 'Nhà ấm cúng cho cư dân.', req: 0 },
                    { type: 'villa', price: 500, icon: '🏡', desc: 'Biệt thự sang trọng.', req: 5 },
                    { type: 'mansion', price: 2000, icon: '🏰', desc: 'Dinh thự lộng lẫy.', req: 15 },
                    { type: 'shop', price: 500, icon: '🏬', desc: 'Cửa hàng tiện lợi.', req: 3 },
                    { type: 'cafe', price: 300, icon: '☕', desc: 'Quán cà phê thư giãn.', req: 2 },
                    { type: 'office', price: 1000, icon: '🏢', desc: 'Cao ốc văn phòng.', req: 8 },
                    { type: 'park', price: 150, icon: '🌳', desc: 'Cây trang trí cơ bản.', req: 1 },
                    { type: 'tree_pine', price: 50, icon: '🌲', desc: 'Cây thông phương Bắc.', req: 0 },
                    { type: 'tree_palm', price: 70, icon: '🌴', desc: 'Cây dừa nhiệt đới.', req: 4 },
                    { type: 'flower', price: 30, icon: '🌻', desc: 'Hoa hướng dương.', req: 0 },
                    { type: 'cactus', price: 40, icon: '🌵', desc: 'Xương rồng sa mạc.', req: 0 },
                  ].map((item: any) => {
                    const isUnlocked = citizens.length >= item.req;
                    
                    return (
                      <div key={item.type} className={`item-card !p-4 flex flex-col items-center text-center gap-3 ${!isUnlocked ? 'opacity-40 grayscale pointer-events-none' : ''}`}>
                        <span className="text-4xl shadow-sm">{item.icon}</span>
                        <div>
                          <p className="font-black text-earth-brown text-sm uppercase">{item.desc}</p>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            <span className="text-xs font-bold text-sun-yellow">🪙 {item.price}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => addBuilding(item.type)}
                          disabled={stats.money < item.price}
                          className="w-full mt-2 py-2 bg-earth-brown text-white rounded-xl font-black text-[10px] uppercase shadow-[0_4px_0_#4E342E] active:translate-y-[2px] active:shadow-[0_2px_0_#4E342E] disabled:opacity-50 disabled:shadow-none"
                        >
                          Xây dựng
                        </button>
                      </div>
                    );
                  })}
                  
                  {/* Land Expansion Card */}
                  <div className="item-card !p-4 flex flex-col items-center text-center gap-3 bg-earth-brown/5 border-earth-brown/20">
                    <span className="text-4xl">🗺️</span>
                    <div>
                      <p className="font-black text-earth-brown text-sm uppercase">Mở rộng diện tích</p>
                      <p className="text-[10px] text-stone-500 font-bold mt-1">Sử dụng cấp độ thành phố để phát triển.</p>
                    </div>
                    <button 
                      onClick={expandLand}
                      disabled={stats.money < stats.unlockedGridSize * 200}
                      className="w-full mt-2 py-2 bg-earth-brown text-white rounded-xl font-black text-[10px] uppercase shadow-[0_4px_0_#4E342E] active:translate-y-[2px] active:shadow-[0_2px_0_#4E342E]"
                    >
                      Mở rộng ( {stats.unlockedGridSize * 200} xu )
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

