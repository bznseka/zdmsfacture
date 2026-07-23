'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/currency';

interface IncomeChartProps {
  data: { month: string; USD: number; EUR: number }[];
  activeCurrencies: ('USD' | 'EUR')[];
}

const SERIES_COLOR: Record<'USD' | 'EUR', string> = {
  USD: '#7C3AED',
  EUR: '#0EA5E9',
};

export default function IncomeChart({ data, activeCurrencies }: IncomeChartProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Always show at least USD so the chart never renders with zero bars.
  const currencies = activeCurrencies.length > 0 ? activeCurrencies : (['USD'] as const);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[380px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">Statistiques de revenus</h3>
          <p className="text-xs text-slate-400 font-medium">Revenus mensuels facturés</p>
        </div>
        <div className="flex items-center gap-2">
          {currencies.map((cur) => (
            <div key={cur} className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-xs font-semibold text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SERIES_COLOR[cur] }} />
              <span>{cur}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative w-full h-[280px] mt-2">
        {isMounted ? (
          <div className="absolute inset-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <defs>
                  {currencies.map((cur) => (
                    <linearGradient key={cur} id={`colorIncome${cur}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={SERIES_COLOR[cur]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={SERIES_COLOR[cur]} stopOpacity={0.15}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
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
                {currencies.map((cur) => (
                  <Bar
                    key={cur}
                    dataKey={cur}
                    fill={`url(#colorIncome${cur})`}
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="w-full h-full bg-slate-50 animate-pulse rounded-xl" />
        )}
      </div>
    </div>
  );
}
