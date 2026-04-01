import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tree, LandDeed, Achievement, Transaction, UserProfile, ViewState, TreeStatus } from '../types';
import { StorageService, LogicService } from '../services/storage';
import { CARBON_PER_TREE_YEAR } from '../constants';

interface AppContextType {
  // State
  trees: Tree[];
  landDeeds: LandDeed[];
  achievements: Achievement[];
  transactions: Transaction[];
  walletBalance: number;
  userProfile: UserProfile | null;
  totalCarbonAssets: number;
  isAuthenticated: boolean;
  isInitializing: boolean;
  
  // Actions
  setTrees: (trees: Tree[] | ((prev: Tree[]) => Tree[])) => void;
  setLandDeeds: (deeds: LandDeed[] | ((prev: LandDeed[]) => LandDeed[])) => void;
  setTransactions: (txs: Transaction[] | ((prev: Transaction[]) => Transaction[])) => void;
  setWalletBalance: (bal: number | ((prev: number) => number)) => void;
  login: (profile: UserProfile) => void;
  logout: () => void;
  
  // Notifications
  notification: string | null;
  showToast: (msg: string) => void;
  achievementUnlock: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_ACHIEVEMENTS: Achievement[] = [
    { id: 'a1', title: 'นักปลูกมือใหม่', description: 'ลงทะเบียนต้นไม้ครบ 5 ต้น', icon: '🌱', unlocked: false, progress: 0, maxProgress: 5 },
    { id: 'a2', title: 'Carbon Master', description: 'สะสมคาร์บอนครบ 100 kg', icon: '💎', unlocked: false, progress: 0, maxProgress: 100 },
    { id: 'a3', title: 'เจ้าที่ดิน', description: 'ลงทะเบียนโฉนด 1 แปลง', icon: '📜', unlocked: false, progress: 0, maxProgress: 1 },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
    { id: 't1', date: '2024-03-10', amount: 1500, type: 'DEPOSIT', status: 'COMPLETED', description: 'ขายคาร์บอนเครดิต (Lot #4)' },
    { id: 't2', date: '2024-02-28', amount: 500, type: 'WITHDRAWAL', status: 'COMPLETED', description: 'ถอนเข้ากสิกรไทย' },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Data
  const [trees, setTrees] = useState<Tree[]>([]);
  const [landDeeds, setLandDeeds] = useState<LandDeed[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  // Computed
  const totalCarbonAssets = LogicService.calculateTotalCarbon(trees);

  // UI
  const [notification, setNotification] = useState<string | null>(null);
  const [achievementUnlock, setAchievementUnlock] = useState<string | null>(null);

  // Load Data
  useEffect(() => {
      const loadData = async () => {
          const [loadedTrees, loadedDeeds, loadedAch, loadedTxs, loadedBal] = await Promise.all([
              StorageService.getTrees(),
              StorageService.getDeeds(),
              StorageService.getAchievements(INITIAL_ACHIEVEMENTS),
              StorageService.getTransactions(INITIAL_TRANSACTIONS),
              StorageService.getBalance(4250.00)
          ]);

          setTrees(loadedTrees);
          setLandDeeds(loadedDeeds);
          setAchievements(loadedAch);
          setTransactions(loadedTxs);
          setWalletBalance(loadedBal);
          
          // LIFF Init Logic
          try {
            // @ts-ignore
            if (window.liff) {
                const liffId = 'YOUR_LIFF_ID'; // Placeholder check
                if (liffId !== 'YOUR_LIFF_ID') {
                    // @ts-ignore
                    await window.liff.init({ liffId }); 
                    // @ts-ignore
                    if (window.liff.isLoggedIn()) {
                        // @ts-ignore
                        const profile = await window.liff.getProfile();
                        setUserProfile(profile as UserProfile);
                        setIsAuthenticated(true);
                    }
                } else {
                    console.log('LIFF skipped: Placeholder ID detected');
                }
            }
          } catch (e) {
             console.log('LIFF init failed or local mode', e);
          }

          setTimeout(() => setIsInitializing(false), 1500);
      };
      loadData();
  }, []);

  // Persistence Effects
  useEffect(() => { if (!isInitializing) StorageService.saveTrees(trees); checkAchievements(); }, [trees]);
  useEffect(() => { if (!isInitializing) StorageService.saveDeeds(landDeeds); checkAchievements(); }, [landDeeds]);
  useEffect(() => { if (!isInitializing) StorageService.saveAchievements(achievements); }, [achievements]);
  useEffect(() => { if (!isInitializing) StorageService.saveTransactions(transactions); }, [transactions]);
  useEffect(() => { if (!isInitializing) StorageService.saveBalance(walletBalance); }, [walletBalance]);

  // Notifications auto-dismiss
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (achievementUnlock) {
      const timer = setTimeout(() => setAchievementUnlock(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [achievementUnlock]);

  const checkAchievements = () => {
      if (isInitializing) return;

      const totalTrees = trees.length;
      const totalCarbon = totalCarbonAssets;
      const totalDeeds = landDeeds.length;

      setAchievements(prev => {
          let hasChange = false;
          const updated = prev.map(ach => {
              let newProgress = ach.progress;
              let isUnlocked = ach.unlocked;

              if (ach.id === 'a1') newProgress = totalTrees;
              if (ach.id === 'a2') newProgress = totalCarbon;
              if (ach.id === 'a3') newProgress = totalDeeds;

              if (newProgress >= ach.maxProgress && !ach.unlocked) {
                  isUnlocked = true;
                  setAchievementUnlock(ach.title);
              }
              
              if (newProgress !== ach.progress || isUnlocked !== ach.unlocked) {
                  hasChange = true;
                  return { ...ach, progress: newProgress, unlocked: isUnlocked };
              }
              return ach;
          });
          return hasChange ? updated : prev;
      });
  };

  const login = (profile: UserProfile) => {
      setUserProfile(profile);
      setIsAuthenticated(true);
  };

  const logout = () => {
      setUserProfile(null);
      setIsAuthenticated(false);
  };

  const showToast = (msg: string) => setNotification(msg);

  return (
    <AppContext.Provider value={{
        trees, setTrees,
        landDeeds, setLandDeeds,
        achievements,
        transactions, setTransactions,
        walletBalance, setWalletBalance,
        userProfile,
        totalCarbonAssets,
        isAuthenticated,
        isInitializing,
        login, logout,
        notification, showToast,
        achievementUnlock
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useAppStore must be used within AppProvider");
    return context;
};