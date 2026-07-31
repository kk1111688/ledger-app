import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/common/Card';
import { GradientButton } from '../components/common/GradientButton';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  CalendarDays,
  PiggyBank,
  ChevronRight,
  Edit2,
  Trash2,
  ArrowRightLeft,
  PieChart,
  Settings,
  X,
} from 'lucide-react';
import { sumAccountBalance, sumInMonth, getAccountBalance, buildBudgetMap } from '../utils/stats';
import { formatMoney, formatShortMoney, dateLabel, monthLabel, thisMonthStr, todayStr } from '../utils/format';
import type { PageId } from '../types';

export default function Home() {
  const {
    accounts,
    transactions,
    categories,
    budgets,
    setActivePage,
    deleteTransaction,
    transfer,
  } = useStore();

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferFromId, setTransferFromId] = useState(accounts[0]?.id || '');
  const [transferToId, setTransferToId] = useState(accounts[1]?.id || '');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferNote, setTransferNote] = useState('');

  const totalAssets = sumAccountBalance(accounts, transactions);
  const monthExpense = sumInMonth(transactions, 'expense');
  const monthIncome = sumInMonth(transactions, 'income');
  const monthStr = thisMonthStr();

  const { categoryBudgets } = buildBudgetMap(budgets, transactions, categories, monthStr);
  const totalLimit = categoryBudgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = categoryBudgets.reduce((s, b) => s + b.spent, 0);
  const totalOver = totalLimit > 0 && totalSpent > totalLimit;
  const totalPercent = totalLimit > 0 ? Math.min(1.5, totalSpent / totalLimit) : 0;

  const sortedTxs = [...transactions]
    .sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.createdAt.localeCompare(a.createdAt);
    })
    .slice(0, 7);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const handleNavigate = (page: PageId) => setActivePage(page);

  const handleDeleteTx = (id: string) => {
    if (window.confirm('确定要删除这条交易记录吗？')) {
      deleteTransaction(id);
    }
  };

  const handleEditTx = (_id: string) => {
    setActivePage('record');
  };

  const handleTransfer = () => {
    const amt = Number(transferAmount);
    if (!transferFromId || !transferToId || transferFromId === transferToId) {
      alert('请选择不同的转出和转入账户');
      return;
    }
    if (!amt || amt <= 0) {
      alert('请输入有效的转账金额');
      return;
    }
    const fromBalance = getAccountBalance(accounts.find((a) => a.id === transferFromId)!, transactions);
    if (fromBalance < amt) {
      alert('转出账户余额不足');
      return;
    }
    transfer(transferFromId, transferToId, amt, transferNote);
    setShowTransferModal(false);
    setTransferAmount('');
    setTransferNote('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-amber-50 pb-28">
      {/* 顶部渐变头 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-cream-400 via-cream-500 to-amber-600 rounded-b-3xl">
        <div className="absolute -top-16 -right-10 w-40 h-40 bg-white/10 rounded-full translate-x-6 translate-y-4" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative pt-14 pb-8 px-4 text-white">
          {/* 顶部行 */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Hello，记账愉快</p>
              <h1 className="text-2xl font-bold mt-0.5">我的账本</h1>
            </div>
            <button
              onClick={() => handleNavigate('settings')}
              className="bg-white/20 backdrop-blur-sm rounded-full w-11 h-11 flex items-center justify-center hover:bg-white/30 transition"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* 总资产大卡 */}
          <div className="bg-white/20 backdrop-blur-md rounded-2xl border border-white/25 p-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span className="text-sm opacity-95">总资产</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-white/25 text-xs">
                {monthLabel(monthStr)}
              </span>
            </div>
            <span className="animate-count-up font-mono text-3xl font-bold">
              {formatMoney(totalAssets)}
            </span>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="bg-white/15 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingDown className="w-4 h-4 text-red-200" />
                  <span className="text-xs opacity-90">本月支出</span>
                </div>
                <span className="font-mono text-lg font-semibold text-red-100">
                  -{formatShortMoney(monthExpense)}
                </span>
              </div>
              <div className="bg-white/15 rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-200" />
                  <span className="text-xs opacity-90">本月收入</span>
                </div>
                <span className="font-mono text-lg font-semibold text-green-100">
                  +{formatShortMoney(monthIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主体 */}
      <div className="px-4 -mt-4 space-y-4">
        {/* 预算概览卡 */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-cream-600" />
              <h2 className="font-bold text-gray-800">本月预算进度</h2>
            </div>
            <button
              onClick={() => handleNavigate('budget')}
              className="flex items-center gap-0.5 text-sm text-cream-600 hover:text-cream-700 transition"
            >
              管理预算
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-gray-500">
              已用 <span className="font-semibold text-gray-800">{formatMoney(totalSpent)}</span>
              <span className="mx-1 text-gray-300">/</span>
              {formatMoney(totalLimit)}
            </span>
            {totalLimit > 0 && (
              <span className={totalOver ? 'text-red-500 font-semibold' : 'text-cream-600 font-semibold'}>
                {(totalPercent * 100).toFixed(0)}%
              </span>
            )}
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={
                totalOver
                  ? 'h-full rounded-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-500'
                  : 'h-full rounded-full bg-gradient-to-r from-cream-300 to-cream-500 transition-all duration-500'
              }
              style={{ width: `${Math.min(totalPercent * 100, 150)}%` }}
            />
          </div>
        </Card>

        {/* 快捷操作卡片 */}
        <Card className="p-4">
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => handleNavigate('record')}
              className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-cream-50 transition"
            >
              <div className="w-12 h-12 bg-cream-50 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-cream-600" />
              </div>
              <span className="text-[11px] text-gray-600">记账</span>
            </button>
            <button
              onClick={() => setShowTransferModal(true)}
              className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-cream-50 transition"
            >
              <div className="w-12 h-12 bg-cream-50 rounded-full flex items-center justify-center">
                <ArrowRightLeft className="w-6 h-6 text-cream-600" />
              </div>
              <span className="text-[11px] text-gray-600">转账</span>
            </button>
            <button
              onClick={() => handleNavigate('stats')}
              className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-cream-50 transition"
            >
              <div className="w-12 h-12 bg-cream-50 rounded-full flex items-center justify-center">
                <PieChart className="w-6 h-6 text-cream-600" />
              </div>
              <span className="text-[11px] text-gray-600">统计</span>
            </button>
            <button
              onClick={() => handleNavigate('settings')}
              className="flex flex-col items-center gap-1 py-2 rounded-xl hover:bg-cream-50 transition"
            >
              <div className="w-12 h-12 bg-cream-50 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-cream-600" />
              </div>
              <span className="text-[11px] text-gray-600">设置</span>
            </button>
          </div>
        </Card>

        {/* 最近交易 */}
        {sortedTxs.length === 0 ? (
          <Card className="p-10 text-center text-gray-400">
            <PiggyBank className="w-16 h-16 mx-auto mb-3 text-cream-300" />
            <p className="text-sm">还没有交易，开始记账吧</p>
          </Card>
        ) : (
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-cream-600" />
                <h2 className="font-bold text-gray-800">最近交易</h2>
              </div>
              <button
                onClick={() => handleNavigate('stats')}
                className="flex items-center gap-0.5 text-sm text-cream-600 hover:text-cream-700 transition"
              >
                查看全部
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div>
              {sortedTxs.map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center p-3.5 border-b border-gray-50 last:border-b-0 hover:bg-gray-50/50 transition group"
                  >
                    <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center flex-shrink-0 text-xl">
                      {cat?.emoji || '📝'}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 truncate">
                          {cat?.name || '未分类'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {tx.note && (
                          <span className="text-xs text-gray-400 truncate max-w-[120px]">
                            {tx.note}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
                          {dateLabel(tx.date)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-3 flex items-center gap-2">
                      <span
                        className={`font-mono font-semibold text-sm flex-shrink-0 ${
                          tx.type === 'expense' ? 'text-red-500' : 'text-green-500'
                        }`}
                      >
                        {tx.type === 'expense' ? '-' : '+'}
                        {formatMoney(tx.amount)}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleEditTx(tx.id)}
                          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-cream-600 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTx(tx.id)}
                          className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* 转账 Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-cream-50 rounded-xl flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-cream-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">账户转账</h3>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">转出账户</label>
                <select
                  value={transferFromId}
                  onChange={(e) => setTransferFromId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cream-400 focus:ring-2 focus:ring-cream-100 outline-none transition text-gray-800"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.emoji} {a.name}（{formatMoney(getAccountBalance(a, transactions))}）
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">转入账户</label>
                <select
                  value={transferToId}
                  onChange={(e) => setTransferToId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cream-400 focus:ring-2 focus:ring-cream-100 outline-none transition text-gray-800"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.emoji} {a.name}（{formatMoney(getAccountBalance(a, transactions))}）
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">转账金额</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  placeholder="请输入金额"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cream-400 focus:ring-2 focus:ring-cream-100 outline-none transition font-mono text-lg text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">备注（可选）</label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder="例如：房租转账"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-cream-400 focus:ring-2 focus:ring-cream-100 outline-none transition text-gray-800"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 px-5 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 active:scale-95 transition-all"
              >
                取消
              </button>
              <GradientButton
                onClick={handleTransfer}
                fullWidth
                className="flex-1"
              >
                确认转账
              </GradientButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
