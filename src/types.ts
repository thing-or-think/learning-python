export type CitizenStatus = 'growing' | 'happy' | 'sad' | 'gone';

export interface Citizen {
  id: string;
  name: string;
  avatar: string;
  level: number;
  exp: number;
  status: CitizenStatus;
  lastFocusTime: number; // in minutes
  homeId?: string; // the house this citizen belongs to
  workplaceType?: 'shop' | 'office' | 'cafe'; // the type of building this citizen works at
}

export interface Building {
  id: string;
  type: 'house' | 'villa' | 'mansion' | 'shop' | 'office' | 'cafe' | 'park' | 'tree_pine' | 'tree_palm' | 'flower' | 'cactus' | 'road';
  name: string;
  gridX: number; // grid coordinate (0 to GRID_SIZE - 1)
  gridY: number; // grid coordinate (0 to GRID_SIZE - 1)
}

export type ExerciseDifficulty = 'easy' | 'medium' | 'hard';
export type ExerciseTopic = 'variables' | 'conditionals' | 'loops' | 'functions' | 'lists' | 'dictionaries' | 'files' | 'oop';

export interface Exercise {
  id: string;
  title: string;
  description: string;
  topic: ExerciseTopic;
  difficulty: ExerciseDifficulty;
  sampleInput: string;
  sampleOutput: string;
  testCases: { input: string; output: string }[];
  duration: number; // estimated completion time in minutes
  completed: boolean;
  citizenId?: string; // which citizen growth it influences
  status: 'locked' | 'unlocked' | 'completed';
  xpReward: number;
  moneyReward: number;
  createdAt: number;
}

export interface UserStats {
  money: number;
  streak: number;
  totalFocusHours: number;
  level: number;
  xp: number;
  unlockedGridSize: number; // current dimension of unlocked square grid
  completedTopics: ExerciseTopic[];
}
