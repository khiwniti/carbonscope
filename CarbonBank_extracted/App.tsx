import React, { useState, Suspense, lazy, useEffect } from 'react';
import { AppProvider, useAppStore } from './contexts/AppContext';
import BottomNav from './components/BottomNav';
import Login from './components/Login';
import Loading from './components/Loading';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/Dashboard'; // Keep Dashboard eager for LCP
import { ViewState, Tree, LandDeed, Transaction, UserProfile, TreeStatus } from './types';
import { TreeAnalysisResult } from './services/geminiService';
import { CheckCircle, Trophy } from 'lucide-react';

// Lazy Load heavy components for Code Splitting
const MapPlotter = lazy(() => import('./components/MapPlotter'));
const TreeScanner = lazy(() => import('./components/TreeScanner'));
const LandDeedProcessor = lazy(() => import('./components/LandDeedProcessor'));
const Profile = lazy(() => import('./components/Profile'));
const TreeDetail = lazy(() => import('./components/TreeDetail'));
const TradingMarket = lazy(() => import('./components/TradingMarket'));
const TreeList = lazy(() => import('./components/TreeList'));

// Main Content Component (Consumes Context)
const AppContent: React.FC = () => {
  const { 
      trees, setTrees,
      landDeeds, setLandDeeds,
      achievements,
      transactions, setTransactions,
      walletBalance, setWalletBalance,
      userProfile,
      totalCarbonAssets,
      isAuthenticated,
      isInitializing,
      login,
      notification, showToast,
      achievementUnlock
  } = useAppStore();

  const [currentView, setView] = useState<ViewState>('DASHBOARD');
  const [pendingLocation, setPendingLocation] = useState<{lat: number, lng: number, deedId?: string} | null>(null);
  const [focusedTreeId, setFocusedTreeId] = useState<string | null>(null);
  const [selectedTreeForDetail, setSelectedTreeForDetail] = useState<Tree | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  
  // Onboarding State
  const [showDeedOnboarding, setShowDeedOnboarding] = useState(false);

  // Check for Deed Onboarding on Auth
  useEffect(() => {
      if (isAuthenticated && !isInitializing) {
          // If user has no deeds, force onboarding
          if (landDeeds.length === 0) {
              setShowDeedOnboarding(true);
          }
      }
  }, [isAuthenticated, isInitializing, landDeeds]);

  // Handlers
  const handleLogin = async (method: 'LINE' | 'GUEST') => {
      setIsLoginLoading(true);
      if (method === 'LINE') {
          try {
              // @ts-ignore
              if (window.liff && !window.liff.isLoggedIn()) {
                  // @ts-ignore
                  window.liff.login();
              } else {
                 // Demo fallback
                 setTimeout(() => {
                      login({
                          userId: 'line-user-123',
                          displayName: 'สมชาย รักป่า (LINE)',
                          pictureUrl: undefined,
                          statusMessage: 'Verified Member'
                      });
                      setIsLoginLoading(false);
                 }, 1000);
              }
          } catch (e) {
              alert("Login failed. Using demo mode.");
              handleLogin('GUEST');
          }
      } else {
          setTimeout(() => {
              login({
                  userId: 'guest-001',
                  displayName: 'ผู้เยี่ยมชม (Guest)',
                  pictureUrl: undefined,
                  statusMessage: 'Guest Mode'
              });
              setIsLoginLoading(false);
          }, 800);
      }
  };

  const handleStartPlanting = (lat: number, lng: number, deedId?: string) => {
    setPendingLocation({ lat, lng, deedId });
  };

  const handleTreeSelectFromDashboard = (tree: Tree) => {
    setSelectedTreeForDetail(tree);
    setView('TREE_DETAIL');
  };

  const handleSaveTree = (analysis: TreeAnalysisResult, image: string) => {
    const newTree: Tree = {
      id: Date.now().toString(),
      species: analysis.species,
      plantedDate: new Date().toISOString().split('T')[0],
      circumference: 45, height: 5, status: TreeStatus.ALIVE,
      carbonCredit: 9.5,
      imageUrl: image,
      lat: pendingLocation?.lat ?? 13.75633,
      lng: pendingLocation?.lng ?? 100.50177,
      deedId: pendingLocation?.deedId
    };

    setTrees((prev) => [...prev, newTree]);
    setPendingLocation(null);
    setFocusedTreeId(newTree.id);
    setView(pendingLocation ? 'MAP_PLOT' : 'DASHBOARD');
    showToast(`บันทึกข้อมูล "${newTree.species}" สำเร็จ`);
  };

  const handleUpdateTree = (updatedTree: Tree) => {
      setTrees(prev => prev.map(t => t.id === updatedTree.id ? updatedTree : t));
      setSelectedTreeForDetail(updatedTree);
      showToast(`อัปเดตข้อมูล ${updatedTree.species} เรียบร้อย`);
  };

  const handleDeleteTree = (treeId: string) => {
      setTrees(prev => prev.filter(t => t.id !== treeId));
      setSelectedTreeForDetail(null);
      showToast('ลบข้อมูลต้นไม้เรียบร้อย');
  };

  const handleSaveDeed = (deed: LandDeed, associatedTreeIds: string[] = []) => {
      setLandDeeds(prev => [...prev, deed]);
      if (associatedTreeIds.length > 0) {
        setTrees(prev => prev.map(t => 
          associatedTreeIds.includes(t.id) ? { ...t, deedId: deed.id } : t
        ));
        showToast(`เพิ่มโฉนด ${deed.deedNumber} และอัปเดตต้นไม้ ${associatedTreeIds.length} ต้น`);
      } else {
        showToast(`เพิ่มโฉนด ${deed.deedNumber} ลงแผนที่แล้ว`);
      }
      
      // If we were in onboarding, finish it
      if (showDeedOnboarding) {
          setShowDeedOnboarding(false);
          setView('DASHBOARD');
      } else {
        setView('MAP_PLOT');
      }
  };

  const handleTrade = (amountKg: number, pricePerTon: number, type: 'BUY' | 'SELL') => {
      const pricePerKg = pricePerTon / 1000;
      const totalVal = amountKg * pricePerKg;
      
      if (type === 'BUY' && totalVal > walletBalance) {
          showToast('ยอดเงินไม่เพียงพอ');
          return;
      }
      const txType = type === 'SELL' ? 'DEPOSIT' : 'WITHDRAWAL';
      const newTransaction: Transaction = {
          id: `tx-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          amount: totalVal,
          type: txType,
          status: 'COMPLETED',
          description: type === 'SELL' ? `ขายเครดิต (${amountKg} kg)` : `ซื้อเครดิต (${amountKg} kg)`
      };

      setTransactions(prev => [newTransaction, ...prev]);
      setWalletBalance(prev => type === 'SELL' ? prev + totalVal : prev - totalVal);
      showToast(type === 'SELL' ? `ขายสำเร็จ! รับเงิน ${totalVal.toLocaleString()} บาท` : `ซื้อสำเร็จ!`);
  };

  // 1. Splash Screen
  if (isInitializing) {
    return <Loading />;
  }

  // 2. Auth Guard
  if (!isAuthenticated) {
      return (
          <div className="h-[100dvh] w-full max-w-md mx-auto bg-gray-900 shadow-2xl overflow-hidden relative flex flex-col font-sarabun">
             <Login onLogin={handleLogin} isLoading={isLoginLoading} />
          </div>
      );
  }

  // 3. Deed Onboarding Guard
  if (showDeedOnboarding) {
      return (
         <div className="h-[100dvh] w-full max-w-md mx-auto bg-white shadow-2xl overflow-hidden relative flex flex-col font-sarabun z-50">
             <Suspense fallback={<Loading />}>
                <LandDeedProcessor 
                    trees={trees} 
                    onSave={handleSaveDeed} 
                    onSkip={() => setShowDeedOnboarding(false)}
                    isFirstTime={true}
                />
             </Suspense>
         </div>
      );
  }

  // 4. Main App View Router with Transitions
  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto bg-gray-50 shadow-2xl overflow-hidden relative flex flex-col font-sarabun">
      <main className="flex-1 overflow-y-auto no-scrollbar pt-safe scroll-smooth relative">
        <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            {/* Key on currentView triggers animation on switch */}
            <div key={currentView} className="h-full animate-fade-in">
                {currentView === 'DASHBOARD' && (
                    <Dashboard 
                        trees={trees} 
                        onTreeSelect={handleTreeSelectFromDashboard} 
                        userProfile={userProfile || { userId: 'guest', displayName: 'Guest' }} 
                        onNavigate={setView}
                    />
                )}
                {currentView === 'MAP_PLOT' && (
                    <MapPlotter 
                        trees={trees}
                        landDeeds={landDeeds}
                        focusedTreeId={focusedTreeId}
                        onStartPlanting={handleStartPlanting} 
                        onNavigateToScanner={() => setView('SCANNER')}
                        onViewTreeDetail={(t) => { setSelectedTreeForDetail(t); setView('TREE_DETAIL'); }}
                    />
                )}
                {currentView === 'SCANNER' && (
                    <TreeScanner onSave={handleSaveTree} />
                )}
                {currentView === 'TRADING_MARKET' && (
                    <TradingMarket 
                        walletBalance={walletBalance} 
                        carbonAssets={totalCarbonAssets}
                        onTrade={handleTrade}
                    />
                )}
                {currentView === 'PROFILE' && (
                    <Profile 
                        userProfile={userProfile || { userId: 'guest', displayName: 'Guest' }}
                        achievements={achievements} 
                        transactions={transactions} 
                        walletBalance={walletBalance}
                        totalCarbonAssets={totalCarbonAssets}
                        onTrade={handleTrade}
                    />
                )}
                {currentView === 'TREE_DETAIL' && selectedTreeForDetail && (
                    <TreeDetail 
                        tree={selectedTreeForDetail} 
                        onBack={() => setView('DASHBOARD')}
                        onUpdate={handleUpdateTree}
                        onDelete={handleDeleteTree}
                    />
                )}
                {currentView === 'TREE_LIST' && (
                    <TreeList 
                        trees={trees}
                        onBack={() => setView('DASHBOARD')}
                        onSelectTree={(t) => { setSelectedTreeForDetail(t); setView('TREE_DETAIL'); }}
                    />
                )}
            </div>
        </Suspense>
      </main>
      
      {currentView !== 'TREE_DETAIL' && currentView !== 'SCANNER' && currentView !== 'TREE_LIST' && (
         <BottomNav currentView={currentView} setView={setView} />
      )}

      {notification && (
        <div className="absolute top-12 left-4 right-4 z-50 animate-slide-up pointer-events-none">
           <div className="bg-gray-800/90 backdrop-blur text-white px-4 py-3 rounded-lg shadow-xl flex items-center space-x-3 pointer-events-auto">
              <CheckCircle className="text-green-400" size={20} />
              <span className="font-medium text-sm">{notification}</span>
           </div>
        </div>
      )}

      {achievementUnlock && (
        <div className="absolute top-1/3 left-4 right-4 z-[60] animate-bounce-small pointer-events-none">
           <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center border-4 border-white/50 pointer-events-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-3 shadow-md relative z-10">
                 <Trophy size={32} className="text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-wider relative z-10">Achievement Unlocked!</h3>
              <p className="font-medium text-yellow-50 mt-1 relative z-10">"{achievementUnlock}"</p>
           </div>
        </div>
      )}
    </div>
  );
};

// Root App Component Wrapping Providers
const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <AppProvider>
                <AppContent />
            </AppProvider>
        </ErrorBoundary>
    );
};

export default App;