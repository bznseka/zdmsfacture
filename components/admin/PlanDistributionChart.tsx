'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const PLAN_COLORS: Record<string, string> = {
  'plan-starter': '#7C3AED',
  'plan-pro': '#14B8A6',
  'plan-business': '#F59E0B',
};

const PLAN_LABELS: Record<string, string> = {
  'plan-starter': 'Starter',
  'plan-pro': 'Pro',
  'plan-business': 'Business',
};

interface PlanDistributionChartProps {
  planCounts: Record<string, number>;
}

export default function PlanDistributionChart({ planCounts }: PlanDistributionChartProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const entries = Object.entries(planCounts);
  const total = entries.reduce((sum, [, count]) => sum + count, 0);
  const data = entries.map(([planId, count]) => ({
    planId,
    name: PLAN_LABELS[planId] || planId,
    value: count,
    color: PLAN_COLORS[planId] || '#9CA3AF',
  }));

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[340px]">
      <div className="mb-2">
        <h3 className="text-base font-bold text-slate-900">Abonnements actifs</h3>
        <p className="text-xs text-slate-400 font-medium">Répartition par forfait</p>
      </div>

      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center text-sm text-slate-400">
          Aucun abonnement actif pour le moment.
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center gap-6 min-h-0">
          <div className="w-36 h-36 flex-shrink-0 relative">
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
                                  {payload[0].name}: {payload[0].value}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Pie data={data} cx="50%" cy="50%" innerRadius={48} outerRadius={65} paddingAngle={4} dataKey="value">
                        {data.map((entry) => (
                          <Cell key={entry.planId} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-800">{total}</span>
                  <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">Actifs</span>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-full" />
            )}
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {data.map((item) => (
              <div key={item.planId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-slate-600">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
