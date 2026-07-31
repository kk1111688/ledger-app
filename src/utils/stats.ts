import type { Account, Transaction, Category, Budget } from '../types';
import { parseDate, thisMonthStr } from './format';

export const sumAccountBalance = (
  accounts: Account[],
  transactions: Transaction[]
): number => {
  const accountMap = new Map(accounts.map((a) => [a.id, a.initialBalance ?? 0]));
  for (const tx of transactions) {
    const cur = accountMap.get(tx.accountId) ?? 0;
    accountMap.set(
      tx.accountId,
      cur + (tx.type === 'income' ? tx.amount : -tx.amount)
    );
  }
  let total = 0;
  for (const v of accountMap.values()) total += v;
  return total;
};

export const getAccountBalance = (
  account: Account,
  transactions: Transaction[]
): number => {
  let b = account.initialBalance ?? 0;
  for (const tx of transactions) {
    if (tx.accountId !== account.id) continue;
    b += tx.type === 'income' ? tx.amount : -tx.amount;
  }
  return b;
};

export const sumInMonth = (
  transactions: Transaction[],
  type: 'income' | 'expense',
  month: string = thisMonthStr()
): number => {
  let s = 0;
  for (const tx of transactions) {
    if (tx.type !== type) continue;
    if (!tx.date.startsWith(month)) continue;
    s += tx.amount;
  }
  return s;
};

export interface DailyPoint {
  date: string; // MM-DD
  income: number;
  expense: number;
}

export const buildDailyPoints = (
  transactions: Transaction[],
  scope: 'day' | 'week' | 'month' | 'year' = 'month',
  month: string = thisMonthStr()
): DailyPoint[] => {
  const [yStr, mStr] = month.split('-');
  const y = Number(yStr);
  const m = Number(mStr) - 1;

  const points: DailyPoint[] = [];
  if (scope === 'month') {
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dd = String(d).padStart(2, '0');
      points.push({ date: `${Number(mStr)}/${d}`, income: 0, expense: 0, [Symbol.for('key') as any]: `${yStr}-${mStr}-${dd}` } as any);
    }
  } else if (scope === 'year') {
    for (let mm = 0; mm < 12; mm++) {
      points.push({ date: `${mm + 1}月`, income: 0, expense: 0 });
    }
  } else if (scope === 'week') {
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek);
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
      points.push({ date: ['一', '二', '三', '四', '五', '六', '日'][i], income: 0, expense: 0 });
    }
  } else {
    for (let i = 23; i >= 0; i--) {
      points.push({ date: `${i}:00`, income: 0, expense: 0 });
    }
  }

  for (const tx of transactions) {
    const d = parseDate(tx.date);
    let idx = -1;
    if (scope === 'month') {
      const txKey = `${tx.date.slice(0, 7)}`;
      if (txKey !== month) continue;
      idx = d.getDate() - 1;
    } else if (scope === 'year') {
      if (d.getFullYear() !== y) continue;
      idx = d.getMonth();
    } else if (scope === 'week') {
      const today = new Date();
      const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
      const mondayStamp = new Date(today.getFullYear(), today.getMonth(), today.getDate() - dayOfWeek).getTime();
      const txDayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      idx = Math.round((txDayStart - mondayStamp) / 86400000);
      if (idx < 0 || idx >= 7) continue;
    } else {
      const today = new Date();
      if (d.toDateString() !== today.toDateString()) continue;
      const txTime = new Date(tx.createdAt || Date.now()).getHours();
      idx = txTime;
    }
    if (idx < 0 || idx >= points.length) continue;
    if (tx.type === 'income') points[idx].income += tx.amount;
    else points[idx].expense += tx.amount;
  }

  return points;
};

export interface CategoryStat {
  categoryId: string;
  name: string;
  emoji: string;
  color: string;
  amount: number;
  percent: number;
}

export const buildCategoryPie = (
  transactions: Transaction[],
  categories: Category[],
  type: 'income' | 'expense',
  month: string = thisMonthStr()
): CategoryStat[] => {
  const map = new Map<string, number>();
  let total = 0;
  for (const tx of transactions) {
    if (tx.type !== type) continue;
    if (!tx.date.startsWith(month)) continue;
    map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amount);
    total += tx.amount;
  }
  const list: CategoryStat[] = [];
  for (const cat of categories.filter((c) => c.type === type)) {
    const amount = map.get(cat.id) ?? 0;
    if (amount <= 0) continue;
    list.push({
      categoryId: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      color: cat.color,
      amount,
      percent: total > 0 ? amount / total : 0,
    });
  }
  list.sort((a, b) => b.amount - a.amount);
  return list;
};

export const buildBudgetMap = (
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  month: string = thisMonthStr()
) => {
  const spentMap = new Map<string, number>();
  for (const tx of transactions) {
    if (tx.type !== 'expense') continue;
    if (!tx.date.startsWith(month)) continue;
    spentMap.set(tx.categoryId, (spentMap.get(tx.categoryId) ?? 0) + tx.amount);
  }
  return {
    categoryBudgets: categories
      .filter((c) => c.type === 'expense')
      .map((c) => {
        const budget = budgets.find(
          (b) => b.categoryId === c.id && b.month === month
        );
        const spent = spentMap.get(c.id) ?? 0;
        return {
          categoryId: c.id,
          name: c.name,
          emoji: c.emoji,
          color: c.color,
          limit: budget?.limit ?? 0,
          spent,
          remaining: Math.max(0, (budget?.limit ?? 0) - spent),
          over: (budget?.limit ?? 0) > 0 && spent > (budget?.limit ?? 0),
          percent:
            (budget?.limit ?? 0) > 0 ? Math.min(1.5, spent / (budget?.limit ?? 1)) : 0,
        };
      })
      .filter((x) => x.limit > 0 || x.spent > 0),
  };
};
