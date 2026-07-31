import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { GradientButton } from '../components/common/GradientButton';
import Modal from '../components/common/Modal';
import { ArrowLeft, Check, Wallet, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { todayStr, uid } from '../utils/format';
import type { TxType, PageId } from '../types';

interface RecordProps {
  editId?: string | null;
  onBack?: () => void;
}

export default function Record({ editId, onBack }: RecordProps) {
  const categories = useStore((s) => s.categories);
  const accounts = useStore((s) => s.accounts);
  const transactions = useStore((s) => s.transactions);
  const addTransaction = useStore((s) => s.addTransaction);
  const updateTransaction = useStore((s) => s.updateTransaction);
  const setActivePage = useStore((s) => s.setActivePage);

  const editingTx = editId ? transactions.find((t) => t.id === editId) : null;

  const [type, setType] = useState<TxType>(editingTx?.type ?? 'expense');
  const [categoryId, setCategoryId] = useState(editingTx?.categoryId ?? '');
  const [accountId, setAccountId] = useState(editingTx?.accountId ?? accounts[0]?.id ?? '');
  const [amount, setAmount] = useState(editingTx ? String(editingTx.amount) : '');
  const [note, setNote] = useState(editingTx?.note ?? '');
  const [date, setDate] = useState(editingTx?.date ?? todayStr());
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);

  // 切换 type 时重置分类
  useEffect(() => {
    if (!editingTx) {
      const first = filteredCategories[0];
      if (first && !filteredCategories.find((c) => c.id === categoryId)) {
        setCategoryId(first.id);
      }
    }
  }, [type]);

  const selectedCategory = categories.find((c) => c.id === categoryId);
  const selectedAccount = accounts.find((a) => a.id === accountId);

  const amountNum = parseFloat(amount) || 0;
  const canSave = amountNum > 0 && categoryId && accountId;

  const handleSave = () => {
    if (!canSave) return;
    const payload = {
      type,
      categoryId,
      accountId,
      amount: amountNum,
      note: note.trim(),
      date,
    };
    if (editingTx) {
      updateTransaction(editingTx.id, payload);
    } else {
      addTransaction(payload);
    }
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      if (onBack) {
        onBack();
      } else {
        setActivePage('home' as PageId);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pb-28">
      {/* 顶部导航 */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-cream-100">
        <div className="px-4 pt-14 pb-3 flex items-center gap-3">
          <button
            onClick={() => (onBack ? onBack() : setActivePage('home' as PageId))}
            className="w-9 h-9 rounded-full hover:bg-cream-50 flex items-center justify-center transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-800">{editingTx ? '编辑记录' : '记一笔'}</h1>
        </div>

        {/* 收支切换 */}
        <div className="px-4 pb-4">
          <div className="bg-cream-50 rounded-2xl p-1 flex">
            <button
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                type === 'expense'
                  ? 'bg-gradient-to-r from-rose-400 to-red-500 text-white shadow-md shadow-red-500/20'
                  : 'text-gray-500'
              }`}
            >
              支出
            </button>
            <button
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                type === 'income'
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-gray-500'
              }`}
            >
              收入
            </button>
          </div>
        </div>
      </div>

      {/* 金额输入 */}
      <div className="px-4 mt-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-2">
            <span className="text-3xl font-bold text-cream-600">¥</span>
            <input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-4xl font-bold font-mono text-center w-48 bg-transparent border-none focus:outline-none text-gray-800 placeholder:text-gray-300"
              autoFocus
            />
          </div>
          <div className="w-32 h-0.5 bg-cream-200 mx-auto rounded-full" />
        </div>
      </div>

      {/* 分类选择 */}
      <div className="px-4 mt-8">
        <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">选择分类</p>
        <div className="grid grid-cols-4 gap-3">
          {filteredCategories.map((cat) => {
            const selected = cat.id === categoryId;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-all active:scale-95 ${
                  selected
                    ? 'bg-cream-50 ring-2 ring-cream-400 shadow-sm'
                    : 'bg-white border border-gray-100 hover:bg-cream-50/50'
                }`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <span className={`text-xs ${selected ? 'font-bold text-cream-600' : 'text-gray-500'}`}>
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 账户选择 */}
      <div className="px-4 mt-6">
        <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">选择账户</p>
        <button
          onClick={() => setShowAccountPicker(true)}
          className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100 hover:border-cream-200 transition"
        >
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${selectedAccount?.color ?? 'from-gray-300 to-gray-400'} flex items-center justify-center text-xl`}>
            {selectedAccount?.emoji ?? '💵'}
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-gray-800">{selectedAccount?.name ?? '选择账户'}</p>
            <p className="text-xs text-gray-400">点击切换账户</p>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* 日期和备注 */}
      <div className="px-4 mt-4 space-y-3">
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
          <Calendar className="w-5 h-5 text-cream-500 flex-shrink-0" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 focus:outline-none"
          />
        </div>
        <div className="bg-white rounded-2xl p-4 flex items-center gap-3 border border-gray-100">
          <FileText className="w-5 h-5 text-cream-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="添加备注（可选）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none"
          />
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="px-4 mt-8">
        <GradientButton
          fullWidth
          onClick={handleSave}
          disabled={!canSave}
          variant={type === 'expense' ? 'red' : 'green'}
          className="text-lg py-4"
        >
          保存
        </GradientButton>
      </div>

      {/* 成功提示 */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center gap-3 animate-scale-in shadow-elevated">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <Check className="w-8 h-8 text-white" />
            </div>
            <p className="font-bold text-gray-800">保存成功</p>
          </div>
        </div>
      )}

      {/* 账户选择弹窗 */}
      <Modal open={showAccountPicker} onClose={() => setShowAccountPicker(false)} title="选择账户" size="md">
        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
          {accounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => {
                setAccountId(acc.id);
                setShowAccountPicker(false);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition ${
                acc.id === accountId ? 'bg-cream-50 ring-2 ring-cream-300' : 'hover:bg-cream-50/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${acc.color} flex items-center justify-center text-lg`}>
                {acc.emoji}
              </div>
              <span className="flex-1 text-left font-medium text-gray-700">{acc.name}</span>
              {acc.id === accountId && <Check className="w-5 h-5 text-cream-500" />}
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
