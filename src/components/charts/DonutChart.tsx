import { ReactNode } from 'react';

export interface Segment {
  name: string;
  emoji?: string;
  color: string;
  value: number;
  percent: number;
}

interface Props {
  segments: Segment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
  onSelect?: (idx: number | null) => void;
  selectedIdx?: number | null;
}

function polar(cx: number, cy: number, r: number, angle: number): [number, number] {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const [sx, sy] = polar(cx, cy, r, startAngle);
  const [ex, ey] = polar(cx, cy, r, endAngle);
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${sx.toFixed(3)} ${sy.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${ex.toFixed(3)} ${ey.toFixed(3)}`;
}

export default function DonutChart({
  segments,
  size = 200,
  thickness = 24,
  centerLabel,
  centerValue,
  onSelect,
  selectedIdx,
}: Props): ReactNode {
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const empty = segments.length === 0 || segments.every((s) => s.percent <= 0);

  let cumulative = -Math.PI / 2;

  const handleClick = (idx: number | null) => {
    onSelect?.(idx);
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-full h-auto select-none"
      style={{ maxWidth: size, maxHeight: size }}
    >
      {empty ? (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={outerR - thickness / 2}
            fill="none"
            stroke="#E5E7EB"
            strokeWidth={thickness}
          />
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill="#9CA3AF"
          >
            暂无数据
          </text>
        </>
      ) : (
        <>
          {segments.map((seg, idx) => {
            const startAngle = cumulative;
            const sweep = (seg.percent / 100) * 2 * Math.PI;
            const endAngle = startAngle + sweep;
            cumulative = endAngle;

            const midAngle = (startAngle + endAngle) / 2;
            const isSelected = selectedIdx === idx;
            const othersDim = selectedIdx !== null && !isSelected;

            const offsetR = isSelected ? 4 : 0;
            const [ox, oy] = offsetR > 0 ? polar(0, 0, offsetR, midAngle) : [0, 0];

            const d = arcPath(cx, cy, outerR - thickness / 2, startAngle, endAngle - 0.0001);

            return (
              <path
                key={`seg-${idx}`}
                d={d}
                fill="none"
                stroke={seg.color}
                strokeWidth={thickness}
                strokeLinecap="butt"
                transform={`translate(${ox.toFixed(3)} ${oy.toFixed(3)})`}
                opacity={othersDim ? 0.5 : 1}
                style={{ cursor: onSelect ? 'pointer' : 'default', transition: 'all 0.2s ease' }}
                onClick={() => handleClick(isSelected ? null : idx)}
              />
            );
          })}

          <g>
            {centerValue !== undefined && (
              <text
                x={cx}
                y={cy - (centerLabel ? 6 : 0)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={22}
                fontWeight="700"
                fontFamily="ui-monospace, monospace"
                fill="#B45309"
              >
                {centerValue}
              </text>
            )}
            {centerLabel && (
              <text
                x={cx}
                y={cy + (centerValue !== undefined ? 14 : 0)}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fill="#6B7280"
              >
                {centerLabel}
              </text>
            )}
          </g>
        </>
      )}
    </svg>
  );
}
