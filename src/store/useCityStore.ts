import { useState, useEffect } from 'react';
import { Citizen, Building, Exercise, UserStats, ExerciseTopic, ExerciseDifficulty } from '../types';

const isHouseBuilding = (type: Building['type']) => ['house', 'villa', 'mansion'].includes(type);

export const MAX_WORLD_SIZE = 50; 
export const INITIAL_GRID_SIZE = 10;

const DEFAULT_EXERCISES: Partial<Exercise>[] = [
  {
    id: 'ex-1',
    title: 'Hello Python',
    description: 'In ra màn hình dòng chữ "Hello PyCity".',
    topic: 'variables',
    difficulty: 'easy',
    sampleInput: '',
    sampleOutput: 'Hello PyCity',
    testCases: [{ input: '', output: 'Hello PyCity' }],
    status: 'unlocked',
    xpReward: 50,
    moneyReward: 100,
    duration: 5,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-2',
    title: 'Tính tổng',
    description: 'Viết hàm sum(a, b) trả về tổng của hai số.',
    topic: 'functions',
    difficulty: 'easy',
    sampleInput: '1, 2',
    sampleOutput: '3',
    testCases: [{ input: '1, 2', output: '3' }, { input: '10, 20', output: '30' }],
    status: 'locked',
    xpReward: 100,
    moneyReward: 200,
    duration: 10,
    completed: false,
    createdAt: Date.now(),
  }
];

