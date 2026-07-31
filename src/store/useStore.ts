import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, Account, Transaction, Category, Budget, PageId } from '../types';
import { uid, todayStr } from '../utils/format';

const defaultCategories: Category[] = [
  // 支出类
  { id: 'c_food', type: 'expense', name: '餐饮', emoji: '🥘', color: '#F97316', sortOrder: 1, builtIn: true },
  { id: 'c_transport', type: 'expense', name: '交通', emoji: '🚗', color: '#3B82F6', sortOrder: 2, builtIn: true },
  { id: 'c_shopping', type: 'expense', name: '购物', emoji: '🛒', color: '#EC4899', sortOrder: 3, builtIn: true },
  { id: 'c_entertainment', type: 'expense', name: '娱乐', emoji: '🎮', color: '#8B5CF6', sortOrder: 4, builtIn: true },
  { id: 'c_housing', type: 'expense', name: '居住', emoji: '🏠', color: '#14B8A6', sortOrder: 5, builtIn: true },
  { id: 'c_medical', type: 'expense', name: '医疗', emoji: '💊', color: '#EF4444', sortOrder: 6, builtIn: true },
  { id: 'c_education', type: 'expense', name: '教育', emoji: '📚', color: '#0EA5E9', sortOrder: 7, builtIn: true },
  { id: 'c_phone', type: 'expense', name: '通讯', emoji: '📱', color: '#6366F1', sortOrder: 8, builtIn: true },
  { id: 'c_clothes', type: 'expense', name: '服饰', emoji: '👔', color: '#F43F5E', sortOrder: 9, builtIn: true },
  { id: 'c_travel', type: 'expense', name: '旅行', emoji: '✈️', color: '#10B981', sortOrder: 10, builtIn: true },
  { id: 'c_fitness', type: 'expense', name: '健身', emoji: '💪', color: '#22C55E', sortOrder: 11, builtIn: true },
  { id: 'c_other', type: 'expense', name: '其他', emoji: '📝', color: '#64748B', sortOrder: 12, builtIn: true },
  // 收入类
  { id: 'c_salary', type: 'income', name: '工资', emoji: '💰', color: '#10B981', sortOrder: 1, builtIn: true },
  { id: 'c_bonus', type: 'income', name: '奖金', emoji: '🎁', color: '#F59E0B', sortOrder: 2, builtIn: true },
  { id: 'c_parttime', type: 'income', name: '兼职', emoji: '💼', color: '#3B82F6', sortOrder: 3, builtIn: true },
  { id: 'c_invest', type: 'income', name: '投资', emoji: '📈', color: '#14B8A6', sortOrder: 4, builtIn: true },
  { id: 'c_refund', type: 'income', name: '退款', emoji: '↩️', color: '#8B5CF6', sortOrder: 5, builtIn: true },
  { id: 'c_income_other', type: 'income', name: '其他', emoji: '💎', color: '#F97316', sortOrder: 6, builtIn: true },
];

const defaultAccounts: Account[] = [
  { id: 'a_cash', name: '现金', type: 'cash', emoji: '💵', color: 'from-emerald-400 to-teal-500', balance: 0, initialBalance: 0, createdAt: new Date().toISOString() },
  { id: 'a_bank', name: '银行卡', type: 'bank', emoji: '🏦', color: 'from-blue-400 to-indigo-500', balance: 0, initialBalance: 0, createdAt: new Date().toISOString() },
  { id: 'a_alipay', name: '支付宝', type: 'alipay', emoji: '📱', color: 'from-sky-400 to-blue-500', balance: 0, initialBalance: 0, createdAt: new Date().toISOString() },
  { id: 'a_wechat', name: '微信支付', type: 'wechat', emoji: '💚', color: 'from-green-400 to-emerald-500', balance: 0, initialBalance: 0, createdAt: new Date().toISOString() },
];

// 生成一点示范数据（14天内，用户首次加载时体验更真实）
const seedDateStr = (offsetDay: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDay);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const seedTransactions: Transaction[] = [
  { id: uid(), type: 'expense', categoryId: 'c_food', accountId: 'a_alipay', amount: 32.5, note: '午餐 牛肉面', date: seedDateStr(0), createdAt: new Date().toISOString() },
  { id: uid(), type: 'expense', categoryId: 'c_transport', accountId: 'a_wechat', amount: 12, note: '地铁往返', date: seedDateStr(0), createdAt: new Date().toISOString() },
  { id: uid(), type: 'income', categoryId: 'c_salary', accountId: 'a_bank', amount: 12000, note: '7月工资', date: seedDateStr(2), createdAt: new Date().toISOString() },
  { id: uid(), type: 'expense', categoryId: 'c_shopping', accountId: 'a_alipay', amount: 268, note: '买衣服', date: seedDateStr(3), createdAt: new Date().toISOString() },
  { id: uid(), type: 'expense', categoryId: 'c_food', accountId: 'a_cash', amount: 48, note: '火锅聚餐', date: seedDateStr(5), createdAt: new Date().toISOString() },
  { id: uid(), type: 'expense', categoryId: 'c_entertainment', accountId: 'a_wechat', amount: 89, note: '电影票', date: seedDateStr(6), createdAt: new Date().toISOString() },
  { id: uid(), type: 'expense', categoryId: 'c_housing', accountId: 'a_bank', amount: 2200, note: '房租', date: seedDateStr(8), createdAt: new Date().toISOString() },
  { id: uid(), type: 'expense', categoryId: 'c_fitness', accountId: 'a_alipay', amount: 199, note: '月卡续费', date: seedDateStr(10), createdAt: new Date().toISOString() },
];

