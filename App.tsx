
import React, { useState, useEffect, useMemo } from 'react';
import type { Transaction, Recommendation, Order, Portfolio } from './types';
import { Header } from './components/Header';
import { NewPortfolioForm } from './components/SimulationControls';
import { TransactionLog, CompletedTradesLog } from './components/ResultsDisplay';
import { Footer } from './components/Footer';
import { BuyIcon, SellIcon } from './components/Icons';
import { EvaluationScreen } from './components/EvaluationScreen';
import { Dashboard } from './components/Dashboard';
import { TransactionModal } from './components/TransactionModal';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(value);

const calculatePortfolioStats = (transactions: Transaction[]) => {
    let shares = 0;
    let costBasis = 0;
    let paid = 0;
    let sold = 0;

    transactions.forEach(tx => {
      if (tx.type === 'buy') {
        const transactionCost = tx.price * tx.quantity;
        costBasis += transactionCost;
        paid += transactionCost;
        shares += tx.quantity;
      } else {
        sold += tx.price * tx.quantity;
        if (shares > 0) {
          const costOfSoldShares = (costBasis / shares) * tx.quantity;
          costBasis -= costOfSoldShares;
        }
        shares -= tx.quantity;
      }
    });

    const avg = shares > 0 ? costBasis / shares : 0;
    
    return {
      sharesHeld: shares < 0.0001 ? 0 : shares,
      avgPrice: avg,
      totalPaid: paid,
      totalSold: sold
    };
};

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const isBuy = order.type === 'buy';
    const bgColor = isBuy ? 'bg-gray-900' : 'bg-gray-900';
    const titleColor = isBuy ? 'text-green-400' : 'text-red-400';
    
    return (
        <div className={`${bgColor} p-4 rounded-lg`}>
            <div className="flex items-center mb-3">
                {isBuy ? <BuyIcon className="w-6 h-6 text-green-400 mr-3" /> : <SellIcon className="w-6 h-6 text-red-400 mr-3" />}
                <h4 className={`text-lg font-semibold ${titleColor}`}>{order.description}</h4>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-700 p-3 rounded-lg">
                    <h5 className="text-sm text-gray-400">주문 유형</h5>
                    <p className="font-bold text-white">{order.orderType}</p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg">
                    <h5 className="text-sm text-gray-400">주문 수량</h5>
                    <p className="font-bold text-white">
                        {order.quantity ? formatNumber(order.quantity) : '-'}
                        {order.portion && <span className="text-xs text-gray-300 ml-1">({order.portion})</span>}
                    </p>
                </div>
                <div className="bg-gray-700 p-3 rounded-lg col-span-2">
                    <h5 className="text-sm text-gray-400">기준가</h5>
                    <p className="font-bold text-white">{order.price !== undefined ? formatCurrency(order.price) : '시장가'}</p>
                </div>
            </div>
        </div>
    );
};

