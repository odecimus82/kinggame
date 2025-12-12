export interface Word {
  id: string;
  english: string;
  phonetic: string;
  chinese: string;
  partOfSpeech: string;
  unit: string;
  example?: string;
}

export interface ExamQuestion {
  id: string;
  unit: string;
  type: 'GRAMMAR' | 'READING';
  question: string; // The stem, e.g., "He ___ to school yesterday."
  options: string[]; // ["go", "went", "gone", "going"]
  correctAnswer: number; // Index of correct option
  explanation: string; // Why this answer is correct
  hint: string; // A nudge in the right direction without giving the answer
}

export interface LibraryCategory {
  id: string;
  name: string;
  description: string;
  units: string[];
}

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  icon: string; // Emoji or Lucide icon name placeholder
  description: string;
}

export interface RedemptionRecord {
  id: string;
  itemName: string;
  cost: number;
  timestamp: number;
}

export interface UserStats {
  username: string; // Added: For login identification
  level: number;
  exp: number; // Total Stars equivalent
  gold: number;
  rankTitle: string; // "荣耀黄金 III"
  matchesPlayed: number;
  correctCount: number;
  loginStreak: number;
  studyMinutes: number; 
  unlockedAchievements: string[]; 
  inventory: string[]; 
  redemptionHistory: RedemptionRecord[]; 
  lastSignInDate?: string; // Added: YYYY-MM-DD for daily check-in
  shopItems?: ShopItem[]; // Added: Custom shop items specific to this user
}

export interface WrongAnswer {
  id: string;
  targetId: string; // wordId or questionId
  type: 'VOCAB' | 'EXAM' | 'DICTATION';
  unit: string;
  timestamp: number;
  count: number; // How many times missed
  repairProgress: number; // Added: 0 to 3, need 3 to clear
}

export interface BattleRecord {
  id: string;
  unit: string;
  mode: 'VOCAB' | 'EXAM' | 'DICTATION';
  score: number;
  maxScore: number;
  timestamp: number;
  rank: string; // e.g. 'S', 'A', 'B'
}

export enum AppView {
  LOGIN = 'LOGIN', // Added: Login Screen
  LOBBY = 'LOBBY',
  DATABASE = 'DATABASE', // Vocabulary list
  BATTLE_PREP = 'BATTLE_PREP', // Select unit
  BATTLE = 'BATTLE', // The Quiz
  ARMORY = 'ARMORY', // Mistakes
  PROFILE = 'PROFILE'
}

export enum Rank {
  BRONZE = '倔强青铜',
  SILVER = '秩序白银',
  GOLD = '荣耀黄金',
  PLATINUM = '尊贵铂金',
  DIAMOND = '永恒钻石',
  STAR = '至尊星耀',
  KING = '最强王者'
}