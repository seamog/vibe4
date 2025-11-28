export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  date: string;
  price: number;
  quantity: number;
}

export type OrderType = 'LOC' | 'Limit' | 'MOC';

export interface Order {
  type: 'buy' | 'sell';
  orderType: OrderType;
  price?: number;
  amount?: number;
  quantity?: number;
  portion?: '1/2' | '1/4' | '3/4' | 'all';
  description: string;
}

export interface Recommendation {
  mode: 'normal' | 'quarter-loss-cut' | 'transition-to-loss-cut' | 'no-action';
  buyOrders: Order[];
  sellOrders: Order[];
  // Key metrics for display
  T?: number;
  SP_percentage?: number;
  oneTimeBuyAmount?: number;
  quarterModeBuyCount?: number;
}

export interface EvaluationResult {
    totalPaid: number;
    totalSold: number;
}

export interface Portfolio {
  id: string;
  name: string;
  totalInvestment: number;
  installments: number;
  transactions: Transaction[];
  status: 'ongoing' | 'completed';
  isQuarterLossCutMode: boolean;
  quarterModeBuyCount: number;
  evaluationResult?: EvaluationResult;
  startDate?: string;
  endDate?: string;
}
