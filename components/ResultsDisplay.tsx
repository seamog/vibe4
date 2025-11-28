
import React from 'react';
import type { Transaction, Portfolio } from '../types';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
const formatNumber = (value: number) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(value);

interface TransactionLogProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
}

export const TransactionLog: React.FC<TransactionLogProps> = ({ transactions, onEdit }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center p-10 mt-6 bg-gray-800 rounded-lg">
        <h3 className="text-lg text-gray-400">기록된 거래가 없습니다. '매수' 또는 '매도' 버튼을 눌러 첫 거래를 추가하세요.</h3>
      </div>
    );
  }

  const sortedTransactions = transactions.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-teal-400 mb-4">거래 이력</h2>
      <div className="bg-gray-800 rounded-lg shadow-xl overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
                <tr>
                    <th scope="col" className="px-6 py-3">구분</th>
                    <th scope="col" className="px-6 py-3">일자</th>
                    <th scope="col" className="px-6 py-3 text-right">수량</th>
                    <th scope="col" className="px-6 py-3 text-right">체결가</th>
                    <th scope="col" className="px-6 py-3 text-right">총 금액</th>
                    <th scope="col" className="px-6 py-3 text-center">작업</th>
                </tr>
            </thead>
            <tbody>
                {sortedTransactions.map((tx) => {
                    const isBuy = tx.type === 'buy';
                    return (
                        <tr key={tx.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                            <td className="px-6 py-4 font-medium whitespace-nowrap">
                                <span className={`font-bold ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
                                    {isBuy ? '매수' : '매도'}
                                </span>
                            </td>
                            <td className="px-6 py-4">{tx.date}</td>
                            <td className="px-6 py-4 text-right font-mono">{formatNumber(tx.quantity)}</td>
                            <td className="px-6 py-4 text-right font-mono">{formatCurrency(tx.price)}</td>
                            <td className="px-6 py-4 text-right font-mono">{formatCurrency(tx.quantity * tx.price)}</td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                <button onClick={() => onEdit(tx)} className="font-medium text-teal-400 hover:underline">수정</button>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export const CompletedTradesLog: React.FC<{ history: Portfolio[] }> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="text-center p-10 mt-6 bg-gray-800 rounded-lg">
        <h3 className="text-lg text-gray-400">완료된 투자가 없습니다.</h3>
      </div>
    );
  }

  const sortedHistory = [...history].sort((a, b) => new Date(b.endDate!).getTime() - new Date(a.endDate!).getTime());

  return (
    <div className="mt-2">
      <div className="bg-gray-800 rounded-lg shadow-xl overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm text-left text-gray-400">
            <thead className="text-xs text-gray-300 uppercase bg-gray-700/50">
                <tr>
                    <th scope="col" className="px-6 py-3">종목명</th>
                    <th scope="col" className="px-6 py-3 text-right">총 투자금액</th>
                    <th scope="col" className="px-6 py-3 text-right">분할 횟수</th>
                    <th scope="col" className="px-6 py-3">시작일</th>
                    <th scope="col" className="px-6 py-3">종료일</th>
                    <th scope="col" className="px-6 py-3 text-right">총 매수 금액</th>
                    <th scope="col" className="px-6 py-3 text-right">총 매도 금액</th>
                    <th scope="col" className="px-6 py-3 text-right">순수익</th>
                    <th scope="col" className="px-6 py-3 text-right">수익률</th>
                </tr>
            </thead>
            <tbody>
                {sortedHistory.map((item) => {
                    if (!item.evaluationResult) return null;
                    const { totalPaid, totalSold } = item.evaluationResult;
                    const netProfit = totalSold - totalPaid;
                    const roi = totalPaid > 0 ? (netProfit / totalPaid) * 100 : 0;
                    const isProfit = netProfit >= 0;
                    const profitColor = isProfit ? 'text-green-400' : 'text-red-400';
                    const profitSign = isProfit ? '+' : '';

                    return (
                        <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                            <td className="px-6 py-4 font-medium whitespace-nowrap text-white">{item.name}</td>
                            <td className="px-6 py-4 text-right font-mono">{formatCurrency(item.totalInvestment)}</td>
                            <td className="px-6 py-4 text-right font-mono">{item.installments}회</td>
                            <td className="px-6 py-4 font-medium whitespace-nowrap">{item.startDate}</td>
                            <td className="px-6 py-4 font-medium whitespace-nowrap">{item.endDate}</td>
                            <td className="px-6 py-4 text-right font-mono">{formatCurrency(totalPaid)}</td>
                            <td className="px-6 py-4 text-right font-mono">{formatCurrency(totalSold)}</td>
                            <td className={`px-6 py-4 text-right font-mono font-bold ${profitColor}`}>
                                {profitSign}{formatCurrency(netProfit)}
                            </td>
                            <td className={`px-6 py-4 text-right font-mono font-bold ${profitColor}`}>
                                {profitSign}{roi.toFixed(2)}%
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
      </div>
    </div>
  );
};
