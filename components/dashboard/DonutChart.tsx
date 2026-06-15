'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutChartProps {
  data: { name: string; value: number; color: string }[];
}

export default function DonutChart({ data }: DonutChartProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[380px]">
      <div>
        <h3 className="text-base font-bold text-slate-900">Répartition des factures</h3>
        <p className="text-xs text-slate-400 font-medium">Pourcentage global par statut de facture</p>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-6 mt-4 min-h-0">
        {/* Chart Segment */}
        <div className="w-40 h-40 flex-shrink-0 relative">
          {isMounted ? (
            <>
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-lg text-xs font-semibold">
                              <span style={{ color: payload[0].payload.color }}>
                                {payload[0].name}: {payload[0].value}%
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={data}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Central Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800">100%</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Factures</span>
              </div>
            </>
          ) : (
            <div className="w-full h-full bg-slate-50 animate-pulse rounded-full" />
          )}
        </div>

        {/* Legend Segment */}
        <div className="flex-1 flex flex-col gap-3.5 w-full sm:w-auto">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-slate-600">{item.name}</span>
              </div>
              <span className="font-bold text-slate-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
