import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Citizen, Building } from '../types';
import { 
  User, Home, Briefcase, X, Save, 
  ZoomIn, ZoomOut, Map as MapIcon, 
  Unlock, Route 
} from 'lucide-react';
import { INITIAL_GRID_SIZE, MAX_WORLD_SIZE } from '../store/useCityStore';

interface CityGridProps {
  citizens: Citizen[];
  buildings: Building[];
  unlockedGridSize: number;
  onMoveBuilding: (id: string, x: number, y: number) => void;
  onUpdateCitizen: (id: string, updates: Partial<Citizen>) => void;
  onExpandLand: () => void;
  onToggleRoad: (x: number, y: number) => void;
  money: number;
}

const findPath = (start: { x: number, y: number }, end: { x: number, y: number }, buildings: Building[], size: number) => {
  const roads = buildings.filter(b => b.type === 'road');
  const isRoad = (x: number, y: number) => roads.some(r => r.gridX === x && r.gridY === y) || (x === end.x && y === end.y) || (x === start.x && y === start.y);
  
  const queue: { x: number, y: number, path: { x: number, y: number }[] }[] = [{ ...start, path: [start] }];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const { x, y, path } = queue.shift()!;
    if (x === end.x && y === end.y) return path;

    const neighbors = [
      { x: x + 1, y }, { x: x - 1, y }, { x, y: y + 1 }, { x, y: y - 1 }
    ];

    for (const n of neighbors) {
      if (n.x >= 0 && n.x < size && n.y >= 0 && n.y < size && !visited.has(`${n.x},${n.y}`) && isRoad(n.x, n.y)) {
        visited.add(`${n.x},${n.y}`);
        queue.push({ ...n, path: [...path, n] });
      }
    }
  }
  return null; // No path on roads
};

