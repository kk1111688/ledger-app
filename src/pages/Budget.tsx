import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/common/Card';
import { GradientButton } from '../components/common/GradientButton';
import Modal from '../components/common/Modal';
import { Target, AlertTriangle, Edit2, ChevronLeft, ChevronRight } from 'lucide-react';
import { buildBudgetMap } from '../utils/stats';
import { formatMoney, monthLabel, thisMonthStr } from '../utils/format';

export default function Budget() {
  const budgets = useStore((s) => s.budgets);
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);
  const setBudget = useStore((s) => s.setBudget);

  const [month, setMonth] = useState(thisMonthStr());
  const [editCat, setEditCat] = useState<{ categoryId: string; name: string; emoji: string } | null>(null);
  const [editAmount, setEditAmount] = useState('');

  const { categoryBudgets } = useMemo(
    () => buildBudgetMap(budgets, transactions, categories, month),
    [budgets, transactions, categories, month]
  );

  const totalLimit = categoryBudgets.reduce((s, c) => s + c.limit, 0);
  const totalSpent = categoryBudgets.reduce((s, c) => s + c.spent, 0);
  const totalPercent = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  const totalOver = totalSpent > totalLimit && totalLimit > 0;

  const shiftMonth = (delta: number) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const openEdit = (cat: { categoryId: string; name: string; emoji: string; limit: number }) => {
    setEditCat(cat);
    setEditAmount(cat.limit > 0 ? String(cat.limit) : '');
  };

  const handleSaveBudget = () => {
    if (!editCat) return;
    const amt = parseFloat(editAmount) || 0;
    setBudget(editCat.categoryId, month, amt);
    setEditCat(null);
    setEditAmount('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pb-28">
      {/* 顶部 */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-cream-100 px-4 pt-14 pb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => shiftMonth(-1)} className="w-9 h-9 bg-cream-50 rounded-full flex items-center justify-center hover:bg-cream-100 transition">
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">预算管理</h1>
            <p className="text-sm text-gray-400 mt-0.5">{monthLabel(month)}</p>
          </div>
          <button onClick={() => shiftMonth(1)} className="w-9 h-9 bg-cream-50 rounded-full flex items-center justify-center hover:bg-cream-100 transition">
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 总预算卡片 */}
        <div className="bg-cream-50 rounded-2xl p-4 border border-cream-100">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cream-500" />
              <span className="text-sm text-gray-500">月度总预算</span>
            </div>
            {totalOver && (
              <span className="flex items-center gap-1 text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                <AlertTriangle className="w-3 h-3" /> 超支
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="font-mono text-2xl font-bold text-gray-800">{formatMoney(totalSpent, false)}</span>
            <span className="text-sm text-gray-400">/ {formatMoney(totalLimit, false)}</span>
          </div>
          <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${
                totalOver ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-cream-300 to-cream-500'
              }`}
              style={{ width: `${Math.min(totalPercent, 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400">
            <span>已用 {totalPercent.toFixed(0)}%</span>
            <span>剩余 {formatMoney(Math.max(0, totalLimit - totalSpent), false)}</span>
          </div>
        </div>
      </div>

      {/* 分类预算列表 */}
      <div className="px-4 mt-4">
        <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">分类预算</p>
        <div className="space-y-2">
          {categoryBudgets.map((cb) => (
            <Card key={cb.categoryId} className="p-4" hover>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{cb.emoji}</span>
                  <span className="font-medium text-gray-700">{cb.name}</span>
                  {cb.over && (
                    <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">超支</span>
                  )}
                </div>
                <button onClick={() => openEdit(cb)} className="w-7 h-7 rounded-full hover:bg-cream-50 flex items-center justify-center transition">
                  <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-mono text-sm font-semibold text-gray-800">¥{cb.spent.toFixed(2)}</span>
                <span className="text-xs text-gray-400">/ ¥{cb.limit.toFixed(2)}</span>
              </div>
              <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                    cb.over ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-cream-300 to-cream-500'
                  }`}
                  style={{ width: `${Math.min(cb.percent * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-xs">
                <span className={cb.over ? 'text-red-500 font-semibold' : 'text-gray-400'}>
                  {cb.over ? `超支 ¥${(cb.spent - cb.limit).toFixed(2)}` : `${(cb.percent * 100).toFixed(0)}%`}
                </span>
                <span className="text-gray-400">
                  {cb.over ? '已超支' : `剩余 ¥${cb.remaining.toFixed(2)}`}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {categoryBudgets.length === 0 && (
          <Card className="p-10 text-center">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">还没有设置预算</p>
            <p className="text-gray-300 text-xs mt-1">点击下方按钮设置第一个预算</p>
          </Card>
        )}
      </div>

      {/* 未设置预算的分类 */}
      <div className="px-4 mt-4">
        <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">未设置预算的分类</p>
        <div className="grid grid-cols-4 gap-2">
          {categories
            .filter((c) => c.type === 'expense' && !categoryBudgets.find((cb) => cb.categoryId === c.id))
            .map((c) => (
              <button
                key={c.id}
                onClick={() => openEdit({ categoryId: c.id, name: c.name, emoji: c.emoji, limit: 0 })}
                className="flex flex-col items-center gap-1 py-3 rounded-2xl bg-white border border-gray-100 hover:bg-cream-50/50 transition"
              >
                <span className="text-xl">{c.emoji}</span>
                <span className="text-xs text-gray-500">{c.name}</span>
              </button>
            ))}
        </div>
      </div>

      {/* 编辑预算弹窗 */}
      <Modal
        open={!!editCat}
        onClose={() => setEditCat(null)}
        title={`${editCat?.emoji ?? ''} ${editCat?.name ?? ''} 预算`}
        size="sm"
        footer={
          <>
            <GradientButton variant="ghost" onClick={() => setEditCat(null)}>取消</GradientButton>
            <GradientButton variant="primary" onClick={handleSaveBudget}>保存</GradientButton>
          </>
        }
      >
        <div>
          <p className="text-xs text-gray-400 mb-2">设置 {monthLabel(month)} 的预算金额</p>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-2xl font-bold text-cream-600">¥</span>
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              placeholder="0.00"
              autoFocus
              className="flex-1 bg-transparent text-lg font-mono focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-300 mt-2">输入 0 可清除该分类预算</p>
        </div>
      </Modal>
    </div>
  );
}
