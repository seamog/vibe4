import React from 'react';
import type { EvaluationResult } from '../types';

interface EvaluationScreenProps {
  result: EvaluationResult;
  onClose: () => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export const EvaluationScreen: React.FC<EvaluationScreenProps> = ({ result, onClose }) => {
  const { totalPaid, totalSold } = result;
  const netProfit = totalSold - totalPaid;
  const roi = totalPaid > 0 ? (netProfit / totalPaid) * 100 : 0;
  
  const isProfit = netProfit >= 0;
  const profitColor = isProfit ? 'text-green-400' : 'text-red-400';
  const profitSign = isProfit ? '+' : '';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 animate-fade-in">
        <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl text-center m-4">
          <h2 className="text-3xl font-bold mb-4 text-teal-400">투자 기간 종료</h2>
          <p className="text-gray-400 mb-8">이번 투자 기간의 최종 성과입니다.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
            <div className="bg-gray-700/50 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">총 매수 금액</h3>
                <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="bg-gray-700/50 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">총 매도 금액</h3>
                <p className="text-2xl font-bold text-white mt-2">{formatCurrency(totalSold)}</p>
            </div>
          </div>

          <div className="mt-8 bg-gray-900 p-6 rounded-lg">
            <h3 className="text-md font-medium text-gray-400 uppercase tracking-wider">최종 수익</h3>
            <p className={`text-4xl font-extrabold mt-2 ${profitColor}`}>
                {profitSign}{formatCurrency(netProfit)}
            </p>
            <p className={`text-xl font-bold mt-2 ${profitColor}`}>
                ({profitSign}{roi.toFixed(2)}%)
            </p>
          </div>

          <div className="mt-10">
            <button
              onClick={onClose}
              className="w-full max-w-xs px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500"
            >
              닫기
            </button>
          </div>
        </div>
    </div>
  );
};
