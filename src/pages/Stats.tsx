import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/common/Card';
import LineChart from '../components/charts/LineChart';
import DonutChart, { type Segment } from '../components/charts/DonutChart';
import { TrendingUp, TrendingDown, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { buildDailyPoints, buildCategoryPie, sumInMonth } from '../utils/stats';
import { formatMoney, formatShortMoney, monthLabel, thisMonthStr } from '../utils/format';

type Scope = 'week' | 'month' | 'year';

export default function Stats() {
  const transactions = useStore((s) => s.transactions);
  const categories = useStore((s) => s.categories);

  const [scope, setScope] = useState<Scope>('month');
  const [month, setMonth] = useState(thisMonthStr());
  const [pieType, setPieType] = useState<'expense' | 'income'>('expense');
  const [selectedSeg, setSelectedSeg] = useState<number | null>(null);

  const dailyPoints = useMemo(
    () => buildDailyPoints(transactions, scope, month),
    [transactions, scope, month]
  );

  const pieData = useMemo(
    () => buildCategoryPie(transactions, categories, pieType, month),
    [transactions, categories, pieType, month]
  );

  const monthIncome = useMemo(() => sumInMonth(transactions, 'income', month), [transactions, month]);
  const monthExpense = useMemo(() => sumInMonth(transactions, 'expense', month), [transactions, month]);
  const balance = monthIncome - monthExpense;

  const segments: Segment[] = pieData.map((d) => ({
    name: d.name,
    emoji: d.emoji,
    color: d.color,
    value: d.amount,
    percent: d.percent * 100,
  }));

  const totalPie = pieData.reduce((s, d) => s + d.amount, 0);

  const shiftMonth = (delta: number) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const scopes: { id: Scope; label: string }[] = [
    { id: 'week', label: '周' },
    { id: 'month', label: '月' },
    { id: 'year', label: '年' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pb-28">
      {/* 顶部 */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-cream-100">
        <div className="px-4 pt-14 pb-4">
          <h1 className="text-xl font-bold text-gray-800 mb-4">统计</h1>

          {/* 月份切换 */}
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => shiftMonth(-1)} className="w-9 h-9 rounded-full hover:bg-cream-50 flex items-center justify-center transition">
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
            <span className="font-semibold text-gray-700">{monthLabel(month)}</span>
            <button onClick={() => shiftMonth(1)} className="w-9 h-9 rounded-full hover:bg-cream-50 flex items-center justify-center transition">
              <ChevronRight className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* 维度切换 */}
          <div className="bg-cream-50 rounded-2xl p-1 flex">
            {scopes.map((s) => (
              <button
                key={s.id}
                onClick={() => setScope(s.id)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                  scope === s.id ? 'bg-white text-cream-600 shadow-sm font-bold' : 'text-gray-500'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 收支概览 */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-3 text-center">
            <TrendingDown className="w-4 h-4 text-red-500 mx-auto mb-1" />
            <p className="text-xs text-gray-400">支出</p>
            <p className="font-mono font-bold text-red-500 text-sm mt-0.5">{formatShortMoney(monthExpense)}</p>
          </Card>
          <Card className="p-3 text-center">
            <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
            <p className="text-xs text-gray-400">收入</p>
            <p className="font-mono font-bold text-emerald-500 text-sm mt-0.5">{formatShortMoney(monthIncome)}</p>
          </Card>
          <Card className="p-3 text-center">
            <Award className="w-4 h-4 text-cream-500 mx-auto mb-1" />
            <p className="text-xs text-gray-400">结余</p>
            <p className={`font-mono font-bold text-sm mt-0.5 ${balance >= 0 ? 'text-cream-600' : 'text-red-500'}`}>
              {formatShortMoney(balance)}
            </p>
          </Card>
        </div>
      </div>

      {/* 趋势图 */}
      <div className="px-4 mt-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">收支趋势</h2>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />支出</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />收入</span>
            </div>
          </div>
          <LineChart points={dailyPoints} height={200} />
        </Card>
      </div>

      {/* 分类饼图 */}
      <div className="px-4 mt-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-800">分类占比</h2>
            <div className="bg-cream-50 rounded-xl p-0.5 flex">
              <button
                onClick={() => { setPieType('expense'); setSelectedSeg(null); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${pieType === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400'}`}
              >
                支出
              </button>
              <button
                onClick={() => { setPieType('income'); setSelectedSeg(null); }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${pieType === 'income' ? 'bg-white text-emerald-500 shadow-sm' : 'text-gray-400'}`}
              >
                收入
              </button>
            </div>
          </div>

          {segments.length === 0 ? (
            <div className="py-10 text-center text-gray-400 text-sm">本月暂无{pieType === 'expense' ? '支出' : '收入'}数据</div>
          ) : (
            <div className="flex items-center gap-4">
              <DonutChart
                segments={segments}
                size={160}
                thickness={22}
                centerLabel={pieType === 'expense' ? '总支出' : '总收入'}
                centerValue={formatShortMoney(totalPie)}
                selectedIdx={selectedSeg}
                onSelect={setSelectedSeg}
              />
              <div className="flex-1 space-y-2 max-h-[180px] overflow-y-auto">
                {pieData.slice(0, 6).map((d, i) => (
                  <button
                    key={d.categoryId}
                    onClick={() => setSelectedSeg(selectedSeg === i ? null : i)}
                    className={`w-full flex items-center gap-2 p-1.5 rounded-lg transition ${selectedSeg === i ? 'bg-cream-50' : ''}`}
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                    <span className="text-sm text-gray-600 flex-1 text-left">{d.emoji} {d.name}</span>
                    <span className="font-mono text-xs text-gray-500">{(d.percent * 100).toFixed(0)}%</span>
                    <span className="font-mono text-sm font-semibold text-gray-700">{formatMoney(d.amount, false)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Top 5 排名 */}
      {pieData.length > 0 && (
        <div className="px-4 mt-4">
          <Card className="p-4">
            <h2 className="font-bold text-gray-800 mb-3">{pieType === 'expense' ? '支出' : '收入'}排行 Top 5</h2>
            <div className="space-y-2">
              {pieData.slice(0, 5).map((d, i) => (
                <div key={d.categoryId} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-600' :
                    i === 1 ? 'bg-gray-100 text-gray-500' :
                    i === 2 ? 'bg-orange-100 text-orange-500' :
                    'bg-cream-50 text-cream-400'
                  }`}>{i + 1}</span>
                  <span className="text-lg">{d.emoji}</span>
                  <span className="flex-1 text-sm text-gray-600">{d.name}</span>
                  <span className="font-mono text-sm font-semibold text-gray-800">¥{d.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