const RecommendationDisplay: React.FC<{ recommendation: Recommendation | null }> = ({ recommendation }) => {
  if (!recommendation || recommendation.mode === 'no-action') {
    return (
      <div className="text-center p-8 -mt-2 mb-8 bg-gray-800 rounded-lg shadow-xl">
        <h3 className="text-lg text-gray-400">첫 매수 기록을 추가하면 다음 거래 계획이 여기에 표시됩니다.</h3>
      </div>
    );
  }

  const modeText = {
      'normal': '일반 모드',
      'transition-to-loss-cut': '쿼터 손절 모드 진입 대기',
      'quarter-loss-cut': '쿼터 손절 모드'
  };

  return (
    <div className="-mt-2 mb-8">
      <h2 className="text-2xl font-bold text-teal-400 mb-4">다음 거래 계획</h2>
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <div className="bg-gray-700/50 p-4 rounded-lg mb-6 text-center">
            <h3 className="text-xl font-bold text-yellow-400">{modeText[recommendation.mode]}</h3>
            <div className="mt-2 text-sm text-gray-300 flex justify-center gap-x-4 gap-y-1 flex-wrap">
                {recommendation.T !== undefined && <span>T: {recommendation.T.toFixed(1)}</span>}
                {recommendation.SP_percentage !== undefined && <span>SP: {(recommendation.SP_percentage * 100).toFixed(2)}%</span>}
                {recommendation.mode === 'quarter-loss-cut' && <span>매수 횟수: {recommendation.quarterModeBuyCount || 0}/10</span>}
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="text-xl font-semibold text-white mb-3">매수 계획</h3>
                <div className="space-y-4">
                    {recommendation.buyOrders.length > 0 ? recommendation.buyOrders.map((order, i) => <OrderCard key={`buy-${i}`} order={order} />) : <p className="text-gray-400 text-center py-4">계획 없음</p>}
                </div>
            </div>
            <div>
                <h3 className="text-xl font-semibold text-white mb-3">매도 계획</h3>
                <div className="space-y-4">
                    {recommendation.sellOrders.length > 0 ? recommendation.sellOrders.map((order, i) => <OrderCard key={`sell-${i}`} order={order} />) : <p className="text-gray-400 text-center py-4">계획 없음</p>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};


const APP_STATE_KEY = 'tradingLogAppState_v4';

const recalculatePortfolioState = (portfolio: Portfolio): Portfolio => {
    const transactions = [...portfolio.transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (transactions.length === 0) {
        return {
            ...portfolio,
            transactions: [],
            status: 'ongoing',
            isQuarterLossCutMode: false,
            quarterModeBuyCount: 0,
            evaluationResult: undefined,
            startDate: undefined,
            endDate: undefined,
        };
    }

    // Recalculate quarter mode status by iterating through transactions chronologically
    let isQuarterLossCutMode = false;
    let quarterModeBuyCount = 0;
    let tempTransactions: Transaction[] = [];
    for (const tx of transactions) {
        const statsBeforeTx = calculatePortfolioStats(tempTransactions);
        let modeBeforeTx: Recommendation['mode'] = 'no-action';
        if (statsBeforeTx.sharesHeld > 0 && portfolio.totalInvestment > 0) {
            const oneTimeBuyAmount = portfolio.totalInvestment / 40;
            if (oneTimeBuyAmount > 0) {
                const T_raw = statsBeforeTx.totalPaid / oneTimeBuyAmount;
                const T = Math.ceil(T_raw * 10) / 10;
                if (T > 39 && T <= 40 && !isQuarterLossCutMode) {
                    modeBeforeTx = 'transition-to-loss-cut';
                } else if (isQuarterLossCutMode) {
                    modeBeforeTx = 'quarter-loss-cut';
                }
            }
        }
        if (modeBeforeTx === 'transition-to-loss-cut' && tx.type === 'sell') {
            isQuarterLossCutMode = true;
            quarterModeBuyCount = 0;
        } else if (isQuarterLossCutMode) {
            if (tx.type === 'buy') {
                quarterModeBuyCount += 1;
            } else { // sell
                if (quarterModeBuyCount < 10) {
                    isQuarterLossCutMode = false;
                }
                quarterModeBuyCount = 0;
            }
        }
        tempTransactions.push(tx);
    }

    const { sharesHeld, totalPaid, totalSold } = calculatePortfolioStats(transactions);
    const isCompleted = transactions.length > 0 && sharesHeld === 0;

    const earliestTxDate = transactions[0].date;
    const latestTxDate = transactions[transactions.length - 1].date;

    return {
        ...portfolio,
        transactions,
        isQuarterLossCutMode,
        quarterModeBuyCount,
        status: isCompleted ? 'completed' : 'ongoing',
        evaluationResult: isCompleted ? { totalPaid, totalSold } : undefined,
        startDate: earliestTxDate,
        endDate: isCompleted ? latestTxDate : undefined,
    };
};

const App: React.FC = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activeTab, setActiveTab] = useState<'ongoing' | 'completed'>('ongoing');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  
  const [modal, setModal] = useState<'addPortfolio' | 'addTransaction' | 'editTransaction' | null>(null);
  const [transactionTypeForModal, setTransactionTypeForModal] = useState<'buy' | 'sell'>('buy');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [portfolioForEvaluation, setPortfolioForEvaluation] = useState<Portfolio | null>(null);
  
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(APP_STATE_KEY);
      if (savedState) {
        const loadedPortfolios: Portfolio[] = JSON.parse(savedState);
        const recalculatedPortfolios = loadedPortfolios.map(recalculatePortfolioState);
        setPortfolios(recalculatedPortfolios);
        const lastOngoing = recalculatedPortfolios.find((p) => p.status === 'ongoing');
        if (lastOngoing) {
          setSelectedPortfolioId(lastOngoing.id);
        }
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
  }, []);

  const saveState = (updatedPortfolios: Portfolio[]) => {
    try {
        setPortfolios(updatedPortfolios);
        localStorage.setItem(APP_STATE_KEY, JSON.stringify(updatedPortfolios));
    } catch (error) {
        console.error("Failed to save state to localStorage", error);
    }
  };
  
  const ongoingPortfolios = useMemo(() => portfolios.filter(p => p.status === 'ongoing'), [portfolios]);
  const completedPortfolios = useMemo(() => portfolios.filter(p => p.status === 'completed'), [portfolios]);
  const selectedPortfolio = useMemo(() => portfolios.find(p => p.id === selectedPortfolioId), [portfolios, selectedPortfolioId]);

  const { sharesHeld, avgPrice, totalPaid, totalSold } = useMemo(() => {
    return selectedPortfolio ? calculatePortfolioStats(selectedPortfolio.transactions) : { sharesHeld: 0, avgPrice: 0, totalPaid: 0, totalSold: 0 };
  }, [selectedPortfolio]);

  const recommendation = useMemo((): Recommendation | null => {
    if (!selectedPortfolio || sharesHeld <= 0 || selectedPortfolio.installments <= 0 || selectedPortfolio.totalInvestment <= 0 || avgPrice <= 0) {
        return { mode: 'no-action', buyOrders: [], sellOrders: [] };
    }

    const { totalInvestment, isQuarterLossCutMode, quarterModeBuyCount } = selectedPortfolio;
    const oneTimeBuyAmount = totalInvestment / 40;
    const T_raw = totalPaid / oneTimeBuyAmount;
    const T = Math.ceil(T_raw * 10) / 10;
    
    if (T > 39 && T <= 40 && !isQuarterLossCutMode) {
        return {
            mode: 'transition-to-loss-cut', T, buyOrders: [],
            sellOrders: [{ type: 'sell', orderType: 'MOC', quantity: Math.floor(sharesHeld / 4), portion: '1/4', description: '쿼터 손절모드 진입' }]
        };
    }
    
    if (isQuarterLossCutMode) {
        const netInvestment = totalPaid - totalSold;
        const quarterModeTotalInvestment = totalInvestment - netInvestment;
        const quarterModeOneTimeBuyAmount = quarterModeTotalInvestment / 10;
        
        let sellOrders: Order[] = [];
        if (quarterModeBuyCount >= 10) {
             sellOrders.push({ type: 'sell', orderType: 'MOC', quantity: Math.floor(sharesHeld / 4), portion: '1/4', description: '10회 매수 완료, 1/4 손절' });
        } else {
            sellOrders = [
                { type: 'sell', orderType: 'LOC', quantity: Math.floor(sharesHeld / 4), portion: '1/4', price: avgPrice * 0.9 - 0.01, description: '손절 모드 LOC 매도' },
                { type: 'sell', orderType: 'Limit', quantity: Math.floor(sharesHeld * 0.75), portion: '3/4', price: avgPrice * 1.1, description: '손절 모드 지정가 매도' }
            ];
        }

        const buyPrice = avgPrice * 0.9;
        const buyQuantity = buyPrice > 0 ? Math.floor(quarterModeOneTimeBuyAmount / buyPrice) : 0;

        return {
            mode: 'quarter-loss-cut', T, quarterModeBuyCount,
            buyOrders: [{ type: 'buy', orderType: 'LOC', price: buyPrice, quantity: buyQuantity, description: '평단가 -10% LOC 매수' }],
            sellOrders
        };
    }

    const SP_raw = (10 - T / 2) ;
    const SP = SP_raw * 0.01;
    let buyOrders: Order[] = [];

    if (T < 20) {
        const buyAmountHalf = oneTimeBuyAmount / 2;
        const price1 = avgPrice;
        const price2 = avgPrice * (1 + SP) - 0.01;
        const quantity1 = price1 > 0 ? Math.floor(buyAmountHalf / price1) : 0;
        const quantity2 = price2 > 0 ? Math.floor(buyAmountHalf / price2) : 0;
        buyOrders = [
            { type: 'buy', orderType: 'LOC', price: price1, quantity: quantity1, description: '평단가 LOC 매수 (1/2)' },
            { type: 'buy', orderType: 'LOC', price: price2, quantity: quantity2, description: `평단가+SP LOC 매수 (1/2)` }
        ];
    } else {
        const price = avgPrice * (1 + SP) - 0.01;
        const quantity = price > 0 ? Math.floor(oneTimeBuyAmount / price) : 0;
        buyOrders = [{ type: 'buy', orderType: 'LOC', price: price, quantity: quantity, description: '평단가+SP LOC 매수' }];
    }

    return {
        mode: 'normal', T, SP_percentage: SP, oneTimeBuyAmount, buyOrders,
        sellOrders: [
            { type: 'sell', orderType: 'LOC', quantity: Math.floor(sharesHeld * 0.25), portion: '1/4', price: avgPrice * (1 + SP) , description: '평단가+SP LOC 매도' },
            { type: 'sell', orderType: 'Limit', quantity: Math.floor(sharesHeld * 0.75), portion: '3/4', price: avgPrice * 1.1, description: '평단가+10% 지정가 매도' }
        ]
    };

  }, [selectedPortfolio, sharesHeld, avgPrice, totalPaid, totalSold]);

  const handleAddPortfolio = (name: string, totalInvestment: number, installments: number) => {
    const newPortfolio: Portfolio = {
      id: new Date().toISOString() + Math.random(),
      name,
      totalInvestment,
      installments,
      transactions: [],
      status: 'ongoing',
      isQuarterLossCutMode: false,
      quarterModeBuyCount: 0,
    };
    const updatedPortfolios = [...portfolios, newPortfolio];
    saveState(updatedPortfolios);
    setSelectedPortfolioId(newPortfolio.id);
    setModal(null);
  };
  
  const handleTransactionSubmit = (tx: Omit<Transaction, 'id'> | Transaction) => {
    if (!selectedPortfolio) return;

    let newTransactions: Transaction[];
    if ('id' in tx) { // Existing transaction (edit)
      newTransactions = selectedPortfolio.transactions.map(t => t.id === tx.id ? tx : t);
    } else { // New transaction
      const newTx = { ...tx, id: new Date().toISOString() + Math.random() };
      newTransactions = [...selectedPortfolio.transactions, newTx];
    }
    
    const portfolioToUpdate = { ...selectedPortfolio, transactions: newTransactions };
    const updatedPortfolio = recalculatePortfolioState(portfolioToUpdate);

    const finalPortfolios = portfolios.map(p => p.id === updatedPortfolio.id ? updatedPortfolio : p);
    saveState(finalPortfolios);

    if (updatedPortfolio.status === 'completed' && selectedPortfolio.status === 'ongoing') {
      setPortfolioForEvaluation(updatedPortfolio);
      setSelectedPortfolioId(null);
    }
    
    setModal(null);
    setEditingTransaction(null);
  };

  const openEditModal = (tx: Transaction) => {
    setEditingTransaction(tx);
    setModal('editTransaction');
  };
  
  const openTransactionModal = (type: 'buy' | 'sell') => {
    setTransactionTypeForModal(type);
    setModal('addTransaction');
  };

  const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
        active ? 'bg-teal-600 text-white' : 'text-gray-400 hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex space-x-2 mb-6 border-b border-gray-700 pb-3">
          <TabButton active={activeTab === 'ongoing'} onClick={() => setActiveTab('ongoing')}>
            진행중인 투자 ({ongoingPortfolios.length})
          </TabButton>
          <TabButton active={activeTab === 'completed'} onClick={() => setActiveTab('completed')}>
            완료된 투자 ({completedPortfolios.length})
          </TabButton>
        </div>

        {activeTab === 'ongoing' && (
          <div>
            <div className="flex flex-wrap items-start gap-3 mb-6">
              {ongoingPortfolios.map(p => (
                <button 
                  key={p.id}
                  onClick={() => setSelectedPortfolioId(p.id)}
                  className={`px-4 py-2 rounded-lg border-2 transition ${selectedPortfolioId === p.id ? 'bg-teal-600 border-teal-500 text-white' : 'bg-gray-800 border-gray-700 hover:border-teal-500'}`}
                >
                  {p.name}
                </button>
              ))}
              <button
                onClick={() => setModal('addPortfolio')}
                className="px-4 py-2 rounded-lg border-2 border-dashed border-gray-600 text-gray-400 hover:border-teal-500 hover:text-white transition"
              >
                + 새 투자 추가
              </button>
            </div>
            {selectedPortfolio ? (
              <div>
                <Dashboard 
                  totalInvestment={selectedPortfolio.totalInvestment}
                  onOpenModal={openTransactionModal}
                  sharesHeld={sharesHeld}
                  avgPrice={avgPrice}
                  totalPaid={totalPaid}
                  totalSold={totalSold}
                />
                <RecommendationDisplay recommendation={recommendation} />
                <TransactionLog 
                    transactions={selectedPortfolio.transactions}
                    onEdit={openEditModal}
                />
              </div>
            ) : (
              <div className="text-center p-10 mt-6 bg-gray-800 rounded-lg">
                <h3 className="text-lg text-gray-400">{ongoingPortfolios.length > 0 ? '포트폴리오를 선택하여 상세 정보를 확인하세요.' : '새로운 투자를 추가하여 시작하세요.'}</h3>
              </div>
            )}
          </div>
        )}

        {activeTab === 'completed' && <CompletedTradesLog history={completedPortfolios} />}
      </main>

      {modal === 'addPortfolio' && (
        <NewPortfolioForm
          onAddPortfolio={handleAddPortfolio}
          onClose={() => setModal(null)}
        />
      )}
      
      {(modal === 'addTransaction' || modal === 'editTransaction') && selectedPortfolio && (
        <TransactionModal
            type={modal === 'addTransaction' ? transactionTypeForModal : (editingTransaction?.type || 'buy')}
            onClose={() => { setModal(null); setEditingTransaction(null); }}
            onSubmitTransaction={handleTransactionSubmit}
            transactionToEdit={editingTransaction}
        />
      )}

      {portfolioForEvaluation && (
        <EvaluationScreen
          result={portfolioForEvaluation.evaluationResult!}
          onClose={() => setPortfolioForEvaluation(null)}
        />
      )}
      <Footer />
    </div>
  );
};

export default App;
