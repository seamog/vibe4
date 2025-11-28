import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-md p-4">
      <div className="container mx-auto text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-teal-400">
          매매 이력 관리
        </h1>
        <p className="text-gray-400 mt-1">거래 내역을 기록하고 자산을 추적하세요.</p>
      </div>
    </header>
  );
};