'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CURRENCIES, formatCurrency } from '@/lib/currency';

const CURRENCY_SYMBOL: Record<'USD' | 'EUR', string> = Object.fromEntries(
  CURRENCIES.map((c) => [c.value, c.symbol])
) as Record<'USD' | 'EUR', string>;

interface IncomeChartProps {
  data: { month: string; USD: number; EUR: number }[];
  activeCurrencies: ('USD' | 'EUR')[];
}

const SERIES_COLOR: Record<'USD' | 'EUR', string> = {
  USD: '#7C3AED',
  EUR: '#0EA5E9',
};

// Recharts' <ResponsiveContainer> does not reliably size <BarChart> in this
// version (recharts/recharts#4586) — PieChart is unaffected (see DonutChart),
// so for this bar chart we measure the wrapper ourselves and pass explicit
// pixel dimensions to BarChart instead of relying on ResponsiveContainer.
function useContainerSize<T extends HTMLElement>() {
  const ref = React.useRef<T>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const updateSize = () => setSize({ width: el.clientWidth, height: el.clientHeight });
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

export default function IncomeChart({ data, activeCurrencies }: IncomeChartProps) {
  const { ref: containerRef, size } = useContainerSize<HTMLDivElement>();

  // Always show at least USD so the chart never renders with zero bars.
  const currencies: ('USD' | 'EUR')[] = activeCurrencies.length > 0 ? activeCurrencies : ['USD'];
  const showUSD = currencies.includes('USD');
  const showEUR = currencies.includes('EUR');
  // Only a single currency in play can label the shared axis with its symbol unambiguously.
  const axisSymbol = currencies.length === 1 ? CURRENCY_SYMBOL[currencies[0]] : '';
  const formatAxisTick = (value: number) => `${Math.round(value / 1000)}k${axisSymbol}`;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[380px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Statistiques de revenus</h3>
          <p className="text-xs text-slate-400 font-medium">Revenus mensuels facturés</p>
        </div>
        <div className="flex items-center gap-2">
          {showUSD && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-xs font-semibold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SERIES_COLOR.USD }} />
              <span>USD</span>
            </div>
          )}
          {showEUR && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-xs font-semibold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SERIES_COLOR.EUR }} />
              <span>EUR</span>
            </div>
          )}
        </div>
      </div>

      <div ref={containerRef} className="relative w-full h-[280px] mt-2">
        {size.width > 0 && size.height > 0 ? (
          <BarChart
            width={size.width}
            height={size.height}
            data={data}
            margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorIncomeUSD" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={SERIES_COLOR.USD} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={SERIES_COLOR.USD} stopOpacity={0.15}/>
              </linearGradient>
              <linearGradient id="colorIncomeEUR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={SERIES_COLOR.EUR} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={SERIES_COLOR.EUR} stopOpacity={0.15}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
              interval={0}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickFormatter={formatAxisTick}
              tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
            />
            <Tooltip
              cursor={{ fill: '#F8FAFC', radius: 8 }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-lg">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {payload[0].payload.month}
                      </p>
                      {payload.map((entry) => {
                        const cur = entry.dataKey as 'USD' | 'EUR';
                        return (
                          <p key={String(cur)} className="text-sm font-bold mt-1" style={{ color: SERIES_COLOR[cur] }}>
                            {formatCurrency(Number(entry.value) || 0, cur)}
                          </p>
                        );
                      })}
                    </div>
                  );
                }
                return null;
              }}
            />
            {showUSD && (
              <Bar dataKey="USD" fill="url(#colorIncomeUSD)" radius={[6, 6, 0, 0]} maxBarSize={40} />
            )}
            {showEUR && (
              <Bar dataKey="EUR" fill="url(#colorIncomeEUR)" radius={[6, 6, 0, 0]} maxBarSize={40} />
            )}
          </BarChart>
        ) : (
          <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
        )}
      </div>
    </div>
  );
}
