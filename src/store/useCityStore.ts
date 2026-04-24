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
  },
  {
    id: 'ex-3',
    title: 'Kiểm tra Chẵn Lẻ',
    description: 'Viết hàm is_even(n) trả về True nếu n là số chẵn, ngược lại trả về False.',
    topic: 'conditionals',
    difficulty: 'easy',
    sampleInput: '4',
    sampleOutput: 'True',
    testCases: [{ input: '4', output: 'True' }, { input: '7', output: 'False' }],
    status: 'locked',
    xpReward: 60,
    moneyReward: 120,
    duration: 5,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-4',
    title: 'FizzBuzz Cơ Bản',
    description: 'Viết hàm fizz_buzz(n). Nếu n chia hết cho 3 trả về "Fizz", cho 5 trả về "Buzz", cho cả hai trả về "FizzBuzz", còn lại trả về chính n.',
    topic: 'conditionals',
    difficulty: 'easy',
    sampleInput: '15',
    sampleOutput: 'FizzBuzz',
    testCases: [{ input: '3', output: 'Fizz' }, { input: '5', output: 'Buzz' }, { input: '15', output: 'FizzBuzz' }, { input: '7', output: '7' }],
    status: 'locked',
    xpReward: 80,
    moneyReward: 150,
    duration: 10,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-5',
    title: 'Đảo ngược chuỗi',
    description: 'Viết hàm reverse_string(s) trả về chuỗi đảo ngược của s.',
    topic: 'variables',
    difficulty: 'easy',
    sampleInput: '"Python"',
    sampleOutput: '"nohtyP"',
    testCases: [{ input: '"abc"', output: '"cba"' }, { input: '"Python"', output: '"nohtyP"' }],
    status: 'locked',
    xpReward: 70,
    moneyReward: 140,
    duration: 5,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-6',
    title: 'Tính Giai Thừa',
    description: 'Viết hàm factorial(n) tính giai thừa của n (n!).',
    topic: 'loops',
    difficulty: 'medium',
    sampleInput: '5',
    sampleOutput: '120',
    testCases: [{ input: '0', output: '1' }, { input: '5', output: '120' }, { input: '10', output: '3628800' }],
    status: 'locked',
    xpReward: 150,
    moneyReward: 300,
    duration: 15,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-7',
    title: 'Tổng Danh Sách',
    description: 'Viết hàm sum_list(numbers) tính tổng các số trong một danh sách.',
    topic: 'lists',
    difficulty: 'easy',
    sampleInput: '[1, 2, 3, 4]',
    sampleOutput: '10',
    testCases: [{ input: '[1, 2, 3]', output: '6' }, { input: '[]', output: '0' }],
    status: 'locked',
    xpReward: 90,
    moneyReward: 180,
    duration: 8,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-8',
    title: 'Tìm Số Lớn Nhất',
    description: 'Viết hàm find_max(numbers) trả về số lớn nhất trong danh sách.',
    topic: 'lists',
    difficulty: 'easy',
    sampleInput: '[1, 5, 2, 9, 3]',
    sampleOutput: '9',
    testCases: [{ input: '[1, 5, 2]', output: '5' }, { input: '[-1, -5, -2]', output: '-1' }],
    status: 'locked',
    xpReward: 100,
    moneyReward: 200,
    duration: 10,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-9',
    title: 'Đếm Nguyên Âm',
    description: 'Viết hàm count_vowels(s) đếm số lượng nguyên âm (a, e, i, o, u) trong chuỗi s.',
    topic: 'loops',
    difficulty: 'easy',
    sampleInput: '"hello world"',
    sampleOutput: '3',
    testCases: [{ input: '"apple"', output: '2' }, { input: '"sky"', output: '0' }],
    status: 'locked',
    xpReward: 110,
    moneyReward: 220,
    duration: 12,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-10',
    title: 'Chuyển đổi Nhiệt độ',
    description: 'Viết hàm c_to_f(celsius) chuyển từ độ C sang độ F.',
    topic: 'variables',
    difficulty: 'easy',
    sampleInput: '0',
    sampleOutput: '32.0',
    testCases: [{ input: '0', output: '32.0' }, { input: '100', output: '212.0' }],
    status: 'locked',
    xpReward: 50,
    moneyReward: 100,
    duration: 5,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-11',
    title: 'Kiểm tra Palindrome',
    description: 'Viết hàm is_palindrome(s) kiểm tra xem chuỗi s có phải là chuỗi đối xứng hay không.',
    topic: 'strings' as any, // Using string as it fits basic logic
    difficulty: 'medium',
    sampleInput: '"radar"',
    sampleOutput: 'True',
    testCases: [{ input: '"radar"', output: 'True' }, { input: '"python"', output: 'False' }],
    status: 'locked',
    xpReward: 160,
    moneyReward: 320,
    duration: 20,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-12',
    title: 'Đếm Tần Suất',
    description: 'Viết hàm count_occurrence(items) nhận vào một danh sách và trả về dictionary chứa tần suất xuất hiện của từng phần tử.',
    topic: 'dictionaries',
    difficulty: 'medium',
    sampleInput: '["a", "b", "a"]',
    sampleOutput: '{"a": 2, "b": 1}',
    testCases: [{ input: '["a", "b", "a"]', output: '{"a": 2, "b": 1}' }, { input: '[1, 1, 1]', output: '{1: 3}' }],
    status: 'locked',
    xpReward: 180,
    moneyReward: 360,
    duration: 20,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-13',
    title: 'Lọc Số Chẵn',
    description: 'Viết hàm filter_even(numbers) sử dụng list comprehension để lọc ra các số chẵn.',
    topic: 'lists',
    difficulty: 'medium',
    sampleInput: '[1, 2, 3, 4, 5, 6]',
    sampleOutput: '[2, 4, 6]',
    testCases: [{ input: '[1, 2, 3, 4]', output: '[2, 4]' }, { input: '[1, 3, 5]', output: '[]' }],
    status: 'locked',
    xpReward: 150,
    moneyReward: 300,
    duration: 15,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-14',
    title: 'Lớp Dog Cơ Bản',
    description: 'Tạo class Dog với thuộc tính name và method bark() trả về "Gâu gâu!" + name.',
    topic: 'oop',
    difficulty: 'medium',
    sampleInput: 'Dog("Mochi").bark()',
    sampleOutput: '"Gâu gâu! Mochi"',
    testCases: [{ input: 'Dog("Lu").bark()', output: '"Gâu gâu! Lu"' }],
    status: 'locked',
    xpReward: 200,
    moneyReward: 400,
    duration: 25,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-15',
    title: 'Kế thừa trong OOP',
    description: 'Tạo class Animal và class Cat kế thừa từ Animal. Animal có method speak(). Cat override speak() trả về "Meow".',
    topic: 'oop',
    difficulty: 'medium',
    sampleInput: 'Cat().speak()',
    sampleOutput: '"Meow"',
    testCases: [{ input: 'Cat().speak()', output: '"Meow"' }],
    status: 'locked',
    xpReward: 220,
    moneyReward: 450,
    duration: 30,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-16',
    title: 'Viết File cơ bản',
    description: 'Viết hàm write_secret(filename, content) để ghi content vào file filename.',
    topic: 'files',
    difficulty: 'medium',
    sampleInput: '"secret.txt", "Pass: 123"',
    sampleOutput: 'None',
    testCases: [{ input: '"test.txt", "hello"', output: 'None' }],
    status: 'locked',
    xpReward: 190,
    moneyReward: 380,
    duration: 20,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-17',
    title: 'Đọc File cơ bản',
    description: 'Viết hàm read_content(filename) trả về nội dung của file filename.',
    topic: 'files',
    difficulty: 'medium',
    sampleInput: '"note.txt"',
    sampleOutput: '"Nội dung file"',
    testCases: [{ input: '"note.txt"', output: '"Nội dung file"' }],
    status: 'locked',
    xpReward: 190,
    moneyReward: 380,
    duration: 20,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-18',
    title: 'Tìm Số Fibonacci',
    description: 'Viết hàm fibonacci(n) trả về số Fibonacci thứ n.',
    topic: 'functions',
    difficulty: 'hard',
    sampleInput: '6',
    sampleOutput: '8',
    testCases: [{ input: '0', output: '0' }, { input: '1', output: '1' }, { input: '6', output: '8' }, { input: '10', output: '55' }],
    status: 'locked',
    xpReward: 300,
    moneyReward: 600,
    duration: 40,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-19',
    title: 'Kiểm tra Anagram',
    description: 'Viết hàm are_anagrams(s1, s2) để kiểm tra xem hai chuỗi có phải là Anagram của nhau không (đảo chữ).',
    topic: 'dictionaries',
    difficulty: 'hard',
    sampleInput: '"listen", "silent"',
    sampleOutput: 'True',
    testCases: [{ input: '"listen", "silent"', output: 'True' }, { input: '"hello", "world"', output: 'False' }],
    status: 'locked',
    xpReward: 280,
    moneyReward: 560,
    duration: 35,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-20',
    title: 'Cộng Ma Trận',
    description: 'Viết hàm add_matrices(m1, m2) để cộng hai ma trận 2D có cùng kích thước.',
    topic: 'lists',
    difficulty: 'hard',
    sampleInput: '[[1, 2], [3, 4]], [[5, 6], [7, 8]]',
    sampleOutput: '[[6, 8], [10, 12]]',
    testCases: [{ input: '[[1, 1], [1, 1]], [[2, 2], [2, 2]]', output: '[[3, 3], [3, 3]]' }],
    status: 'locked',
    xpReward: 350,
    moneyReward: 700,
    duration: 45,
    completed: false,
    createdAt: Date.now(),
  },
  {
    id: 'ex-21',
    title: 'Hệ Thống Ngân Hàng',
    description: 'Tạo class BankAccount với balance, method deposit(amount) và withdraw(amount). Nếu withdraw > balance thì không cho rút và trả về False.',
    topic: 'oop',
    difficulty: 'hard',
    sampleInput: 'BankAccount(100).withdraw(150)',
    sampleOutput: 'False',
    testCases: [{ input: 'BankAccount(100).deposit(50).balance', output: '150' }, { input: 'BankAccount(100).withdraw(50).balance', output: '50' }],
    status: 'locked',
    xpReward: 400,
    moneyReward: 800,
    duration: 50,
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