const CitizenAgent: React.FC<{ 
  citizen: Citizen, 
  buildings: Building[], 
  index: number,
  onClick: (citizen: Citizen) => void,
  unlockedGridSize: number
}> = ({ citizen, buildings, index, onClick, unlockedGridSize }) => {
  const startHome = buildings.find(b => b.id === citizen.homeId) || buildings.find(b => b.type !== 'road') || { gridX: 5, gridY: 5 };
  const [pos, setPos] = React.useState([{ 
    x: (startHome.gridX / unlockedGridSize) * 100 + 5, 
    y: (startHome.gridY / unlockedGridSize) * 100 + 5 
  }]);

  React.useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    const pickNewTarget = () => {
      const roadBuildings = buildings.filter(b => b.type === 'road');
      if (buildings.length === 0) {
        // No buildings at all, just stay put or slow wander if really needed, 
        // but user wants roads only. If no roads, stay put.
        return;
      } else {
        const roll = Math.random();
        const citizenHome = buildings.find(b => b.id === citizen.homeId);
        const workplaceBuildings = buildings.filter(b => b.type === citizen.workplaceType);
        const citizenWork = workplaceBuildings.length > 0 
          ? workplaceBuildings[Math.floor(Math.random() * workplaceBuildings.length)]
          : null;

        let targetGrid: { x: number, y: number } | null = null;

        if (roll < 0.4) {
          const otherBuildings = buildings.filter(b => b.id !== citizen.homeId && b.type !== citizen.workplaceType && b.type !== 'road');
          const target = otherBuildings.length > 0 
            ? otherBuildings[Math.floor(Math.random() * otherBuildings.length)]
            : buildings.find(b => b.type !== 'road');
          if (target) targetGrid = { x: target.gridX, y: target.gridY };
        } else if (roll < 0.7 && citizenWork) {
          targetGrid = { x: citizenWork.gridX, y: citizenWork.gridY };
        } else if (roll < 0.9 && citizenHome) {
          targetGrid = { x: citizenHome.gridX, y: citizenHome.gridY };
        }

        if (targetGrid) {
          const startGrid = { 
            x: Math.floor((pos[pos.length - 1].x / 100) * unlockedGridSize),
            y: Math.floor((pos[pos.length - 1].y / 100) * unlockedGridSize)
          };
          const roadPath = findPath(startGrid, targetGrid, buildings, unlockedGridSize);
          
          if (roadPath) {
            setPos(roadPath.map(p => ({ 
              x: (p.x / unlockedGridSize) * 100 + 5, 
              y: (p.y / unlockedGridSize) * 100 + 5 
            })));
          }
          // If no roadPath, we just don't move (stay at current location)
        } else {
          // Wander: Only move to adjacent road
          const currentGridX = Math.floor((pos[pos.length - 1].x / 100) * unlockedGridSize);
          const currentGridY = Math.floor((pos[pos.length - 1].y / 100) * unlockedGridSize);
          
          const neighbors = [
            { x: currentGridX + 1, y: currentGridY },
            { x: currentGridX - 1, y: currentGridY },
            { x: currentGridX, y: currentGridY + 1 },
            { x: currentGridX, y: currentGridY - 1 }
          ];

          const roadNeighbors = neighbors.filter(n => 
            n.x >= 0 && n.x < unlockedGridSize && n.y >= 0 && n.y < unlockedGridSize &&
            roadBuildings.some(r => r.gridX === n.x && r.gridY === n.y)
          );

          if (roadNeighbors.length > 0) {
            const next = roadNeighbors[Math.floor(Math.random() * roadNeighbors.length)];
            setPos([{ 
              x: (next.x / unlockedGridSize) * 100 + 5, 
              y: (next.y / unlockedGridSize) * 100 + 5 
            }]);
          }
        }
      }

      timeout = setTimeout(pickNewTarget, 6000 + Math.random() * 8000);
    };

    timeout = setTimeout(pickNewTarget, index * 800 + Math.random() * 2000);
    return () => clearTimeout(timeout);
  }, [buildings, citizen.id, citizen.homeId, unlockedGridSize]);

  // Handle keyframes for movement
  const currentPos = pos[pos.length - 1];
  const animateX = pos.length > 1 ? pos.map(p => `${p.x}%`) : `${currentPos.x}%`;
  const animateY = pos.length > 1 ? pos.map(p => `${p.y}%`) : `${currentPos.y}%`;

  return (
    <motion.div
      key={citizen.id}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        left: animateX,
        top: animateY,
        x: "-50%", 
        y: "-50%"
      }}
      transition={{
        duration: pos.length > 1 ? pos.length * 0.8 : 4, // Faster per step but total depends on path length
        ease: "linear"
      }}
      className="absolute flex flex-col items-center gap-1 group z-20 pointer-events-auto cursor-pointer"
      onClick={(e) => {
        e.stopPropagation();
        onClick(citizen);
      }}
    >
      <motion.div
        animate={{ 
          y: [0, -6, 0],
          rotate: [0, -3, 3, 0]
        }}
        transition={{
          duration: 2 + Math.random(),
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`relative w-10 h-10 ${citizen.status === 'sad' ? 'bg-stone-200' : 'bg-white'} border-4 flex items-center justify-center text-xl rounded-2xl shadow-lg border-earth-brown group-hover:scale-110 transition-transform`}
      >
        {citizen.avatar}
        {citizen.status === 'sad' && (
          <span className="absolute -top-2 -right-2 text-[12px] filter grayscale">💧</span>
        )}
      </motion.div>
      <div className="bg-white/95 px-3 py-1 rounded-full text-[9px] font-black border-2 border-wood-tan shadow-sm whitespace-nowrap text-earth-brown group-hover:bg-earth-brown group-hover:text-white transition-colors">
        {citizen.name}
      </div>
    </motion.div>
  );
};

