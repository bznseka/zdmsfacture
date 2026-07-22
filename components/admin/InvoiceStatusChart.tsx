'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Invoice, InvoiceStatus } from '@/types';

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  paid: '#22C55E',
  sent: '#F59E0B',
  overdue: '#EF4444',
  draft: '#9CA3AF',
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  paid: 'Payées',
  sent: 'Envoyées',
  overdue: 'En retard',
  draft: 'Brouillons',
};

interface InvoiceStatusChartProps {
  invoices: Invoice[];
}

export default function InvoiceStatusChart({ invoices }: InvoiceStatusChartProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const counts: Record<InvoiceStatus, number> = { draft: 0, sent: 0, paid: 0, overdue: 0 };
  invoices.forEach((inv) => {
    counts[inv.status] += 1;
  });

  const data = (Object.keys(counts) as InvoiceStatus[])
    .filter((status) => counts[status] > 0)
    .map((status) => ({
      status,
      name: STATUS_LABELS[status],
      value: counts[status],
      color: STATUS_COLORS[status],
    }));

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-4">Répartition des factures</h3>

      {invoices.length === 0 ? (
        <p className="text-xs text-slate-400">Aucune facture.</p>
      ) : (
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 flex-shrink-0 relative">
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
                      <Pie data={data} cx="50%" cy="50%" innerRadius={36} outerRadius={50} paddingAngle={4} dataKey="value">
                        {data.map((entry) => (
                          <Cell key={entry.status} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-black text-slate-800">{invoices.length}</span>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-slate-50 animate-pulse rounded-full" />
            )}
          </div>

          <div className="flex-1 flex flex-col gap-2.5">
            {data.map((item) => (
              <div key={item.status} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
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
