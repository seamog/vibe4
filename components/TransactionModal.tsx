import React, { useState, useEffect } from 'react';
import type { Transaction } from '../types';

interface TransactionModalProps {
    type: 'buy' | 'sell';
    onClose: () => void;
    onSubmitTransaction: (transaction: Omit<Transaction, 'id'> | Transaction) => void;
    transactionToEdit?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ type, onClose, onSubmitTransaction, transactionToEdit }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [price, setPrice] = useState('');
    const [quantity, setQuantity] = useState('');
    const [currentType, setCurrentType] = useState(type);

    useEffect(() => {
        if (transactionToEdit) {
            setDate(transactionToEdit.date);
            setPrice(String(transactionToEdit.price));
            setQuantity(String(transactionToEdit.quantity));
            setCurrentType(transactionToEdit.type);
        } else {
            // Reset form for new transaction
            setDate(new Date().toISOString().split('T')[0]);
            setPrice('');
            setQuantity('');
            setCurrentType(type);
        }
    }, [transactionToEdit, type]);


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const priceNum = parseFloat(price);
        const quantityNum = parseFloat(quantity);

        if (priceNum > 0 && quantityNum > 0 && date) {
            if (transactionToEdit) {
                 onSubmitTransaction({
                    id: transactionToEdit.id,
                    type: currentType,
                    date,
                    price: priceNum,
                    quantity: quantityNum
                });
            } else {
                 onSubmitTransaction({
                    type: currentType,
                    date,
                    price: priceNum,
                    quantity: quantityNum
                });
            }
        } else {
            alert("유효한 날짜, 체결가, 수량을 입력하세요.");
        }
    };
    
    const isBuy = currentType === 'buy';
    const title = transactionToEdit ? '거래 기록 수정' : (isBuy ? '매수 기록 추가' : '매도 기록 추가');
    const buttonColor = isBuy ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm m-4">
                <h2 className="text-xl font-bold mb-4 text-teal-400">{title}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {transactionToEdit && (
                            <div>
                                <label className="block text-sm font-medium text-gray-400">구분</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <button type="button" onClick={() => setCurrentType('buy')} className={`w-1/2 px-4 py-2 rounded-l-md ${isBuy ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}>매수</button>
                                    <button type="button" onClick={() => setCurrentType('sell')} className={`w-1/2 px-4 py-2 rounded-r-md ${!isBuy ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}>매도</button>
                                </div>
                            </div>
                        )}
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-400">일자</label>
                            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 w-full pl-4 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-md"/>
                        </div>
                        <div>
                            <label htmlFor="price" className="block text-sm font-medium text-gray-400">체결가 ($)</label>
                            <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" step="0.01" min="0" className="mt-1 w-full pl-4 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-md" />
                        </div>
                        <div>
                            <label htmlFor="quantity" className="block text-sm font-medium text-gray-400">수량</label>
                            <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" step="0.0001" min="0" className="mt-1 w-full pl-4 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-md" />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">취소</button>
                        <button type="submit" className={`px-4 py-2 ${buttonColor} text-white rounded-md`}>저장</button>
                    </div>
                </form>
            </div>
        </div>
    );
};