const seedBudgets: Budget[] = [
  { id: uid(), categoryId: 'c_food', month: todayStr().slice(0, 7), limit: 1500 },
  { id: uid(), categoryId: 'c_transport', month: todayStr().slice(0, 7), limit: 500 },
  { id: uid(), categoryId: 'c_shopping', month: todayStr().slice(0, 7), limit: 1000 },
  { id: uid(), categoryId: 'c_entertainment', month: todayStr().slice(0, 7), limit: 600 },
];

interface PersistedShape {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  seeded?: boolean;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      accounts: defaultAccounts,
      transactions: [],
      categories: defaultCategories,
      budgets: [],
      activePage: 'home',
      _hydrated: false,

      addTransaction: (tx) =>
        set((s) => ({
          transactions: [
            {
              ...tx,
              id: uid(),
              createdAt: new Date().toISOString(),
            } as Transaction,
            ...s.transactions,
          ],
        })),

      updateTransaction: (id, patch) =>
        set((s) => ({
          transactions: s.transactions.map((t) =>
            t.id === id ? { ...t, ...patch } : t
          ),
        })),

      deleteTransaction: (id) =>
        set((s) => ({
          transactions: s.transactions.filter((t) => t.id !== id),
        })),

      addAccount: (acc) =>
        set((s) => ({
          accounts: [
            ...s.accounts,
            { ...acc, id: uid(), createdAt: new Date().toISOString() } as Account,
          ],
        })),

      updateAccount: (id, patch) =>
        set((s) => ({
          accounts: s.accounts.map((a) =>
            a.id === id ? { ...a, ...patch } : a
          ),
        })),

      deleteAccount: (id) =>
        set((s) => ({
          accounts: s.accounts.filter((a) => a.id !== id),
          transactions: s.transactions.filter((t) => t.accountId !== id),
        })),

      transfer: (fromId, toId, amount, note = '') => {
        if (fromId === toId || amount <= 0) return;
        const now = new Date().toISOString();
        const date = todayStr();
        set((s) => ({
          transactions: [
            {
              id: uid(),
              type: 'expense',
              categoryId: 'c_other',
              accountId: fromId,
              amount,
              note: note || `转账 → ${s.accounts.find((a) => a.id === toId)?.name || ''}`,
              date,
              createdAt: now,
            },
            {
              id: uid(),
              type: 'income',
              categoryId: 'c_income_other',
              accountId: toId,
              amount,
              note: note || `转账自 ${s.accounts.find((a) => a.id === fromId)?.name || ''}`,
              date,
              createdAt: now,
            },
            ...s.transactions,
          ],
        }));
      },

      setBudget: (categoryId, month, limit) =>
        set((s) => {
          const existing = s.budgets.find(
            (b) => b.categoryId === categoryId && b.month === month
          );
          if (limit <= 0) {
            return {
              budgets: s.budgets.filter((b) => b.id !== existing?.id),
            };
          }
          if (existing) {
            return {
              budgets: s.budgets.map((b) =>
                b.id === existing.id ? { ...b, limit } : b
              ),
            };
          }
          return {
            budgets: [
              ...s.budgets,
              { id: uid(), categoryId, month, limit },
            ],
          };
        }),

      addCategory: (cat) =>
        set((s) => ({
          categories: [...s.categories, { ...cat, id: uid() } as Category],
        })),

      updateCategory: (id, patch) =>
        set((s) => ({
          categories: s.categories.map((c) =>
            c.id === id ? { ...c, ...patch } : c
          ),
        })),

      deleteCategory: (id) =>
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
        })),

      setActivePage: (page: PageId) => set({ activePage: page }),

      importData: (dataStr) => {
        try {
          const d = JSON.parse(dataStr);
          const patch: any = {};
          if (Array.isArray(d.accounts)) patch.accounts = d.accounts;
          if (Array.isArray(d.transactions)) patch.transactions = d.transactions;
          if (Array.isArray(d.categories)) patch.categories = d.categories;
          if (Array.isArray(d.budgets)) patch.budgets = d.budgets;
          set(patch);
          return true;
        } catch {
          return false;
        }
      },

      exportData: () => {
        const s = get();
        return JSON.stringify(
          {
            accounts: s.accounts,
            transactions: s.transactions,
            categories: s.categories,
            budgets: s.budgets,
            exportedAt: new Date().toISOString(),
          },
          null,
          2
        );
      },

      clearAll: () =>
        set({
          transactions: [],
          budgets: [],
          accounts: defaultAccounts,
          categories: defaultCategories,
        }),
    } as AppState & { _hydrated: boolean }),
    {
      name: 'ledger-app-state',
      partialize: (s) => ({
        accounts: s.accounts,
        transactions: s.transactions,
        categories: s.categories,
        budgets: s.budgets,
        seeded: true,
      } as unknown as PersistedShape),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const s = state as any;
        if (!s.seeded) {
          s.transactions = seedTransactions;
          s.budgets = seedBudgets;
          s.accounts = defaultAccounts;
          s.categories = defaultCategories;
          s.seeded = true;
        }
        // 补齐 categories
        if (Array.isArray(s.categories) && s.categories.length === 0) {
          s.categories = defaultCategories;
        }
      },
    }
  )
);
