import { Tree, LandDeed, Achievement, Transaction, UserProfile, TreeStatus } from '../types';
import { MOCK_TREES, CARBON_PER_TREE_YEAR } from '../constants';

const KEYS = {
  TREES: 'cb_trees',
  DEEDS: 'cb_deeds',
  ACHIEVEMENTS: 'cb_achievements',
  TRANSACTIONS: 'cb_transactions',
  BALANCE: 'cb_balance',
};

// Simulated delay to mimic real API network latency (optional, for realism)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const StorageService = {
  getTrees: async (): Promise<Tree[]> => {
    // await delay(100); 
    const saved = localStorage.getItem(KEYS.TREES);
    return saved ? JSON.parse(saved) : MOCK_TREES;
  },

  saveTrees: async (trees: Tree[]): Promise<void> => {
    localStorage.setItem(KEYS.TREES, JSON.stringify(trees));
  },

  getDeeds: async (): Promise<LandDeed[]> => {
    const saved = localStorage.getItem(KEYS.DEEDS);
    return saved ? JSON.parse(saved) : [];
  },

  saveDeeds: async (deeds: LandDeed[]): Promise<void> => {
    localStorage.setItem(KEYS.DEEDS, JSON.stringify(deeds));
  },

  getAchievements: async (initial: Achievement[]): Promise<Achievement[]> => {
    const saved = localStorage.getItem(KEYS.ACHIEVEMENTS);
    return saved ? JSON.parse(saved) : initial;
  },

  saveAchievements: async (achievements: Achievement[]): Promise<void> => {
    localStorage.setItem(KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
  },

  getTransactions: async (initial: Transaction[]): Promise<Transaction[]> => {
    const saved = localStorage.getItem(KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : initial;
  },

  saveTransactions: async (transactions: Transaction[]): Promise<void> => {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },

  getBalance: async (initial: number): Promise<number> => {
    const saved = localStorage.getItem(KEYS.BALANCE);
    return saved ? parseFloat(saved) : initial;
  },

  saveBalance: async (balance: number): Promise<void> => {
    localStorage.setItem(KEYS.BALANCE, balance.toString());
  }
};

export const LogicService = {
    calculateTotalCarbon: (trees: Tree[]): number => {
        return trees.filter(t => t.status === TreeStatus.ALIVE).length * CARBON_PER_TREE_YEAR;
    }
};