export function useCityStore() {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [stats, setStats] = useState<UserStats>({
    money: 1000,
    streak: 0,
    totalFocusHours: 0,
    level: 1,
    xp: 0,
    unlockedGridSize: INITIAL_GRID_SIZE,
    completedTopics: [],
  });

  const createInitialCitizen = (): Citizen => ({
    id: 'c-mochi',
    name: 'Mochi',
    avatar: '🐱',
    level: 1,
    exp: 0,
    status: 'happy' as const,
    lastFocusTime: 0,
  });

  const initializeState = () => {
    const initialCitizen = createInitialCitizen();
    const initialHouse: Building = {
      id: 'h-initial',
      type: 'house',
      name: 'Nhà của Mochi',
      gridX: 4,
      gridY: 4,
    };
    initialCitizen.homeId = initialHouse.id;
    return {
      citizens: [initialCitizen],
      buildings: [initialHouse],
      exercises: DEFAULT_EXERCISES as Exercise[],
      stats: { 
        money: 1000, 
        streak: 0, 
        totalFocusHours: 0, 
        level: 1, 
        xp: 0, 
        unlockedGridSize: INITIAL_GRID_SIZE,
        completedTopics: []
      }
    };
  };

  useEffect(() => {
    const saved = localStorage.getItem('py_city_data');
    if (saved) {
      const parsed = JSON.parse(saved);
      setCitizens(parsed.citizens || []);
      setBuildings(parsed.buildings || []);
      setExercises(parsed.exercises || DEFAULT_EXERCISES);
      setStats(parsed.stats || { 
        money: 1000, 
        streak: 0, 
        totalFocusHours: 0, 
        level: 1, 
        xp: 0, 
        unlockedGridSize: INITIAL_GRID_SIZE,
        completedTopics: []
      });
    } else {
      const init = initializeState();
      setCitizens(init.citizens);
      setBuildings(init.buildings);
      setExercises(init.exercises);
      setStats(init.stats);
    }
  }, []);

  useEffect(() => {
    if (citizens.length > 0) {
      localStorage.setItem('py_city_data', JSON.stringify({ citizens, buildings, exercises, stats }));
    }
  }, [citizens, buildings, exercises, stats]);

  const addExercise = (exercise: Exercise) => {
    setExercises(prev => [exercise, ...prev]);
  };

  const completeExercise = (exerciseId: string) => {
    const ex = exercises.find(e => e.id === exerciseId);
    if (!ex || ex.completed) return;

    setExercises(prev => prev.map(e => e.id === exerciseId ? { ...e, completed: true, status: 'completed' } : e));
    
    // Level Up / XP Progression
    setStats(prev => {
      const newXp = prev.xp + ex.xpReward;
      const xpNeeded = prev.level * 500;
      const levelUp = newXp >= xpNeeded;
      
      const newStats = {
        ...prev,
        xp: levelUp ? newXp - xpNeeded : newXp,
        level: levelUp ? prev.level + 1 : prev.level,
        money: prev.money + ex.moneyReward,
        totalFocusHours: prev.totalFocusHours + (ex.duration / 60),
        completedTopics: Array.from(new Set([...prev.completedTopics, ex.topic]))
      };

      // Achievement logic: every level up might unlock a new citizen if houses are available
      if (levelUp) {
        setCitizens(currentCitizens => {
          const index = currentCitizens.length;
          const avatars = ['🦊', '🐻', '🐼', '🐨', '🐸', '🦁', '🐹', '🐰'];
          const names = ['Kiko', 'Puffy', 'Bamboo', 'Milo', 'Kero', 'Leo', 'Hammy', 'Bun'];
          
          return [...currentCitizens, {
            id: Math.random().toString(36).substr(2, 9),
            name: names[index % names.length],
            avatar: avatars[index % avatars.length],
            level: 1,
            exp: 0,
            status: 'happy',
            lastFocusTime: 0,
          }];
        });
      }

      return newStats;
    });

    // Unlock next exercises if any
    setExercises(prev => {
      // Find one locked exercise and unlock it
      const locked = prev.find(e => e.status === 'locked');
      if (locked) {
        return prev.map(e => e.id === locked.id ? { ...e, status: 'unlocked' } : e);
      }
      return prev;
    });

    // Reward citizen exp if attached
    if (ex.citizenId) {
      setCitizens(prev => prev.map(c => {
        if (c.id === ex.citizenId) {
          const newExp = c.exp + (ex.xpReward / 2);
          const cLevelUp = newExp >= c.level * 100;
          return {
            ...c,
            exp: cLevelUp ? newExp - c.level * 100 : newExp,
            level: cLevelUp ? c.level + 1 : c.level,
            status: 'happy',
          };
        }
        return c;
      }));
    }
  };

  const failExercise = (exerciseId: string) => {
    setExercises(prev => prev.map(e => e.id === exerciseId ? { ...e, status: 'unlocked' } : e));
    setStats(prev => ({ ...prev, streak: 0 })); // Reset streak on failure
  };

  const addBuilding = (type: Building['type']) => {
    const costs: Record<Building['type'], number> = {
      house: 100, villa: 500, mansion: 2000, 
      shop: 500, cafe: 300, office: 1000,
      park: 150, tree_pine: 50, tree_palm: 70, flower: 30, cactus: 40,
      road: 0
    };
    const cost = (costs as any)[type] || 100;

    if (stats.money >= cost) {
      let gridX = 0, gridY = 0;
      let found = false;
      for (let y = 0; y < stats.unlockedGridSize; y++) {
        for (let x = 0; x < stats.unlockedGridSize; x++) {
          if (!buildings.some(b => b.gridX === x && b.gridY === y)) {
            gridX = x; gridY = y; found = true; break;
          }
        }
        if (found) break;
      }

      const newBuilding: Building = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        name: `${type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} ${buildings.length + 1}`,
        gridX,
        gridY,
      };
      
      setBuildings(prev => [...prev, newBuilding]);
      setStats(prev => ({ ...prev, money: prev.money - cost }));

      if (isHouseBuilding(type)) {
        setCitizens(prev => {
          const assigned = new Set(prev.map(c => c.homeId).filter(Boolean));
          const homelessIndex = prev.findIndex(c => !c.homeId);
          if (homelessIndex !== -1 && !assigned.has(newBuilding.id)) {
            const next = [...prev];
            next[homelessIndex] = { ...next[homelessIndex], homeId: newBuilding.id };
            return next;
          }
          return prev;
        });
      }
    }
  };

  const moveBuilding = (id: string, gridX: number, gridY: number) => {
    if (gridX < 0 || gridX >= stats.unlockedGridSize || gridY < 0 || gridY >= stats.unlockedGridSize) return;
    if (buildings.some(b => b.id !== id && b.gridX === gridX && b.gridY === gridY)) return;
    setBuildings(prev => prev.map(b => b.id === id ? { ...b, gridX, gridY } : b));
  };

  const expandLand = () => {
    const cost = stats.unlockedGridSize * 200;
    if (stats.money >= cost && stats.unlockedGridSize < MAX_WORLD_SIZE) {
      setStats(prev => ({
        ...prev,
        money: prev.money - cost,
        unlockedGridSize: prev.unlockedGridSize + 2
      }));
    }
  };

  const updateCitizen = (id: string, updates: Partial<Citizen>) => {
    setCitizens(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const toggleRoad = (gridX: number, gridY: number) => {
    if (gridX < 0 || gridX >= stats.unlockedGridSize || gridY < 0 || gridY >= stats.unlockedGridSize) return;
    const existingRoad = buildings.find(b => b.type === 'road' && b.gridX === gridX && b.gridY === gridY);
    if (existingRoad) {
      setBuildings(prev => prev.filter(b => b.id !== existingRoad.id));
    } else {
      if (buildings.some(b => b.type !== 'road' && b.gridX === gridX && b.gridY === gridY)) return;
      const newRoad: Building = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'road',
        name: `Road ${gridX}-${gridY}`,
        gridX, gridY,
      };
      setBuildings(prev => [...prev, newRoad]);
    }
  };

  return {
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
  };
}
