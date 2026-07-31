import { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/common/Card';
import { GradientButton } from '../components/common/GradientButton';
import Modal from '../components/common/Modal';
import { Download, Upload, Trash2, Tag, Info, Plus, Check, AlertTriangle } from 'lucide-react';
import type { TxType } from '../types';

const emojiChoices = ['🥘', '🚗', '🛒', '🎮', '🏠', '💊', '📚', '📱', '👔', '✈️', '💪', '📝', '💰', '🎁', '💼', '📈', '↩️', '💎', '🍔', '☕', '🚌', '🚕', '🛵', '👕', '鞋', '🎬', '🎵', '⚽', '🏀', '🎸'];
const colorChoices = ['#F97316', '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6', '#EF4444', '#0EA5E9', '#6366F1', '#F43F5E', '#10B981', '#22C55E', '#64748B', '#F59E0B', '#A855F7'];

export default function Settings() {
  const categories = useStore((s) => s.categories);
  const addCategory = useStore((s) => s.addCategory);
  const updateCategory = useStore((s) => s.updateCategory);
  const deleteCategory = useStore((s) => s.deleteCategory);
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const clearAll = useStore((s) => s.clearAll);

  const [catTab, setCatTab] = useState<TxType>('expense');
  const [showCatEdit, setShowCatEdit] = useState(false);
  const [editCatId, setEditCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catEmoji, setCatEmoji] = useState(emojiChoices[0]);
  const [catColor, setCatColor] = useState(colorChoices[0]);
  const [showClear, setShowClear] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredCats = categories.filter((c) => c.type === catTab);

  const openCreate = () => {
    setEditCatId(null);
    setCatName('');
    setCatEmoji(emojiChoices[0]);
    setCatColor(colorChoices[0]);
    setShowCatEdit(true);
  };

  const openEdit = (id: string) => {
    const c = categories.find((x) => x.id === id);
    if (!c) return;
    setEditCatId(id);
    setCatName(c.name);
    setCatEmoji(c.emoji);
    setCatColor(c.color);
    setShowCatEdit(true);
  };

  const handleSaveCat = () => {
    if (!catName.trim()) return;
    if (editCatId) {
      updateCategory(editCatId, { name: catName.trim(), emoji: catEmoji, color: catColor });
    } else {
      addCategory({ type: catTab, name: catName.trim(), emoji: catEmoji, color: catColor, sortOrder: categories.length });
    }
    setShowCatEdit(false);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const ok = importData(result);
      setImportMsg(ok ? '导入成功！' : '导入失败，文件格式错误');
      void ok;
      setTimeout(() => setImportMsg(''), 3000);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pb-28">
      {/* 顶部 */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-cream-100">
        <div className="px-4 pt-14 pb-4">
          <h1 className="text-xl font-bold text-gray-800">设置</h1>
        </div>
      </div>

      {/* 分类管理 */}
      <div className="px-4 mt-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-cream-500" />
              <h2 className="font-bold text-gray-800">分类管理</h2>
            </div>
            <button onClick={openCreate} className="w-8 h-8 bg-cream-50 rounded-full flex items-center justify-center hover:bg-cream-100 transition">
              <Plus className="w-4 h-4 text-cream-600" />
            </button>
          </div>

          <div className="bg-cream-50 rounded-xl p-0.5 flex mb-3">
            <button onClick={() => setCatTab('expense')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${catTab === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'}`}>
              支出 ({categories.filter(c => c.type === 'expense').length})
            </button>
            <button onClick={() => setCatTab('income')} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${catTab === 'income' ? 'bg-white text-emerald-500 shadow-sm' : 'text-gray-400'}`}>
              收入 ({categories.filter(c => c.type === 'income').length})
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {filteredCats.map((c) => (
              <button
                key={c.id}
                onClick={() => openEdit(c.id)}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-gray-50 hover:bg-cream-50/50 transition"
              >
                <span className="text-xl">{c.emoji}</span>
                <span className="text-xs text-gray-600">{c.name}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* 数据管理 */}
      <div className="px-4 mt-4">
        <Card className="p-4">
          <h2 className="font-bold text-gray-800 mb-3">数据管理</h2>
          <div className="space-y-2">
            <button onClick={handleExport} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-cream-50 transition">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <Download className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-700">导出数据</p>
                <p className="text-xs text-gray-400">保存为 JSON 文件</p>
              </div>
            </button>

            <button onClick={() => fileRef.current?.click()} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-cream-50 transition">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Upload className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-700">导入数据</p>
                <p className="text-xs text-gray-400">从 JSON 文件恢复</p>
              </div>
            </button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />

            {importMsg && (
              <div className={`text-xs px-3 py-2 rounded-lg ${importMsg.includes('成功') ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                {importMsg}
              </div>
            )}

            <button onClick={() => setShowClear(true)} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-red-500">清空数据</p>
                <p className="text-xs text-gray-400">删除所有记录和自定义分类</p>
              </div>
            </button>
          </div>
        </Card>
      </div>

      {/* 关于 */}
      <div className="px-4 mt-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-cream-500" />
            <h2 className="font-bold text-gray-800">关于</h2>
          </div>
          <div className="space-y-1.5 text-sm text-gray-500">
            <p>应用名称：奶油记账本</p>
            <p>版本：1.0.0</p>
            <p>数据存储：本地浏览器</p>
          </div>
        </Card>
      </div>

      {/* 分类编辑弹窗 */}
      <Modal
        open={showCatEdit}
        onClose={() => setShowCatEdit(false)}
        title={editCatId ? '编辑分类' : '新增分类'}
        footer={
          <>
            <GradientButton variant="ghost" onClick={() => setShowCatEdit(false)}>取消</GradientButton>
            <GradientButton variant="primary" onClick={handleSaveCat} disabled={!catName.trim()}>保存</GradientButton>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-400 mb-2">名称</p>
            <input
              type="text"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="分类名称"
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-cream-300"
            />
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">图标</p>
            <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto">
              {emojiChoices.map((e) => (
                <button
                  key={e}
                  onClick={() => setCatEmoji(e)}
                  className={`aspect-square rounded-lg text-lg flex items-center justify-center transition ${catEmoji === e ? 'bg-cream-100 ring-2 ring-cream-400' : 'bg-gray-50 hover:bg-cream-50'}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-2">颜色</p>
            <div className="flex flex-wrap gap-2">
              {colorChoices.map((c) => (
                <button
                  key={c}
                  onClick={() => setCatColor(c)}
                  className={`w-8 h-8 rounded-full transition ${catColor === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* 清空确认 */}
      <Modal
        open={showClear}
        onClose={() => setShowClear(false)}
        title="确认清空"
        size="sm"
        footer={
          <>
            <GradientButton variant="ghost" onClick={() => setShowClear(false)}>取消</GradientButton>
            <GradientButton variant="red" onClick={() => { clearAll(); setShowClear(false); }}>确认清空</GradientButton>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-500">
            将删除所有交易记录、自定义分类和预算设置，恢复到初始状态。此操作不可撤销，确认继续？
          </p>
        </div>
      </Modal>
    </div>
  );
}
