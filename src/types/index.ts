export type AccountType = 'cash' | 'bank' | 'alipay' | 'wechat' | 'credit' | 'other';
export type TxType = 'expense' | 'income';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  emoji: string;
  color: string;
  balance: number;
  initialBalance: number;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TxType;
  categoryId: string;
  accountId: string;
  amount: number;
  note: string;
  date: string;
  createdAt: string;
}

export interface Category {
  id: string;
  type: TxType;
  name: string;
  emoji: string;
  color: string;
  sortOrder: number;
  builtIn?: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  month: string;
  limit: number;
}

export type PageId = 'home' | 'record' | 'stats' | 'accounts' | 'budget' | 'settings';

export interface AppState {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  activePage: PageId;

  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (acc: Omit<Account, 'id' | 'createdAt'>) => void;
  updateAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  transfer: (fromId: string, toId: string, amount: number, note?: string) => void;
  setBudget: (categoryId: string, month: string, limit: number) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  setActivePage: (page: PageId) => void;
  importData: (data: string) => boolean;
  exportData: () => string;
  clearAll: () => void;
}
