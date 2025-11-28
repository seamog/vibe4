import React, { useState } from 'react';

interface NewPortfolioFormProps {
  onAddPortfolio: (name: string, totalInvestment: number, installments: number) => void;
  onClose: () => void;
}

const InputField: React.FC<{
    id: string;
    label: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    type?: string;
    isCurrency?: boolean;
}> = ({ id, label, value, onChange, placeholder, type = "number", isCurrency = false }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (type === 'number') {
            const val = e.target.value;
            const numValue = val === '' ? '' : parseFloat(val);
            if (numValue === '' || (!isNaN(Number(numValue)) && Number(numValue) >= 0)) {
                (onChange as any)({ target: { value: numValue } });
            }
        } else {
            onChange(e);
        }
    };

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-1">
                {label}
            </label>
            <div className="relative">
                {isCurrency && <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>}
                <input
                    type={type}
                    id={id}
                    value={value}
                    onChange={handleChange}
                    className={`w-full ${isCurrency ? 'pl-7' : 'pl-4'} pr-4 py-2 bg-gray-900 border border-gray-700 rounded-md focus:ring-teal-500 focus:border-teal-500 transition`}
                    placeholder={placeholder}
                    min="0"
                />
            </div>
        </div>
    );
}

export const NewPortfolioForm: React.FC<NewPortfolioFormProps> = ({ onAddPortfolio, onClose }) => {
  const [name, setName] = useState('TQQQ');
  const [totalInvestment, setTotalInvestment] = useState<number | ''>('');
  const [installments, setInstallments] = useState<number | ''>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ti = typeof totalInvestment === 'number' ? totalInvestment : 0;
    const inst = typeof installments === 'number' ? installments : 0;
    if (name.trim() && ti > 0 && inst > 0) {
      onAddPortfolio(name.trim(), ti, inst);
    } else {
      alert("종목명, 총 투자금액, 분할 횟수를 올바르게 입력해주세요.");
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
        <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm m-4">
            <h2 className="text-xl font-semibold mb-4 text-teal-400">새 투자 추가</h2>
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            종목명
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => setName('TQQQ')}
                                className={`w-full px-4 py-2 rounded-md font-semibold transition-colors ${name === 'TQQQ' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                TQQQ
                            </button>
                            <button
                                type="button"
                                onClick={() => setName('SOXL')}
                                className={`w-full px-4 py-2 rounded-md font-semibold transition-colors ${name === 'SOXL' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                            >
                                SOXL
                            </button>
                        </div>
                    </div>
                    <InputField 
                        id="total-investment"
                        label="총 투자금액 ($)"
                        value={totalInvestment}
                        onChange={(e) => setTotalInvestment(e.target.value as any)}
                        placeholder="e.g., 100000"
                        isCurrency
                    />
                    <InputField 
                        id="installments"
                        label="분할 횟수"
                        value={installments}
                        onChange={(e) => setInstallments(e.target.value as any)}
                        placeholder="e.g., 40"
                    />
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md">취소</button>
                    <button type="submit" className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md">
                        저장하고 시작하기
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};