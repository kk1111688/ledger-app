export const formatMoney = (v: number, withSymbol = true): string => {
  if (v === undefined || v === null) v = 0;
  const sign = v < 0 ? '-' : '';
  const abs = Math.abs(v);
  const parts = abs.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (withSymbol ? (v < 0 ? '-¥' : '¥') : sign) + parts.join('.');
};

export const formatShortMoney = (v: number): string => {
  if (v === undefined || v === null) v = 0;
  const abs = Math.abs(v);
  const sign = v < 0 ? '-' : '';
  if (abs >= 10000) return sign + '¥' + (abs / 10000).toFixed(1) + 'w';
  if (abs >= 1000) return sign + '¥' + (abs / 1000).toFixed(1) + 'k';
  return sign + '¥' + abs.toFixed(0);
};

export const todayStr = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const thisMonthStr = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

export const parseDate = (s: string): Date => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

export const monthLabel = (month: string): string => {
  const [y, m] = month.split('-');
  return `${y}年${Number(m)}月`;
};

export const dateLabel = (s: string): string => {
  const d = parseDate(s);
  const today = new Date();
  const td = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const cur = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const diff = Math.round((cur - td) / 86400000);
  const prefix =
    diff === 0 ? '今天' : diff === -1 ? '昨天' : diff === 1 ? '明天' : `${d.getMonth() + 1}月${d.getDate()}日`;
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${prefix} ${weekdays[d.getDay()]}`;
};

export const uid = (): string =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 9);

export const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