export const CityGrid: React.FC<CityGridProps> = ({ citizens, buildings, unlockedGridSize, onMoveBuilding, onUpdateCitizen, onExpandLand, onToggleRoad, money }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const worldRef = React.useRef<HTMLDivElement>(null);
  const [selectedBuildingId, setSelectedBuildingId] = React.useState<string | null>(null);
  const [editingCitizen, setEditingCitizen] = React.useState<Citizen | null>(null);
  const [zoom, setZoom] = React.useState(1);
  const [isPanning, setIsPanning] = React.useState(false);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [startPan, setStartPan] = React.useState({ x: 0, y: 0 });
  const [isRoadMode, setIsRoadMode] = React.useState(false);
  
  const [editName, setEditName] = React.useState('');
  const [editHome, setEditHome] = React.useState('');
  const [editWork, setEditWork] = React.useState('');

  const handleOpenEdit = (citizen: Citizen) => {
    setEditingCitizen(citizen);
    setEditName(citizen.name);
    setEditHome(citizen.homeId || '');
    setEditWork(citizen.workplaceType || '');
  };

  const handleSaveCitizen = () => {
    if (!editingCitizen) return;
    onUpdateCitizen(editingCitizen.id, {
      name: editName,
      homeId: editHome || undefined,
      workplaceType: (editWork as any) || undefined
    });
    setEditingCitizen(null);
  };

  const handleGridClick = (e: React.MouseEvent) => {
    if (editingCitizen) {
      setEditingCitizen(null);
      return;
    }

    if (!worldRef.current) return;
    if (!selectedBuildingId && !isRoadMode) return;

    const rect = worldRef.current.getBoundingClientRect();
    const gridX = Math.floor(((e.clientX - rect.left) / rect.width) * unlockedGridSize);
    const gridY = Math.floor(((e.clientY - rect.top) / rect.height) * unlockedGridSize);

    if (gridX >= 0 && gridX < unlockedGridSize && gridY >= 0 && gridY < unlockedGridSize) {
      if (isRoadMode) {
        onToggleRoad(gridX, gridY);
      } else if (selectedBuildingId) {
        onMoveBuilding(selectedBuildingId, gridX, gridY);
        setSelectedBuildingId(null);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !selectedBuildingId) { // Left click + no active placement
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const toggleSelectBuilding = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent grid click from firing
    setIsRoadMode(false); // Disable road mode when selecting a building to move
    setSelectedBuildingId(prev => prev === id ? null : id);
  };

  const expandCost = unlockedGridSize * 200;

  return (
    <div 
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`relative w-full h-full rounded-[2rem] overflow-hidden bg-[#86B970] border-8 border-[#86B970] shadow-inner transition-colors ${isRoadMode ? 'cursor-cell' : (selectedBuildingId ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : 'cursor-grab')}`}
    >
      {/* City World Wrapper for Zoom/Pan */}
      <div 
        ref={worldRef}
        onClick={handleGridClick}
        style={{ 
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '50% 50%',
          width: '600px', // Fixed simulated world size
          height: '600px',
          left: 'calc(50% - 300px)',
          top: 'calc(50% - 300px)'
        }}
        className="absolute bg-[#B4E380] shadow-2xl transition-transform duration-200"
      >
        {/* Grid helper */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: `linear-gradient(to right, #86B970 1px, transparent 1px), linear-gradient(to bottom, #86B970 1px, transparent 1px)`,
               backgroundSize: `${100 / unlockedGridSize}% ${100 / unlockedGridSize}%`
             }} />

        {/* Grid Hover effect when placing or building roads */}
        {(selectedBuildingId || isRoadMode) && (
          <div className="absolute inset-0 pointer-events-none grid"
               style={{ 
                 gridTemplateColumns: `repeat(${unlockedGridSize}, 1fr)`,
                 gridTemplateRows: `repeat(${unlockedGridSize}, 1fr)`
               }}>
            {Array.from({ length: unlockedGridSize * unlockedGridSize }).map((_, i) => (
              <div key={i} className={`border border-white/10 ${isRoadMode ? 'hover:bg-sun-yellow/30' : 'hover:bg-white/10'}`} />
            ))}
          </div>
        )}

        {/* Buildings & Roads */}
        <AnimatePresence>
          {buildings.map((building) => {
            const isSelected = selectedBuildingId === building.id;
            const isRoad = building.type === 'road';

            const category = 
              ['house', 'villa', 'mansion'].includes(building.type) ? 'home' :
              ['shop', 'office', 'cafe'].includes(building.type) ? 'work' :
              ['road'].includes(building.type) ? 'road' : 'nature';

            const getColors = () => {
              switch(category) {
                case 'home': return { border: 'border-orange-400', shadow: '#E67E22' };
                case 'work': return { border: 'border-sky-400', shadow: '#2980B9' };
                case 'nature': return { border: 'border-emerald-400', shadow: '#27AE60' };
                default: return { border: 'border-earth-brown', shadow: '#795548' };
              }
            };

            const colors = getColors();
            
            return (
              <motion.div
                key={building.id}
                onClick={(e) => !isRoad && toggleSelectBuilding(e, building.id)}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isSelected ? 1.1 : 1, 
                  opacity: 1,
                  boxShadow: isRoad ? 'none' : (isSelected ? '0 0 20px rgba(239, 83, 80, 0.4)' : `0 4px 0 ${colors.shadow}`),
                  left: `${(building.gridX / unlockedGridSize) * 100}%`, 
                  top: `${(building.gridY / unlockedGridSize) * 100}%`,
                  zIndex: isRoad ? 5 : 10,
                }}
                whileHover={!isRoad ? { scale: isSelected ? 1.15 : 1.05 } : {}}
                className={`absolute flex items-center justify-center transition-all ${isRoad ? 'bg-[#95A5A6] border-none' : `bg-white border-4 rounded-lg p-2 cursor-pointer ${colors.border}`} ${isSelected ? 'border-berry-red ring-4 ring-berry-red/20' : ''}`}
                style={{ 
                  width: `${100 / unlockedGridSize}%`,
                  height: `${100 / unlockedGridSize}%`,
                }}
              >
                {!isRoad ? (
                  <div className="text-2xl pointer-events-none select-none">
                    {building.type === 'house' ? '🏠' : 
                    building.type === 'villa' ? '🏡' :
                    building.type === 'mansion' ? '🏰' :
                    building.type === 'shop' ? '🏬' : 
                    building.type === 'office' ? '🏢' : 
                    building.type === 'cafe' ? '☕' :
                    building.type === 'tree_pine' ? '🌲' :
                    building.type === 'tree_palm' ? '🌴' :
                    building.type === 'flower' ? '🌻' :
                    building.type === 'cactus' ? '🌵' : '🌳'}
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-40">
                    <div className="w-[10%] h-[40%] bg-white/50" />
                  </div>
                )}
                {isSelected && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute -top-10 bg-berry-red text-white text-[8px] font-black px-2 py-1 rounded-full whitespace-nowrap uppercase shadow-lg"
                  >
                    Chọn vị trí mới
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Citizens */}
        <AnimatePresence>
          {citizens.map((citizen, index) => (
            <CitizenAgent 
              key={citizen.id} 
              citizen={citizen} 
              buildings={buildings} 
              index={index} 
              onClick={handleOpenEdit}
              unlockedGridSize={unlockedGridSize}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Viewport UI Controls */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-30">
        <button 
          onClick={() => {
            setIsRoadMode(!isRoadMode);
            setSelectedBuildingId(null);
          }}
          className={`bg-white/90 backdrop-blur-md border-4 rounded-2xl p-3 shadow-xl transition-all ${isRoadMode ? 'border-sun-yellow bg-sun-yellow text-earth-brown' : 'border-wood-tan text-earth-brown hover:bg-stone-100'}`}
          title="Xây dựng đường đi"
        >
          <div className="flex flex-col items-center gap-1">
            <Route className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase">Đường đi</span>
          </div>
        </button>

        <div className="flex bg-white/90 backdrop-blur-md border-4 border-wood-tan rounded-2xl overflow-hidden shadow-xl">
          <button 
            onClick={() => setZoom(prev => Math.min(prev + 0.2, 3))}
            className="p-3 hover:bg-stone-100 text-earth-brown transition-colors border-r-2 border-wood-tan"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.5))}
            className="p-3 hover:bg-stone-100 text-earth-brown transition-colors"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
        </div>

        <button 
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="bg-white/90 backdrop-blur-md border-4 border-wood-tan rounded-2xl p-3 text-earth-brown shadow-xl hover:bg-stone-100 transition-colors"
        >
          <MapIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Expand Land Button */}
      <div className="absolute top-6 left-6 z-30">
        <button 
          onClick={(e) => { e.stopPropagation(); onExpandLand(); }}
          className={`flex items-center gap-3 bg-white/90 backdrop-blur-md border-4 border-wood-tan rounded-2xl px-5 py-3 shadow-xl transition-all active:scale-95 group ${money < expandCost ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:border-earth-brown'}`}
        >
          <div className="w-10 h-10 bg-sun-yellow/20 rounded-xl flex items-center justify-center border-2 border-wood-tan group-hover:scale-110 transition-transform">
            <Unlock className="w-5 h-5 text-earth-brown" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black uppercase text-earth-brown opacity-60">Mở rộng diện tích</p>
            <p className="text-xs font-black text-earth-brown">💰 {expandCost}</p>
          </div>
        </button>
      </div>

      {/* Citizen Edit Modal */}
      <AnimatePresence>
        {editingCitizen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[320px] bg-white rounded-[2rem] border-8 border-wood-tan shadow-2xl p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-sun-yellow/20 rounded-2xl flex items-center justify-center text-3xl border-4 border-wood-tan">
                  {editingCitizen.avatar}
                </div>
                <div>
                  <h3 className="text-earth-brown font-black uppercase text-sm leading-none">Hồ sơ cư dân</h3>
                  <p className="text-[10px] font-bold text-stone-400">ID: {editingCitizen.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingCitizen(null)}
                className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-berry-red hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-earth-brown/60 ml-2">Tên cư dân</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                  <input 
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border-2 border-wood-tan rounded-xl text-sm font-bold outline-none focus:border-earth-brown transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-earth-brown/60 ml-2">Nơi sinh sống</label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                  <select 
                    value={editHome}
                    onChange={(e) => setEditHome(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border-2 border-wood-tan rounded-xl text-sm font-bold outline-none focus:border-earth-brown transition-colors appearance-none"
                  >
                    <option value="">Không có nhà</option>
                    {buildings.filter(b => ['house', 'villa', 'mansion'].includes(b.type)).map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase text-earth-brown/60 ml-2">Nghề nghiệp / Nơi làm việc</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
                  <select 
                    value={editWork}
                    onChange={(e) => setEditWork(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border-2 border-wood-tan rounded-xl text-sm font-bold outline-none focus:border-earth-brown transition-colors appearance-none"
                  >
                    <option value="">Thất nghiệp</option>
                    <option value="shop">Làm việc tại Cửa hàng (Shop)</option>
                    <option value="office">Làm việc tại Văn phòng (Office)</option>
                    <option value="cafe">Làm việc tại Quán cà phê (Cafe)</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSaveCitizen}
              className="mt-2 w-full bg-earth-brown text-white py-3 rounded-2xl font-black uppercase text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
            >
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 left-6 text-earth-brown font-black text-xs uppercase bg-white/40 px-3 py-1 rounded-full backdrop-blur-sm">
        Thành phố phồn vinh ✨
      </div>
    </div>
  );
};
