import React from 'react';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(value);

interface DashboardProps {
  totalInvestment: number;
  onOpenModal: (type: 'buy' | 'sell') => void;
  sharesHeld: number;
  avgPrice: number;
  totalPaid: number;
  totalSold: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ totalInvestment, onOpenModal, sharesHeld, avgPrice, totalPaid, totalSold }) => {
  const investmentUsed = totalPaid - totalSold;
  const cashRemaining = totalInvestment - investmentUsed;

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <h4 className="text-sm font-medium text-gray-400">보유 수량</h4>
            <p className="text-xl font-bold text-white">{formatNumber(sharesHeld)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400">평균 단가</h4>
            <p className="text-xl font-bold text-white">{formatCurrency(avgPrice)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-400">사용된 투자금</h4>
            <p className="text-xl font-bold text-white">{formatCurrency(investmentUsed)}</p>
          </div>
           <div>
            <h4 className="text-sm font-medium text-gray-400">남은 투자금</h4>
            <p className="text-xl font-bold text-white">{formatCurrency(cashRemaining)}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button onClick={() => onOpenModal('buy')} className="w-full sm:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition">매수 기록</button>
            <button onClick={() => onOpenModal('sell')} disabled={sharesHeld <= 0} className="w-full sm:w-auto px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition disabled:bg-gray-600 disabled:cursor-not-allowed">매도 기록</button>
        </div>
    </div>
  );
};
