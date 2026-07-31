import { useRef, useState, useMemo } from 'react';
import { formatShortMoney } from '@/utils/format';

interface Props {
  points: { date: string; income: number; expense: number }[];
  height?: number;
  onHover?: (idx: number | null) => void;
}

const LEFT_PAD = 48;
const RIGHT_PAD = 12;
const TOP_PAD = 12;
const BOTTOM_PAD = 28;
const POINT_STEP = 40;
const MIN_WIDTH = 320;

function shouldShowXLabel(date: string, idx: number, total: number): boolean {
  const d = date.split('-').map(Number);
  const y = d[0] ?? 0;
  const m = d[1] ?? 0;
  const day = d[2] ?? 0;

  const isMonthStart = day === 1;
  const isKeyDay = [7, 14, 21, 28].includes(day);

  if (isMonthStart || isKeyDay) return true;

  if (total <= 10) {
    const step = total <= 5 ? 1 : 2;
    return idx % step === 0;
  }

  const step = Math.ceil(total / 8);
  return idx % step === 0 || idx === total - 1;
}

export default function LineChart({ points, height = 200, onHover }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const innerW = Math.max(points.length * POINT_STEP, MIN_WIDTH - LEFT_PAD - RIGHT_PAD);
  const totalW = LEFT_PAD + innerW + RIGHT_PAD;
  const totalH = height;
  const innerH = totalH - TOP_PAD - BOTTOM_PAD;

  const maxVal = useMemo(() => {
    if (points.length === 0) return 100;
    let mx = 0;
    for (const p of points) {
      if (p.income > mx) mx = p.income;
      if (p.expense > mx) mx = p.expense;
    }
    return Math.max(mx * 1.2, 1);
  }, [points]);

  const scales = useMemo(() => {
    return [0, 0.25, 0.5, 0.75, 1].map((t) => maxVal * t);
  }, [maxVal]);

  const xOf = (idx: number) => LEFT_PAD + (idx + 0.5) * (innerW / Math.max(points.length, 1));
  const yOf = (v: number) => TOP_PAD + innerH - (v / maxVal) * innerH;

  const buildPath = (key: 'income' | 'expense') => {
    if (points.length === 0) return '';
    let d = '';
    for (let i = 0; i < points.length; i++) {
      const x = xOf(i);
      const y = yOf(points[i][key]);
      d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2) + ' ';
    }
    return d.trim();
  };

  const buildArea = (key: 'income' | 'expense') => {
    if (points.length === 0) return '';
    const baseY = yOf(0);
    let d = 'M' + xOf(0).toFixed(2) + ',' + baseY.toFixed(2) + ' ';
    for (let i = 0; i < points.length; i++) {
      const x = xOf(i);
      const y = yOf(points[i][key]);
      d += 'L' + x.toFixed(2) + ',' + y.toFixed(2) + ' ';
    }
    d += 'L' + xOf(points.length - 1).toFixed(2) + ',' + baseY.toFixed(2) + ' Z';
    return d;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || points.length === 0) return;
    const rect = svgRef.current.getBoundingClientRect();
    const ratio = totalW / rect.width;
    const svgX = (e.clientX - rect.left) * ratio;

    const relX = svgX - LEFT_PAD;
    if (relX < 0 || relX > innerW) {
      setHoverIdx(null);
      onHover?.(null);
      return;
    }
    const step = innerW / points.length;
    const idx = Math.min(Math.max(Math.floor(relX / step), 0), points.length - 1);
    setHoverIdx(idx);
    onHover?.(idx);
  };

  const handleMouseLeave = () => {
    setHoverIdx(null);
    onHover?.(null);
  };

  const gradIdIncome = `incGrad-${Math.random().toString(36).slice(2, 8)}`;
  const gradIdExpense = `expGrad-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${totalW} ${totalH}`}
        className="w-full h-auto select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id={gradIdIncome} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={gradIdExpense} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </linearGradient>
        </defs>

        {scales.map((v, i) => {
          const y = yOf(v);
          return (
            <g key={`grid-${i}`}>
              <line
                x1={LEFT_PAD}
                y1={y}
                x2={LEFT_PAD + innerW}
                y2={y}
                stroke="#F9EBD3"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <text
                x={LEFT_PAD - 6}
                y={y + 3}
                textAnchor="end"
                fontSize={8}
                fill="#9CA3AF"
                fontFamily="ui-monospace, monospace"
              >
                {formatShortMoney(v)}
              </text>
            </g>
          );
        })}

        {points.length > 0 && (
          <>
            <path d={buildArea('income')} fill={`url(#${gradIdIncome})`} />
            <path d={buildArea('expense')} fill={`url(#${gradIdExpense})`} />

            <path
              d={buildPath('income')}
              fill="none"
              stroke="#10B981"
              strokeWidth={1.8}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <path
              d={buildPath('expense')}
              fill="none"
              stroke="#EF4444"
              strokeWidth={1.8}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </>
        )}

        {hoverIdx !== null && points[hoverIdx] && (
          <line
            x1={xOf(hoverIdx)}
            y1={TOP_PAD}
            x2={xOf(hoverIdx)}
            y2={TOP_PAD + innerH}
            stroke="#D1D5DB"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}

        {points.map((p, i) => {
          const x = xOf(i);
          const showLabel = shouldShowXLabel(p.date, i, points.length);
          return (
            <g key={`pt-${i}`}>
              <circle cx={x} cy={yOf(p.income)} r={hoverIdx === i ? 5 : 3} fill="#10B981" />
              <circle cx={x} cy={yOf(p.expense)} r={hoverIdx === i ? 5 : 3} fill="#EF4444" />
              {showLabel && (
                <text
                  x={x}
                  y={TOP_PAD + innerH + 16}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#9CA3AF"
                >
                  {p.date.slice(5)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
