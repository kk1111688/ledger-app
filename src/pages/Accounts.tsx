import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/common/Card';
import { GradientButton } from '../components/common/GradientButton';
import Modal from '../components/common/Modal';
import { Plus, Edit2, Trash2, ArrowRightLeft, Wallet, Check } from 'lucide-react';
import { getAccountBalance } from '../utils/stats';
import { formatMoney } from '../utils/format';
import type { Account, AccountType } from '../types';

const accountTypeOptions: { type: AccountType; label: string; emoji: string; color: string }[] = [
  { type: 'cash', label: '现金', emoji: '💵', color: 'from-emerald-400 to-teal-500' },
  { type: 'bank', label: '银行卡', emoji: '🏦', color: 'from-blue-400 to-indigo-500' },
  { type: 'alipay', label: '支付宝', emoji: '📱', color: 'from-sky-400 to-blue-500' },
  { type: 'wechat', label: '微信', emoji: '💚', color: 'from-green-400 to-emerald-500' },
  { type: 'credit', label: '信用卡', emoji: '💳', color: 'from-violet-400 to-purple-500' },
  { type: 'other', label: '其他', emoji: '📦', color: 'from-amber-400 to-orange-500' },
];

export default function Accounts() {
  const accounts = useStore((s) => s.accounts);
  const transactions = useStore((s) => s.transactions);
  const addAccount = useStore((s) => s.addAccount);
  const updateAccount = useStore((s) => s.updateAccount);
  const deleteAccount = useStore((s) => s.deleteAccount);
  const transfer = useStore((s) => s.transfer);

  const [showEdit, setShowEdit] = useState(false);
  const [editingAcc, setEditingAcc] = useState<Account | null>(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Account | null>(null);

  // 编辑表单
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('cash');
  const [initialBalance, setInitialBalance] = useState('');

  const totalAssets = accounts.reduce((s, a) => s + getAccountBalance(a, transactions), 0);

  const openCreate = () => {
    setEditingAcc(null);
    setName('');
    setType('cash');
    setInitialBalance('');
    setShowEdit(true);
  };

  const openEdit = (acc: Account) => {
    setEditingAcc(acc);
    setName(acc.name);
    setType(acc.type);
    setInitialBalance(String(acc.initialBalance ?? 0));
    setShowEdit(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const matched = accountTypeOptions.find((o) => o.type === type)!;
    const payload = {
      name: name.trim(),
      type,
      emoji: matched.emoji,
      color: matched.color,
      initialBalance: parseFloat(initialBalance) || 0,
      balance: 0,
    };
    if (editingAcc) {
      updateAccount(editingAcc.id, payload);
    } else {
      addAccount(payload);
    }
    setShowEdit(false);
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteAccount(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const selectedType = accountTypeOptions.find((o) => o.type === type)!;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pb-28">
      {/* 顶部 */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-cream-100 px-4 pt-14 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">我的账户</h1>
          <button onClick={openCreate} className="w-9 h-9 bg-cream-50 rounded-full flex items-center justify-center hover:bg-cream-100 transition active:scale-95">
            <Plus className="w-5 h-5 text-cream-600" />
          </button>
        </div>
        <div className="bg-cream-50 rounded-2xl p-4 border border-cream-100">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-cream-500" />
            <span className="text-sm text-gray-500">总资产</span>
          </div>
          <p className="font-mono text-3xl font-bold text-gray-800">{formatMoney(totalAssets)}</p>
        </div>
      </div>

      {/* 账户列表 */}
      <div className="px-4 mt-4 space-y-3">
        {accounts.map((acc) => {
          const balance = getAccountBalance(acc, transactions);
          return (
            <Card key={acc.id} className="overflow-hidden" hover>
              <div className={`bg-gradient-to-br ${acc.color} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl">
                      {acc.emoji}
                    </div>
                    <div>
                      <p className="font-bold">{acc.name}</p>
                      <p className="text-xs opacity-75">{accountTypeOptions.find(o => o.type === acc.type)?.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold">{formatMoney(balance, false)}</p>
                    <p className="text-xs opacity-75">余额</p>
                  </div>
                </div>
              </div>
              <div className="flex border-t border-gray-50">
                <button onClick={() => openEdit(acc)} className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:bg-cream-50 transition">
                  <Edit2 className="w-3.5 h-3.5" /> 编辑
                </button>
                <button onClick={() => setDeleteConfirm(acc)} className="flex-1 py-2.5 flex items-center justify-center gap-1.5 text-xs text-red-400 hover:bg-red-50 transition">
                  <Trash2 className="w-3.5 h-3.5" /> 删除
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 转账按钮 */}
      <div className="px-4 mt-4">
        <GradientButton variant="blue" fullWidth onClick={() => setShowTransfer(true)} className="gap-2">
          <ArrowRightLeft className="w-5 h-5" />
          账户转账
        </GradientButton>
      </div>

      {/* 编辑/新增弹窗 */}
      <Modal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        title={editingAcc ? '编辑账户' : '新增账户'}
        footer={
          <>
            <GradientButton variant="ghost" onClick={() => setShowEdit(false)}>取消</GradientButton>
            <GradientButton variant="primary" onClick={handleSave} disabled={!name.trim()}>保存</GradientButton>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-400 mb-2">账户类型</p>
            <div className="grid grid-cols-3 gap-2">
              {accountTypeOptions.map((o) => (
                <button
                  key={o.type}
                  onClick={() => setType(o.type)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl transition ${
                    type === o.type ? 'bg-cream-50 ring-2 ring-cream-400' : 'bg-gray-50 hover:bg-cream-50/50'
                  }`}
                >
                  <span className="text-2xl">{o.emoji}</span>
                  <span className="text-xs text-gray-600">{o.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">账户名称</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="如：招商银行卡"
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cream-300"
            />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">初始余额</p>
            <input
              type="number"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cream-300"
            />
          </div>
        </div>
      </Modal>

      {/* 转账弹窗 */}
      <TransferModal open={showTransfer} onClose={() => setShowTransfer(false)} onTransfer={transfer} accounts={accounts} />

      {/* 删除确认 */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="确认删除"
        size="sm"
        footer={
          <>
            <GradientButton variant="ghost" onClick={() => setDeleteConfirm(null)}>取消</GradientButton>
            <GradientButton variant="red" onClick={handleDelete}>删除</GradientButton>
          </>
        }
      >
        <p className="text-sm text-gray-500">
          删除账户「{deleteConfirm?.name}」将同时删除该账户下的所有交易记录，且无法恢复。确认删除？
        </p>
      </Modal>
    </div>
  );
}

function TransferModal({
  open,
  onClose,
  onTransfer,
  accounts,
}: {
  open: boolean;
  onClose: () => void;
  onTransfer: (fromId: string, toId: string, amount: number, note?: string) => void;
  accounts: Account[];
}) {
  const [fromId, setFromId] = useState(accounts[0]?.id ?? '');
  const [toId, setToId] = useState(accounts[1]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const handleTransfer = () => {
    const amt = parseFloat(amount) || 0;
    if (!fromId || !toId || fromId === toId || amt <= 0) return;
    onTransfer(fromId, toId, amt, note.trim() || undefined);
    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="账户转账"
      footer={
        <>
          <GradientButton variant="ghost" onClick={onClose}>取消</GradientButton>
          <GradientButton variant="blue" onClick={handleTransfer} disabled={!fromId || !toId || fromId === toId || !amount}>转账</GradientButton>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-400 mb-1.5">转出账户</p>
          <select value={fromId} onChange={(e) => setFromId(e.target.value)} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none">
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}
          </select>
        </div>
        <div className="flex justify-center">
          <div className="w-9 h-9 rounded-full bg-cream-50 flex items-center justify-center">
            <ArrowRightLeft className="w-4 h-4 text-cream-500" />
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1.5">转入账户</p>
          <select value={toId} onChange={(e) => setToId(e.target.value)} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none">
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.emoji} {a.name}</option>)}
          </select>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1.5">金额</p>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none" />
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1.5">备注（可选）</p>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="转账备注" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none" />
        </div>
      </div>
    </Modal>
  );
}
